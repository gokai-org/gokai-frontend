"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getVocabularyQuiz,
  listVocabularyRecommendedSubthemesByThemeId,
  listVocabularySubthemesByThemeId,
  listVocabularyWordsBySubthemeId,
} from "@/features/graph/vocabulary/services/api";
import type {
  VocabularyGraphProgressItem,
  VocabularyThemeContent,
  VocabularySubthemeContent,
  VocabularyWordContent,
  VocabularyWordLesson,
} from "@/features/graph/vocabulary/types";
import { useVocabularyGraph } from "@/features/graph/vocabulary/hooks/useVocabularyGraph";
import {
  findWordProgress,
  mergeWordProgress,
} from "@/features/graph/vocabulary/lib/vocabularyQuizProgress";
import type { Theme, Subtheme, Word } from "@/features/library/types";

function toThemeItem(
  theme: VocabularyThemeContent,
  graphId?: string | null,
): Theme {
  return {
    id: theme.id,
    kanji: theme.kanji,
    kana: theme.kana,
    meaning: theme.meaning,
    released: theme.released,
    isUnlocked: theme.isUnlocked ?? null,
    selectedAt: theme.selectedAt ?? null,
    order: theme.order ?? null,
    graphId: graphId ?? null,
  };
}

function toSubthemeItem(
  subtheme: VocabularySubthemeContent,
  progressItems: VocabularyGraphProgressItem[],
  recommendedSubthemeMetaById: Partial<
    Record<string, { rank: number; similarity: number }>
  >,
): Subtheme {
  const matchedItem = progressItems.find((item) => item.subthemeId === subtheme.id);
  const recommendation = recommendedSubthemeMetaById[subtheme.id];

  return {
    id: subtheme.id,
    themeId: subtheme.themeId,
    kanji: subtheme.kanji,
    kana: subtheme.kana,
    meaning: subtheme.meaning,
    isRecommended: Boolean(recommendation),
    recommendationRank: recommendation?.rank,
    recommendationSimilarity: recommendation?.similarity,
    nodeId: matchedItem?.nodeId ?? null,
    isSelectedInGraph: Boolean(matchedItem),
  };
}

function toWordItem(
  word: VocabularyWordContent,
  audioByWordId: Map<string, string | undefined>,
  item?: VocabularyGraphProgressItem | null,
): Word {
  const mergedWord: VocabularyWordLesson = mergeWordProgress(
    {
      wordId: word.id,
      kanji: word.kanji ?? undefined,
      hiragana: word.hiragana ?? undefined,
      meanings: word.meanings?.filter(Boolean) ?? [],
      audio: audioByWordId.get(word.id),
      icon: word.icon ?? null,
      order: word.order ?? null,
      unlockedAt: word.unlockedAt ?? null,
      completedAt: word.completedAt ?? null,
      score: word.score ?? null,
    },
    item ? findWordProgress(item, word.id) : null,
  );

  return {
    id: word.id,
    subthemeId: word.subthemeId ?? null,
    kanji: mergedWord.kanji ?? null,
    hiragana: mergedWord.hiragana ?? null,
    icon: mergedWord.icon ?? null,
    meanings: mergedWord.meanings ?? null,
    order: mergedWord.order ?? null,
    unlockedAt: mergedWord.unlockedAt ?? null,
    completedAt: mergedWord.completedAt ?? null,
    score: mergedWord.score ?? null,
    progress: mergedWord.progress ?? null,
    completedQuizTypes: mergedWord.completedQuizTypes ?? null,
    meaningCompleted: mergedWord.meaningCompleted ?? null,
    listeningCompleted: mergedWord.listeningCompleted ?? null,
    speakingCompleted: mergedWord.speakingCompleted ?? null,
    writingCompleted: mergedWord.writingCompleted ?? null,
    meaningScore: mergedWord.meaningScore ?? null,
    listeningScore: mergedWord.listeningScore ?? null,
    speakingScore: mergedWord.speakingScore ?? null,
    writingScore: mergedWord.writingScore ?? null,
    updatedAt: mergedWord.updatedAt ?? null,
  };
}

export function useVocabularyContent(searchQuery: string, enabled = true) {
  const {
    graphs,
    selectedGraphId,
    progress,
    themeCatalog,
    themeSubthemes,
    recommendedSubthemeMetaById,
    loading,
    setSelectedGraphId,
    createGraphFromTheme,
    addSubthemeToGraph,
    reloadProgress,
  } = useVocabularyGraph();

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [selectedSubthemeNodeId, setSelectedSubthemeNodeId] = useState<string | null>(
    null,
  );
  const [words, setWords] = useState<Word[]>([]);
  const [interestSubthemes, setInterestSubthemes] = useState<Subtheme[]>([]);
  const [interestWords, setInterestWords] = useState<Word[]>([]);
  const wordsRequestIdRef = useRef(0);
  const interestPreviewRequestIdRef = useRef(0);
  const selectedGraphIdRef = useRef<string | null>(selectedGraphId);

  const progressItems = useMemo(() => progress?.items ?? [], [progress?.items]);
  const themes = useMemo(
    () =>
      themeCatalog.map((theme) =>
        toThemeItem(
          theme,
          graphs.find((graph) => graph.themeId === theme.id)?.graphId ?? null,
        ),
      ),
    [graphs, themeCatalog],
  );
  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? null,
    [selectedThemeId, themes],
  );
  const subthemes = useMemo(
    () =>
      themeSubthemes.map((subtheme) =>
        toSubthemeItem(subtheme, progressItems, recommendedSubthemeMetaById),
      ),
    [progressItems, recommendedSubthemeMetaById, themeSubthemes],
  );
  const selectedSubtheme = useMemo(
    () =>
      selectedSubthemeNodeId
        ? subthemes.find((subtheme) => subtheme.nodeId === selectedSubthemeNodeId) ?? null
        : null,
    [selectedSubthemeNodeId, subthemes],
  );
  const selectedSubthemeItem = useMemo(
    () =>
      selectedSubthemeNodeId
        ? progressItems.find((item) => item.nodeId === selectedSubthemeNodeId) ?? null
        : null,
    [progressItems, selectedSubthemeNodeId],
  );

  const [loadingThemes, setLoadingThemes] = useState(true);
  const [loadingSubthemes, setLoadingSubthemes] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [loadingInterestPreviews, setLoadingInterestPreviews] = useState(false);
  const hasResolvedInitialThemes = !loading;

  useEffect(() => {
    setLoadingThemes(loading);
  }, [loading]);

  useEffect(() => {
    selectedGraphIdRef.current = selectedGraphId;
  }, [selectedGraphId]);

  const openTheme = useCallback(async (theme: Theme) => {
    if (theme.isUnlocked === false) {
      return false;
    }

    setSelectedThemeId(theme.id);
    setSelectedSubthemeNodeId(null);
    setWords([]);
    setLoadingSubthemes(true);

    try {
      const existingGraphId =
        theme.graphId ?? graphs.find((graph) => graph.themeId === theme.id)?.graphId ?? null;

      if (existingGraphId) {
        selectedGraphIdRef.current = existingGraphId;
        setSelectedGraphId(existingGraphId);
        return true;
      }

      const createdGraphId = await createGraphFromTheme(theme.id);
      if (!createdGraphId) {
        return false;
      }

      selectedGraphIdRef.current = createdGraphId;
      setSelectedGraphId(createdGraphId);
      return true;
    } catch (error) {
      console.error("Error loading vocabulary theme:", error);
      return false;
    } finally {
      setLoadingSubthemes(false);
    }
  }, [createGraphFromTheme, graphs, setSelectedGraphId]);

  const openSubtheme = useCallback(async (subtheme: Subtheme) => {
    const graphId = selectedGraphIdRef.current;
    if (!graphId) {
      return false;
    }

    const existingItem =
      progressItems.find((item) => item.subthemeId === subtheme.id) ??
      (subtheme.nodeId
        ? progressItems.find((item) => item.nodeId === subtheme.nodeId) ?? null
        : null);

    setSelectedSubthemeNodeId(subtheme.nodeId ?? null);
    setWords([]);
    setLoadingWords(true);
    const requestId = wordsRequestIdRef.current + 1;
    wordsRequestIdRef.current = requestId;

    try {
      const nodeId =
        subtheme.nodeId ??
        existingItem?.nodeId ??
        (await addSubthemeToGraph(subtheme.id, {
          graphId,
          themeId: subtheme.themeId,
        }));
      if (!nodeId) {
        return false;
      }

      const [res, listeningQuiz] = await Promise.all([
        listVocabularyWordsBySubthemeId(subtheme.id),
        getVocabularyQuiz(nodeId, "listening"),
      ]);

      if (wordsRequestIdRef.current !== requestId) {
        return false;
      }

      const audioByWordId = new Map(
        listeningQuiz.questions.map((quizQuestion) => [
          quizQuestion.wordId,
          quizQuestion.audio,
        ]),
      );
      const matchedItem =
        existingItem ?? progressItems.find((item) => item.nodeId === nodeId) ?? null;
      setSelectedSubthemeNodeId(nodeId);
      setWords(res.map((word) => toWordItem(word, audioByWordId, matchedItem)));
      return true;
    } catch (error) {
      console.error("Error loading vocabulary words:", error);
      if (wordsRequestIdRef.current === requestId) {
        setWords([]);
      }
      return false;
    } finally {
      if (wordsRequestIdRef.current === requestId) {
        setLoadingWords(false);
      }
    }
  }, [addSubthemeToGraph, progressItems]);

  useEffect(() => {
    if (!selectedSubthemeItem || words.length === 0) {
      return;
    }

    setWords((currentWords) =>
      currentWords.map((word) => ({
        ...word,
        ...toWordItem(
          {
            id: word.id,
            subthemeId: word.subthemeId,
            kanji: word.kanji,
            hiragana: word.hiragana,
            icon: word.icon,
            meanings: word.meanings,
            order: word.order,
            unlockedAt: word.unlockedAt,
            completedAt: word.completedAt,
            score: word.score,
          },
          new Map(),
          selectedSubthemeItem,
        ),
      })),
    );
  }, [selectedSubthemeItem, words.length]);

  useEffect(() => {
    if (!enabled || !hasResolvedInitialThemes || selectedThemeId !== null) {
      setLoadingInterestPreviews(false);
      return;
    }

    const selectedInterestThemes = themes.filter(
      (theme) => theme.selectedAt && theme.isUnlocked !== false,
    );

    if (selectedInterestThemes.length === 0) {
      setInterestSubthemes([]);
      setInterestWords([]);
      setLoadingInterestPreviews(false);
      return;
    }

    const requestId = interestPreviewRequestIdRef.current + 1;
    interestPreviewRequestIdRef.current = requestId;
    setLoadingInterestPreviews(true);

    void (async () => {
      try {
        const interestThemePayloads = await Promise.all(
          selectedInterestThemes.map(async (theme) => {
            const [themeSubthemes, recommendations] = await Promise.all([
              listVocabularySubthemesByThemeId(theme.id),
              listVocabularyRecommendedSubthemesByThemeId(theme.id).catch(() => null),
            ]);

            const themeRecommendationMap = Object.fromEntries(
              (recommendations ?? []).map((recommendation, index) => [
                recommendation.entityId,
                {
                  rank: index + 1,
                  similarity: recommendation.similarity,
                },
              ]),
            ) as Partial<Record<string, { rank: number; similarity: number }>>;

            return {
              subthemes: themeSubthemes.map((subtheme) =>
                toSubthemeItem(subtheme, progressItems, themeRecommendationMap),
              ),
            };
          }),
        );

        const nextInterestSubthemes = interestThemePayloads.flatMap(
          (payload) => payload.subthemes,
        );

        const interestWordPayloads = await Promise.all(
          nextInterestSubthemes.map(async (subtheme) => {
            const subthemeWords = await listVocabularyWordsBySubthemeId(subtheme.id);
            const matchedItem = progressItems.find((item) => item.subthemeId === subtheme.id) ?? null;

            return subthemeWords.map((word) =>
              toWordItem(word, new Map<string, string | undefined>(), matchedItem),
            );
          }),
        );

        if (interestPreviewRequestIdRef.current !== requestId) {
          return;
        }

        setInterestSubthemes(nextInterestSubthemes);
        setInterestWords(interestWordPayloads.flat());
      } catch (error) {
        console.error("Error loading interest vocabulary previews:", error);

        if (interestPreviewRequestIdRef.current !== requestId) {
          return;
        }

        setInterestSubthemes([]);
        setInterestWords([]);
      } finally {
        if (interestPreviewRequestIdRef.current === requestId) {
          setLoadingInterestPreviews(false);
        }
      }
    })();
  }, [enabled, hasResolvedInitialThemes, progressItems, selectedThemeId, themes]);

  const resetVocabularyView = useCallback(() => {
    setSelectedThemeId(null);
    setSelectedSubthemeNodeId(null);
    setSelectedGraphId(null);
    setWords([]);
    setLoadingSubthemes(false);
    setLoadingWords(false);
  }, [setSelectedGraphId]);

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

  const filteredInterestSubthemes = useMemo(() => {
    if (!normalizedQuery) return interestSubthemes;
    return interestSubthemes.filter((subtheme) =>
      [subtheme.meaning, subtheme.kanji, subtheme.kana].some((value) =>
        (value || "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [interestSubthemes, normalizedQuery]);

  const filteredInterestWords = useMemo(() => {
    if (!normalizedQuery) return interestWords;
    return interestWords.filter((word) =>
      [word.kanji, word.hiragana, ...(word.meanings || [])].some((value) =>
        (value || "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [interestWords, normalizedQuery]);

  return {
    themes,
    subthemes,
    words,
    interestSubthemes,
    interestWords,
    filteredThemes,
    filteredSubthemes,
    filteredWords,
    filteredInterestSubthemes,
    filteredInterestWords,
    progressItems,
    selectedSubthemeItem,
    selectedGraphId,
    recommendedSubthemeMetaById,
    selectedTheme,
    selectedSubtheme,
    hasResolvedInitialThemes,
    loadingThemes,
    loadingSubthemes,
    loadingWords,
    loadingInterestPreviews,
    openTheme,
    openSubtheme,
    reloadProgress,
    resetVocabularyView,
  };
}
