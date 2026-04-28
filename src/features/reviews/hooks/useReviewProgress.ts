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
}

interface ReviewHeroCopy {
  eyebrow: string;
  title: string;
  description: string;
  state: KazuMascotState;
}

const TOTAL_KAZU_GOAL = 40;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const categoryDefinitions: Array<{
  type: ReviewItem["type"];
  label: string;
  japanese: string;
  baseline: number;
}> = [
  { type: "kanji", label: "Escritura", japanese: "書く", baseline: 78 },
  { type: "grammar", label: "Gramática", japanese: "文法", baseline: 62 },
  { type: "listening", label: "Escuchar", japanese: "聴く", baseline: 46 },
  { type: "speaking", label: "Hablar", japanese: "話す", baseline: 34 },
];

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

function getMockCompletedReviews(activeCount: number) {
  return clamp(28 - Math.max(0, activeCount - 2) * 3, 12, TOTAL_KAZU_GOAL);
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
  if (progress >= 72) {
    return {
      statusLabel: "Activo",
      helperText: "Color estable por poca carga pendiente",
    };
  }

  if (progress >= 42) {
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

  if (activeCount <= 3) {
    return {
      eyebrow: "Bloque ligero",
      title: "Kazu está listo para avanzar",
      description: "Un repaso corto mantiene activo tu progreso sin saturarte.",
      state: "idle",
    };
  }

  if (activeCount <= 7) {
    return {
      eyebrow: "Bloque medio",
      title: "Kazu se mantiene atento",
      description: "El color baja cuando se acumulan lecciones listas para repasar.",
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
}: UseReviewProgressOptions) {
  return useMemo(() => {
    const activeCount = items.length;
    const completedReviews = loading
      ? 0
      : (reviewStats?.reviewsCompleted ?? getMockCompletedReviews(activeCount));
    const normalizedCompleted = clamp(completedReviews, 0, TOTAL_KAZU_GOAL);
    const currentStreak = reviewStats?.currentStreak ?? 12;
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
      const totalReviewPressure = clamp(activeCount * 4.5, 0, 46);
      const typeReviewPressure = clamp(pendingCount * 12, 0, 48);
      const progress = loading
        ? 58
        : clamp(100 - totalReviewPressure - typeReviewPressure, 22, 100);
      const status = getZoneStatus(progress);

      return {
        id: category.type,
        label: category.label,
        pendingCount,
        progress,
        active: progress >= 42,
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
            category.baseline + (pendingCount === 0 ? 18 : -pendingCount * 4),
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
      recommendedItem: items.find((item) => item.type === "kanji") ?? items[0] ?? null,
      ...heroCopy,
    };
  }, [items, loading, recentActivity, reviewActive, reviewStats?.currentStreak, reviewStats?.reviewsCompleted, reviewStats?.reviewsCompletedTrend]);
}
