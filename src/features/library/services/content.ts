import { apiFetch } from "@/shared/lib/api/client";
import type { Kanji } from "@/shared/types/content";

export function listKanjis() {
  return apiFetch<Kanji[]>("/api/content/kanji", { cache: "no-store" });
}

export function getKanji(id: string) {
  return apiFetch<Kanji>(`/api/content/kanji/${id}`, { cache: "no-store" });
}