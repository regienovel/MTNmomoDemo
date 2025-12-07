// src/components/LoanApprover.tsx

import React, { useMemo, useState } from "react";
import type {
  FairnessSubgroupType,
  LoanApplication,
  LoanDecisionBand
} from "../types";
import {
  LOAN_APPLICATIONS,
  LOAN_FAIRNESS_SNAPSHOT
} from "../data/loanScoring";

const bandBg: Record<LoanDecisionBand, string> = {
  Green: "bg-emerald-400",
  Amber: "bg-amber-400",
  Red: "bg-red-500"
};

const bandBorder: Record<LoanDecisionBand, string> = {
  Green: "border-emerald-300",
  Amber: "border-amber-300",
  Red: "border-red-400"
};

function formatCurrency(ghs: number): string {
  return `GHS ${ghs.toLocaleString("en-GH", {
    maximumFractionDigits: 0
  })}`;
}

function formatPercent(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}

export const LoanApprover: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    LOAN_APPLICATIONS[0]?.applicationId ?? null
  );
  const [fairnessType, setFairnessType] =
    useState<FairnessSubgroupType>("Gender");

  const selectedApp: LoanApplication | undefined = useMemo(
    () =>
      LOAN_APPLICATIONS.find(a => a.applicationId === selectedAppId) ??
      LOAN_APPLICATIONS[0],
    [selectedAppId]
  );

  const fairnessRows = useMemo(
    () =>
      LOAN_FAIRNESS_SNAPSHOT.filter(
        row => row.subgroupType === fairnessType
      ),
    [fairnessType]
  );

  const snapshotDate =
    fairnessRows[0]?.snapshotDate ?? LOAN_FAIRNESS_SNAPSHOT[0]?.snapshotDate;

  const totalApps = LOAN_APPLICATIONS.length;
  const approvedCount = LOAN_APPLICATIONS.filter(
    a => a.decisionOutcome !== "Auto-Decline"
  ).length;

  return (
    <div className="w-full lg:w-[90%] mx-auto bg-mtnDark/80 border border-momoBlue/60 rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">
            MoMo Micro-Loan Approver (MTN Ghana)
          </p>
          <p className="text-[10px] text-slate-400 max-w-3xl">
            Real-time decisions on MoMo micro-loans with plain-English reasons
            and a fairness snapshot by gender and region. Demo numbers are
            synthetic but Ghana-realistic.
          </p>
        </div>
        <div className="text-[10px] text-slate-300 text-right">
          <p>
            <span className="text-slate-500">Applications in view:&nbsp;</span>
            <span>{totalApps}</span>
          </p>
          <p>
            <span className="text-slate-500">Auto / human approvals:&nbsp;</span>
            <span className="text-mtnYellow font-semibold">
              {approvedCount}
            </span>
          </p>
        </div>
      </div>

      {/* Top: decision card + queue */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Decision card */}
        <section className="flex-1 bg-mtnDark/90 border border-momoBlue/60 rounded-xl p-3 flex flex-col gap-2 text-[11px] text-slate-200">
          {selectedApp ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] text-slate-400 mb-0.5">
                    Current decision
                  </p>
                  <p className="text-sm font-semibold text-slate-50">
                    {selectedApp.customerName} · {selectedApp.productType}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {selectedApp.segment} · {selectedApp.region},{" "}
                    {selectedApp.district}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${bandBg[selectedApp.decisionBand]} bg-opacity-20 ${bandBorder[selectedApp.decisionBand]} text-slate-50`}
                  >
                    <span>{selectedApp.decisionBand}</span>
                    <span className="text-[9px]">
                      {selectedApp.riskScore}/100
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Outcome:{" "}
                    <span className="text-slate-100">
                      {selectedApp.decisionOutcome}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-400">
                    Requested amount · tenure
                  </p>
                  <p className="text-slate-100">
                    {formatCurrency(selectedApp.requestedAmountGhs)} ·{" "}
                    {selectedApp.tenureDays} days
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Channel · gender · age</p>
                  <p className="text-slate-100">
                    {selectedApp.channel} ·{" "}
                    {selectedApp.gender === "F" ? "Female" : "Male"} ·{" "}
                    {selectedApp.ageBand}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Expected 30-day delinquency</p>
                  <p className="text-slate-100">
                    {formatPercent(selectedApp.expectedPd30d)} PD
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Time to cash (if approved)</p>
                  <p className="text-slate-100">
                    {selectedApp.timeToCashSeconds != null
                      ? `${selectedApp.timeToCashSeconds} seconds`
                      : "After human review"}
                  </p>
                </div>
              </div>

              {/* Top reasons */}
              <div className="mt-2">
                <p className="text-[10px] font-semibold text-slate-200 mb-1">
                  Top reasons for this decision
                </p>
                <ul className="space-y-0.5 text-[10px] text-slate-300">
                  {[
                    selectedApp.topReason1,
                    selectedApp.topReason2,
                    selectedApp.topReason3
                  ]
                    .filter(Boolean)
                    .map((reason, idx) => (
                      <li key={idx} className="flex gap-1">
                        <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{reason}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Notes for agent / CX script */}
              {selectedApp.notesForAgent && (
                <div className="mt-2 border border-momoBlue/60 rounded-lg bg-slate-900/80 px-2 py-1.5">
                  <p className="text-[10px] font-semibold text-slate-200">
                    Tip for MTN agent / call-centre
                  </p>
                  <p className="text-[10px] text-emerald-300">
                    {selectedApp.notesForAgent}
                  </p>
                </div>
              )}

              <p className="mt-2 text-[9px] text-slate-500">
                Buttons in a real build would allow: send to human review,
                approve with lower amount, or decline with logged reason.
                This demo focuses on the scoring logic and explanations.
              </p>
            </>
          ) : (
            <p className="text-[11px] text-slate-400">
              No applications loaded.
            </p>
          )}
        </section>

        {/* Application queue */}
        <aside className="w-full lg:w-[25rem] bg-mtnDark/90 border border-momoBlue/60 rounded-xl p-3 text-[10px] text-slate-300 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-semibold text-slate-100">
              Recent applications
            </p>
            <span className="text-slate-400">
              Today: {LOAN_APPLICATIONS.length}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
            {LOAN_APPLICATIONS.map(app => {
              const [datePart, timePart] =
                app.applicationTime.split(" ");
              const active = app.applicationId === selectedAppId;
              return (
                <button
                  key={app.applicationId}
                  type="button"
                  onClick={() => setSelectedAppId(app.applicationId)}
                  className={`w-full text-left rounded-lg px-2 py-1 border transition flex flex-col gap-0.5 ${
                    active
                      ? "bg-slate-900 border-mtnYellow/70"
                      : "bg-slate-900/60 border-momoBlue/50 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-100">
                      {app.customerName}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] border ${bandBg[app.decisionBand]} bg-opacity-20 ${bandBorder[app.decisionBand]} text-slate-50`}
                    >
                      {app.decisionBand} · {app.riskScore}/100
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400">
                    {app.segment}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {formatCurrency(app.requestedAmountGhs)} ·{" "}
                    {app.tenureDays}d · {app.productType}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {app.region} · {app.channel} · {timePart ?? datePart}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="mt-1 text-[9px] text-slate-500">
            Hover or click bubbles to inspect a case. Green = auto-approve,
            Amber = human in the loop, Red = auto-decline within BoG limits.
          </p>
        </aside>
      </div>

      {/* Fairness snapshot */}
      <section className="bg-mtnDark/90 border border-momoBlue/60 rounded-xl p-3 text-[10px] text-slate-300 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-100">
              Fairness snapshot (pilot portfolio)
            </p>
            <p className="text-[10px] text-slate-400">
              Approval and default rates by subgroup. If any group’s approval
              or false-positive rate drifts beyond ±5 percentage points vs the
              overall portfolio, we trigger a fairness review.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full border border-momoBlue/50">
              <span className="text-slate-400">View by:</span>
              {(["Gender", "Region"] as FairnessSubgroupType[]).map(type => {
                const active = type === fairnessType;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFairnessType(type)}
                    className={`px-2 py-0.5 rounded-full border text-[10px] transition ${
                      active
                        ? "bg-mtnYellow text-slate-950 border-mtnYellow"
                        : "bg-slate-900 text-slate-200 border-momoBlue/50 hover:border-slate-500"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-slate-400">
              Snapshot date: {snapshotDate}
            </span>
          </div>
        </div>

        <div className="mt-1 space-y-1.5">
          {fairnessRows.map(row => {
            const approvalGapPp = row.approvalGapVsOverallPp * 100;
            const fprGapPp = row.fprGapVsOverallPp * 100;
            const drift =
              row.driftFlag ||
              Math.abs(approvalGapPp) >= 5 ||
              Math.abs(fprGapPp) >= 5;

            return (
              <div
                key={`${row.subgroupType}-${row.subgroupValue}`}
                className={`flex flex-col sm:flex-row gap-2 sm:gap-3 rounded-lg px-2 py-2 border ${
                  drift
                    ? "border-red-500/70 bg-red-500/10"
                    : "border-momoBlue/50 bg-slate-900/70"
                }`}
              >
                {/* Left: subgroup label + volume */}
                <div className="sm:w-28 sm:shrink-0">
                  <p className="text-[11px] font-semibold text-slate-100">
                    {row.subgroupValue}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {row.applications.toLocaleString("en-GH")} apps
                  </p>
                </div>

                {/* Middle: approval + bad-rate bars */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-slate-400">Approval</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${row.approvalRate * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-100">
                      {formatPercent(row.approvalRate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-slate-400">Bad rate 30d</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${row.badRate30d * 400}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-100">
                      {formatPercent(row.badRate30d)}
                    </span>
                  </div>
                </div>

                {/* Right: gaps & drift note */}
                <div className="mt-1 sm:mt-0 sm:w-40 text-[10px] text-slate-300">
                  <p>
                    Approval gap:&nbsp;
                    <span
                      className={
                        Math.abs(approvalGapPp) >= 5
                          ? "text-red-300"
                          : approvalGapPp > 0
                          ? "text-emerald-300"
                          : "text-slate-200"
                      }
                    >
                      {approvalGapPp >= 0 ? "+" : ""}
                      {approvalGapPp.toFixed(1)} pp
                    </span>
                  </p>
                  <p>
                    FPR gap:&nbsp;
                    <span
                      className={
                        Math.abs(fprGapPp) >= 5
                          ? "text-red-300"
                          : fprGapPp > 0
                          ? "text-amber-200"
                          : "text-slate-200"
                      }
                    >
                      {fprGapPp >= 0 ? "+" : ""}
                      {fprGapPp.toFixed(1)} pp
                    </span>
                  </p>
                  {drift && (
                    <p className="mt-0.5 text-[9px] text-red-300">
                      Fairness check triggered – review thresholds / features
                      for this subgroup.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-1 text-[9px] text-slate-500">
          In a pilot, this view would refresh daily. Guardrail: no gender or
          region should sit more than ±5 percentage points away from the
          portfolio average on approval or false-positive rate after
          calibration.
        </p>
      </section>
    </div>
  );
};
