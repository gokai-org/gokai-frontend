"use client";

import { useState, useEffect } from "react";
import { LibraryHeader } from "@/features/library/components/LibraryHeader";
import { ContentCard } from "@/features/library/components/ContentCard";
import { RecentCard } from "@/features/library/components/RecentCard";
import { CategoryFilter } from "@/features/library/components/CategoryFilter";
import { KanjiGridCard } from "@/features/kanji/components/KanjiGridCard";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { categories, sections } from "@/features/library/mock/libraryData";
import { LibraryItem } from "@/features/library/types";
import { listKanjis } from "@/features/library/services/content";
import type { Kanji } from "@/shared/types/content";
import { KanjiDetailModal } from "@/features/kanji/components/KanjiDetailModal";
import { useRecentItems } from "@/features/library/hooks/useRecentItems";
import { useFavorites } from "@/features/library/hooks/useFavorites";

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

  const allItems = sections.flatMap(s => s.items);

  const updatedCategories = [
    { id: 'favoritos', name: 'Favoritos', icon: '', count: getTotalFavorites(), color: 'bg-red-500' },
    { id: 'recent', name: 'Reciente', icon: '', count: recentItems.length, color: 'bg-gray-500' },
    ...categories.filter(c => c.id !== 'recent').map(cat => 
      cat.id === 'kanji' ? { ...cat, count: kanjis.length } : cat
    )
  ];

  return (
    <DashboardShell header={<LibraryHeader />}>
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
                    <SectionHeader
                      className="mb-4"
                      title="Lecciones"
                      action={
                        <button
                          onClick={() => setSelectedCategory("leccion")}
                          className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                        >
                          Ver todo →
                        </button>
                      }
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {allItems
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
                    <SectionHeader
                      className="mb-4"
                      title="Reciente"
                      action={
                        recentItems.length > 0 ? (
                          <button
                            onClick={() => setSelectedCategory("recent")}
                            className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                          >
                            Ver todo →
                          </button>
                        ) : null
                      }
                    />

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
                <SectionHeader
                  className="mb-4"
                  title="Gramática"
                  action={
                    <button
                      onClick={() => setSelectedCategory("gramatica")}
                      className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                    >
                      Ver todo →
                    </button>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {allItems
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
                <SectionHeader
                  className="mb-4"
                  title="Ejercicios"
                  action={
                    <button
                      onClick={() => setSelectedCategory("ejercicio")}
                      className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                    >
                      Ver todo →
                    </button>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {allItems
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
                <SectionHeader
                  className="mb-4"
                  title="Vocabulario"
                  action={
                    <button
                      onClick={() => setSelectedCategory("vocabulario")}
                      className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                    >
                      Ver todo →
                    </button>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {allItems
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
                    {allItems
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
                        <KanjiGridCard
                          key={kanji.id}
                          kanji={kanji}
                          onClick={() => handleKanjiClick(kanji)}
                          onFavoriteToggle={toggleFavoriteKanji}
                          isFavorite={true}
                        />
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
                {allItems
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
                  <ContentCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      if (item.category === 'kanji') {
                        const kanji = kanjis.find(k => k.id === item.id);
                        if (kanji) handleKanjiClick(kanji);
                      } else {
                        const libraryItem = allItems.find(i => i.id === item.id);
                        if (libraryItem) setSelectedItem(libraryItem);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {(!selectedCategory || selectedCategory === 'kanji') && !loadingKanjis && kanjis.length > 0 && (
            <div className="mb-10">
              <SectionHeader
                className="mb-4"
                title="Colección de Kanjis"
                action={
                  <button
                    onClick={() => setSelectedCategory("kanji")}
                    className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                  >
                    Ver todo ({kanjis.length}) →
                  </button>
                }
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {(selectedCategory === 'kanji' ? kanjis : kanjis.slice(0, 12)).map((kanji) => (
                  <KanjiGridCard
                    key={kanji.id}
                    kanji={kanji}
                    onClick={() => handleKanjiClick(kanji)}
                    onFavoriteToggle={toggleFavoriteKanji}
                    isFavorite={favoriteKanjis.has(kanji.id)}
                    showMeaningCount={true}
                  />
                ))}
              </div>
            </div>
          )}

          {!selectedCategory && allItems.length === 0 && kanjis.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No hay contenido
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                No encontramos contenido disponible.
              </p>
            </div>
          )}
      <KanjiDetailModal
        kanji={selectedKanji}
        onClose={() => setSelectedKanji(null)}
      />
    </DashboardShell>
  );
}