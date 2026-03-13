import type { KanaStrokeData } from "@/features/kana/types";

/**
 * Mock stroke data for common hiragana & katakana symbols.
 * Used as fallback when the backend strokes endpoint is not yet available.
 *
 * Paths approximate KanjiVG-style data for viewBox "0 0 109 109".
 */

// ── Hiragana ────────────────────────────────────────────────

// あ (a)
const MOCK_あ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M28.5,29c2,0.25,4,0.12,6-0.12c12.5-1.5,26.5-3,35.5-3.5c2.5-0.13,4.25,0.12,5.5,0.37",
    "M56.5,14c0.88,0.88,1.5,2.18,1.5,3.93c0,6.32,0,44,0,58",
    "M18.5,58c2.5,0.5,5,0.5,7.5,0.12c15-2.25,35-5,52.5-5.75c3.5-0.12,5.5,0.25,7,0.5",
  ],
};

// い (i)
const MOCK_い: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M32,24c0.75,0.75,1.25,2,1.25,3.5c0,4,0,30,0,42c0,6-3,12-10,18",
    "M68,30c0.75,0.75,1.25,2,1.25,3.5c0,4-2,28-2,38c0,14,10,16,22,10",
  ],
};

// う (u)
const MOCK_う: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M42,22c2,0.5,4,0.5,6,0c8-2,14-3,18-3c2,0,3.5,0.25,4.5,0.5",
    "M54,38c0.75,0.75,1.25,2,1.25,3.5c0,4,0,16,0,22c0,12-8,24-24,32",
  ],
};

// え (e)
const MOCK_え: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M40,24c2,0.5,4,0.5,6,0c6-1.5,12-2.5,16-2.5c2,0,3.5,0.25,4.5,0.5",
    "M34,48c8,6,20,18,24,26c2,4,0,10-8,14c-10,5-22,2-28-4",
  ],
};

// お (o)
const MOCK_お: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M26,32c2,0.25,4,0.12,6-0.12c10-1.25,20-2.5,28-3c2-0.1,3.5,0.12,4.5,0.37",
    "M44,16c0.75,0.75,1.25,2,1.25,3.5c0,4,0,44,0,58",
    "M20,62c4,1,8,0,10-2c4-4,12-12,16-16c4,8,8,24-4,32c-8,5-18,2-24-4",
  ],
};

// か (ka)
const MOCK_か: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M36,18c0.75,0.75,1.25,2,1.25,3.5c0,4,0,34,0,48c0,8-4,16-12,22",
    "M22,42c2,0.5,4,0.5,6,0c14-2,30-4,42-4.5c3-0.12,5,0.25,6.5,0.5",
    "M70,28c0.75,0.75,1.25,2,1.25,3.5c0,4-2,24-2,34c0,12,4,16,10,14",
  ],
};

// き (ki)
const MOCK_き: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M24,28c2,0.5,4,0.5,6,0c16-2,32-4,44-4.5c3-0.12,5,0.25,6.5,0.5",
    "M28,50c2,0.5,4,0.5,6,0c14-2,28-3.5,38-4c2.5-0.1,4,0.12,5.5,0.37",
    "M54,16c0.75,0.75,1.25,2,1.25,3.5c0,4,0,30,0,42",
    "M34,72c4,2,12,4,20,2c8-2,12-8,8-14",
  ],
};

// さ (sa)
const MOCK_さ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M26,30c2,0.5,4,0.5,6,0c14-2,30-4,42-4.5c3-0.12,5,0.25,6.5,0.5",
    "M54,16c0.75,0.75,1.25,2,1.25,3.5c0,4,0,26,0,36",
    "M36,68c4,2,12,6,20,4c10-2,14-10,8-16c-4-4-12-4-18,0",
  ],
};

// し (shi)
const MOCK_し: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M42,18c0.75,0.75,1.25,2,1.25,3.5c0,6,0,32,0,44c0,14,8,20,22,16c10-3,18-10,24-18",
  ],
};

// す (su)
const MOCK_す: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M22,34c2,0.5,4,0.5,6,0c16-2,34-4.5,48-5c3.5-0.12,5.5,0.25,7,0.5",
    "M54,14c0.75,0.75,1.25,2,1.25,3.5c0,4,0,20,0,28c0,12-6,22-16,28c-6,3-14,4-20,0",
  ],
};

// ── Katakana ────────────────────────────────────────────────

// ア (a)
const MOCK_ア: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M28,28c2,0.5,4,0.5,6,0c14-2,30-4,42-4.5c3-0.12,5,0.25,6.5,0.5",
    "M62,20c0.75,0.75,1.25,2,1.25,3.5c0,4-8,38-8,50c0,4,2,6,6,4",
  ],
};

// イ (i)
const MOCK_イ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M72,16c-8,6-22,18-30,26",
    "M54,18c0.75,0.75,1.25,2,1.25,3.5c0,4,0,40,0,56",
  ],
};

// ウ (u)
const MOCK_ウ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M50,18c1,0.5,2,0.5,3,0c2-0.5,4-1,6-1c1,0,2,0.25,2.5,0.5",
    "M26,40c2,0.5,4,0.5,6,0c16-2,34-4.5,48-5c3.5-0.12,5.5,0.25,7,0.5",
    "M28,44c0,14-2,30-8,40c20-4,42-16,56-32",
  ],
};

// エ (e)
const MOCK_エ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M28,28c2,0.5,4,0.5,6,0c14-2,30-4,42-4.5c3-0.12,5,0.25,6.5,0.5",
    "M54,28c0.75,0.75,1.25,2,1.25,3.5c0,4,0,34,0,48",
    "M22,80c2,0.5,4,0.5,6,0c18-2.5,40-5,60-5.75c3.5-0.12,5.5,0.25,7,0.5",
  ],
};

// オ (o)
const MOCK_オ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M54,14c0.75,0.75,1.25,2,1.25,3.5c0,4,0,44,0,58",
    "M22,38c2,0.5,4,0.5,6,0c16-2,34-4.5,48-5c3.5-0.12,5.5,0.25,7,0.5",
    "M42,38c-4,14-10,30-18,42c16-2,30-10,38-24",
  ],
};

// カ (ka)
const MOCK_カ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M38,16c0.75,0.75,1.25,2,1.25,3.5c0,4-4,36-4,50c0,8,4,12,10,8",
    "M22,34c2,0.5,4,0.5,6,0c14-2,30-4,42-4.5c3-0.12,5,0.25,6.5,0.5",
  ],
};

// キ (ki)
const MOCK_キ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M24,34c2,0.5,4,0.5,6,0c16-2,34-4.5,48-5c3.5-0.12,5.5,0.25,7,0.5",
    "M28,58c2,0.5,4,0.5,6,0c14-2,28-3.5,38-4c2.5-0.1,4,0.12,5.5,0.37",
    "M54,14c0.75,0.75,1.25,2,1.25,3.5c0,4,0,54,0,68",
  ],
};

// サ (sa)
const MOCK_サ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M36,14c0.75,0.75,1.25,2,1.25,3.5c0,4,0,24,0,34",
    "M66,14c0.75,0.75,1.25,2,1.25,3.5c0,4,0,24,0,34",
    "M20,44c2,0.5,4,0.5,6,0c18-2.5,40-5,60-5.75c3.5-0.12,5.5,0.25,7,0.5",
  ],
};

// シ (shi)
const MOCK_シ: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M24,30c1,0.5,2,0.5,3,0c2-0.5,4-1,6-1c1,0,2,0.25,2.5,0.5",
    "M22,54c1,0.5,2,0.5,3,0c2-0.5,4-1,6-1c1,0,2,0.25,2.5,0.5",
    "M80,22c-6,12-24,38-42,56",
  ],
};

// ス (su)
const MOCK_ス: Omit<KanaStrokeData, "kanaId"> = {
  viewBox: "0 0 109 109",
  strokes: [
    "M26,26c2,0.5,4,0.5,6,0c14-2,30-4,42-4.5c3-0.12,5,0.25,6.5,0.5",
    "M68,28c-8,12-20,28-30,38c12,2,24-2,32-10",
  ],
};

// ── Map ─────────────────────────────────────────────────────

const MOCK_STROKES_BY_SYMBOL: Record<string, Omit<KanaStrokeData, "kanaId">> = {
  // Hiragana
  あ: MOCK_あ,
  い: MOCK_い,
  う: MOCK_う,
  え: MOCK_え,
  お: MOCK_お,
  か: MOCK_か,
  き: MOCK_き,
  さ: MOCK_さ,
  し: MOCK_し,
  す: MOCK_す,
  // Katakana
  ア: MOCK_ア,
  イ: MOCK_イ,
  ウ: MOCK_ウ,
  エ: MOCK_エ,
  オ: MOCK_オ,
  カ: MOCK_カ,
  キ: MOCK_キ,
  サ: MOCK_サ,
  シ: MOCK_シ,
  ス: MOCK_ス,
};

/**
 * Returns mock KanaStrokeData for a given kana id and symbol.
 * Returns null if no mock data available.
 */
export function getMockKanaStrokes(
  kanaId: string,
  symbol?: string,
): KanaStrokeData | null {
  const data = symbol ? MOCK_STROKES_BY_SYMBOL[symbol] : null;
  if (data) return { kanaId, ...data };
  return null;
}

/** Check if we have mock data for a given symbol */
export function hasMockKanaStrokes(symbol: string): boolean {
  return symbol in MOCK_STROKES_BY_SYMBOL;
}

/** Get all available mock symbols */
export function getMockKanaSymbols(): string[] {
  return Object.keys(MOCK_STROKES_BY_SYMBOL);
}
