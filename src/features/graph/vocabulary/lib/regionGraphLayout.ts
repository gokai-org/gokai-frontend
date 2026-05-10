import type { GraphEdge, GraphNode } from "@/features/graph/lib/graphTypes";
import { GRAPH_CONFIG } from "./graphConfig";
import type {
  VocabularyRegionBounds,
  VocabularyRegionNodePoint,
  VocabularySvgViewport,
} from "../types";

export type RegionGraphNodeLayout = {
  node: GraphNode;
  x: number;
  y: number;
  radius: number;
};

export type RegionGraphEdgeLayout = {
  edge: GraphEdge;
  from: VocabularyRegionNodePoint;
  to: VocabularyRegionNodePoint;
};

export type RegionGraphLayout = {
  nodes: RegionGraphNodeLayout[];
  edges: RegionGraphEdgeLayout[];
};

export type RegionGraphNodeRadiusResolver = (node: GraphNode) => number;

const DEFAULT_NODE_RADIUS = 2.8;
const EDGE_NODE_GAP = 0.08;
const BOARD_HOME_NODE_SIZE = 112;
const BOARD_REGULAR_NODE_SIZE = 80;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance(a: VocabularyRegionNodePoint, b: VocabularyRegionNodePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getSafeBoundsPadding(
  bounds: VocabularyRegionBounds,
  total: number,
) {
  const density = clamp((total - 1) / 10, 0, 1);

  return {
    side: Math.max(bounds.width * (0.055 + density * 0.01), 2.6),
    top: Math.max(bounds.height * 0.05, 1.9),
    bottom: Math.max(bounds.height * (0.11 + density * 0.025), 4.1),
  };
}

export function buildNodeEdgeConnection(
  fromCenter: VocabularyRegionNodePoint,
  toCenter: VocabularyRegionNodePoint,
  fromRadius: number,
  toRadius: number,
): { from: VocabularyRegionNodePoint; to: VocabularyRegionNodePoint } {
  const deltaX = toCenter.x - fromCenter.x;
  const deltaY = toCenter.y - fromCenter.y;
  const length = Math.hypot(deltaX, deltaY);

  if (length <= 0.001) {
    return { from: fromCenter, to: toCenter };
  }

  const unitX = deltaX / length;
  const unitY = deltaY / length;
  const sourceOffset = Math.min(fromRadius + EDGE_NODE_GAP, length * 0.42);
  const targetOffset = Math.min(toRadius + EDGE_NODE_GAP, length * 0.42);

  return {
    from: {
      x: fromCenter.x + unitX * sourceOffset,
      y: fromCenter.y + unitY * sourceOffset,
    },
    to: {
      x: toCenter.x - unitX * targetOffset,
      y: toCenter.y - unitY * targetOffset,
    },
  };
}

export function toSvgPoint(
  point: VocabularyRegionNodePoint,
  viewport: VocabularySvgViewport,
): VocabularyRegionNodePoint {
  return {
    x: viewport.x + (point.x / 100) * viewport.width,
    y: viewport.y + (point.y / 100) * viewport.height,
  };
}

function getFallbackPoint(
  bounds: VocabularyRegionBounds,
  index: number,
  total: number,
): VocabularyRegionNodePoint {
  if (total <= 1) {
    return { x: bounds.centerX, y: bounds.centerY };
  }

  const columns = total <= 4 ? 2 : total <= 8 ? 3 : total <= 14 ? 4 : 5;
  const rows = Math.ceil(total / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const padding = getSafeBoundsPadding(bounds, total);
  const minX = bounds.x + padding.side;
  const maxX = bounds.x + bounds.width - padding.side;
  const minY = bounds.y + padding.top;
  const maxY = bounds.y + bounds.height - padding.bottom;

  return {
    x: clamp(
      minX + ((maxX - minX) * column) / Math.max(columns - 1, 1),
      bounds.x + 1.8,
      bounds.x + bounds.width - 1.8,
    ),
    y: clamp(
      rows === 1
        ? bounds.centerY
        : minY + ((maxY - minY) * row) / Math.max(rows - 1, 1),
      bounds.y + 1.8,
      bounds.y + bounds.height - 1.8,
    ),
  };
}

function getBoardNodeSize(node: GraphNode) {
  return node.id === "home" || node.data.type === "home"
    ? BOARD_HOME_NODE_SIZE
    : BOARD_REGULAR_NODE_SIZE;
}

function buildPreferredRegionPoint(
  node: GraphNode,
  bounds: VocabularyRegionBounds,
  totalNodes: number,
): VocabularyRegionNodePoint {
  const boardNodeSize = getBoardNodeSize(node);
  const boardMaxX = Math.max(GRAPH_CONFIG.layout.width - boardNodeSize, 1);
  const boardMaxY = Math.max(GRAPH_CONFIG.layout.height - boardNodeSize, 1);
  const normalizedX = clamp(node.position.x / boardMaxX, 0, 1);
  const normalizedY = clamp(node.position.y / boardMaxY, 0, 1);
  const aspectRatio = bounds.width / Math.max(bounds.height, 1);
  const density = clamp((totalNodes - 1) / 8, 0, 1);
  const spreadX = clamp(
    (aspectRatio < 0.78 ? 0.72 : aspectRatio > 1.28 ? 0.96 : 0.88) +
      density * 0.04,
    0.68,
    0.98,
  );
  const spreadY = clamp(
    (aspectRatio < 0.78 ? 0.96 : aspectRatio > 1.28 ? 0.72 : 0.88) +
      density * 0.04,
    0.68,
    0.98,
  );
  const compactX =
    node.id === "home"
      ? 0.5 + (normalizedX - 0.5) * Math.min(spreadX, 0.4)
      : 0.5 + (normalizedX - 0.5) * spreadX;
  const compactY =
    node.id === "home"
      ? 0.34 + (normalizedY - 0.18) * Math.min(spreadY, 0.42)
      : 0.5 + (normalizedY - 0.5) * spreadY;
  const padding = getSafeBoundsPadding(bounds, totalNodes);
  const minX = bounds.x + padding.side;
  const maxX = bounds.x + bounds.width - padding.side;
  const minY = bounds.y + padding.top;
  const maxY = bounds.y + bounds.height - padding.bottom;

  return {
    x: clamp(
      minX + (maxX - minX) * compactX,
      bounds.x + 1.8,
      bounds.x + bounds.width - 1.8,
    ),
    y: clamp(
      minY + (maxY - minY) * compactY,
      bounds.y + 1.8,
      bounds.y + bounds.height - 1.8,
    ),
  };
}

function getUniquePoints(points: VocabularyRegionNodePoint[]) {
  return points.filter(
    (point, index, collection) =>
      collection.findIndex((candidate) => distance(candidate, point) < 0.001) ===
      index,
  );
}

function isPointInsideBounds(
  point: VocabularyRegionNodePoint,
  bounds: VocabularyRegionBounds,
) {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

function getSafeNodePoints(
  bounds: VocabularyRegionBounds,
  nodePoints: VocabularyRegionNodePoint[] | null,
) {
  return getUniquePoints([...(nodePoints ?? [])]).filter((point) =>
    isPointInsideBounds(point, bounds),
  );
}

function buildGoldenFallbackPoints(
  bounds: VocabularyRegionBounds,
  total: number,
) {
  const padding = getSafeBoundsPadding(bounds, total);
  const minX = bounds.x + padding.side;
  const maxX = bounds.x + bounds.width - padding.side;
  const minY = bounds.y + padding.top;
  const maxY = bounds.y + bounds.height - padding.bottom;
  const radiusX = Math.max((maxX - minX) / 2, 1);
  const radiusY = Math.max((maxY - minY) / 2, 1);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const count = Math.max(total * 7, 36);

  return Array.from({ length: count }).map((_, index) => {
    const radius = Math.sqrt((index + 0.5) / count);
    const angle = index * goldenAngle;

    return {
      x: clamp(bounds.centerX + Math.cos(angle) * radiusX * radius, minX, maxX),
      y: clamp(bounds.centerY + Math.sin(angle) * radiusY * radius, minY, maxY),
    };
  });
}

function buildCandidatePointPool(
  bounds: VocabularyRegionBounds,
  nodePoints: VocabularyRegionNodePoint[] | null,
  total: number,
) {
  const providedPoints = getSafeNodePoints(bounds, nodePoints);

  if (providedPoints.length >= total) {
    return providedPoints;
  }

  const fallbackPoints = Array.from({ length: total }).map((_, index) =>
    getFallbackPoint(bounds, index, total),
  );

  return getUniquePoints([
    ...providedPoints,
    ...buildGoldenFallbackPoints(bounds, total),
    ...fallbackPoints,
  ]);
}

function buildRouteAnchors(
  bounds: VocabularyRegionBounds,
  total: number,
) {
  if (total <= 0) {
    return [];
  }

  if (total === 1) {
    return [{ x: bounds.centerX, y: bounds.centerY }];
  }

  const aspectRatio = bounds.width / Math.max(bounds.height, 1);
  const radiusX = bounds.width * (aspectRatio > 1.24 ? 0.43 : aspectRatio < 0.78 ? 0.28 : 0.37);
  const radiusY = bounds.height * (aspectRatio < 0.78 ? 0.43 : aspectRatio > 1.24 ? 0.28 : 0.37);
  const startAngle = -Math.PI / 2;

  return Array.from({ length: total }).map((_, index) => {
    const angle = startAngle + (Math.PI * 2 * index) / total;

    return {
      x: bounds.centerX + Math.cos(angle) * radiusX,
      y: bounds.centerY + Math.sin(angle) * radiusY,
    };
  });
}

function selectSpreadRoutePoints(
  candidates: VocabularyRegionNodePoint[],
  bounds: VocabularyRegionBounds,
  total: number,
  minimumSpacing: number,
) {
  if (total <= 0) {
    return [];
  }

  if (candidates.length <= total) {
    return candidates.slice(0, total);
  }

  const anchors = buildRouteAnchors(bounds, total);
  const center = { x: bounds.centerX, y: bounds.centerY };
  const regionScale = Math.max(bounds.width, bounds.height);
  const selected: VocabularyRegionNodePoint[] = [];
  const remaining = [...candidates];

  while (selected.length < total && remaining.length > 0) {
    const anchor = anchors[selected.length] ?? center;
    const eligibleCandidates = selected.length === 0
      ? remaining
      : remaining.filter(
          (candidate) => getNearestDistance(candidate, selected) >= minimumSpacing,
        );
    const scoringCandidates = eligibleCandidates.length > 0
      ? eligibleCandidates
      : remaining;
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    scoringCandidates.forEach((candidate, index) => {
      const nearestDistance = getNearestDistance(candidate, selected);
      const anchorDistance = distance(candidate, anchor);
      const centerDistance = distance(candidate, center);
      const spacingScore = Number.isFinite(nearestDistance)
        ? nearestDistance * 2.45
        : regionScale * 0.56;
      const outerRouteBonus = Math.min(centerDistance, regionScale * 0.52) * 0.3;
      const score =
        spacingScore +
        outerRouteBonus -
        anchorDistance * 0.5 -
        Math.max(0, centerDistance - regionScale * 0.62) * 0.28;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    const selectedCandidate = scoringCandidates[bestIndex];
    const remainingIndex = remaining.findIndex(
      (candidate) => candidate === selectedCandidate,
    );

    selected.push(remaining.splice(Math.max(remainingIndex, 0), 1)[0]);
  }

  return selected;
}

function getProgressiveNodeOrder(nodes: GraphNode[], edges: GraphEdge[]) {
  if (!edges.length) {
    return nodes;
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const incoming = new Set(edges.map((edge) => edge.target));
  const firstEdge = edges.find((edge) => !incoming.has(edge.source)) ?? edges[0];
  const ordered: GraphNode[] = [];
  const visited = new Set<string>();

  let currentId: string | undefined = firstEdge?.source;

  while (currentId && !visited.has(currentId)) {
    const node = nodeById.get(currentId);

    if (!node) {
      break;
    }

    ordered.push(node);
    visited.add(currentId);
    currentId = edges.find((edge) => edge.source === currentId)?.target;
  }

  return [
    ...ordered,
    ...nodes.filter((node) => !visited.has(node.id)),
  ];
}

function getNearestDistance(
  point: VocabularyRegionNodePoint,
  points: VocabularyRegionNodePoint[],
) {
  if (!points.length) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(...points.map((candidate) => distance(point, candidate)));
}

function getNearestDistanceExcept(
  point: VocabularyRegionNodePoint,
  points: VocabularyRegionNodePoint[],
  excludedIndex: number,
) {
  const otherPoints = points.filter((_, index) => index !== excludedIndex);

  return getNearestDistance(point, otherPoints);
}

function isSamePoint(
  a: VocabularyRegionNodePoint,
  b: VocabularyRegionNodePoint,
) {
  return distance(a, b) < 0.001;
}

type ClosestPointPair = {
  leftIndex: number;
  rightIndex: number;
  distance: number;
};

type BestReplacement = {
  pointIndex: number;
  point: VocabularyRegionNodePoint;
  score: number;
};

function getClosestPointPair(
  points: VocabularyRegionNodePoint[],
): ClosestPointPair | null {
  let closest: ClosestPointPair | null = null;

  points.forEach((point, leftIndex) => {
    points.slice(leftIndex + 1).forEach((candidate, offsetIndex) => {
      const pairDistance = distance(point, candidate);

      if (!closest || pairDistance < closest.distance) {
        closest = {
          leftIndex,
          rightIndex: leftIndex + offsetIndex + 1,
          distance: pairDistance,
        };
      }
    });
  });

  return closest;
}

function refineSpreadRoutePoints(
  selected: VocabularyRegionNodePoint[],
  candidates: VocabularyRegionNodePoint[],
  anchors: VocabularyRegionNodePoint[],
  bounds: VocabularyRegionBounds,
  minimumSpacing: number,
) {
  const refined = [...selected];
  const center = { x: bounds.centerX, y: bounds.centerY };
  const regionScale = Math.max(bounds.width, bounds.height);

  for (let iteration = 0; iteration < refined.length * 4; iteration += 1) {
    const closestPair = getClosestPointPair(refined);

    if (!closestPair || closestPair.distance >= minimumSpacing) {
      break;
    }

    let bestReplacement: BestReplacement | null = null;

    for (const pointIndex of [closestPair.leftIndex, closestPair.rightIndex]) {
      const currentNearestDistance = getNearestDistanceExcept(
        refined[pointIndex],
        refined,
        pointIndex,
      );

      for (const candidate of candidates) {
        const alreadySelected = refined.some(
          (point, index) => index !== pointIndex && isSamePoint(point, candidate),
        );

        if (alreadySelected) {
          continue;
        }

        const nearestDistance = getNearestDistanceExcept(
          candidate,
          refined,
          pointIndex,
        );

        if (nearestDistance <= currentNearestDistance + 0.08) {
          continue;
        }

        const anchor = anchors[pointIndex] ?? center;
        const anchorDistance = distance(candidate, anchor);
        const centerDistance = distance(candidate, center);
        const score =
          nearestDistance * 3.4 +
          Math.min(centerDistance, regionScale * 0.54) * 0.22 -
          anchorDistance * 0.34;

        if (!bestReplacement || score > bestReplacement.score) {
          bestReplacement = { pointIndex, point: candidate, score };
        }
      }
    }

    if (!bestReplacement) {
      break;
    }

    refined[bestReplacement.pointIndex] = bestReplacement.point;
  }

  return refined;
}

function getOrderedPoints(
  nodes: GraphNode[],
  edges: GraphEdge[],
  bounds: VocabularyRegionBounds,
  nodePoints: VocabularyRegionNodePoint[] | null,
) {
  const candidatePool = buildCandidatePointPool(bounds, nodePoints, nodes.length);
  const orderedPoints: VocabularyRegionNodePoint[] = Array.from({ length: nodes.length });
  const assignmentOrder = getProgressiveNodeOrder(nodes, edges);
  const minimumRouteSpacing = Math.max(
    Math.min(bounds.width, bounds.height) * (nodes.length >= 8 ? 0.3 : 0.22),
    nodes.length >= 8 ? 3.25 : 2.45,
  );
  const routePoints = selectSpreadRoutePoints(
    candidatePool,
    bounds,
    nodes.length,
    minimumRouteSpacing,
  );
  const refinedRoutePoints = refineSpreadRoutePoints(
    routePoints,
    candidatePool,
    buildRouteAnchors(bounds, nodes.length),
    bounds,
    minimumRouteSpacing,
  );

  assignmentOrder.forEach((node, routeIndex) => {
    const index = nodes.findIndex((candidate) => candidate.id === node.id);
    const target = refinedRoutePoints[routeIndex] ?? buildPreferredRegionPoint(node, bounds, nodes.length);

    const nextPoint = target;

    orderedPoints[index] = nextPoint;
  });

  return orderedPoints.map(
    (point, index) => point ?? getFallbackPoint(bounds, index, nodes.length),
  );
}

export function buildRegionGraphLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  bounds: VocabularyRegionBounds | null,
  nodePoints: VocabularyRegionNodePoint[] | null,
  viewport: VocabularySvgViewport | null,
  resolveNodeRadius: RegionGraphNodeRadiusResolver = () => DEFAULT_NODE_RADIUS,
): RegionGraphLayout {
  if (!bounds || !viewport || nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const safeNodePoints = getSafeNodePoints(bounds, nodePoints);

  if (safeNodePoints.length < nodes.length) {
    return { nodes: [], edges: [] };
  }

  const orderedPoints = getOrderedPoints(nodes, edges, bounds, safeNodePoints);
  const layoutNodes = nodes.map((node, index) => ({
    node,
    radius: resolveNodeRadius(node),
    ...toSvgPoint(orderedPoints[index], viewport),
  }));
  const nodeLookup = new Map(
    layoutNodes.map((layoutNode) => [layoutNode.node.id, layoutNode]),
  );
  const layoutEdges = edges.flatMap((edge) => {
    const source = nodeLookup.get(edge.source);
    const target = nodeLookup.get(edge.target);

    if (!source || !target) {
      return [];
    }

    const connection = buildNodeEdgeConnection(
      { x: source.x, y: source.y },
      { x: target.x, y: target.y },
      source.radius,
      target.radius,
    );

    return [{ edge, ...connection }];
  });

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
  };
}

export function buildRegionGraphCurve(
  from: VocabularyRegionNodePoint,
  to: VocabularyRegionNodePoint,
) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const edgeLength = Math.max(Math.hypot(deltaX, deltaY), 1);

  if (edgeLength <= 9) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  const unitX = deltaX / edgeLength;
  const unitY = deltaY / edgeLength;
  const normalX = -unitY;
  const normalY = unitX;
  const bendDirection = Math.abs(deltaX) > 0.001 ? (deltaX >= 0 ? 1 : -1) : deltaY >= 0 ? -1 : 1;
  const bend = clamp(edgeLength * 0.052, 0.34, 2.5) * bendDirection;
  const controlDistance = edgeLength * 0.34;
  const firstControl = {
    x: from.x + unitX * controlDistance + normalX * bend,
    y: from.y + unitY * controlDistance + normalY * bend,
  };
  const secondControl = {
    x: to.x - unitX * controlDistance + normalX * bend,
    y: to.y - unitY * controlDistance + normalY * bend,
  };

  return `M ${from.x} ${from.y} C ${firstControl.x} ${firstControl.y}, ${secondControl.x} ${secondControl.y}, ${to.x} ${to.y}`;
}
