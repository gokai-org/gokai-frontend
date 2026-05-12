import { apiFetch } from "@/shared/lib/api/client";
import type { AdminStatsResponse } from "../types/stats";

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiFetch<AdminStatsResponse>("/admin/api/stats", {
    method: "GET",
  });
}