"use client";

import { Fragment, memo, useCallback, useId } from "react";
import { REGION_ORDER } from "../../lib/vocabularyRegions";
import type { VocabularyRegionId } from "../../types";
import type { ParsedJapanMap } from "./japanMapAssets";
import {
  JAPAN_MAP_PALETTE,
  type RegionVisualStatus,
} from "./japanMapTheme";

export type { RegionVisualStatus };

type Props = {
  parsedMap: ParsedJapanMap;
  regionStatusByRegion: Partial<Record<VocabularyRegionId, RegionVisualStatus>>;
  activeRegionId: VocabularyRegionId | null;
  onRegionSelect: (regionId: VocabularyRegionId) => void;
};

// Resting fills are intentionally semi-transparent so the cultural icons
// from the static base layer remain faintly visible through each region.
// Hover/active brighten the fill to make the selection pop without ever
// touching React state.
const HIT_LAYER_STYLE = `
  .vmap-hit-layer {
    contain: layout paint style;
    isolation: isolate;
  }
  .vmap-hit-layer .vmap-hit-region {
    fill: transparent;
    stroke: ${JAPAN_MAP_PALETTE.strokeIdle};
    stroke-width: 0.45;
    cursor: pointer;
    pointer-events: auto;
    touch-action: manipulation;
    /* Group-level opacity used by the selection-dim rules below */
    transition: opacity 350ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .vmap-hit-layer .vmap-hit-region > * {
    fill: inherit;
    stroke: inherit;
    stroke-width: inherit;
    pointer-events: auto;
    transition:
      fill 280ms cubic-bezier(0.22, 0.61, 0.36, 1),
      stroke 280ms cubic-bezier(0.22, 0.61, 0.36, 1),
      stroke-width 280ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .vmap-hit-layer .vmap-region-icons {
    opacity: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    transition: opacity 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
    /* fill/stroke cascade into <use> shadow tree via SVG inheritance */
    fill: ${JAPAN_MAP_PALETTE.iconHover};
    fill-opacity: 0.94;
    stroke: rgba(255, 255, 255, 0.08);
    stroke-width: 0.16;
  }
  .vmap-hit-layer .vmap-hit-region[data-status="locked"] {
    fill: ${JAPAN_MAP_PALETTE.regionIdle};
    fill-opacity: 0.45;
    cursor: not-allowed;
  }
  .vmap-hit-layer .vmap-hit-region[data-status="available"] {
    fill: ${JAPAN_MAP_PALETTE.regionAvailable};
    fill-opacity: 0.50;
  }
  .vmap-hit-layer .vmap-hit-region[data-status="completed"] {
    fill: ${JAPAN_MAP_PALETTE.regionCompleted};
    fill-opacity: 0.72;
    stroke: ${JAPAN_MAP_PALETTE.strokeCompleted};
    stroke-width: 0.55;
  }
  .vmap-hit-layer .vmap-hit-region[data-active="true"] {
    pointer-events: auto;
    fill-opacity: 0;
    stroke-opacity: 0;
  }
  .vmap-hit-layer .vmap-hit-region[data-active="true"] + .vmap-region-icons {
    opacity: 0.88;
  }
  @media (hover: hover) {
    .vmap-hit-layer .vmap-hit-region:not([data-status="locked"]):not([data-active="true"]):hover {
      fill: ${JAPAN_MAP_PALETTE.regionHover};
      fill-opacity: 0.80;
      stroke: ${JAPAN_MAP_PALETTE.strokeHover};
      stroke-width: 0.65;
    }
    .vmap-hit-layer .vmap-hit-region:not([data-status="locked"]):hover + .vmap-region-icons {
      opacity: 0.78;
    }
    .vmap-hit-layer .vmap-hit-region[data-status="locked"]:hover {
      fill-opacity: 0.60;
      stroke: rgba(255, 255, 255, 0.14);
    }
  }
  /* Selection dim — placed after hover rules so they win at equal specificity.
     When a region is active, all inactive regions recede visually. */
  .vmap-hit-layer[data-has-selection="true"] .vmap-hit-region:not([data-active="true"]) {
    opacity: 0.28;
  }
  /* Hide icon overlays for inactive regions during selection */
  .vmap-hit-layer[data-has-selection="true"] .vmap-hit-region:not([data-active="true"]) + .vmap-region-icons {
    opacity: 0;
  }
  /* Keep the active region's icon overlay fully visible (last rule wins at equal specificity) */
  .vmap-hit-layer[data-has-selection="true"] .vmap-hit-region[data-active="true"] + .vmap-region-icons {
    opacity: 0.88;
  }
`;

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
  const clipPathPrefix = useId().replace(/:/g, "");
  const hasSelection = activeRegionId !== null;

  const handleClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
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
      <style>{HIT_LAYER_STYLE}</style>
      <defs>
        {/* Shared icon geometry — defined once, referenced 8× via <use>.
            This cuts the DOM element count by 7/8 compared to inlining the
            full iconMarkup in every region group. */}
        <g
          id={`${clipPathPrefix}-icon-set`}
          dangerouslySetInnerHTML={{ __html: parsedMap.iconMarkup }}
        />
        {REGION_ORDER.map((regionId) => (
          <clipPath
            key={`${regionId}-clip`}
            id={`${clipPathPrefix}-${regionId}`}
            dangerouslySetInnerHTML={{
              __html: parsedMap.regionMarkupById[regionId] ?? "",
            }}
          />
        ))}
      </defs>
      {REGION_ORDER.map((regionId) => (
        <Fragment key={regionId}>
          <g
            className="vmap-hit-region"
            data-vocabulary-region={regionId}
            data-region-path={regionId}
            data-status={regionStatusByRegion[regionId] ?? "available"}
            data-active={activeRegionId === regionId ? "true" : "false"}
            dangerouslySetInnerHTML={{
              __html: parsedMap.regionMarkupById[regionId] ?? "",
            }}
          />
          <g
            className="vmap-region-icons"
            aria-hidden="true"
            clipPath={`url(#${clipPathPrefix}-${regionId})`}
          >
            {/* Reference the shared icon set — browser clips to this region's
                geometry. Only 1× of the icon paths live in the DOM instead of
                8×, reducing layout/style/paint work during transitions. */}
            <use href={`#${clipPathPrefix}-icon-set`} />
          </g>
        </Fragment>
      ))}
    </svg>
  );
}

export default memo(InteractiveRegionLayer);
