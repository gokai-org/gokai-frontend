"use client";

import { useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { LibraryHeader } from "@/features/library/components/LibraryHeader";
import { CategoryFilter } from "@/features/library/components/CategoryFilter";
import { ContentCard } from "@/features/library/components/ContentCard";
import { LibraryGrid } from "@/features/library/components/LibraryGrid";
import { LibraryRecentPanel } from "@/features/library/components/LibraryRecentPanel";
import { LibraryCategorySection } from "@/features/library/components/LibraryCategorySection";
import { KanjiDetailModal } from "@/features/kanji/components/KanjiDetailModal";
import { KanaDetailModal } from "@/features/kana/components/KanaDetailModal";
import { LibrarySkeleton } from "@/shared/ui/Skeleton";
import { useFavorites } from "@/features/library/hooks/useFavorites";
import { useRecentItems } from "@/features/library/hooks/useRecentItems";
import {
  CombinedLibraryItem,
  useLibraryContent,
} from "@/features/library/hooks/useLibraryContent";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import {
  buildLibraryCategories,
  grammarFavToCard,
  kanjiToCard,
  katakanaToCard,
  hiraganaToCard,
  wordFavToCard,
} from "@/features/library/utils/libraryMappers";

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);
  const [selectedKana, setSelectedKana] = useState<Kana | null>(null);

  const animationsEnabled = true;

  const {
    kanjis,
    katakanas,
    hiraganas,
    filteredKanjis,
    filteredKatakanas,
    filteredHiraganas,
    allLibraryItems,
    isSearching,
    isGlobalLoading,
    loadingKanjis,
    loadingKatakanas,
    loadingHiraganas,
  } = useLibraryContent(searchQuery);

  const { recentItems, addRecentItem } = useRecentItems();

  const {
    favoriteKanjis,
    favoriteData,
    isFavorite,
    toggleFavorite,
    toggleFavoriteKanji,
    getTotalFavorites,
  } = useFavorites();

  const dynamicCategories = buildLibraryCategories({
    totalFavorites: getTotalFavorites(),
    recentCount: recentItems.length,
    kanjiCount: kanjis.length,
    katakanaCount: katakanas.length,
    hiraganaCount: hiraganas.length,
  });

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

  const kanaItems: CombinedLibraryItem[] = [
    ...filteredHiraganas.map((data) => ({ type: "hiragana" as const, data })),
    ...filteredKatakanas.map((data) => ({ type: "katakana" as const, data })),
  ];

  return (
    <DashboardShell header={<LibraryHeader onSearchChange={setSearchQuery} />}>
      {isGlobalLoading ? (
        <LibrarySkeleton />
      ) : (
        <>
          <AnimatedEntrance
            index={0}
            className="mb-8"
            disabled={!animationsEnabled}
          >
            <CategoryFilter
              categories={dynamicCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSearchQuery("");
              }}
            />
          </AnimatedEntrance>

          {isSearching && !selectedCategory && (
            <AnimatedEntrance index={1} disabled={!animationsEnabled}>
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
                  <LibraryGrid
                    items={allLibraryItems}
                    favoriteKanjis={favoriteKanjis}
                    toggleFavoriteKanji={toggleFavoriteKanji}
                    onKanjiClick={handleKanjiClick}
                    onKanaClick={handleKanaClick}
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  />
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
            </AnimatedEntrance>
          )}

          {!selectedCategory && !isSearching && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
              <AnimatedEntrance
                index={1}
                className="order-1 xl:order-2"
                disabled={!animationsEnabled}
              >
                <LibraryRecentPanel
                  recentItems={recentItems}
                  kanjis={kanjis}
                  onOpenRecent={() => setSelectedCategory("recent")}
                  onKanjiClick={handleKanjiClick}
                />
              </AnimatedEntrance>

              <AnimatedEntrance
                index={2}
                className="order-2 min-w-0 xl:order-1"
                disabled={!animationsEnabled}
              >
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
                  <LibraryGrid
                    items={allLibraryItems}
                    favoriteKanjis={favoriteKanjis}
                    toggleFavoriteKanji={toggleFavoriteKanji}
                    onKanjiClick={handleKanjiClick}
                    onKanaClick={handleKanaClick}
                  />
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
              </AnimatedEntrance>
            </div>
          )}

          {selectedCategory === "favoritos" && (
            <AnimatedEntrance index={1} disabled={!animationsEnabled}>
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
                            isFavorite
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
                          onFavoriteToggle={(id) =>
                            toggleFavorite(id, "grammar")
                          }
                          isFavorite
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
                          isFavorite
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
            </AnimatedEntrance>
          )}

          {selectedCategory === "kanji" && (
            <AnimatedEntrance index={1} disabled={!animationsEnabled}>
              <LibraryCategorySection
                title="Colección de Kanjis"
                countLabel={`${kanjis.length} kanjis`}
                loading={loadingKanjis}
                emptyTitle="No hay kanjis disponibles"
                emptyDescription="No encontramos kanjis para mostrar."
              >
                {kanjis.length > 0 && (
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
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "katakana" && (
            <AnimatedEntrance index={1} disabled={!animationsEnabled}>
              <LibraryCategorySection
                title="Colección de Katakana"
                countLabel={`${katakanas.length} katakana`}
                loading={loadingKatakanas}
                emptyTitle="No hay katakana disponibles"
                emptyDescription="No encontramos katakana para mostrar."
              >
                {katakanas.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {katakanas.map((katakana) => (
                      <ContentCard
                        key={katakana.id}
                        {...katakanaToCard(katakana)}
                        onClick={() => handleKanaClick(katakana)}
                      />
                    ))}
                  </div>
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "hiragana" && (
            <AnimatedEntrance index={1} disabled={!animationsEnabled}>
              <LibraryCategorySection
                title="Colección de Hiragana"
                countLabel={`${hiraganas.length} hiragana`}
                loading={loadingHiraganas}
                emptyTitle="No hay hiragana disponibles"
                emptyDescription="No encontramos hiragana para mostrar."
              >
                {hiraganas.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {hiraganas.map((hiragana) => (
                      <ContentCard
                        key={hiragana.id}
                        {...hiraganaToCard(hiragana)}
                        onClick={() => handleKanaClick(hiragana)}
                      />
                    ))}
                  </div>
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "recent" && (
            <AnimatedEntrance index={1} disabled={!animationsEnabled}>
              <LibraryCategorySection
                title="Reciente"
                countLabel={`${recentItems.length} elementos`}
                emptyTitle="No hay elementos recientes"
                emptyDescription="Los elementos que visites aparecerán aquí."
              >
                {recentItems.length > 0 && (
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
                            onFavoriteToggle={(id) =>
                              toggleFavorite(id, "word")
                            }
                            isFavorite={isFavorite(r.id)}
                          />
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
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