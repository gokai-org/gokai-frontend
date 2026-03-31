"use client";

import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

export const CARD_ANIMATION_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Devuelve props de animación para tarjetas de la biblioteca.
 *
 * Usa `whileInView` en lugar de `animate` para que solo las tarjetas
 * visibles en pantalla procesen su animación. Esto evita que framer-motion
 * programe cientos de animaciones simultáneas al montar una sección grande
 * (ej. 71 hiragana) lo que bloqueaba la UI en móvil.
 *
 * El stagger se limita a los primeros 14 items (máx 420 ms de delay).
 * Cards más allá del índice 14 entran en viewport sin delay adicional.
 */
export function useCardAnimation(
  index = 0,
  options: { useInView?: boolean } = {},
) {
  const { useInView = true } = options;
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  // Cap del stagger: máximo 14 × 30 ms = 420 ms
  const cappedDelay = Math.min(index, 14) * 0.03;

  const animationTarget = {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: cappedDelay,
      duration: heavyAnimationsEnabled ? 0.35 : 0.2,
      ease: CARD_ANIMATION_EASE,
    },
  };

  const motionProps = animationsEnabled
    ? {
        initial: {
          opacity: 0,
          y: heavyAnimationsEnabled ? 12 : 6,
          scale: heavyAnimationsEnabled ? 0.97 : 1,
        },
        ...(useInView
          ? {
              whileInView: animationTarget,
              viewport: { once: true, amount: 0.05 },
            }
          : { animate: animationTarget }),
      }
    : {};

  const hoverTransition = animationsEnabled
    ? "transition-all duration-300 ease-out"
    : "";

  const cardTransition = animationsEnabled ? "transition-all duration-200" : "";

  return { animationsEnabled, motionProps, hoverTransition, cardTransition };
}
