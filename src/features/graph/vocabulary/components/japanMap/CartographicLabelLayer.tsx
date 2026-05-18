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
  desktopPath: string;
  mobilePath: string;
  size: number;
  tracking: number;
  startOffset?: string;
};

const WATER_LABELS: WaterLabelDefinition[] = [
  {
    id: "sea-of-japan",
    label: "Mar de Japón",
    desktopPath: "M 4 164 C 88 146 184 146 296 168",
    mobilePath: "M 12 132 C 74 120 144 120 220 136",
    size: 20.5,
    tracking: 1.3,
    startOffset: "50%",
  },
  {
    id: "pacific-ocean",
    label: "Océano Pacífico",
    desktopPath: "M 278 458 C 344 450 410 466 474 512",
    mobilePath: "M 186 486 C 252 480 322 496 392 534",
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
          <g key={label.id}>
            <path
              id={`vmap-water-path-${label.id}-desktop`}
              d={label.desktopPath}
            />
            <path
              id={`vmap-water-path-${label.id}-mobile`}
              d={label.mobilePath}
            />
          </g>
        ))}
      </defs>
      <g className={`vmap-cartography-water${activeRegionId ? " is-muted" : ""}`}>
        {WATER_LABELS.map((label) => (
          <g key={label.id} className={`vmap-cartography-water-label vmap-cartography-water-label--${label.id}`}>
            <text
              className="vmap-cartography-text vmap-cartography-text--water vmap-cartography-text--desktop"
              fontSize={label.size}
              letterSpacing={label.tracking}
            >
              <textPath
                href={`#vmap-water-path-${label.id}-desktop`}
                startOffset={label.startOffset ?? "50%"}
                textAnchor="middle"
              >
                {label.label}
              </textPath>
            </text>
            <text
              className="vmap-cartography-text vmap-cartography-text--water vmap-cartography-text--mobile"
              fontSize={label.size}
              letterSpacing={label.tracking}
            >
              <textPath
                href={`#vmap-water-path-${label.id}-mobile`}
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