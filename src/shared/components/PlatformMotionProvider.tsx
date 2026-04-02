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
    graphicsProfile.tier === "high" &&
    graphicsProfile.signals.pointerType === "fine" &&
    heavyAnimationsEnabled
  ) {
    return "full";
  }

  return "light";
}

export function PlatformMotionProvider({ children }: { children: React.ReactNode }) {
  const { animationsEnabled, heavyAnimationsEnabled } = useAnimationPreferences();
  const graphicsProfile = useGraphicsProfile({
    animationsEnabled,
    heavyAnimationsEnabled,
    enableFpsProbe: process.env.NODE_ENV !== "production",
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
      reducedMotion: motionMode === "full" ? "never" : "always",
      shouldAnimate: motionMode !== "none",
      shouldUseLightAnimations: motionMode !== "full",
      shouldUseHoverAnimations:
        motionMode === "full" && graphicsProfile.signals.pointerType === "fine",
      entranceMode: motionMode === "full" ? "default" : "light",
      durationScale: motionMode === "none" ? 0 : motionMode === "light" ? 0.72 : 1,
    };
  }, [animationsEnabled, graphicsProfile, heavyAnimationsEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motionMode = value.motionMode;
    root.dataset.motionTier = value.graphicsProfile.tier;
    root.dataset.motionPointer = value.graphicsProfile.signals.pointerType;

    return () => {
      delete root.dataset.motionMode;
      delete root.dataset.motionTier;
      delete root.dataset.motionPointer;
    };
  }, [value.graphicsProfile.signals.pointerType, value.graphicsProfile.tier, value.motionMode]);

  return (
    <PlatformMotionContext.Provider value={value}>
      <MotionConfig reducedMotion={value.reducedMotion}>{children}</MotionConfig>
    </PlatformMotionContext.Provider>
  );
}