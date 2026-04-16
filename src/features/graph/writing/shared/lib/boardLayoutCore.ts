export type BoardPoint = {
  x: number;
  y: number;
};

export type BoardLayoutEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

export type BoardNodeBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const GRID_PITCH = 160;
const HOSHI_STEP = 3;
const BOARD_ORIGIN_H = 2;
const BOARD_ORIGIN_V = 2;

function getBoardCols(count: number): number {
  if (count <= 8) return 3;
  if (count <= 20) return 4;
  if (count <= 35) return 5;
  if (count <= 54) return 6;
  if (count <= 77) return 7;
  return 8;
}

function getHandles(source: BoardPoint, target: BoardPoint) {
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

export function buildGoPathPositions(
  count: number,
  centerX: number,
  centerY: number,
): BoardPoint[] {
  if (count === 0) return [];

  const cols = getBoardCols(count);

  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / cols);
    const colInRow = index % cols;
    const snakeCol = row % 2 === 0 ? colInRow : cols - 1 - colInRow;

    const gx = (BOARD_ORIGIN_H + snakeCol) * HOSHI_STEP;
    const gy = (BOARD_ORIGIN_V + row) * HOSHI_STEP;

    return {
      x: gx * GRID_PITCH - centerX,
      y: gy * GRID_PITCH - centerY,
    };
  });
}

export function buildSequentialLayoutEdges(
  ids: readonly string[],
  positions: readonly BoardPoint[],
): BoardLayoutEdge[] {
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

export function buildNodeBounds(
  positions: readonly BoardPoint[],
  nodeWidth: number,
  nodeHeight: number,
): BoardNodeBounds {
  if (positions.length === 0) {
    return {
      minX: 0,
      maxX: nodeWidth,
      minY: 0,
      maxY: nodeHeight,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const position of positions) {
    if (position.x < minX) minX = position.x;
    if (position.y < minY) minY = position.y;
    if (position.x > maxX) maxX = position.x;
    if (position.y > maxY) maxY = position.y;
  }

  return {
    minX,
    maxX: maxX + nodeWidth,
    minY,
    maxY: maxY + nodeHeight,
  };
}

export function buildDefaultTranslateExtent(bounds: BoardNodeBounds) {
  return [
    [bounds.minX - 380, bounds.minY - 280],
    [bounds.maxX + 380, bounds.maxY + 280],
  ] as [[number, number], [number, number]];
}

export function buildViewportTranslateExtent(
  bounds: BoardNodeBounds,
  viewportWidth: number,
  viewportHeight: number,
  nodeWidth: number,
  nodeHeight: number,
) {
  const padX = Math.max(viewportWidth * 0.25, nodeWidth);
  const padY = Math.max(viewportHeight * 0.22, nodeHeight);

  return [
    [bounds.minX - padX, bounds.minY - padY],
    [bounds.maxX + padX, bounds.maxY + padY],
  ] as [[number, number], [number, number]];
}