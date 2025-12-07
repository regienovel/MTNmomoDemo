// src/components/LayoutHeader.tsx

import React, { useEffect, useState } from "react";

type TextSize = "small" | "medium" | "large";

const TEXT_SIZE_STORAGE_KEY = "mtn-demo-text-size";

function applyTextSize(size: TextSize) {
  const root = document.documentElement;
  root.dataset.textSize = size;

  try {
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}

export const LayoutHeader: React.FC = () => {
  const [textSize, setTextSize] = useState<TextSize>("medium");

  // Initialise from localStorage on mount
  useEffect(() => {
    let initial: TextSize = "medium";

    try {
      const stored = localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
      if (stored === "small" || stored === "medium" || stored === "large") {
        initial = stored;
      }
    } catch {
      // ignore
    }

    setTextSize(initial);
    applyTextSize(initial);
  }, []);

  const handleChange = (next: TextSize) => {
    setTextSize(next);
    applyTextSize(next);
  };

  return (
    <header className="px-3 py-2 sm:p-4 border-b border-mtnSunshine/70 bg-momoBlue backdrop-blur text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: title + subtitle */}
        <div className="flex flex-col">
          <h1 className="text-[13px] md:text-sm font-semibold tracking-wide">
            MTN MoMo Risk &amp; Growth Command Center
          </h1>
          <p className="text-[10px] text-white/80">
            Fraud, agent liquidity, micro-loans and customer trust cockpit – MTN Ghana Demo · Synthetic but Ghana-realistic MoMo fraud patterns
          </p>
        </div>

        {/* Right: text-size selector + meta */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
          {/* Text size dropdown */}
          <div className="flex items-center gap-1 text-[10px] text-white/80">
            <span className="uppercase tracking-wide text-[9px] text-mtnSunshine">
              Text size
            </span>
            <select
              value={textSize}
              onChange={e => handleChange(e.target.value as TextSize)}
              className="bg-mtnDark/70 border border-mtnSunshine/80 rounded-full px-2 py-1 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-mtnSunshine focus:ring-offset-1 focus:ring-offset-momoBlue"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="text-[10px]">
            <p className="uppercase tracking-wide text-mtnSunshine">
              Live demo · Board mode
            </p>
            <p className="text-xs text-white/80">
              Fraud Control &amp; Analytics · Accra switch
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
