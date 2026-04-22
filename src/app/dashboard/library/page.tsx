"use client";

import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { useToast } from "@/shared/ui";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { Search } from "lucide-react";
import { CategoryFilter } from "@/features/library/components/CategoryFilter";
import { VocabularyCard } from "@/features/library/components/VocabularyCard";
import { useSidebar } from "@/shared/components/SidebarContext";
import { ScriptCard } from "@/features/library/components/ScriptCard";
import { LibraryGrid } from "@/features/library/components/LibraryGrid";
import { LibraryRecentPanel } from "@/features/library/components/LibraryRecentPanel";
import { LibraryCategorySection } from "@/features/library/components/LibraryCategorySection";
import { KanaPhoneticGrid } from "@/features/library/components/KanaPhoneticGrid";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { LibrarySkeleton, SkeletonCard } from "@/shared/ui/Skeleton";
import { useFavorites } from "@/features/library/hooks/useFavorites";
import { useRecentItems } from "@/features/library/hooks/useRecentItems";
import { useVocabularyContent } from "@/features/library/hooks/useVocabularyContent";
import { useKanjiLockedStatus } from "@/features/library/hooks/useKanjiLockedStatus";
import { useKanaLockedStatus } from "@/features/library/hooks/useKanaLockedStatus";
import { useLibraryContent } from "@/features/library/hooks/useLibraryContent";
import type { Kanji } from "@/features/kanji/types";
import type { KanjiQuizType } from "@/features/kanji/types/quiz";
import type { Kana } from "@/features/kana/types";
import type { KanaQuizType } from "@/features/kana/types/quiz";
import { KanjiQuizModal } from "@/features/kanji/components/quiz";
import { KanaQuizModal } from "@/features/kana/components/quiz";
import { GrammarLibraryCollection } from "@/features/graph/grammar/components/library/GrammarLibraryCollection";
import { GRAMMAR_BOARD_TOTAL } from "@/features/graph/grammar/constants/grammarBoard";
import {
  buildLibraryCategories,
  kanjiToScriptCard,
  hiraganaToScriptCard,
  katakanaToScriptCard,
  subthemeToCard,
  themeToCard,
  wordToCard,
} from "@/features/library/utils/libraryMappers";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { HELP_GUIDE_LIBRARY_RESET_EVENT } from "@/features/help/utils/guideEvents";
// import { getPrimaryMeaning } from "@/features/kanji";

type QuizCompletionResult = {
  newlyCompleted?: boolean;
  newlyCompletedPoints?: number;
  resultingModulePoints?: number;
};

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerEntity, setDrawerEntity] = useState<{
    id: string;
    kind: "kanji" | "kana";
    kanaType?: "hiragana" | "katakana";
  } | null>(null);
  const [quizKanji, setQuizKanji] = useState<{
    id: string;
    symbol: string;
    quizType?: KanjiQuizType;
    wasCompletedBefore: boolean;
    isPracticeOnly: boolean;
    progressEligible: boolean;
  } | null>(null);
  const [quizKana, setQuizKana] = useState<{
    id: string;
    symbol: string;
    kanaType: "hiragana" | "katakana";
    quizType?: KanaQuizType;
    wasCompletedBefore: boolean;
    isPracticeOnly: boolean;
    progressEligible: boolean;
  } | null>(null);

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  const { setBlurred } = useSidebar();
  const toast = useToast();
  const mastered = useMasteredModules();
  useEffect(() => {
    setBlurred(drawerEntity !== null);
    return () => setBlurred(false);
  }, [drawerEntity, setBlurred]);

  // ── Scrollbar accent per category ─────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (selectedCategory === "hiragana") {
      if (mastered.has("hiragana")) {
        root.style.setProperty("--scrollbar-thumb", "rgba(212,168,67,0.4)");
        root.style.setProperty("--scrollbar-thumb-hover", "rgba(240,210,122,0.65)");
      } else {
        root.style.setProperty("--scrollbar-thumb", "rgba(123,63,138,0.4)");
        root.style.setProperty("--scrollbar-thumb-hover", "rgba(168,102,181,0.65)");
      }
    } else if (selectedCategory === "katakana") {
      if (mastered.has("katakana")) {
        root.style.setProperty("--scrollbar-thumb", "rgba(212,168,67,0.4)");
        root.style.setProperty("--scrollbar-thumb-hover", "rgba(240,210,122,0.65)");
      } else {
        root.style.setProperty("--scrollbar-thumb", "rgba(27,80,120,0.4)");
        root.style.setProperty("--scrollbar-thumb-hover", "rgba(46,130,181,0.65)");
      }
    } else if (selectedCategory === "kanji") {
      if (mastered.has("kanji")) {
        root.style.setProperty("--scrollbar-thumb", "rgba(212,168,67,0.4)");
        root.style.setProperty("--scrollbar-thumb-hover", "rgba(240,210,122,0.65)");
      } else {
        root.style.setProperty("--scrollbar-thumb", "rgba(153,51,49,0.4)");
        root.style.setProperty("--scrollbar-thumb-hover", "rgba(186,81,73,0.65)");
      }
    } else if (selectedCategory === "grammar") {
      root.style.setProperty("--scrollbar-thumb", "rgba(153,51,49,0.4)");
      root.style.setProperty("--scrollbar-thumb-hover", "rgba(186,81,73,0.65)");
    } else {
      root.style.removeProperty("--scrollbar-thumb");
      root.style.removeProperty("--scrollbar-thumb-hover");
    }
    return () => {
      root.style.removeProperty("--scrollbar-thumb");
      root.style.removeProperty("--scrollbar-thumb-hover");
    };
  }, [selectedCategory, mastered]);

  const {
    kanjis,
    katakanas,
    hiraganas,
    filteredKanjis: _filteredKanjis,
    allLibraryItems,
    isSearching,
    hasResolvedInitialContent,
    loadingKanjis,
    loadingKatakanas,
    loadingHiraganas,
  } = useLibraryContent(searchQuery);

  const {
    lockedKanjiIds,
    completedKanjiIds,
    userPoints,
    hasResolvedInitialStatus: hasResolvedInitialKanjiStatus,
    reload: reloadLockedStatus,
  } =
    useKanjiLockedStatus(kanjis);
  const {
    userKanaPoints,
    lockedHiraganaIds,
    lockedKatakanaIds,
    progressById,
    hasResolvedInitialStatus: hasResolvedInitialKanaStatus,
    reload: reloadKanaLockedStatus,
  } = useKanaLockedStatus(hiraganas, katakanas);
  const [newlyUnlockedKanjiIds, setNewlyUnlockedKanjiIds] = useState<
    ReadonlySet<string>
  >(new Set());
  const [newlyUnlockedKanaIds, setNewlyUnlockedKanaIds] = useState<
    ReadonlySet<string>
  >(new Set());
  const lockedHiraganaIdsBeforeQuizRef = useRef<Set<string> | null>(null);
  const lockedKatakanaIdsBeforeQuizRef = useRef<Set<string> | null>(null);
  const unlockAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const startUnlockAnimation = useCallback(
    (ids: string[], target: "kanji" | "kana") => {
      if (ids.length === 0) return;

      if (unlockAnimationTimerRef.current !== null) {
        clearTimeout(unlockAnimationTimerRef.current);
      }

      const nextUnlockedIds = new Set(ids);

      if (target === "kanji") {
        setNewlyUnlockedKanjiIds(nextUnlockedIds);
      } else {
        setNewlyUnlockedKanaIds(nextUnlockedIds);
      }

      unlockAnimationTimerRef.current = setTimeout(() => {
        if (target === "kanji") {
          setNewlyUnlockedKanjiIds(new Set());
          return;
        }

        setNewlyUnlockedKanaIds(new Set());
      }, 2800);
    },
    [],
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

  const { recentItems, addRecentItem, loading: loadingRecentItems } = useRecentItems();

  const {
    favoriteKanjis,
    favoriteHiraganas,
    favoriteKatakanas,
    favoriteGrammar,
    favoriteData,
    toggleFavorite,
    toggleFavoriteKanji,
    getTotalFavorites,
    loading: loadingFavorites,
  } = useFavorites();

  const dynamicCategories = buildLibraryCategories({
    totalFavorites: getTotalFavorites(),
    recentCount: recentItems.length,
    kanjiCount: kanjis.length,
    grammarCount: GRAMMAR_BOARD_TOTAL,
    katakanaCount: katakanas.length,
    hiraganaCount: hiraganas.length,
    themeCount: themes.length,
  });
  const currentKanjiProgressId = useMemo(
    () =>
      [...kanjis]
        .reverse()
        .find((kanji) => !lockedKanjiIds.has(kanji.id))?.id ?? null,
    [kanjis, lockedKanjiIds],
  );
  const currentHiraganaProgressId = useMemo(
    () =>
      [...hiraganas]
        .reverse()
        .find((kana) => !lockedHiraganaIds.has(kana.id))?.id ?? null,
    [hiraganas, lockedHiraganaIds],
  );
  const currentKatakanaProgressId = useMemo(
    () =>
      [...katakanas]
        .reverse()
        .find((kana) => !lockedKatakanaIds.has(kana.id))?.id ?? null,
    [katakanas, lockedKatakanaIds],
  );
  const handleKanjiClick = (kanji: Kanji) => {
    addRecentItem("kanji", kanji.id);
    setDrawerEntity({ id: kanji.id, kind: "kanji" });
  };

  const handleLibraryKanjiSelect = useCallback((kanji: Kanji) => {
    const isLocked = lockedKanjiIds.has(kanji.id);

    if (isLocked) {
      // Long-press handles unlock; click on locked kanji is a no-op.
      return;
    }

    handleKanjiClick(kanji);
  }, [lockedKanjiIds]);

  const handleDrawerQuizStart = useCallback(
    (
      entity: { id: string; symbol: string },
      quizType?: KanaQuizType | KanjiQuizType,
    ) => {
      if (!drawerEntity) return;
      const kind = drawerEntity.kind;
      const kanaType = drawerEntity.kanaType;
      setDrawerEntity(null);
      if (kind === "kanji") {
        const wasCompletedBefore = completedKanjiIds.has(entity.id);
        const progressEligible =
          quizType === undefined &&
          !wasCompletedBefore &&
          entity.id === currentKanjiProgressId;
        setQuizKanji({
          id: entity.id,
          symbol: entity.symbol,
          quizType: quizType as KanjiQuizType | undefined,
          wasCompletedBefore,
          isPracticeOnly:
            quizType !== undefined || wasCompletedBefore || !progressEligible,
          progressEligible,
        });
      } else {
        lockedHiraganaIdsBeforeQuizRef.current = new Set(lockedHiraganaIds);
        lockedKatakanaIdsBeforeQuizRef.current = new Set(lockedKatakanaIds);
        const wasCompletedBefore = progressById.get(entity.id)?.completed === true;
        const progressEligible =
          quizType === undefined &&
          !wasCompletedBefore &&
          entity.id ===
            (kanaType === "katakana"
              ? currentKatakanaProgressId
              : currentHiraganaProgressId);
        setQuizKana({
          id: entity.id,
          symbol: entity.symbol,
          kanaType: kanaType ?? "hiragana",
          quizType: quizType as KanaQuizType | undefined,
          wasCompletedBefore,
          isPracticeOnly:
            quizType !== undefined || wasCompletedBefore || !progressEligible,
          progressEligible,
        });
      }
    },
    [
      currentHiraganaProgressId,
      currentKanjiProgressId,
      currentKatakanaProgressId,
      drawerEntity,
      lockedHiraganaIds,
      lockedKatakanaIds,
      completedKanjiIds,
      progressById,
    ],
  );

  const handleQuizClose = useCallback(async (_result?: QuizCompletionResult) => {
    const isPracticeOnly = quizKanji?.isPracticeOnly === true;
    setQuizKanji(null);

    if (isPracticeOnly) return;

    if (typeof _result?.resultingModulePoints === "number") {
      dispatchMasteryProgressSync({ points: _result.resultingModulePoints });
    }

    void reloadLockedStatus();
  }, [quizKanji, reloadLockedStatus]);

  const handleKanaClick = (kana: Kana) => {
    setDrawerEntity({ id: kana.id, kind: "kana", kanaType: kana.kanaType });
  };

  const handleKanaQuizClose = useCallback(async (_result?: QuizCompletionResult) => {
    const isPracticeOnly = quizKana?.isPracticeOnly === true;
    setQuizKana(null);

    const lockedHiraganaIdsBeforeQuiz = lockedHiraganaIdsBeforeQuizRef.current;
    const lockedKatakanaIdsBeforeQuiz = lockedKatakanaIdsBeforeQuizRef.current;
    lockedHiraganaIdsBeforeQuizRef.current = null;
    lockedKatakanaIdsBeforeQuizRef.current = null;

    if (isPracticeOnly) return;

    const optimisticKanaPoints = Math.max(
      userKanaPoints,
      _result?.resultingModulePoints ?? 0,
    );

    if (typeof _result?.resultingModulePoints === "number") {
      dispatchMasteryProgressSync({ kanaPoints: optimisticKanaPoints });
    }

    if (!lockedHiraganaIdsBeforeQuiz && !lockedKatakanaIdsBeforeQuiz) {
      void reloadKanaLockedStatus();
      return;
    }

    const unlockedIds = [
      ...hiraganas
        .filter(
          (kana) =>
            lockedHiraganaIdsBeforeQuiz?.has(kana.id) &&
            optimisticKanaPoints >= kana.pointsToUnlock,
        )
        .map((kana) => kana.id),
      ...katakanas
        .filter(
          (kana) =>
            lockedKatakanaIdsBeforeQuiz?.has(kana.id) &&
            optimisticKanaPoints >= kana.pointsToUnlock,
        )
        .map((kana) => kana.id),
    ];

    startUnlockAnimation(unlockedIds, "kana");

    void reloadKanaLockedStatus();
  }, [hiraganas, katakanas, quizKana, reloadKanaLockedStatus, startUnlockAnimation, userKanaPoints]);

  useEffect(() => {
    return () => {
      if (unlockAnimationTimerRef.current !== null) {
        clearTimeout(unlockAnimationTimerRef.current);
      }
    };
  }, []);

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setSearchQuery("");

    if (cat !== "themes") {
      resetVocabularyView();
    }
  };

  useEffect(() => {
    const resetGuideState = () => {
      setDrawerEntity(null);
      setSelectedCategory(null);
      setSearchQuery("");
      resetVocabularyView();
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };

    window.addEventListener(HELP_GUIDE_LIBRARY_RESET_EVENT, resetGuideState);

    return () => {
      window.removeEventListener(HELP_GUIDE_LIBRARY_RESET_EVENT, resetGuideState);
    };
  }, [resetVocabularyView]);

  const totalBaseContentCount =
    kanjis.length + katakanas.length + hiraganas.length;
  const vocabularyCurrentCount = selectedSubtheme
    ? filteredWords.length
    : selectedTheme
      ? filteredSubthemes.length
      : filteredThemes.length;
  const isLibraryBootstrapping =
    !hasResolvedInitialContent ||
    !hasResolvedInitialKanjiStatus ||
    !hasResolvedInitialKanaStatus;

  return (
    <DashboardShell>
      {isLibraryBootstrapping ? (
        <div data-help-loading="true">
          <LibrarySkeleton />
        </div>
      ) : (
        <div data-help-target="library-page">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              data-help-target="library-search"
              className="flex items-center gap-2 rounded-full border border-border-default bg-surface-secondary px-4 py-2"
            >
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
            <div data-help-target="library-categories">
              <CategoryFilter
                categories={dynamicCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryChange}
              />
            </div>
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
                    lockedHiraganaIds={lockedHiraganaIds}
                    lockedKatakanaIds={lockedKatakanaIds}
                    newlyUnlockedKanjiIds={newlyUnlockedKanjiIds}
                    newlyUnlockedKanaIds={newlyUnlockedKanaIds}
                    toggleFavoriteKanji={toggleFavoriteKanji}
                    toggleFavoriteHiragana={(id) =>
                      void toggleFavorite(id, "hiragana")
                    }
                    toggleFavoriteKatakana={(id) =>
                      void toggleFavorite(id, "katakana")
                    }
                    onKanjiClick={handleLibraryKanjiSelect}
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
                <div data-help-target="library-recent">
                  <LibraryRecentPanel
                    recentItems={recentItems}
                    kanjis={kanjis}
                    loading={loadingRecentItems}
                    onOpenRecent={() => setSelectedCategory("recent")}
                    onKanjiClick={handleLibraryKanjiSelect}
                  />
                </div>
              </AnimatedEntrance>

              <AnimatedEntrance
                index={2}
                className="order-2 min-w-0 xl:order-1"
                disabled={!animationsEnabled}
              >
                <div data-help-target="library-main-section">
                  <div data-help-target="library-main-overview">
                    <SectionHeader
                      className="mb-4"
                      title="Todo el contenido"
                      action={
                        <span className="text-sm font-medium text-content-tertiary">
                          {totalBaseContentCount} elementos
                        </span>
                      }
                    />
                  </div>

                  <div data-help-target="library-main-grid">
                    {allLibraryItems.length > 0 ? (
                      <LibraryGrid
                        items={allLibraryItems}
                        favoriteKanjis={favoriteKanjis}
                        favoriteHiraganas={favoriteHiraganas}
                        favoriteKatakanas={favoriteKatakanas}
                        lockedKanjiIds={lockedKanjiIds}
                        lockedHiraganaIds={lockedHiraganaIds}
                        lockedKatakanaIds={lockedKatakanaIds}
                        newlyUnlockedKanjiIds={newlyUnlockedKanjiIds}
                        newlyUnlockedKanaIds={newlyUnlockedKanaIds}
                        toggleFavoriteKanji={toggleFavoriteKanji}
                        toggleFavoriteHiragana={(id) =>
                          void toggleFavorite(id, "hiragana")
                        }
                        toggleFavoriteKatakana={(id) =>
                          void toggleFavorite(id, "katakana")
                        }
                        onKanjiClick={handleLibraryKanjiSelect}
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
                  </div>
                </div>
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

                {loadingFavorites && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))}
                  </div>
                )}

                {!loadingFavorites && favoriteKanjis.size > 0 && (
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
                              onClick={() => handleLibraryKanjiSelect(kanji)}
                              onFavoriteToggle={
                                isLocked ? undefined : toggleFavoriteKanji
                              }
                            />
                          );
                        })}
                    </div>
                  </div>
                )}

                {!loadingFavorites && favoriteData.grammar.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Gramática
                    </h3>
                    <GrammarLibraryCollection
                      favoriteIds={favoriteGrammar}
                      filterIds={favoriteGrammar}
                      onToggleFavorite={(id) => {
                        void toggleFavorite(id, "grammar");
                      }}
                    />
                  </div>
                )}

                {!loadingFavorites && favoriteData.hiragana.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Hiragana
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {favoriteData.hiragana.map((fav, i) => {
                        const kana = hiraganas.find((h) => h.id === fav.id);
                        if (kana) {
                          const isLocked = lockedHiraganaIds.has(kana.id);
                          return (
                            <ScriptCard
                              key={fav.id}
                              {...hiraganaToScriptCard(kana, true)}
                              index={i}
                              locked={isLocked}
                              unlocking={newlyUnlockedKanaIds.has(kana.id)}
                              onClick={
                                isLocked ? undefined : () => handleKanaClick(kana)
                              }
                              onFavoriteToggle={
                                isLocked
                                  ? undefined
                                  : (id) => void toggleFavorite(id, "hiragana")
                              }
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {!loadingFavorites && favoriteData.katakana.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Katakana
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {favoriteData.katakana.map((fav, i) => {
                        const kana = katakanas.find((k) => k.id === fav.id);
                        if (kana) {
                          const isLocked = lockedKatakanaIds.has(kana.id);
                          return (
                            <ScriptCard
                              key={fav.id}
                              {...katakanaToScriptCard(kana, true)}
                              index={i}
                              locked={isLocked}
                              unlocking={newlyUnlockedKanaIds.has(kana.id)}
                              onClick={
                                isLocked ? undefined : () => handleKanaClick(kana)
                              }
                              onFavoriteToggle={
                                isLocked
                                  ? undefined
                                  : (id) => void toggleFavorite(id, "katakana")
                              }
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                {!loadingFavorites && favoriteData.word.length > 0 && (
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

                {!loadingFavorites && getTotalFavorites() === 0 && (
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
                          onClick={() => handleLibraryKanjiSelect(kanji)}
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

          {selectedCategory === "grammar" && (
            <AnimatedEntrance
              index={1}
              disabled={!animationsEnabled}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Colección de Grammar"
                countLabel={`${GRAMMAR_BOARD_TOTAL} lecciones`}
                emptyTitle="No hay lecciones de grammar disponibles"
                emptyDescription="No encontramos lecciones para mostrar en esta sección."
              >
                <GrammarLibraryCollection
                  favoriteIds={favoriteGrammar}
                  onToggleFavorite={(id) => {
                    void toggleFavorite(id, "grammar");
                  }}
                />
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
                title="Tabla fonética de Katakana"
                countLabel={`${katakanas.length} katakana`}
                loading={loadingKatakanas}
                emptyTitle="No hay katakana disponibles"
                emptyDescription="No encontramos katakana para mostrar."
              >
                {katakanas.length > 0 && (
                  <KanaPhoneticGrid
                    kanas={katakanas}
                    variant="katakana"
                    lockedIds={lockedKatakanaIds}
                    newlyUnlockedIds={newlyUnlockedKanaIds}
                    favoriteIds={favoriteKatakanas}
                    onKanaClick={handleKanaClick}
                    onFavoriteToggle={(id) => void toggleFavorite(id, "katakana")}
                  />
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
                title="Tabla fonética de Hiragana"
                countLabel={`${hiraganas.length} hiragana`}
                loading={loadingHiraganas}
                emptyTitle="No hay hiragana disponibles"
                emptyDescription="No encontramos hiragana para mostrar."
              >
                {hiraganas.length > 0 && (
                  <KanaPhoneticGrid
                    kanas={hiraganas}
                    variant="hiragana"
                    lockedIds={lockedHiraganaIds}
                    newlyUnlockedIds={newlyUnlockedKanaIds}
                    favoriteIds={favoriteHiraganas}
                    onKanaClick={handleKanaClick}
                    onFavoriteToggle={(id) => void toggleFavorite(id, "hiragana")}
                  />
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
                loading={loadingRecentItems}
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
                            onClick={() => handleLibraryKanjiSelect(kanji)}
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

          <LessonDrawer
            open={drawerEntity !== null}
            onClose={() => setDrawerEntity(null)}
            nodeId={drawerEntity?.id ?? null}
            entityId={drawerEntity?.id ?? null}
            entityKind={drawerEntity?.kind ?? null}
            kanaType={drawerEntity?.kanaType}
            mode="writing"
            userId="user123"
            kanjiCtaDisabled={
              drawerEntity?.kind === "kanji"
                ? lockedKanjiIds.has(drawerEntity.id)
                : drawerEntity?.kind === "kana"
                  ? drawerEntity.kanaType === "hiragana"
                    ? lockedHiraganaIds.has(drawerEntity.id)
                    : lockedKatakanaIds.has(drawerEntity.id)
                  : false
            }
            kanjiCtaDisabledReason="Completa la lección anterior para desbloquear."
            onQuizStart={handleDrawerQuizStart}
          />

          {quizKanji !== null && (
            <KanjiQuizModal
              kanjiId={quizKanji.id}
              label={quizKanji.symbol}
              quizType={quizKanji.quizType}
              currentModulePoints={userPoints}
              wasCompletedBefore={quizKanji.wasCompletedBefore}
              progressEligible={quizKanji.progressEligible}
              onClose={handleQuizClose}
            />
          )}

          {quizKana !== null && (
            <KanaQuizModal
              kanaId={quizKana.id}
              label={quizKana.symbol}
              kanaType={quizKana.kanaType}
              quizType={quizKana.quizType}
              currentModulePoints={userKanaPoints}
              wasCompletedBefore={quizKana.wasCompletedBefore}
              progressEligible={quizKana.progressEligible}
              onClose={handleKanaQuizClose}
            />
          )}
        </div>
      )}
    </DashboardShell>
  );
}
