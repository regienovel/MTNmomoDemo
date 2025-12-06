// src/data/networks.ts

import type { NetworkNode, NetworkLink } from "../types";

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export const NETWORKS: Record<string, NetworkData> = {
  "evt-akos-ussd-1": {
    nodes: [
      {
        id: "C-104392",
        name: "Madam Akos · Wallet",
        type: "WALLET",
        riskLevel: "high",
        // Seen in multiple social-engineering alerts in this demo
        alertIds: ["evt-akos-ussd-1", "evt-qr-kasoa-1"],
        alertCount: 2
      },
      {
        id: "MULE-1",
        name: "Recipient #1 · Accra-Teshie",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "MULE-2",
        name: "Recipient #2 · Nungua",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "MULE-3",
        name: "Recipient #3 · Kasoa",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "MULE-4",
        name: "Recipient #4 · Kasoa",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "AGENT-MADINA-1",
        name: "High-risk Agent · Madina market",
        type: "AGENT",
        riskLevel: "high",
        // This agent also pops up in other alerts, so show a halo
        alertIds: ["evt-akos-ussd-1", "evt-agent-ashaiman-1"],
        alertCount: 2
      }
    ],
    // Timestamps here are simple “steps” to drive the time slider
    links: [
      { source: "C-104392", target: "MULE-1", label: "GHS 800", timestamp: 1 },
      { source: "C-104392", target: "MULE-2", label: "GHS 900", timestamp: 2 },
      { source: "C-104392", target: "MULE-3", label: "GHS 700", timestamp: 3 },
      { source: "C-104392", target: "MULE-4", label: "GHS 600", timestamp: 4 },
      { source: "MULE-1", target: "AGENT-MADINA-1", label: "Cash-out", timestamp: 5 },
      { source: "MULE-2", target: "AGENT-MADINA-1", label: "Cash-out", timestamp: 6 },
      { source: "MULE-3", target: "AGENT-MADINA-1", label: "Cash-out", timestamp: 7 },
      { source: "MULE-4", target: "AGENT-MADINA-1", label: "Cash-out", timestamp: 8 }
    ]
  },

  "evt-issah-sim-1": {
    nodes: [
      {
        id: "C-208771",
        name: "Issah · Wallet",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "SIM-NEW",
        name: "New SIM · Walewale",
        type: "SIM",
        riskLevel: "high"
      },
      {
        id: "M-55382",
        name: "Mule #M-55382",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "AG-1129",
        name: "Agent #AG-1129 · Walewale lorry station",
        type: "AGENT",
        riskLevel: "high",
        // Example of an agent seen in more than one complaint
        alertIds: ["evt-issah-sim-1", "evt-agent-ashaiman-1"],
        alertCount: 2
      }
    ],
    links: [
      { source: "C-208771", target: "SIM-NEW", label: "SIM swap", timestamp: 1 },
      {
        source: "C-208771",
        target: "M-55382",
        label: "GHS 2,000 + 1,800 + 1,600",
        timestamp: 2
      },
      {
        source: "M-55382",
        target: "AG-1129",
        label: "3 cash-outs in 20 mins",
        timestamp: 3
      }
    ]
  },

  "evt-qr-kasoa-1": {
    nodes: [
      {
        id: "QR-78421",
        name: "Kasoa Smart Electronics · Merchant",
        type: "MERCHANT",
        riskLevel: "high",
        // High-risk merchant also seen in other alerts
        alertIds: ["evt-qr-kasoa-1", "evt-akos-ussd-1", "evt-merchant-eastlegon-1"],
        alertCount: 3
      },
      {
        id: "MH-99213",
        name: "Mule Hub #MH-99213",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "KS-211",
        name: "Agent #KS-211 · Kasoa",
        type: "AGENT",
        riskLevel: "high"
      },
      {
        id: "KS-330",
        name: "Agent #KS-330 · Kasoa",
        type: "AGENT",
        riskLevel: "high"
      },
      {
        id: "KS-089",
        name: "Agent #KS-089 · Kasoa",
        type: "AGENT",
        riskLevel: "high"
      },
      {
        id: "SENDER-CLUSTER",
        name: "150+ sender wallets (Madina, Lapaz, Circle, Tema)",
        type: "WALLET",
        riskLevel: "medium"
      }
    ],
    links: [
      {
        source: "SENDER-CLUSTER",
        target: "QR-78421",
        label: "210 QR payments · GHS 84k",
        timestamp: 1
      },
      { source: "QR-78421", target: "KS-211", label: "Cash-outs", timestamp: 2 },
      { source: "QR-78421", target: "KS-330", label: "Cash-outs", timestamp: 3 },
      { source: "QR-78421", target: "KS-089", label: "Cash-outs", timestamp: 4 },
      {
        source: "QR-78421",
        target: "MH-99213",
        label: "Transfers to mule hub",
        timestamp: 5
      }
    ]
  },

  "evt-agent-ashaiman-1": {
    nodes: [
      {
        id: "AG-MD-219",
        name: "Agent #MD-219 · Ashaiman market",
        type: "AGENT",
        riskLevel: "high",
        // Reused agent across several complaints
        alertIds: ["evt-agent-ashaiman-1", "evt-issah-sim-1"],
        alertCount: 2
      },
      {
        id: "WALLET-A1",
        name: "Victim wallet #A1 · Ashaiman",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "WALLET-A2",
        name: "Victim wallet #A2 · Ashaiman",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "WALLET-M1",
        name: "Victim wallet #M1 · Madina",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "WALLET-M2",
        name: "Victim wallet #M2 · Madina",
        type: "WALLET",
        riskLevel: "high"
      },
      {
        id: "WALLET-O1",
        name: "Victim wallet #O1 · Odorkor",
        type: "WALLET",
        riskLevel: "high"
      }
    ],
    links: [
      {
        source: "WALLET-A1",
        target: "AG-MD-219",
        label: "Cash-out · GHS 1,200",
        timestamp: 1
      },
      {
        source: "WALLET-A2",
        target: "AG-MD-219",
        label: "Cash-out · GHS 900",
        timestamp: 2
      },
      {
        source: "WALLET-M1",
        target: "AG-MD-219",
        label: "Cash-out · GHS 2,300",
        timestamp: 3
      },
      {
        source: "WALLET-M2",
        target: "AG-MD-219",
        label: "Cash-out · GHS 1,700",
        timestamp: 4
      },
      {
        source: "WALLET-O1",
        target: "AG-MD-219",
        label: "Cash-out · GHS 800",
        timestamp: 5
      }
    ]
  },

  "evt-merchant-eastlegon-1": {
    nodes: [
      {
        id: "HV-99201",
        name: "East Legon Lifestyle Mart · Merchant",
        type: "MERCHANT",
        riskLevel: "high",
        // High-value merchant seen in more than one investigation
        alertIds: ["evt-merchant-eastlegon-1", "evt-qr-kasoa-1"],
        alertCount: 2
      },
      {
        id: "CORP-ACCRA-1",
        name: "Corporate wallet · Airport area",
        type: "WALLET",
        riskLevel: "medium"
      },
      {
        id: "CORP-ACCRA-2",
        name: "Corporate wallet · Ridge",
        type: "WALLET",
        riskLevel: "medium"
      },
      {
        id: "SME-EAST-1",
        name: "SME wallet · East Legon",
        type: "WALLET",
        riskLevel: "medium"
      },
      {
        id: "AG-EL-01",
        name: "Agent #EL-01 · East Legon",
        type: "AGENT",
        riskLevel: "high"
      },
      {
        id: "AG-SP-12",
        name: "Agent #SP-12 · Spintex",
        type: "AGENT",
        riskLevel: "high"
      }
    ],
    links: [
      {
        source: "CORP-ACCRA-1",
        target: "HV-99201",
        label: "High-value QR payments",
        timestamp: 1
      },
      {
        source: "CORP-ACCRA-2",
        target: "HV-99201",
        label: "High-value QR payments",
        timestamp: 2
      },
      {
        source: "SME-EAST-1",
        target: "HV-99201",
        label: "QR payments",
        timestamp: 3
      },
      {
        source: "HV-99201",
        target: "AG-EL-01",
        label: "Evening cash-outs",
        timestamp: 4
      },
      {
        source: "HV-99201",
        target: "AG-SP-12",
        label: "Bulk cash-outs",
        timestamp: 5
      }
    ]
  }
};
