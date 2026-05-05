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

type RegionVectorGraphProps = {
  nodes: FlowGraphNode[];
  edges: GraphEdge[];
  regionBounds: VocabularyRegionBounds | null;
  nodePoints: VocabularyRegionNodePoint[] | null;
  viewport: VocabularySvgViewport | null;
  level: Extract<VocabularyViewLevel, "theme" | "subtheme">;
  loadingNodeId?: string | null;
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

function RegionVectorGraph({
  nodes,
  edges,
  regionBounds,
  nodePoints,
  viewport,
  level,
  loadingNodeId = null,
  interactionDisabled = false,
  onNodeSelected,
}: RegionVectorGraphProps) {
  const platformMotion = usePlatformMotion();
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

  const svgInitial = !platformMotion.shouldAnimate
    ? false
    : platformMotion.shouldUseLightAnimations
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.98 };
  const svgAnimate = platformMotion.shouldAnimate
    ? { opacity: 1, scale: 1 }
    : undefined;
  const svgTransition = platformMotion.shouldAnimate
    ? {
        duration:
          (platformMotion.shouldUseLightAnimations ? 0.1 : 0.16) *
          platformMotion.durationScale,
        ease: [0.22, 1, 0.36, 1] as const,
      }
    : undefined;
  const shouldAnimateEdgeDrawing =
    platformMotion.motionMode === "full" && edges.length <= 10;
  const edgeElements = useMemo(() => {
    const edgeInitial = shouldAnimateEdgeDrawing
      ? { pathLength: 0, opacity: 0 }
      : false;
    const edgeShadowAnimate = shouldAnimateEdgeDrawing
      ? { pathLength: 1, opacity: 0.92 }
      : { opacity: 0.92 };
    const edgeMainAnimate = shouldAnimateEdgeDrawing
      ? { pathLength: 1, opacity: 0.98 }
      : { opacity: 0.98 };
    const edgeTransition = shouldAnimateEdgeDrawing
      ? {
          duration: 0.24 * platformMotion.durationScale,
          ease: [0.22, 1, 0.36, 1] as const,
        }
      : undefined;

    return layout.edges.map(({ edge, from, to }) => {
      const completed = edge.data?.status === "completed";
      const curve = buildRegionGraphCurve(from, to);

      return (
        <g key={edge.id}>
          <motion.path
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
            initial={edgeInitial}
            animate={edgeShadowAnimate}
            transition={edgeTransition}
          />
          <motion.path
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
            initial={edgeInitial}
            animate={edgeMainAnimate}
            transition={edgeTransition}
          />
        </g>
      );
    });
  }, [
    layout.edges,
    platformMotion.durationScale,
    shouldAnimateEdgeDrawing,
    visualScale.completedEdgeWidth,
    visualScale.edgeWidth,
  ]);
  const nodeInitial = !platformMotion.shouldAnimate
    ? false
    : platformMotion.shouldUseLightAnimations
      ? { opacity: 0, scale: 0.92 }
      : { opacity: 0, scale: 0.55 };
  const nodeAnimate = platformMotion.shouldAnimate
    ? { opacity: 1, scale: 1 }
    : undefined;
  const nodeHover = platformMotion.shouldUseHoverAnimations
    ? { scale: platformMotion.shouldUseLightAnimations ? 1.08 : 1.18 }
    : undefined;
  const nodeTransition = platformMotion.shouldUseLightAnimations
    ? {
        duration: 0.1 * Math.max(platformMotion.durationScale, 0.75),
        ease: [0.22, 1, 0.36, 1] as const,
      }
    : { type: "spring" as const, stiffness: 300, damping: 22 };
  const loadingNodeAnimate = platformMotion.shouldAnimate
    ? { opacity: [1, 0.84, 1], scale: [1, 1.08, 1] }
    : undefined;
  const loadingNodeTransition = platformMotion.shouldAnimate
    ? {
        duration: 0.92 * Math.max(platformMotion.durationScale, 0.85),
        ease: "easeInOut" as const,
        repeat: Number.POSITIVE_INFINITY,
      }
    : undefined;

  if (!layout.nodes.length || !viewport) {
    return null;
  }

  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;

  return (
    <motion.svg
      initial={svgInitial}
      animate={svgAnimate}
      exit={platformMotion.shouldAnimate ? { opacity: 0, scale: 0.98 } : undefined}
      transition={svgTransition}
      className="region-graph-layer pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible [--vocabulary-edge-shadow:#2E26211F] [--vocabulary-edge-shadow-completed:#A73D3730] [--vocabulary-edge-default:#6D625BA8] [--vocabulary-edge-completed:#B54842E0] [--vocabulary-node-stroke:#2D251F30] [--vocabulary-label-fill:var(--surface-elevated)] [--vocabulary-label-border:var(--border-primary)] [--vocabulary-label-inner-border:rgba(255,255,255,0.55)] [--vocabulary-label-highlight:rgba(255,255,255,0.55)] [--vocabulary-label-text:var(--content-primary)] dark:[--vocabulary-edge-shadow:#00000036] dark:[--vocabulary-edge-shadow-completed:#A33C363A] dark:[--vocabulary-edge-default:#ECE4DD66] dark:[--vocabulary-edge-completed:#D9625CDE] dark:[--vocabulary-node-stroke:#FFFFFF52] dark:[--vocabulary-label-fill:var(--surface-secondary)] dark:[--vocabulary-label-border:rgba(255,255,255,0.12)] dark:[--vocabulary-label-inner-border:rgba(255,255,255,0.04)] dark:[--vocabulary-label-highlight:rgba(255,255,255,0.04)] dark:[--vocabulary-label-text:#F5F0EB]"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <VocabularyGraphVisualDefs idPrefix="vocabulary-vector" />

      {edgeElements}

      {layout.nodes.map(({ node, x, y }) => {
        const label = formatNodeLabel(getNodeLabel(node));
        const isLoadingNode = loadingNodeId === node.id;
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

            <motion.g
              initial={nodeInitial}
              animate={isLoadingNode ? loadingNodeAnimate : nodeAnimate}
              whileHover={node.data.status === "locked" || isLoadingNode ? undefined : nodeHover}
              transition={isLoadingNode ? loadingNodeTransition : nodeTransition}
              style={{ transformBox: "fill-box", transformOrigin: "center", willChange: isLoadingNode ? "transform, opacity" : undefined }}
            >
              {isLoadingNode ? (
                <motion.circle
                  r={nodeRadius + 1.04}
                  fill="none"
                  stroke={nodeFill}
                  strokeWidth={0.48}
                  animate={{ opacity: [0.18, 0.46, 0.18], scale: [1, 1.16, 1] }}
                  transition={loadingNodeTransition}
                />
              ) : null}
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
            </motion.g>
          </g>
        );
      })}
    </motion.svg>
  );
}

RegionVectorGraph.displayName = "RegionVectorGraph";

export default memo(RegionVectorGraph);
