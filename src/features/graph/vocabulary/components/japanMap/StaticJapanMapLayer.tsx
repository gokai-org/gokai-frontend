"use client";

import { memo, type CSSProperties } from "react";
import { MAP_SOURCE_URL, type ParsedJapanMap } from "./japanMapAssets";

const STATIC_LAYER_STYLE: CSSProperties = {
  objectFit: "contain",
  pointerEvents: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
  WebkitTouchCallout: "none",
};

type StaticJapanMapLayerProps = {
  parsedMap?: ParsedJapanMap | null;
};

/**
 * Renders the detailed Japan map (regions + interior icons) as vector SVG.
 *
 * Once parsed, the SVG is inline so zoomed views stay sharp. Before parsing
 * finishes, the external image is used as a cheap loading fallback.
 */
function StaticJapanMapLayer({ parsedMap = null }: StaticJapanMapLayerProps) {
  if (parsedMap?.svgInnerMarkup) {
    return (
      <svg
        viewBox={parsedMap.viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        focusable="false"
        className="vmap-static-base vmap-static-svg absolute inset-0 h-full w-full select-none"
        dangerouslySetInnerHTML={{ __html: parsedMap.svgInnerMarkup }}
      />
    );
  }

  return (
    <img
      src={MAP_SOURCE_URL}
      alt=""
      aria-hidden
      draggable={false}
      decoding="async"
      fetchPriority="high"
      className="vmap-static-base absolute inset-0 h-full w-full select-none"
      style={STATIC_LAYER_STYLE}
    />
  );
}

export default memo(StaticJapanMapLayer);
