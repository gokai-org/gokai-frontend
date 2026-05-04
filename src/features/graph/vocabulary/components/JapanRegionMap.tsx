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
  loadingRegionId?: VocabularyRegionId | null;
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
  loadingRegions: Partial<Record<VocabularyRegionId, string>>;
  loadingPulseRegions: Partial<Record<VocabularyRegionId, string>>;
};

const DEFAULT_MAP_VIEWBOX = "0 0 483 545";
const SVG_REGION_SHAPE_SELECTOR =
  "path[fill], polygon[fill], circle[fill], ellipse[fill], rect[fill]";
const MAP_BASE_FILL = "var(--vocabulary-map-region-base)";
const MAP_DIVIDER_STROKE = "var(--vocabulary-map-divider)";

function normalizeHex(value?: string | null) {
  return (value ?? "").trim().toUpperCase();
}

function buildRegionMarkup(svgText: string): ParsedMap {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgText, "image/svg+xml");
  const svg = document.querySelector("svg");
  const baseMarkup: Partial<Record<VocabularyRegionId, string[]>> = {};
  const activeMarkup: Partial<Record<VocabularyRegionId, string[]>> = {};
  const loadingMarkup: Partial<Record<VocabularyRegionId, string[]>> = {};
  const loadingPulseMarkup: Partial<Record<VocabularyRegionId, string[]>> = {};

  if (!svg) {
    return {
      viewBox: DEFAULT_MAP_VIEWBOX,
      baseRegions: {},
      activeRegions: {},
      loadingRegions: {},
      loadingPulseRegions: {},
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
    const loadingShape = shape.cloneNode(true);
    const loadingPulseShape = shape.cloneNode(true);

    if (
      !(baseShape instanceof Element) ||
      !(activeShape instanceof Element) ||
      !(loadingShape instanceof Element) ||
      !(loadingPulseShape instanceof Element)
    ) {
      return;
    }

    baseShape.setAttribute("fill", MAP_BASE_FILL);
    baseShape.setAttribute("stroke", MAP_DIVIDER_STROKE);

    activeShape.setAttribute("fill", originalFill);
    activeShape.setAttribute("stroke", MAP_DIVIDER_STROKE);

    loadingShape.setAttribute("fill", "var(--vocabulary-map-loading-base)");
    loadingShape.setAttribute("stroke", MAP_DIVIDER_STROKE);

    loadingPulseShape.setAttribute("fill", "var(--vocabulary-map-loading-pulse)");
    loadingPulseShape.setAttribute("stroke", MAP_DIVIDER_STROKE);

    baseMarkup[regionId] = [...(baseMarkup[regionId] ?? []), baseShape.outerHTML];
    activeMarkup[regionId] = [...(activeMarkup[regionId] ?? []), activeShape.outerHTML];
    loadingMarkup[regionId] = [
      ...(loadingMarkup[regionId] ?? []),
      loadingShape.outerHTML,
    ];
    loadingPulseMarkup[regionId] = [
      ...(loadingPulseMarkup[regionId] ?? []),
      loadingPulseShape.outerHTML,
    ];
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
    loadingRegions: Object.fromEntries(
      REGION_ORDER.map((regionId) => [
        regionId,
        (loadingMarkup[regionId] ?? []).join(""),
      ]),
    ),
    loadingPulseRegions: Object.fromEntries(
      REGION_ORDER.map((regionId) => [
        regionId,
        (loadingPulseMarkup[regionId] ?? []).join(""),
      ]),
    ),
  };
}

export default function JapanRegionMap({
  regions,
  selectedRegionId,
  loadingRegionId = null,
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

  const loadingRegions = parsedMap.loadingRegions ?? {};
  const loadingPulseRegions = parsedMap.loadingPulseRegions ?? {};

  return (
    <svg
      ref={svgRef}
      viewBox={parsedMap.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="japan-map-layer absolute inset-0 h-full w-full [--vocabulary-map-bg:#E8E4E1] [--vocabulary-map-grid-minor:#12121614] [--vocabulary-map-grid-major:#1212161F] [--vocabulary-map-region-base:#D8D2CC] [--vocabulary-map-divider:#5F575226] [--vocabulary-map-loading-base:#5F5752C7] [--vocabulary-map-loading-pulse:#BA4845] dark:[--vocabulary-map-bg:#0B0B0C] dark:[--vocabulary-map-grid-minor:#FFFFFF0D] dark:[--vocabulary-map-grid-major:#FFFFFF14] dark:[--vocabulary-map-region-base:#1B1A1D] dark:[--vocabulary-map-divider:#262528] dark:[--vocabulary-map-loading-base:#242226F0] dark:[--vocabulary-map-loading-pulse:#B6413A]"
      role="img"
      aria-label="Mapa de Japon por regiones"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      style={{
        display: "block",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
        <defs>
          <pattern
            id="mapCartesianMinor"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 18 0 L 0 0 0 18"
              fill="none"
              stroke="var(--vocabulary-map-grid-minor)"
              strokeWidth="0.35"
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
              stroke="var(--vocabulary-map-grid-major)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        <g aria-hidden="true" pointerEvents="none">
          {/* Full-screen background: covers the entire SVG element including letterbox areas */}
          <rect
            x="-5000"
            y="-5000"
            width="10483"
            height="10545"
            fill="var(--vocabulary-map-bg)"
          />
          <rect
            x="-5000"
            y="-5000"
            width="10483"
            height="10545"
            fill="url(#mapCartesianMajor)"
            opacity="0.72"
          />
        </g>

        {REGION_ORDER.map((regionId) => {
          if (!parsedMap.baseRegions[regionId]) {
            return null;
          }

          const isSelected = selectedRegionId === regionId;
          const isLoading = loadingRegionId === regionId;
          const isHovered = hoveredRegionId === regionId;
          const dimmed = Boolean(
            selectedRegionId && selectedRegionId !== regionId,
          );
          const activeOpacity = isLoading ? 0 : isSelected || isHovered ? 1 : 0;

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
              }}
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
              {isLoading ? (
                <>
                  <g
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{
                      __html: loadingRegions[regionId] || "",
                    }}
                  />
                  <motion.g
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: [0.04, 0.58, 0.04], scale: [1, 1.018, 1] }}
                    transition={{
                      duration: 1.18,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: [0.32, 0, 0.67, 1],
                    }}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    <g
                      dangerouslySetInnerHTML={{
                        __html: loadingPulseRegions[regionId] || "",
                      }}
                    />
                  </motion.g>
                </>
              ) : null}
            </motion.g>
          );
        })}
    </svg>
  );
}
