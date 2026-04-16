import type {
  KanjiBoardEdge,
  KanjiBoardNode,
  KanjiBoardProgress,
  KanjiBoardQualityProfile,
  KanjiBoardStatus,
} from "../types";
import {
  buildDefaultTranslateExtent,
  buildGoPathPositions,
  buildNodeBounds,
  buildSequentialLayoutEdges,
  buildViewportTranslateExtent,
  type BoardLayoutEdge,
  type BoardPoint,
} from "../../shared/lib/boardLayoutCore";

const NODE_WIDTH = 168;
const NODE_HEIGHT = 196;
const SPHERE_CENTER_X = 84;
const SPHERE_CENTER_Y = 77;

type Point = BoardPoint;

type LayoutNode = {
  id: string;
  position: Point;
};

type LayoutEdge = BoardLayoutEdge;

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
  return buildViewportTranslateExtent(
    bounds,
    viewportWidth,
    viewportHeight,
    NODE_WIDTH,
    NODE_HEIGHT,
  );
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

export function buildKanjiBoardLayout(ids: string[]): KanjiBoardLayout {
  const positions = buildGoPathPositions(
    ids.length,
    SPHERE_CENTER_X,
    SPHERE_CENTER_Y,
  );
  const nodeBounds = buildNodeBounds(positions, NODE_WIDTH, NODE_HEIGHT);

  return {
    nodeBounds,
    nodes: ids.map((id, index) => ({
      id,
      position: positions[index] ?? { x: 0, y: 0 },
    })),
    edges: buildSequentialLayoutEdges(ids, positions),
    translateExtent: buildDefaultTranslateExtent(nodeBounds),
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

    const unlocking = newlyUnlockedIds?.has(layoutEdge.target) ?? false;

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
  suppressUnlockPointIds: ReadonlySet<string>,
  shakingNodeId: string | null,
  drawerOpen = false,
): { nodes: KanjiBoardNode[]; edges: KanjiBoardEdge[] } {
  const nodes = base.nodes.map((node) => {
    const selected = node.id === selectedId;
    const unlocking = newlyUnlockedIds.has(node.id);
    const suppressUnlockPoints = suppressUnlockPointIds.has(node.id);
    const shaking = node.id === shakingNodeId;
    const nodeDrawerOpen = selected && drawerOpen;

    if (
      node.data.selected === selected &&
      node.data.unlocking === unlocking &&
      node.data.suppressUnlockPoints === suppressUnlockPoints &&
      node.data.shaking === shaking &&
      node.data.drawerOpen === nodeDrawerOpen
    ) {
      return node; // stable ref — ReactFlow skips internal diff for this node
    }

    return {
      ...node,
      data: {
        ...node.data,
        selected,
        unlocking,
        suppressUnlockPoints,
        shaking,
        drawerOpen: nodeDrawerOpen,
      },
    };
  });

  const edges = base.edges.map((edge) => {
    const highlight = selectedId === edge.source || selectedId === edge.target;
    const unlocking = newlyUnlockedIds.has(edge.target);

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
