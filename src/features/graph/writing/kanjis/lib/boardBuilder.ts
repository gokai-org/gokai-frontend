import type {
  KanjiBoardEdge,
  KanjiBoardNode,
  KanjiBoardProgress,
  KanjiBoardQualityProfile,
  KanjiBoardStatus,
} from "../types";

const NODE_WIDTH = 168;
const NODE_HEIGHT = 196;
const SPHERE_CENTER_X = 84;
const SPHERE_CENTER_Y = 77;
const GRID_PITCH = 160;

// ── Board layout ─────────────────────────────────────────────────────────
const HOSHI_STEP = 3;
const BOARD_ORIGIN_H = 2;
const BOARD_ORIGIN_V = 2;

type Point = {
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

export type KanjiBoardLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  nodeBounds: { minX: number; maxX: number; minY: number; maxY: number };
  translateExtent: [[number, number], [number, number]];
};

export function buildTranslateExtent(
  bounds: KanjiBoardLayout["nodeBounds"],
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

/**
 * Returns the number of snake columns for the given node count.
 */
function getBoardCols(count: number): number {
  if (count <= 8) return 3;
  if (count <= 20) return 4;
  if (count <= 35) return 5;
  if (count <= 54) return 6;
  if (count <= 77) return 7;
  return 8;
}

/**
 * ── Go Board Path ──────────────────────────────────────────────────────────
 *
 * Generates one world-space position per node.  Every sphere center lands
 * exactly on a background star-point (hoshi) dot by constraining grid coords
 * to multiples of HOSHI_STEP:
 *
 *   gx = (BOARD_ORIGIN_H + snakeCol) × HOSHI_STEP
 *   gy = (BOARD_ORIGIN_V + row)       × HOSHI_STEP
 *
 * Pixel position of sphere center:
 *   cx = gx × GRID_PITCH = (BOARD_ORIGIN_H + snakeCol) × 480
 *   cy = gy × GRID_PITCH = (BOARD_ORIGIN_V + row)       × 480
 *
 * Spacing between adjacent sphere centers:
 *   Horizontal: 1 hoshi unit = 480 px  →  312 px gap between bounding boxes
 *   Vertical:   1 hoshi unit = 480 px  →  284 px gap between bounding boxes
 *
 * Path shape:  boustrophedon — even rows scan L→R, odd rows scan R→L.
 * Complexity:  O(n) — no collision detection, no relaxation, no random offsets.
 */
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

function getHandles(
  source: { x: number; y: number },
  target: { x: number; y: number },
) {
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
  source: KanjiBoardProgress,
  target: KanjiBoardProgress,
): KanjiBoardStatus {
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
  const { sourceHandle, targetHandle } = getHandles(
    sourcePosition,
    targetPosition,
  );

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

export function buildKanjiBoardLayout(ids: string[]): KanjiBoardLayout {
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

// Stable module-level constant — same reference across all createKanjiBoardGraph calls,
// preventing React Flow from flagging style changes when nothing actually changed.
const NODE_STYLE = {
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
  background: "transparent",
  border: "none",
};

export function createKanjiBoardGraph(
  items: KanjiBoardProgress[],
  layout: KanjiBoardLayout,
  selectedId: string | null,
  qualityProfile: KanjiBoardQualityProfile,
  newlyUnlockedIds?: ReadonlySet<string>,
  shakingNodeId?: string | null,
): { nodes: KanjiBoardNode[]; edges: KanjiBoardEdge[] } {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  const nodes: KanjiBoardNode[] = layout.nodes.flatMap((layoutNode) => {
    const progress = itemsById.get(layoutNode.id);
    if (!progress) return [];

    return [
      {
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
          unlocking: newlyUnlockedIds?.has(progress.id) ?? false,
          shaking: progress.id === shakingNodeId,
        },
        draggable: false,
        style: NODE_STYLE,
      },
    ];
  });

  const edges: KanjiBoardEdge[] = layout.edges.flatMap((layoutEdge) => {
    const source = itemsById.get(layoutEdge.source);
    const target = itemsById.get(layoutEdge.target);
    if (!source || !target) return [];

    const unlocking =
      (newlyUnlockedIds?.has(layoutEdge.source) ?? false) ||
      (newlyUnlockedIds?.has(layoutEdge.target) ?? false);

    return [
      {
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
          unlocking,
          requiredPoints: target.kanji.pointsToUnlock,
        },
      },
    ];
  });

  return { nodes, edges };
}

// ── Optimized two-phase graph building ───────────────────────────────────────
//
// Using createKanjiBoardGraph for every interaction (e.g. clicking a node)
// rebuilds ALL node and edge objects, giving ReactFlow new array references
// even for nodes that didn't change.  The split below separates stable
// structure from transient UI state so selection/shaking/unlocking only do
// a fast O(n) ref-identity patch.

/**
 * Phase 1 — structural graph.
 * Builds nodes + edges from items+layout+quality WITHOUT any transient UI
 * state (selected, unlocking, shaking).  Stable across user interactions;
 * only rebuilds when items, layout, or quality params change.
 */
export function createBaseKanjiBoardGraph(
  items: KanjiBoardProgress[],
  layout: KanjiBoardLayout,
  qualityProfile: KanjiBoardQualityProfile,
): { nodes: KanjiBoardNode[]; edges: KanjiBoardEdge[] } {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  const nodes: KanjiBoardNode[] = layout.nodes.flatMap((layoutNode) => {
    const progress = itemsById.get(layoutNode.id);
    if (!progress) return [];

    return [
      {
        id: progress.id,
        type: "kanji-planet",
        position: layoutNode.position,
        data: {
          progress,
          selected: false,
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

  const edges: KanjiBoardEdge[] = layout.edges.flatMap((layoutEdge) => {
    const source = itemsById.get(layoutEdge.source);
    const target = itemsById.get(layoutEdge.target);
    if (!source || !target) return [];

    return [
      {
        id: layoutEdge.id,
        source: layoutEdge.source,
        target: layoutEdge.target,
        type: "kanji-constellation",
        sourceHandle: layoutEdge.sourceHandle,
        targetHandle: layoutEdge.targetHandle,
        data: {
          status: getEdgeStatus(source, target),
          highlight: false,
          qualityTier: qualityProfile.tier,
          widthScale: qualityProfile.edge.widthScale,
          opacityScale: qualityProfile.edge.opacityScale,
          showLockedDash: qualityProfile.edge.showLockedDash,
          unlocking: false,
          requiredPoints: target.kanji.pointsToUnlock,
        },
      },
    ];
  });

  return { nodes, edges };
}

/**
 * Phase 2 — UI state patch.
 * Injects selectedId / newlyUnlockedIds / shakingNodeId onto a base graph.
 * Only nodes/edges that actually changed get new object references, so
 * React Flow's internal memo comparator skips unchanged nodes entirely.
 */
export function applyBoardUIState(
  base: { nodes: KanjiBoardNode[]; edges: KanjiBoardEdge[] },
  selectedId: string | null,
  newlyUnlockedIds: ReadonlySet<string>,
  shakingNodeId: string | null,
): { nodes: KanjiBoardNode[]; edges: KanjiBoardEdge[] } {
  const nodes = base.nodes.map((node) => {
    const selected = node.id === selectedId;
    const unlocking = newlyUnlockedIds.has(node.id);
    const shaking = node.id === shakingNodeId;

    if (
      node.data.selected === selected &&
      node.data.unlocking === unlocking &&
      node.data.shaking === shaking
    ) {
      return node; // stable ref — ReactFlow skips internal diff for this node
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
      return edge; // stable ref
    }

    return { ...edge, data: { ...edge.data!, highlight, unlocking } };
  });

  return { nodes, edges };
}
