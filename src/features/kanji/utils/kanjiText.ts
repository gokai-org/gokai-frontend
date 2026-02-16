import type { KanjiMeanings, KanjiReadings } from "../types";

export function getPrimaryMeaning(meanings: KanjiMeanings): string | undefined {
  if (Array.isArray(meanings)) return meanings[0];
  return meanings.es?.[0] ?? meanings.en?.[0] ?? meanings.other?.[0];
}

export function getPrimaryReading(readings: KanjiReadings): string | undefined {
  if (Array.isArray(readings)) return readings[0];
  return readings.on?.[0] ?? readings.kun?.[0] ?? readings.other?.[0];
}

export function meaningsToArray(meanings: KanjiMeanings): string[] {
  if (Array.isArray(meanings)) return meanings;
  return [
    ...(meanings.es ?? []),
    ...(meanings.en ?? []),
    ...(meanings.other ?? []),
  ];
}

export function readingsToArray(readings: KanjiReadings): string[] {
  if (Array.isArray(readings)) return readings;
  return [
    ...(readings.on ?? []),
    ...(readings.kun ?? []),
    ...(readings.other ?? []),
  ];
}
