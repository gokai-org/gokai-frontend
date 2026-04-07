import type {
  KanaQuestionType,
  KanaQuizQuestionItem,
  KanaQuizQuestionItemRaw,
  KanaQuizSubmitBody,
} from "./types/quiz";

export type KanaType = "hiragana" | "katakana";

export type Kana = {
  id: string;
  symbol: string;
  kanaType: KanaType;
  romaji?: string;
  pointsToUnlock: number;
  viewBox?: string;
  strokes?: string[];
};

export type KanaStrokeData = {
  kanaId: string;
  viewBox: string;
  strokes: string[];
};

export type KanaListItemResponse = {
  id: string;
  symbol: string;
  kanaType: KanaType;
  romaji: string;
  pointsToUnlock: number;
};

export type KanaListResponse = {
  hiragana: KanaListItemResponse[];
  katakana: KanaListItemResponse[];
};

export type UserKanaProgressDetailedResponse = {
  kanaId: string;
  symbol: string;
  kanaType: KanaType;
  pointsToUnlock: number;
  pointsNeeded: number;
  exerciseType: KanaQuestionType | "";
  completed: boolean;
  message?: string;
};

export type KanaExamResponseRaw =
  | KanaQuizQuestionItemRaw[]
  | { questions?: KanaQuizQuestionItemRaw[] };

export type KanaExamResponse = {
  questions: KanaQuizQuestionItem[];
};

export type SaveKanaQuizResponseRequest = KanaQuizSubmitBody;

export type KanaExerciseType = "writing" | "reading";

export type KanaExerciseAnswer = {
  id: string;
  kanaId: string;
  userId: string;
  exerciseType?: KanaExerciseType;
  points?: number;
  duration?: number;
  isCorrect?: boolean;
  answeredAt?: string;
};
