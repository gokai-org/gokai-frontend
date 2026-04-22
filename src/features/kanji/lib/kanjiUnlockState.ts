import type {
  Kanji,
  KanjiLessonResult,
  KanjiStudyProgress,
} from "@/features/kanji/types";

export const KANJI_UNLOCK_COST = 30;
const DEFAULT_COMPLETION_SCORE = 70;

export type KanjiUnlockState = {
  completedIds: Set<string>;
  unlockedIds: Set<string>;
  latestUnlockedId: string | null;
  latestUnlockedIndex: number;
  nextUnlockCandidate: Kanji | null;
  nextUnlockCandidateId: string | null;
  canUnlockNext: boolean;
  unlockCost: number;
};

function buildCompletedIds(
  results: readonly KanjiLessonResult[],
  progress: KanjiStudyProgress | null,
  completionScore: number,
) {
  const bestScoreByKanji = new Map<string, number>();

  for (const result of results) {
    const previousBest = bestScoreByKanji.get(result.kanjiId) ?? 0;
    if (result.score > previousBest) {
      bestScoreByKanji.set(result.kanjiId, result.score);
    }
  }

  const completedIds = new Set<string>();
  for (const [kanjiId, bestScore] of bestScoreByKanji.entries()) {
    if (bestScore >= completionScore) {
      completedIds.add(kanjiId);
    }
  }

  if (progress?.completed) {
    completedIds.add(progress.kanjiId);
  }

  return completedIds;
}

export function resolveKanjiUnlockState({
  kanjis,
  results,
  progress,
  userPoints,
  unlockCost = KANJI_UNLOCK_COST,
  completionScore = DEFAULT_COMPLETION_SCORE,
}: {
  kanjis: readonly Kanji[];
  results: readonly KanjiLessonResult[];
  progress: KanjiStudyProgress | null;
  userPoints: number;
  unlockCost?: number;
  completionScore?: number;
}): KanjiUnlockState {
  const completedIds = buildCompletedIds(results, progress, completionScore);

  const backendLatestUnlockedIndex = progress
    ? kanjis.findIndex((kanji) => kanji.id === progress.kanjiId)
    : -1;

  const unlockedIds = new Set<string>();
  if (backendLatestUnlockedIndex >= 0) {
    for (const kanji of kanjis.slice(0, backendLatestUnlockedIndex + 1)) {
      unlockedIds.add(kanji.id);
    }
  }
  for (const id of completedIds) {
    unlockedIds.add(id);
  }

  let latestUnlockedIndex = backendLatestUnlockedIndex;
  for (let index = 0; index < kanjis.length; index += 1) {
    if (unlockedIds.has(kanjis[index].id)) {
      latestUnlockedIndex = index;
    }
  }

  let nextUnlockCandidate: Kanji | null = null;
  for (let index = 0; index < kanjis.length; index += 1) {
    const kanji = kanjis[index];
    if (!unlockedIds.has(kanji.id)) {
      nextUnlockCandidate = kanji;
      break;
    }
  }

  const previousStepCompleted =
    latestUnlockedIndex < 0 ||
    completedIds.has(kanjis[latestUnlockedIndex].id);
  const nextUnlockCost = nextUnlockCandidate?.pointsToUnlock ?? unlockCost;
  const canUnlockNext =
    nextUnlockCandidate !== null &&
    previousStepCompleted &&
    userPoints >= nextUnlockCost;

  const latestUnlockedId =
    latestUnlockedIndex >= 0
      ? kanjis[latestUnlockedIndex].id
      : progress?.kanjiId ?? null;

  return {
    completedIds,
    unlockedIds,
    latestUnlockedId,
    latestUnlockedIndex,
    nextUnlockCandidate,
    nextUnlockCandidateId: nextUnlockCandidate?.id ?? null,
    canUnlockNext,
    unlockCost: nextUnlockCost,
  };
}