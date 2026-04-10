import type { KanjiReadings, KanjiMeanings } from "@/features/kanji/types";

export function normalizeReadings(readings: KanjiReadings) {
  if (Array.isArray(readings)) {
    const all = readings.filter(Boolean);
    return { on: all, kun: [], other: [], all };
  }
  const on = readings.on ?? [];
  const kun = readings.kun ?? [];
  const other = readings.other ?? [];
  const all = [...on, ...kun, ...other].filter(Boolean);
  return { on, kun, other, all };
}

export function normalizeMeanings(meanings: KanjiMeanings) {
  if (Array.isArray(meanings)) {
    const all = meanings.filter(Boolean);
    return { es: all, en: [], other: [], all };
  }
  const es = meanings.es ?? [];
  const en = meanings.en ?? [];
  const other = meanings.other ?? [];
  const all = [...es, ...en, ...other].filter(Boolean);
  return { es, en, other, all };
}
