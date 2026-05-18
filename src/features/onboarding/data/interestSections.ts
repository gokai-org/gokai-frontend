import type {
  OnboardingInterestSection,
  OnboardingTheme,
} from "@/features/onboarding/types";
import {
  REGION_CONFIG,
  REGION_ORDER,
} from "@/features/graph/vocabulary/lib/vocabularyRegions";
import type { VocabularyRegionId } from "@/features/graph/vocabulary/types";

export const MAX_ONBOARDING_SELECTIONS = 8;

function isRegionId(value?: string | null): value is VocabularyRegionId {
  return REGION_ORDER.includes(value as VocabularyRegionId);
}

export function hydrateOnboardingInterestSections(
  themes: OnboardingTheme[],
): OnboardingInterestSection[] {
  return REGION_ORDER.map((regionId) => {
    const config = REGION_CONFIG[regionId];
    const regionThemes = themes
      .filter((theme) => isRegionId(theme.region) && theme.region === regionId)
      .sort((left, right) =>
        left.meaning.localeCompare(right.meaning, "es", { sensitivity: "base" }),
      );

    return {
      id: regionId,
      title: config.label,
      description: config.identity,
      interests: regionThemes.map((theme) => ({
        id: theme.id,
        kanji: theme.kanji || theme.kana || theme.meaning,
        meaning: theme.meaning,
        themeId: theme.id,
        backendTheme: theme,
      })),
    };
  }).filter((section) => section.interests.length > 0);
}
