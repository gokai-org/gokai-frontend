export type GrammarBoardStatus = "completed" | "available" | "locked";
export type GrammarBoardVisualState = GrammarBoardStatus | "active";
export type GrammarBoardCellSize = "standard" | "corner" | "goal";
export type GrammarBoardRouteTier = "outer" | "inner" | "goal";

export interface GrammarBoardProgress {
  id: string;
  index: number;
  symbol: string;
  title: string;
  pointsToUnlock: number;
  status: GrammarBoardStatus;
  isMock: boolean;
  isCurrent?: boolean;
}

export interface GrammarBoardSlot {
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  size: GrammarBoardCellSize;
  routeTier: GrammarBoardRouteTier;
  curveDirection?: -1 | 0 | 1;
}

export interface GrammarBoardCellLayout extends GrammarBoardSlot {
  id: string;
}

export interface GrammarBoardPoint {
  x: number;
  y: number;
}

export interface GrammarBoardPathSegment {
  id: string;
  fromId: string;
  toId: string;
  from: GrammarBoardPoint;
  to: GrammarBoardPoint;
  status: GrammarBoardStatus;
  curveDirection: -1 | 0 | 1;
  routeTier: GrammarBoardRouteTier;
}

export interface GrammarBoardCellViewModel {
  progress: GrammarBoardProgress;
  layout: GrammarBoardCellLayout;
  visualState: GrammarBoardVisualState;
  interactive: boolean;
}

export interface GrammarBoardStats {
  total: number;
  completed: number;
  available: number;
  locked: number;
}

export interface GrammarBoardViewModel {
  cells: GrammarBoardCellViewModel[];
  path: GrammarBoardPathSegment[];
  activeId: string | null;
  stats: GrammarBoardStats;
  canvas: {
    width: number;
    height: number;
  };
}