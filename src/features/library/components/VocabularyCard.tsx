"use client";

import { motion } from "framer-motion";
import { useCardAnimation } from "@/features/library/hooks/useCardAnimation";
import {
  VARIANT_CONFIG,
  type VocabularyVariant,
} from "@/features/library/utils/vocabularyCardConfig";
import {
  GradientCardLayout,
  WordCardLayout,
} from "@/features/library/components/VocabularyLayouts";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface VocabularyCardProps {
  id: string;
  title: string;
  subtitle?: string;
  /** Japanese text (short/long) or an https:// icon URL */
  thumbnail: string;
  variant: VocabularyVariant;
  /** Position in a list */
  index?: number;
  onClick?: () => void;
}

// ─── VocabularyCard ───────────────────────────────────────────────────────────

export function VocabularyCard({
  title,
  subtitle,
  thumbnail,
  variant,
  index = 0,
  onClick,
}: VocabularyCardProps) {
  const { animationsEnabled, motionProps, hoverTransition, cardTransition } =
    useCardAnimation(index);
  const config = VARIANT_CONFIG[variant];
  const isWord = variant === "word";

  const cardClassName = isWord
    ? [
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] p-5 text-left",
        "min-h-[210px]",
        "bg-surface-primary border border-[#E8E3E1] dark:border-[#2a2a2a]",
        "shadow-[0_2px_14px_-6px_rgba(0,0,0,0.06)]",
        config.shadowHover,
        cardTransition,
        onClick
          ? `cursor-pointer hover:-translate-y-1 hover:border-transparent focus:outline-none focus-visible:ring-2 ${config.ring}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : [
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] p-5 text-left",
        "min-h-[190px]",
        "bg-surface-primary border border-[#E8E3E1] dark:border-[#2a2a2a]",
        "shadow-[0_2px_14px_-6px_rgba(0,0,0,0.06)]",
        config.shadowHover,
        cardTransition,
        onClick
          ? `cursor-pointer hover:-translate-y-1 hover:border-transparent focus:outline-none focus-visible:ring-2 ${config.ring}`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

  const content = isWord ? (
    <WordCardLayout
      title={title}
      subtitle={subtitle}
      thumbnail={thumbnail}
      hasOnClick={Boolean(onClick)}
      config={config}
      hoverTransition={hoverTransition}
    />
  ) : (
    <GradientCardLayout
      title={title}
      subtitle={subtitle}
      thumbnail={thumbnail}
      hasOnClick={Boolean(onClick)}
      config={config}
      hoverTransition={hoverTransition}
    />
  );

  const cardEl = onClick ? (
    <button type="button" onClick={onClick} className={cardClassName}>
      {content}
    </button>
  ) : (
    <div className={cardClassName}>{content}</div>
  );

  if (!animationsEnabled) {
    return <div className="h-full">{cardEl}</div>;
  }

  return (
    <motion.div className="h-full" {...motionProps}>
      {cardEl}
    </motion.div>
  );
}
