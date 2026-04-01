import type { Edge, Node } from "reactflow";
import type { Kanji, KanjiLessonResult } from "@/features/kanji";
import type {
  GraphicsProfile,
  GraphicsQualitySignals,
  GraphicsQualityTier,
} from "@/shared/hooks/useGraphicsProfile";

export const KANJI_COMPLETION_SCORE = 70;

export type KanjiConstellationStatus = "completed" | "available" | "locked";
export type KanjiConstellationQualityTier = GraphicsQualityTier;

export interface KanjiConstellationProgress {
  id: string;
  index: number;
  kanji: Kanji;
  primaryMeaning: string;
  bestScore: number | null;
  attemptCount: number;
  status: KanjiConstellationStatus;
  completionScore: number;
  progressPercent: number;
  bestResult: KanjiLessonResult | null;
}

export interface KanjiConstellationSummary {
  totalCount: number;
  completedCount: number;
  availableCount: number;
  lockedCount: number;
  completionRate: number;
  averageScore: number;
  currentKanjiId: string | null;
  consecutiveCompletedCount: number;
}

export type KanjiConstellationQualitySignals = GraphicsQualitySignals;

export interface KanjiConstellationCameraProfile {
  overviewZoom: number;
  focusZoom: number;
  initialDuration: number;
  focusDuration: number;
  restoreDuration: number;
}

export interface KanjiConstellationQualityProfile {
  tier: KanjiConstellationQualityTier;
  signals: KanjiConstellationQualitySignals;
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
  camera: KanjiConstellationCameraProfile;
}

export interface KanjiConstellationNodeData {
  progress: KanjiConstellationProgress;
  selected: boolean;
  qualityTier: KanjiConstellationQualityTier;
  glowScale: number;
  shadowScale: number;
  showOrbitRings: boolean;
  shouldUsePulse: boolean;
}

export interface KanjiConstellationEdgeData {
  status: KanjiConstellationStatus;
  highlight: boolean;
  qualityTier: KanjiConstellationQualityTier;
  widthScale: number;
  opacityScale: number;
  showLockedDash: boolean;
  curvature: number;
}

export type KanjiConstellationNode = Node<KanjiConstellationNodeData>;
export type KanjiConstellationEdge = Edge<KanjiConstellationEdgeData>;
