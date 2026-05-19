"use client";

import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { CategoryFilter } from "@/features/library/components/CategoryFilter";
import { VocabularyCard } from "@/features/library/components/VocabularyCard";
import { useSidebar } from "@/shared/components/SidebarContext";
import { ScriptCard } from "@/features/library/components/ScriptCard";
import { LibraryGrid } from "@/features/library/components/LibraryGrid";
import { LibraryRecentPanel } from "@/features/library/components/LibraryRecentPanel";
import { LibraryCategorySection } from "@/features/library/components/LibraryCategorySection";
import { LibrarySearchBar } from "@/features/library/components/LibrarySearchBar";
import { LibrarySearchResults } from "@/features/library/components/LibrarySearchResults";
import { KanaPhoneticGrid } from "@/features/library/components/KanaPhoneticGrid";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import {
  LibraryCardsSkeletonGrid,
  LibrarySkeleton,
} from "@/shared/ui/Skeleton";
import { useFavorites } from "@/features/library/hooks/useFavorites";
import { useLibrarySearch } from "@/features/library/hooks/useLibrarySearch";
import { useRecentItems } from "@/features/library/hooks/useRecentItems";
import { useVocabularyContent } from "@/features/library/hooks/useVocabularyContent";
import { useKanjiLockedStatus } from "@/features/library/hooks/useKanjiLockedStatus";
import { useKanaLockedStatus } from "@/features/library/hooks/useKanaLockedStatus";
import { useLibraryContent } from "@/features/library/hooks/useLibraryContent";
import { useKanaContentAccess } from "@/features/kana/hooks/useKanaContentAccess";
import { useGrammarLessons } from "@/features/graph/grammar/hooks/useGrammarLessons";
import { useGrammarLesson } from "@/features/graph/grammar/hooks/useGrammarLesson";
import type { Kanji } from "@/features/kanji/types";
import type { KanjiQuizType } from "@/features/kanji/types/quiz";
import type { Kana } from "@/features/kana/types";
import type { KanaQuizType } from "@/features/kana/types/quiz";
import { KanjiQuizModal } from "@/features/kanji/components/quiz";
import { KanaQuizModal } from "@/features/kana/components/quiz";
import { GrammarLibraryCard } from "@/features/graph/grammar/components/library/GrammarLibraryCard";
import { GrammarLibraryCollection } from "@/features/graph/grammar/components/library/GrammarLibraryCollection";
import { GraphGateModal } from "@/features/graph/components/GraphGateModal";
import GrammarLessonModal from "@/features/graph/grammar/components/lesson/GrammarLessonModal";
import GrammarQuizModal from "@/features/graph/grammar/components/lesson/exam/GrammarQuizModal";
import { GRAMMAR_BOARD_TOTAL } from "@/features/graph/grammar/constants/grammarBoard";
import type { GrammarBoardProgress } from "@/features/graph/grammar/types/board";
import type { GrammarQuizCompletionResult } from "@/features/graph/grammar/types";
import VocabularyNodePanel from "@/features/graph/vocabulary/components/VocabularyNodePanel";
import {
  findWordProgress,
  isWordFullyCompleted,
} from "@/features/graph/vocabulary/lib/vocabularyQuizProgress";
import type {
  VocabularyQuizSaveContext,
  VocabularyQuizSaveResult,
  VocabularyWordLesson,
} from "@/features/graph/vocabulary/types";
import { dispatchLibraryDockVisibility } from "@/features/library/utils/libraryDockVisibility";
import {
  backendWordToWord,
  buildLibraryCategories,
  hiraganaToScriptCard,
  kanjiToScriptCard,
  katakanaToScriptCard,
  recentWordToCard,
  subthemeToCard,
  themeToCard,
  wordToCard,
} from "@/features/library/utils/libraryMappers";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import type { MasteryModuleId } from "@/features/mastery/types";
import {
  dispatchMasteryCelebrationRequest,
  dispatchMasteryProgressSync,
  subscribeMasteryCelebrationRequest,
} from "@/features/mastery/utils/masteryProgressSync";
import { HELP_GUIDE_LIBRARY_RESET_EVENT } from "@/features/help/utils/guideEvents";
import { PremiumThemeGateModal } from "@/shared/ui/PremiumThemeGateModal";
import { useToast } from "@/shared/ui/ToastProvider";
import { unlockKanji } from "@/features/kanji";
import type {
  Theme as LibraryTheme,
  Subtheme as LibrarySubtheme,
  Word as LibraryWord,
} from "@/features/library/types";
import type { SearchIndexItem } from "@/features/library/types/librarySearch.types";
import { getLibrarySearchIndex } from "@/features/library/services/librarySearch.service";
// import { getPrimaryMeaning } from "@/features/kanji";

type QuizCompletionResult = {
  newlyCompleted?: boolean;
  newlyCompletedPoints?: number;
  resultingModulePoints?: number;
  triggeredModuleMastery?: boolean;
};

function toVocabularyWordLesson(word: LibraryWord): VocabularyWordLesson {
  return {
    wordId: word.id,
    kanji: word.kanji ?? undefined,
    hiragana: word.hiragana ?? undefined,
    meanings: word.meanings?.filter(Boolean) ?? [],
    icon: word.icon ?? null,
    order: word.order ?? null,
    unlockedAt: word.unlockedAt ?? null,
    completedAt: word.completedAt ?? null,
    score: word.score ?? null,
    progress: word.progress ?? null,
    completedQuizTypes: word.completedQuizTypes ?? null,
    meaningCompleted: word.meaningCompleted ?? null,
    listeningCompleted: word.listeningCompleted ?? null,
    speakingCompleted: word.speakingCompleted ?? null,
    writingCompleted: word.writingCompleted ?? null,
    meaningScore: word.meaningScore ?? null,
    listeningScore: word.listeningScore ?? null,
    speakingScore: word.speakingScore ?? null,
    writingScore: word.writingScore ?? null,
    updatedAt: word.updatedAt ?? null,
  };
}

const GRAPH_RETURN_SNAPSHOT_STORAGE_KEY = "gokai:vocabulary-graph-return-snapshot";
const GRAPH_RETURN_PENDING_STORAGE_KEY = "gokai:vocabulary-graph-return-pending";

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [selectedVocabularyWordId, setSelectedVocabularyWordId] = useState<string | null>(
    null,
  );
  const [selectedGrammarLessonId, setSelectedGrammarLessonId] = useState<string | null>(null);
  const [grammarOverlayStage, setGrammarOverlayStage] = useState<"lesson" | "quiz">("lesson");
  const [showKanaRequirementModal, setShowKanaRequirementModal] = useState(false);
  const [kanaRequirementContentLabel, setKanaRequirementContentLabel] = useState("este contenido");
  const [showPremiumThemeModal, setShowPremiumThemeModal] = useState(false);
  const [premiumThemeLabel, setPremiumThemeLabel] = useState("este interes");
  const [newlyUnlockedVocabularyWordIds, setNewlyUnlockedVocabularyWordIds] =
    useState<ReadonlySet<string>>(new Set());

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  const { setBlurred, setHidden } = useSidebar();
  const mastered = useMasteredModules();
  const {
    hasKanaContentAccess,
    loading: kanaContentAccessLoading,
  } = useKanaContentAccess();
  const toast = useToast();
  const autoUnlockedKanjiRef = useRef<Set<string>>(new Set());
  const libraryMasteryRootRef = useRef<HTMLDivElement | null>(null);
  const libraryMasteryTourTimersRef = useRef<number[]>([]);
  const libraryMasteryActiveCardRef = useRef<HTMLElement | null>(null);
  const pendingLibraryMasteryModuleRef = useRef<MasteryModuleId | null>(null);
  const hasCompletedInitialLibraryEntranceRef = useRef(false);
  useEffect(() => {
    setBlurred(drawerEntity !== null);
    return () => setBlurred(false);
  }, [drawerEntity, setBlurred]);

  useEffect(() => {
    setHidden(
      selectedVocabularyWordId !== null ||
        selectedGrammarLessonId !== null ||
        showKanaRequirementModal ||
        showPremiumThemeModal,
    );
    return () => setHidden(false);
  }, [
    selectedGrammarLessonId,
    selectedVocabularyWordId,
    setHidden,
    showKanaRequirementModal,
    showPremiumThemeModal,
  ]);

  const clearLibraryMasteryTour = useCallback(() => {
    libraryMasteryTourTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    libraryMasteryTourTimersRef.current = [];

    if (libraryMasteryActiveCardRef.current) {
      libraryMasteryActiveCardRef.current.classList.remove("library-mastery-tour-card");
      libraryMasteryActiveCardRef.current = null;
    }
  }, []);

  const runLibraryMasteryTour = useCallback((moduleId: MasteryModuleId) => {
    const root = libraryMasteryRootRef.current;

    if (!root) {
      return;
    }

    clearLibraryMasteryTour();

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(`[data-library-mastery-card="${moduleId}"]`),
    );

    if (cards.length === 0) {
      return;
    }

    const perCardDelay = Math.max(70, Math.min(180, Math.round(5400 / cards.length)));

    cards.forEach((card, index) => {
      const timerId = window.setTimeout(() => {
        if (libraryMasteryActiveCardRef.current && libraryMasteryActiveCardRef.current !== card) {
          libraryMasteryActiveCardRef.current.classList.remove("library-mastery-tour-card");
        }

        libraryMasteryActiveCardRef.current = card;
        card.classList.add("library-mastery-tour-card");
      }, index * perCardDelay);

      libraryMasteryTourTimersRef.current.push(timerId);
    });

    libraryMasteryTourTimersRef.current.push(
      window.setTimeout(() => {
        clearLibraryMasteryTour();
      }, cards.length * perCardDelay + 650),
    );
  }, [clearLibraryMasteryTour]);

  useEffect(() => clearLibraryMasteryTour, [clearLibraryMasteryTour]);

  useEffect(
    () =>
      subscribeMasteryCelebrationRequest((detail) => {
        const moduleId = detail.moduleId;

        if (
          moduleId === "hiragana" ||
          moduleId === "katakana" ||
          moduleId === "kanji" ||
          moduleId === "grammar"
        ) {
          pendingLibraryMasteryModuleRef.current = moduleId;

          if (selectedCategory !== moduleId) {
            setSearchQuery("");
            setSelectedCategory(moduleId);
            return;
          }

          window.requestAnimationFrame(() => {
            runLibraryMasteryTour(moduleId);
            pendingLibraryMasteryModuleRef.current = null;
          });
        }
      }),
    [runLibraryMasteryTour, selectedCategory],
  );

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    if (pendingLibraryMasteryModuleRef.current !== selectedCategory) {
      return;
    }

    const moduleId = pendingLibraryMasteryModuleRef.current;
    if (!moduleId) {
      return;
    }

    const timerId = window.setTimeout(() => {
      runLibraryMasteryTour(moduleId);
      pendingLibraryMasteryModuleRef.current = null;
    }, 120);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [runLibraryMasteryTour, selectedCategory]);

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
    filteredKanjis,
    filteredKatakanas,
    filteredHiraganas,
    hasResolvedInitialContent,
    loadingKanjis,
    loadingKatakanas,
    loadingHiraganas,
  } = useLibraryContent(searchQuery);

  const {
    lockedKanjiIds,
    completedKanjiIds,
    nextUnlockCandidateId,
    canUnlockNext,
    unlockCost,
    userPoints,
    hasResolvedInitialStatus: hasResolvedInitialKanjiStatus,
    reload: reloadLockedStatus,
    applyOptimisticUnlock: applyOptimisticKanjiUnlock,
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
  const [unlockPendingKanjiId, setUnlockPendingKanjiId] = useState<string | null>(
    null,
  );
  const [newlyUnlockedKanaIds, setNewlyUnlockedKanaIds] = useState<
    ReadonlySet<string>
  >(new Set());
  const lockedHiraganaIdsBeforeQuizRef = useRef<Set<string> | null>(null);
  const lockedKatakanaIdsBeforeQuizRef = useRef<Set<string> | null>(null);
  const unlockAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const vocabularyUnlockAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
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
    subthemes,
    words,
    interestSubthemes,
    interestWords,
    filteredThemes,
    filteredSubthemes,
    filteredWords,
    filteredInterestSubthemes,
    selectedSubthemeItem,
    selectedTheme,
    selectedSubtheme,
    loadingThemes,
    loadingSubthemes,
    loadingWords,
    loadingInterestPreviews,
    openTheme,
    openSubtheme,
    reloadProgress: reloadVocabularyProgress,
    resetVocabularyView,
  } = useVocabularyContent(
    searchQuery,
    selectedCategory === "themes" ||
      selectedCategory === "favoritos" ||
      selectedCategory === "recent",
  );

  const { recentItems, addRecentItem, loading: loadingRecentItems } = useRecentItems();
  const {
    boardItems: grammarBoardItems,
    status: grammarStatus,
    refetch: refetchGrammarBoard,
  } = useGrammarLessons();
  const {
    lesson: selectedGrammarLesson,
    status: selectedGrammarLessonStatus,
    error: selectedGrammarLessonError,
    refetch: refetchSelectedGrammarLesson,
  } = useGrammarLesson(selectedGrammarLessonId);

  const {
    favoriteKanjis,
    favoriteHiraganas,
    favoriteKatakanas,
    favoriteGrammar,
    favoriteWords,
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
  const browsableGrammarItems = useMemo(
    () => grammarBoardItems.filter((item) => !item.isMock),
    [grammarBoardItems],
  );
  const filteredGrammarItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return browsableGrammarItems;
    }

    return browsableGrammarItems.filter((item) =>
      [item.title, item.symbol]
        .some((value) => (value || "").toLowerCase().includes(normalizedQuery)),
    );
  }, [browsableGrammarItems, searchQuery]);
  const grammarLessonsById = useMemo(
    () => new Map(browsableGrammarItems.map((item) => [item.id, item])),
    [browsableGrammarItems],
  );
  const allContentItems = useMemo(
    () => [
      ...filteredThemes.map((theme) => ({ type: "theme" as const, data: theme })),
      ...filteredKanjis.map((kanji) => ({ type: "kanji" as const, data: kanji })),
      ...filteredHiraganas.map((hiragana) => ({ type: "hiragana" as const, data: hiragana })),
      ...filteredKatakanas.map((katakana) => ({ type: "katakana" as const, data: katakana })),
      ...filteredGrammarItems.map((lesson) => ({ type: "grammar" as const, data: lesson })),
    ],
    [filteredGrammarItems, filteredHiraganas, filteredKanjis, filteredKatakanas, filteredThemes],
  );
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
  const orderedVocabularyWords = useMemo(
    () =>
      [...words].sort(
        (left, right) =>
          (left.order ?? Number.MAX_SAFE_INTEGER) -
          (right.order ?? Number.MAX_SAFE_INTEGER),
      ),
    [words],
  );
  const vocabularyWordIndex = useMemo(() => {
    const nextIndex = new Map<string, LibraryWord>();

    interestWords.forEach((word) => {
      nextIndex.set(word.id, word);
    });

    orderedVocabularyWords.forEach((word) => {
      nextIndex.set(word.id, word);
    });

    return nextIndex;
  }, [interestWords, orderedVocabularyWords]);
  const vocabularyThemeIndex = useMemo(
    () => new Map(themes.map((theme) => [theme.id, theme])),
    [themes],
  );
  const vocabularySubthemeIndex = useMemo(() => {
    const nextIndex = new Map<string, LibrarySubtheme>();

    [
      ...subthemes,
      ...interestSubthemes,
      ...filteredSubthemes,
      ...filteredInterestSubthemes,
    ].forEach((subtheme) => {
      nextIndex.set(subtheme.id, subtheme);
    });

    return nextIndex;
  }, [filteredInterestSubthemes, filteredSubthemes, interestSubthemes, subthemes]);
  const vocabularyUnlockedWordIds = useMemo(() => {
    const unlockedIds = new Set<string>(selectedSubthemeItem?.unlockedWordIds ?? []);

    if (selectedSubthemeItem?.currentWordId) {
      unlockedIds.add(selectedSubthemeItem.currentWordId);
    }

    orderedVocabularyWords.forEach((word, index) => {
      if (index === 0 || isWordFullyCompleted(toVocabularyWordLesson(word))) {
        unlockedIds.add(word.id);
      }
    });

    return unlockedIds;
  }, [orderedVocabularyWords, selectedSubthemeItem]);
  const vocabularyWordLockStateById = useMemo(() => {
    const nextState = new Map<string, boolean>();

    orderedVocabularyWords.forEach((word) => {
      nextState.set(word.id, !vocabularyUnlockedWordIds.has(word.id));
    });

    return nextState;
  }, [orderedVocabularyWords, vocabularyUnlockedWordIds]);
  const themeLockStateById = useMemo(() => {
    const nextState = new Map<string, boolean>();

    themes.forEach((theme) => {
      nextState.set(theme.id, theme.isUnlocked === false);
    });

    return nextState;
  }, [themes]);
  const filteredInterestThemes = useMemo(
    () => filteredThemes.filter((theme) => Boolean(theme.selectedAt)),
    [filteredThemes],
  );
  const interestSubthemesByThemeId = useMemo(() => {
    const nextGroups = new Map<string, LibrarySubtheme[]>();

    filteredInterestSubthemes.forEach((subtheme) => {
      if (!subtheme.themeId) {
        return;
      }

      const bucket = nextGroups.get(subtheme.themeId) ?? [];
      bucket.push(subtheme);
      nextGroups.set(subtheme.themeId, bucket);
    });

    return nextGroups;
  }, [filteredInterestSubthemes]);
  const selectedVocabularyWord = useMemo(
    () => words.find((word) => word.id === selectedVocabularyWordId) ?? null,
    [selectedVocabularyWordId, words],
  );
  const selectedVocabularyQuestion = useMemo(
    () =>
      selectedVocabularyWord ? toVocabularyWordLesson(selectedVocabularyWord) : null,
    [selectedVocabularyWord],
  );
  const openKanaRequirementModal = useCallback((contentLabel: string) => {
    setKanaRequirementContentLabel(contentLabel);
    setShowKanaRequirementModal(true);
  }, []);

  const openPremiumThemeModal = useCallback((themeLabel?: string | null) => {
    setPremiumThemeLabel(themeLabel?.trim() || "este interes");
    setShowPremiumThemeModal(true);
  }, []);

  const handleKanjiClick = useCallback((kanji: Kanji) => {
    if (!hasKanaContentAccess) {
      openKanaRequirementModal("kanjis");
      return;
    }

    addRecentItem("kanji", kanji.id);
    setDrawerEntity({ id: kanji.id, kind: "kanji" });
  }, [addRecentItem, hasKanaContentAccess, openKanaRequirementModal]);

  const handleVocabularyThemeOpen = useCallback(
    async (theme: LibraryTheme) => {
      setSelectedVocabularyWordId(null);

      if (theme.isUnlocked === false) {
        openPremiumThemeModal(theme.meaning);
        return false;
      }

      return openTheme(theme);
    },
    [openPremiumThemeModal, openTheme],
  );

  const handleAllContentThemeOpen = useCallback(
    (theme: LibraryTheme) => {
      setSearchQuery("");
      setSelectedCategory("themes");
      void handleVocabularyThemeOpen(theme);
    },
    [handleVocabularyThemeOpen],
  );

  const handleAllContentGrammarOpen = useCallback(
    (lessonId: string) => {
      if (!hasKanaContentAccess) {
        openKanaRequirementModal("gramática");
        return;
      }

      setSearchQuery("");
      setSelectedVocabularyWordId(null);
      setSelectedGrammarLessonId(lessonId);
      setGrammarOverlayStage("lesson");
      void addRecentItem("grammar", lessonId);
    },
    [addRecentItem, hasKanaContentAccess, openKanaRequirementModal],
  );

  const handleGrammarOverlayOpen = useCallback(
    (lessonId: string) => {
      if (!hasKanaContentAccess) {
        openKanaRequirementModal("gramática");
        return;
      }

      setSearchQuery("");
      setSelectedVocabularyWordId(null);
      setSelectedGrammarLessonId(lessonId);
      setGrammarOverlayStage("lesson");
      void addRecentItem("grammar", lessonId);
    },
    [addRecentItem, hasKanaContentAccess, openKanaRequirementModal],
  );

  const handleGrammarOverlayClose = useCallback(() => {
    setSelectedGrammarLessonId(null);
    setGrammarOverlayStage("lesson");
  }, []);

  const handleGrammarQuizComplete = useCallback(
    (result: GrammarQuizCompletionResult) => {
      if (result.hasGrammarMastery === true) {
        dispatchMasteryProgressSync({ hasGrammarMastery: true });

        if (!mastered.has("grammar")) {
          window.requestAnimationFrame(() => {
            dispatchMasteryCelebrationRequest({ moduleId: "grammar" });
          });
        }
      }

      void refetchGrammarBoard();
      void refetchSelectedGrammarLesson();
    },
    [mastered, refetchGrammarBoard, refetchSelectedGrammarLesson],
  );

  const handleLibraryWordOpenById = useCallback(
    async (wordId: string) => {
      setSearchQuery("");
      setSelectedVocabularyWordId(null);

      const word = vocabularyWordIndex.get(wordId);
      let resolvedSubthemeId = word?.subthemeId ?? null;
      let resolvedThemeId: string | null = null;

      if (resolvedSubthemeId) {
        resolvedThemeId = vocabularySubthemeIndex.get(resolvedSubthemeId)?.themeId ?? null;
      }

      if (!resolvedSubthemeId || !resolvedThemeId) {
        const searchIndex = await getLibrarySearchIndex();
        const matchedWord = searchIndex.find(
          (item) => item.entityType === "word" && item.id === wordId,
        );

        resolvedSubthemeId = matchedWord?.subthemeId ?? null;
        resolvedThemeId = matchedWord?.themeId ?? null;
      }

      if (!resolvedSubthemeId || !resolvedThemeId) {
        setSelectedVocabularyWordId(null);
        return;
      }

      const subtheme = vocabularySubthemeIndex.get(resolvedSubthemeId) ?? {
        id: resolvedSubthemeId,
        themeId: resolvedThemeId,
        kanji: "",
        kana: "",
        meaning: "",
      };

      const theme = vocabularyThemeIndex.get(resolvedThemeId) ?? {
        id: resolvedThemeId,
        kanji: "",
        kana: "",
        meaning: "",
        released: true,
        isUnlocked: themeLockStateById.get(resolvedThemeId) ? false : null,
      };

      if (!theme) {
        setSelectedVocabularyWordId(null);
        return;
      }

      const themeOpened = await openTheme(theme);

      if (!themeOpened) {
        setSelectedVocabularyWordId(null);
        return;
      }

      const subthemeOpened = await openSubtheme(subtheme);

      if (!subthemeOpened) {
        setSelectedVocabularyWordId(null);
        return;
      }

      if (!hasKanaContentAccess) {
        openKanaRequirementModal("vocabulario");
        return;
      }

      setSelectedVocabularyWordId(wordId);

      void addRecentItem("word", wordId);
    },
    [
      addRecentItem,
      themeLockStateById,
      openSubtheme,
      openTheme,
      vocabularySubthemeIndex,
      vocabularyThemeIndex,
      vocabularyWordIndex,
      hasKanaContentAccess,
      openKanaRequirementModal,
    ],
  );

  const handleVocabularySubthemeOpen = useCallback(
    async (subtheme: LibrarySubtheme) => {
      setSelectedVocabularyWordId(null);
      return openSubtheme(subtheme);
    },
    [openSubtheme],
  );


  const handleVocabularyWordOpen = useCallback(
    (word: LibraryWord) => {
      if (!hasKanaContentAccess) {
        openKanaRequirementModal("vocabulario");
        return;
      }

      const isLocked = vocabularyWordLockStateById.get(word.id) ?? false;

      if (isLocked || !selectedSubthemeItem) {
        return;
      }

      void addRecentItem("word", word.id);
      setSelectedVocabularyWordId(word.id);
    },
    [addRecentItem, hasKanaContentAccess, openKanaRequirementModal, selectedSubthemeItem, vocabularyWordLockStateById],
  );

  const handleSearchVocabularyThemeOpen = useCallback(
    (theme: LibraryTheme) => {
      setSearchQuery("");
      setSelectedCategory("themes");
      setSelectedVocabularyWordId(null);
      void handleVocabularyThemeOpen(theme);
    },
    [handleVocabularyThemeOpen],
  );

  const {
    groupedResults: groupedSearchResults,
    totalResults: totalGroupedSearchResults,
    isSearchActive,
    isIndexLoading: isLibrarySearchIndexLoading,
    isDebouncing: isLibrarySearchDebouncing,
    error: librarySearchError,
    hasNoResults: librarySearchHasNoResults,
  } = useLibrarySearch(searchQuery);

  function handleSearchKanjiSelect(item: SearchIndexItem) {
    const kanji = kanjis.find((entry) => entry.id === item.id);

    if (!kanji) {
      return;
    }

    handleLibraryKanjiSelect(kanji);
  }

  function handleSearchKanaSelect(item: SearchIndexItem) {
    const collection = item.entityType === "katakana" ? katakanas : hiraganas;
    const kana = collection.find((entry) => entry.id === item.id);

    if (!kana) {
      return;
    }

    handleKanaClick(kana);
  }

  const handleSearchGrammarSelect = useCallback(
    (item: SearchIndexItem) => {
      handleGrammarOverlayOpen(item.id);
    },
    [handleGrammarOverlayOpen],
  );

  const handleSearchVocabularySelect = useCallback(
    async (item: SearchIndexItem) => {
      setSearchQuery("");
      setSelectedCategory("themes");
      setSelectedVocabularyWordId(null);

      if (item.entityType === "theme") {
        await handleSearchVocabularyThemeOpen({
          id: item.id,
          kanji: item.kanji ?? "",
          kana: item.kana ?? "",
          meaning: item.title,
          released: item.released ?? true,
          isUnlocked: themeLockStateById.get(item.id) ? false : null,
        });
        return;
      }

      if (!item.themeId) {
        return;
      }

      const themeOpened = await openTheme({
        id: item.themeId,
        kanji: "",
        kana: "",
        meaning: "",
        released: true,
        isUnlocked: themeLockStateById.get(item.themeId) ? false : null,
      });

      if (!themeOpened) {
        return;
      }

      if (item.entityType === "subtheme") {
        await openSubtheme({
          id: item.id,
          themeId: item.themeId,
          kanji: item.kanji ?? "",
          kana: item.kana ?? "",
          meaning: item.title,
        });
        return;
      }

      if (item.entityType !== "word" || !item.subthemeId) {
        return;
      }

      const subthemeOpened = await openSubtheme({
        id: item.subthemeId,
        themeId: item.themeId,
        kanji: "",
        kana: "",
        meaning: "",
      });

      if (!subthemeOpened) {
        setSelectedVocabularyWordId(null);
        return;
      }

      if (!hasKanaContentAccess) {
        openKanaRequirementModal("vocabulario");
        return;
      }

      setSelectedVocabularyWordId(item.id);
      void addRecentItem("word", item.id);
    },
    [addRecentItem, handleSearchVocabularyThemeOpen, hasKanaContentAccess, openKanaRequirementModal, openSubtheme, openTheme, themeLockStateById],
  );

  const startVocabularyUnlockAnimation = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    if (vocabularyUnlockAnimationTimerRef.current !== null) {
      clearTimeout(vocabularyUnlockAnimationTimerRef.current);
    }

    setNewlyUnlockedVocabularyWordIds(new Set(ids));
    vocabularyUnlockAnimationTimerRef.current = setTimeout(() => {
      setNewlyUnlockedVocabularyWordIds(new Set());
    }, 2800);
  }, []);

  const handleVocabularyQuizSaved = useCallback(
    async ({ wordId }: VocabularyQuizSaveContext): Promise<VocabularyQuizSaveResult> => {
      const previousItem = selectedSubthemeItem;
      const previousWordProgress = findWordProgress(previousItem, wordId);
      const nextProgress = await reloadVocabularyProgress();
      const nextItem =
        nextProgress?.items?.find((item) => item.nodeId === previousItem?.nodeId) ??
        null;
      const nextWordProgress = findWordProgress(nextItem, wordId);
      const nextUnlockedWordId =
        nextItem?.currentWordId && nextItem.currentWordId !== wordId
          ? nextItem.currentWordId
          : null;
      const wordJustCompleted =
        !isWordFullyCompleted(previousWordProgress) &&
        isWordFullyCompleted(nextWordProgress);

      if (!wordJustCompleted || !nextUnlockedWordId) {
        return { closeQuiz: false };
      }

      startVocabularyUnlockAnimation([nextUnlockedWordId]);
      return { closeQuiz: true };
    },
    [reloadVocabularyProgress, selectedSubthemeItem, startVocabularyUnlockAnimation],
  );

  const handleLibraryKanjiSelect = useCallback((kanji: Kanji) => {
    if (!hasKanaContentAccess) {
      openKanaRequirementModal("kanjis");
      return;
    }

    const isLocked = lockedKanjiIds.has(kanji.id);

    if (isLocked) {
      // Long-press handles unlock; click on locked kanji is a no-op.
      return;
    }

    handleKanjiClick(kanji);
  }, [handleKanjiClick, hasKanaContentAccess, lockedKanjiIds, openKanaRequirementModal]);

  const handlePressUnlockKanji = useCallback(
    async (kanjiId: string) => {
      if (unlockPendingKanjiId !== null) {
        return;
      }

      if (!canUnlockNext || nextUnlockCandidateId !== kanjiId) {
        return;
      }

      setUnlockPendingKanjiId(kanjiId);

      try {
        const response = await unlockKanji(kanjiId);
        dispatchMasteryProgressSync({ points: response.userPoints });
        applyOptimisticKanjiUnlock(kanjiId, response.userPoints);
        startUnlockAnimation([kanjiId], "kanji");
        void reloadLockedStatus();
      } catch (error) {
        const fallbackMessage = "No se pudo desbloquear el kanji.";
        if (error instanceof Error) {
          toast.error(
            error.message.replace(/^HTTP\s+\d+:\s*/i, "").trim() ||
              fallbackMessage,
          );
        } else {
          toast.error(fallbackMessage);
        }
      } finally {
        setUnlockPendingKanjiId(null);
      }
    },
    [
      canUnlockNext,
      applyOptimisticKanjiUnlock,
      nextUnlockCandidateId,
      reloadLockedStatus,
      startUnlockAnimation,
      toast,
      unlockPendingKanjiId,
    ],
  );

  useEffect(() => {
    if (!canUnlockNext || !nextUnlockCandidateId) {
      return;
    }

    if (unlockPendingKanjiId !== null) {
      return;
    }

    if ((unlockCost ?? 0) > 0) {
      return;
    }

    if (autoUnlockedKanjiRef.current.has(nextUnlockCandidateId)) {
      return;
    }

    autoUnlockedKanjiRef.current.add(nextUnlockCandidateId);
    void handlePressUnlockKanji(nextUnlockCandidateId);
  }, [
    canUnlockNext,
    handlePressUnlockKanji,
    nextUnlockCandidateId,
    unlockCost,
    unlockPendingKanjiId,
  ]);

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

    if (_result?.triggeredModuleMastery) {
      dispatchMasteryProgressSync({ hasKanjiMastery: true });

      if (!mastered.has("kanji")) {
        window.requestAnimationFrame(() => {
          dispatchMasteryCelebrationRequest({ moduleId: "kanji" });
        });
      }
    }

    void reloadLockedStatus();
  }, [mastered, quizKanji, reloadLockedStatus]);

  const handleKanaClick = useCallback((kana: Kana) => {
    void addRecentItem(kana.kanaType, kana.id);
    setDrawerEntity({ id: kana.id, kind: "kana", kanaType: kana.kanaType });
  }, [addRecentItem]);

  const handleKanaQuizClose = useCallback(async (_result?: QuizCompletionResult) => {
    const isPracticeOnly = quizKana?.isPracticeOnly === true;
    const kanaType = quizKana?.kanaType ?? "hiragana";
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

    if (_result?.triggeredModuleMastery) {
      if (kanaType === "hiragana") {
        dispatchMasteryProgressSync({ hasHiraganaMastery: true });

        if (!mastered.has("hiragana")) {
          window.requestAnimationFrame(() => {
            dispatchMasteryCelebrationRequest({ moduleId: "hiragana" });
          });
        }
      } else {
        dispatchMasteryProgressSync({ hasKatakanaMastery: true });

        if (!mastered.has("katakana")) {
          window.requestAnimationFrame(() => {
            dispatchMasteryCelebrationRequest({ moduleId: "katakana" });
          });
        }
      }
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
  }, [hiraganas, katakanas, mastered, quizKana, reloadKanaLockedStatus, startUnlockAnimation, userKanaPoints]);

  useEffect(() => {
    return () => {
      if (unlockAnimationTimerRef.current !== null) {
        clearTimeout(unlockAnimationTimerRef.current);
      }

      if (vocabularyUnlockAnimationTimerRef.current !== null) {
        clearTimeout(vocabularyUnlockAnimationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    dispatchLibraryDockVisibility(selectedCategory);

    return () => {
      dispatchLibraryDockVisibility(null);
    };
  }, [selectedCategory]);

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setSearchQuery("");
    setSelectedVocabularyWordId(null);

    if (cat !== "themes") {
      resetVocabularyView();
    }
  };

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (!value.trim()) {
        return;
      }

      setDrawerEntity(null);
      setSelectedCategory(null);
      setSelectedVocabularyWordId(null);
      resetVocabularyView();
    },
    [resetVocabularyView],
  );

  const requestedCategory = searchParams.get("category");
  const requestedEntityId = searchParams.get("entityId");
  const highlightedKanaSymbol = searchParams.get("symbol");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!window.sessionStorage.getItem(GRAPH_RETURN_SNAPSHOT_STORAGE_KEY)) {
      return;
    }

    const markGraphReturnPending = () => {
      window.sessionStorage.setItem(GRAPH_RETURN_PENDING_STORAGE_KEY, "1");
    };

    window.addEventListener("popstate", markGraphReturnPending);

    return () => {
      window.removeEventListener("popstate", markGraphReturnPending);
    };
  }, []);

  useEffect(() => {
    if (
      requestedCategory !== "hiragana" &&
      requestedCategory !== "katakana" &&
      requestedCategory !== "kanji"
    ) {
      return;
    }

    setSelectedCategory(requestedCategory);
    setSearchQuery("");
    setSelectedVocabularyWordId(null);
    resetVocabularyView();
  }, [requestedCategory, resetVocabularyView]);

  useEffect(() => {
    if (!requestedEntityId) {
      return;
    }

    if (
      requestedCategory === "kanji" &&
      selectedCategory === "kanji" &&
      kanjis.some((kanji) => kanji.id === requestedEntityId)
    ) {
      setDrawerEntity({ id: requestedEntityId, kind: "kanji" });
      return;
    }

    if (
      requestedCategory === "hiragana" &&
      selectedCategory === "hiragana" &&
      hiraganas.some((kana) => kana.id === requestedEntityId)
    ) {
      setDrawerEntity({
        id: requestedEntityId,
        kind: "kana",
        kanaType: "hiragana",
      });
      return;
    }

    if (
      requestedCategory === "katakana" &&
      selectedCategory === "katakana" &&
      katakanas.some((kana) => kana.id === requestedEntityId)
    ) {
      setDrawerEntity({
        id: requestedEntityId,
        kind: "kana",
        kanaType: "katakana",
      });
    }
  }, [
    hiraganas,
    kanjis,
    katakanas,
    requestedCategory,
    requestedEntityId,
    selectedCategory,
  ]);

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
    themes.length + kanjis.length + katakanas.length + hiraganas.length + browsableGrammarItems.length;
  const vocabularyCurrentCount = selectedSubtheme
    ? filteredWords.length
    : selectedTheme
      ? filteredSubthemes.length
      : filteredThemes.length + filteredInterestSubthemes.length;
  const isLibraryBootstrapping =
    !hasResolvedInitialContent ||
    !hasResolvedInitialKanjiStatus ||
    !hasResolvedInitialKanaStatus ||
    grammarStatus === "loading" ||
    kanaContentAccessLoading;
  const shouldDisableLibraryEntranceAnimations =
    !animationsEnabled || hasCompletedInitialLibraryEntranceRef.current;

  useEffect(() => {
    if (isLibraryBootstrapping) {
      return;
    }

    hasCompletedInitialLibraryEntranceRef.current = true;
  }, [isLibraryBootstrapping]);

  return (
    <DashboardShell>
      {isLibraryBootstrapping ? (
        <div data-help-loading="true">
          <LibrarySkeleton />
        </div>
      ) : (
        <div ref={libraryMasteryRootRef} data-help-target="library-page">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <LibrarySearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              isLoading={isLibrarySearchIndexLoading || isLibrarySearchDebouncing}
            />
          </div>

          <AnimatedEntrance
            index={0}
            className="mb-8"
            disabled={shouldDisableLibraryEntranceAnimations}
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

          {isSearchActive && !selectedCategory && (
            <AnimatedEntrance
              index={1}
              disabled={shouldDisableLibraryEntranceAnimations}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              {librarySearchError ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <h3 className="mb-2 text-xl font-bold text-content-primary">
                    No pudimos cargar la búsqueda
                  </h3>
                  <p className="max-w-md text-center text-content-secondary">
                    Intenta de nuevo en unos segundos. {librarySearchError}
                  </p>
                </div>
              ) : (
                <LibrarySearchResults
                  query={searchQuery}
                  groupedResults={groupedSearchResults}
                  totalResults={totalGroupedSearchResults}
                  isLoading={isLibrarySearchIndexLoading || isLibrarySearchDebouncing}
                  hasNoResults={librarySearchHasNoResults}
                  grammarLessonsById={grammarLessonsById}
                  favoriteKanjis={favoriteKanjis}
                  favoriteHiraganas={favoriteHiraganas}
                  favoriteKatakanas={favoriteKatakanas}
                  favoriteGrammar={favoriteGrammar}
                  favoriteWords={favoriteWords}
                  lockedKanjiIds={lockedKanjiIds}
                  lockedHiraganaIds={lockedHiraganaIds}
                  lockedKatakanaIds={lockedKatakanaIds}
                  themeLockStateById={themeLockStateById}
                  wordLockStateById={vocabularyWordLockStateById}
                  newlyUnlockedKanjiIds={newlyUnlockedKanjiIds}
                  newlyUnlockedKanaIds={newlyUnlockedKanaIds}
                  canUnlockNext={canUnlockNext}
                  nextUnlockCandidateId={nextUnlockCandidateId}
                  unlockPendingKanjiId={unlockPendingKanjiId}
                  userPoints={userPoints}
                  vocabularyAccessLocked={!hasKanaContentAccess}
                  onKanjiSelect={handleSearchKanjiSelect}
                  onKanaSelect={handleSearchKanaSelect}
                  onGrammarSelect={handleSearchGrammarSelect}
                  onVocabularySelect={(item) => {
                    void handleSearchVocabularySelect(item);
                  }}
                  onToggleFavoriteKanji={(id) => {
                    toggleFavoriteKanji(id);
                  }}
                  onToggleFavoriteWord={(id) => {
                    void toggleFavorite(id, "word");
                  }}
                  onToggleFavoriteGrammar={(id) => {
                    void toggleFavorite(id, "grammar");
                  }}
                  onPressUnlockKanji={(id) => {
                    void handlePressUnlockKanji(id);
                  }}
                />
              )}
            </AnimatedEntrance>
          )}

          {!selectedCategory && !isSearchActive && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
              <AnimatedEntrance
                index={1}
                className="order-1 xl:order-2"
                disabled={shouldDisableLibraryEntranceAnimations}
                mode={heavyAnimationsEnabled ? "default" : "light"}
              >
                <div data-help-target="library-recent">
                  <LibraryRecentPanel
                    recentItems={recentItems}
                    kanjis={kanjis}
                    hiraganas={hiraganas}
                    katakanas={katakanas}
                    loading={loadingRecentItems}
                    onOpenRecent={() => setSelectedCategory("recent")}
                    onKanjiClick={handleLibraryKanjiSelect}
                    onKanaClick={handleKanaClick}
                    onGrammarClick={handleGrammarOverlayOpen}
                    onWordClick={(wordId) => {
                      void handleLibraryWordOpenById(wordId);
                    }}
                  />
                </div>
              </AnimatedEntrance>

              <AnimatedEntrance
                index={2}
                className="order-2 min-w-0 xl:order-1"
                disabled={shouldDisableLibraryEntranceAnimations}
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
                    {allContentItems.length > 0 ? (
                      <LibraryGrid
                        items={allContentItems}
                        favoriteKanjis={favoriteKanjis}
                        favoriteHiraganas={favoriteHiraganas}
                        favoriteKatakanas={favoriteKatakanas}
                        favoriteGrammar={favoriteGrammar}
                        lockedKanjiIds={lockedKanjiIds}
                        nextUnlockReadyKanjiId={
                          canUnlockNext ? nextUnlockCandidateId : null
                        }
                        unlockPendingKanjiId={unlockPendingKanjiId}
                        currentKanjiPoints={userPoints}
                        lockedHiraganaIds={lockedHiraganaIds}
                        lockedKatakanaIds={lockedKatakanaIds}
                        newlyUnlockedKanjiIds={newlyUnlockedKanjiIds}
                        newlyUnlockedKanaIds={newlyUnlockedKanaIds}
                        toggleFavoriteKanji={toggleFavoriteKanji}
                        onToggleFavoriteGrammar={(id) => {
                          void toggleFavorite(id, "grammar");
                        }}
                        onKanjiClick={handleLibraryKanjiSelect}
                        onKanjiPressUnlock={handlePressUnlockKanji}
                        onKanaClick={handleKanaClick}
                        onThemeClick={handleAllContentThemeOpen}
                        onGrammarClick={handleAllContentGrammarOpen}
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
              disabled={shouldDisableLibraryEntranceAnimations}
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
                  <LibraryCardsSkeletonGrid variant="script" />
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
                              unlockReady={
                                isLocked &&
                                canUnlockNext &&
                                nextUnlockCandidateId === kanji.id
                              }
                              unlockPending={unlockPendingKanjiId === kanji.id}
                              unlocking={newlyUnlockedKanjiIds.has(kanji.id)}
                              currentPoints={userPoints}
                              onClick={() => handleLibraryKanjiSelect(kanji)}
                              onPressUnlock={handlePressUnlockKanji}
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
                      canOpenLessons={hasKanaContentAccess}
                      onBlockedLessonOpen={() => {
                        openKanaRequirementModal("gramática");
                      }}
                      favoriteIds={favoriteGrammar}
                      filterIds={favoriteGrammar}
                      onLessonOpen={(id) => {
                        void addRecentItem("grammar", id);
                      }}
                      onToggleFavorite={(id) => {
                        void toggleFavorite(id, "grammar");
                      }}
                    />
                  </div>
                )}

                {!loadingFavorites && favoriteData.word.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-semibold text-content-primary">
                      Vocabulario
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {favoriteData.word.map((fav, i) => {
                        const resolvedWord =
                          vocabularyWordIndex.get(fav.id) ?? backendWordToWord(fav);
                        const card = wordToCard(resolvedWord);

                        return (
                          <VocabularyCard
                            key={fav.id}
                            id={fav.id}
                            title={card.title}
                            subtitle={card.subtitle}
                            thumbnail={card.thumbnail}
                            variant="word"
                            index={i}
                            locked={!hasKanaContentAccess}
                            isFavorite={favoriteWords.has(fav.id)}
                            onClick={() => {
                              void handleLibraryWordOpenById(fav.id);
                            }}
                            onFavoriteToggle={
                              hasKanaContentAccess
                                ? (id) => {
                                    void toggleFavorite(id, "word");
                                  }
                                : undefined
                            }
                          />
                        );
                      })}
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
              disabled={shouldDisableLibraryEntranceAnimations}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Colección de Kanjis"
                countLabel={`${kanjis.length} kanjis`}
                loading={loadingKanjis}
                skeletonVariant="script"
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
                          unlockReady={
                            isLocked &&
                            canUnlockNext &&
                            nextUnlockCandidateId === kanji.id
                          }
                          unlockPending={unlockPendingKanjiId === kanji.id}
                          unlocking={newlyUnlockedKanjiIds.has(kanji.id)}
                          currentPoints={userPoints}
                          onClick={() => handleLibraryKanjiSelect(kanji)}
                          onPressUnlock={handlePressUnlockKanji}
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
              disabled={shouldDisableLibraryEntranceAnimations}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Colección de Gramática"
                countLabel={`${GRAMMAR_BOARD_TOTAL} lecciones`}
                loading={false}
                skeletonVariant="grammar"
                emptyTitle="No hay lecciones de gramática disponibles"
                emptyDescription="No encontramos lecciones para mostrar en esta sección."
              >
                <GrammarLibraryCollection
                  canOpenLessons={hasKanaContentAccess}
                  onBlockedLessonOpen={() => {
                    openKanaRequirementModal("gramática");
                  }}
                  favoriteIds={favoriteGrammar}
                  onLessonOpen={(id) => {
                    void addRecentItem("grammar", id);
                  }}
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
              disabled={shouldDisableLibraryEntranceAnimations}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Tabla fonética de Katakana"
                countLabel={`${katakanas.length} katakana`}
                loading={loadingKatakanas}
                skeletonVariant="script"
                emptyTitle="No hay katakana disponibles"
                emptyDescription="No encontramos katakana para mostrar."
              >
                {katakanas.length > 0 && (
                  <KanaPhoneticGrid
                    kanas={katakanas}
                    variant="katakana"
                    highlightedSymbol={selectedCategory === "katakana" ? highlightedKanaSymbol : null}
                    lockedIds={lockedKatakanaIds}
                    newlyUnlockedIds={newlyUnlockedKanaIds}
                    favoriteIds={favoriteKatakanas}
                    onKanaClick={handleKanaClick}
                  />
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "hiragana" && (
            <AnimatedEntrance
              index={1}
              disabled={shouldDisableLibraryEntranceAnimations}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Tabla fonética de Hiragana"
                countLabel={`${hiraganas.length} hiragana`}
                loading={loadingHiraganas}
                skeletonVariant="script"
                emptyTitle="No hay hiragana disponibles"
                emptyDescription="No encontramos hiragana para mostrar."
              >
                {hiraganas.length > 0 && (
                  <KanaPhoneticGrid
                    kanas={hiraganas}
                    variant="hiragana"
                    highlightedSymbol={selectedCategory === "hiragana" ? highlightedKanaSymbol : null}
                    lockedIds={lockedHiraganaIds}
                    newlyUnlockedIds={newlyUnlockedKanaIds}
                    favoriteIds={favoriteHiraganas}
                    onKanaClick={handleKanaClick}
                  />
                )}
              </LibraryCategorySection>
            </AnimatedEntrance>
          )}

          {selectedCategory === "themes" && (
            <AnimatedEntrance
              index={1}
              disabled={shouldDisableLibraryEntranceAnimations}
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
                skeletonVariant={selectedSubtheme ? "word" : "vocabulary"}
                skeletonGridClassName={
                  selectedSubtheme
                    ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
                }
                emptyTitle="No hay contenido disponible"
                emptyDescription="No encontramos elementos para mostrar en esta sección."
              >
                <div className="mb-5 flex flex-wrap gap-3">
                  {selectedTheme && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVocabularyWordId(null);
                        if (selectedSubtheme) {
                          void handleVocabularyThemeOpen(selectedTheme);
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
                      onClick={() => {
                        setSelectedVocabularyWordId(null);
                        resetVocabularyView();
                      }}
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
                          locked={theme.isUnlocked === false}
                          onClick={() => void handleVocabularyThemeOpen(theme)}
                        />
                      );
                    })}
                  </div>
                )}

                {!selectedTheme && (loadingInterestPreviews || filteredInterestThemes.length > 0) && (
                  <div className="mt-8">
                    <SectionHeader
                      title="Subtemas de tus intereses"
                      subtitle={`${filteredInterestSubthemes.length} disponibles`}
                    />

                    {loadingInterestPreviews ? (
                      <LibraryCardsSkeletonGrid variant="vocabulary" />
                    ) : (
                      <div className="space-y-8">
                        {filteredInterestThemes.map((theme) => {
                          const themeSubthemes = interestSubthemesByThemeId.get(theme.id) ?? [];

                          if (themeSubthemes.length === 0) {
                            return null;
                          }

                          return (
                            <div key={`interest-group-${theme.id}`}>
                              <SectionHeader
                                title={theme.meaning}
                                subtitle={`${themeSubthemes.length} subtemas`}
                              />
                              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                                {themeSubthemes.map((subtheme, i) => {
                                  const card = subthemeToCard(subtheme);

                                  return (
                                    <VocabularyCard
                                      key={`interest-subtheme-${subtheme.id}`}
                                      id={subtheme.id}
                                      title={card.title}
                                      subtitle={card.subtitle}
                                      thumbnail={card.thumbnail}
                                      variant="subtheme"
                                      index={i}
                                      isRecommended={subtheme.isRecommended === true}
                                      recommendationRank={subtheme.recommendationRank}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                            isRecommended={subtheme.isRecommended === true}
                            recommendationRank={subtheme.recommendationRank}
                            onClick={() => {
                              void handleVocabularySubthemeOpen(subtheme);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                {selectedSubtheme && filteredWords.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {filteredWords.map((word, i) => {
                      const card = wordToCard(word);
                      const isLocked = vocabularyWordLockStateById.get(word.id) ?? false;

                      return (
                        <VocabularyCard
                          key={word.id}
                          id={word.id}
                          title={card.title}
                          subtitle={card.subtitle}
                          thumbnail={card.thumbnail}
                          variant="word"
                          index={i}
                          isFavorite={favoriteWords.has(word.id)}
                          locked={!hasKanaContentAccess || isLocked}
                          unlocking={newlyUnlockedVocabularyWordIds.has(word.id)}
                          onFavoriteToggle={
                            !hasKanaContentAccess || isLocked
                              ? undefined
                              : (id) => {
                                  void toggleFavorite(id, "word");
                                }
                          }
                          onClick={() => handleVocabularyWordOpen(word)}
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
              disabled={shouldDisableLibraryEntranceAnimations}
              mode={heavyAnimationsEnabled ? "default" : "light"}
            >
              <LibraryCategorySection
                title="Reciente"
                countLabel={`${recentItems.length} elementos`}
                loading={loadingRecentItems}
                skeletonVariant="script"
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
                            unlockReady={
                              isLocked &&
                              canUnlockNext &&
                              nextUnlockCandidateId === kanji.id
                            }
                            unlockPending={unlockPendingKanjiId === kanji.id}
                            unlocking={newlyUnlockedKanjiIds.has(kanji.id)}
                            currentPoints={userPoints}
                            onClick={() => handleLibraryKanjiSelect(kanji)}
                            onPressUnlock={handlePressUnlockKanji}
                            onFavoriteToggle={
                              isLocked ? undefined : toggleFavoriteKanji
                            }
                          />
                        );
                      }

                      if (r.type === "grammar_lesson" || r.type === "grammar") {
                        const recentLesson: GrammarBoardProgress = {
                          id: r.id,
                          index: i,
                          symbol: "文",
                          title: r.title || "Gramática",
                          pointsToUnlock: 0,
                          status: "available",
                          isMock: false,
                          unlocked: true,
                          canUnlock: false,
                        };

                        return (
                          <GrammarLibraryCard
                            key={r.id}
                            lesson={recentLesson}
                            index={i}
                            isFavorite={favoriteGrammar.has(r.id)}
                            onSelect={handleGrammarOverlayOpen}
                            onToggleFavorite={(id) => {
                              void toggleFavorite(id, "grammar");
                            }}
                          />
                        );
                      }

                      if (r.type === "hiragana" || r.type === "katakana") {
                        const kanaCollection = r.type === "hiragana" ? hiraganas : katakanas;
                        const kana = kanaCollection.find((entry) => entry.id === r.id) ?? {
                          id: r.id,
                          symbol: r.symbol ?? (r.type === "hiragana" ? "あ" : "ア"),
                          kanaType: r.type,
                          romaji: r.romaji ?? undefined,
                          pointsToUnlock: 0,
                        };
                        const isLocked =
                          r.type === "hiragana"
                            ? lockedHiraganaIds.has(kana.id)
                            : lockedKatakanaIds.has(kana.id);

                        return (
                          <ScriptCard
                            key={r.id}
                            {...(r.type === "hiragana"
                              ? hiraganaToScriptCard(kana)
                              : katakanaToScriptCard(kana))}
                            index={i}
                            locked={isLocked}
                            unlocking={newlyUnlockedKanaIds.has(kana.id)}
                            onClick={isLocked ? undefined : () => handleKanaClick(kana)}
                          />
                        );
                      }

                      if (r.type === "word") {
                        const resolvedWord =
                          vocabularyWordIndex.get(r.id) ?? backendWordToWord(r);
                        const card = recentWordToCard({
                          ...r,
                          icon: resolvedWord.icon ?? r.icon ?? null,
                          kanjiWord: resolvedWord.kanji ?? r.kanjiWord ?? null,
                          hiragana: resolvedWord.hiragana ?? r.hiragana ?? null,
                          meanings: resolvedWord.meanings ?? r.meanings ?? null,
                        });

                        return (
                          <VocabularyCard
                            key={r.id}
                            id={r.id}
                            title={card.title}
                            subtitle={card.subtitle}
                            thumbnail={card.thumbnail}
                            variant="word"
                            index={i}
                            locked={!hasKanaContentAccess}
                            isFavorite={favoriteWords.has(r.id)}
                            onClick={
                              hasKanaContentAccess
                                ? () => {
                                    void handleLibraryWordOpenById(r.id);
                                  }
                                : undefined
                            }
                            onFavoriteToggle={
                              hasKanaContentAccess
                                ? (id) => {
                                    void toggleFavorite(id, "word");
                                  }
                                : undefined
                            }
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

          <VocabularyNodePanel
            item={selectedSubthemeItem}
            question={selectedVocabularyQuestion}
            loading={
              selectedVocabularyWordId !== null &&
              (loadingThemes ||
                loadingSubthemes ||
                loadingWords ||
                !selectedSubthemeItem ||
                !selectedVocabularyQuestion)
            }
            onClose={() => {
              setSelectedVocabularyWordId(null);
            }}
            onSaved={handleVocabularyQuizSaved}
          />

          {selectedGrammarLessonId !== null && grammarOverlayStage === "lesson" && (
            <GrammarLessonModal
              lesson={selectedGrammarLesson}
              status={selectedGrammarLessonStatus}
              error={selectedGrammarLessonError}
              onClose={handleGrammarOverlayClose}
              onRetry={() => {
                void refetchSelectedGrammarLesson();
              }}
              onStartExam={() => setGrammarOverlayStage("quiz")}
            />
          )}

          {selectedGrammarLessonId !== null &&
            grammarOverlayStage === "quiz" &&
            selectedGrammarLessonStatus === "success" &&
            selectedGrammarLesson && (
              <GrammarQuizModal
                lesson={selectedGrammarLesson}
                onClose={() => setGrammarOverlayStage("lesson")}
                onExitToBoard={handleGrammarOverlayClose}
                onComplete={handleGrammarQuizComplete}
              />
            )}

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

          <GraphGateModal
            open={showKanaRequirementModal}
            variant="kana-required"
            blockedContentLabel={kanaRequirementContentLabel}
            onClose={() => setShowKanaRequirementModal(false)}
            onOpenHiragana={() => {
              setShowKanaRequirementModal(false);
              router.push("/dashboard/graph/writing?tab=hiragana");
            }}
            onOpenKatakana={() => {
              setShowKanaRequirementModal(false);
              router.push("/dashboard/graph/writing?tab=katakana");
            }}
          />
          <PremiumThemeGateModal
            open={showPremiumThemeModal}
            blockedThemeLabel={premiumThemeLabel}
            onClose={() => setShowPremiumThemeModal(false)}
            onOpenUpgrade={() => {
              setShowPremiumThemeModal(false);
              router.push("/checkout?returnTo=%2Fdashboard%2Flibrary%3Fcategory%3Dthemes");
            }}
            onOpenPlans={() => {
              setShowPremiumThemeModal(false);
              router.push("/auth/membership?from=dashboard&returnTo=%2Fdashboard%2Flibrary%3Fcategory%3Dthemes");
            }}
          />
        </div>
      )}
    </DashboardShell>
  );
}
