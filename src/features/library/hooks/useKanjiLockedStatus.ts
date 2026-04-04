"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Kanji } from "@/features/kanji/types";
import { getCurrentUser } from "@/features/auth";

export function useKanjiLockedStatus(kanjis: Kanji[]) {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    let nextPoints = 0;

    try {
      const user = await getCurrentUser();
      nextPoints = typeof user?.points === "number" ? user.points : 0;
    } catch {
      nextPoints = 0;
    } finally {
      setLoading(false);
    }

    setUserPoints((previous) =>
      previous === nextPoints ? previous : nextPoints,
    );

    return nextPoints;
  }, []);

  useEffect(() => {
    void fetchPoints();
  }, [fetchPoints]);

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

  return { lockedKanjiIds, userPoints, loading, reload: fetchPoints };
}
