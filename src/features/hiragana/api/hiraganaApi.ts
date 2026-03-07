import { apiFetch } from "@/shared/lib/api/client";
import type { Hiragana, HiraganaStrokeData } from "@/features/hiragana/types";

export function listHiraganas() {
  return apiFetch<Hiragana[]>("/api/content/hiragana", { cache: "no-store" });
}

export function getHiragana(id: string) {
  return apiFetch<Hiragana>(`/api/content/hiragana/${id}`, { cache: "no-store" });
}

export function getHiraganaStrokes(id: string) {
  return apiFetch<HiraganaStrokeData>(`/api/content/hiragana/${id}/strokes`, {
    cache: "no-store",
  });
}
