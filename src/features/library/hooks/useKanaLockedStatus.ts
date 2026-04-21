"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import { getKanaProgress } from "@/features/kana/api/kanaApi";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import type { Kana, UserKanaProgressDetailedResponse } from "@/features/kana/types";
import {
  clearCache,
  KANA_USER_CACHE_KEY,
  LIBRARY_KANA_STATUS_CACHE_KEY,
  type LibraryKanaStatusCache,
  readCache,
  readKnownUserId,
  writeCache,
  writeKnownUserId,
} from "@/shared/lib/progressBootstrapCache";

function createProgressMap(items: UserKanaProgressDetailedResponse[]) {
  const map = new Map<string, UserKanaProgressDetailedResponse>();

  for (const item of items) {
    map.set(item.kanaId, item);
  }

  return map;
}

export function useKanaLockedStatus(hiraganas: Kana[], katakanas: Kana[]) {
  const knownUserId = readKnownUserId(KANA_USER_CACHE_KEY);
  const initialCache = useRef<LibraryKanaStatusCache | null>((() => {
    const cached = readCache<LibraryKanaStatusCache>(
      LIBRARY_KANA_STATUS_CACHE_KEY,
    );

    if (!cached) return null;
    if (knownUserId && cached.userId !== knownUserId) return null;
    return cached;
  })()).current;

  const [userKanaPoints, setUserKanaPoints] = useState<number>(
    () => initialCache?.userKanaPoints ?? 0,
  );
  const [progressItems, setProgressItems] = useState<
    UserKanaProgressDetailedResponse[]
  >(() => initialCache?.progressItems ?? []);
  const [loading, setLoading] = useState(() => initialCache === null);
  const [hasResolvedInitialStatus, setHasResolvedInitialStatus] = useState(false);
  const optimisticKanaPointsRef = useRef(initialCache?.userKanaPoints ?? 0);
  const activeUserIdRef = useRef<string | null>(initialCache?.userId ?? knownUserId);
  const progressItemsRef = useRef<UserKanaProgressDetailedResponse[]>(
    initialCache?.progressItems ?? [],
  );

  const persistStatusCache = useCallback(
    (
      userId: string | null,
      nextUserKanaPoints: number,
      nextProgressItems: UserKanaProgressDetailedResponse[],
    ) => {
      if (!userId) {
        clearCache(LIBRARY_KANA_STATUS_CACHE_KEY);
        return;
      }

      writeCache<LibraryKanaStatusCache>(LIBRARY_KANA_STATUS_CACHE_KEY, {
        userId,
        userKanaPoints: nextUserKanaPoints,
        progressItems: nextProgressItems,
        loadedAt: Date.now(),
      });
    },
    [],
  );

  const applyUserKanaPoints = useCallback(
    (nextUserKanaPoints: number, userId = activeUserIdRef.current) => {
      const mergedUserKanaPoints = Math.max(
        nextUserKanaPoints,
        optimisticKanaPointsRef.current,
      );

      optimisticKanaPointsRef.current = mergedUserKanaPoints;
      setUserKanaPoints((previous) =>
        previous === mergedUserKanaPoints ? previous : mergedUserKanaPoints,
      );

      persistStatusCache(
        userId,
        mergedUserKanaPoints,
        progressItemsRef.current,
      );

      return mergedUserKanaPoints;
    },
    [persistStatusCache],
  );

  const fetchStatus = useCallback(async () => {
    let nextUserKanaPoints = 0;
    let nextProgressItems: UserKanaProgressDetailedResponse[] = [];

    try {
      const [user, progress] = await Promise.all([
        getCurrentUser().catch(() => null),
        getKanaProgress().catch(() => null),
      ]);

      nextUserKanaPoints =
        typeof user?.kanaPoints === "number" ? user.kanaPoints : 0;

      const nextUserId = typeof user?.id === "string" ? user.id : null;
      const previousUserId = activeUserIdRef.current;
      const userIdentityChanged = previousUserId !== nextUserId;

      if (userIdentityChanged) {
        optimisticKanaPointsRef.current = 0;
      }

      activeUserIdRef.current = nextUserId;
      writeKnownUserId(KANA_USER_CACHE_KEY, nextUserId);

      nextProgressItems = progress ?? [];

      const mergedUserKanaPoints = applyUserKanaPoints(
        nextUserKanaPoints,
        nextUserId,
      );
      progressItemsRef.current = nextProgressItems;
      setProgressItems(nextProgressItems);
      persistStatusCache(nextUserId, mergedUserKanaPoints, nextProgressItems);

      return {
        userKanaPoints: mergedUserKanaPoints,
        progressItems: nextProgressItems,
      };
    } finally {
      setLoading(false);
      setHasResolvedInitialStatus(true);
    }
  }, [applyUserKanaPoints, persistStatusCache]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    progressItemsRef.current = progressItems;
  }, [progressItems]);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        if (typeof detail.kanaPoints === "number") {
          applyUserKanaPoints(detail.kanaPoints);
        }
      }),
    [applyUserKanaPoints],
  );

  const progressById = useMemo(
    () => createProgressMap(progressItems),
    [progressItems],
  );

  const lockedHiraganaIds = useMemo(() => {
    const locked = new Set<string>();

    for (const kana of hiraganas) {
      const isLocked = userKanaPoints < kana.pointsToUnlock;

      if (isLocked) {
        locked.add(kana.id);
      }
    }

    return locked;
  }, [hiraganas, userKanaPoints]);

  const lockedKatakanaIds = useMemo(() => {
    const locked = new Set<string>();

    for (const kana of katakanas) {
      const isLocked = userKanaPoints < kana.pointsToUnlock;

      if (isLocked) {
        locked.add(kana.id);
      }
    }

    return locked;
  }, [katakanas, userKanaPoints]);

  return {
    userKanaPoints,
    lockedHiraganaIds,
    lockedKatakanaIds,
    loading,
    hasResolvedInitialStatus,
    progressById,
    reload: fetchStatus,
  };
}