// src/components/FilterBar.tsx

import React from "react";
import type { RiskCategory } from "../types";

export type FilterKey = "ALL" | RiskCategory;

interface Props {
  filter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All alerts" },
  { key: "SOCIAL_ENGINEERING", label: "Social engineering" },
  { key: "SIM_SWAP", label: "SIM-swap window" },
  { key: "MULE_MERCHANT", label: "Mule networks & agents" },
  { key: "AGENT_FRAUD", label: "Agent fraud" },
  { key: "AGENT_HOTSPOT", label: "Agent hotspots" },
  { key: "HIGH_VALUE_MERCHANT", label: "High-value merchants" }
];

export const FilterBar: React.FC<Props> = ({ filter, onFilterChange }) => {
  return (
    <div className="px-3 py-2 border-b border-momoBlue/70 flex flex-wrap gap-2 bg-mtnDark/90">
      {FILTERS.map(f => (
        <button
          key={f.key}
          type="button"
          onClick={() => onFilterChange(f.key)}
          className={`px-3 py-1 rounded-full text-[11px] border transition ${
            filter === f.key
              ? "bg-mtnSunshine text-slate-950 border-mtnSunshine"
              : "bg-mtnDark/80 text-slate-100 border-momoBlue/60 hover:bg-momoBlue/60"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};
