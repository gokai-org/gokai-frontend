export { KanjiDetailModal } from "./components/KanjiDetailModal";
export { KanjiStrokePlayer } from "./components/KanjiStrokePlayer";
export { KanjiWritingCanvas } from "./components/KanjiWritingCanvas";
export { WritingPracticeModal } from "./components/WritingPracticeModal";
export type {
  Kanji,
  KanjiReadings,
  KanjiMeanings,
  KanjiStrokeData,
  KanjiLessonResult,
  KanjiExerciseType,
  KanjiStudyProgress,
  KanjiUnlockResponse,
} from "./types";
export {
  getPrimaryMeaning,
  getPrimaryReading,
  meaningsToArray,
  readingsToArray,
} from "./utils/kanjiText";
export {
  listKanjis,
  getKanji,
  getKanjiStrokes,
  getKanjiLessonResults,
  getKanjiProgress,
  unlockKanji,
} from "./api/kanjiApi";

/* ── Kanji Quiz (backend-driven quiz system) ── */
export { KanjiQuizModal } from "./components/quiz";
export { useKanjiQuiz } from "./hooks/useKanjiQuiz";
export { getKanjiQuiz, submitKanjiQuiz } from "./api/kanjiQuizApi";
export type {
  KanjiQuizType,
  KanjiQuizOption,
  KanjiQuizQuestion,
  KanjiQuizResponse,
  KanjiQuizSubmitBody,
  KanjiQuizSessionState,
} from "./types/quiz";
export {
  parseKanjiQuizStrokes,
  normalizeQuizResponse,
  isValidWritingQuestion,
  toExerciseQuestion,
} from "./utils/quizParser";
