'use client';

import { useEffect, useState } from 'react';
import { 
  getRecentItems, 
  addRecentItem as addRecentItemAPI, 
  clearRecentItems as clearRecentItemsAPI 
} from '@/lib/api/user';

export interface RecentItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  progress?: number;
  level?: string;
  category?: string;
  lastAccessed: string;
}

const MAX_RECENT_ITEMS = 20;
const STORAGE_KEY = 'recentItems';

// Flag para habilitar sincronización con backend
// TENGO QUE CAMBIARLO A TRUE CUANDO EL BACKEND ESTÉ LISTO
const USE_BACKEND = false;

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentItems = async () => {
      try {
        if (USE_BACKEND) {
          // Cargar desde backend
          const response = await getRecentItems();
          setRecentItems(response.recentItems);
        } else {
          // Cargar desde localStorage
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const items = JSON.parse(saved);
            setRecentItems(items);
          }
        }
      } catch (e) {
        console.error('Error loading recent items:', e);
        // Fallback a localStorage en caso de error
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const items = JSON.parse(saved);
            setRecentItems(items);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadRecentItems();
  }, []);

  const addRecentItem = async (item: Omit<RecentItem, 'lastAccessed'>) => {
    const newItem: RecentItem = {
      ...item,
      lastAccessed: new Date().toISOString(),
    };

    setRecentItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
      
      // Guardar en localStorage siempre (backup local)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recent items to localStorage:', e);
      }
      
      return updated;
    });

    // Sincronizar con backend si está habilitado
    if (USE_BACKEND) {
      try {
        await addRecentItemAPI(item);
      } catch (e) {
        console.error('Error syncing recent item to backend:', e);
        // El item ya está en el estado local, solo registramos el error
      }
    }
  };

  const clearRecentItems = async () => {
    setRecentItems([]);
    
    // Limpiar localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }

    // Sincronizar con backend si está habilitado
    if (USE_BACKEND) {
      try {
        await clearRecentItemsAPI();
      } catch (e) {
        console.error('Error clearing recent items in backend:', e);
      }
    }
  };

  const removeRecentItem = (id: string) => {
    setRecentItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      
      // Actualizar localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating recent items:', e);
      }
      
      return updated;
    });

    // Nota: Para eliminar items individuales en el backend,
    // se podría agregar un endpoint DELETE /api/user/recent/:id
  };

  return {
    recentItems,
    addRecentItem,
    clearRecentItems,
    removeRecentItem,
    loading,
  };
}
