"use client";

import { useMemo } from "react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";

export interface GrammarBoardQualityProfile {
  shouldAnimateBoardEntrance: boolean;
  shouldAnimateBoardZoom: boolean;
  shouldUseHoverMotion: boolean;
  shouldUseHeavyBoardMotion: boolean;
  boardRevealOffset: number;
  boardRevealScale: number;
  boardExitScale: number;
  boardZoomScaleIntensity: number;
  boardZoomBlurPx: number;
  boardZoomSaturate: number;
  boardZoomDurationMs: number;
  boardZoomOutDurationMs: number;
}

export function useGrammarBoardQuality(): GrammarBoardQualityProfile {
  const platformMotion = usePlatformMotion();

  return useMemo(() => {
    const { graphicsProfile, motionMode, shouldAnimate, shouldUseHoverAnimations, durationScale } =
      platformMotion;
    const coarsePointer = graphicsProfile.signals.pointerType === "coarse";
    const lowTier = graphicsProfile.tier === "low";
    const shouldUseHeavyBoardMotion =
      motionMode === "full" && graphicsProfile.shouldUseHeavyEffects;
    const shouldAnimateBoardZoom =
      motionMode === "full" || (motionMode === "light" && !coarsePointer && !lowTier);

    return {
      shouldAnimateBoardEntrance: shouldAnimate,
      shouldAnimateBoardZoom,
      shouldUseHoverMotion:
        shouldUseHoverAnimations && !coarsePointer && motionMode !== "none",
      shouldUseHeavyBoardMotion,
      boardRevealOffset: !shouldAnimate ? 0 : shouldUseHeavyBoardMotion ? 20 : 8,
      boardRevealScale: shouldUseHeavyBoardMotion ? 0.985 : 1,
      boardExitScale: shouldUseHeavyBoardMotion ? 0.992 : 1,
      boardZoomScaleIntensity: shouldUseHeavyBoardMotion ? 1 : 0.72,
      boardZoomBlurPx: shouldUseHeavyBoardMotion ? 10 : 0,
      boardZoomSaturate: shouldUseHeavyBoardMotion ? 1.04 : 1,
      boardZoomDurationMs: shouldAnimateBoardZoom
        ? Math.max(
            shouldUseHeavyBoardMotion ? 420 : 260,
            Math.round(graphicsProfile.cameraTransitionDuration * durationScale),
          )
        : 0,
      boardZoomOutDurationMs: shouldAnimateBoardZoom
        ? Math.max(
            shouldUseHeavyBoardMotion ? 320 : 220,
            Math.round(graphicsProfile.cameraRestoreDuration * durationScale),
          )
        : 0,
    };
  }, [platformMotion]);
}