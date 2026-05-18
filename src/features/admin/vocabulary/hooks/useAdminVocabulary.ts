"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getAdminVocabularySubthemes,
  getAdminVocabularyThemes,
  getAdminVocabularyWords,
} from "../services/api";
import type {
  AdminVocabularyLevel,
  AdminVocabularySubtheme,
  AdminVocabularyTheme,
  AdminVocabularyWord,
} from "../types/vocabulary";
import { normalizeVocabularySearch } from "../utils/vocabulary";

export function useAdminVocabulary() {
  const [level, setLevel] = useState<AdminVocabularyLevel>("themes");
  const [query, setQuery] = useState("");
  const [themes, setThemes] = useState<AdminVocabularyTheme[]>([]);
  const [subthemes, setSubthemes] = useState<AdminVocabularySubtheme[]>([]);
  const [words, setWords] = useState<AdminVocabularyWord[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<AdminVocabularyTheme | null>(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<AdminVocabularySubtheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const mountedRef = useRef(false);

  const loadThemes = useCallback(async (silent = false) => {
    if (!mountedRef.current) return;

    if (silent) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const nextThemes = await getAdminVocabularyThemes();
      if (!mountedRef.current) return;
      setThemes(nextThemes);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "No se pudieron cargar los temas");
      if (!silent) setThemes([]);
    } finally {
      if (!mountedRef.current) return;
      if (silent) setIsRefreshing(false);
      else setLoading(false);
    }
  }, []);

  const loadSubthemes = useCallback(
    async (theme: AdminVocabularyTheme, silent = false) => {
      if (!mountedRef.current) return;

      if (silent) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const nextSubthemes = await getAdminVocabularySubthemes(theme.id);
        if (!mountedRef.current) return;
        setSelectedTheme(theme);
        setSelectedSubtheme(null);
        setSubthemes(nextSubthemes);
        setWords([]);
        setLevel("subthemes");
        setQuery("");
        setLastUpdatedAt(Date.now());
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar los subtemas");
        if (!silent) setSubthemes([]);
      } finally {
        if (!mountedRef.current) return;
        if (silent) setIsRefreshing(false);
        else setLoading(false);
      }
    },
    [],
  );

  const loadWords = useCallback(
    async (subtheme: AdminVocabularySubtheme, silent = false) => {
      if (!mountedRef.current) return;

      if (silent) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const nextWords = await getAdminVocabularyWords(subtheme.id);
        if (!mountedRef.current) return;
        setSelectedSubtheme(subtheme);
        setWords(nextWords);
        setLevel("words");
        setQuery("");
        setLastUpdatedAt(Date.now());
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar las palabras");
        if (!silent) setWords([]);
      } finally {
        if (!mountedRef.current) return;
        if (silent) setIsRefreshing(false);
        else setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    void loadThemes(false);

    return () => {
      mountedRef.current = false;
    };
  }, [loadThemes]);

  const reload = useCallback(async () => {
    if (level === "words" && selectedSubtheme) {
      await loadWords(selectedSubtheme, true);
      return;
    }

    if (level === "subthemes" && selectedTheme) {
      await loadSubthemes(selectedTheme, true);
      return;
    }

    await loadThemes(true);
  }, [level, loadSubthemes, loadThemes, loadWords, selectedSubtheme, selectedTheme]);

  const goToThemes = useCallback(() => {
    setLevel("themes");
    setSelectedTheme(null);
    setSelectedSubtheme(null);
    setSubthemes([]);
    setWords([]);
    setQuery("");
  }, []);

  const goToSubthemes = useCallback(() => {
    if (!selectedTheme) return;
    setLevel("subthemes");
    setSelectedSubtheme(null);
    setWords([]);
    setQuery("");
  }, [selectedTheme]);

  const activeItems = level === "themes" ? themes : level === "subthemes" ? subthemes : words;
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeVocabularySearch(deferredQuery);
    if (!normalizedQuery) return activeItems;

    return activeItems.filter((item) => {
      const searchable = normalizeVocabularySearch(
        Object.values(item)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value) => typeof value === "string" || typeof value === "boolean")
          .join(" "),
      );

      return searchable.includes(normalizedQuery);
    });
  }, [activeItems, deferredQuery]);

  const summary = useMemo(
    () => ({
      themes: themes.length,
      subthemes: subthemes.length,
      words: words.length,
      releasedThemes: themes.filter((theme) => theme.released).length,
      mappedThemes: themes.filter((theme) => Boolean(theme.region)).length,
    }),
    [subthemes.length, themes, words.length],
  );

  return {
    level,
    query,
    setQuery,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    themes,
    subthemes,
    words,
    selectedTheme,
    selectedSubtheme,
    activeItems,
    filteredItems,
    summary,
    reload,
    loadThemes,
    loadSubthemes,
    loadWords,
    goToThemes,
    goToSubthemes,
  };
}