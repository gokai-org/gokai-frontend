import { apiFetch } from "@/shared/lib/api/client";
import type {
  KanjiQuizResponseRaw,
  KanjiQuizResponse,
  KanjiQuizSubmitBody,
} from "@/features/kanji/types/quiz";
import { normalizeQuizResponse } from "@/features/kanji/utils/quizParser";

export type KanjiQuizSubmitResponse = {
  success?: boolean;
  message?: string;
  userPoints?: number | null;
  points?: number | null;
};

/**
 * Fetch the quiz block for a kanji from the backend.
 * The backend decides the question type based on user progress.
 *
 * @throws Error with the backend message (e.g. "No se tienen los puntos necesarios")
 */
export async function getKanjiQuiz(
  kanjiId: string,
  quizType?: KanjiQuizResponseRaw["type"],
  options?: {
    fallbackType?: KanjiQuizResponseRaw["type"];
    forceFallback?: boolean;
  },
): Promise<KanjiQuizResponse> {
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

  const path = `/api/content/kanji/${kanjiId}?${params.toString()}`;

  const raw = await apiFetch<KanjiQuizResponseRaw>(
    path,
    { cache: "no-store" },
    { dedupeKey: path },
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
): Promise<KanjiQuizSubmitResponse> {
  return apiFetch<KanjiQuizSubmitResponse>(`/api/content/kanji/${kanjiId}?resource=quiz`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
