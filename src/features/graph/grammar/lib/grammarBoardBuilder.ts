import type { Node, Edge } from "reactflow";
import type {
  GrammarBoardEdgeData,
  GrammarBoardNodeData,
  GrammarBoardProgress,
  GrammarBoardStatus,
} from "../types";

// ── Node dimensions (matching existing boards) ──────────
export const GRAMMAR_NODE_WIDTH = 168;
export const GRAMMAR_NODE_HEIGHT = 196;
export const GRAMMAR_NODE_CENTER_X = GRAMMAR_NODE_WIDTH / 2;
export const GRAMMAR_NODE_CENTER_Y = GRAMMAR_NODE_HEIGHT / 2;

export const GRAMMAR_BOARD_TOTAL = 25;

type Point = { x: number; y: number };

const CHERRY_TREE_LEVELS = [
  { y: 1640, xs: [0] },
  { y: 1390, xs: [0] },
  { y: 1160, xs: [-130, 130] },
  { y: 930, xs: [-300, 0, 300] },
  { y: 720, xs: [-470, -170, 170, 470] },
  { y: 520, xs: [-610, -320, 0, 320, 610] },
  { y: 330, xs: [-500, -220, 220, 500] },
  { y: 150, xs: [-350, 0, 350] },
  { y: -10, xs: [-150, 150] },
] as const;

function buildCherryTreeCenters(): Point[] {
  const centers: Point[] = [];

  for (const level of CHERRY_TREE_LEVELS) {
    for (const x of level.xs) {
      centers.push({ x, y: level.y });
    }
  }

  return centers;
}

const CHERRY_TREE_CENTERS = buildCherryTreeCenters();

// ── Public layout builder ────────────────────────────────

export type GrammarBoardLayout = {
  nodes: { id: string; position: Point }[];
  edges: { id: string; source: string; target: string; sourceHandle: string; targetHandle: string }[];
  nodeBounds: { minX: number; maxX: number; minY: number; maxY: number };
  translateExtent: [[number, number], [number, number]];
};

function connectLevels(
  previousLevel: readonly number[],
  currentLevel: readonly number[],
) {
  return currentLevel.map((childX, childIndex) => {
    let bestParentIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let parentIndex = 0; parentIndex < previousLevel.length; parentIndex++) {
      const parentX = previousLevel[parentIndex];
      const distance = Math.abs(childX - parentX);

      if (
        distance < bestDistance ||
        (distance === bestDistance && parentIndex < bestParentIndex)
      ) {
        bestDistance = distance;
        bestParentIndex = parentIndex;
      }
    }

    return {
      childIndex,
      parentIndex: bestParentIndex,
    };
  });
}

export function buildGrammarBoardLayout(ids: string[]): GrammarBoardLayout {
  const count = Math.min(ids.length, GRAMMAR_BOARD_TOTAL);
  const positions = CHERRY_TREE_CENTERS.slice(0, count).map((c) => ({
    x: c.x - GRAMMAR_NODE_WIDTH / 2,
    y: c.y - GRAMMAR_NODE_HEIGHT / 2,
  }));

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of positions) {
    if (p.x < minX) minX = p.x;
    if (p.x + GRAMMAR_NODE_WIDTH > maxX) maxX = p.x + GRAMMAR_NODE_WIDTH;
    if (p.y < minY) minY = p.y;
    if (p.y + GRAMMAR_NODE_HEIGHT > maxY) maxY = p.y + GRAMMAR_NODE_HEIGHT;
  }

  const layoutNodes = ids.slice(0, count).map((id, i) => ({
    id,
    position: positions[i] ?? { x: 0, y: 0 },
  }));

  const layoutEdges: GrammarBoardLayout["edges"] = [];
  let previousLevelStart = 0;

  for (let levelIndex = 1; levelIndex < CHERRY_TREE_LEVELS.length; levelIndex++) {
    const previousLevel = CHERRY_TREE_LEVELS[levelIndex - 1].xs;
    const currentLevel = CHERRY_TREE_LEVELS[levelIndex].xs;
    const previousCount = previousLevel.length;
    const currentLevelStart = previousLevelStart + previousCount;
    const connections = connectLevels(previousLevel, currentLevel);

    for (const connection of connections) {
      const sourceIndex = previousLevelStart + connection.parentIndex;
      const targetIndex = currentLevelStart + connection.childIndex;

      if (sourceIndex >= count || targetIndex >= count) {
        continue;
      }

      const sourceId = ids[sourceIndex];
      const targetId = ids[targetIndex];
      if (!sourceId || !targetId) {
        continue;
      }

      layoutEdges.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        sourceHandle: "source-center",
        targetHandle: "target-center",
      });
    }

    previousLevelStart = currentLevelStart;
  }

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    nodeBounds: { minX, maxX, minY, maxY },
    translateExtent: [
      [minX - 380, minY - 280],
      [maxX + 380, maxY + 280],
    ],
  };
}

// ── Node/edge status helpers ─────────────────────────────

function getEdgeStatus(
  source: GrammarBoardProgress,
  target: GrammarBoardProgress,
): GrammarBoardStatus {
  if (source.status === "completed" && target.status === "completed") return "completed";
  if (target.status !== "locked") return "available";
  return "locked";
}

const NODE_STYLE = {
  width: GRAMMAR_NODE_WIDTH,
  height: GRAMMAR_NODE_HEIGHT,
  background: "transparent",
  border: "none",
};

export function createGrammarBoardGraph(
  items: GrammarBoardProgress[],
  layout: GrammarBoardLayout,
  selectedId: string | null,
  drawerOpen: boolean,
): { nodes: Node<GrammarBoardNodeData>[]; edges: Edge<GrammarBoardEdgeData>[] } {
  const itemsById = new Map(items.map((it) => [it.id, it]));

  const nodes: Node<GrammarBoardNodeData>[] = layout.nodes.flatMap((ln) => {
    const progress = itemsById.get(ln.id);
    if (!progress) return [];
    return [{
      id: progress.id,
      type: "grammar-node",
      position: ln.position,
      data: {
        progress,
        selected: progress.id === selectedId,
        glowScale: 1,
        shadowScale: 1,
        showOrbitRings: true,
        shouldUsePulse: true,
        drawerOpen: progress.id === selectedId && drawerOpen,
      },
      draggable: false,
      style: NODE_STYLE,
    }];
  });

  const edges: Edge<GrammarBoardEdgeData>[] = layout.edges.flatMap((le) => {
    const src = itemsById.get(le.source);
    const tgt = itemsById.get(le.target);
    if (!src || !tgt) return [];
    return [{
      id: le.id,
      source: le.source,
      target: le.target,
      sourceHandle: le.sourceHandle,
      targetHandle: le.targetHandle,
      type: "grammar-edge",
      data: { status: getEdgeStatus(src, tgt), widthScale: 1, opacityScale: 1 },
    }];
  });

  return { nodes, edges };
}

/** Returns the id of the last non-locked item (first focus target). */
export function getFirstFocusId(items: GrammarBoardProgress[]): string | null {
  return items.find((it) => it.status === "available")?.id ?? items[0]?.id ?? null;
}
