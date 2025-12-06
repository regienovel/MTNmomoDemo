// src/data/events.ts

import type { EarlyWarningEvent } from "../types";
import {
  scoreSocialEngineering,
  scoreSimSwap,
  scoreMuleMerchant,
  scoreAgentHotspot,
  scoreHighValueMerchant
} from "../scoring/scoring";

// Scenario 1: Madam Akos (Guided USSD scam in Kumasi)
const akosRiskScore = scoreSocialEngineering({
  failedPins: 5,
  longUssdMinutes: 4,
  numNewRecipients: 4,
  totalAmount: 3000,
  usualDailyMax: 600,
  recipientsInMuleCluster: true,
  nightHour: true
});

// Scenario 2: Issah (SIM swap + agent collusion, Tamale/Walewale)
const issahRiskScore = scoreSimSwap({
  distanceKm: 70,
  deviceChanged: true,
  numHighValueTransfers: 3,
  totalAmount: 2000 + 1800 + 1600,
  agentInFraudCases: 9,
  withinSimSwapWindowMinutes: 60
});

// Scenario 3: Kasoa QR mule merchant
const kasoaRiskScore = scoreMuleMerchant({
  expectedTurnoverLower: 1000,
  expectedTurnoverUpper: 1500,
  observedTurnover: 84000,
  numUniqueSenders: 150,
  pctFirstTimeQrUsers: 60,
  pctBalanceOvernight: 5,
  numLinkedHighRiskAgents: 3,
  hasMuleHubWallet: true
});

// Scenario 4: Agent hotspot in Ashaiman
const ashaimanAgentScore = scoreAgentHotspot({
  numVictimWallets: 5,
  timeWindowMinutes: 40,
  numPriorComplaints30d: 10,
  nightActivity: true,
  geoClusterRadiusKm: 1.5
});

// Scenario 5: High-value merchant in East Legon
const eastLegonMerchantScore = scoreHighValueMerchant({
  baselineDailyTurnover: 4000,
  observedDailyTurnover: 28000,
  numHighValueTx: 9,
  avgTicketBaseline: 250,
  avgTicketObserved: 1800,
  pctCorporateSenders: 65,
  rapidCashOutPct: 75
});

export const EVENTS: EarlyWarningEvent[] = [
  {
    id: "evt-akos-ussd-1",
    timestamp: "2025-03-11T22:04:00+00:00",
    walletIdMasked: "C-104392",
    customerLabel: "Market trader – Kejetia, Kumasi",
    channel: "USSD",
    region: "Ashanti",
    eventType: "Guided USSD session · high-risk transfers",
    riskScore: akosRiskScore,
    riskCategory: "SOCIAL_ENGINEERING",
    shortReason:
      "5 failed PINs, long USSD, GHS 3,000 sent to 4 new wallets in coastal regions linked to a known mule cluster."
  },
  {
    id: "evt-issah-sim-1",
    timestamp: "2025-04-04T11:05:00+00:00",
    walletIdMasked: "C-208771",
    customerLabel: "Salaried worker – Tamale",
    channel: "AGENT",
    region: "Northern",
    eventType: "SIM swap window · high-value agent cash-out",
    riskScore: issahRiskScore,
    riskCategory: "SIM_SWAP",
    shortReason:
      "SIM swap in Walewale, new device, GHS 5,400 sent to new wallet and cashed out at high-risk Agent #AG-1129."
  },
  {
    id: "evt-qr-kasoa-1",
    timestamp: "2025-05-21T20:30:00+00:00",
    walletIdMasked: "QR-78421",
    customerLabel: "KASOA SMART ELECTRONICS · QR merchant",
    channel: "QR",
    region: "Central (Kasoa-Ofaakor)",
    eventType: "New QR merchant · abnormal inflows",
    riskScore: kasoaRiskScore,
    riskCategory: "MULE_MERCHANT",
    shortReason:
      "New Kasoa QR merchant with 6–7× expected turnover, 150+ first-time QR senders, funds emptied daily via 3 agents and a mule hub."
  },
  {
    id: "evt-agent-ashaiman-1",
    timestamp: "2025-06-02T18:15:00+00:00",
    walletIdMasked: "AG-MD-219",
    customerLabel: "Agent #MD-219 · Ashaiman market",
    channel: "AGENT",
    region: "Greater Accra",
    eventType: "Agent hotspot · multiple victim cash-outs",
    riskScore: ashaimanAgentScore,
    riskCategory: "AGENT_HOTSPOT",
    shortReason:
      "Five different wallets from Ashaiman and Madina reported fraud after cashing out at this agent within 40 minutes."
  },
  {
    id: "evt-merchant-eastlegon-1",
    timestamp: "2025-06-10T19:40:00+00:00",
    walletIdMasked: "HV-99201",
    customerLabel: "EAST LEGON LIFESTYLE MART · high-value merchant",
    channel: "QR",
    region: "Greater Accra (East Legon)",
    eventType: "High-value merchant · abnormal ticket sizes",
    riskScore: eastLegonMerchantScore,
    riskCategory: "HIGH_VALUE_MERCHANT",
    shortReason:
      "East Legon merchant with 6–7× normal turnover, many high-value tickets from corporate wallets and rapid evening cash-outs."
  }
];
