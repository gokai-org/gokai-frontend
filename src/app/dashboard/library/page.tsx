"use client";

import { useState, useEffect, useMemo } from "react";
import { LibraryHeader } from "@/features/library/components/LibraryHeader";
import { ContentCard } from "@/features/library/components/ContentCard";
import { RecentCard } from "@/features/library/components/RecentCard";
import type { RecentItemProps } from "@/features/library/components/RecentCard";
import { CategoryFilter } from "@/features/library/components/CategoryFilter";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import type {
  BackendFavoriteItem,
  BackendRecentItem,
  FavoriteType,
  LibraryCategory,
} from "@/features/library/types";
import { listKanjis } from "@/features/kanji/api/kanjiApi";
import type { Kanji } from "@/features/kanji/types";
import { KanjiDetailModal } from "@/features/kanji/components/KanjiDetailModal";
import { KanaDetailModal } from "@/features/kana/components/KanaDetailModal";
import { useRecentItems } from "@/features/library/hooks/useRecentItems";
import { useFavorites } from "@/features/library/hooks/useFavorites";
import {
  getPrimaryMeaning,
  getPrimaryReading,
} from "@/features/kanji/utils/kanjiText";
import { listKatakanas, listHiraganas } from "@/features/kana/api/kanaApi";
import type { Kana } from "@/features/kana/types";
import {
  LibrarySkeleton,
  SkeletonCard,
} from "@/shared/ui/Skeleton";

type CombinedLibraryItem =
  | { type: "kanji"; data: Kanji }
  | { type: "katakana"; data: Kana }
  | { type: "hiragana"; data: Kana };

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [loadingKanjis, setLoadingKanjis] = useState(true);
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);

  const [katakanas, setKatakanas] = useState<Kana[]>([]);
  const [loadingKatakanas, setLoadingKatakanas] = useState(true);

  const [hiraganas, setHiraganas] = useState<Kana[]>([]);
  const [loadingHiraganas, setLoadingHiraganas] = useState(true);

  const [selectedKana, setSelectedKana] = useState<Kana | null>(null);

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

  const handleKanaClick = (kana: Kana) => {
    addRecentItem(
      kana.kanaType === "hiragana" ? "hiragana" : "katakana",
      kana.id,
    );
    setSelectedKana(kana);
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
    return katakanas.filter((k) =>
      k.symbol.toLowerCase().includes(normalizedQuery),
    );
  }, [katakanas, normalizedQuery]);

  const filteredHiraganas = useMemo(() => {
    if (!normalizedQuery) return hiraganas;
    return hiraganas.filter((h) =>
      h.symbol.toLowerCase().includes(normalizedQuery),
    );
  }, [hiraganas, normalizedQuery]);

  const allLibraryItems = useMemo<CombinedLibraryItem[]>(() => {
    return [
      ...filteredKanjis.map((kanji) => ({ type: "kanji" as const, data: kanji })),
      ...filteredHiraganas.map((hiragana) => ({
        type: "hiragana" as const,
        data: hiragana,
      })),
      ...filteredKatakanas.map((katakana) => ({
        type: "katakana" as const,
        data: katakana,
      })),
    ];
  }, [filteredKanjis, filteredHiraganas, filteredKatakanas]);

  const dynamicCategories: LibraryCategory[] = [
    {
      id: "favoritos",
      name: "Favoritos",
      icon: "",
      count: getTotalFavorites(),
      color: "bg-red-500",
    },
    {
      id: "recent",
      name: "Reciente",
      icon: "",
      count: recentItems.length,
      color: "bg-gray-500",
    },
    {
      id: "kanji",
      name: "Kanjis",
      icon: "",
      count: kanjis.length,
      color: "bg-purple-500",
    },
    {
      id: "katakana",
      name: "Katakana",
      icon: "",
      count: katakanas.length,
      color: "bg-blue-500",
    },
    {
      id: "hiragana",
      name: "Hiragana",
      icon: "",
      count: hiraganas.length,
      color: "bg-green-500",
    },
  ];

  function kanjiToCard(kanji: Kanji) {
    const meaning = getPrimaryMeaning(kanji.meanings) || kanji.symbol;
    const reading = getPrimaryReading(kanji.readings);

    const meaningsCount = Array.isArray(kanji.meanings)
      ? kanji.meanings.length
      : (kanji.meanings?.es?.length ?? 0) +
        (kanji.meanings?.en?.length ?? 0) +
        (kanji.meanings?.other?.length ?? 0);

    const readingsCount = Array.isArray(kanji.readings)
      ? kanji.readings.length
      : (kanji.readings?.on?.length ?? 0) +
        (kanji.readings?.kun?.length ?? 0) +
        (kanji.readings?.other?.length ?? 0);

    return {
      id: kanji.id,
      title: meaning,
      subtitle: reading ? `Lectura: ${reading}` : "Sin lectura",
      thumbnail: kanji.symbol,
      meta: `${readingsCount || 0} lecturas • ${meaningsCount || 0} significados`,
    };
  }

  function katakanaToCard(katakana: Kana) {
    return {
      id: katakana.id,
      title: katakana.symbol,
      subtitle: "Katakana",
      thumbnail: katakana.symbol,
    };
  }

  function hiraganaToCard(hiragana: Kana) {
    return {
      id: hiragana.id,
      title: hiragana.symbol,
      subtitle: "Hiragana",
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
        return {
          id: item.id,
          title: "Elemento",
          thumbnail: "?",
          lastAccessed: item.createdAt,
        };
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
        //
      }
    }
    return {
      id: fav.id,
      title: fav.kanjiWord || fav.hiragana || "Palabra",
      subtitle: parsedMeanings || fav.hiragana || undefined,
      thumbnail: fav.kanjiWord || fav.hiragana || "言",
    };
  }

  const isSearching = normalizedQuery.length > 0;
  const isGlobalLoading =
    loadingKanjis || loadingKatakanas || loadingHiraganas;

  return (
    <DashboardShell header={<LibraryHeader onSearchChange={setSearchQuery} />}>
      {isGlobalLoading ? (
        <LibrarySkeleton />
      ) : (
        <>
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

          {isSearching && !selectedCategory && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Resultados para &ldquo;{searchQuery.trim()}&rdquo;
                </h2>
                <span className="text-sm text-gray-600">
                  {allLibraryItems.length} resultados
                </span>
              </div>

              {allLibraryItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {allLibraryItems.map((item) => {
                    if (item.type === "kanji") {
                      return (
                        <ContentCard
                          key={item.data.id}
                          {...kanjiToCard(item.data)}
                          onClick={() => handleKanjiClick(item.data)}
                          onFavoriteToggle={toggleFavoriteKanji}
                          isFavorite={favoriteKanjis.has(item.data.id)}
                        />
                      );
                    }

                    return (
                      <ContentCard
                        key={item.data.id}
                        {...(item.type === "hiragana"
                          ? hiraganaToCard(item.data)
                          : katakanaToCard(item.data))}
                        onClick={() => handleKanaClick(item.data)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    Sin resultados
                  </h3>
                  <p className="max-w-md text-center text-gray-600">
                    No encontramos contenido que coincida con &ldquo;
                    {searchQuery.trim()}&rdquo;.
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedCategory && !isSearching && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
              <aside className="order-1 xl:order-2 xl:sticky xl:top-6 xl:self-start">
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#993331]/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-6 w-6 text-[#993331]"
                      >
                        <path d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-extrabold text-gray-900">
                            Reciente
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-gray-500">
                            Continúa con el contenido que has explorado recientemente.
                          </p>
                        </div>

                        {recentItems.length > 0 && (
                          <span className="shrink-0 rounded-full bg-[#993331]/8 px-3 py-1 text-xs font-semibold text-[#993331]">
                            {recentItems.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {recentItems.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {recentItems.slice(0, 4).map((item) => (
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

                      <div className="mt-5">
                        <button
                          onClick={() => setSelectedCategory("recent")}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#993331]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#993331]/25"
                        >
                          Ver todo
                          <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FAF7F5] p-5 text-center">
                      <h4 className="mb-1 text-sm font-bold text-gray-900">
                        Aún no hay actividad
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-500">
                        Los kanjis, hiraganas y katakanas que abras aparecerán aquí para
                        retomarlos más rápido.
                      </p>
                    </div>
                  )}
                </div>
              </aside>

              <div className="order-2 min-w-0 xl:order-1">
                <SectionHeader
                  className="mb-4"
                  title="Todo el contenido"
                  action={
                    <span className="text-sm font-medium text-gray-500">
                      {kanjis.length + katakanas.length + hiraganas.length} elementos
                    </span>
                  }
                />

                {allLibraryItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:gap-4 2xl:grid-cols-5">
                    {allLibraryItems.map((item) => {
                      if (item.type === "kanji") {
                        return (
                          <ContentCard
                            key={item.data.id}
                            {...kanjiToCard(item.data)}
                            onClick={() => handleKanjiClick(item.data)}
                            onFavoriteToggle={toggleFavoriteKanji}
                            isFavorite={favoriteKanjis.has(item.data.id)}
                          />
                        );
                      }

                      return (
                        <ContentCard
                          key={item.data.id}
                          {...(item.type === "hiragana"
                            ? hiraganaToCard(item.data)
                            : katakanaToCard(item.data))}
                          onClick={() => handleKanaClick(item.data)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      No hay contenido
                    </h3>
                    <p className="max-w-md text-center text-gray-600">
                      No encontramos contenido disponible.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedCategory === "favoritos" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Mis Favoritos
                </h2>
                <span className="text-sm text-gray-600">
                  {getTotalFavorites()} elementos
                </span>
              </div>

              {favoriteKanjis.size > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Kanjis
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Gramática
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">
                    Vocabulario
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    No tienes favoritos aún
                  </h3>
                  <p className="max-w-md text-center text-gray-600">
                    Agrega contenido a favoritos haciendo clic en el corazón en
                    cualquier elemento.
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedCategory === "kanji" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Colección de Kanjis
                </h2>
                <span className="text-sm text-gray-600">
                  {kanjis.length} kanjis
                </span>
              </div>
              {loadingKanjis ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                      <h3 className="mb-2 text-xl font-bold text-gray-900">
                        No hay kanjis disponibles
                      </h3>
                      <p className="max-w-md text-center text-gray-600">
                        No encontramos kanjis para mostrar.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {selectedCategory === "katakana" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Colección de Katakana
                </h2>
                <span className="text-sm text-gray-600">
                  {katakanas.length} katakana
                </span>
              </div>
              {loadingKatakanas ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {katakanas.map((katakana) => (
                      <ContentCard
                        key={katakana.id}
                        {...katakanaToCard(katakana)}
                        onClick={() => handleKanaClick(katakana)}
                      />
                    ))}
                  </div>
                  {katakanas.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <h3 className="mb-2 text-xl font-bold text-gray-900">
                        No hay katakana disponibles
                      </h3>
                      <p className="max-w-md text-center text-gray-600">
                        No encontramos katakana para mostrar.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {selectedCategory === "hiragana" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Colección de Hiragana
                </h2>
                <span className="text-sm text-gray-600">
                  {hiraganas.length} hiragana
                </span>
              </div>
              {loadingHiraganas ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {hiraganas.map((hiragana) => (
                      <ContentCard
                        key={hiragana.id}
                        {...hiraganaToCard(hiragana)}
                        onClick={() => handleKanaClick(hiragana)}
                      />
                    ))}
                  </div>
                  {hiraganas.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <h3 className="mb-2 text-xl font-bold text-gray-900">
                        No hay hiragana disponibles
                      </h3>
                      <p className="max-w-md text-center text-gray-600">
                        No encontramos hiragana para mostrar.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {selectedCategory === "recent" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Reciente</h2>
                <span className="text-sm text-gray-600">
                  {recentItems.length} elementos
                </span>
              </div>
              {recentItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                          onFavoriteToggle={(id) =>
                            toggleFavorite(id, "grammar")
                          }
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
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    No hay elementos recientes
                  </h3>
                  <p className="max-w-md text-center text-gray-600">
                    Los elementos que visites aparecerán aquí.
                  </p>
                </div>
              )}
            </div>
          )}

          <KanjiDetailModal
            kanji={selectedKanji}
            onClose={() => setSelectedKanji(null)}
          />

          {selectedKana && (
            <KanaDetailModal
              kana={selectedKana}
              onClose={() => setSelectedKana(null)}
            />
          )}
        </>
      )}
    </DashboardShell>
  );
}