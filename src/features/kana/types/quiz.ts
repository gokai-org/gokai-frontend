/* ── Kana Quiz Types ── */

/**
 * Backend quiz types for kana.
 * Progression: from_kana -> from_romaji -> canvas
 * After domain 3: cycles from_kana -> from_romaji -> canvas -> ...
 */
export type KanaQuizType = "from_kana" | "from_romaji" | "canvas";

export type KanaQuizSessionType = KanaQuizType | "mixed";

export type KanaQuestionType = KanaQuizType;

export type KanaQuizOption = {
  correct: boolean;
  option: string;
};

export type KanaQuizQuestionItemRaw = {
  type: KanaQuizType;
  kanaId: string;
  symbol?: string;
  romaji?: string;
  options?: KanaQuizOption[];
  viewBox?: string;
  strokes?: string | string[];
};

export type KanaQuizQuestionItem = {
  type: KanaQuizType;
  kanaId: string;
  symbol: string;
  romaji: string;
  options: KanaQuizOption[];
  viewBox: string;
  strokes: string[];
};

export type KanaQuizResponseRaw = {
  type?: KanaQuizType;
  questions?: KanaQuizQuestionItemRaw[];
};

export type KanaQuizResponse = {
  type: KanaQuizSessionType;
  submitType: KanaQuizType;
  questions: KanaQuizQuestionItem[];
};

export type KanaQuizSubmitBody = {
  type: KanaQuizType;
  score: number;
  duration: number;
};

export type KanaQuizErrorResponse = {
  message: string;
  success: boolean;
};

export type KanaQuizStep =
  | "loading"
  | "error"
  | "exercise"
  | "exercise-feedback"
  | "submitting"
  | "celebration"
  | "summary";

export type KanaQuizQuestionResult = {
  questionIndex: number;
  correct: boolean;
  score: number;
};

export type KanaQuizSessionState = {
  step: KanaQuizStep;
  currentQuestionIndex: number;
  selectedOptionIndex: number | null;
  isAnswered: boolean;
  questionResults: KanaQuizQuestionResult[];
  canvasPhase: "demo" | "practice" | "done";
  canvasScores: number[];
};

export const KANA_QUIZ_TOTAL_ROUNDS = 3;

export type KanaQuizRoundResult = {
  type: KanaQuizType;
  score: number;
  duration: number;
};

/** Human-readable labels for each kana quiz type */
export const KANA_QUIZ_TYPE_LABELS: Record<KanaQuizSessionType, string> = {
  from_kana: "Pronunciacion",
  from_romaji: "Seleccion",
  canvas: "Escritura",
  mixed: "Quiz completo",
};
