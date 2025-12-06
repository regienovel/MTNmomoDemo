// src/components/GuardrailsBar.tsx

import React from "react";

export const GuardrailsBar: React.FC = () => {
  return (
    <div className="w-full border-y border-momoBlue bg-mtnDark px-4 py-2 text-[11px] text-white/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-mtnSunshine">
          Guardrails: MTN Ghana–safe fraud controls
        </span>
        <span className="hidden md:inline text-[10px] text-slate-200">
          AI recommends, humans decide on all blocks.
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-100">
        <span>• No auto-debits — only temporary pauses & caps</span>
        <span>• Impact checks for rural, low-literacy & female customers</span>
        <span>• Only uses existing MTN data (no external tracking)</span>
      </div>
    </div>
  );
};
