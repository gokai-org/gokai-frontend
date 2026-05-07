"use client";

import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import { REGION_ORDER } from "../../lib/vocabularyRegions";
import type { VocabularyRegionId } from "../../types";
import type { ParsedJapanMap } from "./japanMapAssets";

export type MeasurementLayerHandle = {
  getSvg: () => SVGSVGElement | null;
  getRegionGroup: (regionId: VocabularyRegionId) => SVGGElement | null;
};

type Props = {
  parsedMap: ParsedJapanMap;
};

/**
 * Off-screen SVG that hosts only region geometry for `getBBox` and
 * `isPointInFill`. It stays hidden instead of `display: none` so SVG
 * measurement APIs remain functional.
 */
const MeasurementLayer = memo(
  forwardRef<MeasurementLayerHandle, Props>(function MeasurementLayer(
    { parsedMap },
    ref,
  ) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const regionRefs = useRef<Partial<Record<VocabularyRegionId, SVGGElement | null>>>({});

    useImperativeHandle(
      ref,
      () => ({
        getSvg: () => svgRef.current,
        getRegionGroup: (regionId) => regionRefs.current[regionId] ?? null,
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
      </svg>
    );
  }),
);

MeasurementLayer.displayName = "MeasurementLayer";

export default MeasurementLayer;
