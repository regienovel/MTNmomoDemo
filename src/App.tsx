// src/App.tsx

import React, { useMemo, useState } from "react";
import { LayoutHeader } from "./components/LayoutHeader";
import { FilterBar, type FilterKey } from "./components/FilterBar";
import { EventList } from "./components/EventList";
import { ExplanationPanel } from "./components/ExplanationPanel";
import { NetworkGraph } from "./components/NetworkGraph";
import { GhanaFraudMap } from "./components/GhanaFraudMap";

import { Tabs } from "./components/Tabs";
import { ContextStrip } from "./components/ContextStrip";
import { GuardrailsBar } from "./components/GuardrailsBar";
import {
  DecisionLogPanel,
  type DecisionLogEntry
} from "./components/DecisionLogPanel";
import { ComplaintTriage } from "./components/ComplaintTriage";
import { AgentLiquidityHeatmap } from "./components/AgentLiquidityHeatmap";
import { LoanApprover } from "./components/LoanApprover";
import { ExecutiveDashboard } from "./components/ExecutiveDashboard";

import { EVENTS } from "./data/events";
import { CARDS } from "./data/cards";
import { NETWORKS } from "./data/networks";
import type { ExplanationCard, RiskCategory } from "./types";

function mergeCardWithScore(card: ExplanationCard, score: number): ExplanationCard {
  return { ...card, riskScore: score };
}

type TabId = "executive" | "radar" | "liquidity" | "loans" | "disputes";
type RightView = "network" | "map";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("executive");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [selectedEventId, setSelectedEventId] = useState<string>(EVENTS[0].id);

  const [rightView, setRightView] = useState<RightView>("network");

  // Audit trail state
  const [showDecisionLog, setShowDecisionLog] = useState<boolean>(true);
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([]);

  // Per-category stats for interactive KPIs in the context strip
  const categoryStats = useMemo(() => {
    const base: Record<RiskCategory, number> = {
      SOCIAL_ENGINEERING: 0,
      SIM_SWAP: 0,
      MULE_MERCHANT: 0,
      AGENT_FRAUD: 0,
      AGENT_HOTSPOT: 0,
      HIGH_VALUE_MERCHANT: 0
    };
    for (const e of EVENTS) {
      base[e.riskCategory] += 1;
    }
    return base;
  }, []);

  const filteredEvents = useMemo(
    () => EVENTS.filter(e => (filter === "ALL" ? true : e.riskCategory === filter)),
    [filter]
  );

  const selectedEvent = useMemo(
    () => EVENTS.find(e => e.id === selectedEventId) ?? EVENTS[0],
    [selectedEventId]
  );

  const selectedCard = useMemo(() => {
    const baseCard = CARDS[selectedEvent.id];
    if (!baseCard) return undefined;
    return mergeCardWithScore(baseCard, selectedEvent.riskScore);
  }, [selectedEvent]);

  const selectedNetwork = NETWORKS[selectedEvent.id];

  const handleDecision = (
    decision: "pause" | "review" | "release",
    card: ExplanationCard
  ) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-GH", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const entry: DecisionLogEntry = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      eventId: card.eventId,
      eventTitle: card.title,
      decision,
      investigator: "Investigator Ama",
      timestamp
    };

    setDecisionLog(prev => [entry, ...prev].slice(0, 20));
    setShowDecisionLog(true);
    // eslint-disable-next-line no-console
    console.log("Decision logged:", entry);
  };

  return (
     <div className="min-h-screen flex flex-col bg-gradient-to-br from-mtnDark via-momoBlue to-mtnDark text-white">
      <LayoutHeader />
      <GuardrailsBar />
      <ContextStrip
        categoryStats={categoryStats}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <main className="flex-1 flex flex-col">
        {/* Tabs: Exec overview + Radar vs Liquidity vs Loans vs Disputes */}
        <div className="px-4 pt-2 pb-3 border-b border-momoBlue/70 bg-mtnDark/90">
          <Tabs
            value={activeTab}
            onChange={id => setActiveTab(id as TabId)}
            tabs={[
              { id: "executive", label: "Executive Overview" },
              { id: "radar", label: "Early Warning Radar" },
              { id: "liquidity", label: "Agent Liquidity Heatmap" },
              { id: "loans", label: "Loan Approver & Fairness" },
              { id: "disputes", label: "Dispute & Trust Cockpit" }
            ]}
          />
        </div>

        {activeTab === "executive" ? (
          <div className="flex-1 p-4">
            <ExecutiveDashboard />
          </div>
        ) : activeTab === "radar" ? (
          <>
            <div className="flex flex-1 flex-col md:flex-row">
              {/* Left: Early-Warning List */}
              <section className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-momoBlue/60 flex flex-col">
                <FilterBar filter={filter} onFilterChange={setFilter} />
                <EventList
                  events={filteredEvents}
                  selectedEventId={selectedEvent.id}
                  onSelect={setSelectedEventId}
                />
              </section>

              {/* Right: Explanation + Network / Map */}
              <section className="w-full md:w-3/5 flex flex-col gap-3 p-4">
                <ExplanationPanel card={selectedCard} onDecision={handleDecision} />

                <div className="flex justify-end gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => setRightView("network")}
                    className={`px-3 py-1 text-xs rounded-full border transition ${
                      rightView === "network"
                        ? "bg-momoBlue text-white border-mtnSunshine"
                        : "bg-mtnDark/80 text-slate-100 border-momoBlue/60 hover:bg-momoBlue/60"
                    }`}
                  >
                    Network view
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightView("map")}
                    className={`px-3 py-1 text-xs rounded-full border transition ${
                      rightView === "map"
                         ? "bg-mtnSunshine text-slate-950 border-mtnSunshine"
                        : "bg-mtnDark/80 text-slate-100 border-momoBlue/60 hover:bg-momoBlue/60"
                    }`}
                  >
                    Ghana fraud landscape
                  </button>
                </div>

                {rightView === "network" ? (
                  <NetworkGraph network={selectedNetwork} />
                ) : (
                  <GhanaFraudMap filter={filter} onFilterChange={setFilter} />
                )}
              </section>
            </div>

            {/* Decision log overlay – only on Radar tab */}
            {showDecisionLog && (
              <DecisionLogPanel
                entries={decisionLog}
                onClose={() => setShowDecisionLog(false)}
                onSelectEntry={entry => {
                  setActiveTab("radar");
                  setSelectedEventId(entry.eventId);
                }}
              />
            )}

            {!showDecisionLog && decisionLog.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDecisionLog(true)}
                className="fixed bottom-4 right-4 md:right-4 z-40 px-3 py-1 text-[11px] rounded-full bg-mtnDark/80 border border-momoBlue/50 text-slate-100 shadow-lg hover:bg-slate-800"
              >
                Show decision audit trail
              </button>
            )}
          </>
        ) : activeTab === "liquidity" ? (
          <div className="flex-1 p-4">
            <AgentLiquidityHeatmap />
          </div>
        ) : activeTab === "loans" ? (
          <div className="flex-1 p-4">
            <LoanApprover />
          </div>
        ) : (
          <div className="flex-1 p-4">
            <ComplaintTriage />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
