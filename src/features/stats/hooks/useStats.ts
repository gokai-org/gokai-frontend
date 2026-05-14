"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ActivityResponse,
  ActivitySecondsEntry,
  CompletedTotals,
  DistributionCategory,
  MonthlyProgressEntry,
  OverviewStatsResponse,
  SkillEntry,
  SkillsResponse,
  StreakCalendarResponse,
  StatsPeriod,
  StatsData,
  WeeklyActivityEntry,
} from "@/features/stats/types";
import {
  getStatsOverview,
  getStatsActivity,
  getStatsRecentAnswers,
  getStatsStreak,
} from "@/features/stats/services/api";

interface UseStatsReturn {
  data: StatsData;
  loading: boolean;
  error: string | null;
  period: StatsPeriod;
  setPeriod: (p: StatsPeriod) => void;
  refresh: () => Promise<void>;
}

const EMPTY: StatsData = {
  overview: null,
  activity: null,
  skills: null,
  recentActivity: null,
  recentAnswers: null,
  streakCalendar: null,
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 4000;
const STREAK_WEEKS = 12;
const weekdayFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  timeZone: "UTC",
});

function getUtcToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function getUtcDayKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEntryMinutes(entry: ActivitySecondsEntry): number {
  return Math.round(
    (entry.kanjiSeconds +
      entry.kanaSeconds +
      entry.grammarSeconds +
      entry.vocabularySeconds) /
      60,
  );
}

function formatWeekdayLabel(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return day;
  }

  return weekdayFormatter.format(date).replace(".", "").slice(0, 3);
}

function formatMonthDayLabel(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return day;
  }

  return `${date.getUTCDate()}`.padStart(2, "0");
}

function hasWeeklyMinutes(data: ActivityResponse | null): boolean {
  return (data?.weekly ?? []).some((entry) => entry.minutes > 0);
}

function hasMonthlyData(data: ActivityResponse | null): boolean {
  return (data?.monthly ?? []).some(
    (entry) => entry.score > 0 || entry.reviews > 0,
  );
}

function buildWeeklyActivityFromRecentAnswers(
  entries: ActivitySecondsEntry[],
): WeeklyActivityEntry[] {
  return entries.map((entry) => ({
    day: formatWeekdayLabel(entry.day),
    minutes: getEntryMinutes(entry),
  }));
}

function buildMonthlyMinutesFromRecentAnswers(
  entries: ActivitySecondsEntry[],
): MonthlyProgressEntry[] {
  return entries
    .map((entry) => ({
      month: formatMonthDayLabel(entry.day),
      score: getEntryMinutes(entry),
      reviews: 0,
      metric: "minutes" as const,
    }))
    .filter((entry) => entry.score > 0);
}

function buildActivityFallback(
  activity: ActivityResponse,
  recentAnswers: StatsData["recentAnswers"],
): ActivityResponse {
  const weeklyFallback = buildWeeklyActivityFromRecentAnswers(
    recentAnswers?.weeklyActivitySeconds ?? [],
  );
  const monthlyFallback = buildMonthlyMinutesFromRecentAnswers(
    recentAnswers?.monthlyActivitySeconds ?? [],
  );

  return {
    weekly: hasWeeklyMinutes(activity) ? activity.weekly : weeklyFallback,
    monthly: hasMonthlyData(activity) ? activity.monthly : monthlyFallback,
  };
}

function calculateCurrentStreak(days: Record<string, number>): number {
  let streak = 0;
  const today = getUtcToday();

  for (let offset = 0; ; offset += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    const key = getUtcDayKey(date);

    if ((days[key] ?? 0) > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function calculateLongestStreak(days: Record<string, number>): number {
  const keys = Object.keys(days).sort();
  let longest = 0;
  let current = 0;

  for (const key of keys) {
    if ((days[key] ?? 0) > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function hasStreakActivity(data: StreakCalendarResponse | null): boolean {
  return Object.values(data?.streakDays ?? {}).some((minutes) => minutes > 0);
}

function buildStreakFallback(
  streak: StreakCalendarResponse,
  monthlyEntries: ActivitySecondsEntry[],
  weeks: number = STREAK_WEEKS,
): StreakCalendarResponse {
  if (hasStreakActivity(streak)) {
    return streak;
  }

  const days: Record<string, number> = {};
  const today = getUtcToday();
  const totalDays = weeks * 7;

  for (let index = totalDays - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - index);
    days[getUtcDayKey(date)] = 0;
  }

  for (const entry of monthlyEntries) {
    if (entry.day in days) {
      days[entry.day] = getEntryMinutes(entry);
    }
  }

  return {
    streakDays: days,
    currentStreak: calculateCurrentStreak(days),
    longestStreak: calculateLongestStreak(days),
  };
}

function buildOverviewFallback(
  overview: OverviewStatsResponse,
  period: StatsPeriod,
  recentAnswers: StatsData["recentAnswers"],
  streakCalendar: StreakCalendarResponse,
): OverviewStatsResponse {
  const weeklyMinutes = (recentAnswers?.weeklyActivitySeconds ?? []).reduce(
    (sum, entry) => sum + getEntryMinutes(entry),
    0,
  );
  const monthlyMinutes = (recentAnswers?.monthlyActivitySeconds ?? []).reduce(
    (sum, entry) => sum + getEntryMinutes(entry),
    0,
  );
  const fallbackMinutes = period === "month" ? monthlyMinutes : weeklyMinutes;

  return {
    ...overview,
    studyMinutes:
      overview.studyMinutes > 0 ? overview.studyMinutes : fallbackMinutes,
    currentStreak:
      overview.currentStreak > 0
        ? overview.currentStreak
        : streakCalendar.currentStreak,
  };
}

function buildDistribution(
  completedTotals: CompletedTotals,
): SkillsResponse["distribution"] {
  const rawCategories: Array<{ label: string; completed: number }> = [
    { label: "Kanji", completed: completedTotals.kanjiCompleted },
    { label: "Kana", completed: completedTotals.kanaCompleted },
    { label: "Gramática", completed: completedTotals.grammarCompleted },
    { label: "Vocabulario", completed: completedTotals.wordsCompleted },
  ];

  const total = rawCategories.reduce((sum, category) => sum + category.completed, 0);

  if (total === 0) {
    return { total: 0, categories: [] };
  }

  const categories: DistributionCategory[] = rawCategories.map((category) => ({
    label: category.label,
    value: Math.round((category.completed / total) * 100),
  }));

  return { total, categories };
}

function buildSkillEntries(completedTotals: CompletedTotals): SkillEntry[] {
  const entries: Array<{
    skill: string;
    completed: number;
    total: number;
  }> = [
    {
      skill: "Kanji",
      completed: completedTotals.kanjiCompleted,
      total: completedTotals.kanjiTotal,
    },
    {
      skill: "Kana",
      completed: completedTotals.kanaCompleted,
      total: completedTotals.kanaTotal,
    },
    {
      skill: "Gramática",
      completed: completedTotals.grammarCompleted,
      total: completedTotals.grammarTotal,
    },
    {
      skill: "Vocabulario",
      completed: completedTotals.wordsCompleted,
      total: completedTotals.wordsTotal,
    },
  ];

  return entries.map((entry) => ({
    skill: entry.skill,
    value:
      entry.total > 0
        ? Math.round((entry.completed / entry.total) * 100)
        : 0,
  }));
}

export function useStats(initialPeriod: StatsPeriod = "week"): UseStatsReturn {
  const [data, setData] = useState<StatsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>(initialPeriod);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, activity, recentAnswers, streakCalendar] =
        await Promise.all([
          getStatsOverview(period),
          getStatsActivity(),
          getStatsRecentAnswers(),
          getStatsStreak(),
        ]);

      const mappedActivity = buildActivityFallback(activity, recentAnswers);
      const mappedStreakCalendar = buildStreakFallback(
        streakCalendar,
        recentAnswers.monthlyActivitySeconds ?? [],
      );
      const mappedOverview = buildOverviewFallback(
        overview,
        period,
        recentAnswers,
        mappedStreakCalendar,
      );
      const mappedSkills: SkillsResponse = {
        skills: buildSkillEntries(recentAnswers.completedTotals),
        distribution: buildDistribution(recentAnswers.completedTotals),
      };

      setData({
        overview: mappedOverview,
        activity: mappedActivity,
        skills: mappedSkills,
        recentActivity: {
          activities: recentAnswers.recentActivity ?? [],
        },
        recentAnswers,
        streakCalendar: mappedStreakCalendar,
      });
      retryCount.current = 0;
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError("No se pudieron cargar las estadísticas");

      // Auto-reintentar silenciosamente mientras se muestran skeletons
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        retryTimer.current = setTimeout(() => {
          fetchAll();
        }, RETRY_DELAY);
      }
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    retryCount.current = 0;
    clearTimeout(retryTimer.current);
    fetchAll();
    return () => clearTimeout(retryTimer.current);
  }, [fetchAll]);

  return { data, loading, error, period, setPeriod, refresh: fetchAll };
}
