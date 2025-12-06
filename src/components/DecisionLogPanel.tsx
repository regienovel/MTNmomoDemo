// src/components/DecisionLogPanel.tsx

import React from "react";

export interface DecisionLogEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  decision: "pause" | "review" | "release";
  investigator: string;
  timestamp: string;
}

interface Props {
  entries: DecisionLogEntry[];
  onClose?: () => void;
  onSelectEntry?: (entry: DecisionLogEntry) => void;
}

const decisionLabel: Record<DecisionLogEntry["decision"], string> = {
  pause: "Paused",
  review: "Sent for review",
  release: "Released"
};

const decisionColour: Record<DecisionLogEntry["decision"], string> = {
  pause: "text-amber-300",
  review: "text-sky-300",
  release: "text-emerald-300"
};

export const DecisionLogPanel: React.FC<Props> = ({
  entries,
  onClose,
  onSelectEntry
}) => {
  if (!entries.length) return null;

  const counts = entries.reduce(
    (acc, e) => {
      acc[e.decision] += 1;
      return acc;
    },
    { pause: 0, review: 0, release: 0 }
  );

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-950/95 border border-momoBlue/60 rounded-2xl shadow-2xl p-3 hidden md:block z-40">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xs font-semibold text-slate-100">
            Recent decisions (demo audit trail)
          </p>
          <p className="text-[10px] text-slate-500">
            {counts.pause} Paused · {counts.review} Sent for review ·{" "}
            {counts.release} Released
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">
            Last {Math.min(entries.length, 20)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-slate-100"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-52 overflow-y-auto">
        {entries.map(entry => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelectEntry?.(entry)}
            className="w-full text-left text-[11px] text-slate-300 rounded-lg px-2 py-1 hover:bg-slate-900/80 transition"
          >
            <div className="flex justify-between">
              <span className={decisionColour[entry.decision]}>
                {decisionLabel[entry.decision]}
              </span>
              <span className="text-[10px] text-slate-500">
                {entry.timestamp}
              </span>
            </div>
            <p className="truncate">
              <span className="text-slate-400">Event:</span> {entry.eventTitle}
            </p>
            <p className="text-[10px] text-slate-500">
              {entry.investigator} · Event ID: {entry.eventId}
            </p>
          </button>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        Click any row to jump back to that alert. Every Pause / Review / Release is
        logged with who decided, when and on which alert — ready for BoG / CSA audit
        conversations.
      </p>
    </div>
  );
};
