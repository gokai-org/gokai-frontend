import type { Variants } from "framer-motion";

/** Ease curve de marca: rápida aceleración, desaceleración suave */
export const EASE_BRAND = [0.22, 1, 0.36, 1] as const;

/** Fade + slide desde abajo (uso general) */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_BRAND },
  },
};

/** Fade + slide ligero para textos secundarios */
export const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_BRAND },
  },
};

/** Escala + fade para elementos destacados (botones, íconos) */
export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_BRAND },
  },
};

/** Contenedor que dispersa la animación en sus hijos */
export function staggerContainer(stagger = 0.09, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Item para grids de tarjetas — GPU-friendly (solo opacity + translate) */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_BRAND },
  },
};

/** Slide horizontal desde la izquierda */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: EASE_BRAND },
  },
};

/** Slide horizontal desde la derecha */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: EASE_BRAND },
  },
};

/**
 * Reveal para secciones completas — GPU-accelerated.
 * Usa solo opacity + translateY (transform) para evitar paint en CPU.
 */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 56, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_BRAND },
  },
};
