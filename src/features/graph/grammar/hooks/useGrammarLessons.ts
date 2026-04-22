"use client";

import { useEffect, useState, useCallback } from "react";
import { getCurrentUser } from "@/features/auth";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import type {
  GrammarBoardProgress,
  GrammarStudyProgress,
} from "../types";
import { getGrammarProgress, listGrammarLessons } from "../api/grammarApi";
import { buildGrammarBoardItems } from "../lib/grammarBoardModel";
import { GRAMMAR_UNLOCK_COST } from "../lib/grammarUnlockState";

type Status = "idle" | "loading" | "error" | "success";
const GRAMMAR_POINTS_SYNC_TTL_MS = 30_000;

export function useGrammarLessons() {
  const [boardItems, setBoardItems] = useState<GrammarBoardProgress[]>(() =>
    buildGrammarBoardItems([]),
  );
  const [userPoints, setUserPoints] = useState(0);
  const [progress, setProgress] = useState<GrammarStudyProgress | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [optimisticPoints, setOptimisticPoints] = useState<number | null>(null);

  const resolveUserPoints = useCallback((nextPoints: number, optimistic = false) => {
    if (optimistic) {
      setOptimisticPoints(nextPoints);
      window.setTimeout(() => {
        setOptimisticPoints((current) => (current === nextPoints ? null : current));
      }, GRAMMAR_POINTS_SYNC_TTL_MS);
      setUserPoints(nextPoints);
      return nextPoints;
    }

    if (optimisticPoints !== null && optimisticPoints !== nextPoints) {
      setUserPoints(optimisticPoints);
      return optimisticPoints;
    }

    setOptimisticPoints(null);
    setUserPoints(nextPoints);
    return nextPoints;
  }, [optimisticPoints]);

  const fetch = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const [data, user, nextProgress] = await Promise.all([
        listGrammarLessons(),
        getCurrentUser().catch(() => null),
        getGrammarProgress().catch(() => null),
      ]);
      const resolvedPoints = resolveUserPoints(
        typeof user?.points === "number" ? user.points : 0,
      );

      setProgress(nextProgress);
      setBoardItems(
        buildGrammarBoardItems(data, {
          progress: nextProgress,
          userPoints: resolvedPoints,
        }),
      );
      setStatus("success");
    } catch (err) {
      setBoardItems(buildGrammarBoardItems([]));
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }, [resolveUserPoints]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetch();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetch]);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        if (typeof detail.points === "number") {
          resolveUserPoints(detail.points, true);
        }
      }),
    [resolveUserPoints],
  );

  const nextUnlockCandidate =
    boardItems.find((item) => item.canUnlock) ??
    boardItems.find((item) => item.status === "locked" && !item.isMock) ??
    null;

  const canUnlockNext = nextUnlockCandidate?.canUnlock === true;

  return {
    boardItems,
    status,
    error,
    refetch: fetch,
    userPoints,
    progress,
    nextUnlockCandidate,
    canUnlockNext,
    unlockCost: nextUnlockCandidate?.pointsToUnlock ?? GRAMMAR_UNLOCK_COST,
  };
}