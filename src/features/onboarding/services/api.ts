import { apiFetch, invalidateApiCache } from "@/shared/lib/api/client";
import type {
  OnboardingTheme,
  SaveOnboardingInterestsResponse,
} from "@/features/onboarding/types";

const ONBOARDING_THEMES_CACHE_TTL_MS = 60_000;
const VOCABULARY_GRAPHS_CACHE_KEY = "study-vocabulary-graphs";

export async function getOnboardingThemes(): Promise<OnboardingTheme[]> {
  return apiFetch<OnboardingTheme[]>(
    "/api/content/themes",
    {},
    {
      dedupeKey: "onboarding-themes",
      cacheKey: "onboarding-themes",
      cacheTtlMs: ONBOARDING_THEMES_CACHE_TTL_MS,
    },
  );
}

export async function saveOnboardingInterests(
  themeIds: string[],
): Promise<SaveOnboardingInterestsResponse> {
  return apiFetch<SaveOnboardingInterestsResponse>("/api/content/interests", {
    method: "POST",
    body: JSON.stringify({ themeIds }),
  });
}

export async function ensureOnboardingVocabularyGraphs(themeIds: string[]) {
  const uniqueThemeIds = Array.from(new Set(themeIds.filter(Boolean)));

  await Promise.allSettled(
    uniqueThemeIds.map((themeId) =>
      apiFetch("/api/study/vocabulary/graphs", {
        method: "POST",
        body: JSON.stringify({ themeId }),
      }),
    ),
  );

  invalidateApiCache(VOCABULARY_GRAPHS_CACHE_KEY);
}
