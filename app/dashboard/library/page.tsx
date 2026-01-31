"use client";

import { useState, useEffect } from "react";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryCard } from "@/components/library/LibraryCard";
import { RecentCard } from "@/components/library/RecentCard";
import { CategoryFilter } from "@/components/library/CategoryFilter";
import { categories, sections } from "@/lib/mock/libraryData";
import { LibraryItem } from "@/types/library";
import { listKanjis } from "@/lib/api/content";
import type { Kanji } from "@/types/content";
import { KanjiDetailModal } from "@/components/kanji/KanjiDetailModal";

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [loadingKanjis, setLoadingKanjis] = useState(true);
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);

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

  const updatedCategories = categories.map(cat => 
    cat.id === 'kanji' ? { ...cat, count: kanjis.length } : cat
  );

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
                          <LibraryCard
                            key={item.id}
                            item={item}
                            onClick={() => setSelectedItem(item)}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {sections
                    .filter(section => section.id === 'recent')
                    .map((section) => {
                      const filteredItems = filterItems(section.items);
                      
                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={section.id}>
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                              {section.title}
                            </h2>
                            <button 
                              onClick={() => setSelectedCategory('recent')}
                              className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                            >
                              Ver todo →
                            </button>
                          </div>

                          <div className="space-y-3">
                            {filteredItems.slice(0, 6).map((item) => (
                              <RecentCard
                                key={item.id}
                                item={item}
                                onClick={() => setSelectedItem(item)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
                      <LibraryCard
                        key={item.id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
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
                      <LibraryCard
                        key={item.id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
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
                      <LibraryCard
                        key={item.id}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                </div>
              </div>
            </>
          )}

          {selectedCategory && selectedCategory !== 'kanji' && selectedCategory !== 'recent' && (
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
                    <LibraryCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedItem(item)}
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
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sections
                  .filter(s => s.id === 'recent')
                  .flatMap(s => s.items)
                  .map((item) => (
                    <LibraryCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedItem(item)}
                    />
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
                  <div
                    key={kanji.id}
                    onClick={() => setSelectedKanji(kanji)}
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
                ))}
              </div>
            </div>
          )}

          {!selectedCategory && sections.flatMap(s => s.items).length === 0 && kanjis.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-6xl mb-4">📚</div>
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