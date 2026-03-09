import { apiFetch } from "@/shared/lib/api/client";
import type {
  OverviewStatsResponse,
  ActivityResponse,
  SkillsResponse,
  RecentActivityResponse,
  StreakCalendarResponse,
  StatsPeriod,
} from "@/features/stats/types";

/** GET /api/user/stats/overview?period=... */
export async function getStatsOverview(
  period: StatsPeriod = "week",
): Promise<OverviewStatsResponse> {
  return apiFetch<OverviewStatsResponse>(
    `/api/user/stats/overview?period=${period}`,
  );
}

/** GET /api/user/stats/activity
 *  Siempre devuelve ambas vistas: weekly + monthly. Sin parámetro de período.
 */
export async function getStatsActivity(): Promise<ActivityResponse> {
  return apiFetch<ActivityResponse>("/api/user/stats/activity");
}

/** GET /api/user/stats/skills */
export async function getStatsSkills(): Promise<SkillsResponse> {
  return apiFetch<SkillsResponse>("/api/user/stats/skills");
}

/** GET /api/user/stats/recent-activity */
export async function getStatsRecentActivity(): Promise<RecentActivityResponse> {
  return apiFetch<RecentActivityResponse>("/api/user/stats/recent-activity");
}

/** GET /api/user/stats/streak?weeks=... */
export async function getStatsStreak(
  weeks: number = 12,
): Promise<StreakCalendarResponse> {
  return apiFetch<StreakCalendarResponse>(
    `/api/user/stats/streak?weeks=${weeks}`,
  );
}
