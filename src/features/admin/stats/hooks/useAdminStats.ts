"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminStats } from "../services/api";
import type { AdminStatsResponse } from "../types/stats";

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const fetchStats = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const nextStats = await getAdminStats();
      setStats(nextStats);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las estadisticas administrativas",
      );
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchStats("initial");
  }, [fetchStats]);

  const reloadStats = useCallback(async () => {
    await fetchStats("refresh");
  }, [fetchStats]);

  return {
    stats,
    loading,
    isRefreshing,
    error,
    lastUpdatedAt,
    reloadStats,
  };
}