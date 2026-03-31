"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback } from "react";
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

  // ── Long-press to toggle favourite on mobile ──────────────────────────────
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const [longPressActive, setLongPressActive] = useState(false);

  const handleTouchStart = useCallback(() => {
    if (!onFavoriteToggle) return;
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      onFavoriteToggle(id);
      setLongPressActive(true);
      setTimeout(() => setLongPressActive(false), 700);
    }, 600);
  }, [onFavoriteToggle, id]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    onClick?.();
  }, [onClick]);
  // ─────────────────────────────────────────────────────────────────────────

  const cardClassName = [
    "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] p-5 text-left",
    "min-h-[190px] select-none",
    "bg-surface-primary border border-[#E8E3E1] dark:border-[#2a2a2a]",
    config.shadowCard,
    config.shadowHover,
    cardTransition,
    onClick
      ? `cursor-pointer hover:-translate-y-1 hover:border-transparent focus:outline-none focus-visible:ring-2 ${config.ring}`
      : "",
    longPressActive ? `ring-2 ${config.ring} scale-[0.97]` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const favoriteOverlay = (
    <AnimatePresence>
      {longPressActive && (
        <motion.div
          key="fav-flash"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.1 }}
        >
          <div className="absolute inset-0 rounded-[22px] bg-black/20" />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.7, 1.15, 1.25],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 0.65,
              times: [0, 0.32, 0.62, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 flex items-center justify-center rounded-full border border-white/30 bg-white/25 p-3 shadow-2xl backdrop-blur-[2px]"
          >
            <svg
              className="h-9 w-9 fill-current text-white drop-shadow-lg"
              viewBox="0 0 24 24"
            >
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
      className={cardClassName}
    >
      {favoriteOverlay}
      {layout}
    </div>
  ) : (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
      className={cardClassName}
    >
      {favoriteOverlay}
      {layout}
    </div>
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
