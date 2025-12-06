import React from "react";
import type { EarlyWarningEvent } from "../types";
import { RiskBadge } from "./RiskBadge";

interface Props {
  events: EarlyWarningEvent[];
  selectedEventId: string;
  onSelect: (id: string) => void;
}

const categoryLabel: Record<string, string> = {
  SOCIAL_ENGINEERING: "Social-engineering",
  SIM_SWAP: "SIM swap",
  AGENT_FRAUD: "Agent fraud",
  MULE_MERCHANT: "Mule merchant"
};

export const EventList: React.FC<Props> = ({
  events,
  selectedEventId,
  onSelect
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {events.map(e => (
        <button
          key={e.id}
          onClick={() => onSelect(e.id)}
          className={`w-full text-left px-3 py-3 border-b border-momoBlue/60 hover:bg-slate-900/70 transition ${
            selectedEventId === e.id ? "bg-slate-900" : ""
          }`}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-[10px] text-slate-500">
                {new Date(e.timestamp).toLocaleString("en-GH", {
                  timeZone: "Africa/Accra"
                })}
              </p>
              <p className="text-sm font-semibold">
                {e.walletIdMasked} · {e.customerLabel}
              </p>
              <p className="text-[11px] text-slate-300 mt-1">{e.shortReason}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                {e.channel} · {categoryLabel[e.riskCategory]}
              </span>
              <RiskBadge score={e.riskScore} />
            </div>
          </div>
        </button>
      ))}

      {events.length === 0 && (
        <div className="p-4 text-center text-xs text-slate-400">
          No alerts in this category.
        </div>
      )}
    </div>
  );
};
