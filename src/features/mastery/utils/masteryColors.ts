import type { MasteryModuleId } from "../types";

// ---------------------------------------------------------------------------
// Golden mastery color palette
// ---------------------------------------------------------------------------

/**
 * Color tokens for the mastery golden theme.
 * These replace the module's normal accent (purple / blue / red) during
 * the celebration sequence and remain active for mastered modules.
 */
export const MASTERY_GOLD = {
  /** Primary golden accent. */
  primary: "#D4A843",
  /** Lighter highlight. */
  highlight: "#F0D27A",
  /** Deep shadow / border. */
  shadow: "#9B7B2F",
  /** Subtle glow for nodes. */
  glow: "rgba(212, 168, 67, 0.45)",
  /** Strong glow for celebration burst. */
  glowStrong: "rgba(212, 168, 67, 0.72)",
  /** Background-level warm tone. */
  backdrop: "rgba(212, 168, 67, 0.06)",
  /** Edge stroke in golden state. */
  edgeStroke: "#C89E3C",
  /** Edge stroke available variant. */
  edgeAvailable: "#B88D34",
  /** Gradient start (lighter). */
  gradientFrom: "#F0D27A",
  /** Gradient end (deeper). */
  gradientTo: "#B8922E",
} as const;

// ---------------------------------------------------------------------------
// Per-module celebration accent override
// ---------------------------------------------------------------------------

/**
 * Optional per-module tint applied on top of the base gold palette
 * to give each module a unique warm flavor while staying in the golden family.
 */
export const MODULE_CELEBRATION_TINTS: Record<
  MasteryModuleId,
  { hueRotate: number; saturate: number }
> = {
  hiragana: { hueRotate: 0, saturate: 1.0 },
  katakana: { hueRotate: -8, saturate: 1.05 },
  kanji: { hueRotate: 5, saturate: 1.1 },
};

// ---------------------------------------------------------------------------
// CSS custom property keys (injected by MasteryThemeProvider)
// ---------------------------------------------------------------------------

export const MASTERY_CSS_VARS = {
  primary: "--mastery-gold-primary",
  highlight: "--mastery-gold-highlight",
  shadow: "--mastery-gold-shadow",
  glow: "--mastery-gold-glow",
  glowStrong: "--mastery-gold-glow-strong",
  backdrop: "--mastery-gold-backdrop",
  edgeStroke: "--mastery-gold-edge-stroke",
  gradientFrom: "--mastery-gold-gradient-from",
  gradientTo: "--mastery-gold-gradient-to",
  /** 0 = normal theme, 1 = fully golden. Drives interpolation in CSS. */
  mixRatio: "--mastery-mix-ratio",
} as const;
