"use client";

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import GraphHoverCard from "@/features/graph/components/GraphHoverCard";
import type {
  GraphEdge,
  GraphNodeVisualVariant,
  GraphNode as FlowGraphNode,
} from "@/features/graph/lib/graphTypes";
import { KazuMascot } from "@/features/mascot";
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
  hoverResetToken?: number;
  unlockTransition?: {
    fromNodeId: string;
    toNodeId: string;
    token: number;
  } | null;
  onNodeSelected: (node: FlowGraphNode) => void;
};

type RecommendedNodeHoverState = {
  x: number;
  y: number;
  title: string;
  description: string | null;
  rank: number;
  similarity: number;
  resetToken: number;
};

type RecommendedNodeHotspot = {
  id: string;
  node: FlowGraphNode;
  x: number;
  y: number;
  radius: number;
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

function chunkSymbolText(symbol: string) {
  const normalized = symbol.trim();

  if (!normalized) {
    return ["?"];
  }

  if (/\s/.test(normalized)) {
    return normalized.split(/\s+/).filter(Boolean);
  }

  const characters = Array.from(normalized);
  const maxCharsPerLine = characters.length <= 4 ? 2 : 3;
  const lines: string[] = [];

  for (let index = 0; index < characters.length; index += maxCharsPerLine) {
    lines.push(characters.slice(index, index + maxCharsPerLine).join(""));
  }

  return lines;
}

function getCircleTextLayout(symbol: string, radius: number, preferredFontSize: number) {
  const lines = chunkSymbolText(symbol);
  const longestLineLength = lines.reduce(
    (maxLength, line) => Math.max(maxLength, Array.from(line).length),
    1,
  );
  const availableWidth = radius * 1.34;
  const availableHeight = radius * 1.28;
  const lineHeightRatio = 1.04;
  const widthLimitedFontSize = availableWidth / (longestLineLength * 0.96);
  const heightLimitedFontSize =
    availableHeight / (1 + (lines.length - 1) * lineHeightRatio);
  const fontSize = clamp(
    Math.min(preferredFontSize, widthLimitedFontSize, heightLimitedFontSize),
    0.34,
    preferredFontSize,
  );
  const lineHeight = fontSize * lineHeightRatio;
  const firstLineY = -((lines.length - 1) * lineHeight) / 2;

  return {
    lines,
    fontSize,
    firstLineY,
    lineHeight,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getKazuRecommendationVoice(rank: number, similarity: number): string {
  const pct = Math.round(similarity * 100);

  if (rank === 1) {
    if (pct >= 80) {
      return `¡Mi recomendación estrella! Detecté ${pct}% de afinidad con tus intereses. ¡No lo dejes pasar, es el momento perfecto para explorarlo!`;
    }
    return `Mi mejor recomendación para ti ahora mismo. Con ${pct}% de afinidad con lo que ya te apasiona, ¡encaja perfecto en tu camino!`;
  }

  if (rank === 2) {
    return `¡Muy buena elección! Detecté ${pct}% de afinidad con tus gustos. Complementará muy bien lo que ya estás aprendiendo.`;
  }

  return `Subtema relacionado con tus intereses (${pct}% de afinidad). Una oportunidad interesante para ampliar tu vocabulario japónés.`;
}

function isDisplayableImageSrc(value?: string | null) {
  return Boolean(value && (/^https?:\/\//i.test(value) || value.startsWith("data:image/")));
}

function wrapLabelText(text: string, maxLines: number) {
  const normalized = text.trim();

  if (!normalized) {
    return [""];
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);

  if (tokens.length <= maxLines) {
    return tokens;
  }

  const lines: string[] = [];
  let startIndex = 0;

  for (let lineIndex = 0; lineIndex < maxLines; lineIndex += 1) {
    const remainingWords = tokens.length - startIndex;
    const remainingLines = maxLines - lineIndex;

    if (remainingWords <= 0) {
      break;
    }

    const wordsForLine = Math.ceil(remainingWords / remainingLines);
    lines.push(tokens.slice(startIndex, startIndex + wordsForLine).join(" "));
    startIndex += wordsForLine;
  }

  return lines;
}

function clampLabelLines(lines: string[], maxLines: number) {
  if (lines.length <= maxLines) {
    return lines;
  }

  const visibleLines = lines.slice(0, maxLines);
  visibleLines[maxLines - 1] = lines.slice(maxLines - 1).join(" ");

  return visibleLines;
}

function getNodeVariant(node: FlowGraphNode, index: number): GraphNodeVisualVariant {
  if (node.id === "home") {
    return "black";
  }

  if (node.data.visualVariant) {
    return node.data.visualVariant === "white" ? "black" : node.data.visualVariant;
  }

  const variants: GraphNodeVisualVariant[] = ["red", "black"];
  return variants[index % variants.length] ?? "red";
}

function getVariantPalette(
  node: FlowGraphNode,
  variant: GraphNodeVisualVariant,
  idPrefix: string,
) {
  if (node.data.status === "locked") {
    return {
      fill: `url(#${idPrefix}-node-locked-gradient)`,
      text: "var(--vocabulary-node-locked-text)",
      stroke: "var(--vocabulary-node-stroke)",
      shadow: "var(--vocabulary-node-shadow-locked)",
    };
  }

  if (variant === "black") {
    return {
      fill: `url(#${idPrefix}-node-black-gradient)`,
      text: "var(--vocabulary-node-black-text)",
      stroke: "var(--vocabulary-node-stroke)",
      shadow: "var(--vocabulary-node-shadow-black)",
    };
  }

  return {
    fill: `url(#${idPrefix}-node-red-gradient)`,
    text: "var(--vocabulary-node-red-text)",
    stroke: "var(--vocabulary-node-stroke)",
    shadow: "var(--vocabulary-node-shadow-red)",
  };
}

function getRecommendationHalo(nodeRadius: number, rank?: number, similarity?: number) {
  const intensity = similarity ? clamp((similarity - 0.4) / 0.3, 0.35, 1) : 0.58;
  const rankScale = rank === 1 ? 1 : rank === 2 ? 0.93 : 0.87;

  return {
    outerRadius: nodeRadius + 1.08 * rankScale,
    innerRadius: nodeRadius + 0.62 * rankScale,
    glowRadius: nodeRadius + 0.34 * rankScale,
    opacity: 0.24 + intensity * 0.24,
    glowOpacity: 0.18 + intensity * 0.16,
  };
}

function renderLockedNodeBadge(nodeRadius: number) {
  const badgeRadius = Math.max(nodeRadius * 0.34, 0.7);
  const bodyWidth = badgeRadius * 0.74;
  const bodyHeight = badgeRadius * 0.56;
  const bodyY = -bodyHeight * 0.12;
  const shackleRadius = badgeRadius * 0.26;
  const iconOffsetY = -badgeRadius * 0.06;

  return (
    <g transform={`translate(${nodeRadius * 0.6} ${nodeRadius * 0.6})`}>
      <circle
        r={badgeRadius}
        fill="var(--vocabulary-lock-badge-fill)"
        stroke="var(--vocabulary-lock-badge-stroke)"
        strokeWidth={0.12}
        vectorEffect="non-scaling-stroke"
      />
      <g transform={`translate(0 ${iconOffsetY})`}>
        <path
          d={`M ${-shackleRadius} ${bodyY + badgeRadius * 0.06} v ${-badgeRadius * 0.08} a ${shackleRadius} ${shackleRadius} 0 0 1 ${shackleRadius * 2} 0 v ${badgeRadius * 0.08}`}
          fill="none"
          stroke="var(--vocabulary-lock-badge-icon)"
          strokeWidth={0.12}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={-bodyWidth / 2}
          y={bodyY}
          width={bodyWidth}
          height={bodyHeight}
          rx={badgeRadius * 0.14}
          fill="none"
          stroke="var(--vocabulary-lock-badge-icon)"
          strokeWidth={0.12}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={0}
          cy={bodyY + bodyHeight * 0.48}
          r={badgeRadius * 0.08}
          fill="var(--vocabulary-lock-badge-icon)"
        />
      </g>
    </g>
  );
}

function getVisualScale(
  level: Extract<VocabularyViewLevel, "theme" | "subtheme">,
  nodeCount: number,
) {
  if (level === "subtheme") {
    const dense = nodeCount >= 8;

    return {
      dense,
      homeRadius: dense ? 2.18 : 3.25,
      nodeRadius: dense ? 1.46 : 2.32,
      wordRadius: dense ? 1.74 : 2.72,
      homeFontSize: dense ? 1.7 : 2.45,
      nodeFontSize: dense ? 0.78 : 1.18,
      wordFontSize: dense ? 1.22 : 1.9,
      textOffset: dense ? 0.42 : 0.62,
      edgeWidth: dense ? 0.42 : 0.58,
      completedEdgeWidth: dense ? 0.54 : 0.7,
      labelOffset: dense ? 1.96 : 3.28,
      labelWidth: dense ? 5.18 : 7.7,
      labelHeight: dense ? 1 : 1.56,
      labelFontSize: dense ? 0.44 : 0.68,
      labelRadius: dense ? 0.5 : 0.78,
    };
  }

  const dense = nodeCount >= 8;

  return {
    dense,
    homeRadius: dense ? 2.2 : 3.65,
    nodeRadius: dense ? 1.48 : 2.68,
    wordRadius: dense ? 1.8 : 3.04,
    homeFontSize: dense ? 1.72 : 2.72,
    nodeFontSize: dense ? 0.8 : 1.28,
    wordFontSize: dense ? 1.24 : 2.12,
    textOffset: dense ? 0.42 : 0.7,
    edgeWidth: dense ? 0.44 : 0.62,
    completedEdgeWidth: dense ? 0.56 : 0.74,
    labelOffset: dense ? 2 : 3.52,
    labelWidth: dense ? 5.22 : 8.2,
    labelHeight: dense ? 1.02 : 1.68,
    labelFontSize: dense ? 0.45 : 0.72,
    labelRadius: dense ? 0.51 : 0.84,
  };
}

function getNodeRadius(
  node: FlowGraphNode,
  visualScale: ReturnType<typeof getVisualScale>,
) {
  if (node.data.entityKind === "word") {
    return visualScale.wordRadius;
  }

  return node.id === "home" ? visualScale.homeRadius : visualScale.nodeRadius;
}

function getNodeLabelLayout(
  node: FlowGraphNode,
  visualScale: ReturnType<typeof getVisualScale>,
) {
  const text = getNodeLabel(node);
  const isWordNode = node.data.entityKind === "word";
  const baseFontSize = isWordNode
    ? visualScale.labelFontSize * (visualScale.dense ? 1.08 : 1.04)
    : visualScale.labelFontSize * (visualScale.dense ? 0.98 : 1);
  const maxLines = 3;
  const preferredCharsPerLine = isWordNode
    ? visualScale.dense
      ? 10
      : 14
    : visualScale.dense
      ? 11
      : 15;
  const lines = clampLabelLines(wrapLabelText(text, maxLines), maxLines);
  const longestLineLength = lines.reduce(
    (maxLength, line) => Math.max(maxLength, Array.from(line).length),
    0,
  );
  const fontScale =
    longestLineLength > preferredCharsPerLine
      ? clamp(preferredCharsPerLine / longestLineLength, 0.82, 1)
      : 1;
  const fontSize = (lines.length >= 3 ? baseFontSize * 0.92 : baseFontSize) * fontScale;
  const width = clamp(
    longestLineLength * fontSize * 0.68 + (isWordNode ? 1.8 : 1.3),
    visualScale.labelWidth * (isWordNode ? 1.04 : 0.98),
    visualScale.labelWidth * (isWordNode ? 3.05 : 2.24),
  );
  const height = Math.max(
    visualScale.labelHeight * (lines.length >= 3 ? 1.16 : 1),
    lines.length * fontSize * 1.22 + (isWordNode ? 0.84 : 0.68),
  );

  return {
    lines,
    fontSize,
    width,
    height,
  };
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

  return `spread-route-v6::${level}::${boundsKey}::${viewportKey}::${nodePointKey}::${nodeKey}::${edgeKey}`;
}

function RegionVectorGraph({
  nodes,
  edges,
  regionBounds,
  nodePoints,
  viewport,
  level,
  interactionDisabled = false,
  hoverResetToken = 0,
  unlockTransition = null,
  onNodeSelected,
}: RegionVectorGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const idPrefix = useId().replace(/:/g, "");
  const [hoveredRecommendedNode, setHoveredRecommendedNode] = useState<RecommendedNodeHoverState | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const activeHoveredRecommendedNode =
    hoveredRecommendedNode?.resetToken === hoverResetToken
      ? hoveredRecommendedNode
      : null;
  const helpRecommendedNodeId = useMemo(
    () =>
      level === "theme"
        ? nodes.find(
            (node) =>
              node.id !== "home" &&
              node.data.entityKind === "subtheme" &&
              node.data.status !== "locked" &&
              node.data.isAiRecommended,
          )?.id ?? null
        : null,
    [level, nodes],
  );
  const helpWordNodeId = useMemo(
    () =>
      level === "subtheme"
        ? nodes.find(
            (node) =>
              node.id !== "home" &&
              node.data.entityKind === "word" &&
              node.data.status !== "locked",
          )?.id ?? null
        : null,
    [level, nodes],
  );
  const visualScale = useMemo(() => getVisualScale(level, nodes.length), [level, nodes.length]);
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

  const edgeElements = useMemo(() => {
    return layout.edges.map(({ edge, from, to }, index) => {
      const completed = edge.data?.status === "completed";
      const isUnlockEdge =
        unlockTransition !== null &&
        edge.source === unlockTransition.fromNodeId &&
        edge.target === unlockTransition.toNodeId;
      const curve = buildRegionGraphCurve(from, to);
      const edgeStroke = completed
        ? `url(#${idPrefix}-edge-completed)`
        : `url(#${idPrefix}-edge-default)`;

      return (
        <g
          key={edge.id}
          className="vocabulary-graph-edge-enter"
          style={{ animationDelay: `${Math.min(index * 24, 120)}ms` }}
        >
          <path
            d={curve}
            fill="none"
            stroke={
              completed
                ? "var(--vocabulary-edge-shadow-completed)"
                : "var(--vocabulary-edge-shadow)"
            }
            strokeWidth={(completed ? visualScale.completedEdgeWidth : visualScale.edgeWidth) + 0.54}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.24}
          />
          <path
            d={curve}
            fill="none"
            stroke="var(--vocabulary-edge-rail)"
            strokeWidth={(completed ? visualScale.completedEdgeWidth : visualScale.edgeWidth) + 0.18}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.5}
          />
          <path
            d={curve}
            fill="none"
            stroke={edgeStroke}
            strokeWidth={
              completed ? visualScale.completedEdgeWidth : visualScale.edgeWidth
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={completed ? 0.74 : 0.56}
          />
          {isUnlockEdge ? (
            <path
              key={`${edge.id}-${unlockTransition?.token ?? 0}`}
              d={curve}
              fill="none"
              stroke="var(--vocabulary-progress-fill)"
              strokeWidth={visualScale.completedEdgeWidth + 0.22}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              opacity={0.96}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1}
            >
              <animate attributeName="stroke-dashoffset" from="1" to="0" dur="0.9s" begin="0s" fill="freeze" />
              <animate attributeName="opacity" values="0;1;0.92" dur="0.9s" begin="0s" fill="freeze" />
            </path>
          ) : null}
        </g>
      );
    });
  }, [
    idPrefix,
    layout.edges,
    unlockTransition,
    visualScale.completedEdgeWidth,
    visualScale.edgeWidth,
  ]);

  const handleRecommendedHover = useCallback(
    (
      event: ReactPointerEvent<Element> | ReactMouseEvent<Element>,
      node: FlowGraphNode,
    ) => {
      if (!node.data.isAiRecommended || node.id === "home") {
        setHoveredRecommendedNode(null);
        return;
      }

      const containerRect = containerRef.current?.getBoundingClientRect();
      const transformLayer = containerRef.current?.closest(".map-transform-layer");

      if (
        transformLayer?.classList.contains("is-zooming") ||
        transformLayer?.classList.contains("is-dragging")
      ) {
        setHoveredRecommendedNode(null);
        return;
      }

      if (!containerRect) {
        setHoveredRecommendedNode(null);
        return;
      }

      setHoveredRecommendedNode({
        x: event.clientX,
        y: event.clientY,
        title: getNodeLabel(node),
        description: node.data.description ?? null,
        rank: node.data.recommendationRank ?? 3,
        similarity: node.data.recommendationSimilarity ?? 0,
        resetToken: hoverResetToken,
      });
    },
    [hoverResetToken],
  );

  const clearRecommendedHover = useCallback(() => {
    setHoveredRecommendedNode(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateSize = () => {
      const nextRect = container.getBoundingClientRect();
      setContainerSize({
        width: nextRect.width,
        height: nextRect.height,
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const recommendedHotspots = useMemo<RecommendedNodeHotspot[]>(() => {
    if (!viewport || !containerSize.width || !containerSize.height) {
      return [];
    }

    const scale = Math.min(
      containerSize.width / viewport.width,
      containerSize.height / viewport.height,
    );
    const offsetX = (containerSize.width - viewport.width * scale) / 2;
    const offsetY = (containerSize.height - viewport.height * scale) / 2;

    return layout.nodes.flatMap(({ node, x, y }) => {
      if (!node.data.isAiRecommended || node.id === "home") {
        return [];
      }

      const nodeRadius = getNodeRadius(node, visualScale);
      const halo = getRecommendationHalo(
        nodeRadius,
        node.data.recommendationRank,
        node.data.recommendationSimilarity,
      );
      const radiusSvg = Math.max(nodeRadius + 2.4, halo.outerRadius * 1.48);

      return [{
        id: node.id,
        node,
        x: offsetX + (x - viewport.x) * scale,
        y: offsetY + (y - viewport.y) * scale,
        radius: Math.max(radiusSvg * scale, 28),
      }];
    });
  }, [containerSize.height, containerSize.width, layout.nodes, viewport, visualScale]);

  if (!layout.nodes.length || !viewport) {
    return null;
  }

  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;

  return (
    <div
      ref={containerRef}
      className="region-graph-layer vocabulary-graph-layer pointer-events-none absolute inset-0 z-30 overflow-visible"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <VocabularyGraphVisualDefs idPrefix={idPrefix} />

        {edgeElements}

        {layout.nodes.map(({ node, x, y }, index) => {
        const isWordNode = node.data.entityKind === "word";
        const isLockedWordNode = isWordNode && node.data.status === "locked";
        const isInteractive = node.data.status !== "locked" && !interactionDisabled;
        const canHandleLockedWord = isLockedWordNode && !interactionDisabled;
        const canHandleClick = isInteractive || canHandleLockedWord;
        const nodeRadius = getNodeRadius(node, visualScale);
        const variant = getNodeVariant(node, index);
        const palette = getVariantPalette(node, variant, idPrefix);
        const labelLayout = getNodeLabelLayout(node, visualScale);
        const labelY = nodeRadius + (isWordNode ? 0.92 : visualScale.dense ? 0.64 : 0.98);
        const imageRadius = Math.max(nodeRadius - 0.28, 0.78);
        const imageClipRadius = imageRadius * 0.66;
        const imageSize = imageClipRadius * 1.48;
        const imageId = `${idPrefix}-${node.id.replace(/[^a-zA-Z0-9_-]/g, "")}-clip`;
        const hasImage = isWordNode && isDisplayableImageSrc(node.data.imageUrl);
        const progress = clamp(node.data.progress ?? 0, 0, 100);
        const showProgress = isWordNode && node.data.status !== "locked" && progress > 0 && progress < 100;
        const isAiRecommended = Boolean(node.data.isAiRecommended && node.id !== "home");
        const isUnlockTarget = unlockTransition !== null && node.id === unlockTransition.toNodeId;
        const recommendationHalo = isAiRecommended
          ? getRecommendationHalo(
              nodeRadius,
              node.data.recommendationRank,
              node.data.recommendationSimilarity,
            )
          : null;
        const recommendedHitRadius = recommendationHalo
          ? Math.max(nodeRadius + 1.8, recommendationHalo.outerRadius * 1.18 + 0.24)
          : nodeRadius + 1.8;
        const symbolLayout = getCircleTextLayout(
          getSymbol(node),
          nodeRadius,
          node.id === "home"
            ? visualScale.homeFontSize * 0.88
            : isWordNode
              ? visualScale.wordFontSize * 0.84
              : visualScale.nodeFontSize * 0.86,
        );
        const activateNode = () => {
          if (!canHandleClick) {
            return;
          }

          onNodeSelected(node);
        };
        return (
          <g
            key={node.id}
            data-vocabulary-node="true"
            data-ai-recommended={node.data.isAiRecommended ? "true" : undefined}
            className={[
              canHandleLockedWord
                ? "pointer-events-auto cursor-pointer"
                : node.data.status === "locked"
                  ? "cursor-default"
                : interactionDisabled
                  ? "cursor-progress"
                  : "pointer-events-auto cursor-pointer",
              isAiRecommended ? "pointer-events-auto" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            transform={`translate(${x} ${y})`}
            onClick={activateNode}
            style={{ pointerEvents: isAiRecommended || canHandleClick ? "all" : "none" }}
            onPointerEnter={isAiRecommended ? (event) => handleRecommendedHover(event, node) : undefined}
            onPointerMove={isAiRecommended ? (event) => handleRecommendedHover(event, node) : undefined}
            onPointerLeave={isAiRecommended ? clearRecommendedHover : undefined}
            onPointerCancel={isAiRecommended ? clearRecommendedHover : undefined}
            onMouseEnter={isAiRecommended ? (event) => handleRecommendedHover(event, node) : undefined}
            onMouseMove={isAiRecommended ? (event) => handleRecommendedHover(event, node) : undefined}
            onMouseLeave={isAiRecommended ? clearRecommendedHover : undefined}
            aria-label={node.data.label}
          >
            {recommendationHalo ? (
              <g
                className="vocabulary-node-recommendation-halo"
                data-rank={node.data.recommendationRank ?? 0}
                style={{
                  pointerEvents: "none",
                  ["--vocabulary-recommendation-opacity" as string]: recommendationHalo.opacity,
                  ["--vocabulary-recommendation-glow-opacity" as string]: recommendationHalo.glowOpacity,
                }}
              >
                <circle
                  r={recommendationHalo.outerRadius}
                  className="vocabulary-node-recommendation-halo__ring vocabulary-node-recommendation-halo__ring--outer"
                />
                <circle
                  r={recommendationHalo.innerRadius}
                  className="vocabulary-node-recommendation-halo__ring vocabulary-node-recommendation-halo__ring--inner"
                />
                <circle
                  r={recommendationHalo.glowRadius}
                  className="vocabulary-node-recommendation-halo__glow"
                />
              </g>
            ) : null}
            <g
              className={`vocabulary-graph-node-enter ${node.data.status === "completed" ? "vocabulary-node-completed-enter" : ""}`}
              style={{ animationDelay: `${Math.min(index * 28, 140)}ms` }}
            >
              <VocabularyGraphLabel
                idPrefix={idPrefix}
                text={getNodeLabel(node)}
                lines={labelLayout.lines}
                y={labelY}
                width={labelLayout.width}
                height={labelLayout.height}
                radius={visualScale.labelRadius}
                fontSize={labelLayout.fontSize}
              />

              <g>
                {isUnlockTarget ? (
                  <g key={`${node.id}-${unlockTransition?.token ?? 0}`} style={{ pointerEvents: "none" }}>
                    <circle
                      r={nodeRadius + 0.24}
                      fill="none"
                      stroke="var(--vocabulary-progress-fill)"
                      strokeWidth={0.18}
                      opacity={0}
                      vectorEffect="non-scaling-stroke"
                    >
                      <animate attributeName="r" from={String(nodeRadius + 0.24)} to={String(nodeRadius + 2.5)} dur="0.92s" begin="0s" fill="freeze" />
                      <animate attributeName="opacity" values="0;0.74;0" dur="0.92s" begin="0s" fill="freeze" />
                    </circle>
                    <circle
                      r={nodeRadius + 0.18}
                      fill="none"
                      stroke="var(--vocabulary-progress-fill)"
                      strokeWidth={0.28}
                      opacity={0}
                      vectorEffect="non-scaling-stroke"
                    >
                      <animate attributeName="r" from={String(nodeRadius + 0.18)} to={String(nodeRadius + 1.54)} dur="0.62s" begin="0s" fill="freeze" />
                      <animate attributeName="opacity" values="0;0.9;0" dur="0.62s" begin="0s" fill="freeze" />
                    </circle>
                  </g>
                ) : null}
                {hasImage ? (
                  <defs>
                    <clipPath id={imageId}>
                      <circle r={imageClipRadius} />
                    </clipPath>
                  </defs>
                ) : null}
                <circle
                  r={nodeRadius + (isWordNode ? 0.34 : 0.28)}
                  fill={palette.shadow}
                  opacity={node.data.status === "locked" ? 0.24 : 0.42}
                />
                {showProgress ? (
                  <circle
                    r={nodeRadius + 0.44}
                    fill="none"
                    stroke="var(--vocabulary-progress-track)"
                    strokeWidth={0.22}
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
                {showProgress ? (
                  <circle
                    r={nodeRadius + 0.44}
                    fill="none"
                    stroke="var(--vocabulary-progress-fill)"
                    strokeWidth={0.28}
                    pathLength={100}
                    strokeDasharray={`${progress} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90)"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
                <circle
                  r={nodeRadius}
                  fill={palette.fill}
                  stroke={palette.stroke}
                  strokeWidth={node.id === "home" ? 0.82 : 0.72}
                  data-help-target={
                    node.id === helpWordNodeId
                      ? "vocabulary-word-node"
                      : undefined
                  }
                  data-help-target-priority={
                    node.id === helpWordNodeId ? "20" : undefined
                  }
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  r={Math.max(nodeRadius - 0.14, 0.2)}
                  fill="none"
                  stroke="var(--vocabulary-node-inner-stroke)"
                  strokeWidth={0.14}
                  opacity={node.data.status === "locked" ? 0.4 : 0.72}
                  vectorEffect="non-scaling-stroke"
                />
                {hasImage ? (
                  <>
                    <circle r={imageRadius} fill="#fff" opacity={0.98} />
                    <image
                      href={node.data.imageUrl ?? undefined}
                      x={-imageSize / 2}
                      y={-imageSize / 2}
                      width={imageSize}
                      height={imageSize}
                      preserveAspectRatio="xMidYMid meet"
                      clipPath={`url(#${imageId})`}
                    />
                    <circle
                      r={imageRadius}
                      fill="none"
                      stroke={palette.stroke}
                      strokeWidth={0.18}
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                ) : (
                  <text
                    className="jp-text"
                    lang="ja"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={palette.text}
                    fontSize={symbolLayout.fontSize}
                    fontWeight={900}
                    letterSpacing={0}
                    style={{ pointerEvents: "none" }}
                  >
                    {symbolLayout.lines.map((line, lineIndex) => (
                      <tspan
                        key={`${node.id}-${line}-${lineIndex}`}
                        x={0}
                        y={symbolLayout.firstLineY + lineIndex * symbolLayout.lineHeight}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}
                {node.data.status === "locked" ? renderLockedNodeBadge(nodeRadius) : null}
                {isAiRecommended ? (
                  <circle
                    r={recommendedHitRadius}
                    fill="rgba(255,255,255,0.001)"
                    stroke="none"
                    style={{ pointerEvents: "all" }}
                    onPointerEnter={(event) => handleRecommendedHover(event, node)}
                    onPointerMove={(event) => handleRecommendedHover(event, node)}
                    onPointerLeave={clearRecommendedHover}
                    onPointerCancel={clearRecommendedHover}
                    onMouseEnter={(event) => handleRecommendedHover(event, node)}
                    onMouseMove={(event) => handleRecommendedHover(event, node)}
                    onMouseLeave={clearRecommendedHover}
                  />
                ) : null}
              </g>
            </g>
          </g>
        );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 z-10">
        {recommendedHotspots.map((hotspot) => {
          const isInteractive = hotspot.node.data.status !== "locked" && !interactionDisabled;

          return (
            <button
              key={hotspot.id}
              type="button"
              data-help-target={
                hotspot.node.id === helpRecommendedNodeId
                  ? "vocabulary-recommended-subtheme-node"
                  : undefined
              }
              data-help-target-priority={
                hotspot.node.id === helpRecommendedNodeId ? "30" : undefined
              }
              className="absolute rounded-full border-0 p-0 pointer-events-auto"
              aria-label={hotspot.node.data.label}
              tabIndex={-1}
              style={{
                left: `${hotspot.x}px`,
                top: `${hotspot.y}px`,
                width: `${hotspot.radius * 2}px`,
                height: `${hotspot.radius * 2}px`,
                transform: "translate(-50%, -50%)",
                background: "rgba(255,255,255,0.001)",
                cursor: isInteractive ? "pointer" : "default",
              }}
              onClick={() => {
                if (isInteractive) {
                  onNodeSelected(hotspot.node);
                }
              }}
              onPointerEnter={(event) => handleRecommendedHover(event, hotspot.node)}
              onPointerMove={(event) => handleRecommendedHover(event, hotspot.node)}
              onPointerLeave={clearRecommendedHover}
              onPointerCancel={clearRecommendedHover}
              onMouseEnter={(event) => handleRecommendedHover(event, hotspot.node)}
              onMouseMove={(event) => handleRecommendedHover(event, hotspot.node)}
              onMouseLeave={clearRecommendedHover}
            />
          );
        })}
      </div>

      {activeHoveredRecommendedNode ? (
        <GraphHoverCard
          variant="kazu"
          x={activeHoveredRecommendedNode.x}
          y={activeHoveredRecommendedNode.y}
          eyebrow="Guía KAZU"
          badge={`TOP ${activeHoveredRecommendedNode.rank}`}
          title={activeHoveredRecommendedNode.title}
          subtitle={
            activeHoveredRecommendedNode.description
              ? activeHoveredRecommendedNode.description
              : "Subtema de vocabulario japonés"
          }
          caption={getKazuRecommendationVoice(
            activeHoveredRecommendedNode.rank,
            activeHoveredRecommendedNode.similarity,
          )}
          mascot={
            <KazuMascot
              state={
                activeHoveredRecommendedNode.rank === 1
                  ? "proud"
                  : activeHoveredRecommendedNode.rank === 2
                    ? "focus"
                    : "determined"
              }
              size={120}
              focusOnHover={false}
              ariaLabel="Kazu recomienda este subtema"
            />
          }
          showMore
        />
      ) : null}
    </div>
  );
}

RegionVectorGraph.displayName = "RegionVectorGraph";

export default memo(RegionVectorGraph);
