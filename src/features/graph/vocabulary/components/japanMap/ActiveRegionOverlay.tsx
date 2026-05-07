"use client";

import { memo, useMemo, type CSSProperties } from "react";
import type { VocabularyRegionId } from "../../types";
import type { ParsedJapanMap } from "./japanMapAssets";
import type { RegionVisualStatus } from "./japanMapTheme";

type Props = {
  parsedMap: ParsedJapanMap;
  activeRegionId: VocabularyRegionId | null;
  loadingRegionId: VocabularyRegionId | null;
  activeRegionStatus?: RegionVisualStatus;
};

/**
 * Highlight overlay for the currently active region. Renders a single SVG that
 * draws only the selected region's geometry with the region color. When no
 * region is active it renders nothing, so the cost is essentially zero.
 */
function ActiveRegionOverlay({
  parsedMap,
  activeRegionId,
  loadingRegionId,
  activeRegionStatus,
}: Props) {
  const isLoading = activeRegionId !== null && loadingRegionId === activeRegionId;

  const style = useMemo<CSSProperties | undefined>(() => {
    if (!activeRegionId) {
      return undefined;
    }

    const isCompleted = activeRegionStatus === "completed";

    // Colors are resolved from CSS variables defined in globals.css so they
    // automatically adapt to light / dark mode without JS theme detection.
    const cssVars: Record<string, string> = {
      "--vmap-active-fill": isCompleted
        ? "var(--vmap-ar-fill-completed)"
        : "var(--vmap-ar-fill-available)",
      "--vmap-active-stroke": isCompleted
        ? "var(--vmap-ar-stroke-completed)"
        : "var(--vmap-ar-stroke-available)",
    };

    return cssVars as unknown as CSSProperties;
  }, [activeRegionId, activeRegionStatus]);

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
