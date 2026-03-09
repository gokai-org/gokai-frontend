"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 4000;

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

      const [overview, activity, skills, recentActivity, streakCalendar] =
        await Promise.all([
          getStatsOverview(period),
          getStatsActivity(),
          getStatsSkills(),
          getStatsRecentActivity(),
          getStatsStreak(),
        ]);

      setData({ overview, activity, skills, recentActivity, streakCalendar });
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
