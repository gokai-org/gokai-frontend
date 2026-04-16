"use client";

import { useMemo } from "react";
import type { GraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import type {
  WritingBoardCameraProfile,
  WritingBoardQualityProfile,
  WritingBoardQualityTier,
} from "../types";

function buildCameraProfile(
  width: number,
  tier: WritingBoardQualityTier,
  graphicsProfile: GraphicsProfile,
): WritingBoardCameraProfile {
  const baseTransition = graphicsProfile.cameraTransitionDuration;
  const baseRestore = graphicsProfile.cameraRestoreDuration;
  const drawerZoomBoost = width < 768 ? 0.34 : width < 1200 ? 0.3 : 0.28;

  if (width < 768) {
    return tier === "high"
      ? {
          overviewZoom: 1.14,
          focusZoom: 1.58,
          drawerFocusZoom: 1.58 + drawerZoomBoost,
          initialDuration: baseTransition,
          focusDuration: baseTransition + 40,
          restoreDuration: baseRestore + 30,
        }
      : tier === "medium"
        ? {
            overviewZoom: 1.08,
            focusZoom: 1.48,
            drawerFocusZoom: 1.48 + drawerZoomBoost,
            initialDuration: baseTransition - 20,
            focusDuration: baseTransition + 20,
            restoreDuration: baseRestore + 20,
          }
        : {
            overviewZoom: 1.02,
            focusZoom: 1.34,
            drawerFocusZoom: 1.34 + drawerZoomBoost,
            initialDuration: baseTransition - 20,
            focusDuration: baseTransition + 10,
            restoreDuration: baseRestore + 10,
          };
  }

  if (width < 1200) {
    return tier === "high"
      ? {
          overviewZoom: 1.02,
          focusZoom: 1.42,
          drawerFocusZoom: 1.42 + drawerZoomBoost,
          initialDuration: baseTransition - 20,
          focusDuration: baseTransition + 20,
          restoreDuration: baseRestore + 20,
        }
      : tier === "medium"
        ? {
            overviewZoom: 0.96,
            focusZoom: 1.34,
            drawerFocusZoom: 1.34 + drawerZoomBoost,
            initialDuration: baseTransition - 20,
            focusDuration: baseTransition + 10,
            restoreDuration: baseRestore + 10,
          }
        : {
            overviewZoom: 0.9,
            focusZoom: 1.22,
            drawerFocusZoom: 1.22 + drawerZoomBoost,
            initialDuration: baseTransition - 20,
            focusDuration: baseTransition,
            restoreDuration: baseRestore,
          };
  }

  return tier === "high"
    ? {
        overviewZoom: 0.98,
        focusZoom: 1.36,
        drawerFocusZoom: 1.36 + drawerZoomBoost,
        initialDuration: baseTransition - 20,
        focusDuration: baseTransition,
        restoreDuration: baseRestore,
      }
    : tier === "medium"
      ? {
          overviewZoom: 0.92,
          focusZoom: 1.26,
          drawerFocusZoom: 1.26 + drawerZoomBoost,
          initialDuration: baseTransition - 20,
          focusDuration: baseTransition,
          restoreDuration: baseRestore,
        }
      : {
          overviewZoom: 0.86,
          focusZoom: 1.16,
          drawerFocusZoom: 1.16 + drawerZoomBoost,
          initialDuration: baseTransition - 20,
          focusDuration: baseTransition,
          restoreDuration: baseRestore,
        };
}

export function createWritingBoardQualityProfile(
  graphicsProfile: GraphicsProfile,
): WritingBoardQualityProfile {
  const tier = graphicsProfile.tier;
  const signals = graphicsProfile.signals;

  return {
    tier,
    signals,
    graphics: graphicsProfile,
    allowMotion:
      graphicsProfile.shouldAnimateBackground ||
      graphicsProfile.shouldUseParallax ||
      graphicsProfile.shouldUsePulse,
    allowHeavyMotion: graphicsProfile.shouldUseHeavyEffects,
    background: {
      showGlimmer: graphicsProfile.maxBackgroundEffects >= 3,
      showDust: graphicsProfile.maxBackgroundEffects >= 4,
      showFarAtmosphere: graphicsProfile.atmosphereLayerCount >= 3,
      showMidAtmosphere: graphicsProfile.atmosphereLayerCount >= 2,
      showNearAtmosphere: graphicsProfile.atmosphereLayerCount >= 1,
      showRing: graphicsProfile.maxBackgroundEffects >= 3,
      animateTwinkle: graphicsProfile.shouldAnimateBackground,
      animateBreathe:
        graphicsProfile.shouldAnimateBackground &&
        graphicsProfile.shouldUseHeavyEffects,
      parallaxStrength: graphicsProfile.shouldUseParallax
        ? graphicsProfile.parallaxStrength
        : 0,
      zoomStrength: graphicsProfile.shouldUseParallax
        ? graphicsProfile.zoomResponseStrength
        : 0,
      overscanBase: graphicsProfile.overscanBase,
      overscanZoomFactor: graphicsProfile.overscanZoomFactor,
      interactionSmoothingMs: graphicsProfile.interactionSmoothingMs,
      idleSmoothingMs: graphicsProfile.idleSmoothingMs,
      epsilonPosition: graphicsProfile.viewportPositionEpsilon,
      epsilonZoom: graphicsProfile.viewportZoomEpsilon,
    },
    node: {
      shouldUsePulse: graphicsProfile.shouldUsePulse,
      showOrbitRings: false,
      glowScale: graphicsProfile.glowStrength,
      shadowScale: graphicsProfile.shadowStrength,
    },
    edge:
      tier === "high"
        ? {
            widthScale: 1.04,
            opacityScale: 1,
            showLockedDash: true,
            curvature: 0.36,
          }
        : tier === "medium"
          ? {
              widthScale: 0.96,
              opacityScale: 0.92,
              showLockedDash: true,
              curvature: 0.32,
            }
          : {
              widthScale: 0.88,
              opacityScale: 0.86,
              showLockedDash: false,
              curvature: 0.28,
            },
    camera: buildCameraProfile(signals.width, tier, graphicsProfile),
  };
}

export function useWritingBoardQuality(graphicsProfile: GraphicsProfile) {
  return useMemo(
    () => createWritingBoardQualityProfile(graphicsProfile),
    [graphicsProfile],
  );
}
