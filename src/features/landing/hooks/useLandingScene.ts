"use client";

import { useMemo } from "react";
import type {
  LandingSceneState,
  LandingScrollTimeline,
} from "@/features/landing/types";
import { getLandingScenePreset } from "@/features/landing/lib/landingSceneConfig";
import {
  clamp,
  mixScenePreset,
  lerp,
  smoothstep,
} from "@/features/landing/lib/landingSceneMath";

export function useLandingScene(
  timeline: LandingScrollTimeline,
): LandingSceneState {
  return useMemo(() => {
    const current = getLandingScenePreset(timeline.activeId);
    const next = getLandingScenePreset(timeline.nextId ?? timeline.activeId);

    const sceneBlend =
      timeline.activeId === "como-funciona"
        ? smoothstep(0.34, 0.84, timeline.activeProgress)
        : timeline.blendToNext;

    const mixed = mixScenePreset(current, next, sceneBlend);

    const howSection = timeline.sections["como-funciona"];
    const listenSection = timeline.sections["escuchar"];
    const experienceSection = timeline.sections["experiencia"];

    const listenProgress = listenSection?.progress ?? 0;
    const howProgress = howSection?.progress ?? 0;
    const experienceProgress = experienceSection?.progress ?? 0;

    // Curva continua: inicia al salir de la ultima skill (escuchar)
    // y sigue creciendo en how/entrada a experiencia sin depender de activeId.
    const fromListen = smoothstep(0.58, 1, listenProgress) * 0.35;
    const fromHow = smoothstep(0.06, 0.9, howProgress) * 0.55;
    const intoExperience = smoothstep(0, 0.36, experienceProgress) * 0.1;

    const howCloseUp = clamp(fromListen + fromHow + intoExperience, 0, 1);

    const cinematicZoom = lerp(
      1,
      timeline.viewport.isMobile
        ? 1.22
        : timeline.viewport.isTablet
          ? 1.28
          : 1.34,
      howCloseUp,
    );

    const centerPull = smoothstep(0.18, 0.7, howCloseUp);

    const depthBoost = lerp(
      1,
      timeline.viewport.isMobile ? 1.04 : 1.08,
      howCloseUp,
    );

    const intensityBoost = lerp(1, 1.06, howCloseUp);

    return {
      ...mixed,
      depth: mixed.depth * depthBoost,
      glow: mixed.glow * intensityBoost,
      nodeAlpha: mixed.nodeAlpha * lerp(1, 1.03, howCloseUp),
      edgeAlpha: mixed.edgeAlpha * lerp(1, 1.06, howCloseUp),
      sectionId: timeline.activeId,
      nextId: timeline.nextId,
      blend: sceneBlend,
      howCloseUp,
      cinematicZoom,
      centerPull,
      intensityBoost,
      nodeCount: timeline.viewport.isMobile
        ? 70
        : timeline.viewport.isTablet
          ? 108
          : 148,
    };
  }, [timeline]);
}