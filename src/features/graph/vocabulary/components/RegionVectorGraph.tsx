"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import type {
  GraphEdge,
  GraphNode as FlowGraphNode,
} from "@/features/graph/lib/graphTypes";
import type {
  VocabularyRegionBounds,
  VocabularyRegionNodePoint,
  VocabularyViewLevel,
  VocabularySvgViewport,
} from "../types";
import {
  buildRegionGraphCurve,
  buildRegionGraphLayout,
} from "../lib/regionGraphLayout";
import {
  VocabularyGraphLabel,
  VocabularyGraphVisualDefs,
} from "./VocabularyGraphLabel";

const regionVectorLayoutCache = new Map<string, ReturnType<typeof buildRegionGraphLayout>>();

type RegionVectorGraphProps = {
  nodes: FlowGraphNode[];
  edges: GraphEdge[];
  regionBounds: VocabularyRegionBounds | null;
  nodePoints: VocabularyRegionNodePoint[] | null;
  viewport: VocabularySvgViewport | null;
  level: Extract<VocabularyViewLevel, "theme" | "subtheme">;
  interactionDisabled?: boolean;
  onNodeSelected: (node: FlowGraphNode) => void;
};

function getSymbol(node: FlowGraphNode) {
  if (node.id === "home") {
    return "戻";
  }

  return node.data.symbol || node.data.label.slice(0, 1);
}

function getNodeLabel(node: FlowGraphNode) {
  if (node.id === "home") {
    return "Inicio";
  }

  return node.data.displayLabel || node.data.description || node.data.label;
}

function formatNodeLabel(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 12 ? `${trimmed.slice(0, 10)}...` : trimmed;
}

function getVisualScale(
  level: Extract<VocabularyViewLevel, "theme" | "subtheme">,
) {
  if (level === "subtheme") {
    return {
      homeRadius: 3.25,
      nodeRadius: 2.32,
      homeFontSize: 2.45,
      nodeFontSize: 1.9,
      textOffset: 0.62,
      edgeWidth: 0.94,
      completedEdgeWidth: 1.08,
      labelOffset: 3.28,
      labelWidth: 7.7,
      labelHeight: 1.56,
      labelFontSize: 0.68,
      labelRadius: 0.78,
    };
  }

  return {
    homeRadius: 3.65,
    nodeRadius: 2.68,
    homeFontSize: 2.72,
    nodeFontSize: 2.12,
    textOffset: 0.7,
    edgeWidth: 1,
    completedEdgeWidth: 1.12,
    labelOffset: 3.52,
    labelWidth: 8.2,
    labelHeight: 1.68,
    labelFontSize: 0.72,
    labelRadius: 0.84,
  };
}

function getNodeFill(node: FlowGraphNode) {
  if (node.data.status === "locked") {
    return "var(--surface-tertiary)";
  }

  if (node.data.isRecommendation) {
    return "var(--accent-hover)";
  }

  return "var(--accent)";
}

function getNodeRadius(
  node: FlowGraphNode,
  visualScale: ReturnType<typeof getVisualScale>,
) {
  return node.id === "home" ? visualScale.homeRadius : visualScale.nodeRadius;
}

function getRegionVectorLayoutCacheKey(
  nodes: FlowGraphNode[],
  edges: GraphEdge[],
  regionBounds: VocabularyRegionBounds | null,
  nodePoints: VocabularyRegionNodePoint[] | null,
  viewport: VocabularySvgViewport | null,
  level: Extract<VocabularyViewLevel, "theme" | "subtheme">,
) {
  const boundsKey = regionBounds
    ? [
        regionBounds.x.toFixed(2),
        regionBounds.y.toFixed(2),
        regionBounds.width.toFixed(2),
        regionBounds.height.toFixed(2),
      ].join(":")
    : "no-bounds";
  const viewportKey = viewport
    ? [
        viewport.x.toFixed(2),
        viewport.y.toFixed(2),
        viewport.width.toFixed(2),
        viewport.height.toFixed(2),
      ].join(":")
    : "no-viewport";
  const nodePointKey = (nodePoints ?? [])
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join("|");
  const nodeKey = nodes
    .map((node) => `${node.id}:${node.position.x},${node.position.y}:${node.data.status ?? ""}`)
    .join("|");
  const edgeKey = edges.map((edge) => `${edge.id}:${edge.source}->${edge.target}`).join("|");

  return `${level}::${boundsKey}::${viewportKey}::${nodePointKey}::${nodeKey}::${edgeKey}`;
}

const VOCAB_VECTOR_HOVER_STYLE = `
  .vocab-node-hover { transition: filter 140ms ease-out, opacity 140ms ease-out; }
  g[data-vocabulary-node="true"]:hover .vocab-node-hover circle { filter: brightness(1.12); }
`;

function RegionVectorGraph({
  nodes,
  edges,
  regionBounds,
  nodePoints,
  viewport,
  level,
  interactionDisabled = false,
  onNodeSelected,
}: RegionVectorGraphProps) {
  const platformMotion = usePlatformMotion();
  const visualScale = useMemo(() => getVisualScale(level), [level]);
  const layoutCacheKey = useMemo(
    () =>
      getRegionVectorLayoutCacheKey(
        nodes,
        edges,
        regionBounds,
        nodePoints,
        viewport,
        level,
      ),
    [edges, level, nodePoints, nodes, regionBounds, viewport],
  );
  const layout = useMemo(() => {
    const cachedLayout = regionVectorLayoutCache.get(layoutCacheKey);

    if (cachedLayout) {
      return cachedLayout;
    }

    const nextLayout = buildRegionGraphLayout(
      nodes,
      edges,
      regionBounds,
      nodePoints,
      viewport,
      (node) => getNodeRadius(node, visualScale),
    );

    regionVectorLayoutCache.set(layoutCacheKey, nextLayout);
    return nextLayout;
  }, [edges, layoutCacheKey, nodePoints, nodes, regionBounds, viewport, visualScale]);

  const svgInitial = !platformMotion.shouldAnimate
    ? false
    : { opacity: 0 };
  const svgAnimate = platformMotion.shouldAnimate
    ? { opacity: 1 }
    : undefined;
  const svgTransition = platformMotion.shouldAnimate
    ? {
        duration:
          (platformMotion.shouldUseLightAnimations ? 0.1 : 0.16) *
          platformMotion.durationScale,
        ease: [0.22, 1, 0.36, 1] as const,
      }
    : undefined;
  const edgeElements = useMemo(() => {
    return layout.edges.map(({ edge, from, to }) => {
      const completed = edge.data?.status === "completed";
      const curve = buildRegionGraphCurve(from, to);

      return (
        <g key={edge.id}>
          <path
            d={curve}
            fill="none"
            stroke={
              completed
                ? "var(--vocabulary-edge-shadow-completed)"
                : "var(--vocabulary-edge-shadow)"
            }
            strokeWidth={(completed ? visualScale.completedEdgeWidth : visualScale.edgeWidth) + 0.72}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.92}
          />
          <path
            d={curve}
            fill="none"
            stroke={
              completed
                ? "var(--vocabulary-edge-completed)"
                : "var(--vocabulary-edge-default)"
            }
            strokeWidth={
              completed ? visualScale.completedEdgeWidth : visualScale.edgeWidth
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.98}
          />
        </g>
      );
    });
  }, [
    layout.edges,
    visualScale.completedEdgeWidth,
    visualScale.edgeWidth,
  ]);
  const hoverEnabled = platformMotion.shouldUseHoverAnimations;
  if (!layout.nodes.length || !viewport) {
    return null;
  }

  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;

  return (
    <motion.svg
      initial={svgInitial}
      animate={svgAnimate}
      exit={platformMotion.shouldAnimate ? { opacity: 0 } : undefined}
      transition={svgTransition}
      className="region-graph-layer pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible [--vocabulary-edge-shadow:#2E26211F] [--vocabulary-edge-shadow-completed:#A73D3730] [--vocabulary-edge-default:#6D625BA8] [--vocabulary-edge-completed:#B54842E0] [--vocabulary-node-stroke:#2D251F30] [--vocabulary-label-fill:var(--surface-elevated)] [--vocabulary-label-border:var(--border-primary)] [--vocabulary-label-inner-border:rgba(255,255,255,0.55)] [--vocabulary-label-highlight:rgba(255,255,255,0.55)] [--vocabulary-label-text:var(--content-primary)] dark:[--vocabulary-edge-shadow:#00000036] dark:[--vocabulary-edge-shadow-completed:#A33C363A] dark:[--vocabulary-edge-default:#ECE4DD66] dark:[--vocabulary-edge-completed:#D9625CDE] dark:[--vocabulary-node-stroke:#FFFFFF52] dark:[--vocabulary-label-fill:var(--surface-secondary)] dark:[--vocabulary-label-border:rgba(255,255,255,0.12)] dark:[--vocabulary-label-inner-border:rgba(255,255,255,0.04)] dark:[--vocabulary-label-highlight:rgba(255,255,255,0.04)] dark:[--vocabulary-label-text:#F5F0EB]"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <VocabularyGraphVisualDefs idPrefix="vocabulary-vector" />
      <style>{VOCAB_VECTOR_HOVER_STYLE}</style>

      {edgeElements}

      {layout.nodes.map(({ node, x, y }) => {
        const label = formatNodeLabel(getNodeLabel(node));
        const nodeRadius = getNodeRadius(node, visualScale);
        const nodeFill = getNodeFill(node);

        return (
          <g
            key={node.id}
            data-vocabulary-node="true"
            className={
              node.data.status === "locked"
                ? "cursor-default"
                : interactionDisabled
                  ? "cursor-progress"
                  : "pointer-events-auto cursor-pointer"
            }
            transform={`translate(${x} ${y})`}
            onClick={() => {
              if (node.data.status === "locked" || interactionDisabled) {
                return;
              }

              onNodeSelected(node);
            }}
            aria-label={node.data.label}
          >
            <VocabularyGraphLabel
              idPrefix="vocabulary-vector"
              text={label}
              y={visualScale.labelOffset}
              width={visualScale.labelWidth}
              height={visualScale.labelHeight}
              radius={visualScale.labelRadius}
              fontSize={visualScale.labelFontSize}
            />

            <g
              className={
                hoverEnabled && node.data.status !== "locked"
                  ? "vocab-node-hover"
                  : undefined
              }
            >
              <circle
                r={nodeRadius}
                fill={nodeFill}
                stroke="var(--vocabulary-node-stroke)"
                strokeWidth={node.id === "home" ? 0.82 : 0.72}
                vectorEffect="non-scaling-stroke"
              />
              <text
                y={visualScale.textOffset}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={
                  node.id === "home"
                    ? visualScale.homeFontSize
                    : visualScale.nodeFontSize
                }
                fontWeight={900}
                style={{ pointerEvents: "none" }}
              >
                {getSymbol(node).slice(0, 2)}
              </text>
            </g>
          </g>
        );
      })}
    </motion.svg>
  );
}

RegionVectorGraph.displayName = "RegionVectorGraph";

export default memo(RegionVectorGraph);
