"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import { getKanaProgress } from "@/features/kana/api/kanaApi";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import type {
  Kana,
  KanaType,
  UserKanaProgressDetailedResponse,
} from "@/features/kana/types";
import { WRITING_COMPLETION_SCORE } from "../types";
import type { WritingBoardProgress, WritingBoardSummary } from "../types";

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
  const [kanas, setKanas] = useState<Kana[]>([]);
  const [userKanaPoints, setUserKanaPoints] = useState<number>(0);
  const [progressItems, setProgressItems] = useState<
    UserKanaProgressDetailedResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  // Use refs to avoid re-creating reload when these change every render.
  const listKanasRef = useRef(listKanas);
  listKanasRef.current = listKanas;
  const errorMessageRef = useRef(errorMessage);
  errorMessageRef.current = errorMessage;

  const reload = useCallback(async () => {
    console.warn(`[KANA BOARD] reload() called for ${kanaType}`);
    console.trace("[KANA BOARD] reload call stack");
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const [kanaList, progressList, user] = await Promise.all([
        listKanasRef.current().catch(() => null),
        getKanaProgress().catch(() => null),
        getCurrentUser().catch(() => null),
      ]);

      const nextKanaPoints =
        typeof user?.kanaPoints === "number" ? user.kanaPoints : 0;

      setUserKanaPoints((current) => Math.max(current, nextKanaPoints));

      if (kanaList && kanaList.length > 0) {
        setKanas(kanaList);
      }

      if (progressList) {
        setProgressItems(
          progressList.filter((item) => item.kanaType === kanaType),
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : errorMessageRef.current;
      setError(message);
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
    }
  }, [kanaType]); // kanaType is a stable string constant — safe as only dep

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        if (typeof detail.kanaPoints === "number") {
          const nextKanaPoints = detail.kanaPoints;
          setUserKanaPoints((current) => Math.max(current, nextKanaPoints));
        }
      }),
    [],
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