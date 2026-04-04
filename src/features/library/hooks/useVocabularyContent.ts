"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState<Subtheme | null>(
    null,
  );

  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingSubthemes, setLoadingSubthemes] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await listThemes();
        setThemes(res);
      } catch (error) {
        console.error("Error loading themes:", error);
      } finally {
        setLoadingThemes(false);
      }
    })();
  }, []);

  const openTheme = async (theme: Theme) => {
    setSelectedTheme(theme);
    setSelectedSubtheme(null);
    setWords([]);
    setLoadingSubthemes(true);

    try {
      const res = await listSubthemesByThemeId(theme.id);
      setSubthemes(res);
    } catch (error) {
      console.error("Error loading subthemes:", error);
      setSubthemes([]);
    } finally {
      setLoadingSubthemes(false);
    }
  };

  const openSubtheme = async (subtheme: Subtheme) => {
    setSelectedSubtheme(subtheme);
    setLoadingWords(true);

    try {
      const res = await listWordsBySubthemeId(subtheme.id);
      setWords(res);
    } catch (error) {
      console.error("Error loading words:", error);
      setWords([]);
    } finally {
      setLoadingWords(false);
    }
  };

  const resetVocabularyView = () => {
    setSelectedTheme(null);
    setSelectedSubtheme(null);
    setSubthemes([]);
    setWords([]);
  };

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
    loadingThemes,
    loadingSubthemes,
    loadingWords,
    openTheme,
    openSubtheme,
    resetVocabularyView,
  };
}
