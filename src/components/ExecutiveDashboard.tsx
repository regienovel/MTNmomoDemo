// src/components/ExecutiveDashboard.tsx

import React, { useMemo, useState } from "react";
import { EVENTS } from "../data/events";
import {
  AGENT_FORECASTS,
  LIQUIDITY_SCENARIOS
} from "../data/agentLiquidity";
import { LOAN_APPLICATIONS } from "../data/loanScoring";
import type { LiquidityRiskBand } from "../types";

/* ---------- small helpers ---------- */

type Accent = "yellow" | "green" | "red" | "blue";
type TimeRange = "TODAY" | "7D" | "30D";

const accentClasses: Record<Accent, string> = {
  yellow: "border-amber-300/70 bg-amber-400/10 text-amber-200",
  green: "border-emerald-300/70 bg-emerald-400/10 text-emerald-200",
  red: "border-red-400/70 bg-red-500/10 text-red-200",
  blue: "border-sky-400/70 bg-sky-500/10 text-sky-200"
};

const timeRangeLabel: Record<TimeRange, string> = {
  TODAY: "Today",
  "7D": "Last 7 days",
  "30D": "Last 30 days"
};

function formatCurrency(ghs: number): string {
  return `GHS ${ghs.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function formatPercent(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

function daysForRange(range: TimeRange): number {
  if (range === "TODAY") return 1;
  if (range === "7D") return 7;
  return 30;
}

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accent?: Accent;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sublabel,
  accent = "blue"
}) => (
  <div
    className={`rounded-2xl border px-3 py-2.5 flex flex-col gap-0.5 ${accentClasses[accent]}`}
  >
    <p className="text-[10px] uppercase tracking-wide text-slate-300/80">
      {label}
    </p>
    <p className="text-lg font-semibold text-slate-50">{value}</p>
    {sublabel && (
      <p className="text-[10px] text-slate-300/90">{sublabel}</p>
    )}
  </div>
);

interface SparklineProps {
  values: number[];
  colorClass: string; // e.g. "stroke-emerald-400 fill-emerald-400/10"
}

const Sparkline: React.FC<SparklineProps> = ({ values, colorClass }) => {
  if (!values.length) return null;

  const max = Math.max(...values) || 1;
  const points = values
    .map((v, idx) => {
      const x =
        values.length === 1 ? 50 : (idx / (values.length - 1)) * 100;
      const y = 90 - (v / max) * 70; // 20–90 band
      return `${x},${y}`;
    })
    .join(" ");

  const [strokeClass, fillClass] = colorClass.split(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-16"
      preserveAspectRatio="none"
    >
      <polyline
        className={strokeClass}
        fill="none"
        strokeWidth={1.4}
        points={points}
      />
      <polygon
        className={fillClass}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
};

/* ---------- Fairness computation from loan applications ---------- */

type LoanApp = (typeof LOAN_APPLICATIONS)[number];

interface FairnessRow {
  subgroupValue: string; // e.g. "Female"
  applications: number;
  approvalRate: number; // 0–1
  badRate30d: number; // approx from expected PD on approved loans
  falsePositiveRate: number; // good but declined
  falseNegativeRate: number; // bad but approved
  approvalGapVsOverallPp: number; // diff vs overall (0–1 scale)
  fprGapVsOverallPp: number; // diff vs overall
  driftFlag: boolean;
}

function computeGenderFairness(apps: LoanApp[]): FairnessRow[] {
  if (!apps.length) return [];

  const thresholdPd = 0.08; // 8% – synthetic cut-off between "good" and "bad"

  const totalApps = apps.length;
  const approvedApps = apps.filter(
    a => a.decisionOutcome !== "Auto-Decline"
  );
  const overallApprovalRate = totalApps
    ? approvedApps.length / totalApps
    : 0;

  const goodApps = apps.filter(a => a.expectedPd30d < thresholdPd);
  const goodDeclined = goodApps.filter(
    a => a.decisionOutcome === "Auto-Decline"
  );
  const overallFpr = goodApps.length
    ? goodDeclined.length / goodApps.length
    : 0;

  // group by gender
  const byGender = new Map<string, LoanApp[]>();
  for (const app of apps) {
    const key = app.gender || "Unknown";
    if (!byGender.has(key)) byGender.set(key, []);
    byGender.get(key)!.push(app);
  }

  const rows: FairnessRow[] = [];
  for (const [gender, groupApps] of byGender.entries()) {
    const groupTotal = groupApps.length;
    const groupApproved = groupApps.filter(
      a => a.decisionOutcome !== "Auto-Decline"
    );
    const approvalRate = groupTotal ? groupApproved.length / groupTotal : 0;

    const groupBadRate30d = groupApproved.length
      ? groupApproved.reduce((sum, a) => sum + a.expectedPd30d, 0) /
        groupApproved.length
      : 0;

    const groupGood = groupApps.filter(a => a.expectedPd30d < thresholdPd);
    const groupGoodDeclined = groupGood.filter(
      a => a.decisionOutcome === "Auto-Decline"
    );
    const fpr = groupGood.length
      ? groupGoodDeclined.length / groupGood.length
      : 0;

    const groupBad = groupApps.filter(a => a.expectedPd30d >= thresholdPd);
    const groupBadApproved = groupBad.filter(
      a => a.decisionOutcome !== "Auto-Decline"
    );
    const fnr = groupBad.length
      ? groupBadApproved.length / groupBad.length
      : 0;

    const approvalGap = approvalRate - overallApprovalRate;
    const fprGap = fpr - overallFpr;
    const driftFlag =
      Math.abs(approvalGap) > 0.05 || Math.abs(fprGap) > 0.05;

    rows.push({
      subgroupValue: gender,
      applications: groupTotal,
      approvalRate,
      badRate30d: groupBadRate30d,
      falsePositiveRate: fpr,
      falseNegativeRate: fnr,
      approvalGapVsOverallPp: approvalGap,
      fprGapVsOverallPp: fprGap,
      driftFlag
    });
  }

  return rows;
}

/* ---------- main component ---------- */

export const ExecutiveDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("TODAY");

  const days = daysForRange(timeRange);
  const msPerDay = 24 * 60 * 60 * 1000;

  /* --- Fraud: filter EVENTS by time range --- */

  const latestEventTime = useMemo(() => {
    if (!EVENTS.length) return 0;
    return Math.max(
      ...EVENTS.map(e => new Date(e.timestamp).getTime())
    );
  }, []);

  const eventsInRange = useMemo(() => {
    if (!EVENTS.length) return [];
    return EVENTS.filter(e => {
      const t = new Date(e.timestamp).getTime();
      const diffDays = (latestEventTime - t) / msPerDay;
      return diffDays >= 0 && diffDays < days;
    });
  }, [days, latestEventTime]);

  const fraudAlertsTotal = eventsInRange.length;
  const highRiskFraud = eventsInRange.filter(e => e.riskScore >= 80).length;

  const fraudByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of eventsInRange) {
      counts[e.riskCategory] = (counts[e.riskCategory] ?? 0) + 1;
    }
    return counts;
  }, [eventsInRange]);

  const fraudTrendValues = useMemo(() => {
    if (!eventsInRange.length) return [];

    const perDay = new Map<string, number>();
    for (const e of eventsInRange) {
      const day = e.timestamp.split("T")[0];
      perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }

    const sorted = Array.from(perDay.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([, v]) => v);

    // For "Today" we just show the latest day as a single point.
    if (timeRange === "TODAY") {
      return sorted.length ? [sorted[sorted.length - 1]] : [];
    }

    return sorted;
  }, [eventsInRange, timeRange]);

  /* --- Liquidity: filter AGENT_FORECASTS by forecastDate --- */

  const latestForecastTime = useMemo(() => {
    if (!AGENT_FORECASTS.length) return 0;
    return Math.max(
      ...AGENT_FORECASTS.map(a =>
        new Date(a.forecastDate).getTime()
      )
    );
  }, []);

  const agentsInRange = useMemo(() => {
    if (!AGENT_FORECASTS.length) return [];
    return AGENT_FORECASTS.filter(a => {
      const t = new Date(a.forecastDate).getTime();
      const diffDays = (latestForecastTime - t) / msPerDay;
      return diffDays >= 0 && diffDays < days;
    });
  }, [days, latestForecastTime]);

  const totalShortfall = useMemo(
    () =>
      agentsInRange.reduce(
        (sum, a) => sum + (a.floatShortfallGhs > 0 ? a.floatShortfallGhs : 0),
        0
      ),
    [agentsInRange]
  );

  const agentsByBand: Record<LiquidityRiskBand, number> = useMemo(() => {
    const base: Record<LiquidityRiskBand, number> = {
      Green: 0,
      Amber: 0,
      Red: 0
    };
    for (const a of agentsInRange) {
      base[a.riskBand] += 1;
    }
    return base;
  }, [agentsInRange]);

  const shortfallByScenario = useMemo(
    () =>
      LIQUIDITY_SCENARIOS.map(s => ({
        id: s.id,
        label: s.label,
        shortfall: agentsInRange
          .filter(a => a.scenarioId === s.id)
          .reduce(
            (sum, a) =>
              sum + (a.floatShortfallGhs > 0 ? a.floatShortfallGhs : 0),
            0
          )
      })),
    [agentsInRange]
  );

  const shortfallTrendValues = shortfallByScenario.map(s => s.shortfall);

  /* --- Loans: filter LOAN_APPLICATIONS by applicationTime --- */

  const latestAppTime = useMemo(() => {
    if (!LOAN_APPLICATIONS.length) return 0;
    return Math.max(
      ...LOAN_APPLICATIONS.map(a =>
        new Date(a.applicationTime).getTime()
      )
    );
  }, []);

  const appsInRange: LoanApp[] = useMemo(() => {
    if (!LOAN_APPLICATIONS.length) return [];
    return LOAN_APPLICATIONS.filter(a => {
      const t = new Date(a.applicationTime).getTime();
      const diffDays = (latestAppTime - t) / msPerDay;
      return diffDays >= 0 && diffDays < days;
    });
  }, [days, latestAppTime]);

  const totalApps = appsInRange.length;

  const approvedCount = appsInRange.filter(
    a => a.decisionOutcome !== "Auto-Decline"
  ).length;

  const autoApproved = appsInRange.filter(
    a => a.decisionOutcome === "Auto-Approve"
  ).length;

  const humanReview = appsInRange.filter(
    a => a.decisionOutcome === "Human Review"
  ).length;

  const approvalRate = totalApps ? approvedCount / totalApps : 0;

  const timeToCashValues = appsInRange
    .filter(
      a => a.decisionOutcome === "Auto-Approve" && a.timeToCashSeconds != null
    )
    .map(a => a.timeToCashSeconds as number);

  const genderFairnessRows = useMemo(
    () => computeGenderFairness(appsInRange),
    [appsInRange]
  );

  const fairnessSnapshotDate = useMemo(() => {
    if (!appsInRange.length) return undefined;
    const maxTime = Math.max(
      ...appsInRange.map(a =>
        new Date(a.applicationTime).getTime()
      )
    );
    return new Date(maxTime).toISOString().split("T")[0];
  }, [appsInRange]);

  return (
    <div className="w-[90%] mx-auto bg-mtnDark/90 border border-momoBlue/70 rounded-2xl p-4 flex flex-col gap-4">
      {/* Top strip: headline + KPIs + time range toggle */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">
            MTN Ghana – Board-Level Risk & Growth Snapshot
          </p>
          <p className="text-[10px] text-slate-400 max-w-3xl">
            One view across fraud, agent liquidity and MoMo micro-lending.
            Time range applies to all metrics and visuals – so you can flip
            between today, the last week and the last month without leaving
            this card.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-[10px] text-slate-300">
            <span className="text-slate-500">Time range:</span>
            {(["TODAY", "7D", "30D"] as TimeRange[]).map(range => {
              const active = range === timeRange;
              const label =
                range === "TODAY"
                  ? "Today"
                  : range === "7D"
                  ? "7 days"
                  : "30 days";
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-0.5 rounded-full border text-[10px] transition ${
                    active
                      ? "bg-mtnSunshine text-slate-950 border-mtnSunshine"
                      : "bg-mtnDark/80 text-slate-100 border-momoBlue/60 hover:bg-momoBlue/60"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-300 text-right">
            <p className="text-slate-500">
              Fraud alerts, float at risk, loans and fairness stats all
              reflect the selected window.
            </p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label={`Fraud alerts (${timeRangeLabel[timeRange]})`}
          value={fraudAlertsTotal.toString()}
          sublabel={`${highRiskFraud} high-risk (score ≥ 80)`}
          accent="red"
        />
        <KpiCard
          label={`Float at risk in agents (${timeRangeLabel[timeRange]})`}
          value={formatCurrency(totalShortfall)}
          sublabel={`Agents at risk: Red ${agentsByBand.Red}, Amber ${agentsByBand.Amber}`}
          accent="yellow"
        />
        <KpiCard
          label={`MoMo loan applications (${timeRangeLabel[timeRange]})`}
          value={totalApps.toString()}
          sublabel={`Approved or under review: ${formatPercent(approvalRate)}`}
          accent="green"
        />
        <KpiCard
          label="Auto-approve speed"
          value={
            timeToCashValues.length
              ? `${Math.round(
                  timeToCashValues.reduce((a, b) => a + b, 0) /
                    timeToCashValues.length
                )}s`
              : "—"
          }
          sublabel="Median time from decision to cash in wallet"
          accent="blue"
        />
      </div>

      {/* Middle row – left: Fraud & Liquidity trends, right: Loans & fairness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fraud + Liquidity */}
        <section className="bg-mtnDark/90 rounded-xl border border-momoBlue/60 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-100">
                Fraud & agent liquidity – trending view
              </p>
              <p className="text-[10px] text-slate-400">
                Left: fraud alerts per day in{" "}
                {timeRangeLabel[timeRange].toLowerCase()} · Right:
                agent float shortfall by scenario in the same window.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-300 mb-1">
                Fraud alerts per day ({timeRangeLabel[timeRange]})
              </p>
              <Sparkline
                values={fraudTrendValues}
                colorClass="stroke-red-400 fill-red-500/10"
              />
              <div className="mt-1 text-[10px] text-slate-400">
                Mix in range:&nbsp;
                {Object.entries(fraudByCategory).map(([cat, count], idx) => (
                  <span key={cat}>
                    {idx > 0 && " · "}
                    <span className="font-medium text-slate-200">{count}</span>{" "}
                    {cat.replace(/_/g, " ").toLowerCase()}
                  </span>
                ))}
                {Object.keys(fraudByCategory).length === 0 && (
                  <span className="text-slate-500">no alerts in view</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-300 mb-1">
                Float shortfall by scenario ({timeRangeLabel[timeRange]})
              </p>
              <Sparkline
                values={shortfallTrendValues}
                colorClass="stroke-amber-300 fill-amber-400/10"
              />
              <div className="mt-1 grid grid-cols-1 gap-0.5 text-[10px] text-slate-400">
                {shortfallByScenario.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span>{s.label}</span>
                    <span className="text-amber-200">
                      {formatCurrency(s.shortfall)}
                    </span>
                  </div>
                ))}
                {shortfallByScenario.every(s => s.shortfall === 0) && (
                  <span className="text-slate-500">
                    no float risk in this window (demo data)
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-500 mt-1">
            In a live deployment this card would pull from the same streaming
            risk engine powering the fraud radar and liquidity map. The time
            range lets the Board switch from today to last week or last month
            to check whether trends are stabilising or drifting.
          </p>
        </section>

        {/* Loans + Fairness */}
        <section className="bg-mtnDark/90 rounded-xl border border-momoBlue/60 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-100">
                MoMo micro-loans – volume, decisions & fairness
              </p>
              <p className="text-[10px] text-slate-400">
                Loan decisions and fairness metrics over{" "}
                {timeRangeLabel[timeRange].toLowerCase()}. Auto-approve,
                human review and decline mix feed directly into the fairness
                view.
              </p>
            </div>
            <div className="text-[9px] text-slate-400 text-right">
              <p>
                Auto-approve:{" "}
                <span className="text-emerald-300 font-medium">
                  {autoApproved}
                </span>
              </p>
              <p>
                Human review:{" "}
                <span className="text-amber-300 font-medium">
                  {humanReview}
                </span>
              </p>
            </div>
          </div>

          {/* simple stacked bar for decision mix */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex text-[9px]">
            {totalApps > 0 && (
              <>
                <div
                  className="h-full bg-emerald-400/80"
                  style={{
                    width: `${(autoApproved / totalApps) * 100}%`
                  }}
                />
                <div
                  className="h-full bg-amber-400/80"
                  style={{
                    width: `${(humanReview / totalApps) * 100}%`
                  }}
                />
                <div
                  className="h-full bg-red-500/80"
                  style={{
                    width: `${((totalApps - approvedCount) / totalApps) * 100}%`
                  }}
                />
              </>
            )}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400">
            <span className="text-emerald-300">■ Auto-Approve</span>
            <span className="text-amber-300">■ Human Review</span>
            <span className="text-red-400">■ Auto-Decline</span>
          </div>

          {/* Fairness snapshot (from appsInRange) */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold text-slate-200">
                Fairness snapshot – Gender (
                {fairnessSnapshotDate ?? "no data in range"})
              </p>
              <p className="text-[9px] text-slate-400">
                Guardrail: no subgroup &gt; ±5pp approval / FPR gap
              </p>
            </div>

            {genderFairnessRows.length === 0 ? (
              <p className="text-[9px] text-slate-500">
                No loan applications in this window. Expand the time range to
                see fairness metrics.
              </p>
            ) : (
              <div className="space-y-1.5 text-[10px]">
                {genderFairnessRows.map(row => (
                  <div
                    key={row.subgroupValue}
                    className="rounded-lg border border-momoBlue/50/70 bg-slate-900/70 px-2 py-1.5"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-100">
                        {row.subgroupValue}
                      </span>
                      <span
                        className={
                          row.driftFlag
                            ? "text-red-300 font-medium"
                            : "text-emerald-300"
                        }
                      >
                        {row.driftFlag ? "Review" : "Within guardrails"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div>
                        <p className="text-[9px] text-slate-400">
                          Approval rate
                        </p>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.driftFlag
                                ? "bg-red-400"
                                : "bg-emerald-400"
                            }`}
                            style={{
                              width: `${row.approvalRate * 100}%`
                            }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-200 mt-0.5">
                          {formatPercent(row.approvalRate)}{" "}
                          <span className="text-slate-400">
                            (
                            {row.approvalGapVsOverallPp >= 0 ? "+" : ""}
                            {formatPercent(row.approvalGapVsOverallPp)})
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-400">
                          30-day bad rate (exp.)
                        </p>
                        <p className="text-[9px] text-slate-200 mt-0.5">
                          {formatPercent(row.badRate30d)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-400">
                          False-positive rate
                        </p>
                        <p className="text-[9px] text-slate-200 mt-0.5">
                          {formatPercent(row.falsePositiveRate)}{" "}
                          <span className="text-slate-400">
                            ({row.fprGapVsOverallPp >= 0 ? "+" : ""}
                            {formatPercent(row.fprGapVsOverallPp)})
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[9px] text-slate-500 mt-1">
              In production this card would recompute fairness every day using
              live decisions and realised performance. The Board can see at a
              glance whether women vs men are within the ±5 percentage point
              guardrail on approvals and false-positives for the selected
              window.
            </p>
          </div>
        </section>
      </div>

      {/* Footer note */}
      <p className="text-[9px] text-slate-500">
        This executive dashboard is designed as a one-stop view for the Board
        and ExCo: how many fraud threats we&apos;re catching, where agent cash
        constraints are emerging, how MoMo loans are performing, and whether we
        remain within MTN Ghana&apos;s fairness and BoG guardrails – all
        through the lens of the selected time range.
      </p>
    </div>
  );
};
