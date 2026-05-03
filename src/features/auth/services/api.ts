import { apiFetch } from "@/shared/lib/api/client";
import { handleClientAuthFailure } from "@/shared/lib/api/client";
import type { User } from "@/features/auth/types";

let currentUserRequest: Promise<User | null> | null = null;

// ========================================
// USUARIO
// ========================================

export async function getCurrentUser(): Promise<User | null> {
  if (currentUserRequest) {
    return currentUserRequest;
  }

  currentUserRequest = (async () => {
    try {
      const response = await fetch("/api/users/me", {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) {
        handleClientAuthFailure(response);
        return null;
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    } finally {
      currentUserRequest = null;
    }
  })();

  return currentUserRequest;
}

export async function deleteUserAccount(): Promise<void> {
  await apiFetch("/api/users/me", { method: "DELETE" });
}
