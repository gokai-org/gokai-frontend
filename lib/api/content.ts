import { apiFetch } from "./client";
import type { Kanji } from "@/types/content";

export function listKanjis() {
  return apiFetch<Kanji[]>("/api/content/kanji", { cache: "no-store" });
}

export function getKanji(id: string) {
  return apiFetch<Kanji>(`/api/content/kanji/${id}`, { cache: "no-store" });
}