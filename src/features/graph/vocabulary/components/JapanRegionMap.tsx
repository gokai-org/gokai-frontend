"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  annotatedInnerHtml: string;
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

const DEFAULT_MAP_VIEWBOX = "0 0 483 545";
const SVG_REGION_SHAPE_SELECTOR =
  "path[fill], polygon[fill], circle[fill], ellipse[fill], rect[fill]";
const SVG_GEOMETRY_SELECTOR = "path, polygon, circle, ellipse, rect";
const MAP_SOURCE_URL = "/backgrounds/vocabulary/Map-japon-design.svg";
const STRUCTURAL_PARENT_SELECTOR = "defs, clipPath, mask";
let parsedMapPromise: Promise<ParsedMap> | null = null;
let parsedMapCache: ParsedMap | null = null;
let iconClassificationCache: IconClassificationCache | null = null;

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

  if (!svg) {
    return {
      viewBox: DEFAULT_MAP_VIEWBOX,
      annotatedInnerHtml: "",
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
      shape.removeAttribute("fill");
      appendClass(shape, "vmap-icon");
    }
  });

  return {
    viewBox: svg.getAttribute("viewBox") || DEFAULT_MAP_VIEWBOX,
    annotatedInnerHtml: svg.innerHTML,
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
    fill: var(--vmap-region-highlight-fill);
    stroke: var(--vmap-region-highlight-stroke);
    opacity: 1;
    filter: drop-shadow(0 0 4px var(--vmap-glow));
  }
  .japan-map-layer[data-active-region="${id}"] [data-region-path="${id}"] {
    fill: var(--vmap-region-active-fill);
    stroke: var(--vmap-region-highlight-stroke);
  }
  .japan-map-layer[data-hover-region="${id}"] .vmap-icon[data-icon-region="${id}"],
  .japan-map-layer[data-active-region="${id}"] .vmap-icon[data-icon-region="${id}"] {
    fill: var(--vmap-icon-hover);
    opacity: 1;
  }
  .japan-map-layer[data-loading-region="${id}"] [data-region-path="${id}"] {
    animation: vmap-region-pulse 1.25s cubic-bezier(.4,0,.6,1) infinite;
  }
`;

const VMAP_STYLE = `
  .japan-map-layer {
    transition: background-color 320ms ease-out;
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
      fill 220ms cubic-bezier(.22,1,.36,1),
      stroke 220ms ease-out,
      opacity 180ms ease-out,
      filter 220ms ease-out;
    cursor: pointer;
  }
  .japan-map-layer[data-hover-region] .vmap-region-shape,
  .japan-map-layer[data-active-region] .vmap-region-shape {
    fill: var(--vmap-region-dim);
    opacity: 0.84;
  }
  .japan-map-layer [data-vocabulary-region] {
    pointer-events: auto;
  }
  .japan-map-layer .vmap-icon {
    fill: var(--vmap-icon);
    opacity: 0.86;
    pointer-events: none;
    transition: fill 180ms ease-out, opacity 180ms ease-out;
  }
  .japan-map-layer .vmap-icon-unassigned {
    fill: var(--vmap-icon);
    opacity: 0.5;
    pointer-events: none;
    transition: fill 180ms ease-out, opacity 180ms ease-out;
  }
  .japan-map-layer[data-hover-region] .vmap-icon:not([data-icon-region]),
  .japan-map-layer[data-active-region] .vmap-icon:not([data-icon-region]) {
    opacity: 0.42;
  }
  @keyframes vmap-region-pulse {
    0%, 100% {
      fill: var(--vmap-region-loading);
      filter: drop-shadow(0 0 0 transparent);
    }
    50% {
      fill: var(--vmap-region-loading-pulse);
      filter: drop-shadow(0 0 8px var(--vmap-glow));
    }
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

  const regionLookup = useMemo(
    () => Object.fromEntries(regions.map((region) => [region.id, region])),
    [regions],
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

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

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

    const handle = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(classifyIcons, { timeout: 220 })
      : window.setTimeout(classifyIcons, 32);

    return () => {
      cancelled = true;
      if (idleWindow.cancelIdleCallback && typeof handle === "number") {
        idleWindow.cancelIdleCallback(handle);
        return;
      }
      window.clearTimeout(handle as number);
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
        const layout = buildRegionLayout(
          group,
          svgElement,
          layoutCount,
          iconBoxesByRegionRef.current[regionId] ?? [],
        );

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

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
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
        "[--vmap-region-locked:#E8E4DF]",
        "[--vmap-region-completed:#F1EFEC]",
        "[--vmap-completed-stroke:#D1B277]",
        "[--vmap-stroke:#CEC8C1]",
        "[--vmap-icon:#9B9490]",
        "[--vmap-icon-hover:#FFF8F3]",
        "[--vmap-region-highlight-fill:#D84A4A]",
        "[--vmap-region-highlight-stroke:#A83A3A]",
        "[--vmap-region-active-fill:#D84A4A]",
        "[--vmap-region-loading:#E9E5E0]",
        "[--vmap-region-loading-pulse:#D84A4A]",
        "[--vmap-glow:rgba(185,58,58,0.18)]",
        "dark:[--vmap-bg:var(--surface-primary)]",
        "dark:[--vmap-grid-minor:#FFFFFF08]",
        "dark:[--vmap-grid-major:#FFFFFF10]",
        "dark:[--vmap-region:#17171B]",
        "dark:[--vmap-region-dim:#141418]",
        "dark:[--vmap-region-locked:#111115]",
        "dark:[--vmap-region-completed:#17171B]",
        "dark:[--vmap-completed-stroke:#D6A84F]",
        "dark:[--vmap-stroke:#2F2F36]",
        "dark:[--vmap-icon:#73737B]",
        "dark:[--vmap-icon-hover:#F2D6D6]",
        "dark:[--vmap-region-highlight-fill:#E15656]",
        "dark:[--vmap-region-highlight-stroke:#B83E3E]",
        "dark:[--vmap-region-active-fill:#E15656]",
        "dark:[--vmap-region-loading:#24242A]",
        "dark:[--vmap-region-loading-pulse:#E15656]",
        "dark:[--vmap-glow:rgba(225,86,86,0.28)]",
      ].join(" ")}
      role="img"
      aria-label="Mapa de Japon por regiones"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      data-loading-region={loadingRegionId ?? undefined}
      data-status-hokkaido={regionStatusByRegion.hokkaido}
      data-status-tohoku={regionStatusByRegion.tohoku}
      data-status-kanto={regionStatusByRegion.kanto}
      data-status-chubu={regionStatusByRegion.chubu}
      data-status-kansai={regionStatusByRegion.kansai}
      data-status-chugoku={regionStatusByRegion.chugoku}
      data-status-shikoku={regionStatusByRegion.shikoku}
      data-status-kyushu={regionStatusByRegion.kyushu}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      style={{
        display: "block",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        backgroundColor: "var(--vmap-bg)",
      }}
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
      </defs>

      <g aria-hidden="true" pointerEvents="none">
        <rect
          x="-5000"
          y="-5000"
          width="10483"
          height="10545"
          fill="var(--vmap-bg)"
        />
        <rect
          x="-5000"
          y="-5000"
          width="10483"
          height="10545"
          fill="url(#vmapCartesianMajor)"
          opacity="0.65"
        />
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
    </svg>
  );
}
