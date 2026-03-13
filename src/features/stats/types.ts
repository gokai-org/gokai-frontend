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
  studyHours: number;
  studyHoursTrend: number;
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

export interface RecentActivityEntry {
  id: string;
  type: "kanji" | "hiragana" | "katakana" | "vocabulary" | "grammar" | "review";
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

export interface StatsData {
  overview: OverviewStatsResponse | null;
  activity: ActivityResponse | null;
  skills: SkillsResponse | null;
  recentActivity: RecentActivityResponse | null;
  streakCalendar: StreakCalendarResponse | null;
}