"use client";

import { useState, useEffect, useCallback } from "react";
import type { StatsPeriod, StatsData } from "@/features/stats/types";
import {
  getStatsOverview,
  getStatsActivity,
  getStatsSkills,
  getStatsRecentActivity,
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
  streakCalendar: null,
};

export function useStats(initialPeriod: StatsPeriod = "week"): UseStatsReturn {
  const [data, setData] = useState<StatsData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>(initialPeriod);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, activity, skills, recentActivity, streakCalendar] =
        await Promise.all([
          getStatsOverview(period),
          getStatsActivity(),
          getStatsSkills(),
          getStatsRecentActivity(),
          getStatsStreak(),
        ]);

      setData({ overview, activity, skills, recentActivity, streakCalendar });
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError("No se pudieron cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error, period, setPeriod, refresh: fetchAll };
}
