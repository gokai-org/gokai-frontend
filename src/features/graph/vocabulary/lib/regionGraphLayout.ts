import type { GraphEdge, GraphNode } from "@/features/graph/lib/graphTypes";
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
const EDGE_NODE_GAP = 0.45;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distanceToBoundsCenter(
  point: VocabularyRegionNodePoint,
  bounds: VocabularyRegionBounds,
) {
  return Math.hypot(point.x - bounds.centerX, point.y - bounds.centerY);
}

function distance(a: VocabularyRegionNodePoint, b: VocabularyRegionNodePoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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

  const columns = total <= 4 ? 2 : total <= 9 ? 3 : 4;
  const rows = Math.ceil(total / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const insetX = Math.max(bounds.width * 0.22, 2.4);
  const insetY = Math.max(bounds.height * 0.22, 2.4);
  const minX = bounds.x + insetX;
  const maxX = bounds.x + bounds.width - insetX;
  const minY = bounds.y + insetY;
  const maxY = bounds.y + bounds.height - insetY;

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

function getOrderedPoints(
  nodes: GraphNode[],
  bounds: VocabularyRegionBounds,
  nodePoints: VocabularyRegionNodePoint[] | null,
) {
  const availablePoints = [...(nodePoints ?? [])];
  const orderedPoints: VocabularyRegionNodePoint[] = [];
  const homeIndex = nodes.findIndex((node) => node.id === "home");
  const boundsCenter = { x: bounds.centerX, y: bounds.centerY };

  if (homeIndex >= 0 && availablePoints.length > 0) {
    let bestPointIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    availablePoints.forEach((point, index) => {
      const distance = distanceToBoundsCenter(point, bounds);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestPointIndex = index;
      }
    });

    orderedPoints[homeIndex] = availablePoints.splice(bestPointIndex, 1)[0];
  }

  const graphCenter = orderedPoints[homeIndex] ?? boundsCenter;
  const childNodes = nodes
    .map((node, index) => ({ node, index }))
    .filter(({ index }) => index !== homeIndex);
  const childFallbackPoints = childNodes.map((_, index) =>
    getFallbackPoint(bounds, index + 1, nodes.length),
  );
  const childPoints = [...availablePoints, ...childFallbackPoints]
    .filter(
      (point, index, points) =>
        points.findIndex((candidate) => distance(candidate, point) < 0.001) ===
        index,
    )
    .sort((a, b) => {
      const angleA = Math.atan2(a.y - graphCenter.y, a.x - graphCenter.x);
      const angleB = Math.atan2(b.y - graphCenter.y, b.x - graphCenter.x);

      if (Math.abs(angleA - angleB) > 0.001) {
        return angleA - angleB;
      }

      return distance(graphCenter, a) - distance(graphCenter, b);
    });

  childNodes.forEach(({ index }, childIndex) => {
    orderedPoints[index] =
      childPoints[childIndex] ?? getFallbackPoint(bounds, index, nodes.length);
  });

  nodes.forEach((_, index) => {
    if (orderedPoints[index]) {
      return;
    }

    orderedPoints[index] =
      availablePoints.shift() ?? getFallbackPoint(bounds, index, nodes.length);
  });

  return orderedPoints;
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
  const unitX = deltaX / edgeLength;
  const unitY = deltaY / edgeLength;
  const normalX = -unitY;
  const normalY = unitX;
  const bend = clamp(edgeLength * 0.1, 0.8, 4.8) * (deltaX >= 0 ? 1 : -1);
  const controlDistance = edgeLength * 0.42;
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
