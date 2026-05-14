import { apiFetch } from "@/shared/lib/api/client";

import type {
  ReviewRecommendationsResponse,
  ReviewStreakResponse,
  ReviewStrategySyncResponse,
} from "../types";

export async function listReviewRecommendations(limit = 10) {
  const query = new URLSearchParams({ limit: String(limit) });

  return apiFetch<ReviewRecommendationsResponse>(
    `/api/study/reviews?${query.toString()}`,
    { cache: "no-store" },
    { dedupeKey: `/api/study/reviews?${query.toString()}` },
  );
}

export async function syncReviewRecommendationStrategies() {
  return apiFetch<ReviewStrategySyncResponse>("/api/study/reviews", {
    method: "POST",
  });
}

export async function getUserReviewStreak() {
  return apiFetch<ReviewStreakResponse>("/api/users/streaks", {
    cache: "no-store",
  });
}