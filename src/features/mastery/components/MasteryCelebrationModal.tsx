"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CelebrationModalContent, CelebrationPhase } from "../types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MasteryCelebrationModalProps {
  phase: CelebrationPhase;
  content: CelebrationModalContent | null;
  onDismiss: () => void;
}

interface VisibleMasteryCelebrationModalProps {
  content: CelebrationModalContent;
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.85, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 22,
      stiffness: 260,
      mass: 0.9,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const BADGE_VARIANTS = {
  hidden: { opacity: 0, scale: 0, rotate: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      damping: 14,
      stiffness: 200,
      delay: 0.3,
    },
  },
};

const TEXT_STAGGER = {
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.45 },
  },
};

const TEXT_CHILD = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const BUTTON_VARIANTS = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.9, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ---------------------------------------------------------------------------
// Emoji badge per module
// ---------------------------------------------------------------------------

const MODULE_EMOJI: Record<string, string> = {
  hiragana: "\u3042", // あ
  katakana: "\u30A2", // ア
  kanji: "\u5B57",   // 字
};

function VisibleMasteryCelebrationModal({
  content,
  onDismiss,
}: VisibleMasteryCelebrationModalProps) {
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanDismiss(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (canDismiss) onDismiss();
  };

  return (
    <motion.div
      key="mastery-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      variants={BACKDROP_VARIANTS}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.4 }}
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 45%, rgba(212,168,67,0.10) 0%, rgba(0,0,0,0.65) 100%)",
          backdropFilter: "blur(8px) saturate(1.2)",
          WebkitBackdropFilter: "blur(8px) saturate(1.2)",
        }}
      />

      <motion.div
        className="mastery-celebration-card"
        variants={CARD_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mastery-celebration-halo" />

        <motion.div
          className="mastery-celebration-badge"
          variants={BADGE_VARIANTS}
          initial="hidden"
          animate="visible"
        >
          <span className="mastery-celebration-badge-char" lang="ja">
            {MODULE_EMOJI[content.moduleId] ?? "\u2605"}
          </span>
        </motion.div>

        <motion.div
          className="mastery-celebration-text"
          variants={TEXT_STAGGER}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="mastery-celebration-achievement"
            variants={TEXT_CHILD}
          >
            {content.achievementLabel}
          </motion.p>

          <motion.h2
            className="mastery-celebration-title"
            variants={TEXT_CHILD}
          >
            {content.title}
          </motion.h2>

          <motion.p
            className="mastery-celebration-subtitle"
            variants={TEXT_CHILD}
          >
            {content.subtitle}
          </motion.p>
        </motion.div>

        <motion.button
          className="mastery-celebration-button"
          variants={BUTTON_VARIANTS}
          initial="hidden"
          animate="visible"
          onClick={handleDismiss}
          disabled={!canDismiss}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Continuar
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MasteryCelebrationModal = memo(function MasteryCelebrationModal({
  phase,
  content,
  onDismiss,
}: MasteryCelebrationModalProps) {
  const isVisible = phase === "modal";

  return (
    <AnimatePresence>
      {isVisible && content && (
        <VisibleMasteryCelebrationModal
          content={content}
          onDismiss={onDismiss}
        />
      )}
    </AnimatePresence>
  );
});
