"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAdminKanjis } from "../services/api";
import type { AdminKanjiSummary, AdminKanjiRecord } from "../types/kanji";
import {
  buildAdminKanjiSearchValue,
  normalizeAdminKanjiSearch,
} from "../utils/kanji";

export function useAdminKanji() {
  const [query, setQuery] = useState("");
  const [kanjis, setKanjis] = useState<AdminKanjiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const deferredQuery = useDeferredValue(query);

  const loadKanjis = useCallback(async (silent = false) => {
    if (!mountedRef.current) return;

    if (silent) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const nextKanjis = await getAdminKanjis();
      if (!mountedRef.current) return;
      setKanjis(nextKanjis);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "No se pudieron cargar los kanjis");
      if (!silent) setKanjis([]);
    } finally {
      if (!mountedRef.current) return;
      if (silent) setIsRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadKanjis(false);

    return () => {
      mountedRef.current = false;
    };
  }, [loadKanjis]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeAdminKanjiSearch(deferredQuery);
    if (!normalizedQuery) return kanjis;

    return kanjis.filter((record) =>
      buildAdminKanjiSearchValue(record).includes(normalizedQuery),
    );
  }, [deferredQuery, kanjis]);

  const summary = useMemo<AdminKanjiSummary>(() => {
    const totalReadings = kanjis.reduce(
      (acc, record) => acc + record.readings.length,
      0,
    );
    const totalMeanings = kanjis.reduce(
      (acc, record) => acc + record.meanings.length,
      0,
    );
    const averagePoints =
      kanjis.length > 0
        ? Math.round(
            kanjis.reduce((acc, record) => acc + record.pointsToUnlock, 0) /
              kanjis.length,
          )
        : 0;

    return {
      total: kanjis.length,
      totalReadings,
      totalMeanings,
      averagePoints,
    };
  }, [kanjis]);

  return {
    query,
    setQuery,
    kanjis,
    filteredItems,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    summary,
    reload: () => loadKanjis(true),
  };
}