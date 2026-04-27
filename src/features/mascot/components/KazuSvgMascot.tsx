"use client";

import { memo, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

import {
  kazuGlowVariants,
  kazuParticleVariants,
  kazuRootVariants,
  kazuSleepBubbleVariants,
} from "../constants/kazuMascot.motion";
import type { KazuSvgMascotProps } from "../types/kazuMascot.types";
import { useKazuSvgPaths } from "../utils/kazuSvgPaths";

const glowTransformStyle = {
  transformBox: "fill-box",
  transformOrigin: "50% 50%",
} as CSSProperties;

const shadowTransformStyle = {
  transformBox: "fill-box",
  transformOrigin: "50% 50%",
} as CSSProperties;

const poseTransformStyle = {
  transformBox: "fill-box",
  transformOrigin: "50% 62%",
} as CSSProperties;

const kazuShadowVariants: Variants = {
  idle: {
    opacity: [0.18, 0.12, 0.16, 0.18],
    scaleX: [1, 0.96, 0.99, 1],
    transition: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
  },
  focus: {
    opacity: [0.16, 0.12, 0.16],
    scaleX: [0.99, 0.96, 0.99],
    transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
  },
  correct: {
    opacity: [0.18, 0.08, 0.15],
    scaleX: [1, 0.92, 1],
    transition: { duration: 0.86, ease: "easeOut" },
  },
  wrong: {
    opacity: [0.18, 0.2, 0.14, 0.18],
    scaleX: [1, 1.04, 0.97, 1],
    transition: { duration: 0.74, ease: "easeInOut" },
  },
  reward: {
    opacity: [0.18, 0.08, 0.16],
    scaleX: [1, 0.9, 1],
    transition: { duration: 1.2, ease: "easeOut" },
  },
  sleep: {
    opacity: [0.14, 0.1, 0.14],
    scaleX: [0.98, 0.94, 0.98],
    transition: { duration: 6.4, repeat: Infinity, ease: "easeInOut" },
  },
  proud: {
    opacity: [0.18, 0.1, 0.16],
    scaleX: [1, 0.93, 1],
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  determined: {
    opacity: [0.18, 0.13, 0.17],
    scaleX: [1, 0.95, 1],
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  },
  concerned: {
    opacity: [0.2, 0.16, 0.2],
    scaleX: [1, 1.03, 1],
    transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
  },
  reduced: { opacity: 0.16, scaleX: 1 },
};

const kazuPoseVariants: Variants = {
  idle: {
    y: [0, -16, 0],
    rotate: [0, 0.95, -0.45, 0],
    scale: [1, 1.012, 1],
    transition: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
  },
  focus: {
    y: [0, 7, 0],
    rotate: [-1.2, -0.35, -1.2],
    scale: [1, 1.008, 1],
    transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
  },
  correct: {
    y: [0, -28, -8, 0],
    rotate: [0, 2, -0.6, 0],
    scale: [1, 1.032, 1.01, 1],
    transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
  },
  wrong: {
    x: [0, -8, 8, -3, 0],
    y: [0, 4, 0],
    rotate: [0, -1.4, 1.4, -0.45, 0],
    scale: [1, 0.99, 1],
    transition: { duration: 0.72, ease: "easeInOut" },
  },
  reward: {
    y: [0, -34, -12, 0],
    rotate: [0, 2.2, -0.8, 0],
    scale: [1, 1.04, 1.015, 1],
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
  sleep: {
    y: [0, 9, 0],
    rotate: [0, -0.8, 0],
    scale: [1, 0.995, 1],
    transition: { duration: 6.8, repeat: Infinity, ease: "easeInOut" },
  },
  proud: {
    y: [0, -22, -5, 0],
    rotate: [0, 1.4, -0.35, 0],
    scale: [1, 1.026, 1.006, 1],
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  determined: {
    y: [0, -14, 0],
    rotate: [-0.85, 0.45, -0.85],
    scale: [1, 1.014, 1],
    transition: { duration: 3.1, repeat: Infinity, ease: "easeInOut" },
  },
  concerned: {
    x: [0, -5, 5, 0],
    y: [0, 7, 0],
    rotate: [-1.2, 0.8, -1.2],
    scale: [1, 0.994, 1],
    transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
  },
  reduced: { x: 0, y: 0, rotate: 0, scale: 1 },
};

interface KazuStaticPathsProps {
  paths: readonly string[];
}

function KazuStaticPaths({ paths }: KazuStaticPathsProps) {
  if (paths.length === 0) return null;

  return (
    <g
      dangerouslySetInnerHTML={{
        __html: paths.join("\n"),
      }}
    />
  );
}

function KazuFallbackShape() {
  return (
    <g>
      <polygon points="627,166 842,374 760,932 627,1054 494,932 412,374" fill="#E2E2E2" />
      <polygon points="428,186 550,374 468,412" fill="#CFCFCF" />
      <polygon points="826,186 704,374 786,412" fill="#CFCFCF" />
    </g>
  );
}

export const KazuSvgMascot = memo(function KazuSvgMascot({
  state,
  size,
  className,
  reducedMotion,
}: KazuSvgMascotProps) {
  const prefersReducedMotion = useReducedMotion();
  const paths = useKazuSvgPaths();
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion ?? false;
  const animateState = shouldReduceMotion ? "reduced" : state;
  const dimension = size ?? "100%";

  return (
    <motion.svg
      viewBox="0 0 1254 1254"
      width={dimension}
      height={dimension}
      role="img"
      aria-label="Kazu, mascota de GOKAI"
      className={className}
      initial={false}
    >
      <defs>
        <radialGradient id="kazu-glow-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F7D77A" stopOpacity="0.48" />
          <stop offset="48%" stopColor="#FFB84D" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF8A00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="kazu-shadow-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#111827" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#111827" stopOpacity="0" />
        </radialGradient>
        <filter id="kazu-soft-glow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="18" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="kazu-particle-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="particleBlur" />
          <feMerge>
            <feMergeNode in="particleBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.g id="kazu-root" variants={kazuRootVariants} animate={animateState}>
        <motion.ellipse
          cx="627"
          cy="1112"
          rx="300"
          ry="54"
          fill="url(#kazu-shadow-gradient)"
          variants={kazuShadowVariants}
          style={shadowTransformStyle}
        />
        <motion.ellipse
          cx="627"
          cy="640"
          rx="446"
          ry="472"
          fill="url(#kazu-glow-gradient)"
          filter="url(#kazu-soft-glow)"
          style={glowTransformStyle}
          variants={kazuGlowVariants}
        />

        <motion.g id="kazu-cohesive-pose" variants={kazuPoseVariants} style={poseTransformStyle}>
          <g id="kazu-static-base">
            {paths.length > 0 ? <KazuStaticPaths paths={paths} /> : <KazuFallbackShape />}
          </g>

          <motion.g
            id="kazu-reward-particles"
            variants={kazuParticleVariants}
            filter="url(#kazu-particle-glow)"
            aria-hidden="true"
          >
            <circle cx="444" cy="414" r="8" fill="#F7D77A" opacity="0.72" />
            <circle cx="802" cy="374" r="6" fill="#FFFFFF" opacity="0.78" />
            <circle cx="852" cy="534" r="9" fill="#FFB84D" opacity="0.58" />
            <circle cx="388" cy="598" r="5" fill="#FFFFFF" opacity="0.64" />
            <circle cx="694" cy="252" r="5" fill="#F7D77A" opacity="0.5" />
          </motion.g>

          <motion.g id="kazu-sleep-bubble" variants={kazuSleepBubbleVariants} aria-hidden="true">
            <circle cx="852" cy="316" r="24" fill="#FFFFFF" opacity="0.34" />
            <circle cx="886" cy="276" r="14" fill="#FFFFFF" opacity="0.26" />
            <circle cx="912" cy="246" r="8" fill="#FFFFFF" opacity="0.2" />
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.svg>
  );
});

KazuSvgMascot.displayName = "KazuSvgMascot";

export default KazuSvgMascot;
