import { apiFetch } from "@/shared/lib/api/client";
import type { Katakana, KatakanaStrokeData } from "@/features/katakana/types";

export function listKatakanas() {
  return apiFetch<Katakana[]>("/api/content/katakana", { cache: "no-store" });
}

export function getKatakana(id: string) {
  return apiFetch<Katakana>(`/api/content/katakana/${id}`, { cache: "no-store" });
}

export function getKatakanaStrokes(id: string) {
  return apiFetch<KatakanaStrokeData>(`/api/content/katakana/${id}/strokes`, {
    cache: "no-store",
  });
}
