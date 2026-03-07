export type KatakanaReadings =
  | string[]
  | { on?: string[]; kun?: string[]; other?: string[] };

export type KatakanaMeanings =
  | string[]
  | { es?: string[]; en?: string[]; other?: string[] };

export type Katakana = {
  id: string;
  symbol: string;
  readings: KatakanaReadings;
  meanings: KatakanaMeanings;
  pointsToUnlock: number;
  viewBox?: string;
  strokes?: string[];
};

export type KatakanaStrokeData = {
  katakanaId: string;
  viewBox: string;
  strokes: string[];
};
