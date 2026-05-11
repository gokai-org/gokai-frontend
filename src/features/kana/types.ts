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
  | {
      alphabet?: KanaType;
      totalQuestions?: number;
      questions?: KanaQuizQuestionItemRaw[];
    };

export type KanaExamResponse = {
  alphabet: KanaType;
  totalQuestions: number;
  questions: KanaQuizQuestionItem[];
};

export type SaveKanaQuizResponseRequest = KanaQuizSubmitBody;

export type KanaExamSubmitRequest = {
  score: number;
  duration: number;
};

export type KanaExamSubmitResponse = {
  success: boolean;
  message?: string;
  awardedPoints?: number;
};

export type KanaExamResult = {
  kanaType: KanaType;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  duration: number;
  passed: boolean;
  awardedPoints: number;
  message?: string | null;
};

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
