import { apiFetch } from "@/shared/lib/api/client";
import type {
  GrammarLessonSummary,
  GrammarLesson,
  GrammarQuizSubmitBody,
} from "../types";
import {
  normalizeGrammarLesson,
  normalizeGrammarLessonSummary,
} from "../lib/lessonNormalizer";

/** Fetches all grammar lessons (summary list). */
export async function listGrammarLessons() {
  const response = await apiFetch<unknown>("/api/content/grammar", {
    cache: "no-store",
  });

  const payload = Array.isArray(response)
    ? response
    : Array.isArray((response as { data?: unknown[] } | null)?.data)
      ? ((response as { data: unknown[] }).data)
      : [];

  return payload
    .map(normalizeGrammarLessonSummary)
    .filter((lesson): lesson is GrammarLessonSummary => lesson !== null);
}

/** Fetches full grammar lesson by id. */
export async function getGrammarLesson(id: string) {
  const response = await apiFetch<unknown>(`/api/content/grammar/${id}`, {
    cache: "no-store",
  });

  return normalizeGrammarLesson(response) as GrammarLesson;
}

/** Submits the grammar quiz result. */
export function submitGrammarQuiz(
  grammarId: string,
  body: GrammarQuizSubmitBody,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/content/grammar/quiz/${grammarId}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
