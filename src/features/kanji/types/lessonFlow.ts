/* ── Kanji Lesson Flow Types ──*/

export type KanjiLessonExerciseKind =
  | "meaning"           // select correct meaning
  | "kanji_selection"   // select correct kanji
  | "reading_meaning"   // select correct meaning from readings
  | "writing";          // demo + freehand writing

export type KanjiLessonQuestionOption = {
  value: string;
  correct: boolean;
};

export type KanjiLessonQuestion = {
  kanji: string;
  kanjiId: string;
  prompt?: string;
  options: KanjiLessonQuestionOption[];
};

export type KanjiLessonBlockPayload = {
  type: KanjiLessonExerciseKind;
  questions: KanjiLessonQuestion[];
};

export type KanjiLessonBlockSubmission = {
  type: KanjiLessonExerciseKind;
  kanjiId: string;
  score: number;
};

export type KanjiLessonExerciseResult = {
  type: KanjiLessonExerciseKind;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
};

export type KanjiLessonStrokeData = {
  viewBox: string;
  strokes: string[];
};

export type KanjiLessonFlowData = {
  kanjiId: string;
  symbol: string;
  meanings: string[];
  readings: string[];
  exercises: KanjiLessonBlockPayload[];
  strokeData?: KanjiLessonStrokeData;
};

export type KanjiLessonFlowStep =
  | "loading"
  | "intro"
  | "exercise"
  | "exercise-feedback"
  | "summary";

export type KanjiWritingPhase = "demo" | "practice" | "done";

export type KanjiLessonSessionState = {
  step: KanjiLessonFlowStep;
  currentExerciseIndex: number;
  currentQuestionIndex: number;
  /** Accumulates correct answers for the exercise in progress (resets per exercise). */
  currentExerciseCorrectCount: number;
  results: KanjiLessonExerciseResult[];
  selectedOptionIndex: number | null;
  isAnswered: boolean;
  writingPhase: KanjiWritingPhase;
  writingScore: number | null;
};

export const EXERCISE_LABELS: Record<KanjiLessonExerciseKind, string> = {
  meaning: "Significado",
  kanji_selection: "Selección",
  reading_meaning: "Lecturas",
  writing: "Escritura",
};

export const EXERCISE_ICONS: Record<KanjiLessonExerciseKind, string> = {
  meaning: "translate",
  kanji_selection: "kanji",
  reading_meaning: "sound",
  writing: "pen",
};
