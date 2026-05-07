"use client";

import { memo, useCallback, type MouseEvent } from "react";
import { REGION_ORDER } from "../../lib/vocabularyRegions";
import type { VocabularyRegionId } from "../../types";
import type { ParsedJapanMap } from "./japanMapAssets";
import type { RegionVisualStatus } from "./japanMapTheme";

export type { RegionVisualStatus };

type Props = {
  parsedMap: ParsedJapanMap;
  regionStatusByRegion: Partial<Record<VocabularyRegionId, RegionVisualStatus>>;
  activeRegionId: VocabularyRegionId | null;
  onRegionSelect: (regionId: VocabularyRegionId) => void;
};

/**
 * Lightweight SVG overlay rendered on top of the static Japan map. It hosts
 * only the eight Japanese regions as transparent hit-targets so React never
 * sees the thousands of decorative paths from the original SVG.
 *
 * - Hover effects are pure CSS (no React state per pointer move).
 * - Click handling uses event delegation: a single `onClick` on the SVG.
 */
function InteractiveRegionLayer({
  parsedMap,
  regionStatusByRegion,
  activeRegionId,
  onRegionSelect,
}: Props) {
  const hasSelection = activeRegionId !== null;

  const handleClick = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const regionElement = target.closest<SVGElement>("[data-vocabulary-region]");
      const regionId = regionElement?.getAttribute("data-vocabulary-region") as
        | VocabularyRegionId
        | null;

      if (regionId) {
        onRegionSelect(regionId);
      }
    },
    [onRegionSelect],
  );

  return (
    <svg
      viewBox={parsedMap.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="vmap-hit-layer absolute inset-0 h-full w-full"
      role="presentation"
      aria-hidden="false"
      shapeRendering="auto"
      onClick={handleClick}
      data-has-selection={hasSelection ? "true" : undefined}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {REGION_ORDER.map((regionId) => (
        <g
          key={regionId}
          className="vmap-hit-region"
          data-vocabulary-region={regionId}
          data-region-path={regionId}
          data-status={regionStatusByRegion[regionId] ?? "available"}
          data-active={activeRegionId === regionId ? "true" : "false"}
          dangerouslySetInnerHTML={{
            __html: parsedMap.regionMarkupById[regionId] ?? "",
          }}
        />
      ))}
    </svg>
  );
}

export default memo(InteractiveRegionLayer);
