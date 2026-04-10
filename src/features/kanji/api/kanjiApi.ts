import { apiFetch } from "@/shared/lib/api/client";
import type {
  Kanji,
  KanjiStrokeData,
  KanjiLessonResult,
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

/* ── Resultados de leccion de kanji (lectura desde GOKAIUSERS) ── */

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
