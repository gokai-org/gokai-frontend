"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { getAdminGrammarLessons } from "../services/api";
import type { AdminGrammarLessonSummary } from "../types/grammar";
import { buildAdminGrammarStats, normalizeGrammarSearch } from "../utils/grammarMappers";

export function useAdminGrammarLessons() {
  const [lessons, setLessons] = useState<AdminGrammarLessonSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const mountedRef = useRef(false);

  const loadLessons = useCallback(async (silent = false) => {
    if (!mountedRef.current) return;

    if (silent) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const nextLessons = await getAdminGrammarLessons();
      if (!mountedRef.current) return;
      setLessons(nextLessons);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "No se pudieron cargar las lecciones");
      if (!silent) setLessons([]);
    } finally {
      if (!mountedRef.current) return;
      if (silent) setIsRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadLessons(false);

    return () => {
      mountedRef.current = false;
    };
  }, [loadLessons]);

  const filteredLessons = useMemo(() => {
    const normalizedQuery = normalizeGrammarSearch(deferredQuery);
    if (!normalizedQuery) return lessons;

    return lessons.filter((lesson) => {
      const searchable = normalizeGrammarSearch(
        [
          lesson.title,
          lesson.description,
          lesson.meaningType,
          lesson.howToUseType,
          lesson.examplesType,
          lesson.id,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchable.includes(normalizedQuery);
    });
  }, [deferredQuery, lessons]);

  return {
    lessons,
    filteredLessons,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    query,
    setQuery,
    summary: buildAdminGrammarStats(lessons),
    reload: () => loadLessons(true),
  };
}