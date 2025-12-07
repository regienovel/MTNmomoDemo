// src/components/Tabs.tsx

import React from "react";

interface TabDef {
  id: string;
  label: string;
}

interface TabsProps {
  value: string;
  onChange: (id: string) => void;
  tabs: TabDef[];
}

export const Tabs: React.FC<TabsProps> = ({ value, onChange, tabs }) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap sm:flex-nowrap gap-1 rounded-full bg-slate-900/80 border border-momoBlue/60 p-1 text-xs">
        {tabs.map(tab => {
          const active = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`px-3 py-1 rounded-full transition ${
                active
                  ? "bg-mtnSunshine text-slate-950 font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
