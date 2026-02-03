import { apiFetch } from "./client";

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  plan?: 'free' | 'premium' | 'pro';
  createdAt?: string;
  twoFactorEnabled?: boolean;
  birthdate?: string;
  profile?: any;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/user");
    
    // Si no está autenticado o hay error, devolver null
    if (!response.ok) {
      console.log("User not authenticated or error fetching user");
      return null;
    }
    
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

export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
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
  await apiFetch("/api/auth/user", {
    method: "DELETE",
  });
}

// ========================================
// FAVORITOS
// ========================================

export interface FavoriteItem {
  id: string;
  type: 'lesson' | 'exercise' | 'kanji' | 'article';
  addedAt: string;
}

export interface FavoritesResponse {
  favorites: FavoriteItem[];
}

/**
 * Obtener todos los favoritos del usuario
 * GET /api/user/favorites
 */
export async function getFavorites(): Promise<FavoritesResponse> {
  return apiFetch<FavoritesResponse>("/api/user/favorites", {
    method: "GET",
  });
}

/**
 * Agregar un item a favoritos
 * POST /api/user/favorites
 * Body: { id: string, type: string }
 */
export async function addFavorite(id: string, type: FavoriteItem['type']): Promise<void> {
  await apiFetch("/api/user/favorites", {
    method: "POST",
    body: JSON.stringify({ id, type }),
  });
}

/**
 * Eliminar un item de favoritos
 * DELETE /api/user/favorites/:id
 */
export async function removeFavorite(id: string): Promise<void> {
  await apiFetch(`/api/user/favorites/${id}`, {
    method: "DELETE",
  });
}

// ========================================
// RECIENTES
// ========================================

export interface RecentItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  progress?: number;
  level?: string;
  category?: string;
  lastAccessed: string;
}

export interface RecentItemsResponse {
  recentItems: RecentItem[];
}

/**
 * Obtener items recientes del usuario
 * GET /api/user/recent
 */
export async function getRecentItems(): Promise<RecentItemsResponse> {
  return apiFetch<RecentItemsResponse>("/api/user/recent", {
    method: "GET",
  });
}

/**
 * Agregar un item a recientes
 * POST /api/user/recent
 * Body: RecentItem (sin lastAccessed, se genera en backend)
 */
export async function addRecentItem(item: Omit<RecentItem, 'lastAccessed'>): Promise<void> {
  await apiFetch("/api/user/recent", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

/**
 * Limpiar todos los items recientes
 * DELETE /api/user/recent
 */
export async function clearRecentItems(): Promise<void> {
  await apiFetch("/api/user/recent", {
    method: "DELETE",
  });
}

// ========================================
// INTERESES
// ========================================

export interface UserInterest {
  categoryId: string;
  interestId: string;
}

export interface InterestsResponse {
  interests: UserInterest[];
}

/**
 * Obtener las categorías de interés del usuario
 * GET /api/user/interests
 */
export async function getUserInterests(): Promise<InterestsResponse> {
  return apiFetch<InterestsResponse>("/api/user/interests", {
    method: "GET",
  });
}

/**
 * Guardar las categorías de interés seleccionadas (onboarding)
 * POST /api/user/interests
 * Body: { interests: UserInterest[] }
 */
export async function saveUserInterests(interests: UserInterest[]): Promise<void> {
  await apiFetch("/api/user/interests", {
    method: "POST",
    body: JSON.stringify({ interests }),
  });
}

/**
 * Actualizar las categorías de interés del usuario
 * PUT /api/user/interests
 * Body: { interests: UserInterest[] }
 */
export async function updateUserInterests(interests: UserInterest[]): Promise<void> {
  await apiFetch("/api/user/interests", {
    method: "PUT",
    body: JSON.stringify({ interests }),
  });
}
