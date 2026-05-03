"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listThemes,
  listSubthemesByThemeId,
  listWordsBySubthemeId,
} from "@/features/library/services/contentApi";
import type { Theme, Subtheme, Word } from "@/features/library/types";

export function useVocabularyContent(searchQuery: string) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [subthemes, setSubthemes] = useState<Subtheme[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const subthemesCacheRef = useRef<Map<string, Subtheme[]>>(new Map());
  const wordsCacheRef = useRef<Map<string, Word[]>>(new Map());
  const subthemesRequestIdRef = useRef(0);
  const wordsRequestIdRef = useRef(0);

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<Subtheme | null>(
    null,
  );

  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingSubthemes, setLoadingSubthemes] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [hasResolvedInitialThemes, setHasResolvedInitialThemes] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await listThemes();
        setThemes(res);
      } catch (error) {
        console.error("Error loading themes:", error);
      } finally {
        setLoadingThemes(false);
        setHasResolvedInitialThemes(true);
      }
    })();
  }, []);

  const openTheme = useCallback(async (theme: Theme) => {
    setSelectedTheme(theme);
    setSelectedSubtheme(null);
    setWords([]);

    const cachedSubthemes = subthemesCacheRef.current.get(theme.id);
    if (cachedSubthemes) {
      setSubthemes(cachedSubthemes);
      setLoadingSubthemes(false);
      return;
    }

    setSubthemes([]);
    setLoadingSubthemes(true);
    const requestId = subthemesRequestIdRef.current + 1;
    subthemesRequestIdRef.current = requestId;

    try {
      const res = await listSubthemesByThemeId(theme.id);
      if (subthemesRequestIdRef.current !== requestId) {
        return;
      }

      subthemesCacheRef.current.set(theme.id, res);
      setSubthemes(res);
    } catch (error) {
      console.error("Error loading subthemes:", error);
      if (subthemesRequestIdRef.current !== requestId) {
        return;
      }
      setSubthemes([]);
    } finally {
      if (subthemesRequestIdRef.current === requestId) {
        setLoadingSubthemes(false);
      }
    }
  }, []);

  const openSubtheme = useCallback(async (subtheme: Subtheme) => {
    setSelectedSubtheme(subtheme);

    const cachedWords = wordsCacheRef.current.get(subtheme.id);
    if (cachedWords) {
      setWords(cachedWords);
      setLoadingWords(false);
      return;
    }

    setWords([]);
    setLoadingWords(true);
    const requestId = wordsRequestIdRef.current + 1;
    wordsRequestIdRef.current = requestId;

    try {
      const res = await listWordsBySubthemeId(subtheme.id);
      if (wordsRequestIdRef.current !== requestId) {
        return;
      }

      wordsCacheRef.current.set(subtheme.id, res);
      setWords(res);
    } catch (error) {
      console.error("Error loading words:", error);
      if (wordsRequestIdRef.current !== requestId) {
        return;
      }
      setWords([]);
    } finally {
      if (wordsRequestIdRef.current === requestId) {
        setLoadingWords(false);
      }
    }
  }, []);

  const resetVocabularyView = useCallback(() => {
    setSelectedTheme(null);
    setSelectedSubtheme(null);
    setSubthemes([]);
    setWords([]);
    setLoadingSubthemes(false);
    setLoadingWords(false);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredThemes = useMemo(() => {
    if (!normalizedQuery) return themes;
    return themes.filter((t) =>
      [t.meaning, t.kanji, t.kana].some((value) =>
        (value || "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [themes, normalizedQuery]);

  const filteredSubthemes = useMemo(() => {
    if (!normalizedQuery) return subthemes;
    return subthemes.filter((s) =>
      [s.meaning, s.kanji, s.kana].some((value) =>
        (value || "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [subthemes, normalizedQuery]);

  const filteredWords = useMemo(() => {
    if (!normalizedQuery) return words;
    return words.filter((w) =>
      [w.kanji, w.hiragana, ...(w.meanings || [])].some((value) =>
        (value || "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [words, normalizedQuery]);

  return {
    themes,
    subthemes,
    words,
    filteredThemes,
    filteredSubthemes,
    filteredWords,
    selectedTheme,
    selectedSubtheme,
    hasResolvedInitialThemes,
    loadingThemes,
    loadingSubthemes,
    loadingWords,
    openTheme,
    openSubtheme,
    resetVocabularyView,
  };
}
