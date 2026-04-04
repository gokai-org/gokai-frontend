"use client";

import type { StatsData } from "@/features/stats/types";
import { getStatsBannerMessage } from "@/features/stats/utils/statsBanner";

export function useStatsSummary(data: StatsData) {
  const overview = data.overview;
  const streak = overview?.currentStreak ?? 0;
  const accuracy = overview?.accuracy ?? 0;

  const scoreEntries =
    data.recentActivity?.activities?.filter(
      (a) => typeof a.score === "number",
    ) ?? [];

  const averageScore =
    scoreEntries.length > 0
      ? Math.round(
          scoreEntries.reduce((sum, a) => sum + (a.score ?? 0), 0) /
            scoreEntries.length,
        )
      : 0;

  const hasAnyData = !!(
    overview &&
    (overview.studyHours > 0 ||
      overview.kanjiLearned > 0 ||
      overview.hiraganaLearned > 0 ||
      overview.katakanaLearned > 0 ||
      overview.reviewsCompleted > 0)
  );

  const banner = getStatsBannerMessage(accuracy, streak, hasAnyData);

  return {
    overview,
    streak,
    accuracy,
    averageScore,
    hasAnyData,
    banner,
  };
}
