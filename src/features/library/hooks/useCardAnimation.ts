"use client";

import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";

export const CARD_ANIMATION_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Devuelve props de animación para tarjetas de la biblioteca.
 *
 * Usa `whileInView` en lugar de `animate` para que solo las tarjetas
 * visibles en pantalla procesen su animación. La entrada se limita a
 * opacidad y desplazamiento vertical para evitar sensación de zoom o
 * jitter al hacer scroll en desktop.
 *
 * El stagger se limita a los primeros 14 items (máx 420 ms de delay).
 * Cards más allá del índice 14 entran en viewport sin delay adicional.
 */
export function useCardAnimation(
  index = 0,
  options: { useInView?: boolean } = {},
) {
  const { useInView = true } = options;
  const platformMotion = usePlatformMotion();
  const animationsEnabled = platformMotion.shouldAnimate;
  const heavyAnimationsEnabled = platformMotion.motionMode === "full";

  // Cap del stagger: máximo 14 × 30 ms = 420 ms
  const cappedDelay = Math.min(index, 14) * 0.03;

  const animationTarget = {
    opacity: 1,
    y: 0,
    transition: {
      delay: cappedDelay,
      duration:
        (heavyAnimationsEnabled ? 0.35 : 0.2) * platformMotion.durationScale,
      ease: CARD_ANIMATION_EASE,
    },
  };

  const motionProps = animationsEnabled
    ? {
        initial: {
          opacity: 0,
          y: heavyAnimationsEnabled ? 12 : 6,
        },
        ...(useInView
          ? {
              whileInView: animationTarget,
              viewport: { once: true, amount: 0.05 },
            }
          : { animate: animationTarget }),
      }
    : {};

  const hoverTransition = platformMotion.shouldUseHoverAnimations
    ? "transition-[transform,opacity,color,background-color,border-color,box-shadow,filter] duration-300 ease-out"
    : "";

  const cardTransition = animationsEnabled
    ? "transition-[transform,opacity,color,background-color,border-color,box-shadow,filter] duration-200 ease-out"
    : "";

  return { animationsEnabled, motionProps, hoverTransition, cardTransition };
}
