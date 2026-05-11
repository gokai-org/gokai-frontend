export type OnboardingTheme = {
  id: string;
  kanji: string;
  kana?: string | null;
  meaning: string;
  released?: boolean;
};

export type OnboardingInterestDefinition = {
  id: string;
  kanji: string;
  meaning: string;
  matchMeanings?: string[];
  matchKanji?: string[];
};

export type OnboardingInterest = OnboardingInterestDefinition & {
  themeId: string | null;
  backendTheme: OnboardingTheme | null;
};

export type OnboardingInterestSectionDefinition = {
  id: string;
  title: string;
  description: string;
  interests: OnboardingInterestDefinition[];
};

export type OnboardingInterestSection = Omit<
  OnboardingInterestSectionDefinition,
  "interests"
> & {
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
