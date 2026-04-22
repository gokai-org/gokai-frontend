"use client";

import { motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
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
import { getGrammarBoardArtworkPreset } from "../../constants/grammarBoardBackgrounds";
import type { GrammarBoardProgress } from "../../types";

const UNLOCK_HOLD_DURATION_MS = 720;
const LOCKED_SHAKE_DURATION_MS = 580;

type ArtworkTone = "paper" | "accent" | "locked";

type CardVariant = {
  bg: string;
  text: string;
  border: string;
  accent: string;
  badge: string;
  artTone: ArtworkTone;
};

const UNLOCKED_CARD_VARIANTS: readonly CardVariant[] = [
  {
    bg: "bg-surface-tertiary dark:bg-[#1a1a1a]",
    text: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
    accent: "from-[#B14540] via-[#C55C55] to-[#D88A6E]",
    badge: "bg-content-primary/10 dark:bg-white/10",
    artTone: "paper",
  },
  {
    bg: "bg-accent/15 dark:bg-accent/20",
    text: "text-content-primary dark:text-white",
    border: "border-accent/20 dark:border-accent/25",
    accent: "from-[#8F3D36] via-[#B14540] to-[#E09A73]",
    badge: "bg-accent/15 dark:bg-accent/25",
    artTone: "accent",
  },
  {
    bg: "bg-surface-inset dark:bg-[#202020]",
    text: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
    accent: "from-[#744842] via-[#A9605C] to-[#DBAE8A]",
    badge: "bg-content-primary/10 dark:bg-white/10",
    artTone: "paper",
  },
  {
    bg: "bg-surface-secondary dark:bg-surface-secondary",
    text: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
    accent: "from-[#9D463E] via-[#C96455] to-[#F0B989]",
    badge: "bg-content-primary/10 dark:bg-white/10",
    artTone: "paper",
  },
] as const;

const LOCKED_CARD_VARIANT: CardVariant = {
  bg: "bg-surface-secondary/90 dark:bg-surface-secondary",
  text: "text-content-primary dark:text-white",
  border: "border-content-primary/10 dark:border-white/10",
  accent: "from-[#6E5E5B] via-[#8B7B76] to-[#A99B95]",
  badge: "bg-black/5 dark:bg-white/10",
  artTone: "locked",
};

const CARD_STATE_ACCENTS = {
  available: "shadow-[0_16px_34px_rgba(0,0,0,0.1)]",
  completed: "shadow-[0_18px_36px_rgba(0,0,0,0.11)]",
  locked: "shadow-[0_10px_22px_rgba(0,0,0,0.06)]",
} as const;

const ARTWORK_PALETTE_CLASSES: Record<
  ArtworkTone,
  { primary: string; secondary: string; glow: string }
> = {
  paper: {
    primary: "bg-[#5f575225] dark:bg-[#f2eae214]",
    secondary: "bg-[#8b827b16] dark:bg-[#d8cec50c]",
    glow:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.34),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(96,88,82,0.11),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(244,237,230,0.04),transparent_56%)]",
  },
  accent: {
    primary: "bg-[#675a541f] dark:bg-[#d45d551f]",
    secondary: "bg-[#95898314] dark:bg-[#f3a29312]",
    glow:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.3),transparent_40%),radial-gradient(circle_at_78%_16%,rgba(104,93,86,0.12),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_78%_16%,rgba(212,82,79,0.08),transparent_56%)]",
  },
  locked: {
    primary: "bg-[#6259531b] dark:bg-[#d8d0c912]",
    secondary: "bg-[#90867f12] dark:bg-[#ece5df0b]",
    glow:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.3),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(98,89,83,0.09),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(214,206,198,0.03),transparent_56%)]",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCardVariant(lesson: GrammarBoardProgress) {
  if (lesson.status === "locked") {
    return LOCKED_CARD_VARIANT;
  }

  return UNLOCKED_CARD_VARIANTS[lesson.index % UNLOCKED_CARD_VARIANTS.length];
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
  unlockPending?: boolean;
  justUnlocked?: boolean;
  onSelect?: (lessonId: string) => void;
  onPressUnlock?: (lessonId: string) => void;
}

export function GrammarLibraryCard({
  lesson,
  index = 0,
  unlockPending = false,
  justUnlocked = false,
  onSelect,
  onPressUnlock,
}: GrammarLibraryCardProps) {
  const { motionProps, hoverTransition, cardTransition } = useCardAnimation(index);
  const holdTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const holdTriggeredRef = useRef(false);
  const [isHoldingUnlock, setIsHoldingUnlock] = useState(false);
  const [isLockedShakeActive, setIsLockedShakeActive] = useState(false);

  const isComingSoon = lesson.isMock;
  const isLockedCard = lesson.status === "locked" && !isComingSoon;
  const pressUnlockEnabled = isLockedCard && lesson.canUnlock && typeof onPressUnlock === "function";
  const showLockedIndicator = isLockedCard && !lesson.canUnlock;
  const variant = getCardVariant(lesson);
  const artworkPalette = ARTWORK_PALETTE_CLASSES[variant.artTone];
  const primaryArtworkStyle = getArtworkLayerStyle(lesson, "primary");
  const echoArtworkStyle = getArtworkLayerStyle(lesson, "echo");
  const hoverEnabled = !isLockedCard && !isComingSoon;
  const hoverClass = hoverEnabled
    ? "hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(153,51,49,0.22)]"
    : "";
  const artworkHoverClass = hoverEnabled
    ? "transition-[transform,filter] duration-300 ease-out [transform:var(--grammar-library-artwork-transform)] group-hover:[transform:var(--grammar-library-artwork-hover-transform)]"
    : "[transform:var(--grammar-library-artwork-transform)]";
  const titleHoverClass = hoverEnabled
    ? "transition-[color,opacity] duration-300 ease-out group-hover:text-white dark:group-hover:text-white"
    : "";
  const unlockHoldVisualActive = isHoldingUnlock || unlockPending;

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
    >
      <div
        className={[
          "relative flex h-full min-h-[190px] w-full flex-col overflow-hidden rounded-[24px] border text-left select-none",
          variant.bg,
          variant.border,
          variant.text,
          isLockedCard
                ? "border border-border-default/70 bg-[#d9d4d0] dark:bg-[#1a181c] dark:border-white/[0.05]"
            : CARD_STATE_ACCENTS[lesson.status],
        ].join(" ")}
      >
        <button
          type="button"
          disabled={isComingSoon}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
          className="relative h-full w-full rounded-[24px] p-5 text-left"
          aria-disabled={isLockedCard || !onSelect ? true : undefined}
          aria-label={lesson.title}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" />
          <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.05),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[23px] border border-white/50 dark:border-white/10" />

          {!isLockedCard ? (
            <div
              aria-hidden
              className={[
                "pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br opacity-0 group-hover:opacity-100",
                hoverTransition,
                "from-accent/88 via-[#A83F3A]/78 to-accent-hover/72",
              ].join(" ")}
            />
          ) : null}

          {!isLockedCard ? (
            <div
              aria-hidden
              className={[
                "pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-[24px] bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100",
                hoverTransition,
              ].join(" ")}
            />
          ) : null}

          {pressUnlockEnabled ? (
            <>
              <div
                className={`pointer-events-none absolute inset-0 z-[1] rounded-[24px] bg-[linear-gradient(135deg,rgba(153,51,49,0.08),rgba(186,81,73,0.18),rgba(255,255,255,0.04))] transition-opacity duration-200 ${unlockHoldVisualActive ? "opacity-100" : "opacity-0"}`}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1.5 overflow-hidden rounded-b-[24px] bg-black/6 dark:bg-white/8">
                <div
                  className={`h-full origin-left rounded-full bg-gradient-to-r from-accent via-[#C5544D] to-accent-hover shadow-[0_0_16px_rgba(153,51,49,0.28)] ${unlockPending ? "animate-pulse" : ""}`}
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
            <div className={`absolute inset-0 ${artworkPalette.glow}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(255,255,255,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_88%_14%,rgba(255,255,255,0.03),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(255,255,255,0.02),transparent_30%)]" />
            <span
              className={`absolute ${artworkPalette.secondary} ${artworkHoverClass} mix-blend-multiply dark:mix-blend-screen ${isLockedCard ? "saturate-0 opacity-80" : ""}`}
              style={echoArtworkStyle}
            />
            <span
              className={`absolute ${artworkPalette.primary} ${artworkHoverClass} mix-blend-multiply dark:mix-blend-screen ${isLockedCard ? "saturate-0 opacity-90" : ""}`}
              style={primaryArtworkStyle}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-end">
            {showLockedIndicator ? (
              <div className="flex h-full items-center justify-center">
                <LockKeyhole
                  className="h-5 w-5 text-content-muted/60 dark:text-white/30"
                  strokeWidth={2.1}
                />
              </div>
            ) : (
              <div className="max-w-[78%]">
                <h3
                  className={[
                    "line-clamp-2 text-[16px] font-extrabold leading-snug text-content-primary dark:text-white",
                    titleHoverClass,
                  ].join(" ")}
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