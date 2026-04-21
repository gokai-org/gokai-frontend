import { apiFetch } from "@/shared/lib/api/client";
import type {
  Kanji,
  KanjiStrokeData,
  KanjiLessonResult,
} from "@/features/kanji/types";

const KANJI_CONTENT_CACHE_TTL_MS = 1000 * 60 * 10;
const KANJI_RESULTS_CACHE_TTL_MS = 30_000;

export function listKanjis() {
  return apiFetch<Kanji[]>("/api/content/kanji", { cache: "no-store" }, {
    dedupeKey: "/api/content/kanji",
    cacheKey: "/api/content/kanji",
    cacheTtlMs: KANJI_CONTENT_CACHE_TTL_MS,
  });
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
  query.set("limit", String(params?.limit ?? 100));

  const qs = query.toString();
  const path = `/api/user/kanji-lessons/results${qs ? `?${qs}` : ""}`;

  return apiFetch<{ results: KanjiLessonResult[] }>(
    path,
    undefined,
    {
      dedupeKey: path,
      cacheKey: path,
      cacheTtlMs: KANJI_RESULTS_CACHE_TTL_MS,
    },
  );
}
