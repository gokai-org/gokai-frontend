import { apiFetch, invalidateApiCache } from "@/shared/lib/api/client";
import type {
  CreateVocabularyGraphResponse,
  SaveVocabularyNodeAnswerRequest,
  SaveVocabularyNodeAnswerResponse,
  SelectVocabularySubthemeResponse,
  VocabularyGraphProgress,
  VocabularyGraphsResponse,
  VocabularyQuiz,
  VocabularyRecommendation,
  VocabularyAnswerType,
  VocabularySubthemeContent,
  VocabularyThemeContent,
  VocabularyWordContent,
} from "../types";

const VOCABULARY_GRAPHS_CACHE_KEY = "study-vocabulary-graphs";
const CACHE_TTL_MS = 30_000;

export async function listVocabularyGraphs() {
  const response = await apiFetch<VocabularyGraphsResponse>(
    "/api/study/vocabulary/graphs",
    {},
    {
      dedupeKey: VOCABULARY_GRAPHS_CACHE_KEY,
      cacheKey: VOCABULARY_GRAPHS_CACHE_KEY,
      cacheTtlMs: CACHE_TTL_MS,
    },
  );

  return response.items ?? [];
}

export async function createVocabularyGraph(themeId: string) {
  const response = await apiFetch<CreateVocabularyGraphResponse>(
    "/api/study/vocabulary/graphs",
    {
      method: "POST",
      body: JSON.stringify({ themeId }),
    },
  );

  invalidateVocabularyGraphCaches();
  return response;
}

export async function getVocabularyGraphProgress(graphId: string) {
  const response = await apiFetch<VocabularyGraphProgress>(
    `/api/study/vocabulary/graphs/${graphId}/progress`,
  );

  return {
    ...response,
    items: response.items ?? [],
  };
}

export async function selectVocabularySubtheme(
  graphId: string,
  subthemeId: string,
) {
  const response = await apiFetch<SelectVocabularySubthemeResponse>(
    `/api/study/vocabulary/graphs/${graphId}/subthemes`,
    {
      method: "POST",
      body: JSON.stringify({ subthemeId }),
    },
  );

  invalidateVocabularyGraphCaches();
  return response;
}

export async function listVocabularySubthemeRecommendations(
  themeId: string,
  limit = 12,
) {
  return apiFetch<VocabularyRecommendation[]>(
    `/api/content/recommendations/subthemes?themeId=${encodeURIComponent(themeId)}&limit=${limit}`,
  );
}

export async function listVocabularyThemeRecommendations(limit = 24) {
  return apiFetch<VocabularyRecommendation[]>(
    `/api/content/recommendations/themes?limit=${limit}`,
  );
}

export async function listVocabularyThemes() {
  return apiFetch<VocabularyThemeContent[]>("/api/content/themes");
}

export async function listVocabularySubthemesByThemeId(themeId: string) {
  return apiFetch<VocabularySubthemeContent[]>(`/api/content/subthemes/${themeId}`);
}

export async function listVocabularyWordsBySubthemeId(subthemeId: string) {
  return apiFetch<VocabularyWordContent[]>(`/api/content/words/${subthemeId}`);
}

export async function getVocabularyQuiz(
  nodeId: string,
  type: VocabularyAnswerType,
) {
  return apiFetch<VocabularyQuiz>(
    `/api/study/vocabulary/quiz/${nodeId}?type=${type}`,
  );
}

export async function saveVocabularyNodeAnswers(
  nodeId: string,
  payload: SaveVocabularyNodeAnswerRequest,
) {
  const response = await apiFetch<SaveVocabularyNodeAnswerResponse>(
    `/api/study/vocabulary/nodes/${nodeId}/answers`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  invalidateVocabularyGraphCaches();
  return response;
}

export function invalidateVocabularyGraphCaches() {
  invalidateApiCache(VOCABULARY_GRAPHS_CACHE_KEY);
}
