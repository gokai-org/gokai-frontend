import { apiFetch } from "@/shared/lib/api/client";
import type { BackendUser, UpdateUserRequest } from "../types/users";

export async function getAdminUsers(): Promise<BackendUser[]> {
  return apiFetch<BackendUser[]>("/admin/api/users", {
    method: "GET",
  });
}

export async function getAdminUser(id: string): Promise<BackendUser> {
  return apiFetch<BackendUser>(`/admin/api/users/${id}`, {
    method: "GET",
  });
}

export async function updateAdminUser(
  id: string,
  payload: UpdateUserRequest,
): Promise<BackendUser> {
  return apiFetch<BackendUser>(`/admin/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiFetch(`/admin/api/users/${id}`, {
    method: "DELETE",
  });
}
