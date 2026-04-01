import type {
  KanjiConstellationEdge,
  KanjiConstellationNode,
  KanjiConstellationProgress,
  KanjiConstellationQualityProfile,
  KanjiConstellationStatus,
} from "../types";

const NODE_WIDTH = 168;
const NODE_HEIGHT = 196;
const WORLD_WIDTH_BASE = 5200;
const WORLD_WIDTH_STEP = 54;
const WORLD_HEIGHT_BASE = 3000;
const WORLD_HEIGHT_STEP = 280;
const X_MARGIN = 420;
const Y_MARGIN = 340;
const MIN_SPACING_X = NODE_WIDTH * 1.04;
const MIN_SPACING_Y = NODE_HEIGHT * 0.86;
const RELAXATION_PASSES = 5;
const SPRING_BACK = 0.3;

type LayoutFrame = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  laneCount: number;
  laneGap: number;
};

type Point = {
  x: number;
  y: number;
};

type Vector = {
  x: number;
  y: number;
};

type LayoutNode = {
  id: string;
  position: Point;
};

type LayoutEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

export type KanjiConstellationLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  translateExtent: [[number, number], [number, number]];
};

function seededFraction(seed: number, salt: number) {
  const value = Math.sin(seed * 91.137 + salt * 31.331) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function normalizeVector(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function getLayoutFrame(total: number): LayoutFrame {
  const laneCount = clamp(Math.ceil(total / 15), 4, 7);
  const width = Math.max(WORLD_WIDTH_BASE, WORLD_WIDTH_BASE + (total - 40) * WORLD_WIDTH_STEP);
  const height = Math.max(
    WORLD_HEIGHT_BASE,
    WORLD_HEIGHT_BASE + (laneCount - 4) * WORLD_HEIGHT_STEP,
  );

  return {
    width,
    height,
    centerX: width / 2,
    centerY: height / 2,
    laneCount,
    laneGap: (height - Y_MARGIN * 2) / Math.max(laneCount - 1, 1),
  };
}

function getPathAnchor(frame: LayoutFrame, lane: number, localT: number): Point {
  const direction = lane % 2 === 0 ? 1 : -1;
  const startX = X_MARGIN;
  const endX = frame.width - X_MARGIN;
  const pathX = direction === 1 ? lerp(startX, endX, localT) : lerp(endX, startX, localT);
  const baseY = Y_MARGIN + lane * frame.laneGap;

  const lateralWave = Math.sin(localT * Math.PI * 2 + lane * 0.72) * 164;
  const verticalWave =
    Math.sin(localT * Math.PI * 2.2 + lane * 0.88) * frame.laneGap * 0.24 +
    Math.cos(localT * Math.PI * 4.8 + lane * 0.46) * frame.laneGap * 0.09;

  return {
    x: pathX + lateralWave,
    y: baseY + verticalWave,
  };
}

function getAnchorAndVectors(index: number, total: number, frame: LayoutFrame) {
  const progress = index / Math.max(total - 1, 1);
  const laneProgress = progress * frame.laneCount;
  const lane = Math.min(frame.laneCount - 1, Math.floor(laneProgress));
  const localT = clamp(laneProgress - lane, 0, 0.999);
  const anchor = getPathAnchor(frame, lane, localT);
  const sampleAnchor = getPathAnchor(frame, lane, clamp(localT + 0.018, 0, 1));

  const tangent = normalizeVector({
    x: sampleAnchor.x - anchor.x,
    y: sampleAnchor.y - anchor.y,
  });
  const normal = {
    x: -tangent.y,
    y: tangent.x,
  };

  return { anchor, tangent, normal, progress };
}

function getInitialNodePosition(index: number, total: number, frame: LayoutFrame): Point {
  if (total <= 1) {
    return { x: frame.centerX, y: frame.centerY };
  }

  const { anchor, tangent, normal, progress } = getAnchorAndVectors(index, total, frame);
  const shellPattern = [0, -1, 1, -2, 2];
  const shell = shellPattern[index % shellPattern.length];
  const normalOffset = shell * 82 + (seededFraction(index, 1) - 0.5) * 26;
  const tangentOffset = (seededFraction(index, 2) - 0.5) * 48;

  const x =
    anchor.x +
    normal.x * normalOffset +
    tangent.x * tangentOffset +
    Math.sin(progress * Math.PI * 7.4) * 24;
  const y =
    anchor.y +
    normal.y * normalOffset +
    tangent.y * tangentOffset +
    Math.cos(progress * Math.PI * 6.2) * 18;

  return { x, y };
}

function relaxNodePositions(basePositions: Point[], frame: LayoutFrame): Point[] {
  const positions = basePositions.map((position) => ({ ...position }));

  for (let pass = 0; pass < RELAXATION_PASSES; pass += 1) {
    const deltas = positions.map(() => ({ x: 0, y: 0 }));

    for (let sourceIndex = 0; sourceIndex < positions.length; sourceIndex += 1) {
      for (let targetIndex = sourceIndex + 1; targetIndex < positions.length; targetIndex += 1) {
        const dx = positions[targetIndex].x - positions[sourceIndex].x;
        const dy = positions[targetIndex].y - positions[sourceIndex].y;

        const distanceMetric =
          (dx * dx) / (MIN_SPACING_X * MIN_SPACING_X) +
          (dy * dy) / (MIN_SPACING_Y * MIN_SPACING_Y);

        if (distanceMetric >= 1) continue;

        const distance = Math.hypot(dx, dy) || 0.001;
        const overlap = 1 - distanceMetric;
        const push = 22 * overlap;
        const directionX = dx / distance;
        const directionY = dy / distance;

        deltas[sourceIndex].x -= directionX * push * 0.5;
        deltas[sourceIndex].y -= directionY * push * 0.5;
        deltas[targetIndex].x += directionX * push * 0.5;
        deltas[targetIndex].y += directionY * push * 0.5;
      }
    }

    for (let index = 0; index < positions.length; index += 1) {
      positions[index].x += deltas[index].x;
      positions[index].y += deltas[index].y;
      positions[index].x += (basePositions[index].x - positions[index].x) * SPRING_BACK;
      positions[index].y += (basePositions[index].y - positions[index].y) * SPRING_BACK;
    }

    for (let index = 1; index < positions.length - 1; index += 1) {
      const midpointX = (positions[index - 1].x + positions[index + 1].x) / 2;
      const midpointY = (positions[index - 1].y + positions[index + 1].y) / 2;

      positions[index].x = positions[index].x * 0.82 + midpointX * 0.18;
      positions[index].y = positions[index].y * 0.82 + midpointY * 0.18;
    }
  }

  const minX = Math.min(...positions.map((position) => position.x));
  const maxX = Math.max(...positions.map((position) => position.x));
  const minY = Math.min(...positions.map((position) => position.y));
  const maxY = Math.max(...positions.map((position) => position.y));
  const offsetX = frame.centerX - (minX + maxX) / 2;
  const offsetY = frame.centerY - (minY + maxY) / 2;

  return positions.map((position) => ({
    x: position.x + offsetX,
    y: position.y + offsetY,
  }));
}

function getHandles(source: { x: number; y: number }, target: { x: number; y: number }) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "source-right", targetHandle: "target-left" }
      : { sourceHandle: "source-left", targetHandle: "target-right" };
  }

  return dy >= 0
    ? { sourceHandle: "source-bottom", targetHandle: "target-top" }
    : { sourceHandle: "source-top", targetHandle: "target-bottom" };
}

function getEdgeStatus(
  source: KanjiConstellationProgress,
  target: KanjiConstellationProgress,
): KanjiConstellationStatus {
  if (source.status === "completed" && target.status === "completed") {
    return "completed";
  }

  if (target.status === "available") {
    return "available";
  }

  return "locked";
}

function createLayoutEdge(
  edgeId: string,
  sourceId: string,
  targetId: string,
  sourcePosition: { x: number; y: number },
  targetPosition: { x: number; y: number },
): LayoutEdge {
  const { sourceHandle, targetHandle } = getHandles(sourcePosition, targetPosition);

  return {
    id: edgeId,
    source: sourceId,
    target: targetId,
    sourceHandle,
    targetHandle,
  };
}

function createSequentialLayoutEdges(ids: string[], positions: Point[]) {
  return ids.slice(0, -1).map((currentId, index) => {
    const nextId = ids[index + 1];

    return createLayoutEdge(
      `${currentId}-${nextId}`,
      currentId,
      nextId,
      positions[index],
      positions[index + 1],
    );
  });
}

export function buildKanjiConstellationLayout(ids: string[]): KanjiConstellationLayout {
  const frame = getLayoutFrame(ids.length);
  const positions = relaxNodePositions(
    ids.map((_, index) => getInitialNodePosition(index, ids.length, frame)),
    frame,
  );

  const minX = Math.min(...positions.map((position) => position.x)) - 1400;
  const maxX = Math.max(...positions.map((position) => position.x)) + 1400;
  const minY = Math.min(...positions.map((position) => position.y)) - 1200;
  const maxY = Math.max(...positions.map((position) => position.y)) + 1200;

  return {
    nodes: ids.map((id, index) => ({
      id,
      position: positions[index],
    })),
    edges: createSequentialLayoutEdges(ids, positions),
    translateExtent: [
      [minX, minY],
      [maxX, maxY],
    ],
  };
}

export function createKanjiConstellationGraph(
  items: KanjiConstellationProgress[],
  layout: KanjiConstellationLayout,
  selectedId: string | null,
  qualityProfile: KanjiConstellationQualityProfile,
): { nodes: KanjiConstellationNode[]; edges: KanjiConstellationEdge[] } {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  const nodes: KanjiConstellationNode[] = layout.nodes.flatMap((layoutNode) => {
    const progress = itemsById.get(layoutNode.id);
    if (!progress) return [];

    return [{
      id: progress.id,
      type: "kanji-planet",
      position: layoutNode.position,
      data: {
        progress,
        selected: progress.id === selectedId,
        qualityTier: qualityProfile.tier,
        glowScale: qualityProfile.node.glowScale,
        shadowScale: qualityProfile.node.shadowScale,
        showOrbitRings: qualityProfile.node.showOrbitRings,
        shouldUsePulse: qualityProfile.node.shouldUsePulse,
      },
      draggable: false,
      selectable: true,
      focusable: true,
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: "transparent",
        border: "none",
      },
    }];
  });

  const edges: KanjiConstellationEdge[] = layout.edges.flatMap((layoutEdge) => {
    const source = itemsById.get(layoutEdge.source);
    const target = itemsById.get(layoutEdge.target);
    if (!source || !target) return [];

    return [{
      id: layoutEdge.id,
      source: layoutEdge.source,
      target: layoutEdge.target,
      type: "kanji-constellation",
      sourceHandle: layoutEdge.sourceHandle,
      targetHandle: layoutEdge.targetHandle,
      data: {
        status: getEdgeStatus(source, target),
        highlight: selectedId === source.id || selectedId === target.id,
        qualityTier: qualityProfile.tier,
        widthScale: qualityProfile.edge.widthScale,
        opacityScale: qualityProfile.edge.opacityScale,
        showLockedDash: qualityProfile.edge.showLockedDash,
        curvature: qualityProfile.edge.curvature,
      },
    }];
  });

  return { nodes, edges };
}
