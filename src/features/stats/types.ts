export type Streak = {
  id: string;
  userId: string;
  createdAt: string;
  endedAt: string | null;
};

export interface ApiErrorResponse {
  error: string;
}

export type StatsPeriod = "week" | "month" | "all";

export interface OverviewStatsResponse {
  studyMinutes: number;
  studyMinutesTrend: number;
  kanjiLearned: number;
  kanjiLearnedTrend: number;
  hiraganaLearned: number;
  hiraganaLearnedTrend: number;
  katakanaLearned: number;
  katakanaLearnedTrend: number;
  accuracy: number;
  accuracyTrend: number;
  currentStreak: number;
  reviewsCompleted: number;
  reviewsCompletedTrend: number;
}

export interface WeeklyActivityEntry {
  day: string;
  minutes: number;
}

export interface MonthlyProgressEntry {
  month: string;
  score: number;
  reviews: number;
  metric?: "accuracy" | "minutes";
}

export interface ActivityResponse {
  weekly: WeeklyActivityEntry[];
  monthly: MonthlyProgressEntry[];
}

export interface SkillEntry {
  skill: string;
  value: number;
}

export interface DistributionCategory {
  label: string;
  value: number;
}

export interface SkillsResponse {
  skills: SkillEntry[];
  distribution: {
    total: number;
    categories: DistributionCategory[];
  };
}

export type RecentActivityType =
  | "kanji"
  | "kana"
  | "hiragana"
  | "katakana"
  | "vocabulary"
  | "word"
  | "grammar"
  | "review"
  | "subtheme";

export interface RecentActivityEntry {
  id: string;
  type: RecentActivityType;
  title: string;
  description: string;
  createdAt: string;
  score?: number;
}

export interface RecentActivityResponse {
  activities: RecentActivityEntry[];
}

export interface StreakCalendarResponse {
  streakDays: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
}

export interface ActivitySecondsEntry {
  day: string;
  kanjiSeconds: number;
  kanaSeconds: number;
  grammarSeconds: number;
  vocabularySeconds: number;
}

export interface CompletedTotals {
  kanjiCompleted: number;
  kanjiTotal: number;
  kanaCompleted: number;
  kanaTotal: number;
  grammarCompleted: number;
  grammarTotal: number;
  wordsCompleted: number;
  wordsTotal: number;
}

export interface RecentAnsweredResponse {
  items: Array<Record<string, unknown>>;
  weeklyActivitySeconds: ActivitySecondsEntry[];
  monthlyActivitySeconds: ActivitySecondsEntry[];
  completedTotals: CompletedTotals;
  recentActivity: RecentActivityEntry[];
}

export interface StatsData {
  overview: OverviewStatsResponse | null;
  activity: ActivityResponse | null;
  skills: SkillsResponse | null;
  recentActivity: RecentActivityResponse | null;
  recentAnswers: RecentAnsweredResponse | null;
  streakCalendar: StreakCalendarResponse | null;
}
