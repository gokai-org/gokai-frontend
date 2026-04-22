import { apiFetch } from "@/shared/lib/api/client";
import type {
  GrammarLessonSummary,
  GrammarLesson,
  GrammarQuizSubmitBody,
  GrammarQuizSubmitResponse,
  GrammarStudyProgress,
  GrammarUnlockResponse,
} from "../types";
import {
  normalizeGrammarLesson,
  normalizeGrammarLessonSummary,
} from "../lib/lessonNormalizer";

const GRAMMAR_PROGRESS_CACHE_TTL_MS = 15_000;

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
export async function submitGrammarQuiz(
  grammarId: string,
  body: GrammarQuizSubmitBody,
) {
  return apiFetch<GrammarQuizSubmitResponse>(
    `/api/content/grammar/quiz/${grammarId}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function getGrammarProgress() {
  const payload = await apiFetch<
    GrammarStudyProgress | { hasUnlocked?: boolean; message?: string }
  >(
    "/api/content/grammar/progress",
    { cache: "no-store" },
    {
      dedupeKey: "/api/content/grammar/progress",
      cacheKey: "/api/content/grammar/progress",
      cacheTtlMs: GRAMMAR_PROGRESS_CACHE_TTL_MS,
    },
  );

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (
    "hasUnlocked" in payload &&
    payload.hasUnlocked === false
  ) {
    return null;
  }

  if (!("grammarId" in payload) || typeof payload.grammarId !== "string") {
    return null;
  }

  return payload as GrammarStudyProgress;
}

export async function unlockGrammar(grammarId: string) {
  return apiFetch<GrammarUnlockResponse>(
    `/api/content/grammar/${grammarId}?resource=unlock`,
    {
      method: "POST",
    },
  );
}
