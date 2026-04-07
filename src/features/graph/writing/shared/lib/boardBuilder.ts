import type {
  WritingBoardEdge,
  WritingBoardNode,
  WritingBoardProgress,
  WritingBoardQualityProfile,
  WritingBoardStatus,
  WritingScriptType,
} from "../types";

const NODE_WIDTH = 168;
const NODE_HEIGHT = 196;
const SPHERE_CENTER_X = 84;
const SPHERE_CENTER_Y = 77;
const GRID_PITCH = 160;

const HOSHI_STEP = 3;
const BOARD_ORIGIN_H = 2;
const BOARD_ORIGIN_V = 2;

type Point = { x: number; y: number };

type LayoutNode = { id: string; position: Point };

type LayoutEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

export type WritingBoardLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  nodeBounds: { minX: number; maxX: number; minY: number; maxY: number };
  translateExtent: [[number, number], [number, number]];
};

export function buildTranslateExtent(
  bounds: WritingBoardLayout["nodeBounds"],
  viewportWidth: number,
  viewportHeight: number,
): [[number, number], [number, number]] {
  const padX = Math.max(viewportWidth * 0.25, NODE_WIDTH);
  const padY = Math.max(viewportHeight * 0.22, NODE_HEIGHT);
  return [
    [bounds.minX - padX, bounds.minY - padY],
    [bounds.maxX + padX, bounds.maxY + padY],
  ];
}

function getBoardCols(count: number): number {
  if (count <= 8) return 3;
  if (count <= 20) return 4;
  if (count <= 35) return 5;
  if (count <= 54) return 6;
  if (count <= 77) return 7;
  return 8;
}

function buildGoPathPositions(count: number): Point[] {
  if (count === 0) return [];

  const cols = getBoardCols(count);

  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols);
    const colInRow = i % cols;
    const snakeCol = row % 2 === 0 ? colInRow : cols - 1 - colInRow;

    const gx = (BOARD_ORIGIN_H + snakeCol) * HOSHI_STEP;
    const gy = (BOARD_ORIGIN_V + row) * HOSHI_STEP;

    return {
      x: gx * GRID_PITCH - SPHERE_CENTER_X,
      y: gy * GRID_PITCH - SPHERE_CENTER_Y,
    };
  });
}

function getHandles(source: Point, target: Point) {
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
  source: WritingBoardProgress,
  target: WritingBoardProgress,
): WritingBoardStatus {
  if (source.status === "completed" && target.status === "completed")
    return "completed";
  if (target.status === "available") return "available";
  return "locked";
}

function createSequentialLayoutEdges(ids: string[], positions: Point[]) {
  return ids.slice(0, -1).map((currentId, index) => {
    const nextId = ids[index + 1];
    const { sourceHandle, targetHandle } = getHandles(
      positions[index],
      positions[index + 1],
    );
    return {
      id: `${currentId}-${nextId}`,
      source: currentId,
      target: nextId,
      sourceHandle,
      targetHandle,
    };
  });
}

export function buildWritingBoardLayout(ids: string[]): WritingBoardLayout {
  const positions = buildGoPathPositions(ids.length);

  let minX = 0,
    maxX = NODE_WIDTH,
    minY = 0,
    maxY = NODE_HEIGHT;
  if (positions.length > 0) {
    minX = Infinity;
    maxX = -Infinity;
    minY = Infinity;
    maxY = -Infinity;
    for (const p of positions) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    maxX += NODE_WIDTH;
    maxY += NODE_HEIGHT;
  }

  return {
    nodeBounds: { minX, maxX, minY, maxY },
    nodes: ids.map((id, index) => ({
      id,
      position: positions[index] ?? { x: 0, y: 0 },
    })),
    edges: createSequentialLayoutEdges(ids, positions),
    translateExtent: [
      [minX - 380, minY - 280],
      [maxX + 380, maxY + 280],
    ],
  };
}

const NODE_STYLE = {
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
  background: "transparent",
  border: "none",
};

export function createBaseWritingBoardGraph(
  items: WritingBoardProgress[],
  layout: WritingBoardLayout,
  qualityProfile: WritingBoardQualityProfile,
  scriptType: WritingScriptType,
): { nodes: WritingBoardNode[]; edges: WritingBoardEdge[] } {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  const nodes: WritingBoardNode[] = layout.nodes.flatMap((layoutNode) => {
    const progress = itemsById.get(layoutNode.id);
    if (!progress) return [];

    return [
      {
        id: progress.id,
        type: "writing-node",
        position: layoutNode.position,
        data: {
          progress,
          selected: false,
          scriptType,
          qualityTier: qualityProfile.tier,
          glowScale: qualityProfile.node.glowScale,
          shadowScale: qualityProfile.node.shadowScale,
          showOrbitRings: qualityProfile.node.showOrbitRings,
          shouldUsePulse: qualityProfile.node.shouldUsePulse,
          unlocking: false,
          shaking: false,
        },
        draggable: false,
        style: NODE_STYLE,
      },
    ];
  });

  const edges: WritingBoardEdge[] = layout.edges.flatMap((layoutEdge) => {
    const source = itemsById.get(layoutEdge.source);
    const target = itemsById.get(layoutEdge.target);
    if (!source || !target) return [];

    return [
      {
        id: layoutEdge.id,
        source: layoutEdge.source,
        target: layoutEdge.target,
        type: "writing-edge",
        sourceHandle: layoutEdge.sourceHandle,
        targetHandle: layoutEdge.targetHandle,
        data: {
          status: getEdgeStatus(source, target),
          highlight: false,
          scriptType,
          qualityTier: qualityProfile.tier,
          widthScale: qualityProfile.edge.widthScale,
          opacityScale: qualityProfile.edge.opacityScale,
          showLockedDash: qualityProfile.edge.showLockedDash,
          unlocking: false,
          requiredPoints: target.unlockPoints,
        },
      },
    ];
  });

  return { nodes, edges };
}

export function applyWritingBoardUIState(
  base: { nodes: WritingBoardNode[]; edges: WritingBoardEdge[] },
  selectedId: string | null,
  newlyUnlockedIds: ReadonlySet<string>,
  shakingNodeId: string | null,
): { nodes: WritingBoardNode[]; edges: WritingBoardEdge[] } {
  const nodes = base.nodes.map((node) => {
    const selected = node.id === selectedId;
    const unlocking = newlyUnlockedIds.has(node.id);
    const shaking = node.id === shakingNodeId;

    if (
      node.data.selected === selected &&
      node.data.unlocking === unlocking &&
      node.data.shaking === shaking
    ) {
      return node;
    }

    return { ...node, data: { ...node.data, selected, unlocking, shaking } };
  });

  const edges = base.edges.map((edge) => {
    const highlight = selectedId === edge.source || selectedId === edge.target;
    const unlocking =
      newlyUnlockedIds.has(edge.source) || newlyUnlockedIds.has(edge.target);

    if (
      edge.data?.highlight === highlight &&
      edge.data?.unlocking === unlocking
    ) {
      return edge;
    }

    return { ...edge, data: { ...edge.data!, highlight, unlocking } };
  });

  return { nodes, edges };
}
