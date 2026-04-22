"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getKanjiLessonResults,
  getKanjiProgress,
  getPrimaryMeaning,
  listKanjis,
  type Kanji,
  type KanjiLessonResult,
  type KanjiStudyProgress,
} from "@/features/kanji";
import { invalidateApiCache } from "@/shared/lib/api/client";
import { getCurrentUser } from "@/features/auth";
import {
  KANJI_COMPLETION_SCORE,
  type KanjiBoardProgress,
  type KanjiBoardSummary,
} from "../types";
import { resolveKanjiUnlockState } from "@/features/kanji/lib/kanjiUnlockState";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import {
  clearCache,
  KANJI_USER_CACHE_KEY,
  LIBRARY_CONTENT_CACHE_KEY,
  LIBRARY_CONTENT_TTL_MS,
  LIBRARY_KANJI_STATUS_CACHE_KEY,
  LIBRARY_STATUS_TTL_MS,
  mergeLibraryContentCache,
  type LibraryContentCache,
  type LibraryKanjiStatusCache,
  readCache,
  readFreshCache,
  readKnownUserId,
  writeCache,
  writeKnownUserId,
} from "@/shared/lib/progressBootstrapCache";

const KANJI_BOOTSTRAP_TTL_MS = 30_000;
const KANJI_POINTS_SYNC_TTL_MS = 30_000;

let kanjiBootstrapCache:
  | {
      userId: string;
      kanjis: Kanji[];
      results: KanjiLessonResult[];
      progress: KanjiStudyProgress | null;
      userPoints: number;
      loadedAt: number;
    }
  | null = null;

function isFresh(loadedAt: number) {
  return Date.now() - loadedAt < KANJI_BOOTSTRAP_TTL_MS;
}

function normalizeKanjis(payload: unknown): Kanji[] {
  if (Array.isArray(payload)) {
    return payload as Kanji[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as {
      kanjis?: unknown;
      items?: unknown;
      data?: unknown;
    };

    if (Array.isArray(candidate.kanjis)) return candidate.kanjis as Kanji[];
    if (Array.isArray(candidate.items)) return candidate.items as Kanji[];
    if (Array.isArray(candidate.data)) return candidate.data as Kanji[];
  }

  return [];
}

function normalizeResults(payload: unknown): KanjiLessonResult[] {
  if (Array.isArray(payload)) {
    return payload as KanjiLessonResult[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as {
      results?: unknown;
      data?: unknown;
      items?: unknown;
    };

    if (Array.isArray(candidate.results)) {
      return candidate.results as KanjiLessonResult[];
    }
    if (Array.isArray(candidate.data)) {
      return candidate.data as KanjiLessonResult[];
    }
    if (Array.isArray(candidate.items)) {
      return candidate.items as KanjiLessonResult[];
    }
  }

  return [];
}

function buildSummary(items: KanjiBoardProgress[]): KanjiBoardSummary {
  const completedCount = items.filter(
    (item) => item.status === "completed",
  ).length;
  const availableCount = items.filter(
    (item) => item.status === "available",
  ).length;
  const lockedCount = items.filter((item) => item.status === "locked").length;
  const attempts = items.filter((item) => item.bestScore !== null);
  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((acc, item) => acc + (item.bestScore ?? 0), 0) /
            attempts.length,
        )
      : 0;

  let consecutiveCompletedCount = 0;
  for (const item of items) {
    if (item.status !== "completed") break;
    consecutiveCompletedCount += 1;
  }

  return {
    totalCount: items.length,
    completedCount,
    availableCount,
    lockedCount,
    completionRate:
      items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
    averageScore,
    currentKanjiId:
      items.find((item) => item.status === "available")?.id ??
      items.at(-1)?.id ??
      null,
    consecutiveCompletedCount,
  };
}

export function useKanjiBoard() {
  const knownUserId = readKnownUserId(KANJI_USER_CACHE_KEY);
  const sharedContentCache = readFreshCache<LibraryContentCache>(
    LIBRARY_CONTENT_CACHE_KEY,
    LIBRARY_CONTENT_TTL_MS,
  );
  const sharedStatusCache = readFreshCache<LibraryKanjiStatusCache>(
    LIBRARY_KANJI_STATUS_CACHE_KEY,
    LIBRARY_STATUS_TTL_MS,
  );
  const initialBootstrapRef = useRef(
    kanjiBootstrapCache &&
    knownUserId &&
    kanjiBootstrapCache.userId === knownUserId &&
    isFresh(kanjiBootstrapCache.loadedAt)
      ? kanjiBootstrapCache
      : sharedStatusCache &&
          sharedContentCache &&
          knownUserId &&
          sharedStatusCache.userId === knownUserId
        ? {
            userId: sharedStatusCache.userId,
            kanjis: sharedContentCache.kanjis,
            results: sharedStatusCache.results,
            progress: sharedStatusCache.progress ?? null,
            userPoints: sharedStatusCache.userPoints,
            loadedAt: Math.max(
              sharedStatusCache.loadedAt,
              sharedContentCache.loadedAt,
            ),
          }
      : null,
  );
  const initialBootstrap = initialBootstrapRef.current;

  const [kanjis, setKanjis] = useState<Kanji[]>(() => initialBootstrap?.kanjis ?? []);
  const [results, setResults] = useState<KanjiLessonResult[]>(() => initialBootstrap?.results ?? []);
  const [progress, setProgress] = useState<KanjiStudyProgress | null>(
    () => initialBootstrap?.progress ?? null,
  );
  const [userPoints, setUserPoints] = useState<number>(
    () => initialBootstrap?.userPoints ?? 0,
  );
  const [loading, setLoading] = useState(() => initialBootstrap === null);
  const [error, setError] = useState<string | null>(null);
  const [recentlyUnlockedIds, setRecentlyUnlockedIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const hasLoadedOnceRef = useRef(false);
  const hadInitialBootstrapRef = useRef(initialBootstrap !== null);
  const optimisticUserPointsRef = useRef<number | null>(null);
  const optimisticUserPointsExpiryRef = useRef(0);
  const resultsRef = useRef<KanjiLessonResult[]>(initialBootstrap?.results ?? []);
  const progressRef = useRef<KanjiStudyProgress | null>(initialBootstrap?.progress ?? null);
  const activeUserIdRef = useRef<string | null>(initialBootstrap?.userId ?? knownUserId);

  const persistSharedStatusCache = useCallback(
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

  const persistSharedContentCache = useCallback((nextKanjis: Kanji[]) => {
    const nextContent = mergeLibraryContentCache(
      readCache<LibraryContentCache>(LIBRARY_CONTENT_CACHE_KEY),
      { kanjis: nextKanjis },
    );

    writeCache(LIBRARY_CONTENT_CACHE_KEY, nextContent);
  }, []);

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

      if (
        userId &&
        kanjiBootstrapCache &&
        kanjiBootstrapCache.userId === userId
      ) {
        kanjiBootstrapCache = {
          ...kanjiBootstrapCache,
          userPoints: resolvedUserPoints,
          loadedAt: Date.now(),
        };
      }

      persistSharedStatusCache(
        userId,
        resolvedUserPoints,
        resultsRef.current,
        progressRef.current,
      );

      return resolvedUserPoints;
    },
    [persistSharedStatusCache],
  );

  const reload = useCallback(async () => {
    if (!hasLoadedOnceRef.current && !hadInitialBootstrapRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const [kanjiPayload, resultsPayload, progressPayload, user] = await Promise.all([
        listKanjis(),
        getKanjiLessonResults({ limit: 100 }).catch(() => []),
        getKanjiProgress().catch(() => null),
        getCurrentUser().catch(() => null),
      ]);

      const nextKanjis = normalizeKanjis(kanjiPayload);
      const nextResults = normalizeResults(resultsPayload);
      const nextProgress = progressPayload;
      resultsRef.current = nextResults;
      progressRef.current = nextProgress;
      const nextUserId = typeof user?.id === "string" ? user.id : null;
      const previousUserId = activeUserIdRef.current;
      const userChanged = previousUserId !== null && nextUserId !== previousUserId;
      const userIdentityChanged = previousUserId !== nextUserId;

      if (userIdentityChanged) {
        optimisticUserPointsRef.current = null;
        optimisticUserPointsExpiryRef.current = 0;
      }

      activeUserIdRef.current = nextUserId;
      writeKnownUserId(KANJI_USER_CACHE_KEY, nextUserId);
      const nextUserPoints = applyUserPoints(
        typeof user?.points === "number"
          ? user.points
          : 0,
        nextUserId,
      );

      if (nextUserId) {
        kanjiBootstrapCache = {
          userId: nextUserId,
          kanjis: nextKanjis,
          results: nextResults,
          progress: nextProgress,
          userPoints: nextUserPoints,
          loadedAt: Date.now(),
        };
        persistSharedStatusCache(
          nextUserId,
          nextUserPoints,
          nextResults,
          nextProgress,
        );
      } else {
        kanjiBootstrapCache = null;
        clearCache(LIBRARY_KANJI_STATUS_CACHE_KEY);
      }

      setKanjis(nextKanjis);
      setResults(nextResults);
      setProgress(nextProgress);
      persistSharedContentCache(nextKanjis);
      if (userChanged && nextResults.length === 0) {
        setResults([]);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No fue posible cargar la constelación de kanjis.";

      setError(message);
      if (!kanjiBootstrapCache) {
        setKanjis([]);
        setResults([]);
      }
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
    }
  }, [applyUserPoints, persistSharedContentCache, persistSharedStatusCache]);

  useEffect(() => {
    void reload();
  }, [reload]);

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

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const resultsByKanji = useMemo(() => {
    const byKanji = new Map<
      string,
      {
        bestScore: number;
        attemptCount: number;
        bestResult: KanjiLessonResult | null;
      }
    >();

    for (const result of results) {
      const current = byKanji.get(result.kanjiId);
      if (!current) {
        byKanji.set(result.kanjiId, {
          bestScore: result.score,
          attemptCount: 1,
          bestResult: result,
        });
        continue;
      }

      const nextBestResult =
        result.score >= current.bestScore ? result : current.bestResult;
      byKanji.set(result.kanjiId, {
        bestScore: Math.max(current.bestScore, result.score),
        attemptCount: current.attemptCount + 1,
        bestResult: nextBestResult,
      });
    }

    return byKanji;
  }, [results]);

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

  const items = useMemo(() => {
    return kanjis.map<KanjiBoardProgress>((kanji, index) => {
      const resultData = resultsByKanji.get(kanji.id);
      const bestScore = resultData?.bestScore ?? null;
      const isCompleted = unlockState.completedIds.has(kanji.id);
      const isUnlocked = unlockState.unlockedIds.has(kanji.id);
      const canUnlock = unlockState.nextUnlockCandidateId === kanji.id;
      const status = isCompleted
        ? "completed"
        : isUnlocked
          ? "available"
          : "locked";

      return {
        id: kanji.id,
        index,
        kanji,
        primaryMeaning: getPrimaryMeaning(kanji.meanings) || "Sin significado",
        bestScore,
        attemptCount: resultData?.attemptCount ?? 0,
        status,
        completionScore: KANJI_COMPLETION_SCORE,
        progressPercent: bestScore ?? 0,
        bestResult: resultData?.bestResult ?? null,
        unlocked: isUnlocked,
        canUnlock: canUnlock && unlockState.canUnlockNext,
        unlockCost: kanji.pointsToUnlock,
        isCurrent: progress?.kanjiId === kanji.id,
      };
    });
  }, [kanjis, progress, resultsByKanji, unlockState]);

  const summary = useMemo(() => buildSummary(items), [items]);

  const applyOptimisticUnlock = useCallback(
    (kanjiId: string) => {
      const kanji = kanjis.find((item) => item.id === kanjiId) ?? null;
      const nextProgress: KanjiStudyProgress = {
        kanjiId,
        symbol: kanji?.symbol ?? "",
        pointsToUnlock: kanji?.pointsToUnlock ?? 0,
        exerciseType: progressRef.current?.exerciseType ?? "kanji",
        completed: false,
      };
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      invalidateApiCache("/api/content/kanji/progress");
      invalidateApiCache("/api/content/kanji");

      setRecentlyUnlockedIds((current) => {
        const next = new Set(current);
        next.add(kanjiId);
        return next;
      });
      window.setTimeout(() => {
        setRecentlyUnlockedIds((current) => {
          if (!current.has(kanjiId)) return current;
          const next = new Set(current);
          next.delete(kanjiId);
          return next;
        });
      }, 1500);
    },
    [kanjis],
  );

  return {
    items,
    summary,
    userPoints,
    progress,
    nextUnlockCandidate: unlockState.nextUnlockCandidate,
    canUnlockNext: unlockState.canUnlockNext,
    unlockCost: unlockState.unlockCost,
    latestUnlockedId: unlockState.latestUnlockedId,
    loading,
    error,
    reload,
    applyOptimisticUnlock,
    recentlyUnlockedIds,
  };
}
