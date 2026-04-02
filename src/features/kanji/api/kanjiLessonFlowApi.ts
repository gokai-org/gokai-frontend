import { apiFetch } from "@/shared/lib/api/client";
import type {
  KanjiLessonBlockPayload,
  KanjiLessonBlockSubmission,
  KanjiLessonFlowData,
} from "@/features/kanji/types/lessonFlow";
import { getMockKanjiLessonFlow } from "../mock/mockLessonFlow";

/* ── Feature flag: toggle between mock and real backend ── */
const USE_MOCK = true;

export async function getKanjiLessonFlow(
  kanjiId: string,
  symbol: string,
  meanings: string[],
  readings: string[],
): Promise<KanjiLessonFlowData> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    return getMockKanjiLessonFlow(kanjiId, symbol, meanings, readings);
  }

  return apiFetch<KanjiLessonFlowData>(
    `/api/content/kanji/${kanjiId}/lesson-flow`,
    { cache: "no-store" },
  );
}

export async function getKanjiLessonExercise(
  kanjiId: string,
  exerciseType: string,
): Promise<KanjiLessonBlockPayload> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const flow = getMockKanjiLessonFlow(kanjiId, "八", ["Ocho; 8"], ["はち", "ハチ"]);
    const block = flow.exercises.find((e: KanjiLessonBlockPayload) => e.type === exerciseType);
    if (!block) throw new Error(`Exercise type "${exerciseType}" not found`);
    return block;
  }

  return apiFetch<KanjiLessonBlockPayload>(
    `/api/content/kanji/${kanjiId}/lesson-flow/exercise?type=${exerciseType}`,
    { cache: "no-store" },
  );
}

export async function submitKanjiLessonExerciseResult(
  body: KanjiLessonBlockSubmission,
): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    console.log("[MOCK] submitKanjiLessonExerciseResult:", body);
    return { success: true };
  }

  return apiFetch<{ success: boolean }>(
    "/api/user/kanji-lessons/exercise-results",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}
