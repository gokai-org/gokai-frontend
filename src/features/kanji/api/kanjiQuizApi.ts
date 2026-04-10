import { apiFetch } from "@/shared/lib/api/client";
import type {
  KanjiQuizResponseRaw,
  KanjiQuizResponse,
  KanjiQuizSubmitBody,
} from "@/features/kanji/types/quiz";
import { normalizeQuizResponse } from "@/features/kanji/utils/quizParser";

/**
 * Fetch the quiz block for a kanji from the backend.
 * The backend decides the question type based on user progress.
 *
 * @throws Error with the backend message (e.g. "No se tienen los puntos necesarios")
 */
export async function getKanjiQuiz(
  kanjiId: string,
): Promise<KanjiQuizResponse> {
  const raw = await apiFetch<KanjiQuizResponseRaw>(
    `/api/content/kanji/${kanjiId}?resource=quiz`,
    { cache: "no-store" },
  );

  return normalizeQuizResponse(raw);
}

/**
 * Submit the result of a completed quiz for a kanji.
 * The backend handles scoring, points, and progress tracking.
 */
export async function submitKanjiQuiz(
  kanjiId: string,
  body: KanjiQuizSubmitBody,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/content/kanji/${kanjiId}?resource=quiz`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
