export { KanjiDetailModal } from "./components/KanjiDetailModal";
export { KanjiStrokePlayer } from "./components/KanjiStrokePlayer";
export { KanjiWritingCanvas } from "./components/KanjiWritingCanvas";
export { WritingPracticeModal } from "./components/WritingPracticeModal";
export type {
  Kanji,
  KanjiExerciseAnswer,
  KanjiReadings,
  KanjiMeanings,
  KanjiExerciseType,
  KanjiStrokeData,
  KanjiLessonResult,
  KanjiLessonResultBody,
  KanjiLessonAnswerBody,
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
  submitKanjiExerciseAnswer,
  submitKanjiLessonResult,
  getKanjiLessonResults,
} from "./api/kanjiApi";
export { useSubmitKanjiLesson } from "./hooks/useSubmitKanjiLesson";

/* ── Lesson Flow (new 4-exercise system) ── */
export { KanjiLessonFlowModal } from "./components/lesson-flow";
export { useKanjiLessonFlow } from "./hooks/useKanjiLessonFlow";
export {
  getKanjiLessonFlow,
  getKanjiLessonExercise,
  submitKanjiLessonExerciseResult,
} from "./api/kanjiLessonFlowApi";
export type {
  KanjiLessonExerciseKind,
  KanjiLessonQuestionOption,
  KanjiLessonQuestion,
  KanjiLessonBlockPayload,
  KanjiLessonBlockSubmission,
  KanjiLessonExerciseResult,
  KanjiLessonFlowData,
  KanjiLessonFlowStep,
  KanjiLessonSessionState,
} from "./types/lessonFlow";

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
  quizQuestionToLessonQuestion,
} from "./utils/quizParser";
