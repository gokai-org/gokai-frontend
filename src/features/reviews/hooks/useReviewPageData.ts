import { useCallback, useEffect, useMemo, useState } from "react";

import type { GrammarLesson } from "@/features/graph/grammar";
import { getGrammarLesson } from "@/features/graph/grammar";
import type {
  VocabularyAnswerType,
  VocabularyGraphProgressItem,
  VocabularyWordLesson,
  VocabularyQuizSaveContext,
} from "@/features/graph/vocabulary";

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
  isKanjiReviewExerciseType,
  isVocabularyReviewExerciseType,
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

      if (recommendationsResult.status === "fulfilled") {
        setRecommendations(
          buildReviewItems(recommendationsResult.value.recommendations ?? []),
        );
      } else {
        setRecommendations([]);
        setError(
          recommendationsResult.reason?.message ?? "Error al cargar repasos",
        );
      }

      if (statsResult.status === "fulfilled") {
        setReviewStats(statsResult.value);
      }

      if (recentActivityResult.status === "fulfilled") {
        setRecentActivity(recentActivityResult.value.activities ?? []);
      }

      if (streakResult.status === "fulfilled") {
        setReviewStreak(streakResult.value);
      }

      if (showLoader) {
        setLoading(false);
      }
    },
    [],
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
    await fetchPageData({ syncStrategies: true });
  }, [fetchPageData]);

  const handleStartReview = useCallback(
    async (itemId: string) => {
      const found = recommendations.find((item) => item.id === itemId);
      if (!found) return;

      setStartingReviewId(itemId);

      try {
        if (found.lessonType === "kanji") {
          setActiveKanjiReview({
            entityId: found.entityId,
            quizType: isKanjiReviewExerciseType(found.exerciseType)
              ? found.exerciseType
              : undefined,
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
        const availableTypes = (found.availableExerciseTypes ?? []).filter(
          isVocabularyReviewExerciseType,
        );
        const initialType = availableTypes[0]
          ?? (isVocabularyReviewExerciseType(found.exerciseType) ? found.exerciseType : null);

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
    async (_context: VocabularyQuizSaveContext) => {
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
    handleVocabularyQuizSaved,
    handleStartReview,
  };
}
