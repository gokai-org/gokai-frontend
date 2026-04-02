import type { Edge, Node } from "reactflow";
import type { Kanji, KanjiLessonResult } from "@/features/kanji";
import type {
  GraphicsProfile,
  GraphicsQualitySignals,
  GraphicsQualityTier,
} from "@/shared/hooks/useGraphicsProfile";

export const KANJI_COMPLETION_SCORE = 70;

export type KanjiBoardStatus = "completed" | "available" | "locked";
export type KanjiBoardQualityTier = GraphicsQualityTier;

export interface KanjiBoardProgress {
  id: string;
  index: number;
  kanji: Kanji;
  primaryMeaning: string;
  bestScore: number | null;
  attemptCount: number;
  status: KanjiBoardStatus;
  completionScore: number;
  progressPercent: number;
  bestResult: KanjiLessonResult | null;
}

export interface KanjiBoardSummary {
  totalCount: number;
  completedCount: number;
  availableCount: number;
  lockedCount: number;
  completionRate: number;
  averageScore: number;
  currentKanjiId: string | null;
  consecutiveCompletedCount: number;
}

export type KanjiBoardQualitySignals = GraphicsQualitySignals;

export interface KanjiBoardCameraProfile {
  overviewZoom: number;
  focusZoom: number;
  initialDuration: number;
  focusDuration: number;
  restoreDuration: number;
}

export interface KanjiBoardQualityProfile {
  tier: KanjiBoardQualityTier;
  signals: KanjiBoardQualitySignals;
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
  camera: KanjiBoardCameraProfile;
}

export interface KanjiBoardNodeData {
  progress: KanjiBoardProgress;
  selected: boolean;
  qualityTier: KanjiBoardQualityTier;
  glowScale: number;
  shadowScale: number;
  showOrbitRings: boolean;
  shouldUsePulse: boolean;
  unlocking?: boolean;
  shaking?: boolean;
}

export interface KanjiBoardEdgeData {
  status: KanjiBoardStatus;
  highlight: boolean;
  qualityTier: KanjiBoardQualityTier;
  widthScale: number;
  opacityScale: number;
  showLockedDash: boolean;
  unlocking?: boolean;
  /** @deprecated — passed but not consumed by KanjiBoardEdge; kept optional for forward compat */
  curvature?: number;
}

export type KanjiBoardNode = Node<KanjiBoardNodeData>;
export type KanjiBoardEdge = Edge<KanjiBoardEdgeData>;
