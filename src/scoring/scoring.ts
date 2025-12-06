// src/scoring/scoring.ts
// Rule-based scoring logic to simulate an "AI" model.
// These functions compute scores based on interpretable features.

export interface SocialEngineeringFeatures {
  failedPins: number;
  longUssdMinutes: number;
  numNewRecipients: number;
  totalAmount: number;
  usualDailyMax: number;
  recipientsInMuleCluster: boolean;
  nightHour: boolean;
}

export interface SimSwapFeatures {
  distanceKm: number;
  deviceChanged: boolean;
  numHighValueTransfers: number;
  totalAmount: number;
  agentInFraudCases: number;
  withinSimSwapWindowMinutes: number;
}

export interface MuleMerchantFeatures {
  expectedTurnoverLower: number;
  expectedTurnoverUpper: number;
  observedTurnover: number;
  numUniqueSenders: number;
  pctFirstTimeQrUsers: number; // 0-100
  pctBalanceOvernight: number;
  numLinkedHighRiskAgents: number;
  hasMuleHubWallet: boolean;
}

export interface AgentHotspotFeatures {
  numVictimWallets: number;
  timeWindowMinutes: number;
  numPriorComplaints30d: number;
  nightActivity: boolean;
  geoClusterRadiusKm: number;
}

export interface HighValueMerchantFeatures {
  baselineDailyTurnover: number;
  observedDailyTurnover: number;
  numHighValueTx: number;
  avgTicketBaseline: number;
  avgTicketObserved: number;
  pctCorporateSenders: number; // 0-100
  rapidCashOutPct: number; // 0-100
}

export function scoreSocialEngineering(f: SocialEngineeringFeatures): number {
  let score = 0;

  if (f.failedPins >= 3) score += 20;
  if (f.failedPins >= 5) score += 10; // extra

  if (f.longUssdMinutes >= 3) score += 20;
  if (f.longUssdMinutes >= 4) score += 5;

  if (f.numNewRecipients >= 3) score += 15;
  if (f.numNewRecipients >= 4) score += 5;

  const ratio = f.totalAmount / Math.max(f.usualDailyMax, 1);
  if (ratio >= 5) score += 20;
  else if (ratio >= 3) score += 10;

  if (f.recipientsInMuleCluster) score += 15;
  if (f.nightHour) score += 10;

  return Math.min(score, 100);
}

export function scoreSimSwap(f: SimSwapFeatures): number {
  let score = 0;

  if (f.distanceKm >= 30) score += 20;
  if (f.distanceKm >= 60) score += 10;

  if (f.deviceChanged) score += 20;

  if (f.numHighValueTransfers >= 1) score += 15;
  if (f.numHighValueTransfers >= 3) score += 10;

  if (f.totalAmount >= 3000) score += 15;

  if (f.agentInFraudCases >= 1) score += 10;
  if (f.agentInFraudCases >= 5) score += 5;

  if (f.withinSimSwapWindowMinutes <= 60) score += 10;

  return Math.min(score, 100);
}

export function scoreMuleMerchant(f: MuleMerchantFeatures): number {
  let score = 0;

  const expectedMid = (f.expectedTurnoverLower + f.expectedTurnoverUpper) / 2;
  const ratio = f.observedTurnover / Math.max(expectedMid, 1);

  if (ratio >= 3) score += 20;
  if (ratio >= 5) score += 10;

  if (f.numUniqueSenders >= 50) score += 10;
  if (f.numUniqueSenders >= 150) score += 10;

  if (f.pctFirstTimeQrUsers >= 40) score += 10;
  if (f.pctFirstTimeQrUsers >= 60) score += 5;

  if (f.pctBalanceOvernight <= 20) score += 15;
  if (f.pctBalanceOvernight <= 10) score += 5;

  if (f.numLinkedHighRiskAgents >= 1) score += 10;
  if (f.numLinkedHighRiskAgents >= 3) score += 5;

  if (f.hasMuleHubWallet) score += 10;

  return Math.min(score, 100);
}

export function scoreAgentHotspot(f: AgentHotspotFeatures): number {
  let score = 0;

  if (f.numVictimWallets >= 3) score += 20;
  if (f.numVictimWallets >= 5) score += 10;

  if (f.timeWindowMinutes <= 120) score += 15;
  if (f.timeWindowMinutes <= 60) score += 5;

  if (f.numPriorComplaints30d >= 3) score += 15;
  if (f.numPriorComplaints30d >= 8) score += 10;

  if (f.nightActivity) score += 10;

  if (f.geoClusterRadiusKm <= 2) score += 10;

  return Math.min(score, 100);
}

export function scoreHighValueMerchant(f: HighValueMerchantFeatures): number {
  let score = 0;

  const turnoverRatio = f.observedDailyTurnover / Math.max(f.baselineDailyTurnover, 1);
  const ticketRatio = f.avgTicketObserved / Math.max(f.avgTicketBaseline, 1);

  if (turnoverRatio >= 3) score += 20;
  if (turnoverRatio >= 5) score += 10;

  if (f.numHighValueTx >= 5) score += 10;
  if (f.numHighValueTx >= 10) score += 5;

  if (ticketRatio >= 2) score += 15;

  if (f.pctCorporateSenders >= 40) score += 10;
  if (f.pctCorporateSenders >= 70) score += 5;

  if (f.rapidCashOutPct >= 60) score += 15;
  if (f.rapidCashOutPct >= 80) score += 5;

  return Math.min(score, 100);
}
