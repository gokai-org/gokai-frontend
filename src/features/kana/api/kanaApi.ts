import { apiFetch } from "@/shared/lib/api/client";
import type {
  Kana,
  KanaExamResponse,
  KanaExamResponseRaw,
  KanaStrokeData,
  KanaType,
  KanaListResponse,
  SaveKanaQuizResponseRequest,
  UserKanaProgressDetailedResponse,
} from "@/features/kana/types";
import { normalizeKanaQuizQuestion } from "@/features/kana/utils/quizParser";

const KANA_CONTENT_CACHE_TTL_MS = 1000 * 60 * 10;
const KANA_PROGRESS_CACHE_TTL_MS = 30_000;

/* ── Funciones unificadas ──────────────────────────────── */

function normalizeKanaExamResponse(raw: KanaExamResponseRaw): KanaExamResponse {
  const questions = Array.isArray(raw) ? raw : raw.questions ?? [];

  return {
    questions: questions.map(normalizeKanaQuizQuestion),
  };
}

export function listKanaCatalog() {
  return apiFetch<KanaListResponse>("/api/content/kana", {
    cache: "no-store",
  }, {
    dedupeKey: "/api/content/kana",
    cacheKey: "/api/content/kana",
    cacheTtlMs: KANA_CONTENT_CACHE_TTL_MS,
  });
}

export function listKana(kanaType: KanaType) {
  const path = `/api/content/kana?kana_type=${kanaType}`;

  return apiFetch<Kana[]>(path, {
    cache: "no-store",
  }, {
    dedupeKey: path,
    cacheKey: path,
    cacheTtlMs: KANA_CONTENT_CACHE_TTL_MS,
  });
}

export function getKana(id: string) {
  return apiFetch<Kana>(`/api/content/kana/${id}`, { cache: "no-store" });
}

/**
 * Obtiene los datos de trazo de un kana desde el endpoint dedicado.
 */
export function getKanaStrokes(id: string) {
  return apiFetch<KanaStrokeData>(`/api/content/kana/${id}/strokes`, {
    cache: "no-store",
  });
}

export function getKanaProgress() {
  return apiFetch<UserKanaProgressDetailedResponse[]>(
    "/api/content/kana/progress",
    {
      cache: "no-store",
    },
    {
      dedupeKey: "/api/content/kana/progress",
      cacheKey: "/api/content/kana/progress",
      cacheTtlMs: KANA_PROGRESS_CACHE_TTL_MS,
    },
  );
}

export async function getKanaExam(kanaType: KanaType) {
  const raw = await apiFetch<KanaExamResponseRaw>(
    `/api/content/kana/exam/${kanaType}`,
    {
      cache: "no-store",
    },
  );

  return normalizeKanaExamResponse(raw);
}

export function submitKanaExam(
  kanaType: KanaType,
  body: SaveKanaQuizResponseRequest,
) {
  return apiFetch<{ success: boolean }>(`/api/content/kana/exam/${kanaType}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ── Alias de conveniencia ─────────────────────────────── */

export function listHiraganas() {
  return listKana("hiragana");
}

export function listKatakanas() {
  return listKana("katakana");
}
