"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { LockKeyhole } from "lucide-react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCardAnimation } from "@/features/library/hooks/useCardAnimation";
import {
  SCRIPT_CARD_CONFIG,
  SCRIPT_CARD_GOLD_CONFIG,
  type ScriptVariant,
} from "@/features/library/utils/scriptCardConfig";
import { ScriptCardLayout } from "@/features/library/components/ScriptCardLayout";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import type { MasteryModuleId } from "@/features/mastery/types";
import { useShakeFeedback } from "@/shared/hooks/useShakeFeedback";

const LOCKED_SHAKE_DURATION_MS = 580;
const UNLOCK_HOLD_DURATION_MS = 720;

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ScriptCardProps {
  id: string;
  symbol: string;
  title: string;
  subtitle?: string;
  pointsBadge?: string;
  unlockPoints?: number;
  currentPoints?: number;
  variant: ScriptVariant;
  index?: number;
  isFavorite?: boolean;
  locked?: boolean;
  unlockReady?: boolean;
  unlockPending?: boolean;
  unlocking?: boolean;
  onClick?: () => void;
  onPressUnlock?: (id: string) => void;
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
  unlockReady = false,
  unlockPending = false,
  unlocking = false,
  onClick,
  onPressUnlock,
  onFavoriteToggle,
}: ScriptCardProps) {
  const { animationsEnabled, motionProps, hoverTransition, cardTransition } =
    useCardAnimation(index);
  const effectiveLocked = locked && !unlocking;
  const { shakingKey, triggerShake } = useShakeFeedback<string>(
    LOCKED_SHAKE_DURATION_MS,
  );
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
  const unlockSequenceDelay = animationsEnabled ? Math.min(index, 8) * 0.12 : 0;
  const pressUnlockEnabled =
    effectiveLocked && unlockReady && typeof onPressUnlock === "function";
  const showLockedShakeFeedback = effectiveLocked && !pressUnlockEnabled;

  // ── Long-press to toggle favourite on mobile ──────────────────────────────
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const [didLongPress, setDidLongPress] = useState(false);
  const [isHoldingUnlock, setIsHoldingUnlock] = useState(false);
  const [didTriggerUnlockHold, setDidTriggerUnlockHold] = useState(false);

  const handleTouchStart = useCallback(() => {
    if (!onFavoriteToggle) return;
    setDidLongPress(false);
    longPressTimer.current = setTimeout(() => {
      setDidLongPress(true);
      onFavoriteToggle(id);
      setLongPressActive(true);
      setTimeout(() => setLongPressActive(false), 700);
    }, 600);
  }, [id, onFavoriteToggle]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const clearUnlockHold = useCallback(() => {
    if (unlockHoldTimer.current) {
      clearTimeout(unlockHoldTimer.current);
      unlockHoldTimer.current = null;
    }
  }, []);

  const stopUnlockHold = useCallback(() => {
    clearUnlockHold();
    setIsHoldingUnlock(false);
  }, [clearUnlockHold]);

  const handleUnlockPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pressUnlockEnabled || unlockPending) {
        return;
      }

      setDidTriggerUnlockHold(false);
      setIsHoldingUnlock(true);
      clearUnlockHold();

      unlockHoldTimer.current = setTimeout(() => {
        setDidTriggerUnlockHold(true);
        setIsHoldingUnlock(false);
        onPressUnlock?.(id);
        unlockHoldTimer.current = null;
      }, UNLOCK_HOLD_DURATION_MS);

      if (event.currentTarget.hasPointerCapture?.(event.pointerId) === false) {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
    },
    [clearUnlockHold, id, onPressUnlock, pressUnlockEnabled, unlockPending],
  );

  const handleUnlockPointerUp = useCallback(() => {
    if (!pressUnlockEnabled) {
      return;
    }

    stopUnlockHold();
  }, [pressUnlockEnabled, stopUnlockHold]);

  const handleUnlockPointerCancel = useCallback(() => {
    if (!pressUnlockEnabled) {
      return;
    }

    stopUnlockHold();
  }, [pressUnlockEnabled, stopUnlockHold]);

  const handleClick = useCallback((event?: ReactMouseEvent<HTMLDivElement>) => {
    if (didTriggerUnlockHold) {
      setDidTriggerUnlockHold(false);
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    if (didLongPress) {
      setDidLongPress(false);
      return;
    }

    if (effectiveLocked) {
      if (showLockedShakeFeedback) {
        triggerShake(id);
      }
      return;
    }

    onClick?.();
  }, [didLongPress, didTriggerUnlockHold, effectiveLocked, id, onClick, showLockedShakeFeedback, triggerShake]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      if (pressUnlockEnabled) {
        onPressUnlock?.(id);
        return;
      }

      handleClick();
    },
    [handleClick, id, onPressUnlock, pressUnlockEnabled],
  );
  // ─────────────────────────────────────────────────────────────────────────

  const isLockedShakeActive = shakingKey === id;
  const isInteractive = Boolean(onClick) || effectiveLocked;
  const unlockHoldVisualActive = isHoldingUnlock || unlockPending;

  const cardClassName = [
    "group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] text-left",
    "min-h-[190px] select-none",
    effectiveLocked
      ? [
          "items-center justify-center border border-border-default/70 bg-surface-tertiary p-4 dark:border-white/[0.05] dark:bg-[#1a181c]",
          pressUnlockEnabled
            ? "shadow-[0_0_0_1px_rgba(186,72,69,0.14),0_10px_28px_-14px_rgba(186,72,69,0.62)]"
            : "",
          isInteractive
            ? `cursor-pointer focus:outline-none focus-visible:ring-2 ${config.ring}`
            : "cursor-default",
        ].join(" ")
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
        pressUnlockEnabled && !unlockPending ? "kanji-library-unlock-ready" : "",
        unlockHoldVisualActive ? "kanji-library-unlock-hold" : "",
        unlocking ? "gokai-unlock-burst" : "",
    isLockedShakeActive ? "grammar-board-cell-shaking" : "",
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
  const lockedContent = effectiveLocked ? (
    <div className="relative z-10 flex flex-col items-center gap-3">
      {/* Dimmed symbol shape */}
      {config.symbolShape === "circle" && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-tertiary/80 text-[26px] font-black text-content-muted/60 select-none dark:bg-white/[0.06] dark:text-white/25">
          {symbol}
        </div>
      )}
      {config.symbolShape === "mahjong" && (
        <div className="flex h-[56px] w-[44px] items-center justify-center rounded-xl bg-surface-tertiary/80 text-[24px] font-black text-content-muted/60 select-none dark:bg-white/[0.06] dark:text-white/25">
          {symbol}
        </div>
      )}
      {config.symbolShape === "shogi" && (
        <div
          className="relative flex h-[56px] w-[44px] items-center justify-center bg-surface-tertiary/80 text-[24px] font-black text-content-muted/60 select-none dark:bg-white/[0.06] dark:text-white/25"
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
      transition={{ delay: unlockSequenceDelay + (animationsEnabled ? 2.15 : 0.95), duration: 0.45 }}
    >
      {/* Radial glow — variant color */}
      <motion.div
        className="absolute inset-0 rounded-[22px]"
        initial={{ opacity: 0.78 }}
        animate={{ opacity: 0 }}
        transition={{ delay: unlockSequenceDelay, duration: animationsEnabled ? 1.95 : 0.85 }}
        style={{
          background: `radial-gradient(circle, rgba(${unlockColor.rgba},0.48) 0%, transparent 70%)`,
        }}
      />
      <motion.div
        className="absolute inset-[10px] rounded-[18px]"
        initial={{ opacity: 0.58, scale: 0.88 }}
        animate={{ opacity: 0, scale: 1.12 }}
        transition={{ delay: unlockSequenceDelay + 0.08, duration: animationsEnabled ? 1.15 : 0.6 }}
        style={{
          boxShadow: `0 0 0 1px rgba(${unlockColor.rgba},0.18), 0 0 36px rgba(${unlockColor.rgba},0.28)`,
        }}
      />
      {/* Expanding ring — skipped on reduced animations */}
      {animationsEnabled && (
        <>
          <motion.div
            className="absolute rounded-[24px] border-2"
            initial={{ opacity: 0.92, scale: 0.52 }}
            animate={{ opacity: 0, scale: 1.48 }}
            transition={{ delay: unlockSequenceDelay, duration: 0.88, ease: [0.22, 1, 0.36, 1] }}
            style={{ inset: 0, borderColor: `rgba(${unlockColor.rgba},0.52)` }}
          />
          <motion.div
            className="absolute rounded-[24px] border"
            initial={{ opacity: 0.64, scale: 0.7 }}
            animate={{ opacity: 0, scale: 1.72 }}
            transition={{ delay: unlockSequenceDelay + 0.18, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            style={{ inset: -6, borderColor: `rgba(${unlockColor.rgba},0.32)` }}
          />
        </>
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
          delay: unlockSequenceDelay + 0.06,
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

  const layout = !effectiveLocked ? (
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

  const effectiveOnClick = isInteractive ? handleClick : undefined;

  const cardEl = effectiveOnClick ? (
    <div
      role="button"
      tabIndex={0}
      onClick={effectiveOnClick}
      onKeyDown={handleKeyDown}
      onPointerDown={pressUnlockEnabled ? handleUnlockPointerDown : undefined}
      onPointerUp={pressUnlockEnabled ? handleUnlockPointerUp : undefined}
      onPointerCancel={pressUnlockEnabled ? handleUnlockPointerCancel : undefined}
      onPointerLeave={pressUnlockEnabled ? handleUnlockPointerCancel : undefined}
      onTouchStart={effectiveLocked ? undefined : handleTouchStart}
      onTouchEnd={effectiveLocked ? undefined : cancelLongPress}
      onTouchMove={effectiveLocked ? undefined : cancelLongPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none", touchAction: pressUnlockEnabled ? "none" : undefined } as React.CSSProperties}
      className={cardClassName}
    >
      {pressUnlockEnabled ? (
        <>
          <div
            className={`pointer-events-none absolute inset-0 z-[1] rounded-[24px] bg-[linear-gradient(135deg,rgba(153,51,49,0.08),rgba(186,81,73,0.18),rgba(255,255,255,0.04))] transition-opacity duration-200 ${unlockHoldVisualActive ? "opacity-100" : "opacity-0"}`}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1.5 overflow-hidden rounded-b-[24px] bg-black/6 dark:bg-white/8">
            <div
              className={`h-full origin-left rounded-full bg-gradient-to-r from-[#993331] via-[#C5544D] to-[#BA4845] shadow-[0_0_16px_rgba(153,51,49,0.28)] ${unlockPending ? "animate-pulse" : ""}`}
              style={{
                transform: `scaleX(${unlockPending ? 1 : unlockHoldVisualActive ? 1 : 0})`,
                transition: unlockPending
                  ? "transform 120ms ease-out"
                  : isHoldingUnlock
                    ? `transform ${UNLOCK_HOLD_DURATION_MS}ms linear`
                    : "transform 140ms ease-out",
              }}
            />
          </div>
        </>
      ) : null}
      {favoriteOverlay}
      {unlockingOverlay}
      {lockedContent}
      {layout}
    </div>
  ) : (
    <div
      onPointerDown={pressUnlockEnabled ? handleUnlockPointerDown : undefined}
      onPointerUp={pressUnlockEnabled ? handleUnlockPointerUp : undefined}
      onPointerCancel={pressUnlockEnabled ? handleUnlockPointerCancel : undefined}
      onPointerLeave={pressUnlockEnabled ? handleUnlockPointerCancel : undefined}
      onTouchStart={effectiveLocked ? undefined : handleTouchStart}
      onTouchEnd={effectiveLocked ? undefined : cancelLongPress}
      onTouchMove={effectiveLocked ? undefined : cancelLongPress}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none", touchAction: pressUnlockEnabled ? "none" : undefined } as React.CSSProperties}
      className={cardClassName}
    >
      {pressUnlockEnabled ? (
        <>
          <div
            className={`pointer-events-none absolute inset-0 z-[1] rounded-[24px] bg-[linear-gradient(135deg,rgba(153,51,49,0.08),rgba(186,81,73,0.18),rgba(255,255,255,0.04))] transition-opacity duration-200 ${unlockHoldVisualActive ? "opacity-100" : "opacity-0"}`}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1.5 overflow-hidden rounded-b-[24px] bg-black/6 dark:bg-white/8">
            <div
              className={`h-full origin-left rounded-full bg-gradient-to-r from-[#993331] via-[#C5544D] to-[#BA4845] shadow-[0_0_16px_rgba(153,51,49,0.28)] ${unlockPending ? "animate-pulse" : ""}`}
              style={{
                transform: `scaleX(${unlockPending ? 1 : unlockHoldVisualActive ? 1 : 0})`,
                transition: unlockPending
                  ? "transform 120ms ease-out"
                  : isHoldingUnlock
                    ? `transform ${UNLOCK_HOLD_DURATION_MS}ms linear`
                    : "transform 140ms ease-out",
              }}
            />
          </div>
        </>
      ) : null}
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
      <motion.div
        className="h-full"
        initial={false}
        animate={
          unlocking
            ? {
                scale: [0.96, 1.045, 0.992, 1],
                y: [8, -10, 1, 0],
                rotate: [0, -0.5, 0.25, 0],
                filter: [
                  "brightness(1)",
                  "brightness(1.18)",
                  "brightness(1.05)",
                  "brightness(1)",
                ],
              }
            : {
                scale: 1,
                y: 0,
                rotate: 0,
                filter: "brightness(1)",
              }
        }
        transition={{
          delay: unlockSequenceDelay,
          duration: animationsEnabled ? 1.2 : 0.55,
          times: [0, 0.28, 0.7, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {cardEl}
      </motion.div>
    </motion.div>
  );
}
