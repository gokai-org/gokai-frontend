import type {
  VocabularyRegionBounds,
  VocabularyRegionLayout,
  VocabularyRegionNodePoint,
  VocabularySvgViewport,
} from "../types";

type SvgSamplePoint = {
  x: number;
  y: number;
};

const DEFAULT_VIEWPORT = { x: 0, y: 0, width: 483, height: 545 };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSvgViewport(svgRoot: SVGSVGElement): VocabularySvgViewport {
  const baseVal = svgRoot.viewBox?.baseVal;

  if (baseVal && baseVal.width > 0 && baseVal.height > 0) {
    return {
      x: baseVal.x,
      y: baseVal.y,
      width: baseVal.width,
      height: baseVal.height,
    };
  }

  const rawViewBox = svgRoot.getAttribute("viewBox")?.trim().split(/\s+/).map(Number);

  if (rawViewBox?.length === 4 && rawViewBox.every(Number.isFinite)) {
    const [x, y, width, height] = rawViewBox;
    return { x, y, width, height };
  }

  return DEFAULT_VIEWPORT;
}

function toPercentPoint(point: SvgSamplePoint, viewport: VocabularySvgViewport): VocabularyRegionNodePoint {
  return {
    x: ((point.x - viewport.x) / viewport.width) * 100,
    y: ((point.y - viewport.y) / viewport.height) * 100,
  };
}

function toPercentBounds(box: DOMRect | SVGRect, viewport: VocabularySvgViewport): VocabularyRegionBounds {
  return {
    x: ((box.x - viewport.x) / viewport.width) * 100,
    y: ((box.y - viewport.y) / viewport.height) * 100,
    width: (box.width / viewport.width) * 100,
    height: (box.height / viewport.height) * 100,
    centerX: ((box.x + box.width / 2 - viewport.x) / viewport.width) * 100,
    centerY: ((box.y + box.height / 2 - viewport.y) / viewport.height) * 100,
  };
}

function halton(index: number, base: number) {
  let result = 0;
  let fraction = 1 / base;
  let current = index;

  while (current > 0) {
    result += fraction * (current % base);
    current = Math.floor(current / base);
    fraction /= base;
  }

  return result;
}

function getRegionShapes(regionGroup: SVGGElement) {
  return Array.from(
    regionGroup.querySelectorAll("path, polygon, circle, ellipse, rect"),
  ).filter(
    (shape): shape is SVGGeometryElement =>
      typeof (shape as SVGGeometryElement).isPointInFill === "function",
  );
}

function isInsideRegion(shapes: SVGGeometryElement[], point: SvgSamplePoint) {
  return shapes.some((shape) => shape.isPointInFill(point));
}

function getCandidatePoints(shapes: SVGGeometryElement[], box: DOMRect | SVGRect, count: number) {
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const insetX = clamp(box.width * 0.14, 3, 22);
  const insetY = clamp(box.height * 0.14, 3, 22);
  const usableWidth = Math.max(box.width - insetX * 2, box.width * 0.3);
  const usableHeight = Math.max(box.height - insetY * 2, box.height * 0.3);
  const attempts = Math.max(180, count * 90);
  const candidates: SvgSamplePoint[] = [];

  if (isInsideRegion(shapes, center)) {
    candidates.push(center);
  }

  for (let index = 1; index <= attempts * 3 && candidates.length < attempts; index += 1) {
    const point = {
      x: box.x + insetX + usableWidth * halton(index, 2),
      y: box.y + insetY + usableHeight * halton(index, 3),
    };

    if (isInsideRegion(shapes, point)) {
      candidates.push(point);
    }
  }

  return candidates;
}

function getDistance(a: SvgSamplePoint, b: SvgSamplePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getCenterBias(point: SvgSamplePoint, box: DOMRect | SVGRect) {
  const target = {
    x: box.x + box.width / 2,
    y: box.y + box.height * 0.52,
  };
  const maxDistance = Math.max(Math.hypot(box.width / 2, box.height / 2), 1);
  return 1 - getDistance(point, target) / maxDistance;
}

function getEdgeBias(point: SvgSamplePoint, box: DOMRect | SVGRect) {
  const distanceToEdge = Math.min(
    point.x - box.x,
    box.x + box.width - point.x,
    point.y - box.y,
    box.y + box.height - point.y,
  );
  const normalizer = Math.max(Math.min(box.width, box.height) / 2, 1);
  return distanceToEdge / normalizer;
}

function selectNaturalPoints(candidates: SvgSamplePoint[], box: DOMRect | SVGRect, count: number) {
  if (count <= 0) {
    return [];
  }

  if (candidates.length <= count) {
    return candidates.slice(0, count);
  }

  const selected: SvgSamplePoint[] = [];
  const remaining = [...candidates];
  const boxScale = Math.max(box.width, box.height);

  let firstIndex = 0;
  let firstScore = -Infinity;

  remaining.forEach((candidate, index) => {
    const score = getCenterBias(candidate, box) * boxScale + getEdgeBias(candidate, box) * boxScale * 0.42;

    if (score > firstScore) {
      firstScore = score;
      firstIndex = index;
    }
  });

  selected.push(remaining.splice(firstIndex, 1)[0]);

  while (selected.length < count && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    remaining.forEach((candidate, index) => {
      const nearestDistance = selected.reduce(
        (distance, point) => Math.min(distance, getDistance(candidate, point)),
        Number.POSITIVE_INFINITY,
      );
      const score =
        nearestDistance +
        getCenterBias(candidate, box) * boxScale * 0.26 +
        getEdgeBias(candidate, box) * boxScale * 0.22;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  return selected;
}

function getFallbackPoints(box: DOMRect | SVGRect, count: number) {
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }).map((_, index) => {
    const x = box.x + box.width * (0.28 + ((index % 3) / Math.max(Math.min(count, 3) - 1, 1)) * 0.44);
    const y = box.y + box.height * (0.32 + (Math.floor(index / 3) / Math.max(Math.ceil(count / 3) - 1, 1)) * 0.36);

    return { x, y };
  });
}

export function buildRegionLayout(
  regionGroup: SVGGElement,
  svgRoot: SVGSVGElement,
  count: number,
): VocabularyRegionLayout | null {
  const box = regionGroup.getBBox();

  if (!box.width || !box.height) {
    return null;
  }

  const viewport = getSvgViewport(svgRoot);
  const shapes = getRegionShapes(regionGroup);
  const candidates = shapes.length > 0 ? getCandidatePoints(shapes, box, count) : [];
  const rawPoints = candidates.length > 0
    ? selectNaturalPoints(candidates, box, count)
    : getFallbackPoints(box, count);

  return {
    bounds: toPercentBounds(box, viewport),
    nodePoints: rawPoints.map((point) => toPercentPoint(point, viewport)),
    viewport,
  };
}