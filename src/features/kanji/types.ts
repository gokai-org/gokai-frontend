export type KanjiReadings =
  | string[]
  | { on?: string[]; kun?: string[]; other?: string[] };

export type KanjiMeanings =
  | string[]
  | { es?: string[]; en?: string[]; other?: string[] };

export type Kanji = {
  id: string;
  symbol: string;
  readings: KanjiReadings;
  meanings: KanjiMeanings;
  pointsToUnlock: number;
};

export type KanjiExerciseType = "writing" | "meaning";

export type KanjiExerciseAnswer = {
  id: string;
  kanjiId: string;
  userId: string;
  exerciseType?: KanjiExerciseType;
  points?: number;
  duration?: number;
  isCorrect?: boolean;
  answeredAt?: string;
};
