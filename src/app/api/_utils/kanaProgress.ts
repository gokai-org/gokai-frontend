import type { UserKanaProgressDetailedResponse } from "@/features/kana/types";

type RawProgressItem = {
  kanaId?: string;
  kana_id?: string;
  symbol?: string;
  kanaType?: string;
  kana_type?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
  pointsNeeded?: number;
  points_needed?: number;
  exerciseType?: string;
  exercise_type?: string;
  completed?: boolean;
  message?: string;
  hasHiraganaMastery?: boolean;
  has_hiragana_mastery?: boolean;
  hasKatakanaMastery?: boolean;
  has_katakana_mastery?: boolean;
  hasKanasMastery?: boolean;
  has_kanas_mastery?: boolean;
};

function normalizeProgressItem(raw: RawProgressItem): UserKanaProgressDetailedResponse {
  return {
    kanaId: raw.kanaId ?? raw.kana_id ?? "",
    symbol: raw.symbol ?? "",
    kanaType:
      raw.kanaType === "katakana" || raw.kana_type === "katakana"
        ? "katakana"
        : "hiragana",
    pointsToUnlock: raw.pointsToUnlock ?? raw.points_to_unlock ?? 0,
    pointsNeeded: raw.pointsNeeded ?? raw.points_needed ?? 0,
    exerciseType: (raw.exerciseType ?? raw.exercise_type ?? "") as UserKanaProgressDetailedResponse["exerciseType"],
    completed: raw.completed === true,
    message: raw.message,
    hasHiraganaMastery:
      raw.hasHiraganaMastery === true || raw.has_hiragana_mastery === true,
    hasKatakanaMastery:
      raw.hasKatakanaMastery === true || raw.has_katakana_mastery === true,
    hasKanasMastery:
      raw.hasKanasMastery === true || raw.has_kanas_mastery === true,
  };
}

function isProgressItem(value: unknown): value is RawProgressItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    typeof (value as RawProgressItem).kanaId === "string" ||
    typeof (value as RawProgressItem).kana_id === "string" ||
    (value as RawProgressItem).hasHiraganaMastery === true ||
    (value as RawProgressItem).has_hiragana_mastery === true ||
    (value as RawProgressItem).hasKatakanaMastery === true ||
    (value as RawProgressItem).has_katakana_mastery === true ||
    (value as RawProgressItem).hasKanasMastery === true ||
    (value as RawProgressItem).has_kanas_mastery === true
  );
}

export function normalizeKanaProgressPayload(payload: unknown) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { progress?: unknown[] } | null)?.progress)
      ? (payload as { progress: unknown[] }).progress
      : Array.isArray((payload as { data?: unknown[] } | null)?.data)
        ? (payload as { data: unknown[] }).data
        : isProgressItem(payload)
          ? [payload]
          : [];

  return items.map((item) => normalizeProgressItem(item as RawProgressItem));
}
