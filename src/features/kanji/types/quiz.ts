/* ── Kanji Quiz Types ──*/

/**
 * Backend quiz types — exactly as returned by GET /study/kanji/quiz/:id
 * The backend cycles these in order: kanji → meaning → reading → writing
 */
export type KanjiQuizType = "kanji" | "meaning" | "reading" | "writing";

export type KanjiQuizOption = {
  correct: boolean;
  value: string;
};

export type KanjiQuizQuestionRaw = {
  kanji: string;
  options?: KanjiQuizOption[];
  viewBox?: string;
  strokes?: string;
};

export type KanjiQuizQuestion = {
  kanji: string;
  options: KanjiQuizOption[];
  viewBox?: string;
  strokes?: string[];
};

export type KanjiQuizResponseRaw = {
  type: KanjiQuizType;
  questions: KanjiQuizQuestionRaw[];
};

export type KanjiQuizResponse = {
  type: KanjiQuizType;
  questions: KanjiQuizQuestion[];
};

export type KanjiQuizSubmitBody = {
  type: KanjiQuizType;
  score: number;
  duration: number;
};

export type KanjiQuizErrorResponse = {
  message: string;
  success: boolean;
};

export type KanjiQuizStep =
  | "loading"
  | "error"
  | "exercise"
  | "exercise-feedback"
  | "submitting"
  | "summary";

export type KanjiQuizQuestionResult = {
  questionIndex: number;
  correct: boolean;
};

export type KanjiQuizSessionState = {
  step: KanjiQuizStep;
  currentQuestionIndex: number;
  selectedOptionIndex: number | null;
  isAnswered: boolean;
  questionResults: KanjiQuizQuestionResult[];
  writingQuestionIndex: number;
  writingPhase: "demo" | "practice" | "done";
  writingScores: number[];
};

export type KanjiQuizRoundResult = {
  type: KanjiQuizType;
  score: number;
};

/**
 * Fixed order for the 4 quiz exercises.
 * The backend cycles through these sequentially per kanji.
 */
export const QUIZ_ROUND_ORDER: KanjiQuizType[] = ["kanji", "meaning", "reading", "writing"];
export const QUIZ_TOTAL_ROUNDS = 4;

/** Human-readable labels for each quiz type */
export const QUIZ_TYPE_LABELS: Record<KanjiQuizType, string> = {
  kanji: "Significado",
  meaning: "Selección",
  reading: "Lecturas",
  writing: "Escritura",
};
