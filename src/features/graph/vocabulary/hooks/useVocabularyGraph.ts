import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/features/auth/services/api";
import { readOnboardingInterestThemeIds } from "@/features/onboarding/lib/interestThemeStorage";
import {
  getUserEntitlements,
  type VocabularyThemeUnlockScope,
} from "@/shared/lib/userAccess";
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
  item: Pick<VocabularyGraphProgressItem, "subthemeId" | "meaning" | "kanji" | "kana">,
  subtheme: Pick<VocabularySubthemeContent, "id" | "meaning" | "kanji" | "kana">,
) {
  if (item.subthemeId && subtheme.id) {
    return item.subthemeId === subtheme.id;
  }

  return (
    normalizeText(item.meaning) === normalizeText(subtheme.meaning) &&
    normalizeText(item.kanji) === normalizeText(subtheme.kanji) &&
    normalizeText(item.kana) === normalizeText(subtheme.kana)
  );
}

function isDuplicateSubthemeError(error: unknown) {
  const normalizedMessage = normalizeText(
    error instanceof Error
      ? error.message.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : typeof error === "string"
        ? error.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        : "",
  );

  return (
    normalizedMessage.includes("http 409") &&
    (normalizedMessage.includes("ya esta en el grafo") ||
      normalizedMessage.includes("unique_subtheme_graph_key") ||
      normalizedMessage.includes("duplicate key"))
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
  unlockScope: VocabularyThemeUnlockScope = "selected",
) {
  const safeThemes = Array.isArray(themes) ? themes : [];
  const safeGraphs = Array.isArray(graphs) ? graphs : [];
  const unlockAllThemes = unlockScope === "all";
  const unlockedThemeIds = new Set([
    ...safeGraphs.map((graph) => graph.themeId),
    ...fallbackThemeIds,
  ]);
  const fallbackOrderByThemeId = new Map(
    fallbackThemeIds.map((themeId, index) => [themeId, index]),
  );

  return safeThemes.map((theme) => ({
    ...theme,
    isUnlocked: unlockAllThemes || unlockedThemeIds.has(theme.id),
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
  const [selectedGraphIdState, setSelectedGraphIdState] = useState<string | null>(null);
  const [rawProgress, setRawProgress] = useState<VocabularyGraphProgress | null>(null);
  const [themeCatalog, setThemeCatalog] = useState<VocabularyThemeContent[]>([]);
  const [themeSubthemes, setThemeSubthemes] = useState<VocabularySubthemeContent[]>([]);
  const [recommendedSubthemeMetaById, setRecommendedSubthemeMetaById] = useState<
    Partial<Record<string, { rank: number; similarity: number }>>
  >({});
  const [loading, setLoading] = useState(true);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const selectedGraphIdRef = useRef<string | null>(null);
  const selectedGraphId = selectedGraphIdState;

  const setSelectedGraphId = useCallback((nextGraphId: string | null) => {
    selectedGraphIdRef.current = nextGraphId;
    setSelectedGraphIdState(nextGraphId);
  }, []);

  useEffect(() => {
    selectedGraphIdRef.current = selectedGraphIdState;
  }, [selectedGraphIdState]);

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
        if (item.subthemeId) {
          return item;
        }

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

    setSelectedGraphIdState((current) => {
      if (current && nextGraphs.some((graph) => graph.graphId === current)) {
        selectedGraphIdRef.current = current;
        return current;
      }

      const nextSelectedGraphId = nextGraphs[0]?.graphId ?? null;
      selectedGraphIdRef.current = nextSelectedGraphId;
      return nextSelectedGraphId;
    });

    return nextGraphs;
  }, []);

  const loadThemeCatalog = useCallback(async (currentGraphs: VocabularyGraphSummary[]) => {
    try {
      const [themes, currentUser] = await Promise.all([
        listVocabularyThemes(),
        getCurrentUser().catch(() => null),
      ]);
      const fallbackThemeIds = readOnboardingInterestThemeIds(currentUser?.id);
      const entitlements = getUserEntitlements(currentUser);
      let availableGraphs = currentGraphs;

      if (
        currentUser &&
        !entitlements.hasFullVocabularyAccess &&
        currentGraphs.length === 0 &&
        fallbackThemeIds.length === 0 &&
        themes.length > 0
      ) {
        await Promise.allSettled(
          themes.map((theme) => createVocabularyGraph(theme.id)),
        );
        availableGraphs = await loadGraphs();
      }

      setThemeCatalog(
        enrichThemeAvailability(
          themes,
          availableGraphs,
          fallbackThemeIds,
          entitlements.vocabularyThemeUnlockScope,
        ),
      );
    } catch (catalogError) {
      console.error("Error cargando catalogo de temas:", catalogError);
      try {
        const [themes, currentUser] = await Promise.all([
          listVocabularyThemes(),
          getCurrentUser().catch(() => null),
        ]);
        const fallbackThemeIds = readOnboardingInterestThemeIds(currentUser?.id);
        const entitlements = getUserEntitlements(currentUser);

        setThemeCatalog(
          enrichThemeAvailability(
            themes,
            currentGraphs,
            fallbackThemeIds,
            entitlements.vocabularyThemeUnlockScope,
          ),
        );
      } catch {
        setThemeCatalog([]);
      }
    }
  }, [loadGraphs]);

  const reloadCatalog = useCallback(async () => {
    const nextGraphs = await loadGraphs();
    await loadThemeCatalog(nextGraphs);
    return nextGraphs;
  }, [loadGraphs, loadThemeCatalog]);

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
  }, [loadGraphs, loadThemeCatalog, setSelectedGraphId]);

  const reloadProgress = useCallback(async (graphIdOverride?: string | null) => {
    const graphId = graphIdOverride ?? selectedGraphIdRef.current ?? selectedGraphId;

    if (!graphId) {
      setRawProgress(null);
      setThemeSubthemes([]);
      setRecommendedSubthemeMetaById({});
      return null;
    }

    try {
      const nextProgress = await getVocabularyGraphProgress(graphId);
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

  const loadSubthemesForTheme = useCallback(async (themeId: string) => {
    try {
      const [subthemes, recommendations] = await Promise.all([
        listVocabularySubthemesByThemeId(themeId),
        listVocabularyRecommendedSubthemesByThemeId(themeId)
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
  }, []);

  const loadThemeSubthemes = useCallback(async () => {
    if (!selectedGraph) {
      setThemeSubthemes([]);
      setRecommendedSubthemeMetaById({});
      return [] as VocabularySubthemeContent[];
    }

    return loadSubthemesForTheme(selectedGraph.themeId);
  }, [loadSubthemesForTheme, selectedGraph]);

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
    [loadGraphs, loadThemeCatalog, setSelectedGraphId],
  );

  const addSubthemeToGraph = useCallback(
    async (
      subthemeId: string,
      options?: { graphId?: string | null; themeId?: string | null },
    ) => {
      const graphId = options?.graphId ?? selectedGraphIdRef.current;
      if (!graphId) return null;

      const themeId =
        options?.themeId ??
        selectedGraph?.themeId ??
        graphs.find((graph) => graph.graphId === graphId)?.themeId ??
        null;

      setActionPendingId(subthemeId);

      try {
        const selected = await selectVocabularySubtheme(graphId, subthemeId);
        await reloadProgress(graphId);
        await loadGraphs();
        if (themeId) {
          await loadSubthemesForTheme(themeId);
        } else {
          await loadThemeSubthemes();
        }
        return selected.nodeId;
      } catch (actionError) {
        if (isDuplicateSubthemeError(actionError)) {
          const [nextProgress, nextSubthemes] = await Promise.all([
            reloadProgress(graphId),
            themeId ? loadSubthemesForTheme(themeId) : loadThemeSubthemes(),
          ]);
          await loadGraphs();

          const matchedSubtheme = nextSubthemes.find((subtheme) => subtheme.id === subthemeId);
          const existingItem =
            nextProgress?.items.find((item) => item.subthemeId === subthemeId) ??
            (matchedSubtheme
              ? nextProgress?.items.find((item) => isSameSubtheme(item, matchedSubtheme))
              : null);

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
    [graphs, loadGraphs, loadSubthemesForTheme, loadThemeSubthemes, reloadProgress, selectedGraph],
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
    reloadCatalog,
  };
}
