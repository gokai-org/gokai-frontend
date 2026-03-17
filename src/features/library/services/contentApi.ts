import { apiFetch } from "@/shared/lib/api/client";
import type { Theme, Subtheme, Word } from "@/features/library/types";

export async function listThemes(): Promise<Theme[]> {
  return apiFetch<Theme[]>("/api/content/themes");
}

export async function getThemeById(id: string): Promise<Theme> {
  return apiFetch<Theme>(`/api/content/themes/${id}`);
}

export async function listSubthemesByThemeId(
  themeId: string,
): Promise<Subtheme[]> {
  return apiFetch<Subtheme[]>(`/api/content/subthemes/${themeId}`);
}

export async function listWordsBySubthemeId(
  subthemeId: string,
): Promise<Word[]> {
  return apiFetch<Word[]>(`/api/content/words/${subthemeId}`);
}