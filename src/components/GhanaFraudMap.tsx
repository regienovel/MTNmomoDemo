// src/components/GhanaFraudMap.tsx

import React, { useMemo, useState } from "react";
import { EVENTS } from "../data/events";
import {
  GHANA_REGION_STATS,
  getRegionTotalCases,
  type GhanaRegionFraudStats
} from "../data/ghanaFraudMap";
import type { RiskCategory } from "../types";
import type { FilterKey } from "./FilterBar";

const riskLabel: Record<RiskCategory, string> = {
  SOCIAL_ENGINEERING: "Social engineering",
  SIM_SWAP: "SIM swap / identity",
  MULE_MERCHANT: "Mule merchants",
  AGENT_FRAUD: "Agent fraud",
  AGENT_HOTSPOT: "Agent hotspots",
  HIGH_VALUE_MERCHANT: "High-value merchants"
};

type TownStat = { name: string; cases: number };

const REGION_TOWNS: Record<string, TownStat[]> = {
  "Greater Accra": [
    { name: "Accra / Circle", cases: 120 },
    { name: "Kasoa / Ofaakor", cases: 90 },
    { name: "Madina / Adenta", cases: 60 },
    { name: "East Legon / Airport", cases: 50 }
  ],
  Central: [
    { name: "Kasoa / Ofaakor corridor", cases: 80 },
    { name: "Cape Coast markets", cases: 40 },
    { name: "Mankessim lorry station", cases: 30 }
  ],
  Ashanti: [
    { name: "Kejetia market", cases: 110 },
    { name: "Adum / Roman Hill", cases: 80 },
    { name: "Tech / Ayeduase", cases: 70 }
  ],
  Northern: [
    { name: "Tamale central", cases: 70 },
    { name: "Walewale", cases: 40 },
    { name: "Savelugu", cases: 30 }
  ],
  Volta: [
    { name: "Ho central", cases: 40 },
    { name: "Aflao border area", cases: 30 },
    { name: "Keta / Anloga", cases: 20 }
  ],
  Western: [
    { name: "Takoradi market circle", cases: 45 },
    { name: "Sekondi / harbour", cases: 35 },
    { name: "Tarkwa mining towns", cases: 30 }
  ]
  // others fall back to neutral drill-down examples
};

interface GhanaFraudLandscapeProps {
  filter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
}

export const GhanaFraudMap: React.FC<GhanaFraudLandscapeProps> = ({
  filter,
  onFilterChange
}) => {
  const [selectedRegionName, setSelectedRegionName] = useState<string>(
    GHANA_REGION_STATS[0].regionName
  );
  const [focusedRisk, setFocusedRisk] = useState<RiskCategory | null>(null);

  const currentRegion: GhanaRegionFraudStats =
    GHANA_REGION_STATS.find(r => r.regionName === selectedRegionName) ??
    GHANA_REGION_STATS[0];

  // --- Region-level bars -----------------------------------------------------

  const maxRegionCases = useMemo(
    () =>
      Math.max(
        ...GHANA_REGION_STATS.map(r => r.approxCasesPerQuarter || 0),
        1
      ),
    []
  );

  // --- Drill-down towns/markets ---------------------------------------------

  const townStats: TownStat[] =
    REGION_TOWNS[currentRegion.regionName] ?? [
      { name: `${currentRegion.regionName} – main town`, cases: 40 },
      { name: `${currentRegion.regionName} – markets`, cases: 30 },
      { name: `${currentRegion.regionName} – agents`, cases: 25 }
    ];

  const maxTownCases = Math.max(...townStats.map(t => t.cases || 0), 1);

  // --- Events for the right panel -------------------------------------------

  const relatedEvents = useMemo(
    () =>
      EVENTS.filter(e =>
        e.region.toLowerCase().includes(currentRegion.regionName.toLowerCase())
      ).slice(0, 3),
    [currentRegion.regionName]
  );

  const totalCases = getRegionTotalCases(currentRegion);
  const sortedDominantRisks = currentRegion.dominantRisks;

  return (
    <div className="bg-slate-900/80 border border-momoBlue/60 rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex justify-between items-baseline">
        <div>
          <p className="text-xs font-semibold text-slate-100">
            Ghana MoMo Fraud Landscape
          </p>
          <p className="text-[11px] text-slate-400">
            Region bars show reported/simulated MoMo fraud cases per quarter.
            Click a region bar to drill down into towns and markets.
          </p>
        </div>
        <p className="text-[11px] text-slate-500">
          Click a bar to select region ·{" "}
          <span className="font-semibold">
            Selected: {currentRegion.regionName}
          </span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 min-h-[240px]">
        {/* LEFT: Region + town bars */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          {/* Region bars */}
          <div>
            <p className="text-[11px] text-slate-400 mb-2">
              Fraud cases by region (per quarter)
            </p>

            <div className="flex items-end gap-4 h-40 border-b border-momoBlue/60 pb-3 overflow-x-auto">
              {GHANA_REGION_STATS.map(region => {
                const value = region.approxCasesPerQuarter;
                const ratio = value / maxRegionCases;
                const barHeightPct = 20 + ratio * 80; // 20–100%
                const isSelected =
                  region.regionName === currentRegion.regionName;

                return (
                  <button
                    key={region.regionName}
                    type="button"
                    onClick={() => {
                      setSelectedRegionName(region.regionName);
                      setFocusedRisk(null);
                    }}
                    className="group flex flex-col items-center gap-1 text-[10px] text-slate-300 focus:outline-none"
                  >
                    <div className="w-8 h-28 bg-slate-800/60 rounded-t-xl overflow-hidden flex items-end">
                      <div
                        className={`w-full transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-t from-amber-500 via-mtnYellow to-emerald-400"
                            : "bg-gradient-to-t from-slate-600 via-slate-400 to-slate-200 group-hover:from-sky-500 group-hover:via-sky-400 group-hover:to-cyan-300"
                        }`}
                        style={{ height: `${barHeightPct}%` }}
                      />
                    </div>
                    <span
                      className={`mt-1 text-center whitespace-nowrap ${
                        isSelected ? "text-mtnYellow font-semibold" : ""
                      }`}
                    >
                      {region.regionName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {value.toLocaleString("en-GH")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drill-down: towns / markets */}
          <div>
            <p className="text-[11px] text-slate-400 mb-2">
              Drill-down: {currentRegion.regionName} towns &amp; markets
            </p>
            <div className="space-y-2">
              {townStats.map(town => {
                const widthPct = (town.cases / maxTownCases) * 100;
                return (
                  <div
                    key={town.name}
                    className="flex items-center gap-3 text-[11px]"
                  >
                    <div className="w-44 text-slate-200 truncate">
                      {town.name}
                    </div>
                    <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-mtnYellow to-amber-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-slate-400">
                      {town.cases}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
              Use this view to spot towns / markets that may need extra
              sensitisation, radio campaigns or agent training.
            </p>
          </div>
        </div>

        {/* RIGHT: Region explanation / interactive panel */}
        <div className="w-full lg:w-[340px] bg-slate-950/90 border border-momoBlue/60 rounded-xl px-4 py-3 text-[11px] flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[11px] text-slate-400">Selected region</p>
              <p className="text-sm font-semibold text-slate-50">
                {currentRegion.regionName}
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-momoBlue/50 text-slate-300">
              ~{currentRegion.approxCasesPerQuarter.toLocaleString("en-GH")}{" "}
              cases / quarter
            </span>
          </div>

          {/* Dominant patterns -> linked to Early Warning Radar filters */}
          <div className="mt-1">
            <p className="text-[11px] font-semibold text-slate-200 mb-1">
              Dominant fraud patterns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sortedDominantRisks.map(risk => {
                const isFocused = focusedRisk === risk || filter === risk;
                return (
                  <button
                    key={risk}
                    type="button"
                    aria-pressed={isFocused}
                    onClick={() => {
                      const next = focusedRisk === risk ? null : risk;
                      setFocusedRisk(next);
                      // drive the top-level Early Warning Radar filter
                      onFilterChange(next ?? "ALL");
                    }}
                    className={`px-2 py-0.5 rounded-full border text-[11px] transition ${
                      isFocused
                        ? "bg-mtnYellow text-slate-900 border-mtnYellow shadow-sm"
                        : "bg-slate-900 border-momoBlue/50 text-slate-100 hover:border-slate-400"
                    }`}
                  >
                    {riskLabel[risk]}
                  </button>
                );
              })}
            </div>
            {focusedRisk && (
              <p className="mt-1 text-[10px] text-slate-400">
                Focused pattern:{" "}
                <span className="text-slate-200 font-medium">
                  {riskLabel[focusedRisk]}
                </span>{" "}
                – alert list & contextual KPIs above are now filtered to this
                fraud pattern.
              </p>
            )}
          </div>

          <div className="mt-2">
            <p className="text-[11px] font-semibold text-slate-200 mb-1">
              Suggested education / proactive focus
            </p>
            <p className="text-[11px] text-slate-300">
              {currentRegion.focusNotes}
            </p>
          </div>

          <div className="mt-2 flex-1 flex flex-col">
            <p className="text-[11px] font-semibold text-slate-200 mb-1">
              Example alerts in this demo
            </p>
            {relatedEvents.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No synthetic alerts tied to this region yet. Add more cases to
                the demo to light it up.
              </p>
            ) : (
              <ul className="mt-1 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {relatedEvents.map(evt => (
                  <li
                    key={evt.id}
                    className="rounded-lg bg-slate-900/70 border border-momoBlue/60 px-2 py-1 hover:border-mtnYellow/70 hover:bg-mtnDark/80 transition cursor-default"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-50">
                        {evt.channel} · {evt.eventType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {evt.riskScore}/100
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      {evt.customerLabel}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {evt.shortReason}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-1 text-[10px] text-slate-500">
            Total fraud mix in this region: ~{totalCases} cases/quarter across
            social-engineering, SIM swap, mule merchants, agent fraud and
            hotspots.
          </p>
        </div>
      </div>

      <div className="text-[10px] text-slate-400">
        Bars are synthetic demo numbers only. Use patterns &amp; drill-down
        behaviour to guide the conversation on where to focus education and
        proactive controls.
      </div>
    </div>
  );
};
