import type { GrammarLessonSummary, GrammarStudyProgress } from "../types";

export const GRAMMAR_UNLOCK_COST = 35;

export type GrammarUnlockState = {
  latestUnlockedId: string | null;
  latestUnlockedIndex: number;
  completedIds: Set<string>;
  unlockedIds: Set<string>;
  nextUnlockCandidate: GrammarLessonSummary | null;
  nextUnlockCandidateId: string | null;
  canUnlockNext: boolean;
  unlockCost: number;
};

export function resolveGrammarUnlockState({
  lessons,
  progress,
  userPoints,
  unlockCost = GRAMMAR_UNLOCK_COST,
}: {
  lessons: readonly GrammarLessonSummary[];
  progress: GrammarStudyProgress | null;
  userPoints: number;
  unlockCost?: number;
}): GrammarUnlockState {
  const backendLatestUnlockedIndex = progress
    ? lessons.findIndex((lesson) => lesson.id === progress.grammarId)
    : -1;
  const completedIds = new Set<string>();
  const unlockedIds = new Set<string>();

  if (backendLatestUnlockedIndex >= 0) {
    for (const lesson of lessons.slice(0, backendLatestUnlockedIndex + 1)) {
      unlockedIds.add(lesson.id);
    }
    for (const lesson of lessons.slice(0, backendLatestUnlockedIndex)) {
      completedIds.add(lesson.id);
    }
    if (progress?.completed) {
      completedIds.add(progress.grammarId);
    }
  }

  for (const id of completedIds) {
    unlockedIds.add(id);
  }

  let latestUnlockedIndex = backendLatestUnlockedIndex;
  for (let index = 0; index < lessons.length; index += 1) {
    if (unlockedIds.has(lessons[index].id)) {
      latestUnlockedIndex = index;
    }
  }

  let nextUnlockCandidate: GrammarLessonSummary | null = null;
  for (let index = 0; index < lessons.length; index += 1) {
    const lesson = lessons[index];
    if (!unlockedIds.has(lesson.id)) {
      nextUnlockCandidate = lesson;
      break;
    }
  }

  const previousStepCompleted =
    latestUnlockedIndex < 0 ||
    completedIds.has(lessons[latestUnlockedIndex].id);
  const nextUnlockCost = nextUnlockCandidate?.pointsToUnlock ?? unlockCost;
  const canUnlockNext =
    nextUnlockCandidate !== null &&
    previousStepCompleted &&
    userPoints >= nextUnlockCost;

  const latestUnlockedId =
    latestUnlockedIndex >= 0
      ? lessons[latestUnlockedIndex].id
      : progress?.grammarId ?? null;

  return {
    latestUnlockedId,
    latestUnlockedIndex,
    completedIds,
    unlockedIds,
    nextUnlockCandidate,
    nextUnlockCandidateId: nextUnlockCandidate?.id ?? null,
    canUnlockNext,
    unlockCost: nextUnlockCost,
  };
}