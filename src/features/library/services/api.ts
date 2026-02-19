import { apiFetch } from "@/shared/lib/api/client";
import type { FavoriteType, FavoritesResponse, RecentItemsResponse } from "@/features/library/types";

// ========================================
// FAVORITOS
// ========================================

/** GET /api/content/favorites → { kanji: [...], grammar: [...], word: [...] } */
export async function getFavorites(): Promise<FavoritesResponse> {
  return apiFetch<FavoritesResponse>("/api/content/favorites");
}

/** POST /api/content/favorites → { id, type: "kanji"|"grammar"|"word" } */
export async function addFavorite(
  id: string,
  type: FavoriteType
): Promise<void> {
  await apiFetch("/api/content/favorites", {
    method: "POST",
    body: JSON.stringify({ id, type }),
  });
}

/** DELETE /api/content/favorites/:type/:id */
export async function removeFavorite(id: string, type: FavoriteType): Promise<void> {
  await apiFetch(`/api/content/favorites/${type}/${id}`, { method: "DELETE" });
}

// ========================================
// RECIENTES
// ========================================

/** GET /api/content/recent → { kanji: [...], grammar_lesson: [...], word: [...] } */
export async function getRecentItems(): Promise<RecentItemsResponse> {
  return apiFetch<RecentItemsResponse>("/api/content/recent");
}

/** POST /api/content/recent → { entityType: "kanji"|"grammar"|"word", entityId: string } */
export async function addRecentItem(
  entityType: string,
  entityId: string
): Promise<void> {
  await apiFetch("/api/content/recent", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId }),
  });
}

/** DELETE /api/content/recent/all → elimina toda actividad reciente del usuario */
export async function clearRecentItems(): Promise<void> {
  await apiFetch("/api/content/recent/all", { method: "DELETE" });
}
