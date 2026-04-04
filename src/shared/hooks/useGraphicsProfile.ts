"use client";

import { useEffect, useMemo, useState } from "react";

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
};

export type GraphicsQualityTier = "low" | "medium" | "high";

export interface GraphicsQualitySignals {
  width: number;
  height: number;
  devicePixelRatio: number;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  pointerType: "coarse" | "fine" | "unknown";
  prefersReducedMotion: boolean;
  fpsEstimate: number | null;
}

export interface GraphicsProfile {
  tier: GraphicsQualityTier;
  signals: GraphicsQualitySignals;
  prefersReducedMotion: boolean;
  shouldAnimateBackground: boolean;
  shouldUseParallax: boolean;
  shouldUsePulse: boolean;
  shouldUseHeavyEffects: boolean;
  atmosphereLayerCount: 1 | 2 | 3;
  glowStrength: number;
  shadowStrength: number;
  parallaxStrength: number;
  zoomResponseStrength: number;
  cameraTransitionDuration: number;
  cameraRestoreDuration: number;
  interactionSmoothingMs: number;
  idleSmoothingMs: number;
  viewportPositionEpsilon: number;
  viewportZoomEpsilon: number;
  overscanBase: number;
  overscanZoomFactor: number;
  maxBackgroundEffects: number;
}

export interface UseGraphicsProfileOptions {
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
  enableFpsProbe?: boolean;
}

const DEFAULT_GRAPHICS_SIGNALS: GraphicsQualitySignals = {
  width: 1280,
  height: 800,
  devicePixelRatio: 1,
  hardwareConcurrency: null,
  deviceMemory: null,
  pointerType: "unknown",
  prefersReducedMotion: false,
  fpsEstimate: null,
};

function getPointerType() {
  if (typeof window === "undefined") {
    return "unknown" as const;
  }

  if (window.matchMedia("(pointer: fine)").matches) {
    return "fine" as const;
  }

  if (window.matchMedia("(pointer: coarse)").matches) {
    return "coarse" as const;
  }

  return "unknown" as const;
}

function getInitialSignals(): GraphicsQualitySignals {
  return { ...DEFAULT_GRAPHICS_SIGNALS };
}

function readSignals(previous: GraphicsQualitySignals): GraphicsQualitySignals {
  if (typeof window === "undefined") {
    return previous;
  }

  const navigatorWithMemory = navigator as NavigatorWithMemory;

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency:
      typeof navigator.hardwareConcurrency === "number"
        ? navigator.hardwareConcurrency
        : null,
    deviceMemory:
      typeof navigatorWithMemory.deviceMemory === "number"
        ? navigatorWithMemory.deviceMemory
        : null,
    pointerType: getPointerType(),
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    fpsEstimate: previous.fpsEstimate,
  };
}

function bindMediaQueryListener(query: MediaQueryList, listener: () => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }

  query.addListener(listener);
  return () => query.removeListener(listener);
}

function resolveQualityTier(
  signals: GraphicsQualitySignals,
  animationsEnabled: boolean,
  heavyAnimationsEnabled: boolean,
): GraphicsQualityTier {
  if (!animationsEnabled || signals.prefersReducedMotion) {
    return "low";
  }

  let score = 0;

  if (signals.deviceMemory !== null) {
    score += signals.deviceMemory >= 8 ? 2 : signals.deviceMemory >= 4 ? 1 : -1;
  }

  if (signals.hardwareConcurrency !== null) {
    score +=
      signals.hardwareConcurrency >= 8
        ? 2
        : signals.hardwareConcurrency >= 6
          ? 1
          : -1;
  }

  if (signals.pointerType === "coarse") score -= 1;
  if (signals.devicePixelRatio >= 2.25) score -= 1;
  if (signals.width >= 1440) score += 1;
  if (signals.width < 900) score -= 1;
  if (!heavyAnimationsEnabled) score -= 1;

  if (signals.fpsEstimate !== null) {
    score += signals.fpsEstimate >= 57 ? 1 : signals.fpsEstimate >= 48 ? 0 : -2;
  }

  if (score <= 0) return "low";
  if (score <= 3) return "medium";
  return "high";
}

function buildGraphicsProfile(
  signals: GraphicsQualitySignals,
  tier: GraphicsQualityTier,
  animationsEnabled: boolean,
  heavyAnimationsEnabled: boolean,
): GraphicsProfile {
  const motionAllowed = animationsEnabled && !signals.prefersReducedMotion;
  const shouldUseHeavyEffects =
    motionAllowed && heavyAnimationsEnabled && tier === "high";

  if (!motionAllowed) {
    return {
      tier: "low",
      signals,
      prefersReducedMotion: signals.prefersReducedMotion,
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
  }

  if (tier === "high") {
    return {
      tier,
      signals,
      prefersReducedMotion: signals.prefersReducedMotion,
      shouldAnimateBackground: true,
      shouldUseParallax: true,
      shouldUsePulse: true,
      shouldUseHeavyEffects,
      atmosphereLayerCount: 3,
      glowStrength: 1,
      shadowStrength: 1,
      parallaxStrength: 1,
      zoomResponseStrength: 1,
      cameraTransitionDuration: 540,
      cameraRestoreDuration: 400,
      interactionSmoothingMs: 34,
      idleSmoothingMs: 54,
      viewportPositionEpsilon: 0.12,
      viewportZoomEpsilon: 0.001,
      overscanBase: 22,
      overscanZoomFactor: 20,
      maxBackgroundEffects: 4,
    };
  }

  if (tier === "medium") {
    return {
      tier,
      signals,
      prefersReducedMotion: signals.prefersReducedMotion,
      shouldAnimateBackground: true,
      shouldUseParallax: true,
      shouldUsePulse: true,
      shouldUseHeavyEffects: false,
      atmosphereLayerCount: 3,
      glowStrength: 0.9,
      shadowStrength: 0.92,
      parallaxStrength: 0.84,
      zoomResponseStrength: 0.8,
      cameraTransitionDuration: 480,
      cameraRestoreDuration: 360,
      interactionSmoothingMs: 38,
      idleSmoothingMs: 60,
      viewportPositionEpsilon: 0.14,
      viewportZoomEpsilon: 0.0013,
      overscanBase: 20,
      overscanZoomFactor: 18,
      maxBackgroundEffects: 3,
    };
  }

  return {
    tier,
    signals,
    prefersReducedMotion: signals.prefersReducedMotion,
    shouldAnimateBackground: false,
    shouldUseParallax: true,
    shouldUsePulse: false,
    shouldUseHeavyEffects: false,
    atmosphereLayerCount: 2,
    glowStrength: 0.74,
    shadowStrength: 0.82,
    parallaxStrength: 0.58,
    zoomResponseStrength: 0.56,
    cameraTransitionDuration: 380,
    cameraRestoreDuration: 300,
    interactionSmoothingMs: 44,
    idleSmoothingMs: 68,
    viewportPositionEpsilon: 0.18,
    viewportZoomEpsilon: 0.0018,
    overscanBase: 18,
    overscanZoomFactor: 14,
    maxBackgroundEffects: 2,
  };
}

export function useGraphicsProfile(options: UseGraphicsProfileOptions = {}) {
  const {
    animationsEnabled = true,
    heavyAnimationsEnabled = true,
    enableFpsProbe = true,
  } = options;
  const [signals, setSignals] = useState<GraphicsQualitySignals>(() =>
    getInitialSignals(),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSignals = () => {
      setSignals((previous) => readSignals(previous));
    };

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");

    updateSignals();

    window.addEventListener("resize", updateSignals);

    const removeReducedMotionListener = bindMediaQueryListener(
      reducedMotionQuery,
      updateSignals,
    );
    const removeCoarsePointerListener = bindMediaQueryListener(
      coarsePointerQuery,
      updateSignals,
    );
    const removeFinePointerListener = bindMediaQueryListener(
      finePointerQuery,
      updateSignals,
    );

    return () => {
      window.removeEventListener("resize", updateSignals);
      removeReducedMotionListener();
      removeCoarsePointerListener();
      removeFinePointerListener();
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !enableFpsProbe ||
      signals.prefersReducedMotion
    ) {
      return;
    }

    let rafId = 0;
    let timeoutId = 0;
    let frameCount = 0;
    let firstFrameTime: number | null = null;

    const measureFps = (timestamp: number) => {
      if (firstFrameTime === null) {
        firstFrameTime = timestamp;
        rafId = window.requestAnimationFrame(measureFps);
        return;
      }

      frameCount += 1;
      const elapsed = timestamp - firstFrameTime;

      if (frameCount >= 12 || elapsed >= 320) {
        const fps = Math.round((frameCount / Math.max(elapsed, 1)) * 1000);
        setSignals((previous) =>
          previous.fpsEstimate === fps
            ? previous
            : { ...previous, fpsEstimate: fps },
        );
        return;
      }

      rafId = window.requestAnimationFrame(measureFps);
    };

    timeoutId = window.setTimeout(() => {
      rafId = window.requestAnimationFrame(measureFps);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(rafId);
    };
  }, [
    enableFpsProbe,
    signals.height,
    signals.prefersReducedMotion,
    signals.width,
  ]);

  return useMemo(() => {
    const tier = resolveQualityTier(
      signals,
      animationsEnabled,
      heavyAnimationsEnabled,
    );
    return buildGraphicsProfile(
      signals,
      tier,
      animationsEnabled,
      heavyAnimationsEnabled,
    );
  }, [animationsEnabled, heavyAnimationsEnabled, signals]);
}
