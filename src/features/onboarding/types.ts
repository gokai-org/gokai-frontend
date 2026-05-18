export type OnboardingTheme = {
  id: string;
  kanji: string;
  kana?: string | null;
  meaning: string;
  region?: string | null;
  released?: boolean;
};

export type OnboardingInterest = {
  id: string;
  kanji: string;
  meaning: string;
  themeId: string | null;
  backendTheme: OnboardingTheme | null;
};

export type OnboardingInterestSection = {
  id: string;
  title: string;
  description: string;
  interests: OnboardingInterest[];
};

export type SelectedOnboardingInterests = Record<string, string>;

export type SaveOnboardingInterestsResponse = {
  id: string;
  userId: string;
  themes: string[];
  embeddingUpdated?: boolean;
  embeddingWarning?: string;
};

export type OnboardingKanaKnowledgeChoice = "exam" | "learn";

export type OnboardingKanaAssessmentSelections = Record<
  "hiragana" | "katakana",
  OnboardingKanaKnowledgeChoice | null
>;
