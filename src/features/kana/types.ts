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
