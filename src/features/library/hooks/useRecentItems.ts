"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getRecentItems,
  addRecentItem as addRecentItemAPI,
  clearRecentItems as clearRecentItemsAPI,
} from "@/features/library/services/api";
import type { BackendRecentItem } from "@/features/library/types";

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<BackendRecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  /** Carga y aplana la respuesta agrupada del backend */
  const loadRecentItems = useCallback(async () => {
    try {
      const response = await getRecentItems();
      // Aplanar los tres grupos en un solo array ordenado por fecha
      const all: BackendRecentItem[] = [
        ...(response.kanji ?? []).map((item) => ({ ...item, type: item.type || "kanji" })),
        ...(response.grammar_lesson ?? []).map((item) => ({ ...item, type: item.type || "grammar_lesson" })),
        ...(response.word ?? []).map((item) => ({ ...item, type: item.type || "word" })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecentItems(all);
    } catch (e) {
      console.error("Error loading recent items:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentItems();
  }, [loadRecentItems]);

  /**
   * Registra una actividad reciente en el backend.
   * @param entityType "kanji" | "grammar" | "word"
   * @param entityId   UUID de la entidad
   */
  const addRecentItem = useCallback(
    async (entityType: string, entityId: string) => {
      try {
        await addRecentItemAPI(entityType, entityId);
        // Recargar para obtener la lista actualizada con datos enriquecidos
        await loadRecentItems();
      } catch (e) {
        console.error("Error adding recent item:", e);
      }
    },
    [loadRecentItems],
  );

  /** Elimina toda la actividad reciente del usuario */
  const clearRecentItems = useCallback(async () => {
    try {
      await clearRecentItemsAPI();
      setRecentItems([]);
    } catch (e) {
      console.error("Error clearing recent items:", e);
    }
  }, []);

  return {
    recentItems,
    addRecentItem,
    clearRecentItems,
    loading,
  };
}
