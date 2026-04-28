import { apiFetch } from "@/shared/lib/api/client";
import type {
  OnboardingTheme,
  SaveOnboardingInterestsResponse,
} from "@/features/onboarding/types";

const ONBOARDING_THEMES_CACHE_TTL_MS = 60_000;

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
