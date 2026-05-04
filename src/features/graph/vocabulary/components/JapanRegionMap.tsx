"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  VocabularyRegionId,
  VocabularyRegionLayout,
  VocabularyRegionViewModel,
} from "../types";
import { buildRegionLayout } from "../lib/regionNodePlacement";
import { REGION_FILL_TO_ID, REGION_ORDER } from "../lib/vocabularyRegions";

type JapanRegionMapProps = {
  regions: VocabularyRegionViewModel[];
  selectedRegionId: VocabularyRegionId | null;
  layoutCountsByRegion?: Partial<Record<VocabularyRegionId, number>>;
  onRegionSelect: (regionId: VocabularyRegionId) => void;
  onRegionHover: (
    payload: { regionId: VocabularyRegionId; x: number; y: number } | null,
  ) => void;
  onLayoutChange: (
    layout: Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>,
  ) => void;
};

type ParsedMap = {
  viewBox: string;
  baseRegions: Partial<Record<VocabularyRegionId, string>>;
  activeRegions: Partial<Record<VocabularyRegionId, string>>;
};

type MapTextLabel = {
  key: string;
  x: number;
  y: number;
  lines: string[];
  fontSize: number;
  rotate?: number;
  anchor?: "start" | "middle" | "end";
  italic?: boolean;
  letterSpacing?: number;
  fontWeight?: number;
  opacity?: number;
};

const DEFAULT_MAP_VIEWBOX = "0 0 483 545";
const SVG_REGION_SHAPE_SELECTOR =
  "path[fill], polygon[fill], circle[fill], ellipse[fill], rect[fill]";
const MAP_BASE_FILL = "#1B1A1D";
const MAP_DIVIDER_STROKE = "#262528";
const MAP_BACKGROUND_LABELS: MapTextLabel[] = [
  {
    key: "china",
    x: 72,
    y: 58,
    lines: ["CHINA"],
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 6,
    opacity: 0.42,
  },
  {
    key: "russia",
    x: 222,
    y: 62,
    lines: ["RUSSIA"],
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: 5,
    opacity: 0.42,
  },
  {
    key: "north-korea",
    x: 68,
    y: 162,
    lines: ["NORTH", "KOREA"],
    fontSize: 12,
    anchor: "middle",
    letterSpacing: 2.2,
    opacity: 0.44,
  },
  {
    key: "south-korea",
    x: 92,
    y: 218,
    lines: ["SOUTH", "KOREA"],
    fontSize: 12,
    anchor: "middle",
    letterSpacing: 2.2,
    opacity: 0.44,
  },
  {
    key: "japan",
    x: 300,
    y: 242,
    lines: ["JAPAN"],
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: 9,
    opacity: 0.24,
  },
  {
    key: "sea-of-japan",
    x: 182,
    y: 210,
    lines: ["SEA OF JAPAN"],
    fontSize: 15,
    rotate: -62,
    italic: true,
    letterSpacing: 6,
    opacity: 0.23,
  },
  {
    key: "north-pacific",
    x: 446,
    y: 298,
    lines: ["NORTH PACIFIC OCEAN"],
    fontSize: 14,
    rotate: -78,
    italic: true,
    letterSpacing: 5,
    opacity: 0.22,
  },
  {
    key: "philippine-sea",
    x: 228,
    y: 497,
    lines: ["PHILIPPINE SEA"],
    fontSize: 14,
    italic: true,
    letterSpacing: 5,
    opacity: 0.24,
  },
  {
    key: "ryukyu-islands",
    x: 36,
    y: 470,
    lines: ["RYUKYU ISLANDS"],
    fontSize: 11,
    rotate: -21,
    italic: true,
    letterSpacing: 3,
    opacity: 0.22,
  },
  {
    key: "east-china-sea",
    x: 54,
    y: 452,
    lines: ["EAST CHINA SEA"],
    fontSize: 13,
    rotate: -34,
    italic: true,
    letterSpacing: 4,
    opacity: 0.22,
  },
  {
    key: "yellow-sea",
    x: 16,
    y: 280,
    lines: ["YELLOW SEA"],
    fontSize: 12,
    rotate: -75,
    italic: true,
    letterSpacing: 4,
    opacity: 0.22,
  },
];

function renderMapLabel(label: MapTextLabel) {
  const lineHeight = label.fontSize * 1.1;

  return (
    <text
      key={label.key}
      x={label.x}
      y={label.y}
      textAnchor={label.anchor ?? "start"}
      fontSize={label.fontSize}
      fontStyle={label.italic ? "italic" : "normal"}
      fontWeight={label.fontWeight ?? 500}
      opacity={label.opacity ?? 0.34}
      transform={label.rotate ? `rotate(${label.rotate} ${label.x} ${label.y})` : undefined}
      style={{
        letterSpacing: `${label.letterSpacing ?? 3}px`,
        fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {label.lines.map((line, index) => (
        <tspan key={`${label.key}-${line}`} x={label.x} dy={index === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function normalizeHex(value?: string | null) {
  return (value ?? "").trim().toUpperCase();
}

function buildRegionMarkup(svgText: string): ParsedMap {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgText, "image/svg+xml");
  const svg = document.querySelector("svg");
  const baseMarkup: Partial<Record<VocabularyRegionId, string[]>> = {};
  const activeMarkup: Partial<Record<VocabularyRegionId, string[]>> = {};

  if (!svg) {
    return {
      viewBox: DEFAULT_MAP_VIEWBOX,
      baseRegions: {},
      activeRegions: {},
    };
  }

  svg.querySelectorAll(SVG_REGION_SHAPE_SELECTOR).forEach((shape) => {
    const originalFill = normalizeHex(shape.getAttribute("fill"));
    const regionId = REGION_FILL_TO_ID[originalFill];

    if (!regionId) {
      return;
    }

    const baseShape = shape.cloneNode(true);
    const activeShape = shape.cloneNode(true);

    if (!(baseShape instanceof Element) || !(activeShape instanceof Element)) {
      return;
    }

    baseShape.setAttribute("fill", MAP_BASE_FILL);
    baseShape.setAttribute("stroke", MAP_DIVIDER_STROKE);

    activeShape.setAttribute("fill", originalFill);
    activeShape.setAttribute("stroke", MAP_DIVIDER_STROKE);

    baseMarkup[regionId] = [...(baseMarkup[regionId] ?? []), baseShape.outerHTML];
    activeMarkup[regionId] = [...(activeMarkup[regionId] ?? []), activeShape.outerHTML];
  });

  return {
    viewBox: svg.getAttribute("viewBox") || DEFAULT_MAP_VIEWBOX,
    baseRegions: Object.fromEntries(
      REGION_ORDER.map((regionId) => [
        regionId,
        (baseMarkup[regionId] ?? []).join(""),
      ]),
    ),
    activeRegions: Object.fromEntries(
      REGION_ORDER.map((regionId) => [
        regionId,
        (activeMarkup[regionId] ?? []).join(""),
      ]),
    ),
  };
}

export default function JapanRegionMap({
  regions,
  selectedRegionId,
  layoutCountsByRegion,
  onRegionSelect,
  onRegionHover,
  onLayoutChange,
}: JapanRegionMapProps) {
  const [parsedMap, setParsedMap] = useState<ParsedMap | null>(null);
  const [hoveredRegionId, setHoveredRegionId] =
    useState<VocabularyRegionId | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const regionRefs = useRef<
    Partial<Record<VocabularyRegionId, SVGGElement | null>>
  >({});

  const regionLookup = useMemo(
    () => Object.fromEntries(regions.map((region) => [region.id, region])),
    [regions],
  );

  useEffect(() => {
    let active = true;

    fetch("/backgrounds/vocabulary/Map-japon.svg")
      .then((response) => response.text())
      .then((svgText) => {
        if (!active) {
          return;
        }

        setParsedMap(buildRegionMarkup(svgText));
      })
      .catch((error) => {
        console.error("Error cargando mapa de Japon:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!parsedMap || !svgRef.current) {
      return;
    }

    const svgElement = svgRef.current;

    const frameId = window.requestAnimationFrame(() => {
      const nextLayout = REGION_ORDER.reduce<
        Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>
      >((accumulator, regionId) => {
        const element = regionRefs.current[regionId];
        const region = regionLookup[regionId];

        if (!element || !region) {
          return accumulator;
        }

        const layoutCount = Math.max(
          region.themes.length,
          layoutCountsByRegion?.[regionId] ?? 0,
        );
        const layout = buildRegionLayout(element, svgElement, layoutCount);

        if (layout) {
          accumulator[regionId] = layout;
        }

        return accumulator;
      }, {});

      onLayoutChange(nextLayout);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [layoutCountsByRegion, onLayoutChange, parsedMap, regionLookup]);

  const handlePointer = (
    event: React.PointerEvent,
    regionId: VocabularyRegionId,
  ) => {
    const rect = svgRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    onRegionHover({
      regionId,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  if (!parsedMap) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-label="Cargando mapa de Japon"
      >
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox={parsedMap.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="japan-map-layer absolute inset-0 h-full w-full text-content-tertiary/55"
      role="img"
      aria-label="Mapa de Japon por regiones"
      style={{
        display: "block",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
        <defs>
          <filter id="regionGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor="var(--accent)"
              floodOpacity="0.35"
            />
          </filter>
          <pattern
            id="mapCartesianMinor"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 18 0 L 0 0 0 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              opacity="0.08"
            />
          </pattern>
          <pattern
            id="mapCartesianMajor"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <rect width="72" height="72" fill="url(#mapCartesianMinor)" />
            <path
              d="M 72 0 L 0 0 0 72"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.12"
            />
          </pattern>
          <radialGradient id="mapAtmosphereTop" cx="20%" cy="16%" r="52%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mapAtmosphereBottom" cx="82%" cy="84%" r="46%">
            <stop offset="0%" stopColor="var(--accent-muted)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--accent-muted)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g aria-hidden="true" pointerEvents="none">
          {/* Full-screen background: covers the entire SVG element including letterbox areas */}
          <rect x="-5000" y="-5000" width="10483" height="10545" fill="#0b0b0c" />
          <rect x="-5000" y="-5000" width="10483" height="10545" fill="url(#mapCartesianMajor)" opacity="0.55" />
          {/* Map area atmosphere and decorations */}
          <rect x="-40" y="-40" width="563" height="625" fill="url(#mapAtmosphereTop)" />
          <rect x="-40" y="-40" width="563" height="625" fill="url(#mapAtmosphereBottom)" />
          <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.16">
            <path d="M 18 124 C 72 90, 122 98, 154 136" strokeDasharray="4 10" />
            <path d="M 312 22 C 372 48, 420 98, 458 168" strokeDasharray="6 12" />
            <path d="M 84 446 C 146 426, 196 434, 248 466" strokeDasharray="5 11" />
          </g>
          <g fill="currentColor">{MAP_BACKGROUND_LABELS.map(renderMapLabel)}</g>
        </g>

        {REGION_ORDER.map((regionId) => {
          if (!parsedMap.baseRegions[regionId]) {
            return null;
          }

          const isSelected = selectedRegionId === regionId;
          const isHovered = hoveredRegionId === regionId;
          const dimmed = Boolean(
            selectedRegionId && selectedRegionId !== regionId,
          );
          const activeOpacity = isSelected || isHovered ? 1 : 0;

          return (
            <motion.g
              key={regionId}
              data-vocabulary-region={regionId}
              ref={(element) => {
                regionRefs.current[regionId] = element;
              }}
              initial={false}
              animate={{
                opacity: isSelected || isHovered ? 1 : dimmed ? 0.58 : 0.96,
                scale: isSelected ? 1.02 : 1,
              }}
              whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
              transition={{ duration: 0.22 }}
              onPointerMove={(event) => handlePointer(event, regionId)}
              onPointerEnter={(event) => {
                setHoveredRegionId(regionId);
                handlePointer(event, regionId);
              }}
              onPointerLeave={() => {
                setHoveredRegionId(null);
                onRegionHover(null);
              }}
              onClick={() => onRegionSelect(regionId)}
              className="cursor-pointer transition-all duration-200"
              style={
                {
                  filter: isSelected ? "url(#regionGlow)" : "none",
                  transformBox: "fill-box",
                  transformOrigin: "center",
                } as React.CSSProperties
              }
            >
              <g
                aria-hidden="true"
                dangerouslySetInnerHTML={{
                  __html: parsedMap.baseRegions[regionId] || "",
                }}
              />
              <motion.g
                aria-hidden="true"
                initial={false}
                animate={{ opacity: activeOpacity }}
                transition={{ duration: 0.18 }}
                dangerouslySetInnerHTML={{
                  __html: parsedMap.activeRegions[regionId] || "",
                }}
              />
            </motion.g>
          );
        })}
    </svg>
  );
}
