import { apiFetch } from "@/shared/lib/api/client";
import type {
  OverviewStatsResponse,
  ActivityResponse,
  SkillsResponse,
  RecentActivityResponse,
  RecentAnsweredResponse,
  StreakCalendarResponse,
  StatsPeriod,
} from "@/features/stats/types";

/** GET /api/users/stats/overview?period=... */
export async function getStatsOverview(
  period: StatsPeriod = "week",
): Promise<OverviewStatsResponse> {
  return apiFetch<OverviewStatsResponse>(
    `/api/users/stats/overview?period=${period}`,
  );
}

/** GET /api/users/stats/activity
 *  Siempre devuelve ambas vistas: weekly + monthly. Sin parámetro de período.
 */
export async function getStatsActivity(): Promise<ActivityResponse> {
  return apiFetch<ActivityResponse>("/api/users/stats/activity");
}

/** GET /api/users/stats/skills */
export async function getStatsSkills(): Promise<SkillsResponse> {
  return apiFetch<SkillsResponse>("/api/users/stats/skills");
}

/** GET /api/users/stats/recent-activity */
export async function getStatsRecentActivity(): Promise<RecentActivityResponse> {
  return apiFetch<RecentActivityResponse>("/api/users/stats/recent-activity");
}

/** GET /api/users/stats/recent-answers */
export async function getStatsRecentAnswers(): Promise<RecentAnsweredResponse> {
  return apiFetch<RecentAnsweredResponse>("/api/users/stats/recent-answers");
}

/** GET /api/users/stats/streak?weeks=... */
export async function getStatsStreak(
  weeks: number = 12,
): Promise<StreakCalendarResponse> {
  return apiFetch<StreakCalendarResponse>(
    `/api/users/stats/streak?weeks=${weeks}`,
  );
}
