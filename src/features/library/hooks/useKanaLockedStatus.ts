"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import { getKanaProgress } from "@/features/kana/api/kanaApi";
import type { Kana, UserKanaProgressDetailedResponse } from "@/features/kana/types";

function createProgressMap(items: UserKanaProgressDetailedResponse[]) {
  const map = new Map<string, UserKanaProgressDetailedResponse>();

  for (const item of items) {
    map.set(item.kanaId, item);
  }

  return map;
}

export function useKanaLockedStatus(hiraganas: Kana[], katakanas: Kana[]) {
  const [userKanaPoints, setUserKanaPoints] = useState<number>(0);
  const [progressItems, setProgressItems] = useState<
    UserKanaProgressDetailedResponse[]
  >([]);
  const [loading, setLoading] = useState(true);

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

      nextProgressItems = progress ?? [];
    } finally {
      setLoading(false);
    }

    setUserKanaPoints((previous) =>
      previous === nextUserKanaPoints ? previous : nextUserKanaPoints,
    );
    setProgressItems(nextProgressItems);

    return {
      userKanaPoints: nextUserKanaPoints,
      progressItems: nextProgressItems,
    };
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

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
    progressById,
    reload: fetchStatus,
  };
}