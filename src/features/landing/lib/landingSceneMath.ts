import type { LandingScenePreset } from "@/features/landing/types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0 || 1), 0, 1);
  return x * x * (3 - 2 * x);
}

export function mixScenePreset(
  current: LandingScenePreset,
  next: LandingScenePreset,
  amount: number,
): LandingScenePreset {
  const t = clamp(amount, 0, 1);

  return {
    spreadX: lerp(current.spreadX, next.spreadX, t),
    spreadY: lerp(current.spreadY, next.spreadY, t),
    depth: lerp(current.depth, next.depth, t),
    zoom: lerp(current.zoom, next.zoom, t),
    rotationX: lerp(current.rotationX, next.rotationX, t),
    rotationY: lerp(current.rotationY, next.rotationY, t),
    drift: lerp(current.drift, next.drift, t),
    nodeAlpha: lerp(current.nodeAlpha, next.nodeAlpha, t),
    edgeAlpha: lerp(current.edgeAlpha, next.edgeAlpha, t),
    glow: lerp(current.glow, next.glow, t),
    haze: lerp(current.haze, next.haze, t),
    focusX: lerp(current.focusX, next.focusX, t),
    focusY: lerp(current.focusY, next.focusY, t),
    maxLinkDistance: lerp(current.maxLinkDistance, next.maxLinkDistance, t),
    backgroundFade: lerp(current.backgroundFade, next.backgroundFade, t),
    vignette: lerp(current.vignette, next.vignette, t),
    pointerInfluence: lerp(current.pointerInfluence, next.pointerInfluence, t),
  };
}