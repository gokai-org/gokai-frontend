import { apiFetch } from "@/shared/lib/api/client";
import type {
  AdminGrammarLesson,
  AdminGrammarLessonSummary,
} from "../types/grammar";
import {
  normalizeAdminGrammarLesson,
  normalizeAdminGrammarLessonSummary,
  serializeAdminGrammarLesson,
  toAdminGrammarLessonSummary,
} from "../utils/grammarMappers";

function normalizeArrayResponse<T>(response: T[] | null | undefined) {
  return Array.isArray(response) ? response : [];
}

export async function getAdminGrammarLessons() {
  const response = normalizeArrayResponse(
    await apiFetch<unknown[] | null>("/admin/api/grammar"),
  );

  const baseSummaries = response
    .map(normalizeAdminGrammarLessonSummary)
    .filter((lesson): lesson is AdminGrammarLessonSummary => lesson !== null);

  const detailedResults = await Promise.allSettled(
    baseSummaries.map((lesson) =>
      apiFetch<unknown>(`/admin/api/grammar/${lesson.id}`).then(normalizeAdminGrammarLesson),
    ),
  );

  return baseSummaries.map((lesson, index) => {
    const detailedResult = detailedResults[index];

    if (detailedResult?.status === "fulfilled") {
      return toAdminGrammarLessonSummary(detailedResult.value);
    }

    return lesson;
  });
}

export async function getAdminGrammarLesson(id: string) {
  const response = await apiFetch<unknown>(`/admin/api/grammar/${id}`);
  return normalizeAdminGrammarLesson(response);
}

export function updateAdminGrammarLesson(
  id: string,
  payload: AdminGrammarLesson,
) {
  return apiFetch<AdminGrammarLesson>(`/admin/api/grammar/${id}`, {
    method: "PUT",
    body: JSON.stringify(serializeAdminGrammarLesson(payload)),
  });
}