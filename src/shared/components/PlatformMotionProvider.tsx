"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useGraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import {
  PlatformMotionContext,
  type PlatformMotionContextValue,
  type PlatformMotionMode,
} from "@/shared/hooks/usePlatformMotion";

function resolvePlatformMotionMode(
  animationsEnabled: boolean,
  heavyAnimationsEnabled: boolean,
  graphicsProfile: ReturnType<typeof useGraphicsProfile>,
): PlatformMotionMode {
  if (!animationsEnabled || graphicsProfile.prefersReducedMotion) {
    return "none";
  }

  if (
    graphicsProfile.signals.saveData ||
    graphicsProfile.performanceScore <= -2 ||
    (graphicsProfile.signals.fpsEstimate !== null &&
      graphicsProfile.signals.fpsEstimate < 40)
  ) {
    return "none";
  }

  if (
    graphicsProfile.tier === "high" &&
    graphicsProfile.signals.pointerType === "fine" &&
    heavyAnimationsEnabled &&
    graphicsProfile.shouldUseHeavyEffects
  ) {
    return "full";
  }

  return "light";
}

export function PlatformMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const graphicsProfile = useGraphicsProfile({
    animationsEnabled,
    heavyAnimationsEnabled,
    enableFpsProbe: true,
  });

  const value = useMemo<PlatformMotionContextValue>(() => {
    const motionMode = resolvePlatformMotionMode(
      animationsEnabled,
      heavyAnimationsEnabled,
      graphicsProfile,
    );

    return {
      graphicsProfile,
      animationsEnabled,
      heavyAnimationsEnabled,
      motionMode,
      reducedMotion: motionMode === "none" ? "always" : "never",
      shouldAnimate: motionMode !== "none",
      shouldUseLightAnimations: motionMode !== "full",
      shouldUseHoverAnimations:
        motionMode !== "none" && graphicsProfile.signals.pointerType === "fine",
      entranceMode: motionMode === "full" ? "default" : "light",
      durationScale:
        motionMode === "none"
          ? 0
          : motionMode === "light"
            ? graphicsProfile.tier === "low"
              ? 0.78
              : 0.9
            : 1,
    };
  }, [animationsEnabled, graphicsProfile, heavyAnimationsEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motionMode = value.motionMode;
    root.dataset.motionTier = value.graphicsProfile.tier;
    root.dataset.motionPointer = value.graphicsProfile.signals.pointerType;
    root.dataset.motionSource = value.graphicsProfile.profileSource;

    return () => {
      delete root.dataset.motionMode;
      delete root.dataset.motionTier;
      delete root.dataset.motionPointer;
      delete root.dataset.motionSource;
    };
  }, [
    value.graphicsProfile.signals.pointerType,
    value.graphicsProfile.profileSource,
    value.graphicsProfile.tier,
    value.motionMode,
  ]);

  return (
    <PlatformMotionContext.Provider value={value}>
      <MotionConfig reducedMotion={value.reducedMotion}>
        {children}
      </MotionConfig>
    </PlatformMotionContext.Provider>
  );
}
