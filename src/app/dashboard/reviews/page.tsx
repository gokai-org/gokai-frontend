"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ContextualHelpButton } from "@/features/help/components/ContextualHelpButton";
import { getTourById } from "@/features/help/components/tourData";
import GrammarQuizModal from "@/features/graph/grammar/components/lesson/exam/GrammarQuizModal";
import { VocabularyQuizModal } from "@/features/graph/vocabulary";
import { KanjiQuizModal } from "@/features/kanji/components/quiz/KanjiQuizModal";
import {
  ReviewActiveHeader,
  ReviewCategories,
  ReviewHero,
  ReviewList,
  useReviewProgress,
  useReviewPageData,
} from "@/features/reviews";
import {
  KAZU_ALERT_REVIEW_LIMIT,
  KAZU_LIGHT_REVIEW_LIMIT,
} from "@/features/reviews/hooks/useReviewProgress";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { SkeletonBox, SkeletonLine } from "@/shared/ui/Skeleton";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";

type ReviewCelebrationState = {
  lessonLabel: string;
  title: string;
  message: string;
};

function getKazuColorStage(activeCount: number) {
  if (activeCount <= KAZU_LIGHT_REVIEW_LIMIT) {
    return 2;
  }

  if (activeCount <= KAZU_ALERT_REVIEW_LIMIT) {
    return 1;
  }

  return 0;
}

function didKazuColorImprove(previousActiveCount: number, nextActiveCount: number) {
  if (nextActiveCount >= previousActiveCount) {
    return false;
  }

  return getKazuColorStage(nextActiveCount) > getKazuColorStage(previousActiveCount);
}

function buildReviewCelebrationState(
  lessonLabel: string,
  kazuRecoveredColor: boolean,
): ReviewCelebrationState {
  return {
    lessonLabel,
    title: "Felicidades por repasar",
    message: kazuRecoveredColor
      ? "KAZU recuperó color gracias a ti. Cada repaso lo mantiene vivo y empuja tu progreso hacia adelante."
      : "KAZU sigue con color gracias a ti. Cada repaso refuerza lo que ya construiste y mantiene viva tu constancia.",
  };
}

function ReviewPageSkeleton() {
  return (
    <div className="grid gap-6 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(420px,0.96fr)_minmax(0,1.04fr)] xl:items-start">
      <div className="space-y-5 xl:h-full xl:min-h-0">
        <div className="rounded-[32px] border border-border-subtle bg-surface-primary p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="flex justify-end lg:hidden">
            <SkeletonBox className="h-20 w-24 bg-surface-tertiary" rounded="rounded-[22px]" />
          </div>
          <SkeletonLine width="w-28" height="h-10" />
          <SkeletonLine width="w-40" height="h-4" className="mt-3" />
          <SkeletonLine width="w-3/4" height="h-3.5" className="mt-3" />
          <div className="mt-4 flex gap-2">
            <SkeletonBox className="h-7 w-24 bg-surface-tertiary" rounded="rounded-full" />
            <SkeletonBox className="h-7 w-24 bg-surface-tertiary" rounded="rounded-full" />
            <SkeletonBox className="h-7 w-28 bg-surface-tertiary" rounded="rounded-full" />
          </div>
          <SkeletonBox className="mt-6 h-[360px] w-full bg-surface-tertiary" rounded="rounded-[28px]" />
          <div className="mt-4 rounded-[24px] border border-border-subtle bg-surface-secondary p-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SkeletonLine width="w-14" height="h-3" className="bg-surface-tertiary" />
                <SkeletonLine width="w-20" height="h-8" className="mt-2" />
              </div>
              <SkeletonBox className="h-12 w-16 bg-surface-tertiary" rounded="rounded-2xl" />
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonBox
                  key={`compact-streak-${index}`}
                  className="mx-auto h-8 w-8 bg-surface-tertiary"
                  rounded="rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden rounded-[28px] border border-border-subtle bg-surface-primary p-5 shadow-sm lg:block">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(240px,1fr)] lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-4 w-4 bg-surface-tertiary" rounded="rounded-full" />
                <SkeletonLine width="w-24" height="h-3" className="bg-surface-tertiary" />
              </div>
              <SkeletonLine width="w-28" height="h-12" className="mt-4" />
              <SkeletonLine width="w-3/4" height="h-3.5" className="mt-3 bg-surface-tertiary" />
              <div className="mt-4 flex gap-2">
                <SkeletonBox className="h-8 w-24 bg-surface-tertiary" rounded="rounded-full" />
                <SkeletonBox className="h-8 w-24 bg-surface-tertiary" rounded="rounded-full" />
              </div>
            </div>

            <div className="rounded-[24px] border border-border-subtle bg-surface-secondary p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <SkeletonLine width="w-20" height="h-3" className="bg-surface-tertiary" />
                  <SkeletonLine width="w-32" height="h-3" className="mt-2 bg-surface-tertiary" />
                </div>
                <SkeletonBox className="h-12 w-20 bg-surface-tertiary" rounded="rounded-2xl" />
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <SkeletonBox
                    key={index}
                    className="mx-auto h-10 w-10 bg-surface-tertiary"
                    rounded="rounded-2xl"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:px-2 xl:pb-12 xl:pt-1">
        <div className="hidden rounded-[32px] bg-surface-primary p-6 shadow-sm sm:p-8 lg:block lg:p-10">
          <SkeletonLine width="w-28" height="h-3" className="bg-surface-tertiary" />
          <SkeletonLine width="w-2/3" height="h-8" className="mt-3" />
          <SkeletonLine width="w-4/5" height="h-4" className="mt-3 bg-surface-tertiary" />
          <div className="mt-6 flex justify-end">
            <SkeletonBox className="h-20 w-32 bg-surface-tertiary" rounded="rounded-[24px]" />
          </div>
        </div>

        <div>
          <SkeletonLine width="w-24" height="h-3" className="mb-2 bg-surface-tertiary" />
          <SkeletonLine width="w-40" height="h-6" className="mb-4" />
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border-subtle bg-surface-primary p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <SkeletonBox className="h-9 w-9 bg-surface-tertiary" rounded="rounded-xl" />
                    <div>
                      <SkeletonLine width="w-14" height="h-3" />
                      <SkeletonLine width="w-10" height="h-2.5" className="mt-2 bg-surface-tertiary" />
                    </div>
                  </div>
                  <SkeletonBox className="h-5 w-8 bg-surface-tertiary" rounded="rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pb-8">
          <SkeletonLine width="w-28" height="h-3" className="bg-surface-tertiary" />
          <SkeletonLine width="w-48" height="h-6" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm"
            >
              <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="h-12 w-12 bg-surface-tertiary sm:h-14 sm:w-14" rounded="rounded-2xl" />
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <SkeletonBox className="h-5 w-20 bg-surface-tertiary" rounded="rounded-full" />
                    <SkeletonBox className="h-5 w-16 bg-surface-tertiary" rounded="rounded-full" />
                  </div>
                  <SkeletonLine width="w-2/3" height="h-4" />
                  <SkeletonLine width="w-3/4" height="h-3" className="bg-surface-tertiary" />
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <SkeletonBox className="h-10 w-10 bg-surface-tertiary" rounded="rounded-full" />
                  <SkeletonBox className="h-10 w-28 bg-surface-tertiary" rounded="rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const {
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
    prepareReviewRefresh,
    applyPreparedReviewRefresh,
    handleStartReview,
  } = useReviewPageData();
  const [reviewCelebration, setReviewCelebration] = useState<ReviewCelebrationState | null>(null);

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const mascotReducedMotion = !animationsEnabled || !heavyAnimationsEnabled;
  const reviewActive = Boolean(
    activeKanjiReview || activeGrammarLesson || activeVocabularyReview,
  );
  const firstStartableReview = reviewItems[0] ?? null;
  const reviewProgress = useReviewProgress({
    items: reviewItems,
    reviewStats,
    recentActivity,
    loading,
    reviewActive,
    currentStreakDays: reviewStreak?.currentStreak?.days ?? null,
  });
  const handleStartSession = useCallback(() => {
    if (!firstStartableReview) return;
    handleStartReview(firstStartableReview.id);
  }, [firstStartableReview, handleStartReview]);

  const handleReviewResolution = useCallback(
    async ({
      closeReview,
      lessonLabel,
    }: {
      closeReview: () => void;
      lessonLabel: string;
    }) => {
      const previousActiveCount = reviewProgress.activeCount;
      const snapshot = await prepareReviewRefresh();
      const nextActiveCount = snapshot.recommendations.length;
      const kazuRecoveredColor = didKazuColorImprove(
        previousActiveCount,
        nextActiveCount,
      );

      closeReview();

      applyPreparedReviewRefresh(snapshot);
      setReviewCelebration(
        buildReviewCelebrationState(lessonLabel, kazuRecoveredColor),
      );

      return kazuRecoveredColor;
    },
    [applyPreparedReviewRefresh, prepareReviewRefresh, reviewProgress.activeCount],
  );

  const handleKanjiReviewComplete = useCallback(async () => {
    await handleReviewResolution({
      closeReview: () => setActiveKanjiReview(null),
      lessonLabel: "Kanji",
    });
  }, [handleReviewResolution, setActiveKanjiReview]);

  const handleGrammarReviewComplete = useCallback(async () => {
    await handleReviewResolution({
      closeReview: () => setActiveGrammarLesson(null),
      lessonLabel: "Gramática",
    });
  }, [handleReviewResolution, setActiveGrammarLesson]);

  const handleVocabularyReviewComplete = useCallback(async () => {
    await handleReviewResolution({
      closeReview: () => setActiveVocabularyReview(null),
      lessonLabel: "Vocabulario",
    });
  }, [handleReviewResolution, setActiveVocabularyReview]);

  const reviewCelebrationOverlay = reviewCelebration && typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[280] overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setReviewCelebration(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Repaso completado"
              className="relative w-full max-w-xl overflow-hidden rounded-[32px] bg-surface-primary shadow-2xl ring-1 ring-border-subtle"
            >
              <div className="border-b border-border-subtle bg-gradient-to-r from-accent to-accent-hover px-5 py-5 text-content-inverted sm:px-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/70">
                  Repaso completado
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                  {reviewCelebration.title}
                </h2>
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
                  {reviewCelebration.lessonLabel}
                </span>
                <p className="mt-4 text-lg font-bold leading-tight text-content-primary">
                  Kazu sigue contigo gracias a este repaso.
                </p>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-content-tertiary sm:text-base">
                  {reviewCelebration.message}
                </p>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setReviewCelebration(null)}
                    className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-3 text-sm font-extrabold text-content-inverted shadow-sm transition-colors hover:bg-accent-hover"
                  >
                    Seguir repasando
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  const buildHelpTour = useCallback(
    () =>
      getTourById("review-system") ?? {
        id: "review-system-fallback",
        title: "Sistema de repasos",
        route: "/dashboard/reviews",
        steps: [],
      },
    [],
  );

  if (loading) {
    return (
      <DashboardShell
        contentClassName="xl:overflow-hidden"
        containerClassName="xl:h-full xl:overflow-hidden"
      >
        <ReviewPageSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      contentClassName="xl:overflow-hidden"
      containerClassName="xl:h-full xl:overflow-hidden"
    >
      {reviewCelebrationOverlay}

      {activeKanjiReview && (
        <KanjiQuizModal
          kanjiId={activeKanjiReview.entityId}
          quizType={activeKanjiReview.quizType}
          currentModulePoints={0}
          progressEligible
          persistProgressOnSpecificQuiz
          onComplete={() => {
            void handleKanjiReviewComplete();
          }}
          onClose={() => setActiveKanjiReview(null)}
        />
      )}

      {activeGrammarLesson && (
        <GrammarQuizModal
          lesson={activeGrammarLesson}
          onComplete={() => {
            void handleGrammarReviewComplete();
          }}
          onClose={() => setActiveGrammarLesson(null)}
        />
      )}

      {activeVocabularyReview && (
        <VocabularyQuizModal
          open
          item={activeVocabularyReview.item}
          question={activeVocabularyReview.question}
          initialType={activeVocabularyReview.initialType}
          availableTypes={activeVocabularyReview.availableTypes}
          onComplete={() => {
            void handleVocabularyReviewComplete();
          }}
          onSaved={async () => undefined}
          onClose={() => setActiveVocabularyReview(null)}
        />
      )}

      <div
        data-help-surface="reviews-page"
        className="grid gap-6 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(420px,0.96fr)_minmax(0,1.04fr)] xl:items-start"
      >
        <AnimatedEntrance
          index={0}
          className="xl:h-full xl:min-h-0"
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div
            className="xl:sticky xl:top-0 xl:h-full xl:min-h-0"
            data-help-target="reviews-kazu-progress"
          >
            <ReviewHero
              zones={reviewProgress.zones}
              activeCount={reviewProgress.activeCount}
              currentStreak={reviewProgress.currentStreak}
              streakActive={reviewStreak?.currentStreak?.isActive ?? false}
              mascotState={reviewProgress.state}
              reducedMotion={mascotReducedMotion}
            />
          </div>
        </AnimatedEntrance>

        <div className="space-y-5 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:scroll-pb-12 xl:px-2 xl:pb-12 xl:pt-1">
          <AnimatedEntrance
            index={1}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <div data-help-target="reviews-banner" className="hidden lg:block">
              <ReviewActiveHeader
                activeCount={reviewProgress.activeCount}
                eyebrow={reviewProgress.eyebrow}
                title={reviewProgress.title}
                description={reviewProgress.description}
                loading={loading}
                canStartReview={Boolean(firstStartableReview)}
                onStartReview={handleStartSession}
              />
            </div>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <div data-help-target="reviews-summary-categories">
              <ReviewCategories
                categories={reviewProgress.categories}
                loading={loading}
              />
            </div>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={3}
            className="pb-8"
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <div data-help-target="reviews-pending">
              <ReviewList
                loading={loading}
                error={error}
                items={reviewItems}
                recommendedItemId={reviewProgress.recommendedItem?.id}
                startingItemId={startingReviewId}
                onStart={handleStartReview}
              />
            </div>
          </AnimatedEntrance>
        </div>
      </div>

      <ContextualHelpButton getTour={buildHelpTour} />
    </DashboardShell>
  );
}
