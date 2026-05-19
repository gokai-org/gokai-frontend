import { apiFetch } from "@/shared/lib/api/client";
import type {
  AdminKanjiPayload,
  AdminKanjiRecord,
  AdminKanjiReorderItem,
} from "../types/kanji";

function normalizeArrayResponse<T>(response: T[] | null | undefined) {
  return Array.isArray(response) ? response : [];
}

export async function getAdminKanjis() {
  return normalizeArrayResponse(
    await apiFetch<AdminKanjiRecord[] | null>("/admin/api/kanji"),
  );
}

export function getAdminKanji(id: string) {
  return apiFetch<AdminKanjiRecord>(`/admin/api/kanji/${id}`);
}

export function createAdminKanji(payload: AdminKanjiPayload) {
  return apiFetch<AdminKanjiRecord>("/admin/api/kanji", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminKanji(id: string, payload: Partial<AdminKanjiPayload>) {
  return apiFetch<AdminKanjiRecord>(`/admin/api/kanji/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function reorderAdminKanjis(items: AdminKanjiReorderItem[]) {
  return apiFetch<{ success?: boolean }>("/admin/api/kanji/reorder", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export function deleteAdminKanji(id: string) {
  return apiFetch<AdminKanjiRecord[] | { success?: boolean }>(
    `/admin/api/kanji/${id}`,
    {
      method: "DELETE",
    },
  );
}