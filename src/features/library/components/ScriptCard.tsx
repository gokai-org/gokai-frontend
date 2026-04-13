"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { LockKeyhole } from "lucide-react";
import { useCardAnimation } from "@/features/library/hooks/useCardAnimation";
import {
  SCRIPT_CARD_CONFIG,
  SCRIPT_CARD_GOLD_CONFIG,
  type ScriptVariant,
} from "@/features/library/utils/scriptCardConfig";
import { ScriptCardLayout } from "@/features/library/components/ScriptCardLayout";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import type { MasteryModuleId } from "@/features/mastery/types";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ScriptCardProps {
  id: string;
  symbol: string;
  title: string;
  subtitle?: string;
  pointsBadge?: string;
  unlockPoints?: number;
  variant: ScriptVariant;
  index?: number;
  isFavorite?: boolean;
  locked?: boolean;
  unlocking?: boolean;
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
  locked = false,
  unlocking = false,
  onClick,
  onFavoriteToggle,
}: ScriptCardProps) {
  const { animationsEnabled, motionProps, hoverTransition, cardTransition } =
    useCardAnimation(index);
  const masteredModules = useMasteredModules();
  const isMastered = masteredModules.has(variant as MasteryModuleId);
  const baseConfig = SCRIPT_CARD_CONFIG[variant];
  const config = isMastered
    ? { ...SCRIPT_CARD_GOLD_CONFIG, symbolShape: baseConfig.symbolShape }
    : baseConfig;

  // ── Variant-aware unlock overlay colors ────────────────────────────────────
  const unlockColor = isMastered
    ? { hex: "#D4A843", rgba: "212,168,67" }
    : ({
        kanji:    { hex: "#BA4845", rgba: "186,72,69" },
        hiragana: { hex: "#7B3F8A", rgba: "123,63,138" },
        katakana: { hex: "#1B5078", rgba: "27,80,120" },
      } as const)[variant];
  const unlockBadgeText = variant === "kanji" ? "+30" : "+5";

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
    "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] text-left",
    "min-h-[190px] select-none",
    locked
      ? "items-center justify-center bg-surface-tertiary dark:bg-[#1a181c] border border-border-default/70 dark:border-white/[0.05] cursor-default p-4"
      : [
          "p-5",
          "bg-surface-primary border border-[#E8E3E1] dark:border-[#2a2a2a]",
          config.shadowCard,
          config.shadowHover,
          onClick
            ? `cursor-pointer hover:-translate-y-1 hover:border-transparent focus:outline-none focus-visible:ring-2 ${config.ring}`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
    cardTransition,
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

  // ── Minimal locked layout (board-node style) ─────────────────────────────
  const lockedContent = locked ? (
    <div className="flex flex-col items-center gap-3">
      {/* Dimmed symbol shape */}
      {config.symbolShape === "circle" && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-tertiary/80 dark:bg-white/[0.06] text-[26px] font-black text-content-muted/60 dark:text-white/25 select-none">
          {symbol}
        </div>
      )}
      {config.symbolShape === "mahjong" && (
        <div className="flex h-[56px] w-[44px] items-center justify-center rounded-xl bg-surface-tertiary/80 dark:bg-white/[0.06] text-[24px] font-black text-content-muted/60 dark:text-white/25 select-none">
          {symbol}
        </div>
      )}
      {config.symbolShape === "shogi" && (
        <div
          className="relative flex h-[56px] w-[44px] items-center justify-center bg-surface-tertiary/80 dark:bg-white/[0.06] text-[24px] font-black text-content-muted/60 dark:text-white/25 select-none"
          style={{
            clipPath: "path('M 18 3 Q 22 0 26 3 L 40 15 Q 44 18 44 23 L 44 50 Q 44 56 38 56 L 6 56 Q 0 56 0 50 L 0 23 Q 0 18 4 15 Z')",
          }}
        >
          {symbol}
        </div>
      )}
      {/* Lock icon */}
      <LockKeyhole
        className="h-4 w-4 text-content-muted/50 dark:text-white/30"
        strokeWidth={2}
      />
    </div>
  ) : null;

  const unlockingOverlay = unlocking ? (
    <motion.div
      key="unlock-burst"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-[22px] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: animationsEnabled ? 2.1 : 0.9, duration: 0.4 }}
    >
      {/* Radial glow — variant color */}
      <motion.div
        className="absolute inset-0 rounded-[22px]"
        initial={{ opacity: 0.78 }}
        animate={{ opacity: 0 }}
        transition={{ duration: animationsEnabled ? 1.9 : 0.8 }}
        style={{
          background: `radial-gradient(circle, rgba(${unlockColor.rgba},0.48) 0%, transparent 70%)`,
        }}
      />
      {/* Expanding ring — skipped on reduced animations */}
      {animationsEnabled && (
        <motion.div
          className="absolute rounded-[24px] border-2"
          initial={{ opacity: 0.92, scale: 0.52 }}
          animate={{ opacity: 0, scale: 1.48 }}
          transition={{ duration: 0.88, ease: [0.22, 1, 0.36, 1] }}
          style={{ inset: 0, borderColor: `rgba(${unlockColor.rgba},0.52)` }}
        />
      )}
      {/* Points badge floating up — variant color */}
      <motion.div
        className="relative z-10 flex items-center gap-1 rounded-full px-3 py-[5px]"
        style={{
          background: unlockColor.hex,
          boxShadow: `0 3px 12px rgba(${unlockColor.rgba},0.52)`,
        }}
        initial={{ y: 10, opacity: 0, scale: 0.68 }}
        animate={
          animationsEnabled
            ? {
                y: [10, -2, -30, -38],
                opacity: [0, 1, 1, 0],
                scale: [0.68, 1.05, 1, 0.94],
              }
            : { y: -22, opacity: [0, 1, 0], scale: 1 }
        }
        transition={{
          duration: animationsEnabled ? 1.9 : 0.9,
          times: animationsEnabled ? [0, 0.14, 0.68, 1] : [0, 0.3, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="text-[13px] font-black tracking-wide text-white">
          {unlockBadgeText}
        </span>
      </motion.div>
    </motion.div>
  ) : null;

  const layout = !locked ? (
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
      onFavoriteToggle={
        onFavoriteToggle ? () => onFavoriteToggle(id) : undefined
      }
      locked={false}
    />
  ) : null;

  const effectiveOnClick = locked ? undefined : onClick;

  const cardEl = effectiveOnClick ? (
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
      {unlockingOverlay}
      {lockedContent}
      {layout}
    </div>
  ) : (
    <div
      onTouchStart={locked ? undefined : handleTouchStart}
      onTouchEnd={locked ? undefined : cancelLongPress}
      onTouchMove={locked ? undefined : cancelLongPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
      className={cardClassName}
    >
      {favoriteOverlay}
      {unlockingOverlay}
      {lockedContent}
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
