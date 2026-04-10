/**
 * Mastery progression system types.
 *
 * Each writing module (hiragana, katakana, kanji) progresses through
 * a defined set of states.  The mastery feature detects when a user
 * crosses the mastery threshold and triggers a celebration sequence.
 */

// ---------------------------------------------------------------------------
// Progression states
// ---------------------------------------------------------------------------

/** Ordered progression states for any module. */
export type MasteryState =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "mastered"
  | "celebrating_mastery";

// ---------------------------------------------------------------------------
// Module identifiers
// ---------------------------------------------------------------------------

/**
 * Modules that participate in the mastery system.
 * Easily extensible — add future modules here.
 */
export type MasteryModuleId = "hiragana" | "katakana" | "kanji";

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

/** Per-module configuration for mastery detection. */
export interface MasteryModuleConfig {
  /** Unique module identifier. */
  id: MasteryModuleId;
  /** Human-readable display label. */
  label: string;
  /** The user-points field to evaluate (from User model). */
  pointsField: "kanaPoints" | "points";
  /** Minimum points required to achieve mastery. */
  masteryThreshold: number;
  /** Color accent used for the golden celebration variant. */
  accentHue: number;
  /** Optional celebration subtitle override. */
  celebrationSubtitle?: string;
}

// ---------------------------------------------------------------------------
// Mastery detection result
// ---------------------------------------------------------------------------

/** Snapshot returned by the mastery detection hook. */
export interface MasterySnapshot {
  /** Current progression state for the module. */
  state: MasteryState;
  /** The user's current points for this module. */
  currentPoints: number;
  /** Points required to achieve mastery. */
  threshold: number;
  /** Completion ratio 0–1 (clamped). */
  progress: number;
  /** Whether the user has reached mastery (state >= mastered). */
  isMastered: boolean;
  /** Whether we just crossed the threshold this session. */
  isNewMastery: boolean;
  /** Persist that the celebration was shown. */
  markCelebrated: () => void;
}

// ---------------------------------------------------------------------------
// Celebration orchestrator state
// ---------------------------------------------------------------------------

/** Phases of the celebration sequence. */
export type CelebrationPhase =
  | "idle"
  | "cinematic_enter"
  | "golden_propagation"
  | "camera_tour"
  | "modal"
  | "cinematic_exit";

/** Full state exposed by the celebration orchestrator hook. */
export interface CelebrationState {
  /** Whether a celebration is currently running. */
  active: boolean;
  /** Current phase within the celebration sequence. */
  phase: CelebrationPhase;
  /** The module being celebrated. */
  moduleId: MasteryModuleId | null;
  /** Progress through the golden propagation (0–1). */
  propagationProgress: number;
  /** Index into the ordered node list during camera tour. */
  tourNodeIndex: number;
}

// ---------------------------------------------------------------------------
// Camera tour waypoint
// ---------------------------------------------------------------------------

export interface CameraTourWaypoint {
  nodeId: string;
  x: number;
  y: number;
  /** Duration in ms to travel to this waypoint. */
  duration: number;
}

// ---------------------------------------------------------------------------
// Celebration modal props
// ---------------------------------------------------------------------------

export interface CelebrationModalContent {
  moduleId: MasteryModuleId;
  title: string;
  subtitle: string;
  achievementLabel: string;
}
