import { apiFetch } from "@/shared/lib/api/client";
import type { FavoriteItem, FavoritesResponse, RecentItem, RecentItemsResponse } from "@/features/library/types";

// ========================================
// FAVORITOS
// ========================================

export async function getFavorites(): Promise<FavoritesResponse> {
  return apiFetch<FavoritesResponse>("/api/user/favorites");
}

export async function addFavorite(
  id: string,
  type: FavoriteItem["type"]
): Promise<void> {
  await apiFetch("/api/user/favorites", {
    method: "POST",
    body: JSON.stringify({ id, type }),
  });
}

export async function removeFavorite(id: string): Promise<void> {
  await apiFetch(`/api/user/favorites/${id}`, { method: "DELETE" });
}

// ========================================
// RECIENTES
// ========================================

export async function getRecentItems(): Promise<RecentItemsResponse> {
  return apiFetch<RecentItemsResponse>("/api/user/recent");
}

export async function addRecentItem(
  item: Omit<RecentItem, "lastAccessed">
): Promise<void> {
  await apiFetch("/api/user/recent", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function clearRecentItems(): Promise<void> {
  await apiFetch("/api/user/recent", { method: "DELETE" });
}
