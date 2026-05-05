"use client";

import {
  type CSSProperties,
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import type {
  VocabularyRegionId,
  VocabularyRegionLayout,
  VocabularyRegionViewModel,
} from "../types";
import { buildRegionLayout } from "../lib/regionNodePlacement";
import {
  REGION_FILL_TO_ID,
  REGION_ORDER,
  regionColors,
} from "../lib/vocabularyRegions";

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
  annotatedInnerHtml: string;
  iconInnerHtml: string;
  regionCloneMarkup: Partial<Record<VocabularyRegionId, string>>;
};

type RegionVisualStatus = "locked" | "available" | "completed";

type RegionIconBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type IconClassificationCache = {
  iconRegionsByIndex: Array<VocabularyRegionId | null>;
  iconBoxesByRegion: Partial<Record<VocabularyRegionId, RegionIconBox[]>>;
};

type RegionLayoutCacheEntry = {
  layoutCount: number;
  iconLayoutRevision: number;
  layout: VocabularyRegionLayout;
};

const DEFAULT_MAP_VIEWBOX = "0 0 483 545";
const SVG_REGION_SHAPE_SELECTOR =
  "path[fill], polygon[fill], circle[fill], ellipse[fill], rect[fill]";
const SVG_GEOMETRY_SELECTOR = "path, polygon, circle, ellipse, rect";
const MAP_SOURCE_URL = "/backgrounds/vocabulary/Map-japon-design.svg";
const STRUCTURAL_PARENT_SELECTOR = "defs, clipPath, mask";
let parsedMapPromise: Promise<ParsedMap> | null = null;
let parsedMapCache: ParsedMap | null = null;
let iconClassificationCache: IconClassificationCache | null = null;

const BLOCKED_REGION_COLOR = "#1B1A1D";

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function lightenHexColor(hex: string, amount: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return hex;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  const mixChannel = (channel: number) =>
    clampChannel(channel + (255 - channel) * amount)
      .toString(16)
      .padStart(2, "0");

  return `#${mixChannel(red)}${mixChannel(green)}${mixChannel(blue)}`.toUpperCase();
}

function darkenHexColor(hex: string, amount: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return hex;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  const mixChannel = (channel: number) =>
    clampChannel(channel * (1 - amount))
      .toString(16)
      .padStart(2, "0");

  return `#${mixChannel(red)}${mixChannel(green)}${mixChannel(blue)}`.toUpperCase();
}

const LIGHT_REGION_COLORS = Object.fromEntries(
  REGION_ORDER.map((regionId) => [regionId, lightenHexColor(regionColors[regionId], 0.14)]),
) as Record<VocabularyRegionId, string>;
const LIGHT_REGION_STROKES = Object.fromEntries(
  REGION_ORDER.map((regionId) => [regionId, darkenHexColor(regionColors[regionId], 0.08)]),
) as Record<VocabularyRegionId, string>;
const DARK_REGION_STROKES = Object.fromEntries(
  REGION_ORDER.map((regionId) => [regionId, lightenHexColor(regionColors[regionId], 0.22)]),
) as Record<VocabularyRegionId, string>;
const LIGHT_BLOCKED_REGION_COLOR = lightenHexColor(BLOCKED_REGION_COLOR, 0.16);

function normalizeHex(value?: string | null) {
  return (value ?? "").trim().toUpperCase();
}

function isWhiteFill(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "white" || normalized === "#ffffff" || normalized === "#fff";
}

function appendClass(element: Element, className: string) {
  const current = element.getAttribute("class")?.trim();
  if (!current) {
    element.setAttribute("class", className);
    return;
  }

  if (!current.split(/\s+/).includes(className)) {
    element.setAttribute("class", `${current} ${className}`);
  }
}

function isStructuralShape(element: Element) {
  return Boolean(element.closest(STRUCTURAL_PARENT_SELECTOR));
}

function buildAnnotatedMap(svgText: string): ParsedMap {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgText, "image/svg+xml");
  const svg = document.querySelector("svg");
  const regionCloneMarkup: Partial<Record<VocabularyRegionId, string[]>> = {};
  const iconMarkup: string[] = [];

  if (!svg) {
    return {
      viewBox: DEFAULT_MAP_VIEWBOX,
      annotatedInnerHtml: "",
      iconInnerHtml: "",
      regionCloneMarkup: {},
    };
  }

  svg.querySelectorAll(SVG_REGION_SHAPE_SELECTOR).forEach((shape) => {
    if (!(shape instanceof Element) || isStructuralShape(shape)) {
      return;
    }

    const fill = shape.getAttribute("fill");
    const normalizedFill = normalizeHex(fill);
    const regionId = REGION_FILL_TO_ID[normalizedFill];

    if (regionId) {
      const clone = shape.cloneNode(true);

      if (clone instanceof Element) {
        clone.removeAttribute("class");
        clone.removeAttribute("data-region-path");
        clone.removeAttribute("data-vocabulary-region");
        clone.setAttribute("fill", "#000");
        clone.setAttribute("stroke", "none");
        regionCloneMarkup[regionId] = [
          ...(regionCloneMarkup[regionId] ?? []),
          clone.outerHTML,
        ];
      }

      shape.removeAttribute("fill");
      shape.removeAttribute("stroke");
      shape.removeAttribute("stroke-width");
      shape.setAttribute("data-region-path", regionId);
      shape.setAttribute("data-vocabulary-region", regionId);
      appendClass(shape, "vmap-region-shape");
      return;
    }

    if (isWhiteFill(fill)) {
      const clone = shape.cloneNode(true);

      if (clone instanceof Element) {
        clone.removeAttribute("class");
        clone.removeAttribute("data-icon-region");
        clone.setAttribute("fill", "currentColor");
        clone.setAttribute("stroke", "none");
        appendClass(clone, "vmap-icon-mask-shape");
        iconMarkup.push(clone.outerHTML);
      }

      shape.removeAttribute("fill");
      appendClass(shape, "vmap-icon");
    }
  });

  return {
    viewBox: svg.getAttribute("viewBox") || DEFAULT_MAP_VIEWBOX,
    annotatedInnerHtml: svg.innerHTML,
    iconInnerHtml: iconMarkup.join(""),
    regionCloneMarkup: Object.fromEntries(
      REGION_ORDER.map((regionId) => [
        regionId,
        (regionCloneMarkup[regionId] ?? []).join(""),
      ]),
    ),
  };
}

const REGION_RULE_TEMPLATE = (id: VocabularyRegionId) => `
  .japan-map-layer[data-status-${id}="locked"] [data-region-path="${id}"] {
    fill: var(--vmap-region-locked);
    stroke: var(--vmap-stroke);
    opacity: 0.68;
  }
  .japan-map-layer[data-status-${id}="completed"] [data-region-path="${id}"] {
    fill: var(--vmap-region-completed);
    stroke: var(--vmap-stroke);
    opacity: 0.98;
  }
  .japan-map-layer[data-hover-region="${id}"] [data-region-path="${id}"],
  .japan-map-layer[data-active-region="${id}"] [data-region-path="${id}"] {
    fill: var(--vmap-region-fill-${id});
    stroke: var(--vmap-region-stroke-${id});
    stroke-width: var(--vmap-highlight-stroke-width, 0.92);
    opacity: 1;
    filter: var(--vmap-region-hover-filter, none);
  }
  .japan-map-layer[data-active-region="${id}"] [data-region-path="${id}"] {
    fill: var(--vmap-region-active-fill-${id});
    stroke: var(--vmap-region-stroke-${id});
  }
  .japan-map-layer[data-hover-region="${id}"] .vmap-icon[data-icon-region="${id}"],
  .japan-map-layer[data-active-region="${id}"] .vmap-icon[data-icon-region="${id}"] {
    fill: var(--vmap-icon-hover);
    opacity: 1;
  }
  .japan-map-layer[data-hover-region="${id}"] .vmap-icon-hover-layer[data-icon-layer="${id}"],
  .japan-map-layer[data-active-region="${id}"] .vmap-icon-hover-layer[data-icon-layer="${id}"] {
    display: block;
  }
  .japan-map-layer[data-loading-region="${id}"] {
    --vmap-region-loading-pulse-current: var(--vmap-region-active-fill-${id});
  }
  .japan-map-layer[data-loading-region="${id}"] [data-region-path="${id}"] {
    fill: var(--vmap-region-active-fill-${id});
    stroke: var(--vmap-region-stroke-${id});
    stroke-width: var(--vmap-highlight-stroke-width, 0.92);
    will-change: opacity;
    animation: vmap-region-pulse 920ms ease-in-out infinite;
  }
`;

const VMAP_STYLE = `
  .japan-map-layer {
    transition: background-color 320ms ease-out;
    contain: layout paint style;
    isolation: isolate;
  }
  .japan-map-layer .vmap-content {
    pointer-events: none;
  }
  .japan-map-layer .vmap-region-shape {
    fill: var(--vmap-region);
    stroke: var(--vmap-stroke);
    stroke-width: 0.56;
    stroke-linejoin: round;
    paint-order: stroke fill;
    opacity: 0.98;
    pointer-events: auto;
    transition:
      fill var(--vmap-transition-duration, 72ms) linear,
      stroke var(--vmap-transition-duration, 72ms) linear,
      opacity var(--vmap-transition-duration, 72ms) linear,
      filter var(--vmap-transition-duration, 72ms) linear;
    cursor: pointer;
  }
  .japan-map-layer[data-active-region] .vmap-region-shape {
    fill: var(--vmap-region-dim);
    opacity: 0.84;
  }
  .japan-map-layer[data-hover-enabled="false"] .vmap-region-shape {
    transition: fill 48ms linear, stroke 48ms linear, opacity 48ms linear;
  }
  .japan-map-layer [data-vocabulary-region] {
    pointer-events: auto;
    touch-action: manipulation;
  }
  .japan-map-layer .vmap-icon {
    fill: var(--vmap-icon);
    opacity: 0.86;
    pointer-events: none;
    transition: fill var(--vmap-transition-duration, 72ms) linear, opacity var(--vmap-transition-duration, 72ms) linear;
  }
  .japan-map-layer .vmap-icon-unassigned {
    fill: var(--vmap-icon);
    opacity: 0.5;
    pointer-events: none;
    transition: fill var(--vmap-transition-duration, 72ms) linear, opacity var(--vmap-transition-duration, 72ms) linear;
  }
  .japan-map-layer .vmap-icon-hover-layer {
    display: none;
    color: var(--vmap-icon-hover);
    pointer-events: none;
  }
  .japan-map-layer .vmap-icon-hover-layer .vmap-icon-mask-shape {
    fill: currentColor;
    stroke: none;
  }
  .japan-map-layer[data-active-region] .vmap-icon:not([data-icon-region]) {
    opacity: 0.42;
  }
  @keyframes vmap-region-pulse {
    0%, 100% {
      opacity: 0.88;
    }
    50% {
      opacity: 1;
    }
  }
  .japan-map-layer {
    --vmap-region-locked: ${LIGHT_BLOCKED_REGION_COLOR};
${REGION_ORDER.map(
  (regionId) =>
    `    --vmap-region-fill-${regionId}: ${LIGHT_REGION_COLORS[regionId]};\n    --vmap-region-stroke-${regionId}: ${LIGHT_REGION_STROKES[regionId]};\n    --vmap-region-active-fill-${regionId}: ${LIGHT_REGION_COLORS[regionId]};`,
).join("\n")}
  }
  .dark .japan-map-layer {
    --vmap-region-locked: ${BLOCKED_REGION_COLOR};
${REGION_ORDER.map(
  (regionId) =>
    `    --vmap-region-fill-${regionId}: ${regionColors[regionId]};\n    --vmap-region-stroke-${regionId}: ${DARK_REGION_STROKES[regionId]};\n    --vmap-region-active-fill-${regionId}: ${regionColors[regionId]};`,
).join("\n")}
  }
${REGION_ORDER.map(REGION_RULE_TEMPLATE).join("\n")}
`;

const RawMapContent = memo(
  forwardRef<SVGGElement, { innerHtml: string }>(function RawMapContent(
    { innerHtml },
    ref,
  ) {
    return (
      <g
        ref={ref}
        className="vmap-content"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    );
  }),
);

RawMapContent.displayName = "RawMapContent";

function getParsedMap() {
  if (parsedMapCache) {
    return Promise.resolve(parsedMapCache);
  }

  if (!parsedMapPromise) {
    parsedMapPromise = fetch(MAP_SOURCE_URL)
      .then((response) => response.text())
      .then((svgText) => {
        const parsed = buildAnnotatedMap(svgText);
        parsedMapCache = parsed;
        return parsed;
      });
  }

  return parsedMapPromise;
}

function JapanRegionMap({
  regions,
  selectedRegionId,
  loadingRegionId = null,
  layoutCountsByRegion,
  onRegionSelect,
  onRegionHover,
  onLayoutChange,
}: JapanRegionMapProps) {
  const platformMotion = usePlatformMotion();
  const [parsedMap, setParsedMap] = useState<ParsedMap | null>(null);
  const [iconLayoutRevision, setIconLayoutRevision] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const contentRef = useRef<SVGGElement | null>(null);
  const hoveredRegionRef = useRef<VocabularyRegionId | null>(null);
  const hiddenRegionRefs = useRef<
    Partial<Record<VocabularyRegionId, SVGGElement | null>>
  >({});
  const iconBoxesByRegionRef = useRef<
    Partial<Record<VocabularyRegionId, RegionIconBox[]>>
  >({});
  const layoutCacheRef = useRef<
    Partial<Record<VocabularyRegionId, RegionLayoutCacheEntry>>
  >({});

  const regionLookup = useMemo(
    () => Object.fromEntries(regions.map((region) => [region.id, region])),
    [regions],
  );
  const hoverEnabled = platformMotion.shouldUseHoverAnimations;
  const heavyEffectsEnabled =
    platformMotion.heavyAnimationsEnabled &&
    platformMotion.graphicsProfile.shouldUseHeavyEffects;
  const showGridOverlay = platformMotion.graphicsProfile.tier !== "low";
  const svgStyle = useMemo<CSSProperties>(
    () => ({
      display: "block",
      userSelect: "none",
      WebkitUserSelect: "none",
      WebkitTouchCallout: "none",
      backgroundColor: "var(--vmap-bg)",
      ["--vmap-region-hover-filter" as const]:
        heavyEffectsEnabled ? "drop-shadow(0 0 4px var(--vmap-glow))" : "none",
      ["--vmap-transition-duration" as const]:
        hoverEnabled ? "120ms" : "80ms",
    }),
    [heavyEffectsEnabled, hoverEnabled],
  );

  const regionStatusByRegion = useMemo(() => {
    const result: Partial<Record<VocabularyRegionId, RegionVisualStatus>> = {};

    regions.forEach((region) => {
      const hasAvailable = region.themes.some((theme) => theme.isAvailable);
      const allCompleted =
        region.themes.length > 0 &&
        region.themes.every((theme) => theme.status === "completed");

      result[region.id] = !hasAvailable
        ? "locked"
        : allCompleted
          ? "completed"
          : "available";
    });

    return result;
  }, [regions]);

  useEffect(() => {
    let active = true;

    getParsedMap()
      .then((nextParsedMap) => {
        if (!active) {
          return;
        }

        setParsedMap(nextParsedMap);
      })
      .catch((error) => {
        console.error("Error cargando mapa de Japon:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!parsedMap || !svgRef.current || !contentRef.current) {
      return;
    }

    const contentElement = contentRef.current;
    const iconShapes = Array.from(
      contentElement.querySelectorAll<SVGGeometryElement>(".vmap-icon"),
    );

    let cancelled = false;

    const applyCachedClassification = (cache: IconClassificationCache) => {
      iconBoxesByRegionRef.current = cache.iconBoxesByRegion;
      iconShapes.forEach((icon, index) => {
        const assignedRegion = cache.iconRegionsByIndex[index] ?? null;

        icon.removeAttribute("data-icon-region");
        icon.classList.remove("vmap-icon-unassigned");
        icon.classList.add("vmap-icon");

        if (assignedRegion) {
          icon.setAttribute("data-icon-region", assignedRegion);
          return;
        }

        icon.classList.remove("vmap-icon");
        icon.classList.add("vmap-icon-unassigned");
      });

      setIconLayoutRevision((value) => value + 1);
    };

    if (
      iconClassificationCache &&
      iconClassificationCache.iconRegionsByIndex.length === iconShapes.length
    ) {
      applyCachedClassification(iconClassificationCache);
      return;
    }

    const classifyIcons = () => {
      if (cancelled || !svgRef.current) {
        return;
      }

      const svgElement = svgRef.current;
      const point = svgElement.createSVGPoint();
      const iconRegionsByIndex: Array<VocabularyRegionId | null> = [];
      const iconBoxesByRegion: Partial<Record<VocabularyRegionId, RegionIconBox[]>> = {};
      const regionGeometry = REGION_ORDER.map((regionId) => {
        const group = hiddenRegionRefs.current[regionId];
        const shapes = group
          ? Array.from(group.querySelectorAll<SVGGeometryElement>(SVG_GEOMETRY_SELECTOR))
          : [];
        const boxes = shapes.map((shape) => {
          try {
            return shape.getBBox();
          } catch {
            return null;
          }
        });

        return { regionId, shapes, boxes };
      });

      iconShapes.forEach((icon, index) => {
        icon.removeAttribute("data-icon-region");
        icon.classList.remove("vmap-icon-unassigned");
        icon.classList.add("vmap-icon");

        let box: SVGRect | DOMRect;

        try {
          box = icon.getBBox();
        } catch {
          iconRegionsByIndex[index] = null;
          return;
        }

        if (!box.width && !box.height) {
          iconRegionsByIndex[index] = null;
          return;
        }

        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        point.x = centerX;
        point.y = centerY;

        let assignedRegion: VocabularyRegionId | null = null;

        outer: for (const { regionId, shapes, boxes } of regionGeometry) {
          for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex += 1) {
            const regionBox = boxes[shapeIndex];

            if (!regionBox) {
              continue;
            }

            if (
              centerX < regionBox.x ||
              centerX > regionBox.x + regionBox.width ||
              centerY < regionBox.y ||
              centerY > regionBox.y + regionBox.height
            ) {
              continue;
            }

            if (shapes[shapeIndex].isPointInFill(point)) {
              assignedRegion = regionId;
              break outer;
            }
          }
        }

        iconRegionsByIndex[index] = assignedRegion;

        if (assignedRegion) {
          icon.setAttribute("data-icon-region", assignedRegion);
          iconBoxesByRegion[assignedRegion] = [
            ...(iconBoxesByRegion[assignedRegion] ?? []),
            { x: box.x, y: box.y, width: box.width, height: box.height },
          ];
          return;
        }

        icon.classList.remove("vmap-icon");
        icon.classList.add("vmap-icon-unassigned");
      });

      if (cancelled) {
        return;
      }

      iconClassificationCache = {
        iconRegionsByIndex,
        iconBoxesByRegion,
      };
      applyCachedClassification(iconClassificationCache);
    };

    const handle = window.requestAnimationFrame(classifyIcons);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(handle);
    };
  }, [parsedMap]);

  useEffect(() => {
    if (!parsedMap || !svgRef.current) {
      return;
    }

    const svgElement = svgRef.current;
    const frameId = window.requestAnimationFrame(() => {
      const nextLayout = REGION_ORDER.reduce<
        Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>
      >((accumulator, regionId) => {
        const group = hiddenRegionRefs.current[regionId];
        const region = regionLookup[regionId];

        if (!group || !region) {
          return accumulator;
        }

        const layoutCount = Math.max(
          region.themes.length,
          layoutCountsByRegion?.[regionId] ?? 0,
        );
        const cachedLayout = layoutCacheRef.current[regionId];

        if (
          cachedLayout &&
          cachedLayout.layoutCount === layoutCount &&
          cachedLayout.iconLayoutRevision === iconLayoutRevision
        ) {
          accumulator[regionId] = cachedLayout.layout;
          return accumulator;
        }

        const layout = buildRegionLayout(
          group,
          svgElement,
          layoutCount,
          iconBoxesByRegionRef.current[regionId] ?? [],
        );

        if (layout) {
          layoutCacheRef.current[regionId] = {
            layoutCount,
            iconLayoutRevision,
            layout,
          };
          accumulator[regionId] = layout;
        }

        return accumulator;
      }, {});

      onLayoutChange(nextLayout);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [iconLayoutRevision, layoutCountsByRegion, onLayoutChange, parsedMap, regionLookup]);

  useEffect(() => {
    const svgElement = svgRef.current;

    if (!svgElement) {
      return;
    }

    if (selectedRegionId) {
      svgElement.dataset.activeRegion = selectedRegionId;
    } else {
      delete svgElement.dataset.activeRegion;
    }
  }, [selectedRegionId]);

  const updateHoveredRegion = (
    nextRegionId: VocabularyRegionId | null,
    event?: React.PointerEvent<SVGSVGElement>,
  ) => {
    if (!hoverEnabled) {
      if (hoveredRegionRef.current !== null) {
        hoveredRegionRef.current = null;

        if (svgRef.current) {
          delete svgRef.current.dataset.hoverRegion;
        }

        onRegionHover(null);
      }

      return;
    }

    if (hoveredRegionRef.current === nextRegionId) {
      return;
    }

    hoveredRegionRef.current = nextRegionId;

    const svgElement = svgRef.current;

    if (svgElement) {
      if (nextRegionId) {
        svgElement.dataset.hoverRegion = nextRegionId;
      } else {
        delete svgElement.dataset.hoverRegion;
      }
    }

    if (!nextRegionId || !event) {
      onRegionHover(null);
      return;
    }

    const rect = svgElement?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    onRegionHover({
      regionId: nextRegionId,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handlePointerOver = (event: React.PointerEvent<SVGSVGElement>) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      updateHoveredRegion(null);
      return;
    }

    const regionElement = target.closest<SVGElement>("[data-region-path]");
    const regionId = (regionElement?.getAttribute("data-region-path") ??
      null) as VocabularyRegionId | null;

    updateHoveredRegion(regionId, event);
  };

  const handlePointerLeave = () => {
    updateHoveredRegion(null);
  };

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const regionElement = target.closest<SVGElement>("[data-region-path]");
    const regionId = regionElement?.getAttribute("data-region-path") as
      | VocabularyRegionId
      | null;

    if (regionId) {
      onRegionSelect(regionId);
    }
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
      className={[
        "japan-map-layer absolute inset-0 h-full w-full",
        "[--vmap-bg:var(--surface-primary)]",
        "[--vmap-grid-minor:#11182708]",
        "[--vmap-grid-major:#11182710]",
        "[--vmap-region:#F1EFEC]",
        "[--vmap-region-dim:#ECE8E4]",
        "[--vmap-region-completed:#F1EFEC]",
        "[--vmap-completed-stroke:#D1B277]",
        "[--vmap-stroke:#CEC8C1]",
        "[--vmap-icon:#6F6763]",
        "[--vmap-icon-hover:#FFFFFF]",
        "[--vmap-region-loading:#E9E5E0]",
        "[--vmap-region-loading-pulse:#BA5149]",
        "[--vmap-glow:rgba(153,51,49,0.22)]",
        "dark:[--vmap-bg:var(--surface-primary)]",
        "dark:[--vmap-grid-minor:#FFFFFF08]",
        "dark:[--vmap-grid-major:#FFFFFF10]",
        "dark:[--vmap-region:#17171B]",
        "dark:[--vmap-region-dim:#141418]",
        "dark:[--vmap-region-completed:#17171B]",
        "dark:[--vmap-completed-stroke:#D6A84F]",
        "dark:[--vmap-stroke:#2F2F36]",
        "dark:[--vmap-icon:#73737B]",
        "dark:[--vmap-icon-hover:#FFFFFF]",
        "dark:[--vmap-region-loading:#24242A]",
        "dark:[--vmap-region-loading-pulse:#BA5149]",
        "dark:[--vmap-glow:rgba(153,51,49,0.28)]",
      ].join(" ")}
      role="img"
      aria-label="Mapa de Japon por regiones"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      data-loading-region={loadingRegionId ?? undefined}
      data-hover-enabled={hoverEnabled ? "true" : "false"}
      data-status-hokkaido={regionStatusByRegion.hokkaido}
      data-status-tohoku={regionStatusByRegion.tohoku}
      data-status-kanto={regionStatusByRegion.kanto}
      data-status-chubu={regionStatusByRegion.chubu}
      data-status-kansai={regionStatusByRegion.kansai}
      data-status-chugoku={regionStatusByRegion.chugoku}
      data-status-shikoku={regionStatusByRegion.shikoku}
      data-status-kyushu={regionStatusByRegion.kyushu}
      onPointerOver={handlePointerOver}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      style={svgStyle}
    >
      <style>{VMAP_STYLE}</style>

      <defs>
        <pattern
          id="vmapCartesianMinor"
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 18 0 L 0 0 0 18"
            fill="none"
            stroke="var(--vmap-grid-minor)"
            strokeWidth="0.35"
          />
        </pattern>
        <pattern
          id="vmapCartesianMajor"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          <rect width="72" height="72" fill="url(#vmapCartesianMinor)" />
          <path
            d="M 72 0 L 0 0 0 72"
            fill="none"
            stroke="var(--vmap-grid-major)"
            strokeWidth="0.8"
          />
        </pattern>
        {REGION_ORDER.map((regionId) => (
          <clipPath key={`vmap-region-clip-${regionId}`} id={`vmap-region-clip-${regionId}`}>
            <g
              dangerouslySetInnerHTML={{
                __html: parsedMap.regionCloneMarkup[regionId] ?? "",
              }}
            />
          </clipPath>
        ))}
        {parsedMap.iconInnerHtml ? (
          <g
            id="vmap-icon-hover-source"
            dangerouslySetInnerHTML={{ __html: parsedMap.iconInnerHtml }}
          />
        ) : null}
      </defs>

      <g aria-hidden="true" pointerEvents="none">
        <rect
          x="-5000"
          y="-5000"
          width="10483"
          height="10545"
          fill="var(--vmap-bg)"
        />
        {showGridOverlay ? (
          <rect
            x="-5000"
            y="-5000"
            width="10483"
            height="10545"
            fill="url(#vmapCartesianMajor)"
            opacity={heavyEffectsEnabled ? 0.65 : 0.3}
          />
        ) : null}
      </g>

      <g aria-hidden="true" pointerEvents="none" visibility="hidden" opacity={0}>
        {REGION_ORDER.map((regionId) => (
          <g
            key={regionId}
            ref={(element) => {
              hiddenRegionRefs.current[regionId] = element;
            }}
            data-vocabulary-region-clone={regionId}
            dangerouslySetInnerHTML={{
              __html: parsedMap.regionCloneMarkup[regionId] ?? "",
            }}
          />
        ))}
      </g>

      <RawMapContent ref={contentRef} innerHtml={parsedMap.annotatedInnerHtml} />

      {parsedMap.iconInnerHtml
        ? REGION_ORDER.map((regionId) => (
            <g
              key={`vmap-icon-hover-layer-${regionId}`}
              className="vmap-icon-hover-layer"
              data-icon-layer={regionId}
              clipPath={`url(#vmap-region-clip-${regionId})`}
              pointerEvents="none"
            >
              <use href="#vmap-icon-hover-source" />
            </g>
          ))
        : null}
    </svg>
  );
}

JapanRegionMap.displayName = "JapanRegionMap";

export default memo(JapanRegionMap);
