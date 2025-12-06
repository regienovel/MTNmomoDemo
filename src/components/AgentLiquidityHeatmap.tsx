// src/components/AgentLiquidityHeatmap.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { LiquidityRiskBand } from "../types";
import {
  AGENT_FORECASTS,
  LIQUIDITY_SCENARIOS,
  type LiquidityScenarioId,
  type ExtendedAgentForecast
} from "../data/agentLiquidity";

/** Utility: colours and labels */

const riskBandColor: Record<LiquidityRiskBand, string> = {
  Red: "#ef4444",
  Amber: "#facc15",
  Green: "#22c55e"
};

function formatCurrency(ghs: number): string {
  return `GHS ${ghs.toLocaleString("en-GH", {
    maximumFractionDigits: 0
  })}`;
}

interface AreaGroup {
  areaId: string;
  areaLabel: string;
  agents: ExtendedAgentForecast[];
  totalShortfall: number;
}

export const AgentLiquidityHeatmap: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] =
    useState<LiquidityScenarioId>("PAYDAY");
  const [areaFilterId, setAreaFilterId] = useState<string>("ALL");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const activeScenario =
    LIQUIDITY_SCENARIOS.find(s => s.id === activeScenarioId) ??
    LIQUIDITY_SCENARIOS[0];

  // All agents for this scenario
  const scenarioAgents = useMemo(
    () => AGENT_FORECASTS.filter(a => a.scenarioId === activeScenarioId),
    [activeScenarioId]
  );

  // Group by area within the scenario
  const areaGroups = useMemo<AreaGroup[]>(() => {
    const byArea = new Map<string, AreaGroup>();

    scenarioAgents.forEach(agent => {
      const existing = byArea.get(agent.areaId);
      const shortfall = Math.max(agent.floatShortfallGhs, 0);

      if (!existing) {
        byArea.set(agent.areaId, {
          areaId: agent.areaId,
          areaLabel: agent.areaLabel,
          agents: [agent],
          totalShortfall: shortfall
        });
      } else {
        existing.agents.push(agent);
        existing.totalShortfall += shortfall;
      }
    });

    // Sort areas by total shortfall descending
    return Array.from(byArea.values()).sort(
      (a, b) => b.totalShortfall - a.totalShortfall
    );
  }, [scenarioAgents]);

  // Reset area filter when scenario changes
  useEffect(() => {
    setAreaFilterId("ALL");
  }, [activeScenarioId]);

  // Area options for dropdown
  const areaOptions = useMemo(
    () =>
      areaGroups.map(g => ({
        id: g.areaId,
        label: g.areaLabel
      })),
    [areaGroups]
  );

  // Agents actually in view (respecting area filter)
  const visibleAgents = useMemo(() => {
    if (areaFilterId === "ALL") return scenarioAgents;
    return scenarioAgents.filter(a => a.areaId === areaFilterId);
  }, [scenarioAgents, areaFilterId]);

  // Visible area groups (respecting area filter)
  const visibleAreaGroups = useMemo(() => {
    if (areaFilterId === "ALL") return areaGroups;
    return areaGroups.filter(g => g.areaId === areaFilterId);
  }, [areaGroups, areaFilterId]);

  // Defaults for selection: highest shortfall agent in view
  useEffect(() => {
    if (!visibleAgents.length) {
      setSelectedAgentId(null);
      return;
    }
    const top = [...visibleAgents].sort(
      (a, b) => b.floatShortfallGhs - a.floatShortfallGhs
    )[0];
    setSelectedAgentId(top.agentId);
  }, [activeScenarioId, areaFilterId, visibleAgents.length]);

  const selectedAgent =
    visibleAgents.find(a => a.agentId === selectedAgentId) ??
    visibleAgents[0];

  const totalShortfall = useMemo(
    () =>
      visibleAgents.reduce(
        (sum, a) => sum + (a.floatShortfallGhs > 0 ? a.floatShortfallGhs : 0),
        0
      ),
    [visibleAgents]
  );

  const scenarioDate = scenarioAgents[0]?.forecastDate ?? "";

  // Stats for legend / summary
  const riskCounts = useMemo(
    () => ({
      Red: visibleAgents.filter(a => a.riskBand === "Red").length,
      Amber: visibleAgents.filter(a => a.riskBand === "Amber").length,
      Green: visibleAgents.filter(a => a.riskBand === "Green").length
    }),
    [visibleAgents]
  );

  // Sorted for right-hand lists
  const sortedByShortfall = useMemo(
    () =>
      [...visibleAgents].sort(
        (a, b) => b.floatShortfallGhs - a.floatShortfallGhs
      ),
    [visibleAgents]
  );

  const routeOrdered = useMemo(
    () =>
      [...visibleAgents].sort(
        (a, b) => a.routeSequence - b.routeSequence
      ),
    [visibleAgents]
  );

  // Max shortfall across visible agents, for bubble sizing
  const maxAgentShortfall = useMemo(
    () =>
      Math.max(
        ...visibleAgents.map(a => Math.max(a.floatShortfallGhs, 0)),
        1
      ),
    [visibleAgents]
  );

  return (
    <div className="w-full lg:w-[90%] mx-auto bg-mtnDark/80 border border-momoBlue/60 rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold">
            MTN MoMo Agent Liquidity Heatmap (Ghana)
          </p>
          <p className="text-[10px] text-slate-400 max-w-3xl">
            Where are we likely to run short of float tomorrow? This synthetic
            demo uses Ghana-style patterns (payday, market day, ATM outages) to
            score agents Red / Amber / Green and suggest cash-rebalancing
            routes.
          </p>
        </div>
        <div className="text-[10px] text-slate-300 text-right">
          <p>
            <span className="text-slate-500">Scenario date:&nbsp;</span>
            <span>{scenarioDate || "—"}</span>
          </p>
          <p>
            <span className="text-slate-500">
              Total float shortfall in view:&nbsp;
            </span>
            <span className="text-mtnYellow font-semibold">
              {formatCurrency(totalShortfall)}
            </span>
          </p>
        </div>
      </div>

      {/* Scenario tabs */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {LIQUIDITY_SCENARIOS.map(s => {
          const active = s.id === activeScenarioId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveScenarioId(s.id)}
              className={`px-3 py-1 rounded-full border transition ${
                active
                  ? "bg-mtnYellow text-slate-950 border-mtnYellow"
                  : "bg-slate-900 text-slate-200 border-momoBlue/50 hover:border-slate-500"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Scenario description + legend line */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px]">
        <p className="text-slate-400 max-w-3xl">
          {activeScenario.description}
          <br />
          <span className="text-slate-500">
            Each row is an area/corridor (Madina corridor, Techiman town, Tamale
            CBD, etc.); dots inside are agents. Bigger, brighter dots mean
            larger forecast shortfalls.
          </span>
        </p>
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Red (likely stock-out):</span>
            <span className="text-slate-400">&nbsp;{riskCounts.Red}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>Amber (watch):</span>
            <span className="text-slate-400">&nbsp;{riskCounts.Amber}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Green (OK):</span>
            <span className="text-slate-400">&nbsp;{riskCounts.Green}</span>
          </div>
        </div>
      </div>

      {/* Main layout: lanes + right panel */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left: Area lanes & selected agent detail */}
        <section className="flex-1 flex flex-col gap-3">
          {/* Area filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Areas in this scenario:</span>
              <select
                value={areaFilterId}
                onChange={e => setAreaFilterId(e.target.value)}
                className="bg-mtnDark/90 border border-momoBlue/50 rounded-full px-3 py-1 text-[10px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-mtnYellow"
              >
                <option value="ALL">All areas (default)</option>
                {areaOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-slate-400">
              Agents in view:&nbsp;
              <span className="text-slate-100 font-medium">
                {visibleAgents.length}
              </span>
            </div>
          </div>

          {/* Area lanes visual */}
          <div className="bg-slate-950/70 rounded-xl border border-momoBlue/60 p-3 flex flex-col gap-3 min-h-[220px]">
            {visibleAreaGroups.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                No agents for this area/scenario yet.
              </p>
            ) : (
              visibleAreaGroups.map(group => {
                const { areaId, areaLabel, agents, totalShortfall } = group;
                const isFiltered = areaFilterId === "ALL" || areaFilterId === areaId;

                return (
                  <div
                    key={areaId}
                    className={`rounded-lg px-3 py-2 border transition ${
                      isFiltered
                        ? "border-momoBlue/50 bg-slate-900/80"
                        : "border-slate-900 bg-slate-950/60 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-semibold">
                          {areaLabel}
                        </span>
                        <span className="text-slate-500">
                          {agents.length} agents · shortfall{" "}
                          <span className="text-mtnYellow">
                            {formatCurrency(totalShortfall)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Lane track with agent bubbles */}
                    <div className="relative h-14 mt-1">
                      <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-900/80 border border-momoBlue/60" />
                      {agents.map((agent, idx) => {
                        const frac =
                          agents.length === 1
                            ? 0.5
                            : idx / (agents.length - 1 || 1);
                        const leftPct = 6 + frac * 88; // keep margins

                        const sizeFactor =
                          Math.max(agent.floatShortfallGhs, 0) /
                          maxAgentShortfall;
                        const radius = 4 + sizeFactor * 8;

                        const color = riskBandColor[agent.riskBand];
                        const isSelected = agent.agentId === selectedAgentId;

                        return (
                          <button
                            key={agent.agentId}
                            type="button"
                            onMouseEnter={() => setSelectedAgentId(agent.agentId)}
                            onClick={() => setSelectedAgentId(agent.agentId)}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${leftPct}%`, top: "50%" }}
                          >
                            {/* glow */}
                            <span
                              className="block rounded-full"
                              style={{
                                width: (radius + 6) * 2,
                                height: (radius + 6) * 2,
                                backgroundColor: color,
                                opacity: 0.16
                              }}
                            />
                            {/* main bubble */}
                            <span
                              className="block rounded-full -mt-[calc(50%-0.5rem)]"
                              style={{
                                width: radius * 2,
                                height: radius * 2,
                                marginTop: -(radius + 6),
                                marginLeft: 6,
                                backgroundColor: color,
                                border: isSelected
                                  ? "1.4px solid #f9fafb"
                                  : "0.8px solid #020617",
                                boxShadow: isSelected
                                  ? "0 0 0 1px rgba(250, 250, 250, 0.25)"
                                  : "none"
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}

            <div className="mt-2 text-[10px] text-slate-400 px-2 py-1 rounded-full bg-mtnDark/90 border border-momoBlue/50 self-start">
              Hover or click bubbles to inspect an agent; bigger glowing dots =
              highest shortfalls.
            </div>
          </div>

          {/* Selected agent detail */}
          {selectedAgent && (
            <div className="text-[11px] text-slate-300 mt-2">
              <p className="font-semibold text-slate-100">
                {selectedAgent.agentName} – {selectedAgent.townArea} (
                {selectedAgent.agentId})
              </p>
              <p className="text-[10px] text-slate-400">
                Region: {selectedAgent.region} · District:{" "}
                {selectedAgent.district} · Area: {selectedAgent.areaLabel} ·
                Risk:{" "}
                <span
                  className={
                    selectedAgent.riskBand === "Red"
                      ? "text-red-400"
                      : selectedAgent.riskBand === "Amber"
                      ? "text-yellow-300"
                      : "text-emerald-300"
                  }
                >
                  {selectedAgent.riskBand} ({selectedAgent.riskScore}/100)
                </span>{" "}
                · Last 30d stock-outs: {selectedAgent.last30dStockouts}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Forecast cash-out{" "}
                {formatCurrency(selectedAgent.forecastCashoutGhs)} vs starting
                float {formatCurrency(selectedAgent.startingFloatGhs)} — shortfall{" "}
                <span className="text-mtnYellow font-medium">
                  {formatCurrency(selectedAgent.floatShortfallGhs)}
                </span>
                .
              </p>
              <p className="text-[10px] text-emerald-300 mt-0.5">
                Recommendation: {selectedAgent.recommendation}
              </p>
            </div>
          )}
        </section>

        {/* Right-hand scenario panel */}
        <aside className="w-full xl:w-80 2xl:w-96 bg-mtnDark/90 rounded-xl border border-momoBlue/60 p-3 flex flex-col gap-3 text-[10px] text-slate-300">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-100">
                Scenario focus
              </p>
              <p className="text-[11px] text-slate-200">
                {activeScenario.label}
              </p>
            </div>
            <div className="px-2 py-1 rounded-full bg-slate-900 border border-momoBlue/50 text-[10px] text-slate-300">
              Agents: {visibleAgents.length} · Red: {riskCounts.Red} · Amber:{" "}
              {riskCounts.Amber}
            </div>
          </div>

          {/* Top at-risk agents list */}
          <div>
            <p className="font-semibold text-[10px] text-slate-200 mb-1">
              Top at-risk agents (by shortfall)
            </p>
            <div className="max-h-40 overflow-y-auto pr-1 space-y-2">
              {sortedByShortfall.map(agent => (
                <button
                  key={agent.agentId}
                  type="button"
                  onClick={() => setSelectedAgentId(agent.agentId)}
                  className={`w-full text-left rounded-lg px-2 py-1 border transition ${
                    agent.agentId === selectedAgentId
                      ? "bg-slate-900 border-mtnYellow/70"
                      : "bg-slate-900/60 border-momoBlue/50 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-slate-100">
                      {agent.agentName}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] border ${
                        agent.riskBand === "Red"
                          ? "bg-red-500/20 text-red-300 border-red-400/50"
                          : agent.riskBand === "Amber"
                          ? "bg-yellow-400/10 text-yellow-200 border-yellow-300/60"
                          : "bg-emerald-400/10 text-emerald-200 border-emerald-300/60"
                      }`}
                    >
                      {agent.riskBand} · {agent.riskScore}/100
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400">
                    {agent.townArea} – {agent.region} · {agent.areaLabel}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Shortfall:{" "}
                    <span className="text-mtnYellow font-medium">
                      {formatCurrency(agent.floatShortfallGhs)}
                    </span>{" "}
                    (forecast {formatCurrency(agent.forecastCashoutGhs)} vs float{" "}
                    {formatCurrency(agent.startingFloatGhs)})
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Route suggestion */}
          <div>
            <p className="font-semibold text-[10px] text-slate-200 mb-1">
              Suggested cash rebalancing route
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-[9px] text-slate-300">
              {routeOrdered.map(agent => (
                <li key={agent.agentId}>
                  {agent.agentName} ({agent.agentId}) – {agent.townArea},{" "}
                  {agent.region} –{" "}
                  <span className="text-mtnYellow">
                    add {formatCurrency(agent.floatShortfallGhs)}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-[9px] text-slate-400 mt-1">
              Simple demo route based on pre-clustered agents. In a build, this
              would sequence nearby kiosks (e.g. Comm.1 hub → Spintex Baatsona
              → Madina → Adenta) to deliver required float in one run.
            </p>
          </div>

          {/* Narrative */}
          <p className="text-[9px] text-slate-500 mt-1">
            {activeScenario.description} Demo only – numbers are synthetic but
            Ghana-realistic. Real models would use MTN agent cash-in/out
            history, float levels, payday and market-day flags, ATM uptime
            feeds, and simple route optimisation.
          </p>
        </aside>
      </div>
    </div>
  );
};
