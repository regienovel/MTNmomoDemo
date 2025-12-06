// src/data/loanScoring.ts

import type { LoanApplication, LoanFairnessSnapshot } from "../types";

export const LOAN_APPLICATIONS: LoanApplication[] = [
  // 1. Akua – vegetable trader, Kumasi (GREEN – Auto-Approve)
  // Now a few days before month-end so she appears in 7D & 30D, but not "Today" if a newer app exists.
  {
    applicationId: "APP-0001",
    applicationTime: "2025-03-22 09:12:04",
    channel: "USSD",
    customerId: "C-1042",
    customerName: "Akua Mensah",
    gender: "F",
    ageBand: "25–34",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    segment: "Market trader – vegetables",
    requestedAmountGhs: 800,
    tenureDays: 30,
    productType: "MoMo Working Capital",
    riskScore: 23,
    decisionBand: "Green",
    decisionOutcome: "Auto-Approve",
    expectedPd30d: 0.02,
    topReason1:
      "Strong, regular MoMo inflows over last 18 months from repeat buyers.",
    topReason2:
      "5/5 previous Qwikloan-type loans repaid on time with no arrears.",
    topReason3:
      "No other active digital loans or overdrafts in the credit bureau.",
    timeToCashSeconds: 42,
    notesForAgent:
      "Tell customer funds are available immediately in wallet."
  },

  // 2. Kofi – phone repair & airtime reseller, Tamale (AMBER – Human review)
  // Earlier in the month – appears in 30D view, but not in 7D.
  {
    applicationId: "APP-0002",
    applicationTime: "2025-03-20 09:18:31",
    channel: "App",
    customerId: "C-2099",
    customerName: "Kofi Owusu",
    gender: "M",
    ageBand: "25–34",
    region: "Northern",
    district: "Tamale Metropolitan",
    segment: "Phone repair & airtime reseller",
    requestedAmountGhs: 1200,
    tenureDays: 45,
    productType: "MoMo Working Capital",
    riskScore: 48,
    decisionBand: "Amber",
    decisionOutcome: "Human Review",
    expectedPd30d: 0.05,
    topReason1:
      "Growing business inflows with three on-time repayments on prior loans.",
    topReason2:
      "One previous facility repaid 5–10 days late; borderline behaviour.",
    topReason3:
      "Recent spike in airtime advances – need affordability check before full approval.",
    timeToCashSeconds: null,
    notesForAgent:
      "Call to confirm income sources; consider offering GHS 800 instead of full request."
  },

  // 3. Yaw – salaried worker, Ablekuma (RED – Auto-Decline)
  // Very recent but not "today" – shows up in 7D & 30D.
  {
    applicationId: "APP-0003",
    applicationTime: "2025-03-26 09:25:10",
    channel: "USSD",
    customerId: "C-3301",
    customerName: "Yaw Asante",
    gender: "M",
    ageBand: "18–24",
    region: "Greater Accra",
    district: "Ablekuma West",
    segment: "Salaried worker – entry level",
    requestedAmountGhs: 1500,
    tenureDays: 30,
    productType: "Personal Micro-loan",
    riskScore: 81,
    decisionBand: "Red",
    decisionOutcome: "Auto-Decline",
    expectedPd30d: 0.16,
    topReason1:
      "Multiple active mobile loans with total exposure near BoG digital credit cap.",
    topReason2:
      "Three past-due episodes over 30 days in the last 12 months.",
    topReason3:
      "High share of monthly income already committed to existing instalments.",
    timeToCashSeconds: null,
    notesForAgent:
      "Explain decline clearly – avoid over-indebtedness and offer savings / budgeting tips."
  },

  // 4. Hawa – shea butter trader, Wa (GREEN – Auto-Approve)
  // Day before latest – visible in Today? No, but in 7D & 30D.
  {
    applicationId: "APP-0004",
    applicationTime: "2025-03-27 09:33:47",
    channel: "App",
    customerId: "C-4510",
    customerName: "Hawa Mahama",
    gender: "F",
    ageBand: "35–44",
    region: "Upper West",
    district: "Wa Municipal",
    segment: "Shea butter trader – cross-border",
    requestedAmountGhs: 1000,
    tenureDays: 60,
    productType: "MoMo SME Booster",
    riskScore: 29,
    decisionBand: "Green",
    decisionOutcome: "Auto-Approve",
    expectedPd30d: 0.025,
    topReason1:
      "Consistent MoMo deposits from buyers in Tamale and Kumasi across seasons.",
    topReason2:
      "No missed repayments; stable wallet behaviour and positive trend.",
    topReason3:
      "Similar female traders in Upper West show low default in portfolio data.",
    timeToCashSeconds: 55,
    notesForAgent:
      "Great MoMo history – invite to merchant QR onboarding and SME education."
  },

  // 5. Ama – chop-bar owner, Kasoa (AMBER – Human review / KYC)
  // Latest application – defines the 'Today' reference point.
  {
    applicationId: "APP-0005",
    applicationTime: "2025-03-28 09:41:22",
    channel: "USSD",
    customerId: "C-5122",
    customerName: "Ama Tetteh",
    gender: "F",
    ageBand: "25–34",
    region: "Central",
    district: "Awutu Senya East (Kasoa)",
    segment: "Chop bar / food joint owner",
    requestedAmountGhs: 2000,
    tenureDays: 90,
    productType: "MoMo SME Booster",
    riskScore: 60,
    decisionBand: "Amber",
    decisionOutcome: "Human Review",
    expectedPd30d: 0.08,
    topReason1: "High but seasonal inflows with generally positive trend.",
    topReason2:
      "One small loan written off 18 months ago; more recent behaviour improved.",
    topReason3:
      "SIM registration / KYC status not fully up to date – identity risk to resolve.",
    timeToCashSeconds: null,
    notesForAgent:
      "Verify SIM registration and landlord reference before decision; if KYC passes, consider GHS 1,500."
  },

  // 6. Selorm – device Pick & Pay Later, Spintex (GREEN – Auto-Approve)
  // Within last 7 days to enrich the 7D view.
  {
    applicationId: "APP-0006",
    applicationTime: "2025-03-24 15:10:20",
    channel: "App",
    customerId: "C-6201",
    customerName: "Selorm Addo",
    gender: "M",
    ageBand: "25–34",
    region: "Greater Accra",
    district: "Krowor (Spintex)",
    segment: "Phone accessories & device reseller",
    requestedAmountGhs: 2500,
    tenureDays: 90,
    productType: "Device Pick & Pay Later",
    riskScore: 37,
    decisionBand: "Green",
    decisionOutcome: "Auto-Approve",
    expectedPd30d: 0.03,
    topReason1:
      "Strong MoMo inflows from device sales with clear month-on-month growth.",
    topReason2:
      "Two previous device facilities repaid on time; no current arrears.",
    topReason3:
      "Credit bureau shows low overall exposure relative to sales volume.",
    timeToCashSeconds: 49,
    notesForAgent:
      "Upsell screen-protector bundle; remind about on-time instalments keeping limit growing."
  },

  // 7. Janet – seamstress in Sunyani (AMBER – Human Review, affordability)
  // Mid-month application – appears only in 30D.
  {
    applicationId: "APP-0007",
    applicationTime: "2025-03-15 11:05:00",
    channel: "USSD",
    customerId: "C-7330",
    customerName: "Janet Owusu",
    gender: "F",
    ageBand: "25–34",
    region: "Bono",
    district: "Sunyani Municipal",
    segment: "Seamstress – school uniforms",
    requestedAmountGhs: 1500,
    tenureDays: 60,
    productType: "MoMo Working Capital",
    riskScore: 52,
    decisionBand: "Amber",
    decisionOutcome: "Human Review",
    expectedPd30d: 0.065,
    topReason1:
      "Seasonal spikes around school term; inflows rising but volatile.",
    topReason2:
      "One past facility extended by 7 days with late fee; now fully settled.",
    topReason3:
      "Household spending high vs income – confirm rent and dependants before approving full amount.",
    timeToCashSeconds: null,
    notesForAgent:
      "Call to confirm term-time orders; may approve GHS 1,000 instead of full 1,500 based on income."
  },

  // 8. Ibrahim – ride-hailing driver, Tamale (RED – Auto-Decline)
  // Earlier in month – appears in 30D only, adds another high-risk male case.
  {
    applicationId: "APP-0008",
    applicationTime: "2025-03-10 13:22:30",
    channel: "App",
    customerId: "C-8842",
    customerName: "Ibrahim Fuseini",
    gender: "M",
    ageBand: "25–34",
    region: "Northern",
    district: "Tamale Metropolitan",
    segment: "Ride-hailing / taxi driver",
    requestedAmountGhs: 1800,
    tenureDays: 45,
    productType: "Personal Micro-loan",
    riskScore: 79,
    decisionBand: "Red",
    decisionOutcome: "Auto-Decline",
    expectedPd30d: 0.14,
    topReason1:
      "Two active digital loans with high instalments relative to weekly fares.",
    topReason2:
      "Recent MoMo inflows trending down for three consecutive months.",
    topReason3:
      "Two past-due episodes of 15–20 days each in the last year.",
    timeToCashSeconds: null,
    notesForAgent:
      "Explain decline and suggest lowering other debts first; share tips on saving during peak season."
  },

  // 9. Efua – teacher in Cape Coast (GREEN – Auto-Approve, thin-file salaried)
  // Start of the month – appears in 30D, gives another low-risk female case.
  {
    applicationId: "APP-0009",
    applicationTime: "2025-03-05 08:45:18",
    channel: "USSD",
    customerId: "C-9277",
    customerName: "Efua Andoh",
    gender: "F",
    ageBand: "35–44",
    region: "Central",
    district: "Cape Coast Metropolitan",
    segment: "Public-school teacher",
    requestedAmountGhs: 600,
    tenureDays: 30,
    productType: "Personal Micro-loan",
    riskScore: 19,
    decisionBand: "Green",
    decisionOutcome: "Auto-Approve",
    expectedPd30d: 0.018,
    topReason1:
      "Stable monthly salary inflow from same employer for 5+ years.",
    topReason2:
      "Very low utilisation of existing overdraft; no other mobile loans active.",
    topReason3:
      "Expense pattern indicates room for small instalment without distress.",
    timeToCashSeconds: 39,
    notesForAgent:
      "Reassure customer that paying early improves her future limit; offer optional savings top-up."
  }
];

export const LOAN_FAIRNESS_SNAPSHOT: LoanFairnessSnapshot[] = [
  {
    snapshotDate: "2025-03-31",
    subgroupType: "Gender",
    subgroupValue: "Female",
    applications: 4800,
    approvalRate: 0.61,
    badRate30d: 0.032,
    falsePositiveRate: 0.17,
    falseNegativeRate: 0.043,
    approvalGapVsOverallPp: 0.02, // +2pp vs overall
    fprGapVsOverallPp: -0.01, // -1pp vs overall
    driftFlag: false
  },
  {
    snapshotDate: "2025-03-31",
    subgroupType: "Gender",
    subgroupValue: "Male",
    applications: 5200,
    approvalRate: 0.58,
    badRate30d: 0.031,
    falsePositiveRate: 0.18,
    falseNegativeRate: 0.042,
    approvalGapVsOverallPp: -0.01,
    fprGapVsOverallPp: 0.0,
    driftFlag: false
  },
  {
    snapshotDate: "2025-03-31",
    subgroupType: "Region",
    subgroupValue: "Greater Accra",
    applications: 3000,
    approvalRate: 0.64,
    badRate30d: 0.03,
    falsePositiveRate: 0.16,
    falseNegativeRate: 0.041,
    approvalGapVsOverallPp: 0.05,
    fprGapVsOverallPp: -0.02,
    driftFlag: false
  },
  {
    snapshotDate: "2025-03-31",
    subgroupType: "Region",
    subgroupValue: "Northern",
    applications: 1600,
    approvalRate: 0.57,
    badRate30d: 0.033,
    falsePositiveRate: 0.19,
    falseNegativeRate: 0.045,
    approvalGapVsOverallPp: -0.02,
    fprGapVsOverallPp: 0.01,
    driftFlag: false
  },
  {
    snapshotDate: "2025-03-31",
    subgroupType: "Region",
    subgroupValue: "Upper West",
    applications: 900,
    approvalRate: 0.59,
    badRate30d: 0.032,
    falsePositiveRate: 0.18,
    falseNegativeRate: 0.044,
    approvalGapVsOverallPp: 0.0,
    fprGapVsOverallPp: 0.0,
    driftFlag: false
  }
];
