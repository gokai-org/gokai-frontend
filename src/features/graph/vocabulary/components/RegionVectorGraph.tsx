"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
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

type RegionVectorGraphProps = {
  nodes: FlowGraphNode[];
  edges: GraphEdge[];
  regionBounds: VocabularyRegionBounds | null;
  nodePoints: VocabularyRegionNodePoint[] | null;
  viewport: VocabularySvgViewport | null;
  level: Extract<VocabularyViewLevel, "theme" | "subtheme">;
  onNodeSelected: (node: FlowGraphNode) => void;
};

function getSymbol(node: FlowGraphNode) {
  if (node.id === "home") {
    return "戻";
  }

  return node.data.symbol || node.data.label.slice(0, 1);
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
      edgeWidth: 0.82,
      completedEdgeWidth: 1.05,
      badgeRadius: 0.82,
      badgeOffset: 2.08,
    };
  }

  return {
    homeRadius: 3.65,
    nodeRadius: 2.68,
    homeFontSize: 2.72,
    nodeFontSize: 2.12,
    textOffset: 0.7,
    edgeWidth: 0.96,
    completedEdgeWidth: 1.18,
    badgeRadius: 0.92,
    badgeOffset: 2.35,
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

export default function RegionVectorGraph({
  nodes,
  edges,
  regionBounds,
  nodePoints,
  viewport,
  level,
  onNodeSelected,
}: RegionVectorGraphProps) {
  const visualScale = useMemo(() => getVisualScale(level), [level]);
  const layout = useMemo(
    () =>
      buildRegionGraphLayout(
        nodes,
        edges,
        regionBounds,
        nodePoints,
        viewport,
        (node) => getNodeRadius(node, visualScale),
      ),
    [edges, nodePoints, nodes, regionBounds, viewport, visualScale],
  );

  if (!layout.nodes.length || !viewport) {
    return null;
  }

  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;

  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="region-graph-layer pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {layout.edges.map(({ edge, from, to }) => {
        const completed = edge.data?.status === "completed";

        return (
          <motion.path
            key={edge.id}
            d={buildRegionGraphCurve(from, to)}
            fill="none"
            stroke={completed ? "var(--accent)" : "rgba(255,255,255,0.56)"}
            strokeWidth={
              completed ? visualScale.completedEdgeWidth : visualScale.edgeWidth
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={completed ? 0.54 : 0.24}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}

      {layout.nodes.map(({ node, x, y }) => (
        <g
          key={node.id}
          data-vocabulary-node="true"
          className={
            node.data.status === "locked"
              ? "cursor-default"
              : "pointer-events-auto cursor-pointer"
          }
          transform={`translate(${x} ${y})`}
          onClick={() => onNodeSelected(node)}
          aria-label={node.data.label}
        >
          <motion.g
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={
              node.data.status === "locked" ? undefined : { scale: 1.18 }
            }
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle
              r={getNodeRadius(node, visualScale)}
              fill={getNodeFill(node)}
              stroke="rgba(255,255,255,0.32)"
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
            {node.data.isRecommendation ? (
              <circle
                cx={visualScale.badgeOffset}
                cy={-visualScale.badgeOffset}
                r={visualScale.badgeRadius}
                fill="white"
                stroke="var(--accent)"
                strokeWidth={0.4}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </motion.g>
        </g>
      ))}
    </motion.svg>
  );
}
