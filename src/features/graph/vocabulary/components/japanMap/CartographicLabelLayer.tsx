"use client";

import { memo } from "react";
import type { VocabularyRegionId } from "../../types";
import type { ParsedJapanMap } from "./japanMapAssets";

type Props = {
  parsedMap: ParsedJapanMap;
  activeRegionId: VocabularyRegionId | null;
};

export const REGION_JP_LABELS: Record<VocabularyRegionId, string> = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kansai: "関西",
  chugoku: "中国",
  shikoku: "四国",
  kyushu: "九州",
};

type WaterLabelDefinition = {
  id: string;
  label: string;
  path: string;
  size: number;
  tracking: number;
  startOffset?: string;
};

const WATER_LABELS: WaterLabelDefinition[] = [
  {
    id: "sea-of-japan",
    label: "Mar de Japón",
    path: "M 34 154 C 122 138 226 140 334 166",
    size: 20.5,
    tracking: 1.3,
    startOffset: "50%",
  },
  {
    id: "pacific-ocean",
    label: "Océano Pacífico",
    path: "M 326 382 C 406 372 476 388 552 432",
    size: 18.8,
    tracking: 1.24,
    startOffset: "50%",
  },
];

function CartographicLabelLayer({
  parsedMap,
  activeRegionId,
}: Props) {
  return (
    <svg
      viewBox={parsedMap.viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
      className="vmap-cartography-layer absolute inset-0 z-20 h-full w-full"
      textRendering="geometricPrecision"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {WATER_LABELS.map((label) => (
          <path key={label.id} id={`vmap-water-path-${label.id}`} d={label.path} />
        ))}
      </defs>
      <g className={`vmap-cartography-water${activeRegionId ? " is-muted" : ""}`}>
        {WATER_LABELS.map((label) => (
          <g key={label.id} className="vmap-cartography-water-label">
            <text
              className="vmap-cartography-text vmap-cartography-text--water"
              fontSize={label.size}
              letterSpacing={label.tracking}
            >
              <textPath
                href={`#vmap-water-path-${label.id}`}
                startOffset={label.startOffset ?? "50%"}
                textAnchor="middle"
              >
                {label.label}
              </textPath>
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default memo(CartographicLabelLayer);