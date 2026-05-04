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

function buildCandidatePointPool(
  bounds: VocabularyRegionBounds,
  nodePoints: VocabularyRegionNodePoint[] | null,
  total: number,
) {
  const providedPoints = getUniquePoints([...(nodePoints ?? [])]);

  if (providedPoints.length >= total) {
    return providedPoints;
  }

  const fallbackPoints = Array.from({ length: total }).map((_, index) =>
    getFallbackPoint(bounds, index, total),
  );

  return getUniquePoints([...providedPoints, ...fallbackPoints]);
}

function getOrderedPoints(
  nodes: GraphNode[],
  bounds: VocabularyRegionBounds,
  nodePoints: VocabularyRegionNodePoint[] | null,
) {
  const candidatePool = buildCandidatePointPool(bounds, nodePoints, nodes.length);
  const preferredPoints = nodes.map((node) =>
    buildPreferredRegionPoint(node, bounds, nodes.length),
  );
  const orderedPoints: VocabularyRegionNodePoint[] = Array.from({ length: nodes.length });
  const remainingCandidates = [...candidatePool];
  const assignedPoints: VocabularyRegionNodePoint[] = [];
  const desiredSpacing = Math.max(
    Math.min(bounds.width, bounds.height) * 0.18,
    nodes.length <= 6 ? 7.4 : 6.2,
  );
  const nodeAssignmentOrder = nodes
    .map((node, index) => ({
      index,
      node,
      target: preferredPoints[index],
      priority:
        node.id === "home"
          ? Number.POSITIVE_INFINITY
          : distance(preferredPoints[index], {
              x: bounds.centerX,
              y: bounds.centerY,
            }),
    }))
    .sort((a, b) => b.priority - a.priority);

  nodeAssignmentOrder.forEach(({ index, target }) => {
    if (remainingCandidates.length === 0) {
      orderedPoints[index] = getFallbackPoint(bounds, index, nodes.length);
      assignedPoints.push(orderedPoints[index]);
      return;
    }

    let bestCandidateIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    remainingCandidates.forEach((candidate, candidateIndex) => {
      const targetDistance = distance(candidate, target);
      const centerDistance = distance(candidate, {
        x: bounds.centerX,
        y: bounds.centerY,
      });
      const nearestAssignedDistance = assignedPoints.length
        ? Math.min(
            ...assignedPoints.map((assignedPoint) =>
              distance(candidate, assignedPoint),
            ),
          )
        : desiredSpacing;
      const spacingPenalty = Math.max(0, desiredSpacing - nearestAssignedDistance) * 2.3;
      const spreadBonus = Math.min(nearestAssignedDistance, desiredSpacing * 1.35) * 0.26;
      const edgeBias = centerDistance * 0.08;
      const score = targetDistance * 0.86 + spacingPenalty - spreadBonus - edgeBias;

      if (score < bestScore) {
        bestScore = score;
        bestCandidateIndex = candidateIndex;
      }
    });

    orderedPoints[index] = remainingCandidates.splice(bestCandidateIndex, 1)[0];
    assignedPoints.push(orderedPoints[index]);
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

  const orderedPoints = getOrderedPoints(nodes, bounds, nodePoints);
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
