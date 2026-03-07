import type { KatakanaMeanings, KatakanaReadings } from "../types";

export function getPrimaryMeaning(meanings: KatakanaMeanings): string | undefined {
  if (Array.isArray(meanings)) return meanings[0];
  return meanings.es?.[0] ?? meanings.en?.[0] ?? meanings.other?.[0];
}

export function getPrimaryReading(readings: KatakanaReadings): string | undefined {
  if (Array.isArray(readings)) return readings[0];
  return readings.on?.[0] ?? readings.kun?.[0] ?? readings.other?.[0];
}

export function meaningsToArray(meanings: KatakanaMeanings): string[] {
  if (Array.isArray(meanings)) return meanings;
  return [
    ...(meanings.es ?? []),
    ...(meanings.en ?? []),
    ...(meanings.other ?? []),
  ];
}

export function readingsToArray(readings: KatakanaReadings): string[] {
  if (Array.isArray(readings)) return readings;
  return [
    ...(readings.on ?? []),
    ...(readings.kun ?? []),
    ...(readings.other ?? []),
  ];
}
