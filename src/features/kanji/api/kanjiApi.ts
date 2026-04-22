import { apiFetch } from "@/shared/lib/api/client";
import type {
  Kanji,
  KanjiStudyProgress,
  KanjiStrokeData,
  KanjiLessonResult,
  KanjiUnlockResponse,
} from "@/features/kanji/types";

const KANJI_CONTENT_CACHE_TTL_MS = 1000 * 60 * 10;
const KANJI_RESULTS_CACHE_TTL_MS = 30_000;
const KANJI_PROGRESS_CACHE_TTL_MS = 15_000;

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

export async function getKanjiProgress() {
  const payload = await apiFetch<
    KanjiStudyProgress | { hasUnlocked?: boolean; message?: string }
  >(
    "/api/content/kanji/progress",
    { cache: "no-store" },
    {
      dedupeKey: "/api/content/kanji/progress",
      cacheKey: "/api/content/kanji/progress",
      cacheTtlMs: KANJI_PROGRESS_CACHE_TTL_MS,
    },
  );

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (
    "hasUnlocked" in payload &&
    payload.hasUnlocked === false
  ) {
    return null;
  }

  if (!("kanjiId" in payload) || typeof payload.kanjiId !== "string") {
    return null;
  }

  return payload as KanjiStudyProgress;
}

export function unlockKanji(kanjiId: string) {
  return apiFetch<KanjiUnlockResponse>(
    `/api/content/kanji/${kanjiId}?resource=unlock`,
    {
      method: "POST",
    },
  );
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
