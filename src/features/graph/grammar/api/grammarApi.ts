import { apiFetch } from "@/shared/lib/api/client";
import type {
  GrammarLessonSummary,
  GrammarLesson,
  GrammarQuizSubmitBody,
} from "../types";

/** Fetches all grammar lessons (summary list). */
export function listGrammarLessons() {
  return apiFetch<GrammarLessonSummary[]>("/api/content/grammar", {
    cache: "no-store",
  });
}

/** Fetches full grammar lesson by id. */
export function getGrammarLesson(id: string) {
  return apiFetch<GrammarLesson>(`/api/content/grammar/${id}`, {
    cache: "no-store",
  });
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
