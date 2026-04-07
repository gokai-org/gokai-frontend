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
  });
}

export function listKana(kanaType: KanaType) {
  return apiFetch<Kana[]>(`/api/content/kana?kana_type=${kanaType}`, {
    cache: "no-store",
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
