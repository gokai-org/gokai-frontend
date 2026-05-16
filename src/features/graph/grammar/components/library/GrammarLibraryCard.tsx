"use client";

import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useCardAnimation } from "@/features/library/hooks/useCardAnimation";
import { HeartIcon } from "@/features/library/components/ScriptCardLayout";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { getUnlockVisualVars } from "@/shared/lib/unlockVisuals";
import { LockedStateBadge } from "@/shared/ui/LockedStateIndicator";
import { getGrammarBoardArtworkPreset } from "../../constants/grammarBoardBackgrounds";
import {
  GRAMMAR_ARTWORK_PALETTE_CLASSES,
  GRAMMAR_CARD_HOVER_ARTWORK_PRIMARY_CLASS,
  GRAMMAR_CARD_HOVER_ARTWORK_SECONDARY_CLASS,
  GRAMMAR_CARD_HOVER_SURFACE_CLASS,
  GRAMMAR_CARD_HOVER_TITLE_CLASS,
  GRAMMAR_LOCKED_CARD_VARIANT,
  GRAMMAR_UNLOCKED_CARD_VARIANTS,
  type GrammarCardVariant,
} from "../../lib/grammarCardTheme";
import type { GrammarBoardProgress } from "../../types";

const UNLOCK_HOLD_DURATION_MS = 720;
const LOCKED_SHAKE_DURATION_MS = 580;

const CARD_STATE_ACCENTS = {
  available: "shadow-none",
  completed: "shadow-none",
  locked: "shadow-none",
} as const;

const GRAMMAR_FAVORITE_STYLES = {
  paper: {
    heartColor: "text-[#6B5F57]",
    heartBg: "border-[#6B5F57]/20 bg-[#6B5F57]/10",
  },
  accent: {
    heartColor: "text-[#BA5149]",
    heartBg: "border-[#BA5149]/20 bg-[#BA5149]/10",
  },
  locked: {
    heartColor: "text-content-muted",
    heartBg: "border-border-subtle bg-surface-primary",
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCardVariant(lesson: GrammarBoardProgress): GrammarCardVariant {
  if (lesson.status === "locked") {
    return GRAMMAR_LOCKED_CARD_VARIANT;
  }

  return GRAMMAR_UNLOCKED_CARD_VARIANTS[
    lesson.index % GRAMMAR_UNLOCKED_CARD_VARIANTS.length
  ];
}

function getArtworkMaskStyle(asset: number): CSSProperties {
  const imageUrl = `/backgrounds/grammar/${asset}.svg`;

  return {
    WebkitMaskImage: `url(${imageUrl})`,
    maskImage: `url(${imageUrl})`,
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
}

function getArtworkLayerStyle(
  lesson: GrammarBoardProgress,
  layer: "primary" | "echo",
): CSSProperties {
  const preset = getGrammarBoardArtworkPreset(lesson.index);
  const shiftX = layer === "echo" ? preset.echoShiftX * 0.45 : 0;
  const shiftY = layer === "echo" ? preset.echoShiftY * 0.45 : 6;
  const scale = layer === "echo" ? preset.echoScale * 0.9 : 1;
  const left = clamp(preset.x + shiftX, 28, 74);
  const top = clamp(preset.y + shiftY, 24, 76);
  const width = preset.width * 0.62 * scale;
  const height = preset.height * 0.62 * scale;
  const rotation = preset.rotation * (layer === "echo" ? 0.54 : 0.72);
  const baseTransform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
  const hoverTransform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1.06)`;

  const style: CSSProperties = {
    ...getArtworkMaskStyle(preset.asset),
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    opacity: layer === "echo" ? preset.opacity * 0.16 : preset.opacity * 0.92,
    transformOrigin: "center",
    filter:
      layer === "echo"
        ? `blur(${Math.max(3, Math.round(preset.blur * 0.28))}px)`
        : undefined,
  };

  (style as Record<string, string | number | undefined>)["--grammar-library-artwork-transform"] =
    baseTransform;
  (style as Record<string, string | number | undefined>)["--grammar-library-artwork-hover-transform"] =
    hoverTransform;

  return style;
}

export interface GrammarLibraryCardProps {
  lesson: GrammarBoardProgress;
  index?: number;
  isFavorite?: boolean;
  unlockPending?: boolean;
  justUnlocked?: boolean;
  onSelect?: (lessonId: string) => void;
  onToggleFavorite?: (lessonId: string) => void;
  onPressUnlock?: (lessonId: string) => void;
}

export function GrammarLibraryCard({
  lesson,
  index = 0,
  isFavorite = false,
  unlockPending = false,
  justUnlocked = false,
  onSelect,
  onToggleFavorite,
  onPressUnlock,
}: GrammarLibraryCardProps) {
  const { motionProps, hoverTransition, cardTransition } = useCardAnimation(index);
  const masteredModules = useMasteredModules();
  const holdTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const holdTriggeredRef = useRef(false);
  const [isHoldingUnlock, setIsHoldingUnlock] = useState(false);
  const [isLockedShakeActive, setIsLockedShakeActive] = useState(false);

  const isComingSoon = lesson.isMock;
  const isGrammarMastered = masteredModules.has("grammar");
  const isLockedCard = lesson.status === "locked" && !isComingSoon;
  const pressUnlockEnabled = isLockedCard && lesson.canUnlock && typeof onPressUnlock === "function";
  const showLockedIndicator = isLockedCard && !lesson.canUnlock;
  const unlockCost = Math.max(0, lesson.pointsToUnlock ?? lesson.unlockCost ?? 0);
  const variant = getCardVariant(lesson);
  const artworkPalette = GRAMMAR_ARTWORK_PALETTE_CLASSES[variant.artTone];
  const primaryArtworkStyle = getArtworkLayerStyle(lesson, "primary");
  const echoArtworkStyle = getArtworkLayerStyle(lesson, "echo");
  const hoverEnabled = !isLockedCard && !isComingSoon;
  const hoverClass = hoverEnabled
    ? "hover:-translate-y-[1px]"
    : "";
  const surfaceHoverClass = hoverEnabled ? GRAMMAR_CARD_HOVER_SURFACE_CLASS : "";
  const artworkHoverClass = hoverEnabled
    ? "transition-[transform,filter] duration-300 ease-out [transform:var(--grammar-library-artwork-transform)] group-hover:[transform:var(--grammar-library-artwork-hover-transform)]"
    : "[transform:var(--grammar-library-artwork-transform)]";
  const titleHoverClass = hoverEnabled
    ? GRAMMAR_CARD_HOVER_TITLE_CLASS
    : "";
  const artworkToneHoverClass = hoverEnabled ? GRAMMAR_CARD_HOVER_ARTWORK_PRIMARY_CLASS : "";
  const artworkEchoHoverClass = hoverEnabled ? GRAMMAR_CARD_HOVER_ARTWORK_SECONDARY_CLASS : "";
  const unlockHoldVisualActive = isHoldingUnlock || unlockPending;
  const unlockVisualVars = getUnlockVisualVars("grammar");
  const favoriteStyle = GRAMMAR_FAVORITE_STYLES[variant.artTone];
  const canToggleFavorite = !isComingSoon && !isLockedCard && Boolean(onToggleFavorite);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const triggerLockedShake = useCallback(() => {
    if (!isLockedCard) {
      return;
    }

    if (shakeTimerRef.current !== null) {
      window.clearTimeout(shakeTimerRef.current);
    }

    setIsLockedShakeActive(false);

    window.requestAnimationFrame(() => {
      setIsLockedShakeActive(true);
      shakeTimerRef.current = window.setTimeout(() => {
        setIsLockedShakeActive(false);
        shakeTimerRef.current = null;
      }, LOCKED_SHAKE_DURATION_MS);
    });
  }, [isLockedCard]);

  const stopHold = useCallback(() => {
    clearHoldTimer();
    setIsHoldingUnlock(false);
  }, [clearHoldTimer]);

  useEffect(() => {
    if (!unlockPending) {
      return;
    }

    clearHoldTimer();
  }, [clearHoldTimer, unlockPending]);

  useEffect(() => {
    return () => {
      clearHoldTimer();
      if (shakeTimerRef.current !== null) {
        window.clearTimeout(shakeTimerRef.current);
      }
    };
  }, [clearHoldTimer]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!pressUnlockEnabled || unlockPending) {
        return;
      }

      holdTriggeredRef.current = false;
      setIsHoldingUnlock(true);
      clearHoldTimer();

      holdTimerRef.current = window.setTimeout(() => {
        holdTriggeredRef.current = true;
        setIsHoldingUnlock(false);
        onPressUnlock?.(lesson.id);
        holdTimerRef.current = null;
      }, UNLOCK_HOLD_DURATION_MS);

      if (event.currentTarget.hasPointerCapture?.(event.pointerId) === false) {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
    },
    [clearHoldTimer, lesson.id, onPressUnlock, pressUnlockEnabled, unlockPending],
  );

  const handlePointerUp = useCallback(() => {
    if (!pressUnlockEnabled) {
      return;
    }

    stopHold();
  }, [pressUnlockEnabled, stopHold]);

  const handlePointerCancel = useCallback(() => {
    if (!pressUnlockEnabled) {
      return;
    }

    stopHold();
  }, [pressUnlockEnabled, stopHold]);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (holdTriggeredRef.current) {
        holdTriggeredRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isLockedCard || isComingSoon) {
        event.preventDefault();
        event.stopPropagation();
        triggerLockedShake();
        return;
      }

      onSelect?.(lesson.id);
    },
    [isComingSoon, isLockedCard, lesson.id, onSelect, triggerLockedShake],
  );

  const handleFavoriteClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (isComingSoon) {
        return;
      }

      onToggleFavorite?.(lesson.id);
    },
    [isComingSoon, lesson.id, onToggleFavorite],
  );

  return (
    <motion.div
      {...motionProps}
      className={[
        "group relative h-full w-full rounded-[24px] outline-none",
        cardTransition,
        hoverClass,
        justUnlocked ? "gokai-unlock-burst" : "",
        isLockedShakeActive ? "grammar-board-cell-shaking" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={unlockVisualVars}
      data-library-mastery-card="grammar"
      data-library-mastered={isGrammarMastered ? "true" : "false"}
      data-grammar-mastered={isGrammarMastered ? "true" : "false"}
    >
      <div
        data-grammar-library-surface="true"
        data-grammar-art-tone={variant.artTone}
        className={[
          "relative flex h-full min-h-[190px] w-full flex-col overflow-hidden rounded-[24px] border text-left select-none",
          variant.bg,
          variant.border,
          variant.text,
          surfaceHoverClass,
          isLockedCard
            ? ""
            : CARD_STATE_ACCENTS[lesson.status],
        ].join(" ")}
      >
        {canToggleFavorite ? (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={[
              "absolute bottom-4 right-4 z-20 rounded-full border p-2 shadow-sm",
              "active:scale-95",
              hoverTransition,
              isFavorite
                ? `opacity-100 ${favoriteStyle.heartBg}`
                : "border-border-subtle bg-surface-primary opacity-0 group-hover:border-white/25 group-hover:bg-surface-primary/15 group-hover:opacity-100",
            ].join(" ")}
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <HeartIcon
              isFavorite={isFavorite}
              config={favoriteStyle}
              hoverTransition={hoverTransition}
            />
          </button>
        ) : null}

        <button
          type="button"
          disabled={isComingSoon}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
          data-grammar-art-tone={variant.artTone}
          className="relative h-full w-full rounded-[24px] p-5 text-left"
          aria-disabled={isLockedCard || !onSelect ? true : undefined}
          aria-label={lesson.title}
          title={hoverEnabled ? lesson.title : undefined}
        >
          <div
            className={[
              "pointer-events-none absolute inset-[1px] rounded-[23px] border",
              "border-black/6 dark:border-white/8",
            ].join(" ")}
          />

          {pressUnlockEnabled ? (
            <>
              <div
                data-grammar-unlock-overlay="true"
                className={`pointer-events-none absolute inset-0 z-[1] rounded-[24px] bg-[linear-gradient(135deg,rgba(153,51,49,0.08),rgba(186,81,73,0.18),rgba(255,255,255,0.04))] transition-opacity duration-200 ${unlockHoldVisualActive ? "opacity-100" : "opacity-0"}`}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1.5 overflow-hidden rounded-b-[24px] bg-black/6 dark:bg-white/8">
                <div
                  data-grammar-unlock-bar="true"
                  className={`h-full origin-left rounded-full bg-gradient-to-r from-accent via-[#C5544D] to-accent-hover ${unlockPending ? "animate-pulse" : ""}`}
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

          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[24px]">
            <span
              className={`absolute ${artworkPalette.secondary} ${artworkHoverClass} ${artworkEchoHoverClass} mix-blend-multiply dark:mix-blend-screen ${isLockedCard ? "saturate-0 opacity-80" : ""}`}
              style={echoArtworkStyle}
            />
            <span
              className={`absolute ${artworkPalette.primary} ${artworkHoverClass} ${artworkToneHoverClass} mix-blend-multiply dark:mix-blend-screen ${isLockedCard ? "saturate-0 opacity-90" : ""}`}
              style={primaryArtworkStyle}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-end">
            {showLockedIndicator ? (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <LockedStateBadge size="md" />
              </div>
            ) : (
              <div className="max-w-[78%]">
                <h3
                  className={[
                    "line-clamp-2 text-[16px] font-extrabold leading-snug text-content-primary dark:text-white",
                    titleHoverClass,
                  ].join(" ")}
                  title={hoverEnabled ? lesson.title : undefined}
                >
                  {lesson.title}
                </h3>
              </div>
            )}
          </div>
        </button>
      </div>
    </motion.div>
  );
}

export default GrammarLibraryCard;