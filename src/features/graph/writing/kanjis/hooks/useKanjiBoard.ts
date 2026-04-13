"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getKanjiLessonResults,
  getPrimaryMeaning,
  listKanjis,
  type Kanji,
  type KanjiLessonResult,
} from "@/features/kanji";
import { getCurrentUser } from "@/features/auth";
import {
  KANJI_COMPLETION_SCORE,
  type KanjiBoardProgress,
  type KanjiBoardSummary,
} from "../types";
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

let kanjiBootstrapCache:
  | {
      userId: string;
      kanjis: Kanji[];
      results: KanjiLessonResult[];
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
  const [userPoints, setUserPoints] = useState<number>(
    () => initialBootstrap?.userPoints ?? 0,
  );
  const [loading, setLoading] = useState(() => initialBootstrap === null);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const hadInitialBootstrapRef = useRef(initialBootstrap !== null);
  const optimisticUserPointsRef = useRef(initialBootstrap?.userPoints ?? 0);
  const resultsRef = useRef<KanjiLessonResult[]>(initialBootstrap?.results ?? []);
  const activeUserIdRef = useRef<string | null>(initialBootstrap?.userId ?? knownUserId);

  const persistSharedStatusCache = useCallback(
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

  const persistSharedContentCache = useCallback((nextKanjis: Kanji[]) => {
    const nextContent = mergeLibraryContentCache(
      readCache<LibraryContentCache>(LIBRARY_CONTENT_CACHE_KEY),
      { kanjis: nextKanjis },
    );

    writeCache(LIBRARY_CONTENT_CACHE_KEY, nextContent);
  }, []);

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

      if (
        userId &&
        kanjiBootstrapCache &&
        kanjiBootstrapCache.userId === userId
      ) {
        kanjiBootstrapCache = {
          ...kanjiBootstrapCache,
          userPoints: mergedUserPoints,
          loadedAt: Date.now(),
        };
      }

      persistSharedStatusCache(userId, mergedUserPoints, resultsRef.current);

      return mergedUserPoints;
    },
    [persistSharedStatusCache],
  );

  const reload = useCallback(async () => {
    if (!hasLoadedOnceRef.current && !hadInitialBootstrapRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const [kanjiPayload, resultsPayload, user] = await Promise.all([
        listKanjis(),
        getKanjiLessonResults({ limit: 100 }).catch(() => []),
        getCurrentUser().catch(() => null),
      ]);

      const nextKanjis = normalizeKanjis(kanjiPayload);
      const nextResults = normalizeResults(resultsPayload);
    resultsRef.current = nextResults;
      const nextUserId = typeof user?.id === "string" ? user.id : null;
      const previousUserId = activeUserIdRef.current;
      const userChanged = previousUserId !== null && nextUserId !== previousUserId;
      const userIdentityChanged = previousUserId !== nextUserId;

      if (userIdentityChanged) {
        optimisticUserPointsRef.current = 0;
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
          userPoints: nextUserPoints,
          loadedAt: Date.now(),
        };
        persistSharedStatusCache(nextUserId, nextUserPoints, nextResults);
      } else {
        kanjiBootstrapCache = null;
        clearCache(LIBRARY_KANJI_STATUS_CACHE_KEY);
      }

      setKanjis(nextKanjis);
      setResults(nextResults);
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
          applyUserPoints(detail.points);
        }
      }),
    [applyUserPoints],
  );

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

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

  const items = useMemo(() => {
    return kanjis.map<KanjiBoardProgress>((kanji, index) => {
      const resultData = resultsByKanji.get(kanji.id);
      const bestScore = resultData?.bestScore ?? null;
      const isCompleted =
        bestScore !== null && bestScore >= KANJI_COMPLETION_SCORE;
      const isUnlocked = userPoints >= kanji.pointsToUnlock;
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
      };
    });
  }, [kanjis, resultsByKanji, userPoints]);

  const summary = useMemo(() => buildSummary(items), [items]);

  return {
    items,
    summary,
    userPoints,
    loading,
    error,
    reload,
  };
}
