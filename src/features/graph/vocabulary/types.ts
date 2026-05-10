export type VocabularyAnswerType = "speaking" | "listening" | "meaning" | "writing";

export type VocabularyRecommendation = {
  id: string;
  entityId: string;
  lessonType: "theme" | "subtheme" | string;
  description: string;
  similarity: number;
  meaning?: string | null;
  kanji?: string | null;
  kana?: string | null;
};

export type VocabularyGraphSummary = {
  graphId: string;
  themeId: string;
  createdAt: string;
  meaning: string;
  kanji: string;
  kana: string;
  nodesCount: number;
};

export type VocabularyGraphProgressItem = {
  graphId: string;
  themeId: string;
  subthemeId?: string | null;
  meaning: string;
  kanji: string;
  kana: string;
  nodeId: string;
  order?: number | null;
  createdAt?: string | null;
  unlockedAt?: string | null;
  completedAt?: string | null;
  currentWordId?: string | null;
  unlockedWordIds?: string[] | null;
  wordProgress?: VocabularyWordProgress[] | null;
  speakingScore: number;
  listeningScore: number;
  meaningScore: number;
  writingScore: number;
  selectedAt: string | null;
};

export type VocabularyWordProgress = {
  wordId: string;
  order?: number | null;
  unlockedAt?: string | null;
  completedAt?: string | null;
  score?: number | null;
  progress?: number | null;
  completedQuizTypes?: VocabularyAnswerType[] | null;
  meaningCompleted?: boolean | null;
  listeningCompleted?: boolean | null;
  speakingCompleted?: boolean | null;
  writingCompleted?: boolean | null;
  meaningScore?: number | null;
  listeningScore?: number | null;
  speakingScore?: number | null;
  writingScore?: number | null;
  updatedAt?: string | null;
};

export type VocabularyGraphProgress = {
  graphId: string;
  themeId: string;
  items: VocabularyGraphProgressItem[] | null;
};

export type VocabularyGraphsResponse = {
  items: VocabularyGraphSummary[];
};

export type CreateVocabularyGraphResponse = {
  graphId: string;
  themeId: string;
  createdAt: string;
};

export type SelectVocabularySubthemeResponse = {
  nodeId: string;
};

export type VocabularyWritingOptionUnit = {
  symbol: string;
  kanaId?: string;
  traceable?: boolean;
  viewBox?: string;
  strokes?: string[];
};

export type VocabularyQuizOption = {
  option?: string;
  kanji?: string;
  hiragana?: string;
  correct?: boolean;
  units?: VocabularyWritingOptionUnit[];
};

export type VocabularyQuizQuestion = {
  type: VocabularyAnswerType;
  wordId: string;
  kanji?: string;
  hiragana?: string;
  meanings?: string[];
  audio?: string;
  options?: VocabularyQuizOption[] | string[];
};

export type VocabularyQuiz = {
  nodeId: string;
  subthemeId: string;
  type: VocabularyAnswerType;
  questions: VocabularyQuizQuestion[];
};

export type VocabularyThemeContent = {
  id: string;
  kanji: string;
  kana: string;
  meaning: string;
  released: boolean;
  isUnlocked?: boolean | null;
  selectedAt?: string | null;
  order?: number | null;
};

export type VocabularySubthemeContent = {
  id: string;
  themeId?: string;
  kanji: string;
  kana: string;
  meaning: string;
};

export type VocabularyWordContent = {
  id: string;
  subthemeId?: string | null;
  kanji?: string | null;
  hiragana?: string | null;
  icon?: string | null;
  meanings?: string[] | null;
  order?: number | null;
  unlockedAt?: string | null;
  completedAt?: string | null;
  score?: number | null;
};

export type VocabularyWordLesson = {
  wordId: string;
  kanji?: string;
  hiragana?: string;
  meanings?: string[];
  audio?: string;
  icon?: string | null;
  order?: number | null;
  unlockedAt?: string | null;
  completedAt?: string | null;
  score?: number | null;
  progress?: number | null;
  completedQuizTypes?: VocabularyAnswerType[] | null;
  meaningCompleted?: boolean | null;
  listeningCompleted?: boolean | null;
  speakingCompleted?: boolean | null;
  writingCompleted?: boolean | null;
  meaningScore?: number | null;
  listeningScore?: number | null;
  speakingScore?: number | null;
  writingScore?: number | null;
  updatedAt?: string | null;
};

export type VocabularyRegionId =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kansai"
  | "chugoku"
  | "shikoku"
  | "kyushu";

export type VocabularyViewLevel = "map" | "region" | "theme" | "subtheme";

export type VocabularyRegionThemeNode = {
  id: string;
  regionId: VocabularyRegionId;
  label: string;
  themeId?: string;
  graphId?: string;
  kanji?: string;
  kana?: string;
  status: "completed" | "available" | "locked";
  progress: number;
  isAvailable: boolean;
};

export type VocabularyRegionViewModel = {
  id: VocabularyRegionId;
  label: string;
  identity: string;
  themes: VocabularyRegionThemeNode[];
  color: string;
  availableCount: number;
  completedCount: number;
  activeCount: number;
};

export type VocabularyRegionBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export type VocabularyRegionNodePoint = {
  x: number;
  y: number;
};

export type VocabularySvgViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type VocabularyRegionLayout = {
  bounds: VocabularyRegionBounds;
  nodePoints: VocabularyRegionNodePoint[];
  viewport: VocabularySvgViewport;
};

export type VocabularyWordAnswer = {
  wordId: string;
  score: number;
  duration: number;
};

export type SaveVocabularyNodeAnswerRequest = {
  answerType: VocabularyAnswerType;
  answers: VocabularyWordAnswer[];
};

export type SaveVocabularyNodeAnswerResponse = {
  success: boolean;
  userPoints?: number;
  pointsAwarded?: number;
};

export type VocabularyNodeMastery = {
  total: number;
  completedTypes: number;
  average: number;
};
