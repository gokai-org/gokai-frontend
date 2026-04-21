import { apiFetch } from "@/shared/lib/api/client";
import { handleClientAuthFailure } from "@/shared/lib/api/client";
import type {
  User,
  UserInterest,
  InterestsResponse,
} from "@/features/auth/types";

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
      const response = await fetch("/api/auth/user", {
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

export async function updateUserEmail(email: string): Promise<void> {
  await apiFetch("/api/auth/user/email", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export async function updateUserPassword(
  currentPassword: string,
  newPassword: string,
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
// INTERESES
// ========================================

export async function getUserInterests(): Promise<InterestsResponse> {
  return apiFetch<InterestsResponse>("/api/user/interests");
}

export async function saveUserInterests(
  interests: UserInterest[],
): Promise<void> {
  await apiFetch("/api/user/interests", {
    method: "POST",
    body: JSON.stringify({ interests }),
  });
}

export async function updateUserInterests(
  interests: UserInterest[],
): Promise<void> {
  await apiFetch("/api/user/interests", {
    method: "PUT",
    body: JSON.stringify({ interests }),
  });
}
