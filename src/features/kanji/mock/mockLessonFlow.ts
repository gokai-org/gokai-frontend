import type { KanjiLessonFlowData } from "@/features/kanji/types/lessonFlow";
import { getMockKanjiStrokes } from "@/features/kanji/mock/mockStrokeData";

/**
 * Single comprehensive mock that powers the entire 4-exercise lesson flow.
 * Generates data for any kanji based on its actual metadata.
 */
export function getMockKanjiLessonFlow(
  kanjiId: string,
  symbol: string,
  meanings: string[],
  readings: string[],
): KanjiLessonFlowData {
  const primaryMeaning = meanings[0] || "Desconocido";
  const primaryReading = readings[0] || "?";

  // Distractors for meaning questions
  const meaningDistractors = [
    "Montaña",
    "Río",
    "Fuego",
    "Agua",
    "Persona",
    "Grande",
    "Pequeño",
    "Cielo",
    "Tierra",
    "Sol",
    "Luna",
    "Árbol",
    "Bosque",
    "Piedra",
    "Flor",
  ].filter((d) => !meanings.some((m) => m.toLowerCase() === d.toLowerCase()));

  // Distractors for kanji selection questions
  const kanjiDistractors = [
    "山",
    "川",
    "火",
    "水",
    "人",
    "大",
    "小",
    "天",
    "地",
    "日",
    "月",
    "木",
    "林",
    "石",
    "花",
    "雨",
  ].filter((d) => d !== symbol);

  // Distractors for reading-based questions
  const readingDistractors = [
    "やま",
    "かわ",
    "ひ",
    "みず",
    "ひと",
    "おお",
    "ちい",
    "てん",
    "ち",
    "つき",
    "き",
    "はやし",
  ].filter((d) => !readings.some((r) => r === d));

  // Shuffle helper (Fisher-Yates)
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickDistractors(pool: string[], count: number): string[] {
    return shuffle(pool).slice(0, count);
  }

  // ── Exercise 1: Kanji → Meaning ──
  const meaningOptions = shuffle([
    { value: primaryMeaning, correct: true },
    ...pickDistractors(meaningDistractors, 3).map((d) => ({
      value: d,
      correct: false,
    })),
  ]);

  // ── Exercise 2: Meaning → Kanji ──
  const kanjiOptions = shuffle([
    { value: symbol, correct: true },
    ...pickDistractors(kanjiDistractors, 3).map((d) => ({
      value: d,
      correct: false,
    })),
  ]);

  // ── Exercise 3: Readings → Meaning ──
  const readingMeaningOptions = shuffle([
    { value: primaryMeaning, correct: true },
    ...pickDistractors(meaningDistractors, 3).map((d) => ({
      value: d,
      correct: false,
    })),
  ]);

  // ── Exercise 4: Writing (no options — handled by canvas) ──

  // Get stroke data from existing mock system
  const strokeMock = getMockKanjiStrokes(kanjiId, symbol);
  const strokeData = strokeMock
    ? { viewBox: strokeMock.viewBox, strokes: strokeMock.strokes }
    : undefined;

  return {
    kanjiId,
    symbol,
    meanings,
    readings,
    exercises: [
      {
        type: "meaning",
        questions: [
          {
            kanji: symbol,
            kanjiId,
            options: meaningOptions,
          },
        ],
      },
      {
        type: "kanji_selection",
        questions: [
          {
            kanji: symbol,
            kanjiId,
            prompt: primaryMeaning,
            options: kanjiOptions,
          },
        ],
      },
      {
        type: "reading_meaning",
        questions: [
          {
            kanji: symbol,
            kanjiId,
            prompt: readings.join("、"),
            options: readingMeaningOptions,
          },
        ],
      },
      {
        type: "writing",
        questions: [
          {
            kanji: symbol,
            kanjiId,
            options: [], // Writing has no multiple-choice options
          },
        ],
      },
    ],
    strokeData,
  };
}
