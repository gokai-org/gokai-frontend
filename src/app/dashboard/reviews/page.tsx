"use client";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { WritingPracticeModal } from "@/features/kanji/components/WritingPracticeModal";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";

import {
  ReviewBanner,
  ReviewPendingSection,
  ReviewCTA,
  useReviewPageData,
} from "@/features/reviews";

export default function Page() {
  const {
    loading,
    error,
    reviewItems,
    practiceKanji,
    setPracticeKanji,
    handleStartReview,
  } = useReviewPageData();

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  return (
    <DashboardShell>
      {practiceKanji && (
        <WritingPracticeModal
          kanji={practiceKanji}
          onClose={() => setPracticeKanji(null)}
        />
      )}

      <AnimatedEntrance
        index={0}
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="reviews-banner">
          <ReviewBanner
            pendingCount={reviewItems.length}
            animationsEnabled={animationsEnabled}
            heavyAnimationsEnabled={heavyAnimationsEnabled}
          />
        </div>
      </AnimatedEntrance>

      <AnimatedEntrance
        index={1}
        className="mb-8"
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="reviews-pending" data-help-loading={loading ? "true" : undefined}>
          <ReviewPendingSection
            loading={loading}
            error={error}
            items={reviewItems}
            onStart={handleStartReview}
          />
        </div>
      </AnimatedEntrance>

      <AnimatedEntrance
        index={2}
        disabled={!animationsEnabled}
        mode={heavyAnimationsEnabled ? "default" : "light"}
      >
        <div data-help-target="reviews-cta">
          <ReviewCTA />
        </div>
      </AnimatedEntrance>
    </DashboardShell>
  );
}
