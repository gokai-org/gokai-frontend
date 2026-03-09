export type { Kana, KanaType, KanaStrokeData, KanaExerciseType, KanaExerciseAnswer } from "./types";
export { getKanaLabel } from "./utils/kanaText";
export {
  listKana,
  getKana,
  getKanaStrokes,
  listHiraganas,
  listKatakanas,
  submitKanaExerciseAnswer,
} from "./api/kanaApi";

// Stroke validation (re-exported from shared logic)
export {
  validateStroke,
  sampleSvgPath,
  simplifyStroke,
  getPointsForFeedback,
  getFeedbackLabel,
  getFeedbackColor,
} from "./lib/strokeValidation";
export type { StrokeValidationResult, StrokePoint } from "./lib/strokeValidation";

// Mock data
export { getMockKanaStrokes, hasMockKanaStrokes, getMockKanaSymbols } from "./mock/mockStrokeData";

// Components
export { KanaDetailModal } from "./components/KanaDetailModal";
export { KanaStrokePlayer } from "./components/KanaStrokePlayer";
export { KanaWritingCanvas } from "./components/KanaWritingCanvas";
export { KanaWritingPracticeModal } from "./components/KanaWritingPracticeModal";
