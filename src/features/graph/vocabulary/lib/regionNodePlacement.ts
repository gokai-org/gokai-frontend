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

type SvgExclusionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
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

function getRegionFootprint(box: DOMRect | SVGRect, count: number) {
  const base = Math.min(box.width, box.height);

  return {
    x: clamp(base * (count <= 4 ? 0.1 : count <= 8 ? 0.088 : 0.078), 5.2, 11.5),
    top: clamp(base * 0.058, 3.8, 7.4),
    bottom: clamp(base * (count <= 4 ? 0.13 : count <= 8 ? 0.118 : 0.104), 6.2, 13.8),
  };
}

function hasRegionFootprint(
  shapes: SVGGeometryElement[],
  point: SvgSamplePoint,
  footprint: ReturnType<typeof getRegionFootprint>,
) {
  const checkpoints = [
    { x: 0, y: 0 },
    { x: footprint.x, y: 0 },
    { x: -footprint.x, y: 0 },
    { x: footprint.x * 0.72, y: -footprint.top },
    { x: -footprint.x * 0.72, y: -footprint.top },
    { x: 0, y: -footprint.top },
    { x: footprint.x * 0.88, y: footprint.bottom * 0.62 },
    { x: -footprint.x * 0.88, y: footprint.bottom * 0.62 },
    { x: footprint.x * 0.4, y: footprint.bottom },
    { x: -footprint.x * 0.4, y: footprint.bottom },
    { x: 0, y: footprint.bottom },
  ];

  return checkpoints.every((checkpoint) =>
    isInsideRegion(shapes, {
      x: point.x + checkpoint.x,
      y: point.y + checkpoint.y,
    }),
  );
}

function overlapsExclusionRect(
  point: SvgSamplePoint,
  footprint: ReturnType<typeof getRegionFootprint>,
  rect: SvgExclusionRect,
) {
  const safeLeft = point.x - footprint.x * 1.02;
  const safeRight = point.x + footprint.x * 1.02;
  const safeTop = point.y - footprint.top * 1.12;
  const safeBottom = point.y + footprint.bottom * 1.08;

  return !(
    safeRight < rect.x ||
    safeLeft > rect.x + rect.width ||
    safeBottom < rect.y ||
    safeTop > rect.y + rect.height
  );
}

function respectsExclusionZones(
  point: SvgSamplePoint,
  footprint: ReturnType<typeof getRegionFootprint>,
  exclusionRects: SvgExclusionRect[],
) {
  return exclusionRects.every(
    (rect) => !overlapsExclusionRect(point, footprint, rect),
  );
}

function getCandidatePoints(
  shapes: SVGGeometryElement[],
  box: DOMRect | SVGRect,
  count: number,
  exclusionRects: SvgExclusionRect[],
) {
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const insetX = clamp(box.width * 0.2, 5, 28);
  const insetY = clamp(box.height * 0.2, 5, 28);
  const usableWidth = Math.max(box.width - insetX * 2, box.width * 0.2);
  const usableHeight = Math.max(box.height - insetY * 2, box.height * 0.2);
  const attempts = Math.max(220, count * 120);
  const footprint = getRegionFootprint(box, count);
  const safeCandidates: SvgSamplePoint[] = [];
  const insideCandidates: SvgSamplePoint[] = [];

  if (
    isInsideRegion(shapes, center) &&
    respectsExclusionZones(center, footprint, exclusionRects)
  ) {
    insideCandidates.push(center);

    if (hasRegionFootprint(shapes, center, footprint)) {
      safeCandidates.push(center);
    }
  }

  for (let index = 1; index <= attempts * 3 && insideCandidates.length < attempts; index += 1) {
    const point = {
      x: box.x + insetX + usableWidth * halton(index, 2),
      y: box.y + insetY + usableHeight * halton(index, 3),
    };

    if (
      isInsideRegion(shapes, point) &&
      respectsExclusionZones(point, footprint, exclusionRects)
    ) {
      insideCandidates.push(point);

      if (hasRegionFootprint(shapes, point, footprint)) {
        safeCandidates.push(point);
      }
    }
  }

  if (safeCandidates.length >= count) {
    return safeCandidates;
  }

  return [...safeCandidates, ...insideCandidates].filter(
    (candidate, index, collection) =>
      collection.findIndex(
        (point) => getDistance(point, candidate) < 0.001,
      ) === index,
  );
}

function getDistance(a: SvgSamplePoint, b: SvgSamplePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function buildAnchorPoints(box: DOMRect | SVGRect, count: number) {
  if (count <= 0) {
    return [];
  }

  const center = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };

  if (count === 1) {
    return [center];
  }

  const aspectRatio = box.width / Math.max(box.height, 1);
  const radiusX = aspectRatio < 0.78 ? 0.16 : aspectRatio > 1.28 ? 0.3 : 0.24;
  const radiusY = aspectRatio < 0.78 ? 0.34 : aspectRatio > 1.28 ? 0.2 : 0.27;
  const orbitCount = count - 1;
  const startAngle = aspectRatio < 0.78 ? -Math.PI / 2 : -Math.PI * 0.66;

  return [
    center,
    ...Array.from({ length: orbitCount }).map((_, index) => {
      const angle = startAngle + (Math.PI * 2 * index) / orbitCount;

      return {
        x: box.x + box.width * (0.5 + Math.cos(angle) * radiusX),
        y: box.y + box.height * (0.5 + Math.sin(angle) * radiusY),
      };
    }),
  ];
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

  const anchors = buildAnchorPoints(box, count);
  const selected: SvgSamplePoint[] = [];
  const remaining = [...candidates];
  const boxScale = Math.max(box.width, box.height);

  while (selected.length < count && remaining.length > 0) {
    const anchor = anchors[selected.length] ?? anchors[anchors.length - 1];
    let bestIndex = 0;
    let bestScore = -Infinity;

    remaining.forEach((candidate, index) => {
      const nearestDistance = selected.reduce(
        (distance, point) => Math.min(distance, getDistance(candidate, point)),
        Number.POSITIVE_INFINITY,
      );
      const anchorDistance = anchor
        ? getDistance(candidate, anchor)
        : getDistance(candidate, {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
          });
      const score =
        (Number.isFinite(nearestDistance) ? nearestDistance : boxScale * 0.35) *
          (selected.length === 0 ? 0.28 : 0.72) +
        getCenterBias(candidate, box) * boxScale *
          (selected.length === 0 ? 0.72 : 0.18) +
        getEdgeBias(candidate, box) * boxScale * 0.22 -
        anchorDistance * 1.08;

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

  return buildAnchorPoints(box, count);
}

function pullPointOutsideExclusionRects(
  point: SvgSamplePoint,
  box: DOMRect | SVGRect,
  exclusionRects: SvgExclusionRect[],
) {
  if (!exclusionRects.length) {
    return point;
  }

  const adjusted = { ...point };

  for (let iteration = 0; iteration < 6; iteration += 1) {
    const overlappingRect = exclusionRects.find(
      (rect) =>
        adjusted.x >= rect.x &&
        adjusted.x <= rect.x + rect.width &&
        adjusted.y >= rect.y &&
        adjusted.y <= rect.y + rect.height,
    );

    if (!overlappingRect) {
      break;
    }

    const rectCenterX = overlappingRect.x + overlappingRect.width / 2;
    const rectCenterY = overlappingRect.y + overlappingRect.height / 2;
    const awayX = adjusted.x - rectCenterX || (adjusted.x >= rectCenterX ? 1 : -1);
    const awayY = adjusted.y - rectCenterY || (adjusted.y >= rectCenterY ? 1 : -1);
    const pushX = (overlappingRect.width / 2 + 4.5) * Math.sign(awayX);
    const pushY = (overlappingRect.height / 2 + 4.5) * Math.sign(awayY);

    adjusted.x = clamp(adjusted.x + pushX, box.x + 4, box.x + box.width - 4);
    adjusted.y = clamp(adjusted.y + pushY, box.y + 4, box.y + box.height - 4);
  }

  return adjusted;
}

export function buildRegionLayout(
  regionGroup: SVGGElement,
  svgRoot: SVGSVGElement,
  count: number,
  exclusionRects: SvgExclusionRect[] = [],
): VocabularyRegionLayout | null {
  const box = regionGroup.getBBox();

  if (!box.width || !box.height) {
    return null;
  }

  const viewport = getSvgViewport(svgRoot);
  const shapes = getRegionShapes(regionGroup);
  const candidates = shapes.length > 0
    ? getCandidatePoints(shapes, box, count, exclusionRects)
    : [];
  const rawPoints = candidates.length > 0
    ? selectNaturalPoints(candidates, box, count)
    : getFallbackPoints(box, count).map((point) =>
        pullPointOutsideExclusionRects(point, box, exclusionRects),
      );

  return {
    bounds: toPercentBounds(box, viewport),
    nodePoints: rawPoints.map((point) => toPercentPoint(point, viewport)),
    viewport,
  };
}