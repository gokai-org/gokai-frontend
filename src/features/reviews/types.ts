export type ReviewLessonType = "kanji" | "grammar" | "word";

export type ReviewItemType = "kanji" | "grammar" | "vocabulary";

export type ReviewExerciseType =
  | "kanji"
  | "meaning"
  | "reading"
  | "writing"
  | "listening"
  | "speaking";

export type ReviewStrategyKey =
  | "low_avg_score"
  | "low_recent_score"
  | "suboptimal_avg_duration"
  | "suboptimal_recent_duration"
  | "long_time_since_last_review"
  | "too_few_reviews"
  | "low_reading_score"
  | "low_writing_score"
  | "low_listening_score"
  | "low_speaking_score";

export interface ReviewStrategyRegisterItem {
  probability?: number;
  avg_reward?: number;
  evaluation_count?: number;
}

export interface ReviewStrategiesRegister {
  highest_avg_reward?: number;
  highest_reward_strategy?: number;
  low_avg_score?: ReviewStrategyRegisterItem;
  low_recent_score?: ReviewStrategyRegisterItem;
  suboptimal_avg_duration?: ReviewStrategyRegisterItem;
  suboptimal_recent_duration?: ReviewStrategyRegisterItem;
  long_time_since_last_review?: ReviewStrategyRegisterItem;
  too_few_reviews?: ReviewStrategyRegisterItem;
  low_reading_score?: ReviewStrategyRegisterItem;
  low_writing_score?: ReviewStrategyRegisterItem;
  low_listening_score?: ReviewStrategyRegisterItem;
  low_speaking_score?: ReviewStrategyRegisterItem;
}

export interface ReviewCurrentStreak {
  id: string;
  startedAt: string;
  days: number;
  isActive: boolean;
}

export interface ReviewStreakResponse {
  currentStreak?: ReviewCurrentStreak | null;
  history?: ReviewCurrentStreak[];
}

export interface ReviewRecommendation {
  lessonType: ReviewLessonType;
  entityId: string;
  nodeId?: string | null;
  exerciseType?: ReviewExerciseType | null;
  completedQuizTypes?: ReviewExerciseType[];
  strategy: string;
  kanji?: string | null;
  meanings?: string[];
  hiragana?: string | null;
  image?: string | null;
  readings?: string[];
  description?: string | null;
  title?: string | null;
}

export interface ReviewRecommendationsResponse {
  recommendations: ReviewRecommendation[];
}

export interface ReviewStrategySyncResponse {
  updated_review_strategies_register?: ReviewStrategiesRegister;
  error?: string;
}

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  lessonType: ReviewLessonType;
  entityId: string;
  nodeId?: string;
  exerciseType?: ReviewExerciseType;
  availableExerciseTypes?: ReviewExerciseType[];
  strategy: string;
  strategyLabel: string;
  title: string;
  description: string;
  exerciseLabel: string;
  actionLabel: string;
  detail?: string;
  symbol?: string;
  kana?: string;
  image?: string;
  meanings: string[];
  readings: string[];
}
