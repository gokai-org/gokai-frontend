'use client';

import { useEffect, useState } from 'react';
import { 
  getFavorites, 
  addFavorite as addFavoriteAPI, 
  removeFavorite as removeFavoriteAPI,
  FavoriteItem 
} from '@/lib/api/user';

const STORAGE_KEY_ITEMS = 'favoriteItems';
const STORAGE_KEY_KANJIS = 'favoriteKanjis';

// Flag para habilitar sincronización con backend
// TENGO QUE CAMBIARLO A TRUE CUANDO EL BACKEND ESTÉ LISTO
const USE_BACKEND = false;

export function useFavorites() {
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [favoriteKanjis, setFavoriteKanjis] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (USE_BACKEND) {
          // Cargar desde backend
          const response = await getFavorites();
          const items = new Set<string>();
          const kanjis = new Set<string>();
          
          response.favorites.forEach(fav => {
            if (fav.type === 'kanji') {
              kanjis.add(fav.id);
            } else {
              items.add(fav.id);
            }
          });
          
          setFavoriteItems(items);
          setFavoriteKanjis(kanjis);
        } else {
          // Cargar desde localStorage
          const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
          const savedKanjis = localStorage.getItem(STORAGE_KEY_KANJIS);
          if (savedItems) setFavoriteItems(new Set(JSON.parse(savedItems)));
          if (savedKanjis) setFavoriteKanjis(new Set(JSON.parse(savedKanjis)));
        }
      } catch (e) {
        console.error('Error loading favorites:', e);
        // Fallback a localStorage en caso de error
        try {
          const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
          const savedKanjis = localStorage.getItem(STORAGE_KEY_KANJIS);
          if (savedItems) setFavoriteItems(new Set(JSON.parse(savedItems)));
          if (savedKanjis) setFavoriteKanjis(new Set(JSON.parse(savedKanjis)));
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const toggleFavoriteItem = async (id: string, type: FavoriteItem['type'] = 'lesson') => {
    const isFavorite = favoriteItems.has(id);

    setFavoriteItems(prev => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      
      // Guardar en localStorage siempre (backup local)
      try {
        localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify([...newFavorites]));
      } catch (e) {
        console.error('Error saving favorites to localStorage:', e);
      }
      
      return newFavorites;
    });

    // Sincronizar con backend si está habilitado
    if (USE_BACKEND) {
      try {
        if (isFavorite) {
          await removeFavoriteAPI(id);
        } else {
          await addFavoriteAPI(id, type);
        }
      } catch (e) {
        console.error('Error syncing favorite to backend:', e);
        // Revertir cambio en caso de error
        setFavoriteItems(prev => {
          const newFavorites = new Set(prev);
          if (isFavorite) {
            newFavorites.add(id);
          } else {
            newFavorites.delete(id);
          }
          localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify([...newFavorites]));
          return newFavorites;
        });
      }
    }
  };

  const toggleFavoriteKanji = async (id: string) => {
    const isFavorite = favoriteKanjis.has(id);

    setFavoriteKanjis(prev => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      
      // Guardar en localStorage siempre (backup local)
      try {
        localStorage.setItem(STORAGE_KEY_KANJIS, JSON.stringify([...newFavorites]));
      } catch (e) {
        console.error('Error saving kanji favorites to localStorage:', e);
      }
      
      return newFavorites;
    });

    // Sincronizar con backend si está habilitado
    if (USE_BACKEND) {
      try {
        if (isFavorite) {
          await removeFavoriteAPI(id);
        } else {
          await addFavoriteAPI(id, 'kanji');
        }
      } catch (e) {
        console.error('Error syncing kanji favorite to backend:', e);
        // Revertir cambio en caso de error
        setFavoriteKanjis(prev => {
          const newFavorites = new Set(prev);
          if (isFavorite) {
            newFavorites.add(id);
          } else {
            newFavorites.delete(id);
          }
          localStorage.setItem(STORAGE_KEY_KANJIS, JSON.stringify([...newFavorites]));
          return newFavorites;
        });
      }
    }
  };

  const getTotalFavorites = () => {
    return favoriteItems.size + favoriteKanjis.size;
  };

  return {
    favoriteItems,
    favoriteKanjis,
    toggleFavoriteItem,
    toggleFavoriteKanji,
    getTotalFavorites,
    loading,
  };
}
