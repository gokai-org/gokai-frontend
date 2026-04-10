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

export type KanjiStrokeData = {
  kanjiId: string;
  viewBox: string; // e.g. "0 0 109 109"
  strokes: string[];
};

/* ── Resultados de leccion de kanji (lectura desde GOKAIUSERS) ── */

export type KanjiLessonResult = {
  id: string;
  userId: string;
  lessonId: string;
  kanjiId: string;
  mode: string;
  score: number;
  duration: number;
  totalExercises: number;
  correctExercises: number;
  completedAt: string;
};
