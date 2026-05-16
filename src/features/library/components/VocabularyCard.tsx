"use client";

import { motion } from "framer-motion";
import { HeartIcon } from "@/features/library/components/ScriptCardLayout";
import { VocabThumbnail } from "@/features/library/components/VocabThumbnail";
import { useCardAnimation } from "@/features/library/hooks/useCardAnimation";
import {
  VARIANT_CONFIG,
  type VocabularyVariant,
} from "@/features/library/utils/vocabularyCardConfig";
import {
  GradientCardLayout,
  WordCardLayout,
} from "@/features/library/components/VocabularyLayouts";
import { LockedStateBadge } from "@/shared/ui/LockedStateIndicator";

const VOCABULARY_FAVORITE_STYLES = {
  theme: {
    heartColor: "text-[#993331]",
    heartBg: "border-[#993331]/20 bg-[#993331]/10",
  },
  subtheme: {
    heartColor: "text-[#A63B38]",
    heartBg: "border-[#A63B38]/20 bg-[#A63B38]/10",
  },
  word: {
    heartColor: "text-[#B84C45]",
    heartBg: "border-[#B84C45]/20 bg-[#B84C45]/10",
  },
} as const;

const TOP_RECOMMENDATION_STYLES = {
  1: {
    borderClass: "border-[#D4A843]/75",
    innerBorderClass: "border-[#D4A843]/45",
    glowClass: "bg-[#D4A843]/18",
    badgeClass: "border-[#D4A843]/35 bg-[#D4A843]/14 text-[#9B7B2F]",
    label: "TOP 1",
  },
  2: {
    borderClass: "border-[#C97A4A]/75",
    innerBorderClass: "border-[#C97A4A]/42",
    glowClass: "bg-[#C97A4A]/16",
    badgeClass: "border-[#C97A4A]/35 bg-[#C97A4A]/14 text-[#A55D31]",
    label: "TOP 2",
  },
  3: {
    borderClass: "border-[#BA5149]/72",
    innerBorderClass: "border-[#BA5149]/40",
    glowClass: "bg-[#BA5149]/15",
    badgeClass: "border-[#BA5149]/35 bg-[#BA5149]/14 text-[#8E3C35]",
    label: "TOP 3",
  },
} as const;

function isUrlThumbnail(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

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
  isFavorite?: boolean;
  locked?: boolean;
  unlocking?: boolean;
  isRecommended?: boolean;
  recommendationRank?: number;
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
}

// ─── VocabularyCard ───────────────────────────────────────────────────────────

export function VocabularyCard({
  id,
  title,
  subtitle,
  thumbnail,
  variant,
  index = 0,
  isFavorite = false,
  locked = false,
  unlocking = false,
  isRecommended = false,
  recommendationRank,
  onClick,
  onFavoriteToggle,
}: VocabularyCardProps) {
  const { animationsEnabled, motionProps, hoverTransition, cardTransition } =
    useCardAnimation(index);
  const config = VARIANT_CONFIG[variant];
  const isWord = variant === "word";
  const effectiveLocked = locked && !unlocking;
  const isInteractive = Boolean(onClick) && !effectiveLocked;
  const hoverEnabled =
    (Boolean(onClick) || Boolean(onFavoriteToggle)) && !effectiveLocked;
  const favoriteStyle = VOCABULARY_FAVORITE_STYLES[variant];
  const highlightedRecommendationTier =
    variant === "subtheme" &&
    isRecommended &&
    typeof recommendationRank === "number" &&
    recommendationRank >= 1 &&
    recommendationRank <= 3
      ? recommendationRank
      : null;
  const recommendationStyle = highlightedRecommendationTier
    ? TOP_RECOMMENDATION_STYLES[
        highlightedRecommendationTier as keyof typeof TOP_RECOMMENDATION_STYLES
      ]
    : null;
  const lockedThumbClass = isWord
    ? "h-16 w-16 rounded-full"
    : "h-[62px] w-[62px] rounded-[20px]";
  const lockedThumbnail = isUrlThumbnail(thumbnail) ? (
    <VocabThumbnail
      thumbnail={thumbnail}
      gradient={config.thumbGradient}
      size={isWord ? "md" : "lg"}
      iconColor="white"
    />
  ) : (
    <span className={isWord ? "text-[26px] font-black" : "text-[28px] font-black"}>
      {thumbnail.slice(0, 2)}
    </span>
  );

  const cardClassName = [
    "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] text-left",
    isWord ? "min-h-[210px]" : "min-h-[190px]",
    effectiveLocked
      ? [
          "items-center justify-center border border-border-default/70 bg-surface-tertiary p-4 dark:border-white/[0.05] dark:bg-[#1a181c]",
          isInteractive
            ? `cursor-pointer focus:outline-none focus-visible:ring-2 ${config.ring}`
            : "cursor-default",
        ].join(" ")
      : [
          "p-5",
          "bg-surface-primary border border-[#E8E3E1] dark:border-[#2a2a2a]",
          "shadow-none",
          config.shadowHover,
          hoverEnabled ? "hover:-translate-y-[1px] hover:border-accent/20" : "",
          isInteractive ? `cursor-pointer focus:outline-none focus-visible:ring-2 ${config.ring}` : "",
        ]
          .filter(Boolean)
          .join(" "),
    cardTransition,
    unlocking ? "gokai-unlock-burst" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = effectiveLocked ? (
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div
        className={[
          "flex items-center justify-center bg-surface-tertiary/80 text-content-muted/60 select-none dark:bg-white/[0.06] dark:text-white/25",
          lockedThumbClass,
        ].join(" ")}
      >
        {lockedThumbnail}
      </div>
      <LockedStateBadge size="sm" />
      {variant !== "word" ? (
        <div className="max-w-[88%] text-center">
          <h3 className="line-clamp-2 text-[14px] font-extrabold leading-snug text-content-primary/82 dark:text-white/80">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 line-clamp-1 text-[11px] font-medium text-content-muted/80 dark:text-white/52">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  ) : isWord ? (
    <WordCardLayout
      title={title}
      subtitle={subtitle}
      thumbnail={thumbnail}
      hasOnClick={isInteractive}
      hoverEnabled={hoverEnabled}
      config={config}
      actionAlignment={onFavoriteToggle ? "start" : "end"}
      hoverTransition={hoverTransition}
    />
  ) : (
    <GradientCardLayout
      title={title}
      subtitle={subtitle}
      thumbnail={thumbnail}
      hasOnClick={isInteractive}
      hoverEnabled={hoverEnabled}
      config={config}
      hoverTransition={hoverTransition}
    />
  );

  const innerContent = (
    <>
      {isRecommended && !effectiveLocked ? (
        <>
          {recommendationStyle ? (
            <>
              <motion.span
                aria-hidden
                className={[
                  "pointer-events-none absolute inset-[-3px] z-0 rounded-[27px] border",
                  recommendationStyle.borderClass,
                ].join(" ")}
                animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.024, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                aria-hidden
                className={[
                  "pointer-events-none absolute inset-[6px] z-0 rounded-[20px] border",
                  recommendationStyle.innerBorderClass,
                ].join(" ")}
                animate={{ opacity: [0.2, 0.75, 0.2] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                aria-hidden
                className={[
                  "pointer-events-none absolute inset-x-4 top-3 z-0 h-10 rounded-full blur-2xl",
                  recommendationStyle.glowClass,
                ].join(" ")}
                animate={{ opacity: [0.16, 0.42, 0.16], scaleX: [0.92, 1.06, 0.92] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          ) : (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-[-2px] z-0 rounded-[26px] border border-[#D4A843]/45"
              animate={{ opacity: [0.38, 0.9, 0.38], scale: [1, 1.018, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <motion.span
            className={[
              "pointer-events-none absolute right-4 top-4 z-20 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
              recommendationStyle
                ? recommendationStyle.badgeClass
                : "border-[#D4A843]/30 bg-[#D4A843]/12 text-[#9B7B2F]",
            ].join(" ")}
            animate={{ y: [0, -1.5, 0], opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {recommendationStyle?.label ?? (recommendationRank ? `AI #${recommendationRank}` : "AI")}
          </motion.span>
        </>
      ) : null}

      {variant === "word" && !effectiveLocked && onFavoriteToggle ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onFavoriteToggle(id);
          }}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          className={[
            "absolute bottom-4 right-4 z-20 rounded-full border p-2 shadow-sm",
            "active:scale-95",
            hoverTransition,
            isFavorite
              ? `opacity-100 ${favoriteStyle.heartBg}`
              : "border-border-subtle bg-surface-primary opacity-0 group-hover:border-white/25 group-hover:bg-surface-primary/15 group-hover:opacity-100",
          ].join(" ")}
        >
          <HeartIcon
            isFavorite={isFavorite}
            config={favoriteStyle}
            hoverTransition={hoverTransition}
          />
        </button>
      ) : null}

      {content}
    </>
  );

  const cardEl = isInteractive ? (
    <button type="button" onClick={onClick} className={cardClassName}>
      {innerContent}
    </button>
  ) : (
    <div className={cardClassName}>{innerContent}</div>
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
