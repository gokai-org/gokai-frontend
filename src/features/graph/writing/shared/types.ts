import type { Edge, Node } from "reactflow";
import type {
  GraphicsProfile,
  GraphicsQualitySignals,
  GraphicsQualityTier,
} from "@/shared/hooks/useGraphicsProfile";

export const WRITING_COMPLETION_SCORE = 70;

export type WritingBoardStatus = "completed" | "available" | "locked";
export type WritingBoardQualityTier = GraphicsQualityTier;
export type WritingScriptType = "hiragana" | "katakana" | "kanji";

export interface WritingBoardProgress {
  id: string;
  index: number;
  symbol: string;
  romaji: string;
  unlockPoints: number;
  bestScore: number | null;
  attemptCount: number;
  status: WritingBoardStatus;
  completionScore: number;
  progressPercent: number;
}

export interface WritingBoardSummary {
  totalCount: number;
  completedCount: number;
  availableCount: number;
  lockedCount: number;
  completionRate: number;
  averageScore: number;
  currentItemId: string | null;
  consecutiveCompletedCount: number;
}

export type WritingBoardQualitySignals = GraphicsQualitySignals;

export interface WritingBoardCameraProfile {
  overviewZoom: number;
  focusZoom: number;
  initialDuration: number;
  focusDuration: number;
  restoreDuration: number;
}

export interface WritingBoardQualityProfile {
  tier: WritingBoardQualityTier;
  signals: WritingBoardQualitySignals;
  graphics: GraphicsProfile;
  allowMotion: boolean;
  allowHeavyMotion: boolean;
  background: {
    showGlimmer: boolean;
    showDust: boolean;
    showFarAtmosphere: boolean;
    showMidAtmosphere: boolean;
    showNearAtmosphere: boolean;
    showRing: boolean;
    animateTwinkle: boolean;
    animateBreathe: boolean;
    parallaxStrength: number;
    zoomStrength: number;
    overscanBase: number;
    overscanZoomFactor: number;
    interactionSmoothingMs: number;
    idleSmoothingMs: number;
    epsilonPosition: number;
    epsilonZoom: number;
  };
  node: {
    shouldUsePulse: boolean;
    showOrbitRings: boolean;
    glowScale: number;
    shadowScale: number;
  };
  edge: {
    widthScale: number;
    opacityScale: number;
    showLockedDash: boolean;
    curvature: number;
  };
  camera: WritingBoardCameraProfile;
}

export interface WritingBoardNodeData {
  progress: WritingBoardProgress;
  selected: boolean;
  scriptType: WritingScriptType;
  qualityTier: WritingBoardQualityTier;
  glowScale: number;
  shadowScale: number;
  showOrbitRings: boolean;
  shouldUsePulse: boolean;
  unlocking?: boolean;
  shaking?: boolean;
  drawerOpen?: boolean;
}

export interface WritingBoardEdgeData {
  status: WritingBoardStatus;
  highlight: boolean;
  scriptType: WritingScriptType;
  qualityTier: WritingBoardQualityTier;
  widthScale: number;
  opacityScale: number;
  showLockedDash: boolean;
  unlocking?: boolean;
  /** Required user points for the target node of this connection */
  requiredPoints?: number;
}

export type WritingBoardNode = Node<WritingBoardNodeData>;
export type WritingBoardEdge = Edge<WritingBoardEdgeData>;
