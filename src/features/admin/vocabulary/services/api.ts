import { apiFetch } from "@/shared/lib/api/client";
import type {
  AdminVocabularyFormPayload,
  AdminVocabularySubtheme,
  AdminVocabularyTheme,
  AdminVocabularyWord,
} from "../types/vocabulary";

function normalizeArrayResponse<T>(response: T[] | null | undefined) {
  return Array.isArray(response) ? response : [];
}

export async function getAdminVocabularyThemes() {
  return normalizeArrayResponse(
    await apiFetch<AdminVocabularyTheme[] | null>("/admin/api/vocabulary/themes"),
  );
}

export async function getAdminVocabularySubthemes(themeId: string) {
  return normalizeArrayResponse(
    await apiFetch<AdminVocabularySubtheme[] | null>(
      `/admin/api/vocabulary/themes/${themeId}/subthemes`,
    ),
  );
}

export async function getAdminVocabularyWords(subthemeId: string) {
  return normalizeArrayResponse(
    await apiFetch<AdminVocabularyWord[] | null>(
      `/admin/api/vocabulary/subthemes/${subthemeId}/words`,
    ),
  );
}

export function createAdminVocabularyTheme(
  payload: AdminVocabularyFormPayload,
) {
  return apiFetch<AdminVocabularyTheme>("/admin/api/vocabulary/themes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminVocabularyTheme(
  id: string,
  payload: AdminVocabularyFormPayload,
) {
  return apiFetch<AdminVocabularyTheme>(`/admin/api/vocabulary/themes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminVocabularyTheme(id: string) {
  return apiFetch<AdminVocabularyTheme[]>(`/admin/api/vocabulary/themes/${id}`, {
    method: "DELETE",
  });
}

export function createAdminVocabularySubtheme(
  payload: AdminVocabularyFormPayload,
) {
  return apiFetch<AdminVocabularySubtheme>("/admin/api/vocabulary/subthemes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminVocabularySubtheme(
  id: string,
  payload: AdminVocabularyFormPayload,
) {
  return apiFetch<AdminVocabularySubtheme>(
    `/admin/api/vocabulary/subthemes/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteAdminVocabularySubtheme(id: string) {
  return apiFetch<{ success: boolean }>(
    `/admin/api/vocabulary/subthemes/${id}`,
    { method: "DELETE" },
  );
}

export function createAdminVocabularyWord(payload: AdminVocabularyFormPayload) {
  return apiFetch<AdminVocabularyWord>("/admin/api/vocabulary/words", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminVocabularyWord(
  id: string,
  payload: AdminVocabularyFormPayload,
) {
  return apiFetch<AdminVocabularyWord>(`/admin/api/vocabulary/words/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminVocabularyWord(id: string) {
  return apiFetch<{ success: boolean }>(`/admin/api/vocabulary/words/${id}`, {
    method: "DELETE",
  });
}