// src/data/cards.ts

import type { ExplanationCard } from "../types";

export const CARDS: Record<string, ExplanationCard> = {
  "evt-akos-ussd-1": {
    eventId: "evt-akos-ussd-1",
    title: "Customer session flagged: High Social-Engineering Risk",
    subtitle: "Madam Akos · Market trader – Kejetia, Kumasi · Feature phone",
    riskCategory: "SOCIAL_ENGINEERING",
    riskScore: 0, // will be replaced in App with actual event score
    probabilityText: "Estimated 92% likelihood this is a social-engineering scam.",
    customerSegment: "Low digital literacy · Market trader · Feature-phone user",
    whyFlagged: [
      "Multiple failed PIN attempts and a long USSD session suggest the customer was being coached.",
      "First-ever transfers to 4 new wallets in coastal regions, late at night.",
      "Total sent (GHS 3,000) is 5× higher than her usual daily volume (< GHS 600).",
      "All 4 recipient wallets are linked to previous complaints and cash out quickly after receiving funds."
    ],
    keySignals: [
      { label: "Failed PIN attempts", value: "5 in 10 minutes", impact: "high" },
      { label: "Long USSD session", value: "4+ minutes", impact: "high" },
      {
        label: "New recipients",
        value: "4 first-time wallets in Accra-Teshie/Nungua & Kasoa",
        impact: "high"
      },
      {
        label: "Amount vs normal",
        value: "GHS 3,000 vs usual < GHS 600/day",
        impact: "high"
      },
      {
        label: "Network risk",
        value: "All recipients sit in existing mule network",
        impact: "high"
      }
    ],
    recommendedActions: [
      "Pause further outgoing transfers on this wallet for 1 hour.",
      "Trigger outbound call from official MTN Ghana number to confirm if the customer recognises these transfers.",
      "If confirmed fraud, block recipient wallets and reverse any un-cashed amounts where possible.",
      "Add the 4 receiving wallets and associated agents to the fraud network cluster for prioritised investigation."
    ]
  },

  "evt-issah-sim-1": {
    eventId: "evt-issah-sim-1",
    title: "Wallet flagged: SIM-Swap Takeover with Agent Collusion",
    subtitle: "Issah · Heavy MoMo user – Tamale",
    riskCategory: "SIM_SWAP",
    riskScore: 0,
    probabilityText: "Estimated 96% likelihood of SIM-swap wallet takeover.",
    customerSegment: "Salaried worker · Smartphone user · MoMo-heavy",
    whyFlagged: [
      "SIM was replaced in Walewale (~70 km away) – outside the customer’s normal Tamale usage area.",
      "Device type changed from Android smartphone to basic feature phone immediately after the SIM swap.",
      "Three large transfers were sent to a new wallet and cashed out quickly at Agent #AG-1129.",
      "Agent #AG-1129 is already associated with 9 previous fraud complaints in the last 14 days."
    ],
    keySignals: [
      {
        label: "SIM swap location",
        value: "Walewale vs historical Tamale usage",
        impact: "high"
      },
      {
        label: "Device fingerprint",
        value: "Android → feature phone post-SIM swap",
        impact: "high"
      },
      {
        label: "High-value transfers",
        value: "GHS 2,000 + 1,800 + 1,600",
        impact: "high"
      },
      {
        label: "Agent risk",
        value: "Agent #AG-1129 in 9 prior fraud cases",
        impact: "high"
      }
    ],
    recommendedActions: [
      "Freeze large cash-outs from Issah’s wallet pending verification.",
      "Call Issah on alternative contact to confirm if he performed this SIM swap.",
      "Temporarily suspend Agent #AG-1129 for high-value cash-outs and escalate to field compliance in Walewale.",
      "Add SIM, agent, and receiving wallet to the fraud network graph for deeper investigation."
    ]
  },

  "evt-qr-kasoa-1": {
    eventId: "evt-qr-kasoa-1",
    title: "Merchant flagged: High-Risk QR Mule Network",
    subtitle: "KASOA SMART ELECTRONICS · Roadside QR merchant – Kasoa-Ofaakor",
    riskCategory: "MULE_MERCHANT",
    riskScore: 0,
    probabilityText: "Estimated 89% likelihood this merchant is part of a mule network.",
    customerSegment: "New small merchant · Declared small electronics shop",
    whyFlagged: [
      "New QR merchant showing 6–7× expected turnover for a small roadside electronics shop.",
      "More than 150 different wallets pay similar amounts (GHS 300–600), most are first-time QR users.",
      "Almost all funds are moved out by nightfall to 3 specific agents and one mule hub wallet, leaving nearly zero balance.",
      "Several sender wallets have been previously flagged in sports betting / online scheme investigations."
    ],
    keySignals: [
      {
        label: "Turnover vs expected",
        value: "GHS 84,000 in 7 days vs GHS 7,000–10,000 expected",
        impact: "high"
      },
      {
        label: "Unique senders",
        value: "150+ wallets, mostly first-time QR users",
        impact: "high"
      },
      {
        label: "Balance overnight",
        value: "<5% of daily inflows retained",
        impact: "high"
      },
      {
        label: "Agent links",
        value: "3 Kasoa agents + Mule Hub #MH-99213",
        impact: "high"
      }
    ],
    recommendedActions: [
      "Limit daily inflows to this merchant and flag for onsite verification in Kasoa.",
      "Place temporary transaction caps to/from Mule Hub #MH-99213 and associated Kasoa agents.",
      "Send proactive alert to Compliance with a snapshot of this network cluster.",
      "If merchant fails verification, de-register and report to relevant authorities."
    ]
  },

  "evt-agent-ashaiman-1": {
    eventId: "evt-agent-ashaiman-1",
    title: "Agent flagged: Potential collusion hotspot",
    subtitle: "Agent #MD-219 · Ashaiman market",
    riskCategory: "AGENT_HOTSPOT",
    riskScore: 0,
    probabilityText: "Estimated 90% likelihood this agent is part of a collusive cash-out pattern.",
    customerSegment: "High-volume MoMo agent · urban market",
    whyFlagged: [
      "Five different wallets from Ashaiman and Madina reported fraud after cashing out at this agent within 40 minutes.",
      "Most customers had no prior history with this agent before the disputed transactions.",
      "Agent #MD-219 appears in more than 10 fraud-related complaints in the last 30 days.",
      "Cash-outs are clustered in evening/night hours and follow high-risk transaction patterns."
    ],
    keySignals: [
      {
        label: "Victim wallets",
        value: "5+ distinct wallets in 40 minutes",
        impact: "high"
      },
      {
        label: "Complaints (30 days)",
        value: "10+ fraud cases linked to this agent",
        impact: "high"
      },
      {
        label: "Time of day",
        value: "Evening / night cash-outs",
        impact: "medium"
      },
      {
        label: "Location cluster",
        value: "Ashaiman / Madina catchment within ~2km",
        impact: "medium"
      }
    ],
    recommendedActions: [
      "Temporarily cap high-value cash-outs at Agent #MD-219 pending field investigation.",
      "Prioritise a surprise field compliance visit to this kiosk in Ashaiman market.",
      "Review CCTV / agent onboarding KYC where available and cross-check staff links.",
      "Proactively scan for additional wallets that cashed out at this agent after high-risk events."
    ]
  },

  "evt-merchant-eastlegon-1": {
    eventId: "evt-merchant-eastlegon-1",
    title: "Merchant flagged: High-Value MoMo Merchant Surge",
    subtitle: "EAST LEGON LIFESTYLE MART · QR merchant – East Legon",
    riskCategory: "HIGH_VALUE_MERCHANT",
    riskScore: 0,
    probabilityText:
      "Estimated 88% likelihood this merchant is being used as a high-value funnel for third-party funds.",
    customerSegment: "Established urban merchant · groceries & lifestyle",
    whyFlagged: [
      "Daily MoMo turnover jumped to ~GHS 28,000 vs baseline ~GHS 4,000 for this merchant.",
      "Average ticket size increased from ~GHS 250 to ~GHS 1,800, with many GHS 3,000+ payments.",
      "Majority of new high-value senders are corporate or payroll wallets based in Accra CBD and Airport area.",
      "Over 70% of inflows are moved out within 2 hours each evening via a small set of wallets and agents."
    ],
    keySignals: [
      {
        label: "Turnover jump",
        value: "≈7× baseline daily volume",
        impact: "high"
      },
      {
        label: "Ticket size",
        value: "Avg GHS 1,800 vs previous GHS 250",
        impact: "high"
      },
      {
        label: "Corporate senders",
        value: "~65% of high-value senders",
        impact: "high"
      },
      {
        label: "Rapid cash-outs",
        value: "~75% of funds moved within 2 hours",
        impact: "high"
      }
    ],
    recommendedActions: [
      "Apply temporary daily limits for incoming MoMo payments to this merchant while verification is underway.",
      "Trigger a merchant KYC refresh and onsite visit for EAST LEGON LIFESTYLE MART.",
      "Flag associated high-value sender wallets and downstream cash-out agents for closer monitoring.",
      "If usage is confirmed legitimate, adjust risk thresholds to reduce future false positives for similar East Legon merchants."
    ]
  }
};
