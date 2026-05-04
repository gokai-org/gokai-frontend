"use client";

import { motion } from "framer-motion";
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

type RegionThemeGraphProps = {
  region: VocabularyRegionViewModel;
  regionBounds: VocabularyRegionBounds | null;
  nodePoints: VocabularyRegionNodePoint[] | null;
  viewport: VocabularySvgViewport | null;
  actionPendingId: string | null;
  onThemeSelect: (theme: VocabularyRegionThemeNode) => void;
  onBack: () => void;
};

const BACK_NODE_RADIUS = 3.9;
const THEME_NODE_RADIUS = 3.05;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const NODE_LAYOUTS: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 0.5, y: 0.52 }],
  2: [
    { x: 0.4, y: 0.42 },
    { x: 0.62, y: 0.6 },
  ],
  3: [
    { x: 0.38, y: 0.4 },
    { x: 0.64, y: 0.42 },
    { x: 0.5, y: 0.66 },
  ],
  4: [
    { x: 0.38, y: 0.38 },
    { x: 0.63, y: 0.36 },
    { x: 0.4, y: 0.64 },
    { x: 0.63, y: 0.62 },
  ],
  5: [
    { x: 0.34, y: 0.38 },
    { x: 0.5, y: 0.3 },
    { x: 0.68, y: 0.42 },
    { x: 0.4, y: 0.66 },
    { x: 0.62, y: 0.62 },
  ],
  6: [
    { x: 0.35, y: 0.36 },
    { x: 0.5, y: 0.28 },
    { x: 0.66, y: 0.38 },
    { x: 0.36, y: 0.62 },
    { x: 0.5, y: 0.7 },
    { x: 0.65, y: 0.6 },
  ],
};

function projectPoint(
  regionBounds: VocabularyRegionBounds,
  point: { x: number; y: number },
) {
  const labelPaddingX = Math.max(
    4.8,
    Math.min(10.5, regionBounds.width * 0.18),
  );
  const labelPaddingY = Math.max(4.4, Math.min(10, regionBounds.height * 0.2));
  const insetX = Math.max(labelPaddingX, regionBounds.width * 0.16);
  const insetY = Math.max(labelPaddingY, regionBounds.height * 0.17);
  const minX = regionBounds.x + insetX;
  const maxX = regionBounds.x + regionBounds.width - insetX;
  const minY = regionBounds.y + insetY;
  const maxY = regionBounds.y + regionBounds.height - insetY;

  return {
    x: clamp(
      minX + (maxX - minX) * point.x,
      regionBounds.x + labelPaddingX,
      regionBounds.x + regionBounds.width - labelPaddingX,
    ),
    y: clamp(
      minY + (maxY - minY) * point.y,
      regionBounds.y + labelPaddingY,
      regionBounds.y + regionBounds.height - labelPaddingY,
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
      x: 0.2 + (0.6 / Math.max(columns - 1, 1)) * column,
      y: rows === 1 ? 0.5 : 0.22 + (0.56 / Math.max(rows - 1, 1)) * row,
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

function splitGraphPoints(
  regionBounds: VocabularyRegionBounds | null,
  nodePoints: VocabularyRegionNodePoint[] | null,
  themeCount: number,
) {
  const fallbackPoints = buildNodePositions(regionBounds, themeCount + 1);
  const center = regionBounds
    ? { x: regionBounds.centerX, y: regionBounds.centerY }
    : fallbackPoints[0];
  const points =
    nodePoints && nodePoints.length >= themeCount + 1
      ? [...nodePoints]
      : fallbackPoints;
  let backIndex = 0;
  let backDistance = Number.POSITIVE_INFINITY;

  points.forEach((point, index) => {
    const distance = getDistance(point, center);

    if (distance < backDistance) {
      backDistance = distance;
      backIndex = index;
    }
  });

  const backPoint = points[backIndex] ?? center;
  const themePoints = points
    .filter((_, index) => index !== backIndex)
    .sort(
      (a, b) =>
        Math.atan2(a.y - backPoint.y, a.x - backPoint.x) -
        Math.atan2(b.y - backPoint.y, b.x - backPoint.x),
    )
    .slice(0, themeCount);

  while (themePoints.length < themeCount) {
    themePoints.push(fallbackPoints[themePoints.length + 1] ?? center);
  }

  return { backPoint, themePoints };
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

export default function RegionThemeGraph({
  region,
  regionBounds,
  nodePoints,
  viewport,
  actionPendingId,
  onThemeSelect,
  onBack,
}: RegionThemeGraphProps) {
  if (!viewport) {
    return null;
  }

  const { backPoint, themePoints } = splitGraphPoints(
    regionBounds,
    nodePoints,
    region.themes.length,
  );
  const backPosition = toSvgPoint(backPoint, viewport);
  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;

  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="region-graph-layer pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {themePoints.map((point, index) => {
        const position = toSvgPoint(point, viewport);
        const connection = buildNodeEdgeConnection(
          backPosition,
          position,
          BACK_NODE_RADIUS,
          THEME_NODE_RADIUS,
        );

        return (
          <motion.path
            key={`region-theme-edge-${region.themes[index]?.id ?? index}`}
            d={buildRegionGraphCurve(connection.from, connection.to)}
            fill="none"
            stroke="rgba(255,255,255,0.52)"
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.28}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}

      <g
        data-vocabulary-node="true"
        className="pointer-events-auto cursor-pointer"
        transform={`translate(${backPosition.x} ${backPosition.y})`}
        onClick={onBack}
        aria-label="Regresar"
      >
        <motion.g
          initial={{ opacity: 0, scale: 0.55 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.14 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle
            r={BACK_NODE_RADIUS}
            fill="var(--accent-hover)"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth={0.85}
            vectorEffect="non-scaling-stroke"
          />
          <text
            y={0.82}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={2.65}
            fontWeight={900}
            style={{ pointerEvents: "none" }}
          >
            戻
          </text>
        </motion.g>
      </g>

      {region.themes.map((theme, index) => {
        const position = toSvgPoint(themePoints[index], viewport);
        const pending = Boolean(
          theme.themeId && actionPendingId === theme.themeId,
        );

        return (
          <g
            key={theme.id}
            data-vocabulary-node="true"
            className={
              theme.isAvailable
                ? "pointer-events-auto cursor-pointer"
                : "cursor-default"
            }
            transform={`translate(${position.x} ${position.y})`}
            onClick={() => onThemeSelect(theme)}
            aria-label={theme.label}
          >
            <motion.g
              initial={{ opacity: 0, scale: 0.55 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={theme.isAvailable ? { scale: 1.18 } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <circle
                r={THEME_NODE_RADIUS}
                fill={getThemeFill(theme)}
                stroke="rgba(255,255,255,0.32)"
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
              {pending ? (
                <circle
                  cx={2.35}
                  cy={-2.35}
                  r={0.95}
                  fill="white"
                  stroke="var(--accent)"
                  strokeWidth={0.45}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </motion.g>
          </g>
        );
      })}
    </motion.svg>
  );
}
