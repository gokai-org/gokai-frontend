import type { Variants } from "framer-motion";

const premiumEase = [0.22, 1, 0.36, 1] as [number, number, number, number];
const softEase = [0.45, 0, 0.25, 1] as [number, number, number, number];

export const kazuRootVariants: Variants = {
  idle: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  focus: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: premiumEase },
  },
  correct: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.42, ease: premiumEase },
  },
  wrong: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.42, ease: softEase },
  },
  reward: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.42, ease: premiumEase },
  },
  sleep: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  proud: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.42, ease: premiumEase },
  },
  determined: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: premiumEase },
  },
  concerned: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: softEase },
  },
  reduced: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
};

export const kazuAccentVariants: Variants = {
  idle: {
    opacity: 1,
    scale: [1, 1.006, 1],
    transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
  },
  focus: { opacity: 1, scale: 1.01, transition: { duration: 0.42, ease: premiumEase } },
  correct: {
    opacity: [1, 0.92, 1],
    scale: [1, 1.035, 1],
    transition: { duration: 0.68, ease: premiumEase },
  },
  wrong: {
    opacity: [1, 0.82, 1],
    scale: [1, 0.992, 1],
    transition: { duration: 0.7, ease: softEase },
  },
  reward: {
    opacity: [1, 0.86, 1],
    scale: [1, 1.055, 1.01, 1],
    transition: { duration: 1.08, ease: premiumEase },
  },
  sleep: { opacity: 0.82, scale: 0.996, transition: { duration: 0.7, ease: premiumEase } },
  proud: {
    opacity: [1, 0.94, 1],
    scale: [1, 1.025, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  determined: {
    opacity: 1,
    scale: [1, 1.016, 1],
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  concerned: {
    opacity: [1, 0.9, 1],
    scale: [1, 0.994, 1],
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  reduced: { opacity: 1, scale: 1 },
};

export const kazuEyesVariants: Variants = {
  idle: {
    scaleY: [1, 1, 0.12, 1, 1],
    transition: {
      duration: 0.42,
      times: [0, 0.28, 0.42, 0.58, 1],
      repeat: Infinity,
      repeatDelay: 5.2,
      ease: "easeInOut",
    },
  },
  focus: { scaleY: 0.9, transition: { duration: 0.42, ease: premiumEase } },
  correct: { scaleY: [1, 0.82, 1], transition: { duration: 0.58 } },
  wrong: { scaleY: [1, 0.82, 1], transition: { duration: 0.62 } },
  reward: { scaleY: [1, 0.75, 1], transition: { duration: 0.7 } },
  sleep: { scaleY: 0.18, transition: { duration: 0.7, ease: premiumEase } },
  proud: {
    scaleY: [1, 1, 0.16, 1],
    transition: {
      duration: 0.48,
      times: [0, 0.34, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 3.8,
      ease: "easeInOut",
    },
  },
  determined: { scaleY: 0.88, transition: { duration: 0.42, ease: premiumEase } },
  concerned: {
    scaleY: [1, 0.7, 1],
    transition: { duration: 1.8, repeat: Infinity, repeatDelay: 1.2 },
  },
  reduced: { scaleY: 1 },
};

export const kazuGlowVariants: Variants = {
  idle: { opacity: 0.08, scale: 1, transition: { duration: 0.8 } },
  focus: { opacity: 0.06, scale: 0.98, transition: { duration: 0.8 } },
  correct: {
    opacity: [0.08, 0.42, 0.1],
    scale: [1, 1.06, 1],
    transition: { duration: 0.9, ease: premiumEase },
  },
  wrong: {
    opacity: [0.08, 0.18, 0.08],
    scale: [1, 1.015, 1],
    transition: { duration: 0.75, ease: softEase },
  },
  reward: {
    opacity: [0.1, 0.58, 0.16],
    scale: [1, 1.18, 1.04],
    transition: { duration: 1.35, ease: premiumEase },
  },
  sleep: { opacity: 0.03, scale: 0.96, transition: { duration: 1 } },
  proud: {
    opacity: [0.12, 0.28, 0.12],
    scale: [1, 1.08, 1],
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  determined: {
    opacity: 0.16,
    scale: [1, 1.025, 1],
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  },
  concerned: {
    opacity: [0.08, 0.18, 0.08],
    scale: [0.98, 1.02, 0.98],
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
  reduced: { opacity: 0.08, scale: 1 },
};

export const kazuParticleVariants: Variants = {
  idle: { opacity: 0, scale: 0.8 },
  focus: { opacity: 0, scale: 0.8 },
  correct: { opacity: 0, scale: 0.8 },
  wrong: { opacity: 0, scale: 0.8 },
  reward: {
    opacity: [0, 0.55, 0],
    scale: [0.7, 1, 0.85],
    y: [0, -20, -36],
    transition: { duration: 1.25, ease: premiumEase },
  },
  sleep: { opacity: 0, scale: 0.8 },
  proud: {
    opacity: [0, 0.32, 0],
    scale: [0.75, 1, 0.9],
    y: [0, -14, -26],
    transition: { duration: 2.2, repeat: Infinity, repeatDelay: 1.6, ease: premiumEase },
  },
  determined: { opacity: 0, scale: 0.8 },
  concerned: { opacity: 0, scale: 0.8 },
  reduced: { opacity: 0, scale: 0.8 },
};

export const kazuSleepBubbleVariants: Variants = {
  idle: { opacity: 0, y: 0, scale: 0.9 },
  focus: { opacity: 0, y: 0, scale: 0.9 },
  correct: { opacity: 0, y: 0, scale: 0.9 },
  wrong: { opacity: 0, y: 0, scale: 0.9 },
  reward: { opacity: 0, y: 0, scale: 0.9 },
  sleep: {
    opacity: [0, 0.38, 0],
    y: [0, -18, -36],
    scale: [0.9, 1, 0.94],
    transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
  },
  proud: { opacity: 0, y: 0, scale: 0.9 },
  determined: { opacity: 0, y: 0, scale: 0.9 },
  concerned: { opacity: 0, y: 0, scale: 0.9 },
  reduced: { opacity: 0, y: 0, scale: 0.9 },
};
