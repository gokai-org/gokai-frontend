'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getFavorites,
  addFavorite as addFavoriteAPI,
  removeFavorite as removeFavoriteAPI,
} from '@/features/library/services/api';
import type { FavoriteType, BackendFavoriteItem, FavoritesResponse } from '@/features/library/types';

const EMPTY_RESPONSE: FavoritesResponse = { kanji: [], grammar: [], word: [] };

export function useFavorites() {
  const [favoriteKanjis, setFavoriteKanjis] = useState<Set<string>>(new Set());
  const [favoriteGrammar, setFavoriteGrammar] = useState<Set<string>>(new Set());
  const [favoriteWords, setFavoriteWords] = useState<Set<string>>(new Set());

  const [favoriteData, setFavoriteData] = useState<FavoritesResponse>(EMPTY_RESPONSE);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const response = await getFavorites();
      const safeResponse: FavoritesResponse = {
        kanji: response.kanji ?? [],
        grammar: response.grammar ?? [],
        word: response.word ?? [],
      };
      setFavoriteData(safeResponse);
      setFavoriteKanjis(new Set(safeResponse.kanji.map(f => f.id)));
      setFavoriteGrammar(new Set(safeResponse.grammar.map(f => f.id)));
      setFavoriteWords(new Set(safeResponse.word.map(f => f.id)));
    } catch (e) {
      console.error('Error loading favorites:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  /** Verifica si un ID está marcado como favorito (en cualquier tipo) */
  const isFavorite = useCallback(
    (id: string) =>
      favoriteKanjis.has(id) || favoriteGrammar.has(id) || favoriteWords.has(id),
    [favoriteKanjis, favoriteGrammar, favoriteWords],
  );

  /** Toggle genérico – requiere indicar el tipo backend */
  const toggleFavorite = useCallback(
    async (id: string, type: FavoriteType) => {
      const setterMap: Record<FavoriteType, React.Dispatch<React.SetStateAction<Set<string>>>> = {
        kanji: setFavoriteKanjis,
        grammar: setFavoriteGrammar,
        word: setFavoriteWords,
      };
      const setter = setterMap[type];
      const wasFavorite = isFavorite(id);

      // Optimistic update
      setter(prev => {
        const next = new Set(prev);
        wasFavorite ? next.delete(id) : next.add(id);
        return next;
      });

      try {
        if (wasFavorite) {
          await removeFavoriteAPI(id, type);
        } else {
          await addFavoriteAPI(id, type);
        }
        // Reload para sincronizar datos completos
        await loadFavorites();
      } catch (e) {
        console.error('Error toggling favorite:', e);
        // Revertir en caso de error
        setter(prev => {
          const next = new Set(prev);
          wasFavorite ? next.add(id) : next.delete(id);
          return next;
        });
      }
    },
    [isFavorite, loadFavorites],
  );

  /** Atajo para toggle de kanjis */
  const toggleFavoriteKanji = useCallback(
    async (id: string) => toggleFavorite(id, 'kanji'),
    [toggleFavorite],
  );

  const getTotalFavorites = useCallback(
    () => favoriteKanjis.size + favoriteGrammar.size + favoriteWords.size,
    [favoriteKanjis, favoriteGrammar, favoriteWords],
  );

  return {
    favoriteKanjis,
    favoriteGrammar,
    favoriteWords,
    favoriteData,
    isFavorite,
    toggleFavorite,
    toggleFavoriteKanji,
    getTotalFavorites,
    loading,
  };
}
