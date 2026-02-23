import { apiFetch } from "@/shared/lib/api/client";
import type { Kanji, KanjiStrokeData, KanjiExerciseAnswer } from "@/features/kanji/types";

export function listKanjis() {
  return apiFetch<Kanji[]>("/api/content/kanji", { cache: "no-store" });
}

export function getKanji(id: string) {
  return apiFetch<Kanji>(`/api/content/kanji/${id}`, { cache: "no-store" });
}

export function getKanjiStrokes(id: string) {
  return apiFetch<KanjiStrokeData>(`/api/content/kanji/${id}/strokes`, {
    cache: "no-store",
  });
}

export function submitKanjiExerciseAnswer(body: {
  kanjiId: string;
  exerciseType: "writing" | "meaning";
  duration: number;
  points: number;
  isCorrect: boolean;
}) {
  return apiFetch<KanjiExerciseAnswer>("/api/user/kanji-exercises/answers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}