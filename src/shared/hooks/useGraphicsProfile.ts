"use client";

import { useEffect, useMemo, useState } from "react";

type ConnectionType = "slow-2g" | "2g" | "3g" | "4g" | "unknown";
type FpsEstimateSource = "bootstrap" | "cached" | "measured";

type NavigatorConnection = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
  connection?: NavigatorConnection;
  mozConnection?: NavigatorConnection;
  webkitConnection?: NavigatorConnection;
  maxTouchPoints?: number;
};

export type GraphicsQualityTier = "low" | "medium" | "high";
export type GraphicsProfileSource = FpsEstimateSource;

export interface GraphicsQualitySignals {
  width: number;
  height: number;
  devicePixelRatio: number;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  maxTouchPoints: number;
  effectiveConnectionType: ConnectionType;
  saveData: boolean;
  pointerType: "coarse" | "fine" | "unknown";
  prefersReducedMotion: boolean;
  fpsEstimate: number | null;
  fpsEstimateSource: FpsEstimateSource;
}

export interface GraphicsProfile {
  tier: GraphicsQualityTier;
  signals: GraphicsQualitySignals;
  profileSource: GraphicsProfileSource;
  performanceScore: number;
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

interface CachedGraphicsProfile {
  version: 3;
  fingerprint: string;
  fpsEstimate: number;
  sampledAt: number;
}

const GRAPHICS_PROFILE_CACHE_KEY = "gokai-graphics-profile-cache-v3";
const GRAPHICS_PROFILE_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const DEFAULT_GRAPHICS_SIGNALS: GraphicsQualitySignals = {
  width: 1280,
  height: 800,
  devicePixelRatio: 1,
  hardwareConcurrency: null,
  deviceMemory: null,
  maxTouchPoints: 0,
  effectiveConnectionType: "unknown",
  saveData: false,
  pointerType: "unknown",
  prefersReducedMotion: false,
  fpsEstimate: null,
  fpsEstimateSource: "bootstrap",
};

function getConnectionInfo(navigatorWithMemory: NavigatorWithMemory) {
  return (
    navigatorWithMemory.connection ??
    navigatorWithMemory.mozConnection ??
    navigatorWithMemory.webkitConnection ??
    undefined
  );
}

function normalizeConnectionType(value?: string): ConnectionType {
  if (value === "slow-2g" || value === "2g" || value === "3g" || value === "4g") {
    return value;
  }

  return "unknown";
}

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

function getViewportBucket(width: number, height: number) {
  const longestSide = Math.max(width, height);

  if (longestSide >= 1600) return "xl";
  if (longestSide >= 1280) return "lg";
  if (longestSide >= 960) return "md";
  if (longestSide >= 640) return "sm";
  return "xs";
}

function getRenderLoad(signals: GraphicsQualitySignals) {
  return signals.width * signals.height * Math.max(1, signals.devicePixelRatio ** 2);
}

function buildDeviceFingerprint(signals: GraphicsQualitySignals) {
  const roundedDpr = Math.round(signals.devicePixelRatio * 100) / 100;

  return [
    getViewportBucket(signals.width, signals.height),
    roundedDpr,
    signals.hardwareConcurrency ?? "u",
    signals.deviceMemory ?? "u",
    signals.pointerType,
    signals.maxTouchPoints,
    signals.effectiveConnectionType,
    signals.saveData ? "save" : "normal",
  ].join("|");
}

function readCachedFpsEstimate(signals: GraphicsQualitySignals) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(GRAPHICS_PROFILE_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedGraphicsProfile>;
    if (
      parsed.version !== 3 ||
      typeof parsed.fingerprint !== "string" ||
      typeof parsed.fpsEstimate !== "number" ||
      typeof parsed.sampledAt !== "number"
    ) {
      return null;
    }

    if (Date.now() - parsed.sampledAt > GRAPHICS_PROFILE_CACHE_TTL_MS) {
      return null;
    }

    if (parsed.fingerprint !== buildDeviceFingerprint(signals)) {
      return null;
    }

    return Math.max(18, Math.min(120, Math.round(parsed.fpsEstimate)));
  } catch {
    return null;
  }
}

function writeCachedFpsEstimate(signals: GraphicsQualitySignals, fpsEstimate: number) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: CachedGraphicsProfile = {
      version: 3,
      fingerprint: buildDeviceFingerprint(signals),
      fpsEstimate,
      sampledAt: Date.now(),
    };

    window.localStorage.setItem(
      GRAPHICS_PROFILE_CACHE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage failures; the live probe will still be used.
  }
}

function getInitialSignals(): GraphicsQualitySignals {
  if (typeof window === "undefined") {
    return { ...DEFAULT_GRAPHICS_SIGNALS };
  }

  const liveSignals = readSignals(DEFAULT_GRAPHICS_SIGNALS);
  const cachedFpsEstimate = readCachedFpsEstimate(liveSignals);

  if (cachedFpsEstimate === null) {
    return liveSignals;
  }

  return {
    ...liveSignals,
    fpsEstimate: cachedFpsEstimate,
    fpsEstimateSource: "cached",
  };
}

function readSignals(previous: GraphicsQualitySignals): GraphicsQualitySignals {
  if (typeof window === "undefined") {
    return previous;
  }

  const navigatorWithMemory = navigator as NavigatorWithMemory;
  const connection = getConnectionInfo(navigatorWithMemory);

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
    maxTouchPoints:
      typeof navigatorWithMemory.maxTouchPoints === "number"
        ? navigatorWithMemory.maxTouchPoints
        : 0,
    effectiveConnectionType: normalizeConnectionType(connection?.effectiveType),
    saveData: Boolean(connection?.saveData),
    pointerType: getPointerType(),
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    fpsEstimate: previous.fpsEstimate,
    fpsEstimateSource: previous.fpsEstimateSource,
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

function bindConnectionListener(
  connection: NavigatorConnection | undefined,
  listener: () => void,
) {
  if (!connection) {
    return () => undefined;
  }

  if (typeof connection.addEventListener === "function") {
    connection.addEventListener("change", listener);
    return () => connection.removeEventListener?.("change", listener);
  }

  if (typeof connection.addListener === "function") {
    connection.addListener(listener);
    return () => connection.removeListener?.(listener);
  }

  return () => undefined;
}

function resolvePerformanceScore(
  signals: GraphicsQualitySignals,
  animationsEnabled: boolean,
  heavyAnimationsEnabled: boolean,
) {
  if (!animationsEnabled) {
    return -12;
  }

  if (signals.prefersReducedMotion) {
    return -10;
  }

  let score = 0;

  if (signals.saveData) {
    score -= 4;
  }

  switch (signals.effectiveConnectionType) {
    case "slow-2g":
    case "2g":
      score -= 3;
      break;
    case "3g":
      score -= 1;
      break;
    default:
      break;
  }

  if (signals.deviceMemory !== null) {
    if (signals.deviceMemory >= 8) score += 2;
    else if (signals.deviceMemory >= 6) score += 1;
    else if (signals.deviceMemory <= 2) score -= 3;
    else if (signals.deviceMemory <= 4) score -= 1;
  }

  if (signals.hardwareConcurrency !== null) {
    if (signals.hardwareConcurrency >= 10) score += 2;
    else if (signals.hardwareConcurrency >= 6) score += 1;
    else if (signals.hardwareConcurrency <= 4) score -= 2;
  }

  const renderLoad = getRenderLoad(signals);
  if (renderLoad >= 14_000_000) score -= 3;
  else if (renderLoad >= 8_000_000) score -= 2;
  else if (renderLoad >= 4_000_000) score -= 1;
  else if (renderLoad <= 2_000_000) score += 1;

  if (signals.pointerType === "coarse") {
    score -= 1;
  }

  if (signals.width >= 1440 && signals.pointerType === "fine") {
    score += 1;
  }

  if (signals.width < 820) {
    score -= 1;
  }

  if (!heavyAnimationsEnabled) {
    score -= 1;
  }

  if (signals.fpsEstimate !== null) {
    if (signals.fpsEstimate >= 58) score += 3;
    else if (signals.fpsEstimate >= 52) score += 1;
    else if (signals.fpsEstimate >= 46) score += 0;
    else if (signals.fpsEstimate >= 40) score -= 2;
    else score -= 4;
  }

  return score;
}

function resolveQualityTier(
  signals: GraphicsQualitySignals,
  animationsEnabled: boolean,
  heavyAnimationsEnabled: boolean,
): GraphicsQualityTier {
  const score = resolvePerformanceScore(
    signals,
    animationsEnabled,
    heavyAnimationsEnabled,
  );

  if (score <= 0) return "low";
  if (score <= 5) return "medium";
  return "high";
}

function buildGraphicsProfile(
  signals: GraphicsQualitySignals,
  tier: GraphicsQualityTier,
  animationsEnabled: boolean,
  heavyAnimationsEnabled: boolean,
): GraphicsProfile {
  const performanceScore = resolvePerformanceScore(
    signals,
    animationsEnabled,
    heavyAnimationsEnabled,
  );
  const motionAllowed = animationsEnabled && !signals.prefersReducedMotion;
  const measuredFps = signals.fpsEstimate ?? 52;
  const lowDeviceNeedsMinimalMotion =
    tier === "low" || signals.saveData || measuredFps < 46;
  const allowParallax =
    motionAllowed && !lowDeviceNeedsMinimalMotion && signals.pointerType !== "coarse";
  const allowAnimatedBackground =
    motionAllowed && tier !== "low" && measuredFps >= 48 && !signals.saveData;
  const allowPulse = motionAllowed && tier !== "low" && measuredFps >= 50;
  const shouldUseHeavyEffects =
    motionAllowed &&
    heavyAnimationsEnabled &&
    tier === "high" &&
    measuredFps >= 56 &&
    !signals.saveData &&
    signals.pointerType === "fine";

  if (!motionAllowed) {
    return {
      tier: "low",
      signals,
      profileSource: signals.fpsEstimateSource,
      performanceScore,
      prefersReducedMotion: signals.prefersReducedMotion,
      shouldAnimateBackground: false,
      shouldUseParallax: false,
      shouldUsePulse: false,
      shouldUseHeavyEffects: false,
      atmosphereLayerCount: 1,
      glowStrength: 0.68,
      shadowStrength: 0.74,
      parallaxStrength: 0,
      zoomResponseStrength: 0,
      cameraTransitionDuration: 260,
      cameraRestoreDuration: 220,
      interactionSmoothingMs: 52,
      idleSmoothingMs: 76,
      viewportPositionEpsilon: 0.2,
      viewportZoomEpsilon: 0.002,
      overscanBase: 16,
      overscanZoomFactor: 10,
      maxBackgroundEffects: 1,
    };
  }

  if (tier === "high") {
    return {
      tier,
      signals,
      profileSource: signals.fpsEstimateSource,
      performanceScore,
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
      profileSource: signals.fpsEstimateSource,
      performanceScore,
      prefersReducedMotion: signals.prefersReducedMotion,
      shouldAnimateBackground: allowAnimatedBackground,
      shouldUseParallax: allowParallax || signals.pointerType === "fine",
      shouldUsePulse: allowPulse,
      shouldUseHeavyEffects: false,
      atmosphereLayerCount: allowAnimatedBackground ? 2 : 1,
      glowStrength: 0.86,
      shadowStrength: 0.9,
      parallaxStrength: allowParallax ? 0.72 : 0.42,
      zoomResponseStrength: allowParallax ? 0.68 : 0.34,
      cameraTransitionDuration: 430,
      cameraRestoreDuration: 330,
      interactionSmoothingMs: 38,
      idleSmoothingMs: 60,
      viewportPositionEpsilon: 0.14,
      viewportZoomEpsilon: 0.0013,
      overscanBase: 20,
      overscanZoomFactor: 16,
      maxBackgroundEffects: allowAnimatedBackground ? 3 : 2,
    };
  }

  return {
    tier,
    signals,
    profileSource: signals.fpsEstimateSource,
    performanceScore,
    prefersReducedMotion: signals.prefersReducedMotion,
    shouldAnimateBackground: false,
    shouldUseParallax:
      motionAllowed && signals.pointerType === "fine" && measuredFps >= 48 && !signals.saveData,
    shouldUsePulse: false,
    shouldUseHeavyEffects: false,
    atmosphereLayerCount: 1,
    glowStrength: 0.7,
    shadowStrength: 0.78,
    parallaxStrength: 0.35,
    zoomResponseStrength: 0.3,
    cameraTransitionDuration: 360,
    cameraRestoreDuration: 280,
    interactionSmoothingMs: 46,
    idleSmoothingMs: 72,
    viewportPositionEpsilon: 0.18,
    viewportZoomEpsilon: 0.0018,
    overscanBase: 18,
    overscanZoomFactor: 12,
    maxBackgroundEffects: 1,
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
    const connection = getConnectionInfo(navigator as NavigatorWithMemory);

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
    const removeConnectionListener = bindConnectionListener(
      connection,
      updateSignals,
    );

    return () => {
      window.removeEventListener("resize", updateSignals);
      removeReducedMotionListener();
      removeCoarsePointerListener();
      removeFinePointerListener();
      removeConnectionListener();
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !animationsEnabled ||
      !enableFpsProbe ||
      signals.prefersReducedMotion ||
      signals.saveData
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
        writeCachedFpsEstimate(signals, fps);
        setSignals((previous) => {
          if (
            previous.fpsEstimate === fps &&
            previous.fpsEstimateSource === "measured"
          ) {
            return previous;
          }

          return {
            ...previous,
            fpsEstimate: fps,
            fpsEstimateSource: "measured",
          };
        });
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
    animationsEnabled,
    enableFpsProbe,
    signals.height,
    signals.prefersReducedMotion,
    signals.saveData,
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
