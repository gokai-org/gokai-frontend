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

  const raw = await apiFetch<KanjiQuizResponseRaw>(
    `/api/content/kanji/${kanjiId}?${params.toString()}`,
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
  console.warn("[KANJI QUIZ POST] submitKanjiQuiz called", { kanjiId, body });
  console.trace("[KANJI QUIZ POST] call stack");
  return apiFetch<{ success: boolean }>(`/api/content/kanji/${kanjiId}?resource=quiz`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
