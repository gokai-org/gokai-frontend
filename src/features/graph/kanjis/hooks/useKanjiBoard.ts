"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [results, setResults] = useState<KanjiLessonResult[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [kanjiPayload, resultsPayload, user] = await Promise.all([
        listKanjis(),
        getKanjiLessonResults({ limit: 500 }).catch(() => []),
        getCurrentUser().catch(() => null),
      ]);

      setKanjis(normalizeKanjis(kanjiPayload));
      setResults(normalizeResults(resultsPayload));
      setUserPoints(typeof user?.points === "number" ? user.points : 0);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No fue posible cargar la constelación de kanjis.";

      setError(message);
      setKanjis([]);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

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
