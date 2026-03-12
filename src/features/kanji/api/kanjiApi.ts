import { apiFetch } from "@/shared/lib/api/client";
import type {
  Kanji,
  KanjiStrokeData,
  KanjiExerciseAnswer,
  KanjiLessonResult,
  KanjiLessonResultBody,
} from "@/features/kanji/types";

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

/* ── Resultados de lección de kanji ── */

export function submitKanjiLessonResult(body: KanjiLessonResultBody) {
  console.log("[FRONT] submitKanjiLessonResult payload:", body);
  console.log(
    "[FRONT] submitKanjiLessonResult payload JSON:",
    JSON.stringify(body, null, 2),
  );

  return apiFetch<KanjiLessonResult>(
    "/api/user/kanji-lessons/results",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export function getKanjiLessonResults(params?: {
  kanjiId?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.kanjiId) query.set("kanjiId", params.kanjiId);
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiFetch<{ results: KanjiLessonResult[] }>(
    `/api/user/kanji-lessons/results${qs ? `?${qs}` : ""}`,
  );
}