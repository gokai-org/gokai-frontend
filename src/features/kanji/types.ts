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
  viewBox?: string;
  strokes?: string[];
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

export type KanjiStrokeData = {
  kanjiId: string;
  viewBox: string;     // e.g. "0 0 109 109"
  strokes: string[];
};

/* ── Resultados de lección de kanji ── */

export type KanjiLessonResultBody = {
  lessonId: string;
  kanjiId: string;
  mode: "writing" | "listening" | "reading" | "speaking";
  score: number;
  duration: number;
  totalExercises: number;
  correctExercises: number;
  answers: KanjiLessonAnswerBody[];
};

export type KanjiLessonAnswerBody = {
  exerciseType: KanjiExerciseType;
  points: number;
  duration: number;
  isCorrect: boolean;
};

export type KanjiLessonResult = {
  id: string;
  userId: string;
  lessonId: string;
  kanjiId: string;
  mode: "writing" | "listening" | "reading" | "speaking";
  score: number;
  duration: number;
  totalExercises: number;
  correctExercises: number;
  completedAt: string;
  answers: KanjiExerciseAnswer[];
};
