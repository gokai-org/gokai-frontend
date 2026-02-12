import { apiFetch } from "./client";
import type {
  User,
  FavoriteItem,
  FavoritesResponse,
  RecentItem,
  RecentItemsResponse,
  UserInterest,
  InterestsResponse,
} from "@/shared/types/user";

// Re-export types for backwards compatibility
export type { User, FavoriteItem, FavoritesResponse, RecentItem, RecentItemsResponse, UserInterest, InterestsResponse };

// ========================================
// USUARIO
// ========================================

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/user");
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function updateUserEmail(email: string): Promise<void> {
  await apiFetch("/api/auth/user/email", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export async function updateUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiFetch("/api/auth/user/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function toggleTwoFactor(enabled: boolean): Promise<void> {
  await apiFetch("/api/auth/user/2fa", {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

export async function exportUserData(): Promise<Blob> {
  const response = await fetch("/api/auth/user/export");
  return response.blob();
}

export async function deleteUserAccount(): Promise<void> {
  await apiFetch("/api/auth/user", { method: "DELETE" });
}

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

// ========================================
// INTERESES
// ========================================

export async function getUserInterests(): Promise<InterestsResponse> {
  return apiFetch<InterestsResponse>("/api/user/interests");
}

export async function saveUserInterests(
  interests: UserInterest[]
): Promise<void> {
  await apiFetch("/api/user/interests", {
    method: "POST",
    body: JSON.stringify({ interests }),
  });
}

export async function updateUserInterests(
  interests: UserInterest[]
): Promise<void> {
  await apiFetch("/api/user/interests", {
    method: "PUT",
    body: JSON.stringify({ interests }),
  });
}
