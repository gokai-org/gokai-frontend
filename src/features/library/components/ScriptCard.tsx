"use client";

import { motion } from "framer-motion";
import { useCardAnimation } from "@/features/library/hooks/useCardAnimation";
import {
  SCRIPT_CARD_CONFIG,
  type ScriptVariant,
} from "@/features/library/utils/scriptCardConfig";
import { ScriptCardLayout } from "@/features/library/components/ScriptCardLayout";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ScriptCardProps {
  id: string;
  symbol: string;
  title: string;
  subtitle?: string;
  pointsBadge?: string;
  variant: ScriptVariant;
  index?: number;
  isFavorite?: boolean;
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
}

// ─── ScriptCard ───────────────────────────────────────────────────────────────

export function ScriptCard({
  id,
  symbol,
  title,
  subtitle,
  pointsBadge,
  variant,
  index = 0,
  isFavorite = false,
  onClick,
  onFavoriteToggle,
}: ScriptCardProps) {
  const { animationsEnabled, motionProps, hoverTransition, cardTransition } = useCardAnimation(index);
  const config = SCRIPT_CARD_CONFIG[variant];

  const cardClassName = [
    "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] p-5 text-left",
    "min-h-[190px]",
    "bg-surface-primary border border-[#E8E3E1] dark:border-[#2a2a2a]",
    config.shadowCard,
    config.shadowHover,
    cardTransition,
    onClick
      ? `cursor-pointer hover:-translate-y-1 hover:border-transparent focus:outline-none focus-visible:ring-2 ${config.ring}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const layout = (
    <ScriptCardLayout
      symbol={symbol}
      title={title}
      subtitle={subtitle}
      pointsBadge={pointsBadge}
      isFavorite={isFavorite}
      hasOnClick={Boolean(onClick)}
      hasFavoriteToggle={Boolean(onFavoriteToggle)}
      config={config}
      hoverTransition={hoverTransition}
      onFavoriteToggle={onFavoriteToggle ? () => onFavoriteToggle(id) : undefined}
    />
  );

  const cardEl = onClick ? (
    <button type="button" onClick={onClick} className={cardClassName}>
      {layout}
    </button>
  ) : (
    <div className={cardClassName}>{layout}</div>
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
