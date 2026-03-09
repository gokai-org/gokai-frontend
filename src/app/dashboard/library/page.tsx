"use client";

import { useState, useEffect, useMemo } from "react";
import { LibraryHeader } from "@/features/library/components/LibraryHeader";
import { ContentCard } from "@/features/library/components/ContentCard";
import { RecentCard } from "@/features/library/components/RecentCard";
import type { RecentItemProps } from "@/features/library/components/RecentCard";
import { CategoryFilter } from "@/features/library/components/CategoryFilter";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import type { BackendFavoriteItem, BackendRecentItem, FavoriteType, LibraryCategory } from "@/features/library/types";
import { listKanjis } from "@/features/kanji/api/kanjiApi";
import type { Kanji } from "@/features/kanji/types";
import { KanjiDetailModal } from "@/features/kanji/components/KanjiDetailModal";
import { useRecentItems } from "@/features/library/hooks/useRecentItems";
import { useFavorites } from "@/features/library/hooks/useFavorites";
import { getPrimaryMeaning, getPrimaryReading } from "@/features/kanji/utils/kanjiText";
import { listKatakanas } from "@/features/katakana/api/katakanaApi";
import type { Katakana } from "@/features/katakana/types";
import { getPrimaryMeaning as getKatakanaMeaning, getPrimaryReading as getKatakanaReading } from "@/features/katakana/utils/katakanaText";
import { listHiraganas } from "@/features/hiragana/api/hiraganaApi";
import type { Hiragana } from "@/features/hiragana/types";
import { getPrimaryMeaning as getHiraganaMeaning, getPrimaryReading as getHiraganaReading } from "@/features/hiragana/utils/hiraganaText";
import { LibrarySkeleton, SkeletonSection, SkeletonCard } from "@/shared/ui/Skeleton";

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [loadingKanjis, setLoadingKanjis] = useState(true);
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);

  // ── Katakana state ────────────────────────────────────────
  const [katakanas, setKatakanas] = useState<Katakana[]>([]);
  const [loadingKatakanas, setLoadingKatakanas] = useState(true);

  // ── Hiragana state ────────────────────────────────────────
  const [hiraganas, setHiraganas] = useState<Hiragana[]>([]);
  const [loadingHiraganas, setLoadingHiraganas] = useState(true);

  const { recentItems, addRecentItem } = useRecentItems();
  const {
    favoriteKanjis,
    favoriteData,
    isFavorite,
    toggleFavorite,
    toggleFavoriteKanji,
    getTotalFavorites,
  } = useFavorites();

  const handleKanjiClick = (kanji: Kanji) => {
    addRecentItem("kanji", kanji.id);
    setSelectedKanji(kanji);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await listKanjis();
        setKanjis(res);
      } catch (e) {
        console.error("Error loading kanjis:", e);
      } finally {
        setLoadingKanjis(false);
      }
    })();

    (async () => {
      try {
        const res = await listKatakanas();
        setKatakanas(res);
      } catch (e) {
        console.error("Error loading katakanas:", e);
      } finally {
        setLoadingKatakanas(false);
      }
    })();

    (async () => {
      try {
        const res = await listHiraganas();
        setHiraganas(res);
      } catch (e) {
        console.error("Error loading hiraganas:", e);
      } finally {
        setLoadingHiraganas(false);
      }
    })();
  }, []);

  // ── Búsqueda ──────────────────────────────────────────────
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredKanjis = useMemo(() => {
    if (!normalizedQuery) return kanjis;
    return kanjis.filter((k) => {
      const meaning = getPrimaryMeaning(k.meanings) || "";
      const reading = getPrimaryReading(k.readings) || "";
      return (
        k.symbol.toLowerCase().includes(normalizedQuery) ||
        meaning.toLowerCase().includes(normalizedQuery) ||
        reading.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [kanjis, normalizedQuery]);

  const filteredKatakanas = useMemo(() => {
    if (!normalizedQuery) return katakanas;
    return katakanas.filter((k) => {
      const meaning = getKatakanaMeaning(k.meanings) || "";
      const reading = getKatakanaReading(k.readings) || "";
      return (
        k.symbol.toLowerCase().includes(normalizedQuery) ||
        meaning.toLowerCase().includes(normalizedQuery) ||
        reading.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [katakanas, normalizedQuery]);

  const filteredHiraganas = useMemo(() => {
    if (!normalizedQuery) return hiraganas;
    return hiraganas.filter((h) => {
      const meaning = getHiraganaMeaning(h.meanings) || "";
      const reading = getHiraganaReading(h.readings) || "";
      return (
        h.symbol.toLowerCase().includes(normalizedQuery) ||
        meaning.toLowerCase().includes(normalizedQuery) ||
        reading.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [hiraganas, normalizedQuery]);

  // ── Categorías dinámicas ──────────────────────────────────
  const dynamicCategories: LibraryCategory[] = [
    { id: "favoritos", name: "Favoritos", icon: "", count: getTotalFavorites(), color: "bg-red-500" },
    { id: "recent", name: "Reciente", icon: "", count: recentItems.length, color: "bg-gray-500" },
    { id: "kanji", name: "Kanjis", icon: "", count: kanjis.length, color: "bg-purple-500" },
    { id: "katakana", name: "Katakana", icon: "", count: katakanas.length, color: "bg-blue-500" },
    { id: "hiragana", name: "Hiragana", icon: "", count: hiraganas.length, color: "bg-green-500" },
  ];

  // ── Helpers de mapeo ──────────────────────────────────────
  function kanjiToCard(kanji: Kanji) {
    const meaning = getPrimaryMeaning(kanji.meanings) || kanji.symbol;
    const reading = getPrimaryReading(kanji.readings);

    const meaningsCount = Array.isArray(kanji.meanings)
      ? kanji.meanings.length
      : (kanji.meanings?.es?.length ?? 0) + (kanji.meanings?.en?.length ?? 0) + (kanji.meanings?.other?.length ?? 0);

    const readingsCount = Array.isArray(kanji.readings)
      ? kanji.readings.length
      : (kanji.readings?.on?.length ?? 0) + (kanji.readings?.kun?.length ?? 0) + (kanji.readings?.other?.length ?? 0);

    return {
      id: kanji.id,
      title: meaning,
      subtitle: reading ? `Lectura: ${reading}` : "Sin lectura",
      thumbnail: kanji.symbol,
      meta: `${readingsCount || 0} lecturas • ${meaningsCount || 0} significados`,
    };
  }

  function katakanaToCard(katakana: Katakana) {
    const meaning = getKatakanaMeaning(katakana.meanings) || katakana.symbol;
    const reading = getKatakanaReading(katakana.readings);
    return {
      id: katakana.id,
      title: meaning,
      subtitle: reading ? `Lectura: ${reading}` : "Sin lectura",
      thumbnail: katakana.symbol,
    };
  }

  function hiraganaToCard(hiragana: Hiragana) {
    const meaning = getHiraganaMeaning(hiragana.meanings) || hiragana.symbol;
    const reading = getHiraganaReading(hiragana.readings);
    return {
      id: hiragana.id,
      title: meaning,
      subtitle: reading ? `Lectura: ${reading}` : "Sin lectura",
      thumbnail: hiragana.symbol,
    };
  }

  function recentToCardProps(item: BackendRecentItem): RecentItemProps {
    switch (item.type) {
      case "kanji": {
        const kanji = kanjis.find((k) => k.id === item.id);
        return {
          id: item.id,
          title: kanji
            ? getPrimaryMeaning(kanji.meanings) || kanji.symbol
            : item.symbol || "漢",
          description: kanji
            ? getPrimaryReading(kanji.readings)
              ? `音: ${getPrimaryReading(kanji.readings)}`
              : undefined
            : undefined,
          thumbnail: item.symbol || kanji?.symbol || "漢",
          category: "kanji",
          lastAccessed: item.createdAt,
        };
      }
      case "grammar_lesson":
      case "grammar":
        return {
          id: item.id,
          title: item.title || "Gramática",
          description: item.description || undefined,
          thumbnail: "文",
          category: "grammar",
          lastAccessed: item.createdAt,
        };
      case "word": {
        const meanings = Array.isArray(item.meanings)
          ? (item.meanings as string[]).join(", ")
          : undefined;
        return {
          id: item.id,
          title: item.kanjiWord || item.hiragana || "Palabra",
          description: meanings,
          thumbnail: item.kanjiWord || item.hiragana || "言",
          category: "word",
          lastAccessed: item.createdAt,
        };
      }
      default:
        return { id: item.id, title: "Elemento", thumbnail: "?", lastAccessed: item.createdAt };
    }
  }

  function grammarFavToCard(fav: BackendFavoriteItem) {
    return {
      id: fav.id,
      title: fav.title || "Gramática",
      subtitle: fav.description || undefined,
      thumbnail: "文",
    };
  }

  function wordFavToCard(fav: BackendFavoriteItem) {
    let parsedMeanings: string | undefined;
    if (fav.meanings) {
      try {
        const arr = JSON.parse(fav.meanings);
        if (Array.isArray(arr)) parsedMeanings = arr.join(", ");
      } catch {
        /* ignora */
      }
    }
    return {
      id: fav.id,
      title: fav.kanjiWord || fav.hiragana || "Palabra",
      subtitle: parsedMeanings || fav.hiragana || undefined,
      thumbnail: fav.kanjiWord || fav.hiragana || "言",
    };
  }

  // ── Render ────────────────────────────────────────────────
  const isSearching = normalizedQuery.length > 0;
  const isGlobalLoading = loadingKanjis && loadingKatakanas && loadingHiraganas;

  return (
    <DashboardShell header={<LibraryHeader onSearchChange={setSearchQuery} />}>
      {isGlobalLoading ? (
        <LibrarySkeleton />
      ) : (
        <>
      {/* Filtro de categorías */}
      <div className="mb-8">
        <CategoryFilter
          categories={dynamicCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSearchQuery("");
          }}
        />
      </div>

      {/* ════════ Resultados de búsqueda ════════ */}
      {isSearching && !selectedCategory && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Resultados para &ldquo;{searchQuery.trim()}&rdquo;
            </h2>
            <span className="text-sm text-gray-600">
              {filteredKanjis.length + filteredKatakanas.length + filteredHiraganas.length} resultados
            </span>
          </div>

          {filteredKanjis.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kanjis</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredKanjis.map((kanji) => (
                  <ContentCard
                    key={kanji.id}
                    {...kanjiToCard(kanji)}
                    onClick={() => handleKanjiClick(kanji)}
                    onFavoriteToggle={toggleFavoriteKanji}
                    isFavorite={favoriteKanjis.has(kanji.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredKatakanas.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Katakana</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredKatakanas.map((katakana) => (
                  <ContentCard key={katakana.id} {...katakanaToCard(katakana)} />
                ))}
              </div>
            </div>
          )}

          {filteredHiraganas.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Hiragana</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredHiraganas.map((hiragana) => (
                  <ContentCard key={hiragana.id} {...hiraganaToCard(hiragana)} />
                ))}
              </div>
            </div>
          )}

          {filteredKanjis.length === 0 && filteredKatakanas.length === 0 && filteredHiraganas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin resultados</h3>
              <p className="text-gray-600 text-center max-w-md">
                No encontramos contenido que coincida con &ldquo;{searchQuery.trim()}&rdquo;.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════ Vista principal (sin filtro) ════════ */}
      {!selectedCategory && !isSearching && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Kanjis destacados */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <SectionHeader
                  className="mb-4"
                  title="Kanjis"
                  action={
                    <button
                      onClick={() => setSelectedCategory("kanji")}
                      className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                    >
                      Ver todo ({kanjis.length}) →
                    </button>
                  }
                />
                {loadingKanjis ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {kanjis.slice(0, 8).map((kanji) => (
                      <ContentCard
                        key={kanji.id}
                        {...kanjiToCard(kanji)}
                        onClick={() => handleKanjiClick(kanji)}
                        onFavoriteToggle={toggleFavoriteKanji}
                        isFavorite={favoriteKanjis.has(kanji.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Recientes */}
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
                        item={recentToCardProps(item)}
                        onClick={() => {
                          if (item.type === "kanji") {
                            const kanji = kanjis.find((k) => k.id === item.id);
                            if (kanji) handleKanjiClick(kanji);
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                    <p className="text-sm text-gray-500">
                      Aún no has explorado contenido.
                      <br />
                      Los elementos que visites aparecerán aquí.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Katakana destacados */}
          {!loadingKatakanas && katakanas.length > 0 && (
            <div className="mb-10">
              <SectionHeader
                className="mb-4"
                title="Katakana"
                action={
                  <button
                    onClick={() => setSelectedCategory("katakana")}
                    className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                  >
                    Ver todo ({katakanas.length}) →
                  </button>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {katakanas.slice(0, 12).map((katakana) => (
                  <ContentCard key={katakana.id} {...katakanaToCard(katakana)} />
                ))}
              </div>
            </div>
          )}

          {/* Hiragana destacados */}
          {!loadingHiraganas && hiraganas.length > 0 && (
            <div className="mb-10">
              <SectionHeader
                className="mb-4"
                title="Hiragana"
                action={
                  <button
                    onClick={() => setSelectedCategory("hiragana")}
                    className="text-sm font-medium text-[#993331] hover:text-[#882d2d] transition-colors"
                  >
                    Ver todo ({hiraganas.length}) →
                  </button>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {hiraganas.slice(0, 12).map((hiragana) => (
                  <ContentCard key={hiragana.id} {...hiraganaToCard(hiragana)} />
                ))}
              </div>
            </div>
          )}

          {/* Más kanjis */}
          {!loadingKanjis && kanjis.length > 8 && (
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
                {kanjis.slice(8, 24).map((kanji) => (
                  <ContentCard
                    key={kanji.id}
                    {...kanjiToCard(kanji)}
                    onClick={() => handleKanjiClick(kanji)}
                    onFavoriteToggle={toggleFavoriteKanji}
                    isFavorite={favoriteKanjis.has(kanji.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loadingKanjis && kanjis.length === 0 && !loadingKatakanas && katakanas.length === 0 && !loadingHiraganas && hiraganas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay contenido</h3>
              <p className="text-gray-600 text-center max-w-md">
                No encontramos contenido disponible.
              </p>
            </div>
          )}
        </>
      )}

      {/* ════════ Favoritos ════════ */}
      {selectedCategory === "favoritos" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mis Favoritos</h2>
            <span className="text-sm text-gray-600">{getTotalFavorites()} elementos</span>
          </div>

          {favoriteKanjis.size > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kanjis</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {kanjis
                  .filter((kanji) => favoriteKanjis.has(kanji.id))
                  .map((kanji) => (
                    <ContentCard
                      key={kanji.id}
                      {...kanjiToCard(kanji)}
                      onClick={() => handleKanjiClick(kanji)}
                      onFavoriteToggle={toggleFavoriteKanji}
                      isFavorite={true}
                    />
                  ))}
              </div>
            </div>
          )}

          {favoriteData.grammar.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gramática</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favoriteData.grammar.map((fav) => (
                  <ContentCard
                    key={fav.id}
                    {...grammarFavToCard(fav)}
                    onFavoriteToggle={(id) => toggleFavorite(id, "grammar")}
                    isFavorite={true}
                  />
                ))}
              </div>
            </div>
          )}

          {favoriteData.word.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Vocabulario</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favoriteData.word.map((fav) => (
                  <ContentCard
                    key={fav.id}
                    {...wordFavToCard(fav)}
                    onFavoriteToggle={(id) => toggleFavorite(id, "word")}
                    isFavorite={true}
                  />
                ))}
              </div>
            </div>
          )}

          {getTotalFavorites() === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes favoritos aún</h3>
              <p className="text-gray-600 text-center max-w-md">
                Agrega contenido a favoritos haciendo clic en el corazón en cualquier elemento.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════ Kanjis (filtro) ════════ */}
      {selectedCategory === "kanji" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Colección de Kanjis</h2>
            <span className="text-sm text-gray-600">{kanjis.length} kanjis</span>
          </div>
          {loadingKanjis ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {kanjis.map((kanji) => (
                  <ContentCard
                    key={kanji.id}
                    {...kanjiToCard(kanji)}
                    onClick={() => handleKanjiClick(kanji)}
                    onFavoriteToggle={toggleFavoriteKanji}
                    isFavorite={favoriteKanjis.has(kanji.id)}
                  />
                ))}
              </div>
              {kanjis.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No hay kanjis disponibles</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    No encontramos kanjis para mostrar.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════════ Katakana (filtro) ════════ */}
      {selectedCategory === "katakana" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Colección de Katakana</h2>
            <span className="text-sm text-gray-600">{katakanas.length} katakana</span>
          </div>
          {loadingKatakanas ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {katakanas.map((katakana) => (
                  <ContentCard key={katakana.id} {...katakanaToCard(katakana)} />
                ))}
              </div>
              {katakanas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No hay katakana disponibles</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    No encontramos katakana para mostrar.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════════ Hiragana (filtro) ════════ */}
      {selectedCategory === "hiragana" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Colección de Hiragana</h2>
            <span className="text-sm text-gray-600">{hiraganas.length} hiragana</span>
          </div>
          {loadingHiraganas ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {hiraganas.map((hiragana) => (
                  <ContentCard key={hiragana.id} {...hiraganaToCard(hiragana)} />
                ))}
              </div>
              {hiraganas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No hay hiragana disponibles</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    No encontramos hiragana para mostrar.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════════ Recientes (filtro) ════════ */}
      {selectedCategory === "recent" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Reciente</h2>
            <span className="text-sm text-gray-600">{recentItems.length} elementos</span>
          </div>
          {recentItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recentItems.map((r) => {
                if (r.type === "kanji") {
                  const kanji = kanjis.find((k) => k.id === r.id);
                  if (!kanji) return null;
                  return (
                    <ContentCard
                      key={r.id}
                      {...kanjiToCard(kanji)}
                      onClick={() => handleKanjiClick(kanji)}
                      onFavoriteToggle={toggleFavoriteKanji}
                      isFavorite={favoriteKanjis.has(kanji.id)}
                    />
                  );
                }
                if (r.type === "grammar_lesson" || r.type === "grammar") {
                  return (
                    <ContentCard
                      key={r.id}
                      id={r.id}
                      title={r.title || "Gramática"}
                      subtitle={r.description || undefined}
                      thumbnail="文"
                      onFavoriteToggle={(id) => toggleFavorite(id, "grammar")}
                      isFavorite={isFavorite(r.id)}
                    />
                  );
                }
                if (r.type === "word") {
                  const meanings = Array.isArray(r.meanings)
                    ? (r.meanings as string[]).join(", ")
                    : undefined;
                  return (
                    <ContentCard
                      key={r.id}
                      id={r.id}
                      title={r.kanjiWord || r.hiragana || "Palabra"}
                      subtitle={meanings}
                      thumbnail={r.kanjiWord || r.hiragana || "言"}
                      onFavoriteToggle={(id) => toggleFavorite(id, "word")}
                      isFavorite={isFavorite(r.id)}
                    />
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No hay elementos recientes
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Los elementos que visites aparecerán aquí.
              </p>
            </div>
          )}
        </div>
      )}

      <KanjiDetailModal kanji={selectedKanji} onClose={() => setSelectedKanji(null)} />
      </>
      )}
    </DashboardShell>
  );
}