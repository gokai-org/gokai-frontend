import { apiFetch } from "@/shared/lib/api/client";
import type {
  KanaQuizResponseRaw,
  KanaQuizResponse,
  KanaQuizSubmitBody,
} from "@/features/kana/types/quiz";
import { normalizeKanaQuizResponse } from "@/features/kana/utils/quizParser";

/**
 * Fetch the quiz for a kana from the backend (GOKAISTUDY).
 * The backend decides the question type based on user progress.
 *
 * @throws Error with the backend message (e.g. "No se tienen los puntos necesarios")
 */
export async function getKanaQuiz(
  kanaId: string,
): Promise<KanaQuizResponse> {
  const raw = await apiFetch<KanaQuizResponseRaw>(
    `/api/content/kana/quiz/${kanaId}`,
    { cache: "no-store" },
  );

  return normalizeKanaQuizResponse(raw);
}

/**
 * Submit the result of a completed quiz round for a kana.
 * The backend handles scoring, points, and progress tracking.
 */
export async function submitKanaQuiz(
  kanaId: string,
  body: KanaQuizSubmitBody,
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/content/kana/quiz/${kanaId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
