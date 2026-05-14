"use client";

import { memo, useMemo } from "react";
import type { GraphNodeVisualVariant } from "@/features/graph/lib/graphTypes";
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
  shakingThemeId?: string | null;
  helpTargetThemeId?: string | null;
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
    0.44,
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

function getDistance(
  a: VocabularyRegionNodePoint,
  b: VocabularyRegionNodePoint,
) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getNearestDistance(
  point: VocabularyRegionNodePoint,
  points: VocabularyRegionNodePoint[],
) {
  if (!points.length) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(...points.map((candidate) => getDistance(point, candidate)));
}

function getThemeAnchorPoints(
  regionBounds: VocabularyRegionBounds | null,
  themeCount: number,
) {
  if (!regionBounds) {
    return [];
  }

  const center = {
    x: regionBounds.centerX,
    y: regionBounds.centerY,
  };

  if (themeCount <= 1) {
    return [center];
  }

  const aspectRatio = regionBounds.width / Math.max(regionBounds.height, 1);
  const radiusX = regionBounds.width * (aspectRatio > 1.22 ? 0.42 : 0.34);
  const radiusY = regionBounds.height * (aspectRatio < 0.82 ? 0.42 : 0.34);
  const startAngle = -Math.PI / 2;

  return Array.from({ length: themeCount }).map((_, index) => {
    const angle = startAngle + (Math.PI * 2 * index) / themeCount;

    return {
      x: center.x + Math.cos(angle) * radiusX,
      y: center.y + Math.sin(angle) * radiusY,
    };
  });
}

function selectSpreadThemePoints(
  regionBounds: VocabularyRegionBounds | null,
  nodePoints: VocabularyRegionNodePoint[],
  themeCount: number,
) {
  const center = regionBounds
    ? { x: regionBounds.centerX, y: regionBounds.centerY }
    : nodePoints[0];
  const anchors = getThemeAnchorPoints(regionBounds, themeCount);
  const regionScale = regionBounds
    ? Math.max(regionBounds.width, regionBounds.height)
    : 100;
  const selected: VocabularyRegionNodePoint[] = [];
  const remaining = [...nodePoints].sort(
    (a, b) => getDistance(a, center) - getDistance(b, center),
  );

  while (selected.length < themeCount && remaining.length > 0) {
    const anchor = anchors[selected.length] ?? center;
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    remaining.forEach((candidate, index) => {
      const nearestDistance = getNearestDistance(candidate, selected);
      const anchorDistance = getDistance(candidate, anchor);
      const centerDistance = getDistance(candidate, center);
      const spacingScore = Number.isFinite(nearestDistance)
        ? nearestDistance * 1.72
        : regionScale * 0.4;
      const score =
        spacingScore -
        anchorDistance * 0.62 -
        Math.max(0, centerDistance - regionScale * 0.48) * 0.38;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  return selected.sort(
    (a, b) =>
      Math.atan2(a.y - center.y, a.x - center.x) -
      Math.atan2(b.y - center.y, b.x - center.x),
  );
}

function splitGraphPoints(
  regionBounds: VocabularyRegionBounds | null,
  nodePoints: VocabularyRegionNodePoint[] | null,
  themeCount: number,
) {
  if (themeCount <= 0) {
    return { themePoints: [] };
  }

  if (!nodePoints || nodePoints.length < themeCount) {
    return { themePoints: [] };
  }

  const center = regionBounds
    ? { x: regionBounds.centerX, y: regionBounds.centerY }
    : nodePoints[0];
  const themePoints = selectSpreadThemePoints(
    regionBounds,
    nodePoints,
    themeCount,
  );

  return {
    themePoints: themePoints.sort(
      (a, b) =>
        Math.atan2(a.y - center.y, a.x - center.x) -
        Math.atan2(b.y - center.y, b.x - center.x),
    ),
  };
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

function splitThemeLabel(theme: VocabularyRegionThemeNode) {
  const normalized = theme.label.trim();

  if (!normalized) {
    return [theme.label];
  }

  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length <= 3) {
    return words.length ? words : [theme.label];
  }

  const lines: string[] = [];
  let startIndex = 0;

  for (let lineIndex = 0; lineIndex < 3; lineIndex += 1) {
    const remainingWords = words.length - startIndex;
    const remainingLines = 3 - lineIndex;
    const wordsForLine = Math.ceil(remainingWords / remainingLines);

    lines.push(words.slice(startIndex, startIndex + wordsForLine).join(" "));
    startIndex += wordsForLine;
  }

  return lines;
}

function getThemeVariant(index: number): GraphNodeVisualVariant {
  const variants: GraphNodeVisualVariant[] = ["red", "black"];
  return variants[index % variants.length] ?? "red";
}

function getThemePalette(
  theme: VocabularyRegionThemeNode,
  variant: GraphNodeVisualVariant,
  idPrefix: string,
) {
  if (theme.status === "locked" || !theme.isAvailable) {
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

function renderLockedNodeBadge(nodeRadius: number) {
  const badgeRadius = Math.max(nodeRadius * 0.34, 0.78);
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

function renderThemeEdge(curve: string, key: string, index: number) {
  return (
    <g
      key={key}
      className="vocabulary-graph-edge-enter"
      style={{ animationDelay: `${Math.min(index * 24, 120)}ms` }}
    >
      <path
        d={curve}
        fill="none"
        stroke="var(--vocabulary-edge-shadow)"
        strokeWidth={1.12}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.24}
      />
      <path
        d={curve}
        fill="none"
        stroke="var(--vocabulary-edge-rail)"
        strokeWidth={0.74}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.5}
      />
      <path
        d={curve}
        fill="none"
        stroke="url(#vocabulary-theme-edge-default)"
        strokeWidth={0.52}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.56}
      />
    </g>
  );
}

function RegionThemeGraph({
  region,
  regionBounds,
  nodePoints,
  viewport,
  shakingThemeId = null,
  helpTargetThemeId = null,
  interactionDisabled = false,
  onThemeSelect,
}: RegionThemeGraphProps) {
  const idPrefix = "vocabulary-theme";
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
    const themeIndexes = region.themes.map((_, index) => index);

    if (themeIndexes.length <= 1) {
      return [];
    }

    return themeIndexes.slice(0, -1).map((themeIndex, index) => {
      const nextThemeIndex = themeIndexes[index + 1];
      const point = themePoints[themeIndex];
      const nextPoint = themePoints[nextThemeIndex];

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

      return renderThemeEdge(
        curve,
        `region-theme-edge-${region.themes[themeIndex]?.id ?? themeIndex}`,
        index,
      );
    });
  }, [
    region.themes,
    themePoints,
    viewport,
  ]);
  if (!viewport || themePoints.length < region.themes.length) {
    return null;
  }

  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;

  return (
    <svg
      className="region-graph-layer vocabulary-graph-layer pointer-events-none absolute inset-0 z-20 h-full w-full overflow-hidden"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <VocabularyGraphVisualDefs idPrefix={idPrefix} />

      {edgeElements}

      {region.themes.map((theme, index) => {
        const position = toSvgPoint(themePoints[index], viewport);
        const isLockedTheme = theme.status === "locked" || !theme.isAvailable;
        const isInteractive = !isLockedTheme && !interactionDisabled;
        const variant = getThemeVariant(index);
        const palette = getThemePalette(theme, variant, idPrefix);
        const labelLines = splitThemeLabel(theme);
        const labelFontSize = labelLines.length >= 3 ? LABEL_FONT_SIZE * 0.92 : LABEL_FONT_SIZE;
        const labelWidth = clamp(
          labelLines.reduce((maxLength, line) => Math.max(maxLength, Array.from(line).length), 0) * labelFontSize * 0.69 + 1.18,
          LABEL_WIDTH,
          LABEL_WIDTH * 2.12,
        );
        const symbolLayout = getCircleTextLayout(
          theme.kanji || theme.kana || theme.label,
          THEME_NODE_RADIUS,
          1.26,
        );
        const labelHeight = Math.max(LABEL_HEIGHT, labelLines.length * labelFontSize * 1.22 + 0.7);
        const activateTheme = () => {
          if (!isInteractive) {
            return;
          }

          onThemeSelect(theme);
        };
        return (
          <g
            key={theme.id}
            data-vocabulary-node="true"
            data-help-target={theme.id === helpTargetThemeId ? "vocabulary-theme-node" : undefined}
            data-help-target-priority={theme.id === helpTargetThemeId ? "20" : undefined}
            className={
              theme.isAvailable && !interactionDisabled
                ? "pointer-events-auto cursor-pointer"
                : interactionDisabled && theme.isAvailable
                  ? "cursor-progress"
                  : "pointer-events-auto cursor-not-allowed"
            }
            transform={`translate(${position.x} ${position.y})`}
            onClick={activateTheme}
            aria-label={theme.label}
          >
            <g
              className={`vocabulary-graph-node-enter ${theme.status === "completed" ? "vocabulary-node-completed-enter" : ""} ${shakingThemeId === theme.id ? "kanji-node-shaking" : ""}`}
              style={{ animationDelay: `${Math.min(index * 28, 140)}ms` }}
            >
              <VocabularyGraphLabel
                idPrefix={idPrefix}
                text={theme.label}
                lines={labelLines}
                y={LABEL_OFFSET}
                width={labelWidth}
                height={labelHeight}
                radius={LABEL_RADIUS}
                fontSize={labelFontSize}
              />

              <g>
                <circle
                  r={THEME_NODE_RADIUS + 0.28}
                  fill={palette.shadow}
                  opacity={isLockedTheme ? 0.24 : 0.42}
                />
                <circle
                  r={THEME_NODE_RADIUS}
                  fill={palette.fill}
                  stroke={palette.stroke}
                  strokeWidth={0.8}
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  r={THEME_NODE_RADIUS - 0.14}
                  fill="none"
                  stroke="var(--vocabulary-node-inner-stroke)"
                  strokeWidth={0.14}
                  opacity={isLockedTheme ? 0.4 : 0.72}
                  vectorEffect="non-scaling-stroke"
                />
                <text
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
                      key={`${theme.id}-${line}-${lineIndex}`}
                      x={0}
                      y={symbolLayout.firstLineY + lineIndex * symbolLayout.lineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
                {isLockedTheme ? renderLockedNodeBadge(THEME_NODE_RADIUS) : null}
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

RegionThemeGraph.displayName = "RegionThemeGraph";

export default memo(RegionThemeGraph);
