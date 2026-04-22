"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Kanji } from "@/features/kanji/types";
import type { KanjiLessonResult, KanjiStudyProgress } from "@/features/kanji/types";
import { getKanjiLessonResults, getKanjiProgress } from "@/features/kanji/api/kanjiApi";
import { getCurrentUser } from "@/features/auth";
import { resolveKanjiUnlockState } from "@/features/kanji/lib/kanjiUnlockState";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import {
  clearCache,
  KANJI_USER_CACHE_KEY,
  LIBRARY_KANJI_STATUS_CACHE_KEY,
  type LibraryKanjiStatusCache,
  readCache,
  readKnownUserId,
  writeCache,
  writeKnownUserId,
} from "@/shared/lib/progressBootstrapCache";

const KANJI_COMPLETION_SCORE = 70;
const KANJI_POINTS_SYNC_TTL_MS = 30_000;

export function useKanjiLockedStatus(kanjis: Kanji[]) {
  const knownUserId = readKnownUserId(KANJI_USER_CACHE_KEY);
  const initialCache = useRef<LibraryKanjiStatusCache | null>((() => {
    const cached = readCache<LibraryKanjiStatusCache>(
      LIBRARY_KANJI_STATUS_CACHE_KEY,
    );

    if (!cached) return null;
    if (knownUserId && cached.userId !== knownUserId) return null;
    return cached;
  })()).current;
  const hasInitialCache = initialCache !== null;

  const [userPoints, setUserPoints] = useState<number>(
    () => initialCache?.userPoints ?? 0,
  );
  const [results, setResults] = useState<KanjiLessonResult[]>(
    () => initialCache?.results ?? [],
  );
  const [progress, setProgress] = useState<KanjiStudyProgress | null>(
    () => initialCache?.progress ?? null,
  );
  const [loading, setLoading] = useState(() => initialCache === null);
  const [hasResolvedInitialStatus, setHasResolvedInitialStatus] = useState(
    hasInitialCache,
  );
  const optimisticUserPointsRef = useRef<number | null>(null);
  const optimisticUserPointsExpiryRef = useRef(0);
  const activeUserIdRef = useRef<string | null>(initialCache?.userId ?? knownUserId);
  const resultsRef = useRef<KanjiLessonResult[]>(initialCache?.results ?? []);
  const progressRef = useRef<KanjiStudyProgress | null>(initialCache?.progress ?? null);

  const persistStatusCache = useCallback(
    (
      userId: string | null,
      nextUserPoints: number,
      nextResults: KanjiLessonResult[],
      nextProgress: KanjiStudyProgress | null,
    ) => {
      if (!userId) {
        clearCache(LIBRARY_KANJI_STATUS_CACHE_KEY);
        return;
      }

      writeCache<LibraryKanjiStatusCache>(LIBRARY_KANJI_STATUS_CACHE_KEY, {
        userId,
        userPoints: nextUserPoints,
        results: nextResults,
        progress: nextProgress,
        loadedAt: Date.now(),
      });
    },
    [],
  );

  const applyUserPoints = useCallback(
    (
      nextUserPoints: number,
      userId = activeUserIdRef.current,
      options?: { optimistic?: boolean },
    ) => {
      let resolvedUserPoints = nextUserPoints;

      if (options?.optimistic) {
        optimisticUserPointsRef.current = nextUserPoints;
        optimisticUserPointsExpiryRef.current =
          Date.now() + KANJI_POINTS_SYNC_TTL_MS;
      } else if (optimisticUserPointsRef.current !== null) {
        const stillPinned = Date.now() < optimisticUserPointsExpiryRef.current;

        if (!stillPinned || optimisticUserPointsRef.current === nextUserPoints) {
          optimisticUserPointsRef.current = null;
          optimisticUserPointsExpiryRef.current = 0;
        } else {
          resolvedUserPoints = optimisticUserPointsRef.current;
        }
      }

      setUserPoints((previous) =>
        previous === resolvedUserPoints ? previous : resolvedUserPoints,
      );

      persistStatusCache(
        userId,
        resolvedUserPoints,
        resultsRef.current,
        progressRef.current,
      );

      return resolvedUserPoints;
    },
    [persistStatusCache],
  );

  const fetchPoints = useCallback(async () => {
    let nextPoints = 0;
    let nextResults: KanjiLessonResult[] = [];
    let nextProgress: KanjiStudyProgress | null = null;

    try {
      const [user, lessonResultsResponse, progressResponse] = await Promise.all([
        getCurrentUser().catch(() => null),
        getKanjiLessonResults({ limit: 100 }).catch(() => null),
        getKanjiProgress().catch(() => null),
      ]);

      nextPoints = typeof user?.points === "number" ? user.points : 0;
      nextResults = lessonResultsResponse?.results ?? [];
      nextProgress = progressResponse;

      const nextUserId = typeof user?.id === "string" ? user.id : null;
      const previousUserId = activeUserIdRef.current;
      const userIdentityChanged = previousUserId !== nextUserId;

      if (userIdentityChanged) {
        optimisticUserPointsRef.current = null;
        optimisticUserPointsExpiryRef.current = 0;
      }

      activeUserIdRef.current = nextUserId;
      writeKnownUserId(KANJI_USER_CACHE_KEY, nextUserId);
    } catch {
      nextPoints = 0;
    } finally {
      setLoading(false);
      setHasResolvedInitialStatus(true);
    }

    const mergedUserPoints = applyUserPoints(nextPoints, activeUserIdRef.current);
    resultsRef.current = nextResults;
    progressRef.current = nextProgress;
    setResults(nextResults);
    setProgress(nextProgress);
    persistStatusCache(
      activeUserIdRef.current,
      mergedUserPoints,
      nextResults,
      nextProgress,
    );

    return mergedUserPoints;
  }, [applyUserPoints, persistStatusCache]);

  useEffect(() => {
    void fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        if (typeof detail.points === "number") {
          applyUserPoints(detail.points, activeUserIdRef.current, {
            optimistic: true,
          });
        }
      }),
    [applyUserPoints],
  );

  const unlockState = useMemo(
    () =>
      resolveKanjiUnlockState({
        kanjis,
        results,
        progress,
        userPoints,
        completionScore: KANJI_COMPLETION_SCORE,
      }),
    [kanjis, progress, results, userPoints],
  );

  const lockedKanjiIds = useMemo(() => {
    const locked = new Set<string>();

    for (const kanji of kanjis) {
      if (!unlockState.unlockedIds.has(kanji.id)) {
        locked.add(kanji.id);
      }
    }

    return locked;
  }, [kanjis, unlockState.unlockedIds]);

  const completedKanjiIds = useMemo(
    () => unlockState.completedIds,
    [unlockState.completedIds],
  );

  return {
    lockedKanjiIds,
    completedKanjiIds,
    nextUnlockCandidateId: unlockState.nextUnlockCandidateId,
    canUnlockNext: unlockState.canUnlockNext,
    unlockCost: unlockState.unlockCost,
    progress,
    userPoints,
    loading,
    hasResolvedInitialStatus,
    reload: fetchPoints,
  };
}
