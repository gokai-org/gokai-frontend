import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createVocabularyGraph,
  getVocabularyGraphProgress,
  listVocabularyGraphs,
  listVocabularySubthemesByThemeId,
  listVocabularySubthemeRecommendations,
  listVocabularyThemes,
  selectVocabularySubtheme,
} from "../services/api";
import type {
  VocabularyGraphProgress,
  VocabularyGraphProgressItem,
  VocabularyGraphSummary,
  VocabularyRecommendation,
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

function enrichSubthemeRecommendation(
  recommendation: VocabularyRecommendation,
  subthemes: VocabularySubthemeContent[],
): VocabularyRecommendation {
  const match = subthemes.find((subtheme) => subtheme.id === recommendation.entityId);

  return {
    ...recommendation,
    meaning: match?.meaning ?? recommendation.description,
    kanji: match?.kanji ?? null,
    kana: match?.kana ?? null,
  };
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

export function useVocabularyGraph() {
  const [graphs, setGraphs] = useState<VocabularyGraphSummary[]>([]);
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  const [rawProgress, setRawProgress] = useState<VocabularyGraphProgress | null>(null);
  const [themeCatalog, setThemeCatalog] = useState<VocabularyThemeContent[]>([]);
  const [subthemeRecommendations, setSubthemeRecommendations] = useState<
    VocabularyRecommendation[]
  >([]);
  const [selectedGraphSubthemes, setSelectedGraphSubthemes] = useState<
    VocabularySubthemeContent[]
  >([]);
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
        const matchedSubtheme = selectedGraphSubthemes.find((subtheme) =>
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
  }, [rawProgress, selectedGraphSubthemes]);

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

  const loadThemeCatalog = useCallback(async () => {
    try {
      const themes = await listVocabularyThemes();
      setThemeCatalog(themes);
    } catch (catalogError) {
      console.error("Error cargando catalogo de temas:", catalogError);
      setThemeCatalog([]);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    Promise.all([loadGraphs(), loadThemeCatalog()])
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
      setSubthemeRecommendations([]);
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

  const loadSubthemeRecommendations = useCallback(async () => {
    if (!selectedGraph) {
      setSelectedGraphSubthemes([]);
      setSubthemeRecommendations([]);
      return [] as VocabularySubthemeContent[];
    }

    try {
      const [recommendations, subthemes] = await Promise.all([
        listVocabularySubthemeRecommendations(selectedGraph.themeId, 16),
        listVocabularySubthemesByThemeId(selectedGraph.themeId),
      ]);
      setSelectedGraphSubthemes(subthemes);
      setSubthemeRecommendations(
        recommendations.map((recommendation) =>
          enrichSubthemeRecommendation(recommendation, subthemes),
        ),
      );
      return subthemes;
    } catch (recommendationError) {
      console.error(
        "Error cargando recomendaciones de subtemas:",
        recommendationError,
      );
      setSelectedGraphSubthemes([]);
      setSubthemeRecommendations([]);
      return [] as VocabularySubthemeContent[];
    }
  }, [selectedGraph]);

  useEffect(() => {
    void loadSubthemeRecommendations();
  }, [loadSubthemeRecommendations]);

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
        await loadThemeCatalog();
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
        await loadSubthemeRecommendations();
        return selected.nodeId;
      } catch (actionError) {
        if (isDuplicateSubthemeError(actionError)) {
          const [nextProgress, subthemes] = await Promise.all([
            reloadProgress(),
            loadSubthemeRecommendations(),
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
    [loadGraphs, loadSubthemeRecommendations, reloadProgress, selectedGraphId],
  );

  return {
    graphs,
    selectedGraph,
    selectedGraphId,
    progress,
    themeCatalog,
    subthemeRecommendations,
    loading,
    actionPendingId,
    setSelectedGraphId,
    createGraphFromTheme,
    addSubthemeToGraph,
    reloadProgress,
  };
}
