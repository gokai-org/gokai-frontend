/**
 * Stroke validation utilities for kana writing practice.
 *
 * Re-exports the generic stroke validation from kanji/lib since the
 * underlying math (SVG path sampling, DTW-lite, cosine similarity)
 * is identical for any character type.
 */

export {
  validateStroke,
  sampleSvgPath,
  simplifyStroke,
  getPointsForFeedback,
  getFeedbackLabel,
  getFeedbackColor,
} from "@/features/kanji/lib/strokeValidation";

export type {
  StrokeValidationResult,
  StrokePoint,
} from "@/features/kanji/lib/strokeValidation";
