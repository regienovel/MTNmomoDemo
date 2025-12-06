// src/types.ts

export type RiskCategory =
  | "SOCIAL_ENGINEERING"
  | "SIM_SWAP"
  | "MULE_MERCHANT"
  | "AGENT_FRAUD"
  | "AGENT_HOTSPOT"
  | "HIGH_VALUE_MERCHANT";

export interface EarlyWarningEvent {
  id: string;
  timestamp: string; // ISO
  walletIdMasked: string;
  customerLabel: string;
  channel: "USSD" | "APP" | "QR" | "AGENT" | "SIM_EVENT";
  region: string;
  eventType: string;
  riskScore: number;
  riskCategory: RiskCategory;
  shortReason: string;
}

export interface ExplanationSignal {
  label: string;
  value: string;
  impact: "high" | "medium" | "low";
}

export interface ExplanationCard {
  eventId: string;
  title: string;
  subtitle: string;
  riskCategory: RiskCategory;
  riskScore: number;
  probabilityText: string;
  customerSegment: string;
  whyFlagged: string[];
  keySignals: ExplanationSignal[];
  recommendedActions: string[];
}

export interface NetworkNode {
  id: string;
  name: string;
  type: "WALLET" | "AGENT" | "MERCHANT" | "SIM" | "CALLER";
  riskLevel: "low" | "medium" | "high";

  // Optional: cross-alert reuse metadata for halos in the network view
  alertCount?: number;
  alertIds?: string[];
  seenIn?: string[];
}

export interface NetworkLink {
  source: string;
  target: string;
  label?: string;

  // Optional numeric timestamp so the time slider can sort/replay links
  timestamp?: number;
}

/**
 * Liquidity demo types
 */

export type LiquidityRiskBand = "Green" | "Amber" | "Red";

export interface AgentForecast {
  forecastDate: string; // e.g. "2025-03-28"
  region: string; // e.g. "Greater Accra"
  district: string; // e.g. "La Nkwantanang-Madina"
  townArea: string; // e.g. "Madina Zongo Junction"
  agentId: string; // "GA-1042"
  agentName: string; // kiosk name

  latitude: number;
  longitude: number;

  weekday: string; // "Monday"..."Sunday"
  isPayday: boolean;
  isMarketDay: boolean;
  atmOutageRisk: boolean;

  histAvgCashoutGhs: number;
  forecastCashoutGhs: number;
  startingFloatGhs: number;
  floatShortfallGhs: number;

  riskScore: number; // 0–100
  riskBand: LiquidityRiskBand;
  last30dStockouts: number;

  recommendation: string;

  routeClusterId: string; // e.g. "ACC_PAYDAY_01"
  routeSequence: number; // 0,1,2...
}

/**
 * Loan approver demo types
 */

export type LoanChannel = "USSD" | "App" | "Agent";

export type LoanDecisionBand = "Green" | "Amber" | "Red";

export type LoanDecisionOutcome =
  | "Auto-Approve"
  | "Auto-Decline"
  | "Human Review";

export interface LoanApplication {
  applicationId: string;
  applicationTime: string; // "2025-03-28 09:12:04"
  channel: LoanChannel;

  customerId: string;
  customerName: string;
  gender: "M" | "F";
  ageBand: string;

  region: string;
  district: string;
  segment: string;

  requestedAmountGhs: number;
  tenureDays: number;
  productType: string;

  riskScore: number; // 0–100
  decisionBand: LoanDecisionBand;
  decisionOutcome: LoanDecisionOutcome;
  expectedPd30d: number; // 0–1

  topReason1: string;
  topReason2: string;
  topReason3?: string | null;

  timeToCashSeconds?: number | null;
  notesForAgent?: string | null;
}

export type FairnessSubgroupType = "Gender" | "Region";

export interface LoanFairnessSnapshot {
  snapshotDate: string; // "2025-03-31"
  subgroupType: FairnessSubgroupType;
  subgroupValue: string; // e.g. "Female", "Northern"

  applications: number;
  approvalRate: number; // 0–1
  badRate30d: number; // 0–1
  falsePositiveRate: number; // 0–1
  falseNegativeRate: number; // 0–1

  // gaps vs portfolio average, in *fractions* (0.02 = +2 percentage points)
  approvalGapVsOverallPp: number;
  fprGapVsOverallPp: number;

  driftFlag: boolean;
}
