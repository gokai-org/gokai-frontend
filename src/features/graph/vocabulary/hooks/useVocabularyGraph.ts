import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/features/auth/services/api";
import { readOnboardingInterestThemeIds } from "@/features/onboarding/lib/interestThemeStorage";
import {
  createVocabularyGraph,
  getVocabularyGraphProgress,
  listVocabularyGraphs,
  listVocabularyRecommendedSubthemesByThemeId,
  listVocabularySubthemesByThemeId,
  listVocabularyThemes,
  selectVocabularySubtheme,
} from "../services/api";
import type {
  VocabularyGraphProgress,
  VocabularyGraphProgressItem,
  VocabularyRecommendation,
  VocabularyGraphSummary,
  VocabularySubthemeContent,
  VocabularyThemeContent,
} from "../types";

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isSameSubtheme(
  item: Pick<VocabularyGraphProgressItem, "meaning" | "kanji" | "kana">,
  subtheme: Pick<VocabularySubthemeContent, "meaning" | "kanji" | "kana">,
) {
  return (
    normalizeText(item.meaning) === normalizeText(subtheme.meaning) &&
    normalizeText(item.kanji) === normalizeText(subtheme.kanji) &&
    normalizeText(item.kana) === normalizeText(subtheme.kana)
  );
}

function isDuplicateSubthemeError(error: unknown) {
  return (
    error instanceof Error &&
    /(HTTP 409|unique_subtheme_graph_key|duplicate key|ya está en el grafo)/i.test(
      error.message,
    )
  );
}

function sortGraphs(graphs: VocabularyGraphSummary[]) {
  return [...graphs].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function enrichThemeAvailability(
  themes: VocabularyThemeContent[] | null | undefined,
  graphs: VocabularyGraphSummary[] | null | undefined,
  fallbackThemeIds: string[] = [],
) {
  const safeThemes = Array.isArray(themes) ? themes : [];
  const safeGraphs = Array.isArray(graphs) ? graphs : [];
  const unlockedThemeIds = new Set([
    ...safeGraphs.map((graph) => graph.themeId),
    ...fallbackThemeIds,
  ]);
  const fallbackOrderByThemeId = new Map(
    fallbackThemeIds.map((themeId, index) => [themeId, index]),
  );

  return safeThemes.map((theme) => ({
    ...theme,
    isUnlocked: unlockedThemeIds.has(theme.id),
    order: fallbackOrderByThemeId.get(theme.id) ?? null,
  }));
}

function buildTopRecommendationMap(recommendations: VocabularyRecommendation[]) {
  return recommendations
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .reduce<Partial<Record<string, { rank: number; similarity: number }>>>(
      (result, recommendation, index) => {
        result[recommendation.entityId] = {
          rank: index + 1,
          similarity: recommendation.similarity,
        };
        return result;
      },
      {},
    );
}

export function useVocabularyGraph() {
  const [graphs, setGraphs] = useState<VocabularyGraphSummary[]>([]);
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  const [rawProgress, setRawProgress] = useState<VocabularyGraphProgress | null>(null);
  const [themeCatalog, setThemeCatalog] = useState<VocabularyThemeContent[]>([]);
  const [themeSubthemes, setThemeSubthemes] = useState<VocabularySubthemeContent[]>([]);
  const [recommendedSubthemeMetaById, setRecommendedSubthemeMetaById] = useState<
    Partial<Record<string, { rank: number; similarity: number }>>
  >({});
  const [loading, setLoading] = useState(true);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);

  const selectedGraph = useMemo(
    () => graphs.find((graph) => graph.graphId === selectedGraphId) ?? null,
    [graphs, selectedGraphId],
  );

  const progress = useMemo(() => {
    if (!rawProgress) {
      return null;
    }

    const progressItems = rawProgress.items ?? [];

    return {
      ...rawProgress,
      items: progressItems.map((item) => {
        const matchedSubtheme = themeSubthemes.find((subtheme) =>
          isSameSubtheme(item, subtheme),
        );

        return matchedSubtheme
          ? {
              ...item,
              subthemeId: matchedSubtheme.id,
            }
          : item;
      }),
    };
  }, [rawProgress, themeSubthemes]);

  const loadGraphs = useCallback(async () => {
    const nextGraphs = sortGraphs(await listVocabularyGraphs());
    setGraphs(nextGraphs);

    setSelectedGraphId((current) => {
      if (current && nextGraphs.some((graph) => graph.graphId === current)) {
        return current;
      }

      return nextGraphs[0]?.graphId ?? null;
    });

    return nextGraphs;
  }, []);

  const loadThemeCatalog = useCallback(async (currentGraphs: VocabularyGraphSummary[]) => {
    const fallbackThemeIds = readOnboardingInterestThemeIds();

    try {
      const [themes, currentUser] = await Promise.all([
        listVocabularyThemes(),
        getCurrentUser().catch(() => null),
      ]);
      let availableGraphs = currentGraphs;

      if (
        currentUser?.subscribed === false &&
        currentGraphs.length === 0 &&
        fallbackThemeIds.length === 0 &&
        themes.length > 0
      ) {
        await Promise.allSettled(
          themes.map((theme) => createVocabularyGraph(theme.id)),
        );
        availableGraphs = await loadGraphs();
      }

      setThemeCatalog(enrichThemeAvailability(themes, availableGraphs, fallbackThemeIds));
    } catch (catalogError) {
      console.error("Error cargando catalogo de temas:", catalogError);
      try {
        const themes = await listVocabularyThemes();
        setThemeCatalog(enrichThemeAvailability(themes, currentGraphs, fallbackThemeIds));
      } catch {
        setThemeCatalog([]);
      }
    }
  }, [loadGraphs]);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    loadGraphs()
      .then((nextGraphs) => loadThemeCatalog(nextGraphs))
      .catch((loadError) => {
        console.error("Error cargando grafo de vocabulario:", loadError);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [loadGraphs, loadThemeCatalog]);

  const reloadProgress = useCallback(async () => {
    if (!selectedGraphId) {
      setRawProgress(null);
      setThemeSubthemes([]);
      setRecommendedSubthemeMetaById({});
      return null;
    }

    try {
      const nextProgress = await getVocabularyGraphProgress(selectedGraphId);
      setRawProgress(nextProgress);
      return nextProgress;
    } catch (progressError) {
      console.error("Error cargando progreso de vocabulario:", progressError);
      setRawProgress(null);
      return null;
    }
  }, [selectedGraphId]);

  useEffect(() => {
    void reloadProgress();
  }, [reloadProgress]);

  const loadThemeSubthemes = useCallback(async () => {
    if (!selectedGraph) {
      setThemeSubthemes([]);
      setRecommendedSubthemeMetaById({});
      return [] as VocabularySubthemeContent[];
    }

    try {
      const [subthemes, recommendations] = await Promise.all([
        listVocabularySubthemesByThemeId(selectedGraph.themeId),
        listVocabularyRecommendedSubthemesByThemeId(selectedGraph.themeId)
          .catch((recommendationError) => {
            console.error(
              "Error cargando recomendaciones de subtemas:",
              recommendationError,
            );
            return null as VocabularyRecommendation[] | null;
          }),
      ]);

      setThemeSubthemes(subthemes);
      setRecommendedSubthemeMetaById(
        recommendations ? buildTopRecommendationMap(recommendations) : {},
      );
      return subthemes;
    } catch (subthemesError) {
      console.error("Error cargando subtemas del tema:", subthemesError);
      setThemeSubthemes([]);
      setRecommendedSubthemeMetaById({});
      return [] as VocabularySubthemeContent[];
    }
  }, [selectedGraph]);

  useEffect(() => {
    void loadThemeSubthemes();
  }, [loadThemeSubthemes]);

  const createGraphFromTheme = useCallback(
    async (themeId: string) => {
      setActionPendingId(themeId);

      try {
        const created = await createVocabularyGraph(themeId);
        const nextGraphs = await loadGraphs();
        const nextGraphId =
          created.graphId ||
          nextGraphs.find((graph) => graph.themeId === themeId)?.graphId ||
          null;
        setSelectedGraphId(nextGraphId);
        await loadThemeCatalog(nextGraphs);
        return nextGraphId;
      } catch (actionError) {
        console.error("Error creando grafo de vocabulario:", actionError);
        return null;
      } finally {
        setActionPendingId(null);
      }
    },
    [loadGraphs, loadThemeCatalog],
  );

  const addSubthemeToGraph = useCallback(
    async (subthemeId: string) => {
      if (!selectedGraphId) return null;

      setActionPendingId(subthemeId);

      try {
        const selected = await selectVocabularySubtheme(selectedGraphId, subthemeId);
        await reloadProgress();
        await loadGraphs();
        await loadThemeSubthemes();
        return selected.nodeId;
      } catch (actionError) {
        if (isDuplicateSubthemeError(actionError)) {
          const [nextProgress, subthemes] = await Promise.all([
            reloadProgress(),
            loadThemeSubthemes(),
          ]);
          await loadGraphs();

          const matchedSubtheme = subthemes.find(
            (subtheme) => subtheme.id === subthemeId,
          );
          const existingItem = matchedSubtheme
            ? nextProgress?.items.find((item) => isSameSubtheme(item, matchedSubtheme))
            : null;

          if (existingItem) {
            return existingItem.nodeId;
          }
        }

        console.error("Error agregando subtema al grafo:", actionError);
        return null;
      } finally {
        setActionPendingId(null);
      }
    },
    [loadGraphs, loadThemeSubthemes, reloadProgress, selectedGraphId],
  );

  return {
    graphs,
    selectedGraph,
    selectedGraphId,
    progress,
    themeCatalog,
    themeSubthemes,
    recommendedSubthemeMetaById,
    loading,
    actionPendingId,
    setSelectedGraphId,
    createGraphFromTheme,
    addSubthemeToGraph,
    reloadProgress,
  };
}
