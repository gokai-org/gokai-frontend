export type AdminKanjiRecord = {
  id: string;
  symbol: string;
  readings: string[];
  meanings: string[];
  pointsToUnlock: number;
  learnOrder?: number | null;
  viewBox?: string;
  strokes?: string[];
};

export type AdminKanjiPayload = {
  id?: string;
  symbol: string;
  readings: string[];
  meanings: string[];
  pointsToUnlock: number;
  learnOrder?: number;
  viewBox: string;
  strokes: string[];
};

export type AdminKanjiReorderItem = {
  id: string;
  learnOrder: number;
};

export type AdminKanjiSummary = {
  total: number;
  totalReadings: number;
  totalMeanings: number;
  averagePoints: number;
};