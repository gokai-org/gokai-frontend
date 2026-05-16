import { useCallback, useEffect, useMemo, useState } from "react";

import type { GrammarLesson } from "@/features/graph/grammar";
import { getGrammarLesson } from "@/features/graph/grammar";
import type {
  VocabularyAnswerType,
  VocabularyGraphProgressItem,
  VocabularyWordLesson,
  VocabularyQuizSaveContext,
  VocabularyQuizSaveResult,
} from "@/features/graph/vocabulary";
import { VOCABULARY_QUIZ_TYPES } from "@/features/graph/vocabulary/lib/vocabularyQuizProgress";

import {
  getStatsOverview,
  getStatsRecentActivity,
} from "@/features/stats/services/api";
import type {
  OverviewStatsResponse,
  RecentActivityEntry,
} from "@/features/stats/types";

import {
  getUserReviewStreak,
  listReviewRecommendations,
  syncReviewRecommendationStrategies,
} from "../services/reviewApi";
import type { ReviewItem, ReviewStreakResponse } from "../types";
import {
  buildReviewItems,
  buildVocabularyReviewGraphItem,
  buildVocabularyReviewQuestion,
} from "../utils/reviewMappers";

type ActiveKanjiReview = {
  entityId: string;
  quizType?: "kanji" | "meaning" | "reading" | "writing";
};

type ActiveVocabularyReview = {
  item: VocabularyGraphProgressItem;
  question: VocabularyWordLesson;
  initialType: VocabularyAnswerType;
  availableTypes: VocabularyAnswerType[];
};

type ReviewPageDataSnapshot = {
  recommendations: ReviewItem[];
  reviewStats: OverviewStatsResponse | null;
  recentActivity: RecentActivityEntry[];
  reviewStreak: ReviewStreakResponse | null;
  error: string | null;
};

export function useReviewPageData() {
  const [recommendations, setRecommendations] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState<OverviewStatsResponse | null>(
    null,
  );
  const [recentActivity, setRecentActivity] = useState<RecentActivityEntry[]>(
    [],
  );
  const [reviewStreak, setReviewStreak] = useState<ReviewStreakResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingReviewId, setStartingReviewId] = useState<string | null>(null);
  const [activeKanjiReview, setActiveKanjiReview] = useState<ActiveKanjiReview | null>(null);
  const [activeGrammarLesson, setActiveGrammarLesson] = useState<GrammarLesson | null>(null);
  const [activeVocabularyReview, setActiveVocabularyReview] = useState<ActiveVocabularyReview | null>(null);

  const applyPageSnapshot = useCallback((snapshot: ReviewPageDataSnapshot) => {
    setRecommendations(snapshot.recommendations);
    setReviewStats(snapshot.reviewStats);
    setRecentActivity(snapshot.recentActivity);
    setReviewStreak(snapshot.reviewStreak);
    setError(snapshot.error);
  }, []);

  const requestPageSnapshot = useCallback(
    async ({
      syncStrategies = false,
    }: {
      syncStrategies?: boolean;
    } = {}): Promise<ReviewPageDataSnapshot> => {
      if (syncStrategies) {
        await syncReviewRecommendationStrategies().catch(() => null);
      }

      const [recommendationsResult, statsResult, recentActivityResult, streakResult] =
        await Promise.allSettled([
          listReviewRecommendations(),
          getStatsOverview(),
          getStatsRecentActivity(),
          getUserReviewStreak(),
        ]);

      const snapshot: ReviewPageDataSnapshot = {
        recommendations: [],
        reviewStats: null,
        recentActivity: [],
        reviewStreak: null,
        error: null,
      };

      if (recommendationsResult.status === "fulfilled") {
        snapshot.recommendations = buildReviewItems(
          recommendationsResult.value.recommendations ?? [],
        );
      } else {
        snapshot.error =
          recommendationsResult.reason?.message ?? "Error al cargar repasos";
      }

      if (statsResult.status === "fulfilled") {
        snapshot.reviewStats = statsResult.value;
      }

      if (recentActivityResult.status === "fulfilled") {
        snapshot.recentActivity = recentActivityResult.value.activities ?? [];
      }

      if (streakResult.status === "fulfilled") {
        snapshot.reviewStreak = streakResult.value;
      }

      return snapshot;
    },
    [],
  );

  const fetchPageData = useCallback(
    async ({
      showLoader,
      syncStrategies = false,
    }: {
      showLoader?: boolean;
      syncStrategies?: boolean;
    } = {}) => {
      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      const snapshot = await requestPageSnapshot({ syncStrategies });
      applyPageSnapshot(snapshot);

      if (showLoader) {
        setLoading(false);
      }

      return snapshot;
    },
    [applyPageSnapshot, requestPageSnapshot],
  );

  useEffect(() => {
    let cancelled = false;

    void fetchPageData({ showLoader: true, syncStrategies: true }).then(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchPageData]);

  const reviewItems = useMemo<ReviewItem[]>(() => recommendations, [recommendations]);

  const refreshAfterReview = useCallback(async () => {
    return fetchPageData({ syncStrategies: true });
  }, [fetchPageData]);

  const prepareReviewRefresh = useCallback(async () => {
    return requestPageSnapshot({ syncStrategies: true });
  }, [requestPageSnapshot]);

  const applyPreparedReviewRefresh = useCallback(
    (snapshot: ReviewPageDataSnapshot) => {
      applyPageSnapshot(snapshot);
    },
    [applyPageSnapshot],
  );

  const handleStartReview = useCallback(
    async (itemId: string) => {
      const found = recommendations.find((item) => item.id === itemId);
      if (!found) return;

      setStartingReviewId(itemId);

      try {
        if (found.lessonType === "kanji") {
          setActiveKanjiReview({
            entityId: found.entityId,
          });
          return;
        }

        if (found.lessonType === "grammar") {
          const lesson = await getGrammarLesson(found.entityId);
          setActiveGrammarLesson(lesson);
          return;
        }

        const vocabularyItem = buildVocabularyReviewGraphItem(found);
        const vocabularyQuestion = buildVocabularyReviewQuestion(found);
        const availableTypes = [...VOCABULARY_QUIZ_TYPES];
        const initialType = availableTypes[0] ?? null;

        if (
          !vocabularyItem ||
          !vocabularyQuestion ||
          !initialType
        ) {
          throw new Error("La recomendación no tiene un ejercicio de vocabulario válido.");
        }

        setActiveVocabularyReview({
          item: vocabularyItem,
          question: vocabularyQuestion,
          initialType,
          availableTypes,
        });
      } catch (startError) {
        setError(
          startError instanceof Error
            ? startError.message
            : "No se pudo abrir el repaso recomendado.",
        );
      } finally {
        setStartingReviewId(null);
      }
    },
    [recommendations],
  );

  const handleVocabularyQuizSaved = useCallback(
    async (_context: VocabularyQuizSaveContext): Promise<VocabularyQuizSaveResult | void> => {
      await refreshAfterReview();
    },
    [refreshAfterReview],
  );

  return {
    loading,
    error,
    reviewItems,
    reviewStats,
    recentActivity,
    reviewStreak,
    startingReviewId,
    activeKanjiReview,
    setActiveKanjiReview,
    activeGrammarLesson,
    setActiveGrammarLesson,
    activeVocabularyReview,
    setActiveVocabularyReview,
    refreshAfterReview,
    prepareReviewRefresh,
    applyPreparedReviewRefresh,
    handleVocabularyQuizSaved,
    handleStartReview,
  };
}
