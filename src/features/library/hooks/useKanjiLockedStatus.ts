"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Kanji } from "@/features/kanji/types";
import type { KanjiLessonResult } from "@/features/kanji/types";
import { getKanjiLessonResults } from "@/features/kanji/api/kanjiApi";
import { getCurrentUser } from "@/features/auth";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import {
  clearCache,
  KANJI_USER_CACHE_KEY,
  LIBRARY_KANJI_STATUS_CACHE_KEY,
  LIBRARY_STATUS_TTL_MS,
  type LibraryKanjiStatusCache,
  readFreshCache,
  readKnownUserId,
  writeCache,
  writeKnownUserId,
} from "@/shared/lib/progressBootstrapCache";

const KANJI_COMPLETION_SCORE = 70;

export function useKanjiLockedStatus(kanjis: Kanji[]) {
  const knownUserId = readKnownUserId(KANJI_USER_CACHE_KEY);
  const initialCache = useRef<LibraryKanjiStatusCache | null>((() => {
    const cached = readFreshCache<LibraryKanjiStatusCache>(
      LIBRARY_KANJI_STATUS_CACHE_KEY,
      LIBRARY_STATUS_TTL_MS,
    );

    if (!cached) return null;
    if (knownUserId && cached.userId !== knownUserId) return null;
    return cached;
  })()).current;

  const [userPoints, setUserPoints] = useState<number>(
    () => initialCache?.userPoints ?? 0,
  );
  const [results, setResults] = useState<KanjiLessonResult[]>(
    () => initialCache?.results ?? [],
  );
  const [loading, setLoading] = useState(() => initialCache === null);
  const optimisticUserPointsRef = useRef(initialCache?.userPoints ?? 0);
  const activeUserIdRef = useRef<string | null>(initialCache?.userId ?? knownUserId);
  const resultsRef = useRef<KanjiLessonResult[]>(initialCache?.results ?? []);

  const persistStatusCache = useCallback(
    (
      userId: string | null,
      nextUserPoints: number,
      nextResults: KanjiLessonResult[],
    ) => {
      if (!userId) {
        clearCache(LIBRARY_KANJI_STATUS_CACHE_KEY);
        return;
      }

      writeCache<LibraryKanjiStatusCache>(LIBRARY_KANJI_STATUS_CACHE_KEY, {
        userId,
        userPoints: nextUserPoints,
        results: nextResults,
        loadedAt: Date.now(),
      });
    },
    [],
  );

  const applyUserPoints = useCallback(
    (nextUserPoints: number, userId = activeUserIdRef.current) => {
    const mergedUserPoints = Math.max(
      nextUserPoints,
      optimisticUserPointsRef.current,
    );

    optimisticUserPointsRef.current = mergedUserPoints;
    setUserPoints((previous) =>
      previous === mergedUserPoints ? previous : mergedUserPoints,
    );

    persistStatusCache(userId, mergedUserPoints, resultsRef.current);

    return mergedUserPoints;
    },
    [persistStatusCache],
  );

  const fetchPoints = useCallback(async () => {
    let nextPoints = 0;
    let nextResults: KanjiLessonResult[] = [];

    try {
      const [user, lessonResultsResponse] = await Promise.all([
        getCurrentUser().catch(() => null),
        getKanjiLessonResults().catch(() => null),
      ]);

      nextPoints = typeof user?.points === "number" ? user.points : 0;
      nextResults = lessonResultsResponse?.results ?? [];

      const nextUserId = typeof user?.id === "string" ? user.id : null;
      const previousUserId = activeUserIdRef.current;
      const userIdentityChanged = previousUserId !== nextUserId;

      if (userIdentityChanged) {
        optimisticUserPointsRef.current = 0;
      }

      activeUserIdRef.current = nextUserId;
      writeKnownUserId(KANJI_USER_CACHE_KEY, nextUserId);
    } catch {
      nextPoints = 0;
    } finally {
      setLoading(false);
    }

    const mergedUserPoints = applyUserPoints(nextPoints, activeUserIdRef.current);
    resultsRef.current = nextResults;
    setResults(nextResults);
    persistStatusCache(activeUserIdRef.current, mergedUserPoints, nextResults);

    return mergedUserPoints;
  }, [applyUserPoints, persistStatusCache]);

  useEffect(() => {
    void fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        if (typeof detail.points === "number") {
          applyUserPoints(detail.points);
        }
      }),
    [applyUserPoints],
  );

  const lockedKanjiIds = useMemo(() => {
    if (kanjis.length === 0) return new Set<string>();

    const locked = new Set<string>();
    for (const kanji of kanjis) {
      if (userPoints < kanji.pointsToUnlock) {
        locked.add(kanji.id);
      }
    }
    return locked;
  }, [kanjis, userPoints]);

  const completedKanjiIds = useMemo(() => {
    if (results.length === 0) return new Set<string>();

    const bestScoreByKanji = new Map<string, number>();

    for (const result of results) {
      const previousBest = bestScoreByKanji.get(result.kanjiId) ?? 0;
      if (result.score > previousBest) {
        bestScoreByKanji.set(result.kanjiId, result.score);
      }
    }

    const completed = new Set<string>();
    for (const [kanjiId, bestScore] of bestScoreByKanji.entries()) {
      if (bestScore >= KANJI_COMPLETION_SCORE) {
        completed.add(kanjiId);
      }
    }

    return completed;
  }, [results]);

  return {
    lockedKanjiIds,
    completedKanjiIds,
    userPoints,
    loading,
    reload: fetchPoints,
  };
}
