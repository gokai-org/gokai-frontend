export type HiraganaReadings =
  | string[]
  | { on?: string[]; kun?: string[]; other?: string[] };

export type HiraganaMeanings =
  | string[]
  | { es?: string[]; en?: string[]; other?: string[] };

export type Hiragana = {
  id: string;
  symbol: string;
  readings: HiraganaReadings;
  meanings: HiraganaMeanings;
  pointsToUnlock: number;
  viewBox?: string;
  strokes?: string[];
};

export type HiraganaStrokeData = {
  hiraganaId: string;
  viewBox: string;
  strokes: string[];
};
