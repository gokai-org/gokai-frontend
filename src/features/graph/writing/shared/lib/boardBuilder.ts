import type {
  WritingBoardEdge,
  WritingBoardNode,
  WritingBoardProgress,
  WritingBoardQualityProfile,
  WritingBoardStatus,
  WritingScriptType,
} from "../types";
import {
  buildDefaultTranslateExtent,
  buildGoPathPositions,
  buildNodeBounds,
  buildSequentialLayoutEdges,
  buildViewportTranslateExtent,
  type BoardLayoutEdge,
  type BoardPoint,
} from "./boardLayoutCore";

const NODE_WIDTH = 168;
const NODE_HEIGHT = 196;
const SPHERE_CENTER_X = 84;
const SPHERE_CENTER_Y = 77;

type Point = BoardPoint;

type LayoutNode = { id: string; position: Point };
type LayoutEdge = BoardLayoutEdge;

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
  return buildViewportTranslateExtent(
    bounds,
    viewportWidth,
    viewportHeight,
    NODE_WIDTH,
    NODE_HEIGHT,
  );
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

export function buildWritingBoardLayout(ids: string[]): WritingBoardLayout {
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
  suppressUnlockPointIds: ReadonlySet<string>,
  shakingNodeId: string | null,
  drawerOpen = false,
): { nodes: WritingBoardNode[]; edges: WritingBoardEdge[] } {
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
      return node;
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
      return edge;
    }

    return { ...edge, data: { ...edge.data!, highlight, unlocking } };
  });

  return { nodes, edges };
}
