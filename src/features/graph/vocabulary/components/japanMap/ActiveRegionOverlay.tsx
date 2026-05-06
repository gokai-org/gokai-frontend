"use client";

import { memo, useMemo, type CSSProperties } from "react";
import type { VocabularyRegionId } from "../../types";
import type { ParsedJapanMap } from "./japanMapAssets";
import { JAPAN_MAP_PALETTE, type RegionVisualStatus } from "./japanMapTheme";

type Props = {
  parsedMap: ParsedJapanMap;
  activeRegionId: VocabularyRegionId | null;
  loadingRegionId: VocabularyRegionId | null;
  heavyEffectsEnabled: boolean;
  activeRegionStatus?: RegionVisualStatus;
};

const OVERLAY_STYLE = `
  @keyframes vmap-active-pulse {
    0%, 100% { opacity: 0.88; }
    50% { opacity: 1; }
  }
  .vmap-active-region {
    pointer-events: none;
    transition: opacity 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .vmap-active-region g[data-active-region-paths] > * {
    fill: var(--vmap-active-fill);
    fill-opacity: 0.92;
    stroke: var(--vmap-active-stroke);
    stroke-width: 0.7;
    stroke-linejoin: round;
    paint-order: stroke fill;
    transition:
      fill 300ms cubic-bezier(0.22, 0.61, 0.36, 1),
      stroke 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .vmap-active-region.is-loading g[data-active-region-paths] {
    animation: vmap-active-pulse 1100ms ease-in-out infinite;
    will-change: opacity;
  }
`;

/**
 * Highlight overlay for the currently active region. Renders a single SVG that
 * draws only the selected region's geometry with the region color and an
 * optional drop-shadow glow scoped to that path. When no region is active it
 * renders nothing, so the cost is essentially zero on the map view.
 */
function ActiveRegionOverlay({
  parsedMap,
  activeRegionId,
  loadingRegionId,
  heavyEffectsEnabled,
  activeRegionStatus,
}: Props) {
  const isLoading = activeRegionId !== null && loadingRegionId === activeRegionId;

  const style = useMemo<CSSProperties | undefined>(() => {
    if (!activeRegionId) {
      return undefined;
    }

    const isCompleted = activeRegionStatus === "completed";
    const fill = isCompleted
      ? JAPAN_MAP_PALETTE.regionCompleted
      : JAPAN_MAP_PALETTE.regionActive;
    const stroke = isCompleted
      ? JAPAN_MAP_PALETTE.strokeCompleted
      : JAPAN_MAP_PALETTE.strokeActive;

    const cssVars: Record<string, string> = {
      "--vmap-active-fill": fill,
      "--vmap-active-stroke": stroke,
    };

    if (heavyEffectsEnabled) {
      // Glow scoped to the active region only \u2014 not applied to the whole map.
      cssVars.filter = isCompleted
        ? "drop-shadow(0 0 4.5px rgba(214, 219, 226, 0.16))"
        : "drop-shadow(0 0 4.5px rgba(214, 74, 74, 0.42))";
    }

    return cssVars as unknown as CSSProperties;
  }, [activeRegionId, activeRegionStatus, heavyEffectsEnabled]);

  if (!activeRegionId) {
    return null;
  }

  return (
    <svg
      viewBox={parsedMap.viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className={`vmap-active-region absolute inset-0 h-full w-full${
        isLoading ? " is-loading" : ""
      }`}
      shapeRendering="auto"
      style={style}
    >
      <style>{OVERLAY_STYLE}</style>
      <g
        key={activeRegionId}
        data-active-region-paths={activeRegionId}
        dangerouslySetInnerHTML={{
          __html: parsedMap.regionMarkupById[activeRegionId] ?? "",
        }}
      />
    </svg>
  );
}

export default memo(ActiveRegionOverlay);
