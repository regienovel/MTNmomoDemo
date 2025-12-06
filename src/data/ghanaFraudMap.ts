// src/data/ghanaFraudMap.ts

import type { RiskCategory } from "../types";

export interface RegionRiskBreakdown {
  SOCIAL_ENGINEERING: number;
  SIM_SWAP: number;
  MULE_MERCHANT: number;
  AGENT_FRAUD: number;
  AGENT_HOTSPOT: number;
  HIGH_VALUE_MERCHANT: number;
}

export interface GhanaRegionFraudStats {
  regionName: string;
  approxCasesPerQuarter: number;
  dominantRisks: RiskCategory[];
  breakdown: RegionRiskBreakdown;
  /**
   * Short narrative for the right-hand panel:
   * where to focus education / proactive work in this region.
   */
  focusNotes: string;
}

/**
 * Helper: total fraud cases for a region across all risk types.
 * We use this both for the colour scale and for the text footer.
 */
export function getRegionTotalCases(region: GhanaRegionFraudStats): number {
  return Object.values(region.breakdown).reduce((sum, v) => sum + v, 0);
}

/**
 * Helper: fuzzy match between a GeoJSON "region" name and our stats.
 *  - First try exact match
 *  - Then try "contains" match to be forgiving about things like
 *    "Central" vs "Central Region".
 */
export function getRegionStatsByName(
  name: string
): GhanaRegionFraudStats | null {
  const normalised = name.trim().toLowerCase();

  let match =
    GHANA_REGION_STATS.find(
      r => r.regionName.toLowerCase() === normalised
    ) ??
    GHANA_REGION_STATS.find(r =>
      normalised.includes(r.regionName.toLowerCase())
    );

  return match ?? null;
}

/**
 * Synthetic but Ghana-realistic regional MoMo fraud picture.
 * Numbers are “per quarter” and just for the board demo – not real data.
 *
 * Make sure regionName strings line up with the "region" property
 * in ghana_regions.json (e.g. "Greater Accra", "Ashanti", "Northern", etc.).
 */
export const GHANA_REGION_STATS: GhanaRegionFraudStats[] = [
  {
    regionName: "Greater Accra",
    approxCasesPerQuarter: 320,
    dominantRisks: [
      "SOCIAL_ENGINEERING",
      "MULE_MERCHANT",
      "HIGH_VALUE_MERCHANT"
    ],
    breakdown: {
      SOCIAL_ENGINEERING: 120,
      SIM_SWAP: 70,
      MULE_MERCHANT: 60,
      AGENT_FRAUD: 30,
      AGENT_HOTSPOT: 20,
      HIGH_VALUE_MERCHANT: 20
    },
    focusNotes:
      "High density of smartphone users, online schemes, Kasoa / Madina / East Legon high-value merchants, and agent hotspots around markets and lorry stations."
  },
  {
    regionName: "Ashanti",
    approxCasesPerQuarter: 260,
    dominantRisks: ["SOCIAL_ENGINEERING", "AGENT_FRAUD"],
    breakdown: {
      SOCIAL_ENGINEERING: 140,
      SIM_SWAP: 40,
      MULE_MERCHANT: 25,
      AGENT_FRAUD: 30,
      AGENT_HOTSPOT: 15,
      HIGH_VALUE_MERCHANT: 10
    },
    focusNotes:
      "Kejetia, Adum and other busy markets with many feature-phone traders. Focus on USSD coaching scams, PIN safety, and safe agent behaviour for cash-outs."
  },
  {
    regionName: "Central",
    approxCasesPerQuarter: 150,
    dominantRisks: ["MULE_MERCHANT", "SOCIAL_ENGINEERING"],
    breakdown: {
      SOCIAL_ENGINEERING: 50,
      SIM_SWAP: 20,
      MULE_MERCHANT: 45,
      AGENT_FRAUD: 15,
      AGENT_HOTSPOT: 10,
      HIGH_VALUE_MERCHANT: 10
    },
    focusNotes:
      "Kasoa-Ofaakor corridor and roadside merchants showing abnormal MoMo turnover. Education on QR awareness, spotting fake online shops and betting-related mule activity."
  },
  {
    regionName: "Northern",
    approxCasesPerQuarter: 140,
    dominantRisks: ["SIM_SWAP", "AGENT_FRAUD"],
    breakdown: {
      SOCIAL_ENGINEERING: 30,
      SIM_SWAP: 55,
      MULE_MERCHANT: 15,
      AGENT_FRAUD: 20,
      AGENT_HOTSPOT: 15,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Tamale, Walewale and surrounding towns with SIM-swap windows exploited by fraudsters. Focus on SIM registration integrity, agent verification steps and ‘call MTN first’ education."
  },
  {
    regionName: "Eastern",
    approxCasesPerQuarter: 120,
    dominantRisks: ["SOCIAL_ENGINEERING", "SIM_SWAP"],
    breakdown: {
      SOCIAL_ENGINEERING: 55,
      SIM_SWAP: 35,
      MULE_MERCHANT: 10,
      AGENT_FRAUD: 10,
      AGENT_HOTSPOT: 5,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Koforidua and satellite towns – mix of MoMo coaching scams and SIM-swap cases on long-distance travellers. Focus on radio / community sensitisation and secure SIM replacement flow."
  },
  {
    regionName: "Western",
    approxCasesPerQuarter: 110,
    dominantRisks: ["MULE_MERCHANT", "AGENT_FRAUD"],
    breakdown: {
      SOCIAL_ENGINEERING: 30,
      SIM_SWAP: 20,
      MULE_MERCHANT: 30,
      AGENT_FRAUD: 15,
      AGENT_HOTSPOT: 10,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Takoradi and mining / port-adjacent communities with cross-border mule merchants and high-volume agents. Focus on merchant KYC and suspicious cash-out monitoring."
  },
  {
    regionName: "Volta",
    approxCasesPerQuarter: 90,
    dominantRisks: ["SOCIAL_ENGINEERING", "MULE_MERCHANT"],
    breakdown: {
      SOCIAL_ENGINEERING: 40,
      SIM_SWAP: 15,
      MULE_MERCHANT: 20,
      AGENT_FRAUD: 5,
      AGENT_HOTSPOT: 5,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Border towns and travel corridors with cross-network scams. Focus on ‘don’t share OTP/PIN’ campaigns and co-ordination with agents near the Togo border."
  },
  {
    regionName: "Upper East",
    approxCasesPerQuarter: 70,
    dominantRisks: ["SIM_SWAP", "SOCIAL_ENGINEERING"],
    breakdown: {
      SOCIAL_ENGINEERING: 25,
      SIM_SWAP: 25,
      MULE_MERCHANT: 5,
      AGENT_FRAUD: 5,
      AGENT_HOTSPOT: 5,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Cross-regional migration and seasonal workers create SIM ownership churn. Focus on safe SIM replacement and awareness via local radio / community leaders."
  },
  {
    regionName: "Upper West",
    approxCasesPerQuarter: 55,
    dominantRisks: ["SOCIAL_ENGINEERING"],
    breakdown: {
      SOCIAL_ENGINEERING: 25,
      SIM_SWAP: 10,
      MULE_MERCHANT: 5,
      AGENT_FRAUD: 5,
      AGENT_HOTSPOT: 5,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Lower overall MoMo volumes but growing phone-based scams. Focus on basic MoMo safety education and simple ‘3 checks before you send’ messages."
  },
  {
    regionName: "Bono",
    approxCasesPerQuarter: 60,
    dominantRisks: ["SOCIAL_ENGINEERING", "AGENT_HOTSPOT"],
    breakdown: {
      SOCIAL_ENGINEERING: 25,
      SIM_SWAP: 10,
      MULE_MERCHANT: 5,
      AGENT_FRAUD: 5,
      AGENT_HOTSPOT: 10,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Trading towns with busy lorry parks and MoMo kiosks. Focus on agent hotspot monitoring and joint outreach with local MoMo agents."
  },
  {
    regionName: "Bono East",
    approxCasesPerQuarter: 50,
    dominantRisks: ["SOCIAL_ENGINEERING"],
    breakdown: {
      SOCIAL_ENGINEERING: 20,
      SIM_SWAP: 10,
      MULE_MERCHANT: 5,
      AGENT_FRAUD: 5,
      AGENT_HOTSPOT: 5,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Emerging MoMo market with increasing smartphone penetration. Early education can prevent bad habits – focus on schools, churches and market associations."
  },
  {
    regionName: "Ahafo",
    approxCasesPerQuarter: 45,
    dominantRisks: ["SOCIAL_ENGINEERING"],
    breakdown: {
      SOCIAL_ENGINEERING: 18,
      SIM_SWAP: 8,
      MULE_MERCHANT: 5,
      AGENT_FRAUD: 5,
      AGENT_HOTSPOT: 4,
      HIGH_VALUE_MERCHANT: 5
    },
    focusNotes:
      "Smaller but growing MoMo base; use simple vernacular education spots and collaborate with local chiefs’ councils."
  },
  {
    regionName: "Savannah",
    approxCasesPerQuarter: 50,
    dominantRisks: ["SIM_SWAP", "AGENT_FRAUD"],
    breakdown: {
      SOCIAL_ENGINEERING: 10,
      SIM_SWAP: 20,
      MULE_MERCHANT: 5,
      AGENT_FRAUD: 10,
      AGENT_HOTSPOT: 3,
      HIGH_VALUE_MERCHANT: 2
    },
    focusNotes:
      "Long-distance travel and weaker connectivity create SIM update gaps. Focus on secure SIM-swap processes and agent training on ID checks."
  },
  {
    regionName: "North East",
    approxCasesPerQuarter: 40,
    dominantRisks: ["SIM_SWAP"],
    breakdown: {
      SOCIAL_ENGINEERING: 10,
      SIM_SWAP: 15,
      MULE_MERCHANT: 3,
      AGENT_FRAUD: 5,
      AGENT_HOTSPOT: 4,
      HIGH_VALUE_MERCHANT: 3
    },
    focusNotes:
      "Small but non-trivial SIM-swap and agent-assisted fraud. Focus on onboarding agents correctly and follow-up checks on repeat cash-out points."
  },
  {
    regionName: "Oti",
    approxCasesPerQuarter: 35,
    dominantRisks: ["SOCIAL_ENGINEERING"],
    breakdown: {
      SOCIAL_ENGINEERING: 15,
      SIM_SWAP: 8,
      MULE_MERCHANT: 3,
      AGENT_FRAUD: 3,
      AGENT_HOTSPOT: 3,
      HIGH_VALUE_MERCHANT: 3
    },
    focusNotes:
      "Rural communities with mixed literacy levels. Focus on voice-based and community-meeting education rather than app-heavy nudges."
  },
  {
    regionName: "Western North",
    approxCasesPerQuarter: 35,
    dominantRisks: ["AGENT_FRAUD", "SOCIAL_ENGINEERING"],
    breakdown: {
      SOCIAL_ENGINEERING: 12,
      SIM_SWAP: 6,
      MULE_MERCHANT: 4,
      AGENT_FRAUD: 7,
      AGENT_HOTSPOT: 3,
      HIGH_VALUE_MERCHANT: 3
    },
    focusNotes:
      "Mining communities and high agent density – focus on agent oversight and checks on unusual high-value cash-outs."
  }
];

// Sanity check (optional): if you want, you can ensure the
// approxCasesPerQuarter always equals the breakdown total by replacing
// approxCasesPerQuarter with getRegionTotalCases(...) when creating the data.
