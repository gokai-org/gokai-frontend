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
  const latestUnlockedIndex = progress
    ? lessons.findIndex((lesson) => lesson.id === progress.grammarId)
    : -1;
  const completedIds = new Set<string>();
  const unlockedIds = new Set<string>();

  if (latestUnlockedIndex >= 0) {
    for (const lesson of lessons.slice(0, latestUnlockedIndex + 1)) {
      unlockedIds.add(lesson.id);
    }

    for (const lesson of lessons.slice(0, latestUnlockedIndex)) {
      completedIds.add(lesson.id);
    }

    if (progress?.completed) {
      completedIds.add(progress.grammarId);
    }
  }

  const nextUnlockCandidate =
    latestUnlockedIndex + 1 < lessons.length
      ? lessons[latestUnlockedIndex + 1]
      : null;
  const previousStepCompleted = latestUnlockedIndex < 0 || progress?.completed === true;
  const nextUnlockCost = nextUnlockCandidate?.pointsToUnlock ?? unlockCost;
  const canUnlockNext =
    nextUnlockCandidate !== null &&
    previousStepCompleted &&
    userPoints >= nextUnlockCost;

  return {
    latestUnlockedId: progress?.grammarId ?? null,
    latestUnlockedIndex,
    completedIds,
    unlockedIds,
    nextUnlockCandidate,
    nextUnlockCandidateId: nextUnlockCandidate?.id ?? null,
    canUnlockNext,
    unlockCost: nextUnlockCost,
  };
}