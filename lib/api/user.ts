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
