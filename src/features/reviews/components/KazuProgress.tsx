"use client";

import { memo, useMemo, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

import type { KazuMascotState } from "@/features/mascot";
import { KAZU_PATH_REVIEW_TYPE_BY_INDEX } from "@/features/mascot/constants/kazuMascot.svg";
import { useKazuSvgPaths } from "@/features/mascot/utils/kazuSvgPaths";
import type { KazuProgressZone } from "../hooks/useReviewProgress";

type ReviewMascotMotionState =
  | "idle"
  | "focus"
  | "reward"
  | "determined"
  | "concerned"
  | "reduced";

const premiumEase = [0.22, 1, 0.36, 1] as [number, number, number, number];
const softEase = [0.45, 0, 0.25, 1] as [number, number, number, number];

const rootTransformStyle = {
  transformBox: "fill-box",
  transformOrigin: "50% 58%",
} as CSSProperties;

const shadowTransformStyle = {
  transformBox: "fill-box",
  transformOrigin: "50% 50%",
} as CSSProperties;

const rootVariants: Variants = {
  idle: {
    x: 0,
    y: [0, -18, 0],
    rotate: [0, 1, -0.45, 0],
    scale: [1, 1.012, 1],
    transition: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
  },
  focus: {
    x: 0,
    y: [0, 8, 0],
    rotate: [-1.25, -0.35, -1.25],
    scale: [1, 1.008, 1],
    transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
  },
  determined: {
    x: 0,
    y: [0, -15, 0],
    rotate: [-0.85, 0.45, -0.85],
    scale: [1, 1.014, 1],
    transition: { duration: 3.1, repeat: Infinity, ease: "easeInOut" },
  },
  concerned: {
    x: [0, -5, 5, 0],
    y: [0, 8, 0],
    rotate: [-1.25, 0.8, -1.25],
    scale: [1, 0.994, 1],
    transition: { duration: 2.6, repeat: Infinity, ease: softEase },
  },
  reward: {
    x: 0,
    y: [0, -36, -12, 0],
    rotate: [0, 2.25, -0.8, 0],
    scale: [1, 1.042, 1.015, 1],
    transition: { duration: 1.2, ease: premiumEase },
  },
  reduced: { x: 0, y: 0, rotate: 0, scale: 1 },
};

const shadowVariants: Variants = {
  idle: {
    opacity: [0.1, 0.075, 0.095, 0.1],
    scaleX: [1, 0.95, 0.98, 1],
    transition: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
  },
  focus: {
    opacity: [0.09, 0.08, 0.09],
    scaleX: [0.98, 0.96, 0.98],
    transition: { duration: 4.4, repeat: Infinity, ease: "easeInOut" },
  },
  determined: {
    opacity: [0.11, 0.08, 0.1],
    scaleX: [1, 0.94, 0.98, 1],
    transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
  },
  concerned: {
    opacity: [0.12, 0.1, 0.13, 0.12],
    scaleX: [1, 1.04, 0.97, 1],
    transition: { duration: 2.8, repeat: Infinity, ease: softEase },
  },
  reward: {
    opacity: [0.1, 0.065, 0.09, 0.1],
    scaleX: [1, 0.92, 0.98, 1],
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  reduced: { opacity: 0.1, scaleX: 1 },
};

const sparkleVariants: Variants = {
  idle: {
    opacity: [0.08, 0.2, 0.08],
    scale: [0.9, 1.04, 0.9],
    y: [0, -5, 0],
    transition: { duration: 5.6, repeat: Infinity, ease: "easeInOut" },
  },
  focus: {
    opacity: [0.04, 0.12, 0.04],
    scale: [0.86, 1, 0.86],
    y: [0, -3, 0],
    transition: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
  },
  determined: {
    opacity: [0.06, 0.16, 0.06],
    scale: [0.86, 1.06, 0.86],
    y: [0, -7, 0],
    transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
  },
  concerned: {
    opacity: [0.04, 0.1, 0.04],
    scale: [0.82, 0.98, 0.82],
    y: [0, -4, 0],
    transition: { duration: 3.4, repeat: Infinity, ease: softEase },
  },
  reward: {
    opacity: [0.12, 0.38, 0.12],
    scale: [0.84, 1.18, 0.9],
    y: [0, -14, 0],
    transition: { duration: 2.8, repeat: Infinity, ease: premiumEase },
  },
  reduced: { opacity: 0, scale: 0.9, y: 0 },
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

function hexToRgb(hex: string) {
  const normalizedHex = hex.replace("#", "");
  if (normalizedHex.length !== 6) return null;

  return {
    r: Number.parseInt(normalizedHex.slice(0, 2), 16),
    g: Number.parseInt(normalizedHex.slice(2, 4), 16),
    b: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function toHexChannel(value: number) {
  return Math.round(value).toString(16).padStart(2, "0");
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`;
}

function mixHexColors(from: string, to: string, amount: number) {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);

  if (!fromRgb || !toRgb) return amount > 0.5 ? to : from;

  const mixChannel = (start: number, end: number) =>
    start + (end - start) * amount;

  return rgbToHex(
    mixChannel(fromRgb.r, toRgb.r),
    mixChannel(fromRgb.g, toRgb.g),
    mixChannel(fromRgb.b, toRgb.b),
  );
}

function getPathFill(pathMarkup: string) {
  return pathMarkup.match(/fill="([^"]+)"/)?.[1] ?? "#D4D4D4";
}

function getSolidGrayFill(pathMarkup: string) {
  const activeFill = getPathFill(pathMarkup);
  const activeRgb = hexToRgb(activeFill);

  if (!activeRgb) return "#CFCFCF";

  const luminance =
    (0.2126 * activeRgb.r + 0.7152 * activeRgb.g + 0.0722 * activeRgb.b) / 255;
  const gray = 82 + luminance * 158;

  return rgbToHex(gray, gray, gray);
}

function tintPath(pathMarkup: string, progress: number) {
  const activeFill = getPathFill(pathMarkup);
  const mutedFill = getSolidGrayFill(pathMarkup);
  const vitality = clamp(progress / 100, 0.22, 1);
  const fill = mixHexColors(mutedFill, activeFill, vitality);
  const styledPath = pathMarkup.replace(/fill="[^"]+"/, `fill="${fill}"`);

  return styledPath.replace(
    /\/>$/,
    ` style="transition: fill 680ms cubic-bezier(0.22, 1, 0.36, 1);"/>`,
  );
}

function getMotionState(
  state: KazuMascotState,
  shouldReduceMotion: boolean,
  pendingReviewCount: number,
): ReviewMascotMotionState {
  if (shouldReduceMotion) return "reduced";
  if (state === "reward" || state === "proud") return "reward";
  if (state === "focus") return "focus";
  if (state === "concerned" || pendingReviewCount >= 8) return "concerned";
  if (state === "determined" || pendingReviewCount >= 4) return "determined";
  return "idle";
}

interface KazuProgressStaticPathsProps {
  paths: readonly string[];
}

function KazuProgressStaticPaths({ paths }: KazuProgressStaticPathsProps) {
  if (paths.length === 0) return null;

  return (
    <g
      dangerouslySetInnerHTML={{
        __html: paths.join("\n"),
      }}
    />
  );
}

function KazuProgressFallbackShape() {
  return (
    <g>
      <polygon points="627,166 842,374 760,932 627,1054 494,932 412,374" fill="#E2E2E2" />
      <polygon points="428,186 550,374 468,412" fill="#CFCFCF" />
      <polygon points="826,186 704,374 786,412" fill="#CFCFCF" />
    </g>
  );
}

interface KazuProgressProps {
  zones: KazuProgressZone[];
  pendingReviewCount: number;
  state?: KazuMascotState;
  reducedMotion?: boolean;
  className?: string;
}

export const KazuProgress = memo(function KazuProgress({
  zones,
  pendingReviewCount,
  state = "idle",
  reducedMotion,
  className,
}: KazuProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const paths = useKazuSvgPaths();
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion ?? false;
  const zoneState = useMemo(
    () => new Map(zones.map((zone) => [zone.id, zone.progress] as const)),
    [zones],
  );
  const mascotState = getMotionState(state, shouldReduceMotion, pendingReviewCount);
  const tintedPaths = useMemo(() => {
    if (paths.length === 0) return [];

    return paths.map((path, index) => {
      const reviewType = KAZU_PATH_REVIEW_TYPE_BY_INDEX.get(index);
      const progress = reviewType ? (zoneState.get(reviewType) ?? 64) : 64;

      return tintPath(path, progress);
    });
  }, [paths, zoneState]);

  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-full max-w-[520px]">
        <motion.svg
          viewBox="0 0 1254 1254"
          role="img"
          aria-label="Kazu muestra tu estado actual de constancia"
          className="relative z-10 h-full w-full drop-shadow-[0_22px_34px_rgba(31,26,48,0.13)]"
          initial={false}
        >
          <defs>
            <filter id="kazu-progress-sparkle-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="sparkleBlur" />
              <feMerge>
                <feMergeNode in="sparkleBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.ellipse
            cx="627"
            cy="1092"
            rx="282"
            ry="48"
            fill="#111827"
            variants={shadowVariants}
            animate={mascotState}
            style={shadowTransformStyle}
          />
          <motion.g
            variants={sparkleVariants}
            animate={mascotState}
            filter="url(#kazu-progress-sparkle-glow)"
            aria-hidden="true"
          >
            <circle cx="430" cy="360" r="7" fill="#F7D77A" />
            <circle cx="838" cy="438" r="5" fill="#FFFFFF" />
            <circle cx="790" cy="270" r="4" fill="#FFB84D" />
          </motion.g>
          <motion.g variants={rootVariants} animate={mascotState} style={rootTransformStyle}>
            <g id="kazu-progress-static-base">
              {tintedPaths.length > 0 ? (
                <KazuProgressStaticPaths paths={tintedPaths} />
              ) : (
                <KazuProgressFallbackShape />
              )}
            </g>

          </motion.g>
        </motion.svg>
      </div>
    </div>
  );
});

KazuProgress.displayName = "KazuProgress";