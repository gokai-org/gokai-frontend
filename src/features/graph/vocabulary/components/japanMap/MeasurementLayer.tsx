"use client";

import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import { REGION_ORDER } from "../../lib/vocabularyRegions";
import type { VocabularyRegionId } from "../../types";
import type { ParsedJapanMap } from "./japanMapAssets";

const SVG_GEOMETRY_SELECTOR = "path, polygon, circle, ellipse, rect";

export type MeasurementLayerHandle = {
  getSvg: () => SVGSVGElement | null;
  getRegionGroup: (regionId: VocabularyRegionId) => SVGGElement | null;
  getIconShapes: () => SVGGeometryElement[];
};

type Props = {
  parsedMap: ParsedJapanMap;
};

/**
 * Off-screen SVG that hosts the region geometry and icon shapes. It is used
 * exclusively for `getBBox` and `isPointInFill` computations performed when
 * placing nodes inside a region. It is `visibility: hidden` (not
 * `display: none`) so SVG measurement APIs remain functional.
 */
const MeasurementLayer = memo(
  forwardRef<MeasurementLayerHandle, Props>(function MeasurementLayer(
    { parsedMap },
    ref,
  ) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const regionRefs = useRef<Partial<Record<VocabularyRegionId, SVGGElement | null>>>({});
    const iconGroupRef = useRef<SVGGElement | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        getSvg: () => svgRef.current,
        getRegionGroup: (regionId) => regionRefs.current[regionId] ?? null,
        getIconShapes: () => {
          const group = iconGroupRef.current;
          if (!group) {
            return [];
          }
          return Array.from(
            group.querySelectorAll<SVGGeometryElement>(SVG_GEOMETRY_SELECTOR),
          ).filter(
            (element): element is SVGGeometryElement =>
              typeof element.isPointInFill === "function",
          );
        },
      }),
      [],
    );

    return (
      <svg
        ref={svgRef}
        viewBox={parsedMap.viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        focusable="false"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          visibility: "hidden",
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {REGION_ORDER.map((regionId) => (
          <g
            key={regionId}
            ref={(element) => {
              regionRefs.current[regionId] = element;
            }}
            data-vocabulary-region-clone={regionId}
            dangerouslySetInnerHTML={{
              __html: parsedMap.regionMarkupById[regionId] ?? "",
            }}
          />
        ))}
        {parsedMap.iconMarkup ? (
          <g
            ref={iconGroupRef}
            data-vocabulary-icon-clones=""
            dangerouslySetInnerHTML={{ __html: parsedMap.iconMarkup }}
          />
        ) : null}
      </svg>
    );
  }),
);

MeasurementLayer.displayName = "MeasurementLayer";

export default MeasurementLayer;
