export type {
  Kana,
  KanaExamResponse,
  KanaType,
  KanaStrokeData,
  KanaExerciseType,
  KanaExerciseAnswer,
  KanaListItemResponse,
  KanaListResponse,
  SaveKanaQuizResponseRequest,
  UserKanaProgressDetailedResponse,
} from "./types";
export type {
  KanaQuestionType,
  KanaQuizType,
  KanaQuizSessionType,
  KanaQuizOption,
  KanaQuizQuestionItem,
  KanaQuizResponse,
  KanaQuizSubmitBody,
  KanaQuizSessionState,
  KanaQuizStep,
  KanaQuizRoundResult,
} from "./types/quiz";
export { KANA_QUIZ_TYPE_LABELS, KANA_QUIZ_TOTAL_ROUNDS } from "./types/quiz";
export { getKanaLabel } from "./utils/kanaText";
export {
  listKanaCatalog,
  listKana,
  getKana,
  getKanaStrokes,
  getKanaProgress,
  getKanaExam,
  listHiraganas,
  listKatakanas,
  submitKanaExam,
} from "./api/kanaApi";
export { getKanaQuiz, submitKanaQuiz } from "./api/kanaQuizApi";

// Quiz utilities
export {
  parseKanaQuizStrokes,
  normalizeKanaQuizQuestion,
  normalizeKanaQuizResponse,
  isValidCanvasQuestion,
} from "./utils/quizParser";

// Quiz hook
export { useKanaQuiz } from "./hooks/useKanaQuiz";

// Stroke validation (re-exported from shared logic)
export {
  validateStroke,
  sampleSvgPath,
  simplifyStroke,
  getPointsForFeedback,
  getFeedbackLabel,
  getFeedbackColor,
} from "./lib/strokeValidation";
export type {
  StrokeValidationResult,
  StrokePoint,
} from "./lib/strokeValidation";

// Mock data
export {
  getMockKanaStrokes,
  hasMockKanaStrokes,
  getMockKanaSymbols,
} from "./mock/mockStrokeData";

// Components
export { KanaDetailModal } from "./components/KanaDetailModal";
export { KanaStrokePlayer } from "./components/KanaStrokePlayer";
export { KanaWritingCanvas } from "./components/KanaWritingCanvas";
export { KanaWritingPracticeModal } from "./components/KanaWritingPracticeModal";

// Quiz components
export {
  KanaQuizModal,
  KanaQuizCanvasExercise,
  KanaFromKanaExercise,
  KanaFromRomajiExercise,
} from "./components/quiz";
