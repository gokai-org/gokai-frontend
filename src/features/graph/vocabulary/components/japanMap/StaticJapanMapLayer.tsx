"use client";

import { memo } from "react";
import { MAP_SOURCE_URL } from "./japanMapAssets";

const BASE_LAYER_STYLE: React.CSSProperties = {
  objectFit: "contain",
  pointerEvents: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
  WebkitTouchCallout: "none",
  // Single image-level filter — cheap because it applies to ONE rasterized
  // bitmap, not to thousands of SVG paths. Knocks the bright reds down to a
  // muted maroon so the rest state reads as dark and premium.
  filter: "brightness(0.34) saturate(0.42) contrast(1.08)",
};

const ICON_LAYER_STYLE: React.CSSProperties = {
  objectFit: "contain",
  pointerEvents: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
  WebkitTouchCallout: "none",
  // The browser caches the SVG so this second <img> is essentially free.
  // Grayscale + brightness flattens the image to luminance, then `screen`
  // blending lifts only the lightest shapes (the cultural icons that were
  // white in the source) onto the dark base as faint engravings.
  filter: "grayscale(1) brightness(1.35) contrast(1.1)",
  mixBlendMode: "screen",
  opacity: 0.27,
};

/**
 * Renders the detailed Japan map (regions + interior icons) as static images.
 *
 * The browser handles SVG parsing/rasterization, so this layer never enters
 * the React reconciliation loop after mount and never re-renders on hover or
 * selection. It is purely visual and ignores pointer events.
 *
 * Two stacked images:
 *   - Base: heavily desaturated and dimmed — provides the dark premium tone.
 *   - Icon overlay: grayscale + screen blend — re-introduces the cultural
 *     icons as subtle engravings without hardcoding any per-icon markup.
 */
function StaticJapanMapLayer() {
  return (
    <>
      <img
        src={MAP_SOURCE_URL}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        fetchPriority="high"
        className="vmap-static-base absolute inset-0 h-full w-full select-none"
        style={BASE_LAYER_STYLE}
      />
      <img
        src={MAP_SOURCE_URL}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="vmap-static-icons absolute inset-0 h-full w-full select-none"
        style={ICON_LAYER_STYLE}
      />
    </>
  );
}

export default memo(StaticJapanMapLayer);
