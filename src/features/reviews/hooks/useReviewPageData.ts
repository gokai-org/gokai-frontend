import { useCallback, useEffect, useMemo, useState } from "react";

import { listKanjis } from "@/features/kanji/api/kanjiApi";
import type { Kanji } from "@/features/kanji/types";

import { getStatsOverview } from "@/features/stats/services/api";
import type { OverviewStatsResponse } from "@/features/stats/types";
import type { ReviewItem } from "../types";
import { buildReviewItems } from "../utils/reviewMappers";

export function useReviewPageData() {
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [reviewStats, setReviewStats] = useState<OverviewStatsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceKanji, setPracticeKanji] = useState<Kanji | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([listKanjis(), getStatsOverview()]).then(
      ([kanjisResult, statsResult]) => {
        if (cancelled) return;

        if (kanjisResult.status === "fulfilled") {
          setKanjis(
            Array.isArray(kanjisResult.value) ? kanjisResult.value : [],
          );
        } else {
          setError(kanjisResult.reason?.message ?? "Error al cargar repasos");
        }

        if (statsResult.status === "fulfilled") {
          setReviewStats(statsResult.value);
        }

        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const reviewItems = useMemo<ReviewItem[]>(
    () => buildReviewItems(kanjis),
    [kanjis],
  );

  const handleStartReview = useCallback(
    (itemId: string) => {
      const found = kanjis.find((k) => k.id === itemId);
      if (found) setPracticeKanji(found);
    },
    [kanjis],
  );

  return {
    loading,
    error,
    reviewItems,
    reviewStats,
    practiceKanji,
    setPracticeKanji,
    handleStartReview,
  };
}
