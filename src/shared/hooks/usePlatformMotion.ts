import { createContext, useContext } from "react";
import type { GraphicsProfile } from "@/shared/hooks/useGraphicsProfile";

export type PlatformMotionMode = "none" | "light" | "full";

export interface PlatformMotionContextValue {
  graphicsProfile: GraphicsProfile;
  animationsEnabled: boolean;
  heavyAnimationsEnabled: boolean;
  motionMode: PlatformMotionMode;
  reducedMotion: "always" | "never";
  shouldAnimate: boolean;
  shouldUseLightAnimations: boolean;
  shouldUseHoverAnimations: boolean;
  entranceMode: "default" | "light";
  durationScale: number;
}

const FALLBACK_GRAPHICS_PROFILE: GraphicsProfile = {
  tier: "low",
  signals: {
    width: 1280,
    height: 800,
    devicePixelRatio: 1,
    hardwareConcurrency: null,
    deviceMemory: null,
    pointerType: "unknown",
    prefersReducedMotion: false,
    fpsEstimate: null,
  },
  prefersReducedMotion: false,
  shouldAnimateBackground: false,
  shouldUseParallax: false,
  shouldUsePulse: false,
  shouldUseHeavyEffects: false,
  atmosphereLayerCount: 2,
  glowStrength: 0.72,
  shadowStrength: 0.8,
  parallaxStrength: 0,
  zoomResponseStrength: 0,
  cameraTransitionDuration: 280,
  cameraRestoreDuration: 240,
  interactionSmoothingMs: 52,
  idleSmoothingMs: 78,
  viewportPositionEpsilon: 0.2,
  viewportZoomEpsilon: 0.002,
  overscanBase: 18,
  overscanZoomFactor: 12,
  maxBackgroundEffects: 2,
};

const FALLBACK_MOTION_CONTEXT: PlatformMotionContextValue = {
  graphicsProfile: FALLBACK_GRAPHICS_PROFILE,
  animationsEnabled: true,
  heavyAnimationsEnabled: true,
  motionMode: "light",
  reducedMotion: "always",
  shouldAnimate: true,
  shouldUseLightAnimations: true,
  shouldUseHoverAnimations: false,
  entranceMode: "light",
  durationScale: 0.72,
};

export const PlatformMotionContext = createContext<PlatformMotionContextValue | null>(null);

export function usePlatformMotion() {
  return useContext(PlatformMotionContext) ?? FALLBACK_MOTION_CONTEXT;
}