import type { MasteryModuleConfig, MasteryModuleId } from "../types";

// ---------------------------------------------------------------------------
// Mastery point thresholds
// ---------------------------------------------------------------------------

export const MASTERY_THRESHOLDS: Record<MasteryModuleId, number> = {
  hiragana: 355,
  katakana: 710,
  kanji: 4505,
} as const;

// ---------------------------------------------------------------------------
// Per-module configuration
// ---------------------------------------------------------------------------

export const MASTERY_MODULE_CONFIGS: Record<MasteryModuleId, MasteryModuleConfig> = {
  hiragana: {
    id: "hiragana",
    label: "Hiragana",
    pointsField: "kanaPoints",
    masteryThreshold: MASTERY_THRESHOLDS.hiragana,
    accentHue: 275,
    celebrationSubtitle: "Dominas el silabario base del japones",
  },
  katakana: {
    id: "katakana",
    label: "Katakana",
    pointsField: "kanaPoints",
    masteryThreshold: MASTERY_THRESHOLDS.katakana,
    accentHue: 210,
    celebrationSubtitle: "El segundo silabario no tiene secretos para ti",
  },
  kanji: {
    id: "kanji",
    label: "Kanji",
    pointsField: "points",
    masteryThreshold: MASTERY_THRESHOLDS.kanji,
    accentHue: 0,
    celebrationSubtitle: "Los kanji se rinden ante tu dedicacion",
  },
} as const;

// ---------------------------------------------------------------------------
// Module list (ordered for iteration)
// ---------------------------------------------------------------------------

export const MASTERY_MODULES: readonly MasteryModuleId[] = [
  "hiragana",
  "katakana",
  "kanji",
] as const;

// ---------------------------------------------------------------------------
// Celebration sequence timing (ms)
// ---------------------------------------------------------------------------

/** Duration of the initial cinematic fade-in / focus. */
export const CINEMATIC_ENTER_DURATION = 800;

/** Duration of the golden color propagation across the board. */
export const GOLDEN_PROPAGATION_DURATION = 2400;

/** Per-node dwell time during the camera tour. */
export const CAMERA_TOUR_NODE_DWELL = 180;

/** Minimum camera tour duration (ensures it doesn't feel rushed). */
export const CAMERA_TOUR_MIN_DURATION = 2000;

/** Maximum camera tour duration (cap for boards with many nodes). */
export const CAMERA_TOUR_MAX_DURATION = 5000;

/** Duration the celebration modal stays visible before user can dismiss. */
export const MODAL_MIN_DISPLAY = 600;

/** Duration of the cinematic exit / fade-out. */
export const CINEMATIC_EXIT_DURATION = 600;

// ---------------------------------------------------------------------------
// LocalStorage key prefix for mastery celebration tracking
// ---------------------------------------------------------------------------

export const MASTERY_CELEBRATED_KEY_PREFIX = "gokai-mastery-celebrated-";

/** Returns the localStorage key for tracking whether a module's mastery was celebrated. */
export function getMasteryCelebratedKey(moduleId: MasteryModuleId): string {
  return `${MASTERY_CELEBRATED_KEY_PREFIX}${moduleId}`;
}
