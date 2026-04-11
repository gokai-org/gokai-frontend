"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Kanji } from "@/features/kanji/types";
import type { KanjiLessonResult } from "@/features/kanji/types";
import { getKanjiLessonResults } from "@/features/kanji/api/kanjiApi";
import { getCurrentUser } from "@/features/auth";

const KANJI_COMPLETION_SCORE = 70;

export function useKanjiLockedStatus(kanjis: Kanji[]) {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [results, setResults] = useState<KanjiLessonResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    let nextPoints = 0;
    let nextResults: KanjiLessonResult[] = [];

    try {
      const [user, lessonResultsResponse] = await Promise.all([
        getCurrentUser().catch(() => null),
        getKanjiLessonResults().catch(() => null),
      ]);

      nextPoints = typeof user?.points === "number" ? user.points : 0;
      nextResults = lessonResultsResponse?.results ?? [];
    } catch {
      nextPoints = 0;
    } finally {
      setLoading(false);
    }

    setUserPoints((previous) =>
      previous === nextPoints ? previous : nextPoints,
    );
    setResults(nextResults);

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

  const completedKanjiIds = useMemo(() => {
    if (results.length === 0) return new Set<string>();

    const bestScoreByKanji = new Map<string, number>();

    for (const result of results) {
      const previousBest = bestScoreByKanji.get(result.kanjiId) ?? 0;
      if (result.score > previousBest) {
        bestScoreByKanji.set(result.kanjiId, result.score);
      }
    }

    const completed = new Set<string>();
    for (const [kanjiId, bestScore] of bestScoreByKanji.entries()) {
      if (bestScore >= KANJI_COMPLETION_SCORE) {
        completed.add(kanjiId);
      }
    }

    return completed;
  }, [results]);

  return {
    lockedKanjiIds,
    completedKanjiIds,
    userPoints,
    loading,
    reload: fetchPoints,
  };
}
