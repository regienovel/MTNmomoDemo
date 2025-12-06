// src/components/NetworkGraph.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph-2d";

import type { NetworkData } from "../data/networks";
import type { NetworkNode } from "../types";

interface Props {
  network: NetworkData | undefined;
}

/**
 * Helper: color nodes by type + risk.
 */
function nodeColor(node: NetworkNode): string {
  if (node.riskLevel === "high") {
    if (node.type === "AGENT" || node.type === "MERCHANT") return "#f97316"; // orange
    return "#ef4444"; // red
  }
  if (node.riskLevel === "medium") return "#facc15"; // yellow
  return "#22c55e"; // green
}

function nodeLabel(node: NetworkNode): string {
  return node.name;
}

/**
 * Optional: check if a node is reused in multiple alerts.
 * This will draw a halo if any of these fields indicate >1 alert.
 *
 * Supported patterns:
 *   - node.alertCount: number
 *   - node.alertIds: string[]
 *   - node.seenIn: string[]
 */
function isReusedAcrossAlerts(
  node: NetworkNode
): { reused: boolean; count: number } {
  const anyNode = node as any;
  let count = 1;

  if (typeof anyNode.alertCount === "number") {
    count = anyNode.alertCount;
  } else if (Array.isArray(anyNode.alertIds)) {
    count = anyNode.alertIds.length;
  } else if (Array.isArray(anyNode.seenIn)) {
    count = anyNode.seenIn.length;
  }

  return { reused: count > 1, count };
}

const typeNiceLabel: Record<string, string> = {
  AGENT: "Agents",
  MERCHANT: "Merchants",
  WALLET: "Wallets",
  CUSTOMER: "Customers",
  SIM: "SIMs"
};

export const NetworkGraph: React.FC<Props> = ({ network }) => {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [focusedNode, setFocusedNode] = useState<NetworkNode | null>(null);
  const [hoverNode, setHoverNode] = useState<NetworkNode | null>(null);

  // Time slider state: which "step" (link index) is currently visible.
  const [timeStep, setTimeStep] = useState<number>(0);

  // Node type filter (e.g. show/hide SIMs etc.).
  const [enabledTypes, setEnabledTypes] = useState<string[]>([]);

  // Measured canvas size so the graph fits the card instead of the full window.
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 }
  );

  // Keep the canvas size in sync with the card size.
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Derived graph data – we sort links by timestamp (if present)
  // and attach a __step index used by the time slider.
  const graphData = useMemo(() => {
    if (!network) return { nodes: [], links: [] as any[] };

    const sortedLinks = network.links
      .slice()
      .sort((a: any, b: any) => {
        const ta = a.timestamp ?? 0;
        const tb = b.timestamp ?? 0;
        return ta - tb;
      })
      .map((link, idx) => ({
        ...(link as any),
        __step: idx
      }));

    return {
      nodes: network.nodes,
      links: sortedLinks
    };
  }, [network]);

  const maxStep = useMemo(
    () =>
      graphData.links.length
        ? Math.max(...(graphData.links as any[]).map(l => l.__step ?? 0))
        : 0,
    [graphData.links]
  );

  // Whenever network changes, set defaults for filters + slider + focus.
  useEffect(() => {
    if (!network) return;

    // Default time slider all the way to the most recent transfer.
    setTimeStep(maxStep);

    // Enable all node types initially.
    const types = Array.from(new Set(network.nodes.map(n => n.type)));
    setEnabledTypes(types);

    // Auto-focus a central node (agent/merchant if present).
    const central =
      network.nodes.find(
        n => n.type === "AGENT" || n.type === "MERCHANT"
      ) ?? network.nodes[0];
    setFocusedNode(central ?? null);
  }, [network, maxStep]);

  // Once we know canvas size + have data, centre the graph.
  useEffect(() => {
    if (!network) return;
    if (!fgRef.current) return;
    if (!dimensions.width || !dimensions.height) return;

    fgRef.current.zoomToFit(400, 40);
  }, [network, dimensions.width, dimensions.height]);

  // Map nodeId -> node for quick lookups.
  const nodeById = useMemo(() => {
    const map = new Map<string, NetworkNode>();
    if (!network) return map;
    network.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [network]);

  const enabledTypeSet = useMemo(
    () => new Set(enabledTypes),
    [enabledTypes]
  );

  // Build adjacency map for neighbour highlighting, respecting time slider.
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    if (!network) return map;

    network.nodes.forEach(n => map.set(n.id, new Set<string>()));

    (graphData.links as any[]).forEach(link => {
      const step = link.__step ?? 0;
      if (step > timeStep) return;

      const src =
        typeof link.source === "string"
          ? link.source
          : (link.source as NetworkNode).id;
      const tgt =
        typeof link.target === "string"
          ? link.target
          : (link.target as NetworkNode).id;

      if (!map.has(src)) map.set(src, new Set<string>());
      if (!map.has(tgt)) map.set(tgt, new Set<string>());

      map.get(src)!.add(tgt);
      map.get(tgt)!.add(src);
    });

    return map;
  }, [network, graphData.links, timeStep]);

  // Active node set = hovered node (if any) else focused node + neighbours.
  const activeNodeIds = useMemo(() => {
    const ids = new Set<string>();
    const base = hoverNode ?? focusedNode;
    if (!base) return ids;

    ids.add(base.id);
    const neighbours = adjacency.get(base.id);
    neighbours?.forEach(id => ids.add(id));
    return ids;
  }, [adjacency, focusedNode, hoverNode]);

  if (!network) {
    return (
      <div className="bg-slate-900/80 border border-momoBlue/60 rounded-2xl p-4 text-xs text-slate-400">
        No network data.
      </div>
    );
  }

  const getNodeById = (id: string): NetworkNode | undefined =>
    nodeById.get(id);

  const focusedNeighbours = focusedNode
    ? Array.from(adjacency.get(focusedNode.id) ?? []).map(
        id => getNodeById(id)?.name
      )
    : [];

  const allTypes = Array.from(new Set(network.nodes.map(n => n.type)));

  const toggleType = (type: string) => {
    setEnabledTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const isLinkWithinTime = (link: any) =>
    (link.__step ?? 0) <= timeStep;

  return (
    <div className="bg-slate-900/80 border border-momoBlue/60 rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold">Network view</p>
          <p className="text-[10px] text-slate-400">
            Agents, wallets, merchants and SIMs linked to this alert. Hover to
            see neighbours, click to hold focus.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>
            Nodes: {network.nodes.length} · Links: {network.links.length}
          </span>
          <button
            type="button"
            className="px-2 py-0.5 rounded-full border border-momoBlue/50 bg-slate-900/70 text-[10px] hover:bg-slate-800"
            onClick={() => {
              setTimeStep(maxStep);
              fgRef.current?.zoomToFit(400, 40);
            }}
          >
            Reset view
          </button>
        </div>
      </div>

      {/* Controls: type filters + time slider */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px]">
        {/* Node type filter pills */}
        <div className="flex flex-wrap gap-1">
          {allTypes.map(type => {
            const enabled = enabledTypeSet.has(type);
            const label = typeNiceLabel[type] ?? type.toLowerCase();
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`px-2 py-0.5 rounded-full border transition ${
                  enabled
                    ? "bg-slate-900 text-slate-100 border-slate-600 hover:border-mtnYellow"
                    : "bg-slate-950 text-slate-500 border-momoBlue/60 hover:border-slate-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Time slider */}
        {maxStep > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 shrink-0">Time</span>
            <input
              type="range"
              min={0}
              max={maxStep}
              value={timeStep}
              onChange={e => setTimeStep(Number(e.target.value))}
              className="w-36 accent-mtnYellow"
            />
            <span className="text-slate-400 shrink-0">
              {(timeStep ?? 0) + 1}/{maxStep + 1}
            </span>
          </div>
        )}
      </div>

      {/* Graph – 30% taller & sized to the card, not the window */}
      <div
        ref={containerRef}
        className="bg-slate-950/70 rounded-xl overflow-hidden h-72 md:h-80 lg:h-96 w-full"
      >
        <ForceGraph2D
          ref={fgRef as any}
          graphData={graphData}
          width={dimensions.width || undefined}
          height={dimensions.height || undefined}
          nodeLabel={nodeLabel as any}
          onNodeHover={node => setHoverNode((node as NetworkNode) || null)}
          onNodeClick={node => setFocusedNode(node as NetworkNode)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n = node as unknown as NetworkNode;
            const typeVisible = enabledTypeSet.has(n.type);
            if (!typeVisible) return;

            const isActive =
              activeNodeIds.size === 0 || activeNodeIds.has(n.id);

            const baseRadius = 4;
            const radius =
              n.type === "AGENT" || n.type === "MERCHANT"
                ? baseRadius + 2
                : baseRadius;

            const opacity = isActive ? 1 : 0.25;

            const { reused, count } = isReusedAcrossAlerts(n);

            ctx.save();
            ctx.globalAlpha = opacity;

            // Optional halo for cross-alert reuse
            if (reused) {
              const haloRadius = radius + 4;
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, haloRadius, 0, 2 * Math.PI, false);
              ctx.strokeStyle = "rgba(56, 189, 248, 0.6)"; // cyan halo
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            // Main circle
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = nodeColor(n);
            ctx.fill();
            ctx.lineWidth = isActive ? 1 : 0.5;
            ctx.strokeStyle = isActive ? "#fbbf24" : "#0f172a";
            ctx.stroke();

            // Label
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#e2e8f0";
            const label = reused ? `${n.name} (${count})` : n.name;
            ctx.fillText(label, node.x! + radius + 2, node.y!);
            ctx.restore();
          }}
          linkColor={link => {
            const srcId =
              typeof link.source === "string"
                ? (link.source as string)
                : (link.source as NetworkNode).id;
            const tgtId =
              typeof link.target === "string"
                ? (link.target as string)
                : (link.target as NetworkNode).id;

            const srcNode = nodeById.get(srcId);
            const tgtNode = nodeById.get(tgtId);

            const srcVisible = srcNode && enabledTypeSet.has(srcNode.type);
            const tgtVisible = tgtNode && enabledTypeSet.has(tgtNode.type);
            const typeVisible = srcVisible && tgtVisible;

            const withinTime = isLinkWithinTime(link as any);
            if (!typeVisible || !withinTime) {
              return "rgba(30, 41, 59, 0.15)"; // very faint
            }

            const isHighlighted =
              activeNodeIds.size === 0 ||
              (activeNodeIds.has(srcId) && activeNodeIds.has(tgtId));

            return isHighlighted
              ? "rgba(148, 163, 184, 0.95)"
              : "rgba(71, 85, 105, 0.5)";
          }}
          linkWidth={link => {
            const srcId =
              typeof link.source === "string"
                ? (link.source as string)
                : (link.source as NetworkNode).id;
            const tgtId =
              typeof link.target === "string"
                ? (link.target as string)
                : (link.target as NetworkNode).id;

            const srcNode = nodeById.get(srcId);
            const tgtNode = nodeById.get(tgtId);

            const srcVisible = srcNode && enabledTypeSet.has(srcNode.type);
            const tgtVisible = tgtNode && enabledTypeSet.has(tgtNode.type);
            const typeVisible = srcVisible && tgtVisible;

            const withinTime = isLinkWithinTime(link as any);
            if (!typeVisible || !withinTime) return 0.3;

            const isHighlighted =
              activeNodeIds.size === 0 ||
              (activeNodeIds.has(srcId) && activeNodeIds.has(tgtId));

            return isHighlighted ? 2 : 0.8;
          }}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={0.9}
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={(link, ctx, globalScale) => {
            const label = (link as any).label as string | undefined;
            if (!label) return;

            const src = link.source as any;
            const tgt = link.target as any;
            if (typeof src.x !== "number" || typeof tgt.x !== "number") return;

            const srcId =
              typeof link.source === "string"
                ? (link.source as string)
                : (link.source as NetworkNode).id;
            const tgtId =
              typeof link.target === "string"
                ? (link.target as string)
                : (link.target as NetworkNode).id;

            const srcNode = nodeById.get(srcId);
            const tgtNode = nodeById.get(tgtId);
            const srcVisible = srcNode && enabledTypeSet.has(srcNode.type);
            const tgtVisible = tgtNode && enabledTypeSet.has(tgtNode.type);
            const typeVisible = srcVisible && tgtVisible;
            const withinTime = isLinkWithinTime(link as any);

            if (!typeVisible || !withinTime) return;

            const isHighlighted =
              activeNodeIds.size === 0 ||
              (activeNodeIds.has(srcId) && activeNodeIds.has(tgtId));
            if (!isHighlighted) return;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            const fontSize = 9 / globalScale;
            ctx.save();
            ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
            ctx.fillStyle = "rgba(148, 163, 184, 0.95)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, midX, midY);
            ctx.restore();
          }}
          cooldownTicks={50}
        />
      </div>

      {/* Node details / narrative */}
      <div className="flex flex-wrap items-start justify-between gap-3 text-[11px] text-slate-300">
        <div>
          <p className="text-[11px] font-semibold text-slate-100">
            {focusedNode ? focusedNode.name : "Click a node to inspect it"}
          </p>
          {focusedNode && (
            <>
              <p className="text-[10px] text-slate-400">
                Type: {focusedNode.type.toLowerCase()} · Risk level:{" "}
                {focusedNode.riskLevel}
              </p>
              {(() => {
                const { reused, count } = isReusedAcrossAlerts(focusedNode);
                if (!reused) return null;
                return (
                  <p className="text-[10px] text-cyan-300 mt-0.5">
                    Reused in ~{count} alerts (possible mule / shared entity).
                  </p>
                );
              })()}
              {focusedNeighbours.length > 0 && (
                <p className="mt-1 text-[10px] text-slate-400">
                  Directly connected to:{" "}
                  <span className="text-slate-200">
                    {focusedNeighbours.filter(Boolean).join(", ")}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
        <p className="max-w-xs text-[10px] text-slate-400">
          Narrative: use the{" "}
          <span className="text-slate-200">
            time slider to replay the transfers
          </span>{" "}
          and the{" "}
          <span className="text-slate-200">
            type filters to isolate agents, merchants or SIMs
          </span>
          . Haloed nodes show entities reused across multiple alerts.
        </p>
      </div>
    </div>
  );
};
