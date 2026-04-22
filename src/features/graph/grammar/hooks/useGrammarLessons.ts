"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getCurrentUser } from "@/features/auth";
import { invalidateApiCache } from "@/shared/lib/api/client";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import type {
  GrammarLessonSummary,
  GrammarStudyProgress,
} from "../types";
import { getGrammarProgress, listGrammarLessons } from "../api/grammarApi";
import { buildGrammarBoardItems } from "../lib/grammarBoardModel";
import { GRAMMAR_UNLOCK_COST } from "../lib/grammarUnlockState";

type Status = "idle" | "loading" | "error" | "success";
const GRAMMAR_POINTS_SYNC_TTL_MS = 30_000;
const RECENTLY_UNLOCKED_TTL_MS = 1500;

export function useGrammarLessons() {
  const [lessons, setLessons] = useState<GrammarLessonSummary[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [progress, setProgress] = useState<GrammarStudyProgress | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [optimisticPoints, setOptimisticPoints] = useState<number | null>(null);
  const [recentlyUnlockedIds, setRecentlyUnlockedIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const activeUserIdRef = useRef<string | null>(null);

  const markRecentlyUnlocked = useCallback((id: string) => {
    setRecentlyUnlockedIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    window.setTimeout(() => {
      setRecentlyUnlockedIds((current) => {
        if (!current.has(id)) return current;
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }, RECENTLY_UNLOCKED_TTL_MS);
  }, []);

  const applyOptimisticUnlock = useCallback(
    (lessonId: string, summary?: GrammarLessonSummary | null) => {
      const lesson =
        summary ?? lessons.find((item) => item.id === lessonId) ?? null;

      setProgress({
        grammarId: lessonId,
        title: lesson?.title ?? "",
        pointsToUnlock: lesson?.pointsToUnlock ?? 0,
        completed: false,
      });
      invalidateApiCache("/api/content/grammar/progress");
      markRecentlyUnlocked(lessonId);
    },
    [lessons, markRecentlyUnlocked],
  );

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
      activeUserIdRef.current = user?.id ?? null;
      const resolvedPoints = resolveUserPoints(
        typeof user?.points === "number" ? user.points : 0,
      );

      setProgress(nextProgress);
      setLessons(data);
      setStatus("success");
      void resolvedPoints;
    } catch (err) {
      setLessons([]);
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

  const boardItems = useMemo(
    () =>
      buildGrammarBoardItems(lessons, {
        progress,
        userPoints,
      }),
    [lessons, progress, userPoints],
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
    applyOptimisticUnlock,
    recentlyUnlockedIds,
  };
}