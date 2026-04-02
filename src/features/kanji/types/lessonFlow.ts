/* ── Kanji Lesson Flow Types ──
 * Types for the 4-exercise sequential kanji lesson system.
 * Designed to match the backend contract while staying flexible for future changes.
 */

/** The four exercise kinds in a kanji lesson */
export type KanjiLessonExerciseKind =
  | "meaning"           // kanji → select correct meaning
  | "kanji_selection"   // meaning → select correct kanji
  | "reading_meaning"   // readings → select correct meaning
  | "writing";          // demo + freehand writing

/** A single selectable option within a question */
export type KanjiLessonQuestionOption = {
  value: string;
  correct: boolean;
};

/** A single question within an exercise block */
export type KanjiLessonQuestion = {
  kanji: string;
  kanjiId: string;
  /** Display value shown as prompt (meaning text, reading text, etc.) */
  prompt?: string;
  options: KanjiLessonQuestionOption[];
};

/** Payload returned by the backend for one exercise block */
export type KanjiLessonBlockPayload = {
  type: KanjiLessonExerciseKind;
  questions: KanjiLessonQuestion[];
};

/** Submission sent to the backend after completing one exercise block */
export type KanjiLessonBlockSubmission = {
  type: KanjiLessonExerciseKind;
  kanjiId: string;
  score: number;
};

/** Per-exercise result tracked locally */
export type KanjiLessonExerciseResult = {
  type: KanjiLessonExerciseKind;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
};

/** Stroke data needed for the writing exercise */
export type KanjiLessonStrokeData = {
  viewBox: string;
  strokes: string[];
};

/** Full lesson flow data (all 4 exercises for one kanji) */
export type KanjiLessonFlowData = {
  kanjiId: string;
  symbol: string;
  meanings: string[];
  readings: string[];
  exercises: KanjiLessonBlockPayload[];
  strokeData?: KanjiLessonStrokeData;
};

/** Steps in the lesson flow UI */
export type KanjiLessonFlowStep =
  | "loading"
  | "intro"
  | "exercise"
  | "exercise-feedback"
  | "summary";

/** Writing sub-phases */
export type KanjiWritingPhase = "demo" | "practice" | "done";

/** Internal session state managed by the orchestrator hook */
export type KanjiLessonSessionState = {
  step: KanjiLessonFlowStep;
  currentExerciseIndex: number;
  currentQuestionIndex: number;
  results: KanjiLessonExerciseResult[];
  selectedOptionIndex: number | null;
  isAnswered: boolean;
  writingPhase: KanjiWritingPhase;
  writingScore: number | null;
};

/** Exercise label mapping for UI */
export const EXERCISE_LABELS: Record<KanjiLessonExerciseKind, string> = {
  meaning: "Significado",
  kanji_selection: "Selección",
  reading_meaning: "Lecturas",
  writing: "Escritura",
};

/** Exercise icon names for UI */
export const EXERCISE_ICONS: Record<KanjiLessonExerciseKind, string> = {
  meaning: "translate",
  kanji_selection: "kanji",
  reading_meaning: "sound",
  writing: "pen",
};
