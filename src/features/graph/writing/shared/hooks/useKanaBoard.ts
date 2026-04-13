"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import { getKanaProgress } from "@/features/kana/api/kanaApi";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import {
  clearCache,
  getCachedKanaCatalogByType,
  KANA_USER_CACHE_KEY,
  LIBRARY_CONTENT_CACHE_KEY,
  LIBRARY_CONTENT_TTL_MS,
  LIBRARY_KANA_STATUS_CACHE_KEY,
  LIBRARY_STATUS_TTL_MS,
  mergeLibraryContentCache,
  type LibraryContentCache,
  type LibraryKanaStatusCache,
  readCache,
  readFreshCache,
  readKnownUserId,
  writeCache,
  writeKnownUserId,
} from "@/shared/lib/progressBootstrapCache";
import type {
  Kana,
  KanaType,
  UserKanaProgressDetailedResponse,
} from "@/features/kana/types";
import { WRITING_COMPLETION_SCORE } from "../types";
import type { WritingBoardProgress, WritingBoardSummary } from "../types";

const KANA_BOOTSTRAP_TTL_MS = 30_000;

const kanaCatalogCache = new Map<
  KanaType,
  {
    kanas: Kana[];
    loadedAt: number;
  }
>();

let sharedKanaBootstrapCache:
  | {
      userId: string;
      progressItems: UserKanaProgressDetailedResponse[];
      kanaPoints: number;
      loadedAt: number;
    }
  | null = null;

function isFresh(loadedAt: number) {
  return Date.now() - loadedAt < KANA_BOOTSTRAP_TTL_MS;
}

function getKanaProgressPercent(progress?: UserKanaProgressDetailedResponse) {
  if (!progress) return 0;
  if (progress.completed) return 100;

  switch (progress.exerciseType) {
    case "from_romaji":
      return 34;
    case "canvas":
      return 67;
    case "from_kana":
    default:
      return 0;
  }
}

function buildSummary(items: WritingBoardProgress[]): WritingBoardSummary {
  const completedCount = items.filter((i) => i.status === "completed").length;
  const availableCount = items.filter((i) => i.status === "available").length;
  const lockedCount = items.filter((i) => i.status === "locked").length;
  const attempts = items.filter((i) => i.bestScore !== null);
  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((acc, i) => acc + (i.bestScore ?? 0), 0) /
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
      items.length > 0
        ? Math.round((completedCount / items.length) * 100)
        : 0,
    averageScore,
    currentItemId:
      items.find((i) => i.status === "available")?.id ??
      items.at(-1)?.id ??
      null,
    consecutiveCompletedCount,
  };
}

type KanaFallbackItem = {
  id: string;
  symbol: string;
  romaji: string;
  pointsToUnlock: number;
};

type UseKanaBoardParams = {
  kanaType: KanaType;
  listKanas: () => Promise<Kana[] | null>;
  fallbackData: KanaFallbackItem[];
  errorMessage: string;
};

export type KanaLookupMap = ReadonlyMap<string, Kana>;

export function useKanaBoard({
  kanaType,
  listKanas,
  fallbackData,
  errorMessage,
}: UseKanaBoardParams) {
  const knownUserId = readKnownUserId(KANA_USER_CACHE_KEY);
  const sharedContentCache = readFreshCache<LibraryContentCache>(
    LIBRARY_CONTENT_CACHE_KEY,
    LIBRARY_CONTENT_TTL_MS,
  );
  const sharedStatusCache = readFreshCache<LibraryKanaStatusCache>(
    LIBRARY_KANA_STATUS_CACHE_KEY,
    LIBRARY_STATUS_TTL_MS,
  );
  const cachedCatalog = kanaCatalogCache.get(kanaType);
  const initialKanas =
    cachedCatalog && isFresh(cachedCatalog.loadedAt)
      ? cachedCatalog.kanas
      : getCachedKanaCatalogByType(sharedContentCache, kanaType);
  const initialSharedBootstrap =
    sharedKanaBootstrapCache &&
    knownUserId &&
    sharedKanaBootstrapCache.userId === knownUserId &&
    isFresh(sharedKanaBootstrapCache.loadedAt)
      ? sharedKanaBootstrapCache
      : sharedStatusCache &&
          knownUserId &&
          sharedStatusCache.userId === knownUserId
        ? {
            userId: sharedStatusCache.userId,
            progressItems: sharedStatusCache.progressItems,
            kanaPoints: sharedStatusCache.userKanaPoints,
            loadedAt: sharedStatusCache.loadedAt,
          }
        : null;

  const [kanas, setKanas] = useState<Kana[]>(() => initialKanas);
  const [userKanaPoints, setUserKanaPoints] = useState<number>(
    () => initialSharedBootstrap?.kanaPoints ?? 0,
  );
  const [progressItems, setProgressItems] = useState<
    UserKanaProgressDetailedResponse[]
  >(() =>
    initialSharedBootstrap?.progressItems.filter(
      (item) => item.kanaType === kanaType,
    ) ?? [],
  );
  const [loading, setLoading] = useState(() => initialSharedBootstrap === null);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const optimisticUserKanaPointsRef = useRef(
    initialSharedBootstrap?.kanaPoints ?? 0,
  );
  const allProgressItemsRef = useRef<UserKanaProgressDetailedResponse[]>(
    initialSharedBootstrap?.progressItems ?? [],
  );
  const activeUserIdRef = useRef<string | null>(initialSharedBootstrap?.userId ?? knownUserId);

  // Use refs to avoid re-creating reload when these change every render.
  const listKanasRef = useRef(listKanas);
  listKanasRef.current = listKanas;
  const errorMessageRef = useRef(errorMessage);
  errorMessageRef.current = errorMessage;
  const hasFallbackDataRef = useRef(fallbackData.length > 0);
  hasFallbackDataRef.current = fallbackData.length > 0;

  const persistSharedStatusCache = useCallback(
    (
      userId: string | null,
      nextKanaPoints: number,
      nextProgressItems: UserKanaProgressDetailedResponse[],
    ) => {
      if (!userId) {
        clearCache(LIBRARY_KANA_STATUS_CACHE_KEY);
        return;
      }

      writeCache<LibraryKanaStatusCache>(LIBRARY_KANA_STATUS_CACHE_KEY, {
        userId,
        userKanaPoints: nextKanaPoints,
        progressItems: nextProgressItems,
        loadedAt: Date.now(),
      });
    },
    [],
  );

  const persistSharedContentCache = useCallback(
    (nextKanas: Kana[]) => {
      const nextContent = mergeLibraryContentCache(
        readCache<LibraryContentCache>(LIBRARY_CONTENT_CACHE_KEY),
        kanaType === "hiragana"
          ? { hiraganas: nextKanas }
          : { katakanas: nextKanas },
      );

      writeCache(LIBRARY_CONTENT_CACHE_KEY, nextContent);
    },
    [kanaType],
  );

  const applyUserKanaPoints = useCallback(
    (nextUserKanaPoints: number, userId = activeUserIdRef.current) => {
      const mergedUserKanaPoints = Math.max(
        nextUserKanaPoints,
        optimisticUserKanaPointsRef.current,
      );

      optimisticUserKanaPointsRef.current = mergedUserKanaPoints;
      setUserKanaPoints((previous) =>
        previous === mergedUserKanaPoints ? previous : mergedUserKanaPoints,
      );

      if (
        userId &&
        sharedKanaBootstrapCache &&
        sharedKanaBootstrapCache.userId === userId
      ) {
        sharedKanaBootstrapCache = {
          ...sharedKanaBootstrapCache,
          kanaPoints: mergedUserKanaPoints,
          loadedAt: Date.now(),
        };
      }

      persistSharedStatusCache(
        userId,
        mergedUserKanaPoints,
        allProgressItemsRef.current,
      );

      return mergedUserKanaPoints;
    },
    [persistSharedStatusCache],
  );

  const reload = useCallback(async () => {
    if (!hasLoadedOnceRef.current && !hasFallbackDataRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const [kanaList, progressList, user] = await Promise.all([
        listKanasRef.current().catch(() => null),
        getKanaProgress().catch(() => null),
        getCurrentUser().catch(() => null),
      ]);

      const nextUserId = typeof user?.id === "string" ? user.id : null;
      const previousUserId = activeUserIdRef.current;
      const userChanged = previousUserId !== null && nextUserId !== previousUserId;
      const userIdentityChanged = previousUserId !== nextUserId;

      if (userIdentityChanged) {
        optimisticUserKanaPointsRef.current = 0;
      }

      activeUserIdRef.current = nextUserId;
      writeKnownUserId(KANA_USER_CACHE_KEY, nextUserId);

      const nextKanaPoints = applyUserKanaPoints(
        typeof user?.kanaPoints === "number"
          ? user.kanaPoints
          : 0,
        nextUserId,
      );
      const nextProgressItems = progressList ?? [];
      allProgressItemsRef.current = nextProgressItems;

      if (nextUserId) {
        sharedKanaBootstrapCache = {
          userId: nextUserId,
          progressItems: nextProgressItems,
          kanaPoints: nextKanaPoints,
          loadedAt: Date.now(),
        };
        persistSharedStatusCache(nextUserId, nextKanaPoints, nextProgressItems);
      } else {
        sharedKanaBootstrapCache = null;
        clearCache(LIBRARY_KANA_STATUS_CACHE_KEY);
      }

      if (kanaList && kanaList.length > 0) {
        setKanas(kanaList);
        kanaCatalogCache.set(kanaType, {
          kanas: kanaList,
          loadedAt: Date.now(),
        });
        persistSharedContentCache(kanaList);
      }

      if (progressList) {
        setProgressItems(
          nextProgressItems.filter((item) => item.kanaType === kanaType),
        );
      } else if (userChanged || nextUserId === null) {
        allProgressItemsRef.current = [];
        setProgressItems([]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : errorMessageRef.current;
      setError(message);
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
    }
  }, [applyUserKanaPoints, kanaType, persistSharedContentCache, persistSharedStatusCache]); // kanaType is a stable string constant — safe as only dep

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        if (typeof detail.kanaPoints === "number") {
          applyUserKanaPoints(detail.kanaPoints);
        }
      }),
    [applyUserKanaPoints],
  );

  const progressById = useMemo(() => {
    const map = new Map<string, UserKanaProgressDetailedResponse>();
    for (const item of progressItems) {
      map.set(item.kanaId, item);
    }
    return map;
  }, [progressItems]);

  const items = useMemo(() => {
    const source =
      kanas.length > 0
        ? kanas.map((kana) => ({
            id: kana.id,
            symbol: kana.symbol,
            romaji: kana.romaji ?? "",
            pointsToUnlock: kana.pointsToUnlock,
          }))
        : fallbackData;

    return source.map<WritingBoardProgress>((kana, index) => {
      const progress = progressById.get(kana.id);
      const isLocked = userKanaPoints < kana.pointsToUnlock;
      const status = progress?.completed
        ? "completed"
        : isLocked
          ? "locked"
          : "available";

      return {
        id: kana.id,
        index,
        symbol: kana.symbol,
        romaji: kana.romaji,
        unlockPoints: kana.pointsToUnlock,
        bestScore: null,
        attemptCount: progress?.completed ? 1 : 0,
        status,
        completionScore: WRITING_COMPLETION_SCORE,
        progressPercent: getKanaProgressPercent(progress),
      };
    });
  }, [fallbackData, kanas, progressById, userKanaPoints]);

  const kanaMap: KanaLookupMap = useMemo(() => {
    const map = new Map<string, Kana>();
    for (const kana of kanas) map.set(kana.id, kana);
    return map;
  }, [kanas]);

  const summary = useMemo(() => buildSummary(items), [items]);

  return {
    items,
    summary,
    userPoints: userKanaPoints,
    loading,
    error,
    reload,
    kanaMap,
  };
}