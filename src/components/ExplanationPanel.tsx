// src/components/ExplanationPanel.tsx

import React from "react";
import type { ExplanationCard } from "../types";
import { RiskBadge } from "./RiskBadge";

interface Props {
  card: ExplanationCard | undefined;
  onDecision?: (decision: "pause" | "review" | "release", card: ExplanationCard) => void;
}

export const ExplanationPanel: React.FC<Props> = ({ card, onDecision }) => {
  if (!card) return null;

  const handleClick = (decision: "pause" | "review" | "release") => {
    if (onDecision) {
      onDecision(decision, card);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-momoBlue/60 rounded-2xl p-4 flex flex-col shadow-lg max-h-[70vh] md:max-h-none overflow-y-auto">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-base font-semibold">{card.title}</h2>
          <p className="text-xs text-slate-400">{card.subtitle}</p>
        </div>
        <div className="text-right flex flex-col gap-1 items-end">
          <p className="text-xs text-slate-400">{card.probabilityText}</p>
          <RiskBadge score={card.riskScore} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        {card.keySignals.map(s => (
          <div
            key={s.label}
            className="bg-slate-950/60 border border-momoBlue/60 rounded-xl px-2 py-1"
          >
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className="text-sm text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold mb-1">Why this was flagged</p>
        <ul className="text-sm text-slate-200 space-y-1 list-disc pl-4">
          {card.whyFlagged.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold mb-1">Recommended next actions</p>
        <ul className="text-sm text-slate-200 space-y-1 list-disc pl-4">
          {card.recommendedActions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex justify-between items-center border-t border-momoBlue/60 pt-2">
        <p className="text-xs text-slate-400">
          Customer segment: {card.customerSegment}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleClick("pause")}
            className="px-3 py-1 text-xs rounded-full bg-mtnYellow text-slate-950 font-semibold"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={() => handleClick("review")}
            className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-900 font-semibold"
          >
            Review
          </button>
          <button
            type="button"
            onClick={() => handleClick("release")}
            className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-200"
          >
            Release
          </button>
        </div>
      </div>
    </div>
  );
};
