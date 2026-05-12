import {
  apiFetch,
  handleClientAuthFailure,
  invalidateApiCache,
} from "@/shared/lib/api/client";
import type {
  CreateVocabularyGraphResponse,
  SaveVocabularyNodeAnswerRequest,
  SaveVocabularyNodeAnswerResponse,
  SelectVocabularySubthemeResponse,
  VocabularyGraphProgress,
  VocabularyGraphsResponse,
  VocabularyPronunciationFeedbackResponse,
  VocabularyRecommendation,
  VocabularyQuiz,
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

export async function listVocabularyThemes() {
  return apiFetch<VocabularyThemeContent[]>("/api/content/themes");
}

export async function listVocabularySubthemesByThemeId(themeId: string) {
  return apiFetch<VocabularySubthemeContent[]>(`/api/content/subthemes/${themeId}`);
}

export async function listVocabularyRecommendedSubthemesByThemeId(
  themeId: string,
  limit = 40,
) {
  const query = new URLSearchParams({
    themeId,
    limit: String(limit),
  });

  return apiFetch<VocabularyRecommendation[]>(
    `/api/content/recommendations/subthemes?${query.toString()}`,
  );
}

export async function listVocabularyWordsBySubthemeId(subthemeId: string) {
  return apiFetch<VocabularyWordContent[]>(`/api/content/words/${subthemeId}`);
}

export async function getVocabularyQuiz(
  nodeId: string,
  type: VocabularyAnswerType,
  wordId?: string,
) {
  const query = new URLSearchParams({ type });
  if (wordId) {
    query.set("wordId", wordId);
  }

  return apiFetch<VocabularyQuiz>(
    `/api/study/vocabulary/quiz/${nodeId}?${query.toString()}`,
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

async function readPronunciationError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => ({})) as {
      error?: string;
      detail?: string;
    };

    return data.error || data.detail || `HTTP ${response.status}`;
  }

  const text = await response.text().catch(() => "");
  return text || `HTTP ${response.status}`;
}

export async function getVocabularyPronunciationFeedback(
  wordId: string,
  audioFile: File,
) {
  const formData = new FormData();
  formData.append("wordId", wordId);
  formData.append("audio_file", audioFile, audioFile.name || "pronunciation.wav");

  const response = await fetch("/api/study/vocabulary/pronunciation-feedback", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    handleClientAuthFailure(response);
    throw new Error(await readPronunciationError(response));
  }

  return response.json() as Promise<VocabularyPronunciationFeedbackResponse>;
}

export function invalidateVocabularyGraphCaches() {
  invalidateApiCache(VOCABULARY_GRAPHS_CACHE_KEY);
}
