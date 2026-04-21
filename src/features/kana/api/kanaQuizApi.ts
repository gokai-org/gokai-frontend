import { apiFetch } from "@/shared/lib/api/client";
import type {
  KanaQuizResponseRaw,
  KanaQuizResponse,
  KanaQuizSubmitBody,
  KanaQuizType,
} from "@/features/kana/types/quiz";
import { normalizeKanaQuizResponse } from "@/features/kana/utils/quizParser";

export type KanaQuizSubmitResponse = {
  success?: boolean;
  message?: string;
  userPoints?: number | null;
  kanaPoints?: number | null;
  points?: number | null;
};

/**
 * Fetch the quiz for a kana from the backend (GOKAISTUDY).
 * The backend decides the question type based on user progress.
 *
 * @throws Error with the backend message (e.g. "No se tienen los puntos necesarios")
 */
export async function getKanaQuiz(
  kanaId: string,
  quizType?: KanaQuizType,
  options?: {
    fallbackType?: KanaQuizType;
    forceFallback?: boolean;
  },
): Promise<KanaQuizResponse> {
  const params = new URLSearchParams({ resource: "quiz" });

  if (quizType) {
    params.set("quizType", quizType);
  }

  if (options?.fallbackType) {
    params.set("fallbackType", options.fallbackType);
  }

  if (options?.forceFallback) {
    params.set("forceFallback", "1");
  }

  const path = `/api/content/kana/${kanaId}?${params.toString()}`;
  const raw = await apiFetch<KanaQuizResponseRaw>(
    path,
    { cache: "no-store" },
    { dedupeKey: path },
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
): Promise<KanaQuizSubmitResponse> {
  return apiFetch<KanaQuizSubmitResponse>(`/api/content/kana/${kanaId}?resource=quiz`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
