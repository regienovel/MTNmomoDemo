import React from "react";

interface Props {
  score: number;
}

function riskClasses(score: number): string {
  if (score >= 95) return "bg-red-500/20 text-red-200 border-red-400/60";
  if (score >= 85) return "bg-orange-500/20 text-orange-200 border-orange-400/60";
  return "bg-yellow-500/20 text-yellow-200 border-yellow-400/60";
}

export const RiskBadge: React.FC<Props> = ({ score }) => (
  <span
    className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${riskClasses(
      score
    )}`}
  >
    {score}/100
  </span>
);
