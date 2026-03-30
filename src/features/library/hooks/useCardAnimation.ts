"use client";

import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

export const CARD_ANIMATION_EASE = [0.22, 1, 0.36, 1] as const;

export function useCardAnimation(index = 0) {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  // ── Entrance  ──────────────────────────────────────────────
  const motionProps = animationsEnabled
    ? {
        initial: {
          opacity: 0,
          y: heavyAnimationsEnabled ? 16 : 8,
          scale: heavyAnimationsEnabled ? 0.985 : 1,
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: index * 0.06,
            duration: heavyAnimationsEnabled ? 0.5 : 0.28,
            ease: CARD_ANIMATION_EASE,
          },
        },
      }
    : {};

  const hoverTransition = animationsEnabled
    ? "transition-all duration-500 ease-out"
    : "";

  const cardTransition = animationsEnabled ? "transition-all duration-300" : "";

  return { animationsEnabled, motionProps, hoverTransition, cardTransition };
}
