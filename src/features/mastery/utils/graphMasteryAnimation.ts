import type { CameraTourWaypoint } from "../types";
import type { Node } from "reactflow";

// ---------------------------------------------------------------------------
// Build waypoints from ReactFlow nodes for the camera tour.
// ---------------------------------------------------------------------------

const NODE_CENTER_X = 84;
const NODE_CENTER_Y = 78;

/**
 * Extracts ordered waypoints from a ReactFlow node list.
 * The tour will be played in reverse (last → first) by the orchestrator.
 */
export function buildCameraTourWaypoints(
  nodes: Node[],
  perNodeDwell: number,
): CameraTourWaypoint[] {
  return nodes.map((node) => {
    const width =
      typeof node.style?.width === "number"
        ? node.style.width
        : NODE_CENTER_X * 2;

    return {
      nodeId: node.id,
      x: node.position.x + width / 2,
      y: node.position.y + NODE_CENTER_Y,
      duration: perNodeDwell,
    };
  });
}

// ---------------------------------------------------------------------------
// Propagation index — determines which nodes/edges should be "golden"
// based on a 0–1 progress value (spreading from last to first).
// ---------------------------------------------------------------------------

/**
 * Given a propagation progress (0–1) and a total count, returns the
 * number of items from the END that should be golden.
 *
 * Example: progress=0.5, totalItems=10 → 5 items golden (indices 5–9).
 */
export function getGoldenCount(progress: number, totalItems: number): number {
  if (progress <= 0 || totalItems <= 0) return 0;
  if (progress >= 1) return totalItems;
  return Math.ceil(progress * totalItems);
}

/**
 * Returns true if a node at `index` (0-based, ordered first→last)
 * should display the golden mastery style given the current propagation.
 *
 * Propagation flows from the LAST node towards the FIRST.
 */
export function isNodeGolden(
  index: number,
  totalItems: number,
  propagationProgress: number,
): boolean {
  if (propagationProgress >= 1) return true;
  if (propagationProgress <= 0) return false;

  const goldenCount = getGoldenCount(propagationProgress, totalItems);
  return index >= totalItems - goldenCount;
}
