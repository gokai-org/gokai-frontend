"use client";

import { useState, useEffect } from "react";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { ContentCard } from "@/components/library/ContentCard";
import { RecentCard } from "@/components/library/RecentCard";
import { CategoryFilter } from "@/components/library/CategoryFilter";
import { categories, sections } from "@/lib/mock/libraryData";
import { LibraryItem } from "@/types/library";
import { listKanjis } from "@/lib/api/content";
import type { Kanji } from "@/types/content";
import { KanjiDetailModal } from "@/components/kanji/KanjiDetailModal";
import { useRecentItems } from "@/hooks/useRecentItems";
import { useFavorites } from "@/hooks/useFavorites";

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [loadingKanjis, setLoadingKanjis] = useState(true);
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);
  
  const { recentItems, addRecentItem } = useRecentItems();
  const { favoriteItems, favoriteKanjis, toggleFavoriteItem, toggleFavoriteKanji, getTotalFavorites } = useFavorites();

  const handleItemClick = (item: LibraryItem) => {
    // Agregar a items recientes
    addRecentItem({
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      progress: item.progress,
      level: item.level,
      category: item.category,
    });
    
    // Abrir el item
    setSelectedItem(item);
  };

  const handleKanjiClick = (kanji: Kanji) => {
    // Agregar a items recientes
    addRecentItem({
      id: kanji.id,
      title: kanji.meanings[0] || kanji.symbol,
      description: kanji.readings.length > 0 ? `音: ${kanji.readings[0]}` : undefined,
      thumbnail: kanji.symbol,
      level: `N${kanji.points_to_unlock / 10}`,
      category: 'kanji',
    });
    
    // Abrir modal
    setSelectedKanji(kanji);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await listKanjis();
        setKanjis(res);
      } catch (e) {
        console.error('Error loading kanjis:', e);
      } finally {
        setLoadingKanjis(false);
      }
    })();
  }, []);

  const filterItems = (items: LibraryItem[]) => {
    if (!selectedCategory) return items;
    return items.filter(item => item.category === selectedCategory);
  };

  const updatedCategories = [
    { id: 'favoritos', name: 'Favoritos', icon: '', count: getTotalFavorites(), color: 'bg-red-500' },
    { id: 'recent', name: 'Reciente', icon: '', count: recentItems.length, color: 'bg-gray-500' },
    ...categories.filter(c => c.id !== 'recent').map(cat => 
      cat.id === 'kanji' ? { ...cat, count: kanjis.length } : cat
    )
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      <LibraryHeader />

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <CategoryFilter
              categories={updatedCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {!selectedCategory && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 space-y-10">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        Lecciones
                      </h2>
                      <button 
                        onClick={() => setSelectedCategory('leccion')}
                        className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                      >
                        Ver todo →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {sections
                        .flatMap(s => s.items)
                        .filter(item => item.category === 'leccion')
                        .slice(0, 8)
                        .map((item) => (
                          <ContentCard
                            key={item.id}
                            item={item}
                            onClick={() => handleItemClick(item)}
                            onFavoriteToggle={(id) => toggleFavoriteItem(id, 'lesson')}
                            isFavorite={favoriteItems.has(item.id)}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        Reciente
                      </h2>
                      {recentItems.length > 0 && (
                        <button 
                          onClick={() => setSelectedCategory('recent')}
                          className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                        >
                          Ver todo →
                        </button>
                      )}
                    </div>

                    {recentItems.length > 0 ? (
                      <div className="space-y-3">
                        {recentItems.slice(0, 6).map((item) => (
                          <RecentCard
                            key={item.id}
                            item={item}
                            onClick={() => {
                              if (item.category === 'kanji') {
                                const kanji = kanjis.find(k => k.id === item.id);
                                if (kanji) handleKanjiClick(kanji);
                              } else {
                                const libraryItem = sections
                                  .flatMap(s => s.items)
                                  .find(i => i.id === item.id);
                                if (libraryItem) setSelectedItem(libraryItem);
                              }
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                        <p className="text-sm text-gray-500">
                          Aún no has explorado contenido.<br />
                          Los elementos que visites aparecerán aquí.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Gramática
                  </h2>
                  <button 
                    onClick={() => setSelectedCategory('gramatica')}
                    className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                  >
                    Ver todo →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {sections
                    .flatMap(s => s.items)
                    .filter(item => item.category === 'gramatica')
                    .slice(0, 12)
                    .map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        onClick={() => handleItemClick(item)}
                        onFavoriteToggle={(id) => toggleFavoriteItem(id, 'lesson')}
                        isFavorite={favoriteItems.has(item.id)}
                      />
                    ))}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Ejercicios
                  </h2>
                  <button 
                    onClick={() => setSelectedCategory('ejercicio')}
                    className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                  >
                    Ver todo →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {sections
                    .flatMap(s => s.items)
                    .filter(item => item.category === 'ejercicio')
                    .slice(0, 12)
                    .map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        onClick={() => handleItemClick(item)}
                        onFavoriteToggle={(id) => toggleFavoriteItem(id, 'exercise')}
                        isFavorite={favoriteItems.has(item.id)}
                      />
                    ))}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Vocabulario
                  </h2>
                  <button 
                    onClick={() => setSelectedCategory('vocabulario')}
                    className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                  >
                    Ver todo →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {sections
                    .flatMap(s => s.items)
                    .filter(item => item.category === 'vocabulario')
                    .slice(0, 12)
                    .map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        onClick={() => handleItemClick(item)}
                        onFavoriteToggle={(id) => toggleFavoriteItem(id, 'lesson')}
                        isFavorite={favoriteItems.has(item.id)}
                      />
                    ))}
                </div>
              </div>
            </>
          )}

          {selectedCategory === 'favoritos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Mis Favoritos
                </h2>
                <span className="text-sm text-gray-600">
                  {favoriteItems.size + favoriteKanjis.size} elementos
                </span>
              </div>

              {favoriteItems.size > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contenido</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {sections
                      .flatMap(s => s.items)
                      .filter(item => favoriteItems.has(item.id))
                      .map((item) => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          onClick={() => handleItemClick(item)}
                          onFavoriteToggle={(id) => toggleFavoriteItem(id, 'lesson')}
                          isFavorite={favoriteItems.has(item.id)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {favoriteKanjis.size > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Kanjis</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {kanjis
                      .filter(kanji => favoriteKanjis.has(kanji.id))
                      .map((kanji) => (
                        <div key={kanji.id} className="relative">
                          <div
                            onClick={() => handleKanjiClick(kanji)}
                            className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#993331] hover:shadow-lg transition-all duration-300 cursor-pointer"
                          >
                            <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                              <span className="relative z-10 text-6xl font-bold text-gray-900">
                                {kanji.symbol}
                              </span>
                            </div>
                            <div className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#993331] transition-colors">
                                  {kanji.meanings[0] || 'Sin significado'}
                                </h3>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-purple-100 text-purple-700">
                                  N{kanji.points_to_unlock / 10}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                {kanji.readings.length > 0 && `音: ${kanji.readings[0]}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteKanji(kanji.id);
                            }}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
                          >
                            <svg className="w-4 h-4 fill-red-500 text-red-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {favoriteItems.size === 0 && favoriteKanjis.size === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No tienes favoritos aún
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Agrega contenido a favoritos haciendo clic en el corazón en cualquier elemento.
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedCategory && selectedCategory !== 'kanji' && selectedCategory !== 'recent' && selectedCategory !== 'favoritos' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {updatedCategories.find(c => c.id === selectedCategory)?.name || 'Contenido'}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sections
                  .flatMap(s => s.items)
                  .filter(item => item.category === selectedCategory)
                  .map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      onClick={() => {
                        handleItemClick(item);
                        setSelectedItem(item);
                      }}
                      onFavoriteToggle={(id) => toggleFavoriteItem(id, 'lesson')}
                      isFavorite={favoriteItems.has(item.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {selectedCategory === 'recent' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Reciente
                </h2>
                <span className="text-sm text-gray-600">
                  {recentItems.length} elementos
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recentItems.map((item) => (
                  <div key={item.id} className="relative">
                    <div
                      onClick={() => {
                        if (item.category === 'kanji') {
                          const kanji = kanjis.find(k => k.id === item.id);
                          if (kanji) handleKanjiClick(kanji);
                        } else {
                          const libraryItem = sections
                            .flatMap(s => s.items)
                            .find(i => i.id === item.id);
                          if (libraryItem) setSelectedItem(libraryItem);
                        }
                      }}
                      className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#993331] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                        <span className="relative z-10 text-6xl font-bold text-gray-900">
                          {item.thumbnail}
                        </span>
                      </div>

                      <div className="p-3 flex-1 flex flex-col min-h-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#993331] transition-colors">
                            {item.title}
                          </h3>
                          {item.level && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-purple-100 text-purple-700">
                              {item.level}
                            </span>
                          )}
                        </div>
                        
                        {item.description && (
                          <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-auto pt-2 min-h-[22px]">
                          {item.progress !== undefined && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all duration-300 bg-[#993331]"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 shrink-0">
                                {item.progress}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!selectedCategory || selectedCategory === 'kanji') && !loadingKanjis && kanjis.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Colección de Kanjis
                </h2>
                <button 
                  onClick={() => setSelectedCategory('kanji')}
                  className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                >
                  Ver todo ({kanjis.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {(selectedCategory === 'kanji' ? kanjis : kanjis.slice(0, 12)).map((kanji) => (
                  <div key={kanji.id} className="relative">
                    <div
                      onClick={() => handleKanjiClick(kanji)}
                      className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#993331] hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                        <span className="relative z-10 text-6xl font-bold text-gray-900">
                          {kanji.symbol}
                        </span>
                      </div>

                      
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#993331] transition-colors">
                            {kanji.meanings[0] || 'Sin significado'}
                          </h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-purple-100 text-purple-700">
                            N{kanji.points_to_unlock / 10}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                          {kanji.readings.length > 0 && `音: ${kanji.readings[0]}`}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                            <span>{kanji.meanings.length} significados</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteKanji(kanji.id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
                    >
                      <svg className={`w-4 h-4 ${favoriteKanjis.has(kanji.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedCategory && sections.flatMap(s => s.items).length === 0 && kanjis.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No hay contenido
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                No encontramos contenido disponible.
              </p>
            </div>
          )}
        </div>
      </div>

      <KanjiDetailModal
        kanji={selectedKanji}
        onClose={() => setSelectedKanji(null)}
      />
    </div>
  );
}