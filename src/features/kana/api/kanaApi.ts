import { apiFetch } from "@/shared/lib/api/client";
import type { Kana, KanaStrokeData, KanaType, KanaExerciseAnswer } from "@/features/kana/types";

/* ── Funciones unificadas ──────────────────────────────── */

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

/**
 * Envía una respuesta de ejercicio de escritura/lectura de kana.
 */
export function submitKanaExerciseAnswer(body: {
  kanaId: string;
  exerciseType: "writing" | "reading";
  duration: number;
  points: number;
  isCorrect: boolean;
}) {
  return apiFetch<KanaExerciseAnswer>("/api/user/kana-exercises/answers", {
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
