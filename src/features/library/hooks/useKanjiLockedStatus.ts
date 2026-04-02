"use client";

import { useEffect, useMemo, useState } from "react";
import type { Kanji } from "@/features/kanji/types";
import { getCurrentUser } from "@/features/auth";

export function useKanjiLockedStatus(kanjis: Kanji[]) {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        setUserPoints(typeof user?.points === "number" ? user.points : 0);
      } catch {
        setUserPoints(0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  return { lockedKanjiIds, userPoints, loading };
}
