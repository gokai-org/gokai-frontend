"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import { WRITING_COMPLETION_SCORE } from "../../shared/types";
import type {
  WritingBoardProgress,
  WritingBoardSummary,
} from "../../shared/types";
import { HIRAGANA_DATA } from "../mock/data";

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

export function useHiraganaBoard() {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const reload = useCallback(async () => {
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const user = await getCurrentUser().catch(() => null);
      setUserPoints(typeof user?.points === "number" ? user.points : 0);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No fue posible cargar el tablero de hiragana.";
      setError(message);
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const items = useMemo(() => {
    return HIRAGANA_DATA.map<WritingBoardProgress>((kana, index) => {
      const isUnlocked = userPoints >= kana.pointsToUnlock;
      const status = isUnlocked ? "available" : "locked";

      return {
        id: kana.id,
        index,
        symbol: kana.symbol,
        romaji: kana.romaji,
        unlockPoints: kana.pointsToUnlock,
        bestScore: null,
        attemptCount: 0,
        status,
        completionScore: WRITING_COMPLETION_SCORE,
        progressPercent: 0,
      };
    });
  }, [userPoints]);

  const summary = useMemo(() => buildSummary(items), [items]);

  return { items, summary, userPoints, loading, error, reload };
}
