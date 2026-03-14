"use client";

import { motion } from "framer-motion";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { WritingPracticeModal } from "@/features/kanji/components/WritingPracticeModal";

import {
  ReviewHeader,
  ReviewBanner,
  ReviewPendingSection,
  ReviewCTA,
  useReviewPageData,
} from "@/features/reviews";

/* ── Animation variants ────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

/* ── Page ─────────────────────────────────────────────── */

export default function Page() {
  const {
    loading,
    error,
    reviewItems,
    reviewStats,
    practiceKanji,
    setPracticeKanji,
    handleStartReview,
  } = useReviewPageData();

  return (
    <DashboardShell
      header={<ReviewHeader pendingCount={reviewItems.length} />}
    >
      {practiceKanji && (
        <WritingPracticeModal
          kanji={practiceKanji}
          onClose={() => setPracticeKanji(null)}
        />
      )}

      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <ReviewBanner pendingCount={reviewItems.length} />
      </motion.div>

      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <ReviewPendingSection
          loading={loading}
          error={error}
          items={reviewItems}
          onStart={handleStartReview}
        />
      </motion.div>

      <motion.div
        custom={3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <ReviewCTA />
      </motion.div>
    </DashboardShell>
  );
}
