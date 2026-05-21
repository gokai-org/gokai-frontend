import { REGION_FILL_TO_ID, REGION_ORDER } from "../../lib/vocabularyRegions";
import type { VocabularyRegionId } from "../../types";

export const MAP_SOURCE_URL = "/backgrounds/vocabulary/Map-japon-design.svg";

const SVG_REGION_SHAPE_SELECTOR =
  "path[fill], polygon[fill], circle[fill], ellipse[fill], rect[fill]";
const STRUCTURAL_PARENT_SELECTOR = "defs, clipPath, mask";
const DEFAULT_VIEW_BOX = "0 0 483 545";

export type ParsedJapanMap = {
  viewBox: string;
  svgInnerMarkup: string;
  regionMarkupById: Record<VocabularyRegionId, string>;
};

let cache: ParsedJapanMap | null = null;
let pending: Promise<ParsedJapanMap> | null = null;
let sourceWarmPending: Promise<void> | null = null;
let sourceWarmImage: HTMLImageElement | null = null;

export function getCachedJapanMap(): ParsedJapanMap | null {
  return cache;
}

export function warmJapanMapSource(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve();
  }

  if (sourceWarmPending) {
    return sourceWarmPending;
  }

  const existingPreload = document.querySelector<HTMLLinkElement>(
    `link[rel="preload"][href="${MAP_SOURCE_URL}"]`,
  );

  if (!existingPreload) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = MAP_SOURCE_URL;
    document.head.appendChild(link);
  }

  sourceWarmImage = new Image();
  sourceWarmImage.decoding = "async";
  sourceWarmImage.setAttribute("fetchpriority", "high");
  sourceWarmImage.src = MAP_SOURCE_URL;

  sourceWarmPending = (typeof sourceWarmImage.decode === "function"
    ? sourceWarmImage.decode()
    : new Promise<void>((resolve) => {
        if (!sourceWarmImage) {
          resolve();
          return;
        }

        sourceWarmImage.onload = () => resolve();
        sourceWarmImage.onerror = () => resolve();
      })
  )
    .catch(() => undefined)
    .then(() => undefined);

  return sourceWarmPending;
}

export function loadJapanMapAssets(): Promise<ParsedJapanMap> {
  if (cache) {
    return Promise.resolve(cache);
  }

  if (pending) {
    return pending;
  }

  void warmJapanMapSource();

  pending = fetch(MAP_SOURCE_URL)
    .then((response) => response.text())
    .then((svgText) => {
      const parsed = parseJapanMap(svgText);
      cache = parsed;
      return parsed;
    })
    .catch((error) => {
      pending = null;
      throw error;
    });

  return pending;
}

function normalizeHex(value?: string | null) {
  return (value ?? "").trim().toUpperCase();
}

function isStructuralShape(element: Element) {
  return Boolean(element.closest(STRUCTURAL_PARENT_SELECTOR));
}

function parseJapanMap(svgText: string): ParsedJapanMap {
  const document = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = document.querySelector("svg");

  const regionMarkupBuckets: Record<VocabularyRegionId, string[]> = REGION_ORDER.reduce(
    (accumulator, regionId) => {
      accumulator[regionId] = [];
      return accumulator;
    },
    {} as Record<VocabularyRegionId, string[]>,
  );
  if (svg) {
    svg.querySelectorAll("script, foreignObject").forEach((element) => {
      element.remove();
    });

    svg.querySelectorAll(SVG_REGION_SHAPE_SELECTOR).forEach((shape) => {
      if (!(shape instanceof Element) || isStructuralShape(shape)) {
        return;
      }

      const fill = shape.getAttribute("fill");
      const regionId = REGION_FILL_TO_ID[normalizeHex(fill)];

      if (regionId) {
        const clone = shape.cloneNode(true) as Element;
        clone.removeAttribute("class");
        clone.removeAttribute("style");
        clone.removeAttribute("fill");
        clone.removeAttribute("stroke");
        clone.removeAttribute("stroke-width");
        clone.removeAttribute("data-region-path");
        clone.removeAttribute("data-vocabulary-region");
        regionMarkupBuckets[regionId].push(clone.outerHTML);
      }
    });
  }

  const regionMarkupById = REGION_ORDER.reduce((accumulator, regionId) => {
    accumulator[regionId] = regionMarkupBuckets[regionId].join("");
    return accumulator;
  }, {} as Record<VocabularyRegionId, string>);

  return {
    viewBox: svg?.getAttribute("viewBox") || DEFAULT_VIEW_BOX,
    svgInnerMarkup: svg?.innerHTML ?? "",
    regionMarkupById,
  };
}
