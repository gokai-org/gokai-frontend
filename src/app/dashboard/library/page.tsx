"use client";

import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useCallback, useMemo, useRef, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { Search } from "lucide-react";
import { CategoryFilter } from "@/features/library/components/CategoryFilter";
import { VocabularyCard } from "@/features/library/components/VocabularyCard";
import { ScriptCard } from "@/features/library/components/ScriptCard";
import { LibraryGrid } from "@/features/library/components/LibraryGrid";
import { LibraryRecentPanel } from "@/features/library/components/LibraryRecentPanel";
import { LibraryCategorySection } from "@/features/library/components/LibraryCategorySection";
import { KanjiDetailModal } from "@/features/kanji/components/KanjiDetailModal";
import { KanaDetailModal } from "@/features/kana/components/KanaDetailModal";
import { LibrarySkeleton } from "@/shared/ui/Skeleton";
import { useFavorites } from "@/features/library/hooks/useFavorites";
import { useRecentItems } from "@/features/library/hooks/useRecentItems";
import { useVocabularyContent } from "@/features/library/hooks/useVocabularyContent";
import { useKanjiLockedStatus } from "@/features/library/hooks/useKanjiLockedStatus";
import {
  CombinedLibraryItem,
  useLibraryContent,
} from "@/features/library/hooks/useLibraryContent";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import { getKana } from "@/features/kana/api/kanaApi";
import { KanjiQuizModal } from "@/features/kanji/components/quiz";
import {
  buildLibraryCategories,
  kanjiToScriptCard,
  hiraganaToScriptCard,
  katakanaToScriptCard,
  subthemeToCard,
  themeToCard,
  wordToCard,
} from "@/features/library/utils/libraryMappers";
import { getPrimaryMeaning } from "@/features/kanji";

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);
  const [selectedKana, setSelectedKana] = useState<Kana | null>(null);
  const [quizKanji, setQuizKanji] = useState<{
    id: string;
    symbol: string;
  } | null>(null);

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

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

  const { lockedKanjiIds, reload: reloadLockedStatus } =
    useKanjiLockedStatus(kanjis);
  const [newlyUnlockedKanjiIds, setNewlyUnlockedKanjiIds] = useState<
    ReadonlySet<string>
  >(new Set());
  const lockedKanjiIdsBeforeQuizRef = useRef<Set<string> | null>(null);
  const unlockAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const {
    themes,
    filteredThemes,
    filteredSubthemes,
    filteredWords,
    selectedTheme,
    selectedSubtheme,
    loadingThemes,
    loadingSubthemes,
    loadingWords,
    openTheme,
    openSubtheme,
    resetVocabularyView,
  } = useVocabularyContent(searchQuery);

  const { recentItems, addRecentItem } = useRecentItems();

  const {
    favoriteKanjis,
    favoriteHiraganas,
    favoriteKatakanas,
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
    themeCount: themes.length,
  });

  const handleKanjiClick = (kanji: Kanji) => {
    addRecentItem("kanji", kanji.id);
    setSelectedKanji(kanji);
  };

  const handleQuizStart = useCallback(
    (kanji: Kanji) => {
      lockedKanjiIdsBeforeQuizRef.current = new Set(lockedKanjiIds);
      setSelectedKanji(null);
      setQuizKanji({ id: kanji.id, symbol: kanji.symbol });
    },
    [lockedKanjiIds],
  );

  const handleQuizClose = useCallback(async () => {
    setQuizKanji(null);

    const lockedIdsBeforeQuiz = lockedKanjiIdsBeforeQuizRef.current;
    lockedKanjiIdsBeforeQuizRef.current = null;

    const nextUserPoints = await reloadLockedStatus();

    if (!lockedIdsBeforeQuiz) return;

    const unlockedIds = kanjis
      .filter(
        (kanji) =>
          lockedIdsBeforeQuiz.has(kanji.id) &&
          nextUserPoints >= kanji.pointsToUnlock,
      )
      .map((kanji) => kanji.id);

    if (unlockedIds.length === 0) return;

    if (unlockAnimationTimerRef.current !== null) {
      clearTimeout(unlockAnimationTimerRef.current);
    }

    const nextUnlockedIds = new Set(unlockedIds);
    setNewlyUnlockedKanjiIds(nextUnlockedIds);
    unlockAnimationTimerRef.current = setTimeout(() => {
      setNewlyUnlockedKanjiIds(new Set());
    }, 2500);
  }, [kanjis, reloadLockedStatus]);

  const handleKanaClick = async (kana: Kana) => {
    try {
      const detail = await getKana(kana.id);
      setSelectedKana(detail);
    } catch {
      setSelectedKana(kana);
    }
  };

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setSearchQuery("");

    if (cat !== "themes") {
      resetVocabularyView();
    }
  };

  const totalBaseContentCount =
    kanjis.length + katakanas.length + hiraganas.length;
  const vocabularyCurrentCount = selectedSubtheme
    ? filteredWords.length
    : selectedTheme
      ? filteredSubthemes.length
      : filteredThemes.length;

  const kanaItems: CombinedLibraryItem[] = [
    ...filteredHiraganas.map((data) => ({ type: "hiragana" as const, data })),
    ...filteredKatakanas.map((data) => ({ type: "katakana" as const, data })),
  ];

  return (
    <DashboardShell>
      {isGlobalLoading ? (
        <LibrarySkeleton />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-full border border-border-default bg-surface-secondary px-4 py-2">
              <Search className="h-4 w-4 text-content-muted" />
              <input
                type="text"
                placeholder="Buscar kanjis, hiraganas o katakanas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none w-48 lg:w-72"
              />
            </div>
          </div>

          <AnimatedEntrance
            index={0}
            className="mb-8"
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <CategoryFilter
              categories={dynamicCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
            />
          </AnimatedEntrance>

          {isSearching && !selectedCategory && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-content-primary">
                    Resultados para &ldquo;{searchQuery.trim()}&rdquo;
                  </h2>
                  <span className="text-sm text-content-secondary">
                    {allLibraryItems.length} resultados
                  </span>
                </div>

                {allLibraryItems.length > 0 ? (
                  <LibraryGrid
                    items={allLibraryItems}
                    favoriteKanjis={favoriteKanjis}
                    favoriteHiraganas={favoriteHiraganas}
                    favoriteKatakanas={favoriteKatakanas}
                    lockedKanjiIds={lockedKanjiIds}
                    newlyUnlockedKanjiIds={newlyUnlockedKanjiIds}
                    toggleFavoriteKanji={toggleFavoriteKanji}
                    toggleFavoriteHiragana={(id) =>
                      void toggleFavorite(id, "hiragana")
                    }
                    toggleFavoriteKatakana={(id) =>
                      void toggleFavorite(id, "katakana")
                    }
                    onKanjiClick={handleKanjiClick}
                    onKanaClick={handleKanaClick}
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <h3 className="mb-2 text-xl font-bold text-content-primary">
                      Sin resultados
                    </h3>
                    <p className="max-w-md text-center text-content-secondary">
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
                mode={heavyAnimationsEnabled ? "default" : "light"}
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
                    <span className="text-sm font-medium text-content-tertiary">
                      {totalBaseContentCount} elementos
                    </span>
                  }
                />

                {allLibraryItems.length > 0 ? (
                  <LibraryGrid
                    items={allLibraryItems}
                    favoriteKanjis={favoriteKanjis}
                    favoriteHiraganas={favoriteHiraganas}
                    favoriteKatakanas={favoriteKatakanas}
                    lockedKanjiIds={lockedKanjiIds}
                    newlyUnlockedKanjiIds={newlyUnlockedKanjiIds}
                    toggleFavoriteKanji={toggleFavoriteKanji}
                    toggleFavoriteHiragana={(id) =>
                      void toggleFavorite(id, "hiragana")
                    }
                    toggleFavoriteKatakana={(id) =>
                      void toggleFavorite(id, "katakana")
                    }
                    onKanjiClick={handleKanjiClick}
                    onKanaClick={handleKanaClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <h3 className="mb-2 text-xl font-bold text-content-primary">
                      No hay contenido
                    </h3>
                    <p className="max-w-md text-center text-content-secondary">
                      No encontramos contenido disponible.
                    </p>
                  </div>
                )}
              </AnimatedEntrance>
            </div>
          )}

          {selectedCategory === "favoritos" && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-content-primary">
                    Mis Favoritos
                  </h2>
                  <span className="text-sm text-content-secondary">
                    {getTotalFavorites()} elementos
                  </span>
                </div>

                {favoriteKanjis.size > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Kanjis
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {kanjis
                        .filter((kanji) => favoriteKanjis.has(kanji.id))
                        .map((kanji, i) => {
                          const isLocked = lockedKanjiIds.has(kanji.id);
                          return (
                            <ScriptCard
                              key={kanji.id}
                              {...kanjiToScriptCard(kanji, true)}
                              index={i}
                              locked={isLocked}
                              unlocking={newlyUnlockedKanjiIds.has(kanji.id)}
                              onClick={
                                isLocked
                                  ? undefined
                                  : () => handleKanjiClick(kanji)
                              }
                              onFavoriteToggle={
                                isLocked ? undefined : toggleFavoriteKanji
                              }
                            />
                          );
                        })}
                    </div>
                  </div>
                )}

                {favoriteData.grammar.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Gramática
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {favoriteData.grammar.map((fav, i) => (
                        <VocabularyCard
                          key={fav.id}
                          id={fav.id}
                          title={fav.title || "Gramática"}
                          subtitle={fav.description || undefined}
                          thumbnail="文"
                          variant="word"
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteData.hiragana.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Hiragana
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {favoriteData.hiragana.map((fav, i) => {
                        const kana = hiraganas.find((h) => h.id === fav.id);
                        if (kana) {
                          return (
                            <ScriptCard
                              key={fav.id}
                              {...hiraganaToScriptCard(kana, true)}
                              index={i}
                              onClick={() => handleKanaClick(kana)}
                              onFavoriteToggle={(id) =>
                                void toggleFavorite(id, "hiragana")
                              }
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {favoriteData.katakana.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Katakana
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {favoriteData.katakana.map((fav, i) => {
                        const kana = katakanas.find((k) => k.id === fav.id);
                        if (kana) {
                          return (
                            <ScriptCard
                              key={fav.id}
                              {...katakanaToScriptCard(kana, true)}
                              index={i}
                              onClick={() => handleKanaClick(kana)}
                              onFavoriteToggle={(id) =>
                                void toggleFavorite(id, "katakana")
                              }
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {favoriteData.word.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Vocabulario
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {favoriteData.word.map((fav, i) => (
                        <VocabularyCard
                          key={fav.id}
                          id={fav.id}
                          title={fav.kanjiWord || fav.hiragana || "Palabra"}
                          subtitle={fav.hiragana || undefined}
                          thumbnail={fav.kanjiWord || fav.hiragana || "言"}
                          variant="word"
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {getTotalFavorites() === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <h3 className="mb-2 text-xl font-bold text-content-primary">
                      No tienes favoritos aún
                    </h3>
                    <p className="max-w-md text-center text-content-secondary">
                      Agrega contenido a favoritos haciendo clic en el corazón
                      en cualquier elemento.
                    </p>
                  </div>
                )}
              </div>
            </AnimatedEntrance>
          )}

          {selectedCategory === "kanji" && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Colección de Kanjis"
                countLabel={`${kanjis.length} kanjis`}
                loading={loadingKanjis}
                emptyTitle="No hay kanjis disponibles"
                emptyDescription="No encontramos kanjis para mostrar."
              >
                {kanjis.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {kanjis.map((kanji, i) => {
                      const isLocked = lockedKanjiIds.has(kanji.id);
                      return (
                        <ScriptCard
                          key={kanji.id}
                          {...kanjiToScriptCard(
                            kanji,
                            favoriteKanjis.has(kanji.id),
                          )}
                          index={i}
                          locked={isLocked}
                          unlocking={newlyUnlockedKanjiIds.has(kanji.id)}
                          onClick={
                            isLocked ? undefined : () => handleKanjiClick(kanji)
                          }
                          onFavoriteToggle={
                            isLocked ? undefined : toggleFavoriteKanji
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "katakana" && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Colección de Katakana"
                countLabel={`${katakanas.length} katakana`}
                loading={loadingKatakanas}
                emptyTitle="No hay katakana disponibles"
                emptyDescription="No encontramos katakana para mostrar."
              >
                {katakanas.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {katakanas.map((katakana, i) => (
                      <ScriptCard
                        key={katakana.id}
                        {...katakanaToScriptCard(
                          katakana,
                          favoriteKatakanas.has(katakana.id),
                        )}
                        index={i}
                        onClick={() => handleKanaClick(katakana)}
                        onFavoriteToggle={(id) =>
                          void toggleFavorite(id, "katakana")
                        }
                      />
                    ))}
                  </div>
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "hiragana" && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Colección de Hiragana"
                countLabel={`${hiraganas.length} hiragana`}
                loading={loadingHiraganas}
                emptyTitle="No hay hiragana disponibles"
                emptyDescription="No encontramos hiragana para mostrar."
              >
                {hiraganas.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {hiraganas.map((hiragana, i) => (
                      <ScriptCard
                        key={hiragana.id}
                        {...hiraganaToScriptCard(
                          hiragana,
                          favoriteHiraganas.has(hiragana.id),
                        )}
                        index={i}
                        onClick={() => handleKanaClick(hiragana)}
                        onFavoriteToggle={(id) =>
                          void toggleFavorite(id, "hiragana")
                        }
                      />
                    ))}
                  </div>
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "themes" && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title={
                  selectedSubtheme
                    ? `Palabras de ${selectedSubtheme.meaning}`
                    : selectedTheme
                      ? `Subtemas de ${selectedTheme.meaning}`
                      : "Temas de vocabulario"
                }
                countLabel={`${vocabularyCurrentCount} elementos`}
                loading={loadingThemes || loadingSubthemes || loadingWords}
                emptyTitle="No hay contenido disponible"
                emptyDescription="No encontramos elementos para mostrar en esta sección."
              >
                <div className="mb-5 flex flex-wrap gap-3">
                  {selectedTheme && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSubtheme) {
                          void openTheme(selectedTheme);
                        } else {
                          resetVocabularyView();
                        }
                      }}
                      className="rounded-full border border-border-default bg-surface-primary px-4 py-2 text-sm font-semibold text-content-secondary transition-colors hover:border-accent/20 hover:text-accent"
                    >
                      {selectedSubtheme
                        ? "Volver a subtemas"
                        : "Volver a temas"}
                    </button>
                  )}

                  {selectedSubtheme && (
                    <button
                      type="button"
                      onClick={resetVocabularyView}
                      className="rounded-full border border-border-default bg-surface-primary px-4 py-2 text-sm font-semibold text-content-secondary transition-colors hover:border-accent/20 hover:text-accent"
                    >
                      Ir al inicio
                    </button>
                  )}
                </div>

                {!selectedTheme && filteredThemes.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {filteredThemes.map((theme, i) => {
                      const card = themeToCard(theme);

                      return (
                        <VocabularyCard
                          key={theme.id}
                          id={theme.id}
                          title={card.title}
                          subtitle={card.subtitle}
                          thumbnail={card.thumbnail}
                          variant="theme"
                          index={i}
                          onClick={() => void openTheme(theme)}
                        />
                      );
                    })}
                  </div>
                )}

                {selectedTheme &&
                  !selectedSubtheme &&
                  filteredSubthemes.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {filteredSubthemes.map((subtheme, i) => {
                        const card = subthemeToCard(subtheme);

                        return (
                          <VocabularyCard
                            key={subtheme.id}
                            id={subtheme.id}
                            title={card.title}
                            subtitle={card.subtitle}
                            thumbnail={card.thumbnail}
                            variant="subtheme"
                            index={i}
                            onClick={() => void openSubtheme(subtheme)}
                          />
                        );
                      })}
                    </div>
                  )}

                {selectedSubtheme && filteredWords.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {filteredWords.map((word, i) => {
                      const card = wordToCard(word);

                      return (
                        <VocabularyCard
                          key={word.id}
                          id={word.id}
                          title={card.title}
                          subtitle={card.subtitle}
                          thumbnail={card.thumbnail}
                          variant="word"
                          index={i}
                        />
                      );
                    })}
                  </div>
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "recent" && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Reciente"
                countLabel={`${recentItems.length} elementos`}
                emptyTitle="No hay elementos recientes"
                emptyDescription="Los elementos que visites aparecerán aquí."
              >
                {recentItems.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {recentItems.map((r, i) => {
                      if (r.type === "kanji") {
                        const kanji = kanjis.find((k) => k.id === r.id);
                        if (!kanji) return null;
                        const isLocked = lockedKanjiIds.has(kanji.id);

                        return (
                          <ScriptCard
                            key={r.id}
                            {...kanjiToScriptCard(
                              kanji,
                              favoriteKanjis.has(kanji.id),
                            )}
                            index={i}
                            locked={isLocked}
                            unlocking={newlyUnlockedKanjiIds.has(kanji.id)}
                            onClick={
                              isLocked
                                ? undefined
                                : () => handleKanjiClick(kanji)
                            }
                            onFavoriteToggle={
                              isLocked ? undefined : toggleFavoriteKanji
                            }
                          />
                        );
                      }

                      if (r.type === "grammar_lesson" || r.type === "grammar") {
                        return (
                          <VocabularyCard
                            key={r.id}
                            id={r.id}
                            title={r.title || "Gramática"}
                            subtitle={r.description || undefined}
                            thumbnail="文"
                            variant="word"
                            index={i}
                          />
                        );
                      }

                      if (r.type === "word") {
                        const meanings = Array.isArray(r.meanings)
                          ? (r.meanings as string[]).join(", ")
                          : undefined;

                        return (
                          <VocabularyCard
                            key={r.id}
                            id={r.id}
                            title={r.kanjiWord || r.hiragana || "Palabra"}
                            subtitle={meanings}
                            thumbnail={r.kanjiWord || r.hiragana || "言"}
                            variant="word"
                            index={i}
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
            practiceDisabled={
              selectedKanji ? lockedKanjiIds.has(selectedKanji.id) : false
            }
            practiceDisabledReason="Completa el kanji anterior con al menos 70% para desbloquear."
            onQuizStart={handleQuizStart}
          />

          {quizKanji !== null && (
            <KanjiQuizModal
              kanjiId={quizKanji.id}
              label={quizKanji.symbol}
              onClose={handleQuizClose}
            />
          )}

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
