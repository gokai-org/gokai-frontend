import { useMemo } from "react";

import type { KazuMascotState } from "@/features/mascot";
import type {
  OverviewStatsResponse,
  RecentActivityEntry,
} from "@/features/stats/types";
import type { ReviewItem } from "../types";

export type KazuProgressZoneId = ReviewItem["type"];

export interface KazuProgressZone {
  id: KazuProgressZoneId;
  label: string;
  active: boolean;
  progress: number;
  pendingCount: number;
  statusLabel: string;
  helperText: string;
}

export interface ReviewCategoryProgress {
  type: ReviewItem["type"];
  label: string;
  japanese: string;
  pendingCount: number;
  masteryPercent: number;
}

interface UseReviewProgressOptions {
  items: ReviewItem[];
  reviewStats?: OverviewStatsResponse | null;
  recentActivity?: RecentActivityEntry[];
  loading?: boolean;
  reviewActive?: boolean;
  currentStreakDays?: number | null;
}

interface ReviewHeroCopy {
  eyebrow: string;
  title: string;
  description: string;
  state: KazuMascotState;
}

export const KAZU_ACTIVE_THRESHOLD = 72;
export const KAZU_ATTENTIVE_THRESHOLD = 42;
export const KAZU_LIGHT_REVIEW_LIMIT = 3;
export const KAZU_ALERT_REVIEW_LIMIT = 7;
const TOTAL_KAZU_GOAL = 40;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const categoryDefinitions: Array<{
  type: ReviewItem["type"];
  label: string;
  japanese: string;
  baseline: number;
}> = [
  { type: "kanji", label: "Kanji", japanese: "漢字", baseline: 78 },
  { type: "grammar", label: "Gramática", japanese: "文法", baseline: 68 },
  { type: "vocabulary", label: "Vocabulario", japanese: "語彙", baseline: 58 },
];

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

function getFallbackCompletedReviews(activeCount: number) {
  return clamp(26 - Math.max(0, activeCount - 1) * 2, 10, TOTAL_KAZU_GOAL);
}

function getDaysSinceLatestReview(recentActivity: RecentActivityEntry[]) {
  const latestReviewTime = recentActivity
    .filter((activity) => activity.type === "review")
    .map((activity) => new Date(activity.createdAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  if (!latestReviewTime) return null;
  return Math.max(0, Math.floor((Date.now() - latestReviewTime) / MS_PER_DAY));
}

function getConstancyScore({
  currentStreak,
  reviewsCompleted,
  reviewsCompletedTrend,
  daysSinceLatestReview,
}: {
  currentStreak: number;
  reviewsCompleted: number;
  reviewsCompletedTrend: number;
  daysSinceLatestReview: number | null;
}) {
  const streakSignal = clamp((currentStreak / 7) * 42, 0, 42);
  const weeklyPracticeSignal = clamp((reviewsCompleted / 12) * 36, 0, 36);
  const trendSignal = clamp(14 + reviewsCompletedTrend * 0.45, 0, 22);
  const inactivityPenalty = daysSinceLatestReview === null
    ? currentStreak > 0 ? 10 : 26
    : clamp(daysSinceLatestReview * 13, 0, 58);

  return clamp(
    streakSignal + weeklyPracticeSignal + trendSignal - inactivityPenalty,
    6,
    100,
  );
}

function getZoneStatus(progress: number) {
  if (progress >= KAZU_ACTIVE_THRESHOLD) {
    return {
      statusLabel: "Activo",
      helperText: "Color estable por poca carga pendiente",
    };
  }

  if (progress >= KAZU_ATTENTIVE_THRESHOLD) {
    return {
      statusLabel: "Atento",
      helperText: "Empieza a apagarse por repasos acumulados",
    };
  }

  return {
    statusLabel: "Cargado",
    helperText: "Muchos repasos pendientes tiñen esta zona de gris",
  };
}

function getHeroCopy(
  activeCount: number,
  reviewActive: boolean,
): ReviewHeroCopy {
  if (reviewActive) {
    return {
      eyebrow: "Sesión activa",
      title: "Kazu está concentrado contigo",
      description: "Cada repaso devuelve color y mantiene activo tu conocimiento.",
      state: "focus",
    };
  }

  if (activeCount === 0) {
    return {
      eyebrow: "Estado estable",
      title: "Kazu refleja tu constancia",
      description: "Tu conocimiento se mantiene con práctica, incluso cuando no hay cola pendiente.",
      state: "reward",
    };
  }

  if (activeCount <= KAZU_LIGHT_REVIEW_LIMIT) {
    return {
      eyebrow: "",
      title: "Kazu está listo para avanzar",
      description: "Un repaso corto mantiene activo tu progreso sin saturarte.",
      state: "idle",
    };
  }

  if (activeCount <= KAZU_ALERT_REVIEW_LIMIT) {
    return {
      eyebrow: "Bloque medio",
      title: "Kazu se mantiene atento",
      description: "El color baja cuando se acumulan repasos pendientes.",
      state: "determined",
    };
  }

  return {
    eyebrow: "Buen bloque",
    title: "Kazu necesita tu enfoque",
    description: "Si dejas de repasar, el color se desvanece. Empieza por la recomendación principal.",
    state: "concerned",
  };
}

export function useReviewProgress({
  items,
  reviewStats,
  recentActivity = [],
  loading = false,
  reviewActive = false,
  currentStreakDays,
}: UseReviewProgressOptions) {
  return useMemo(() => {
    const activeCount = items.length;
    const completedReviews = loading
      ? 0
      : (reviewStats?.reviewsCompleted ?? getFallbackCompletedReviews(activeCount));
    const normalizedCompleted = clamp(completedReviews, 0, TOTAL_KAZU_GOAL);
    const currentStreak = currentStreakDays ?? reviewStats?.currentStreak ?? 0;
    const daysSinceLatestReview = getDaysSinceLatestReview(recentActivity);
    const constancyScore = loading
      ? 0
      : getConstancyScore({
          currentStreak,
          reviewsCompleted: normalizedCompleted,
          reviewsCompletedTrend: reviewStats?.reviewsCompletedTrend ?? 0,
          daysSinceLatestReview,
        });
    const heroCopy = getHeroCopy(activeCount, reviewActive);

    const zones = categoryDefinitions.map((category) => {
      const pendingCount = items.filter(
        (item) => item.type === category.type,
      ).length;
      const totalReviewPressure = clamp(activeCount * 6.5, 0, 64);
      const typeReviewPressure = clamp(pendingCount * 13, 0, 42);
      const progress = loading
        ? 58
        : activeCount === 0
          ? 100
          : clamp(100 - totalReviewPressure - typeReviewPressure, 14, 100);
      const status = getZoneStatus(progress);

      return {
        id: category.type,
        label: category.label,
        pendingCount,
        progress,
        active: progress >= KAZU_ATTENTIVE_THRESHOLD,
        ...status,
      };
    });

    const categories = categoryDefinitions.map((category) => {
      const pendingCount = items.filter(
        (item) => item.type === category.type,
      ).length;
      const masteryPercent = loading
        ? 42
        : clamp(
            category.baseline + (pendingCount === 0 ? 18 : -pendingCount * 6),
            18,
            100,
          );

      return {
        ...category,
        pendingCount,
        masteryPercent,
      };
    });

    return {
      activeCount,
      completedReviews: normalizedCompleted,
      totalGoal: TOTAL_KAZU_GOAL,
      constancyScore: Math.round(constancyScore),
      daysSinceLatestReview,
      zones,
      categories,
      currentStreak,
      recommendedItem: items[0] ?? null,
      ...heroCopy,
    };
  }, [currentStreakDays, items, loading, recentActivity, reviewActive, reviewStats?.currentStreak, reviewStats?.reviewsCompleted, reviewStats?.reviewsCompletedTrend]);
}
