import type { KanjiStrokeData } from "@/features/kanji/types";

/**
 * Mock stroke data from KanjiVG for common kanjis.
 * Used as fallback when the backend strokes endpoint is not yet available.
 *
 * Source: KanjiVG project (https://kanjivg.tagaini.net/)
 * Paths are for viewBox "0 0 109 109"
 */

// 四 – cuatro (U+56DB)
const MOCK_四: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M19.5,21.25c0.97,0.97,1.5,2.37,1.5,4.13c0,4.5,0,52.62,0,60.5c0,10.25,0.25,11.25,0.25,11.25",
    "M21.5,21.75c18-1.5,52.95-4.08,63.25-4.87c4.62-0.35,6.19,2.93,6.19,5.49c0,5.88,0,54.38,0,62.51c0,10.58-4.94,4.12-7.44,1.87",
    "M33.25,38c1.12,1.12,1.75,2.5,1.75,4.5c0,3.25-0.22,28.21-0.22,33.71",
    "M58.5,36.25c0.75,0.75,2,2.37,2,4.37c0,3.75,0.25,29.5,0.25,33",
    "M35.25,55.25c6.75,1.88,16.75,1.25,24.75,0",
  ],
};

// 一 – uno (U+4E00)
const MOCK_一: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M14.25,53c1.75,0.25,4.5,0.25,6.5,0c20.25-2.25,52.75-5.13,73.25-5.75c3.13-0.09,5.25,0.25,6.75,0.5",
  ],
};

// 二 – dos (U+4E8C)
const MOCK_二: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M24.25,34.5c2,0.25,4.12,0.12,6.12-0.12c11.75-1.62,27-3.12,35.25-3.5c2.37-0.1,4.25,0.12,5.5,0.37",
    "M14.25,73.25c2.25,0.25,4.5,0.25,6.75,0c22-2.5,47.5-4.75,68.25-5.5c3.37-0.12,5.5,0.25,7,0.5",
  ],
};

// 三 – tres (U+4E09)
const MOCK_三: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M27.75,26.75c2,0.25,3.75,0.12,5.75-0.12c11-1.37,22.5-2.5,30.75-2.87c2.12-0.1,3.75,0.12,4.75,0.37",
    "M21.5,52.75c2,0.25,4.25,0.12,6.25-0.12c14.75-1.75,30.25-3.12,43.75-3.75c2.75-0.13,4.5,0.12,5.75,0.37",
    "M14.25,80c2.25,0.25,4.75,0.25,7,0c23-2.75,49.5-5,71.5-5.75c3.5-0.12,5.75,0.25,7.25,0.5",
  ],
};

// 山 – montaña (U+5C71)
const MOCK_山: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M52.5,11.25c1,1,1.5,2.18,1.5,3.93c0,6.32-0.25,57.72-0.25,72.07",
    "M17,42.5c0.97,0.97,1.5,2.27,1.5,4.02c0,5.48,0,31.63,0,40.73c0,3.75,2.5,4.25,5.82,4C35.82,90.5,65.25,88,85.14,87.25c4.36-0.16,6.36-1,6.36-4.75c0-7.75,0-31.49,0-38",
    "M18.75,42.75c10.5-1,31.12-3.37,34.87-3.75",
  ],
};

// 川 – río (U+5DDD)
const MOCK_川: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M25.62,18.12c0.38,0.88,0.88,2.38,0.38,4c-3.5,11.25-10.88,31.5-16.25,42.75",
    "M54.5,14.75c0.97,0.97,1.5,2.3,1.5,4.05c0,5.25,0,53.72,0,66.95",
    "M82.75,12.75c1,1,1.5,2.43,1.5,4.18c0,6.07-0.25,57.45-0.25,72.07",
  ],
};

// 日 – sol/día (U+65E5)
const MOCK_日: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M30.12,18.25c0.98,0.98,1.63,2.36,1.63,4.29c0,6.69,0,56.58,0,65.83c0,4.75,2,5.56,4.41,5.38c8.84-0.67,30.34-2.67,37.59-3.3c3.97-0.34,5.38-1.82,5.38-5.7c0-6.88,0-55.13,0-62.01c0-3.59-1.01-4.96-4.38-4.62c-8.74,0.87-30.08,2.88-38.28,3.69",
    "M31.75,18.5c14.5-1.5,37.12-3.81,46.38-4.38",
    "M33.5,55c5.38,0.75,33.25-1.87,44-2.75",
    "M78.12,18.5c0,0,0.75,61.62,0.75,69.12",
  ],
};

// 水 – agua (U+6C34)
const MOCK_水: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M54.25,16.25c0.88,0.88,1.5,2.18,1.5,3.93c0,6.32,0,57.72,0,72.07",
    "M29.5,39.25c0.88,1.91,1.22,3.48-0.44,5.93c-4.82,7.16-16.33,21.18-24.44,28.57",
    "M32,43.75c5.12,4.5,24.5,25.75,30.5,33",
    "M55.25,60.75c6.5-4.5,24.25-20,39.5-28.5",
  ],
};

// 火 – fuego (U+706B)
const MOCK_火: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M52.88,12.5c0.81,0.81,1.37,2.03,1.37,3.56c0,3.38,0,23.44,0,34.69",
    "M18.25,31.5c0.5,1.88,1,3.75-0.12,6.12c-2.38,5-10.75,17.88-15.38,23.88",
    "M24.38,36.88c4,4.88,14.5,19.62,18.5,25.12",
    "M58.62,55c5.25-2.88,24.5-16.62,37.38-22.12",
    "M47,78.5c1.88,1.38,2.25,1.88,4.62,4.38c2.88,3,19.12,12.38,37.75,11",
  ],
};

// 人 – persona (U+4EBA)
const MOCK_人: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M58.25,17.5c-1.12,3.25-4.37,9.87-12.62,22.25c-8.25,12.37-23.5,30.5-38.37,42.75",
    "M44.75,42c8.37,7.88,32.25,32.88,46.25,46.25",
  ],
};

// 大 – grande (U+5927)
const MOCK_大: Omit<KanjiStrokeData, "kanjiId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M14.75,37.75c2.25,0.5,4.25,0.5,6.5,0.12c19.75-3.12,44.25-5.87,68.25-6.87c3.5-0.14,5.5,0.12,7,0.5",
    "M54.5,12.75c1,1,1.62,2.31,1.62,4.06c0,4.75,0.12,18.63,0.12,25.19",
    "M54.5,42c-4.38,9.12-18.87,30.87-44.5,49.75",
    "M56.62,43.87c8.5,9.38,30.38,33.25,41.62,42",
  ],
};

/**
 * Map of kanji symbol → mock stroke data.
 * Extend this map to add more kanjis for testing.
 */
const MOCK_STROKES_BY_SYMBOL: Record<string, Omit<KanjiStrokeData, "kanjiId">> = {
  "四": MOCK_四,
  "一": MOCK_一,
  "二": MOCK_二,
  "三": MOCK_三,
  "山": MOCK_山,
  "川": MOCK_川,
  "日": MOCK_日,
  "水": MOCK_水,
  "火": MOCK_火,
  "人": MOCK_人,
  "大": MOCK_大,
};

/**
 * Returns mock KanjiStrokeData for a given kanji id and symbol.
 * Falls back to the 四 (cuatro) data if the symbol is not found.
 */
export function getMockKanjiStrokes(kanjiId: string, symbol?: string): KanjiStrokeData | null {
  const data = (symbol && MOCK_STROKES_BY_SYMBOL[symbol]) || null;
  if (data) return { kanjiId, ...data };

  // If no specific match, return 四 as a generic fallback for demos
  return { kanjiId, ...MOCK_四 };
}

/** Check if we have mock data for a given symbol */
export function hasMockStrokes(symbol: string): boolean {
  return symbol in MOCK_STROKES_BY_SYMBOL;
}

/** Get all available mock symbols */
export function getMockSymbols(): string[] {
  return Object.keys(MOCK_STROKES_BY_SYMBOL);
}
