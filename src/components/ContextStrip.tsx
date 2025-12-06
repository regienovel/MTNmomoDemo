// src/components/ContextStrip.tsx

import React from "react";
import type { FilterKey } from "./FilterBar";
import type { RiskCategory } from "../types";

interface Props {
  categoryStats: Record<RiskCategory, number>;
  activeFilter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
}

const categoryLabel: Record<RiskCategory, string> = {
  SOCIAL_ENGINEERING: "Social engineering",
  SIM_SWAP: "SIM swap",
  MULE_MERCHANT: "Mule merchants & mules",
  AGENT_FRAUD: "Agent fraud",
  AGENT_HOTSPOT: "Agent hotspots",
  HIGH_VALUE_MERCHANT: "High-value merchants"
};

const orderedCategories: RiskCategory[] = [
  "SOCIAL_ENGINEERING",
  "SIM_SWAP",
  "MULE_MERCHANT",
  "AGENT_FRAUD",
  "AGENT_HOTSPOT",
  "HIGH_VALUE_MERCHANT"
];

export const ContextStrip: React.FC<Props> = ({
  categoryStats,
  activeFilter,
  onFilterChange
}) => {
  return (
    <section className="w-full border-b border-momoBlue bg-mtnDark px-4 py-3 text-[11px] text-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200">
        {/* National fraud losses card – click to reset to ALL */}
        <button
          type="button"
          onClick={() => onFilterChange("ALL")}
          className="text-left bg-momoBlue/25 border border-momoBlue/70 rounded-xl px-3 py-2 hover:border-mtnSunshine/60 transition"
        >
          <p className="text-[11px] text-slate-200">
            National fraud losses (H1 2025)
          </p>
          <p className="text-lg font-semibold text-mtnSunshine">≈ GHS 14.9m</p>
          <p className="text-[11px] text-slate-300">
            Across digital channels · CSA figures. Fraud growth is outpacing MoMo
            growth. Click to view all alerts.
          </p>
        </button>

        {/* MoMo share card – interactive risk mix pills */}
        <div className="bg-momoBlue/25 border border-momoBlue/70 rounded-xl px-3 py-2">
          <p className="text-[11px] text-slate-200">
            Mobile money share of reported fraud (2023)
          </p>
          <p className="text-lg font-semibold text-mtnSunshine">≈ 20%</p>
          <p className="text-[11px] text-slate-300">
            BoG estimates ~2,700 MoMo cases with losses &gt; GHS 10m.
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {orderedCategories.map(cat => {
              const count = categoryStats[cat] ?? 0;
              const isActive = activeFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onFilterChange(cat)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] transition ${
                    isActive
                      ? "bg-mtnSunshine text-slate-950 border-mtnSunshine"
                      : "bg-mtnDark/80 text-white border-momoBlue/70 hover:bg-momoBlue/60"
                  }`}
                >
                  {categoryLabel[cat]} · {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Regulatory pressure card – click to focus on SIM-related alerts */}
        <button
          type="button"
          onClick={() => onFilterChange("SIM_SWAP")}
          className="text-left bg-momoBlue/25 border border-momoBlue/70 rounded-xl px-3 py-2 hover:border-mtnSunshine/60 transition"
        >
          <p className="text-[11px] text-slate-200">Regulatory pressure</p>
          <p className="text-lg font-semibold text-mtnSunshine">High</p>
          <p className="text-[11px] text-slate-300">
            BoG, CSA & Parliament pushing biometric SIM integrity, CEIR & MoMo
            fraud reduction targets. Click to focus on SIM-swap / identity alerts.
          </p>
        </button>
      </div>
    </section>
  );
};
