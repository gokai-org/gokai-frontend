"use client";

import { useCallback } from "react";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { WritingPracticeModal } from "@/features/kanji/components/WritingPracticeModal";
import {
  ReviewActiveHeader,
  ReviewCategories,
  ReviewHero,
  ReviewList,
  useReviewProgress,
  useReviewPageData,
} from "@/features/reviews";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";

export default function Page() {
  const {
    loading,
    error,
    reviewItems,
    reviewStats,
    recentActivity,
    practiceKanji,
    setPracticeKanji,
    handleStartReview,
  } = useReviewPageData();

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const mascotReducedMotion = !animationsEnabled || !heavyAnimationsEnabled;
  const reviewActive = Boolean(practiceKanji);
  const firstStartableReview = reviewItems.find((item) => item.type === "kanji");
  const reviewProgress = useReviewProgress({
    items: reviewItems,
    reviewStats,
    recentActivity,
    loading,
    reviewActive,
  });
  const handleStartSession = useCallback(() => {
    if (!firstStartableReview) return;
    handleStartReview(firstStartableReview.id);
  }, [firstStartableReview, handleStartReview]);

  return (
    <DashboardShell
      contentClassName="xl:overflow-hidden"
      containerClassName="xl:h-full xl:overflow-hidden"
    >
      {practiceKanji && (
        <WritingPracticeModal
          kanji={practiceKanji}
          onClose={() => setPracticeKanji(null)}
        />
      )}

      <div className="grid gap-6 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(420px,0.96fr)_minmax(0,1.04fr)] xl:items-start">
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
              constancyScore={reviewProgress.constancyScore}
              daysSinceLatestReview={reviewProgress.daysSinceLatestReview}
              mascotState={reviewProgress.state}
              loading={loading}
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
            <div data-help-target="reviews-banner">
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
            <div data-help-target="reviews-summary">
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
            <div
              data-help-target="reviews-pending"
              data-help-loading={loading ? "true" : undefined}
            >
              <ReviewList
                loading={loading}
                error={error}
                items={reviewItems}
                recommendedItemId={reviewProgress.recommendedItem?.id}
                onStart={handleStartReview}
              />
            </div>
          </AnimatedEntrance>
        </div>
      </div>
    </DashboardShell>
  );
}
