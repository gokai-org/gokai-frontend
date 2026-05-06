"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import type {
  VocabularyRegionBounds,
  VocabularyRegionNodePoint,
  VocabularyRegionThemeNode,
  VocabularyRegionViewModel,
  VocabularySvgViewport,
} from "../types";
import {
  buildNodeEdgeConnection,
  buildRegionGraphCurve,
  toSvgPoint,
} from "../lib/regionGraphLayout";
import {
  VocabularyGraphLabel,
  VocabularyGraphVisualDefs,
} from "./VocabularyGraphLabel";

const themePointLayoutCache = new Map<string, { themePoints: VocabularyRegionNodePoint[] }>();

type RegionThemeGraphProps = {
  region: VocabularyRegionViewModel;
  regionBounds: VocabularyRegionBounds | null;
  nodePoints: VocabularyRegionNodePoint[] | null;
  viewport: VocabularySvgViewport | null;
  interactionDisabled?: boolean;
  onThemeSelect: (theme: VocabularyRegionThemeNode) => void;
};

const THEME_NODE_RADIUS = 3.05;
const LABEL_OFFSET = 3.52;
const LABEL_WIDTH = 8.2;
const LABEL_HEIGHT = 1.68;
const LABEL_RADIUS = 0.84;
const LABEL_FONT_SIZE = 0.72;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const NODE_LAYOUTS: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 0.5, y: 0.52 }],
  2: [
    { x: 0.24, y: 0.3 },
    { x: 0.76, y: 0.68 },
  ],
  3: [
    { x: 0.18, y: 0.22 },
    { x: 0.84, y: 0.28 },
    { x: 0.42, y: 0.78 },
  ],
  4: [
    { x: 0.14, y: 0.18 },
    { x: 0.86, y: 0.18 },
    { x: 0.22, y: 0.8 },
    { x: 0.8, y: 0.8 },
  ],
  5: [
    { x: 0.12, y: 0.26 },
    { x: 0.5, y: 0.1 },
    { x: 0.88, y: 0.28 },
    { x: 0.2, y: 0.82 },
    { x: 0.8, y: 0.82 },
  ],
  6: [
    { x: 0.12, y: 0.22 },
    { x: 0.5, y: 0.08 },
    { x: 0.88, y: 0.22 },
    { x: 0.16, y: 0.76 },
    { x: 0.5, y: 0.9 },
    { x: 0.84, y: 0.76 },
  ],
};

function projectPoint(
  regionBounds: VocabularyRegionBounds,
  point: { x: number; y: number },
) {
  const labelPaddingX = Math.max(
    3.2,
    Math.min(6.6, regionBounds.width * 0.1),
  );
  const labelPaddingTop = Math.max(2.2, Math.min(4.8, regionBounds.height * 0.05));
  const labelPaddingBottom = Math.max(4.6, Math.min(9.2, regionBounds.height * 0.14));
  const insetX = Math.max(labelPaddingX, regionBounds.width * 0.07);
  const insetY = Math.max(labelPaddingTop, regionBounds.height * 0.05);
  const minX = regionBounds.x + insetX;
  const maxX = regionBounds.x + regionBounds.width - insetX;
  const minY = regionBounds.y + insetY;
  const maxY = regionBounds.y + regionBounds.height - labelPaddingBottom;

  return {
    x: clamp(
      minX + (maxX - minX) * point.x,
      regionBounds.x + labelPaddingX,
      regionBounds.x + regionBounds.width - labelPaddingX,
    ),
    y: clamp(
      minY + (maxY - minY) * point.y,
      regionBounds.y + labelPaddingTop,
      regionBounds.y + regionBounds.height - labelPaddingBottom,
    ),
  };
}

function buildNodePositions(
  regionBounds: VocabularyRegionBounds | null,
  count: number,
) {
  if (!regionBounds) {
    return Array.from({ length: count }).map((_, index) => ({
      x: 34 + (index % 3) * 14,
      y: 42 + Math.floor(index / 3) * 16,
    }));
  }

  const layout = NODE_LAYOUTS[count];

  if (layout) {
    return layout.map((point) => projectPoint(regionBounds, point));
  }

  const columns = count <= 4 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(count / columns));

  return Array.from({ length: count }).map((_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;

    if (count === 1) {
      return { x: regionBounds.centerX, y: regionBounds.centerY };
    }

    const normalizedPoint = {
      x: 0.12 + (0.76 / Math.max(columns - 1, 1)) * column,
      y: rows === 1 ? 0.5 : 0.15 + (0.7 / Math.max(rows - 1, 1)) * row,
    };

    return projectPoint(regionBounds, normalizedPoint);
  });
}

function getDistance(
  a: VocabularyRegionNodePoint,
  b: VocabularyRegionNodePoint,
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function shouldFallbackToExplicitLayout(
  regionBounds: VocabularyRegionBounds | null,
  points: VocabularyRegionNodePoint[] | null,
  expectedCount: number,
) {
  if (!regionBounds || !points || points.length < expectedCount) {
    return true;
  }

  let minPairDistance = Number.POSITIVE_INFINITY;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;

  points.forEach((point, index) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);

    points.slice(index + 1).forEach((candidate) => {
      minPairDistance = Math.min(minPairDistance, getDistance(point, candidate));
    });
  });

  const minRequiredGap = Math.max(Math.min(regionBounds.width, regionBounds.height) * 0.16, 6);
  const minRequiredSpanX = expectedCount >= 3 ? Math.max(regionBounds.width * 0.22, 7) : 0;

  return minPairDistance < minRequiredGap || maxX - minX < minRequiredSpanX;
}

function splitGraphPoints(
  regionBounds: VocabularyRegionBounds | null,
  nodePoints: VocabularyRegionNodePoint[] | null,
  themeCount: number,
) {
  const fallbackPoints = buildNodePositions(regionBounds, themeCount);

  const center = regionBounds
    ? { x: regionBounds.centerX, y: regionBounds.centerY }
    : fallbackPoints[0];
  const points = shouldFallbackToExplicitLayout(
    regionBounds,
    nodePoints,
    themeCount,
  )
    ? fallbackPoints
    : [...(nodePoints ?? fallbackPoints)];
  const themePoints = points
    .sort(
      (a, b) =>
        Math.atan2(a.y - center.y, a.x - center.x) -
        Math.atan2(b.y - center.y, b.x - center.x),
    )
    .slice(0, themeCount);

  while (themePoints.length < themeCount) {
    themePoints.push(fallbackPoints[themePoints.length] ?? center);
  }

  return { themePoints };
}

function getThemePointLayoutCacheKey(
  region: VocabularyRegionViewModel,
  regionBounds: VocabularyRegionBounds | null,
  nodePoints: VocabularyRegionNodePoint[] | null,
) {
  const boundsKey = regionBounds
    ? [
        regionBounds.x.toFixed(2),
        regionBounds.y.toFixed(2),
        regionBounds.width.toFixed(2),
        regionBounds.height.toFixed(2),
      ].join(":")
    : "no-bounds";
  const pointsKey = (nodePoints ?? [])
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join("|");
  const themeKey = region.themes.map((theme) => theme.id).join("|");

  return `${region.id}::${themeKey}::${boundsKey}::${pointsKey}`;
}

function getThemeFill(theme: VocabularyRegionThemeNode) {
  if (theme.status === "locked") {
    return "var(--surface-tertiary)";
  }

  if (theme.status === "completed") {
    return "var(--accent-hover)";
  }

  return "var(--accent)";
}

function formatThemeLabel(theme: VocabularyRegionThemeNode) {
  const source = theme.label;
  const trimmed = source.trim();

  return trimmed.length > 12 ? `${trimmed.slice(0, 10)}...` : trimmed;
}

const VOCAB_NODE_HOVER_STYLE = `
  .vocab-node-hover { transition: filter 140ms ease-out, opacity 140ms ease-out; }
  g[data-vocabulary-node="true"]:hover .vocab-node-hover circle { filter: brightness(1.12); }
`;

function RegionThemeGraph({
  region,
  regionBounds,
  nodePoints,
  viewport,
  interactionDisabled = false,
  onThemeSelect,
}: RegionThemeGraphProps) {
  const platformMotion = usePlatformMotion();

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
  const themePointLayoutKey = useMemo(
    () => getThemePointLayoutCacheKey(region, regionBounds, nodePoints),
    [nodePoints, region, regionBounds],
  );
  const { themePoints } = useMemo(() => {
    const cachedLayout = themePointLayoutCache.get(themePointLayoutKey);

    if (cachedLayout) {
      return cachedLayout;
    }

    const nextLayout = splitGraphPoints(regionBounds, nodePoints, region.themes.length);
    themePointLayoutCache.set(themePointLayoutKey, nextLayout);
    return nextLayout;
  }, [nodePoints, region.themes.length, regionBounds, themePointLayoutKey]);
  const edgeElements = useMemo(() => {
    return themePoints.map((point, index) => {
      const nextPoint = themePoints[index + 1];

      if (!nextPoint || !viewport) {
        return null;
      }

      const position = toSvgPoint(point, viewport);
      const nextPosition = toSvgPoint(nextPoint, viewport);
      const connection = buildNodeEdgeConnection(
        position,
        nextPosition,
        THEME_NODE_RADIUS,
        THEME_NODE_RADIUS,
      );
      const curve = buildRegionGraphCurve(connection.from, connection.to);

      return (
        <g key={`region-theme-edge-${region.themes[index]?.id ?? index}`}>
          <path
            d={curve}
            fill="none"
            stroke="var(--vocabulary-edge-shadow)"
            strokeWidth={1.72}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.92}
          />
          <path
            d={curve}
            fill="none"
            stroke="var(--vocabulary-edge-default)"
            strokeWidth={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.98}
          />
        </g>
      );
    });
  }, [
    region.themes,
    themePoints,
    viewport,
  ]);
  const hoverEnabled = platformMotion.shouldUseHoverAnimations;
  if (!viewport) {
    return null;
  }

  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;

  return (
    <motion.svg
      initial={svgInitial}
      animate={svgAnimate}
      transition={svgTransition}
      className="region-graph-layer pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible [--vocabulary-edge-shadow:#2E26211F] [--vocabulary-edge-default:#6D625BA8] [--vocabulary-node-stroke:#2D251F30] [--vocabulary-label-fill:var(--surface-elevated)] [--vocabulary-label-border:var(--border-primary)] [--vocabulary-label-inner-border:rgba(255,255,255,0.55)] [--vocabulary-label-highlight:rgba(255,255,255,0.55)] [--vocabulary-label-text:var(--content-primary)] dark:[--vocabulary-edge-shadow:#00000036] dark:[--vocabulary-edge-default:#ECE4DD66] dark:[--vocabulary-node-stroke:#FFFFFF52] dark:[--vocabulary-label-fill:var(--surface-secondary)] dark:[--vocabulary-label-border:rgba(255,255,255,0.12)] dark:[--vocabulary-label-inner-border:rgba(255,255,255,0.04)] dark:[--vocabulary-label-highlight:rgba(255,255,255,0.04)] dark:[--vocabulary-label-text:#F5F0EB]"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <VocabularyGraphVisualDefs idPrefix="vocabulary-theme" />
      <style>{VOCAB_NODE_HOVER_STYLE}</style>

      {edgeElements}

      {region.themes.map((theme, index) => {
        const position = toSvgPoint(themePoints[index], viewport);

        return (
          <g
            key={theme.id}
            data-vocabulary-node="true"
            className={
              theme.isAvailable && !interactionDisabled
                ? "pointer-events-auto cursor-pointer"
                : interactionDisabled && theme.isAvailable
                  ? "cursor-progress"
                  : "cursor-default"
            }
            transform={`translate(${position.x} ${position.y})`}
            onClick={() => {
              if (!theme.isAvailable || interactionDisabled) {
                return;
              }

              onThemeSelect(theme);
            }}
            aria-label={theme.label}
          >
            <VocabularyGraphLabel
              idPrefix="vocabulary-theme"
              text={formatThemeLabel(theme)}
              y={LABEL_OFFSET}
              width={LABEL_WIDTH}
              height={LABEL_HEIGHT}
              radius={LABEL_RADIUS}
              fontSize={LABEL_FONT_SIZE}
            />

            <g
              className={
                hoverEnabled && theme.isAvailable
                  ? "vocab-node-hover"
                  : undefined
              }
            >
              <circle
                r={THEME_NODE_RADIUS}
                fill={getThemeFill(theme)}
                stroke="var(--vocabulary-node-stroke)"
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
              />
              <text
                y={0.72}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={2.3}
                fontWeight={900}
                style={{ pointerEvents: "none" }}
              >
                {(theme.kanji || theme.kana || theme.label.slice(0, 1)).slice(
                  0,
                  2,
                )}
              </text>
            </g>
          </g>
        );
      })}
    </motion.svg>
  );
}

RegionThemeGraph.displayName = "RegionThemeGraph";

export default memo(RegionThemeGraph);
