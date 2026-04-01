"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useGraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import type { Viewport } from "reactflow";
import {
  buildKanjiConstellationLayout,
  createKanjiConstellationGraph,
} from "../lib/constellationBuilder";
import { useKanjiConstellation } from "../hooks/useKanjiConstellation";
import { useKanjiConstellationQuality } from "../hooks/useKanjiConstellationQuality";
import type { KanjiConstellationQualitySignals } from "../types";
import { KanjiConstellationBackground } from "./KanjiConstellationBackground";
import { KanjiConstellationMap } from "./KanjiConstellationMap";

const GRAPH_USER_ID = "user123";

type BackgroundViewportState = {
  x: number;
  y: number;
  zoom: number;
};

type BackgroundViewportCssState = {
  x: string;
  y: string;
  zoom: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snap(value: number, step: number) {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

function getBackgroundViewportConfig(signals: KanjiConstellationQualitySignals) {
  const compactViewport = signals.width <= 1180 || signals.pointerType === "coarse";
  const positionStep = compactViewport || signals.devicePixelRatio >= 2 ? 0.5 : 1;

  return {
    compactViewport,
    positionStep,
    zoomStep: compactViewport ? 0.0015 : 0.001,
    xLimit: Math.max(signals.width * (compactViewport ? 2.8 : 2.25), compactViewport ? 1400 : 980),
    yLimit: Math.max(signals.height * (compactViewport ? 1.95 : 1.6), compactViewport ? 960 : 720),
  };
}

function normalizeViewportForBackground(
  viewport: Viewport,
  signals: KanjiConstellationQualitySignals,
) {
  const config = getBackgroundViewportConfig(signals);

  return {
    x: snap(clamp(viewport.x, -config.xLimit, config.xLimit), config.positionStep),
    y: snap(clamp(viewport.y, -config.yLimit, config.yLimit), config.positionStep),
    zoom: snap(viewport.zoom, config.zoomStep),
  };
}

function formatBackgroundViewportState(
  state: BackgroundViewportState,
  signals: KanjiConstellationQualitySignals,
): BackgroundViewportCssState {
  const config = getBackgroundViewportConfig(signals);
  const x = snap(state.x, config.positionStep);
  const y = snap(state.y, config.positionStep);
  const zoom = snap(state.zoom, config.zoomStep);

  return {
    x: `${x.toFixed(config.positionStep < 1 ? 1 : 0)}px`,
    y: `${y.toFixed(config.positionStep < 1 ? 1 : 0)}px`,
    zoom: zoom.toFixed(4),
  };
}

export default function KanjisView() {
  const { items, summary } = useKanjiConstellation();
  const { animationsEnabled, heavyAnimationsEnabled } = useAnimationPreferences();
  const graphicsProfile = useGraphicsProfile({
    animationsEnabled,
    heavyAnimationsEnabled,
    enableFpsProbe: true,
  });
  const qualityProfile = useKanjiConstellationQuality(graphicsProfile);
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const viewportFrame = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);
  const qualityProfileRef = useRef(qualityProfile);
  const isInteractingRef = useRef(false);
  const animateBackgroundViewportRef = useRef<(timestamp: number) => void>(() => undefined);
  const latestViewport = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
  const appliedViewportCss = useRef<BackgroundViewportCssState>({
    x: "0px",
    y: "0px",
    zoom: "1.0000",
  });
  const appliedViewport = useRef<BackgroundViewportState>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const selectedId = useMemo(() => {
    if (detailNodeId && items.some((item) => item.id === detailNodeId)) {
      return detailNodeId;
    }

    if (manualSelectedId && items.some((item) => item.id === manualSelectedId)) {
      return manualSelectedId;
    }

    return summary.currentKanjiId ?? items[0]?.id ?? null;
  }, [detailNodeId, items, manualSelectedId, summary.currentKanjiId]);

  const layoutIds = useMemo(() => items.map((item) => item.id), [items]);
  const layout = useMemo(() => buildKanjiConstellationLayout(layoutIds), [layoutIds]);

  const selectedProgress = useMemo(
    () => items.find((item) => item.id === detailNodeId) ?? null,
    [detailNodeId, items],
  );

  const graph = useMemo(
    () => createKanjiConstellationGraph(items, layout, selectedId, qualityProfile),
    [items, layout, qualityProfile, selectedId],
  );

  const backgroundStyle = useMemo(
    () => {
      const { width, height, pointerType } = graphicsProfile.signals;
      const compactViewport = width <= 1180 || pointerType === "coarse";
      const continuityBoost = compactViewport ? 1.34 : width < 1360 ? 1.08 : 1;
      const diagonal = Math.hypot(width, height);
      const baseSpan = Math.max(diagonal * continuityBoost, Math.max(width, height) * 1.24);
      const farSpan = Math.round(Math.max(baseSpan * 2.34, compactViewport ? 2800 : 1600));
      const midSpan = Math.round(Math.max(baseSpan * 2.68, compactViewport ? 3400 : 1850));
      const nearSpan = Math.round(Math.max(baseSpan * 3.02, compactViewport ? 4000 : 2120));
      const atmosphereBleed = Math.round(
        Math.max(
          Math.max(width, height) * (compactViewport ? 0.62 : 0.32),
          compactViewport ? 420 : 220,
        ),
      );
      const starZoomAttenuation = compactViewport ? 0.36 : width < 1360 ? 0.78 : 1;
      const atmosphereZoomAttenuation = compactViewport ? 0.76 : width < 1360 ? 0.9 : 1;
      const parallaxAttenuation = compactViewport ? 0.88 : 1;

      return {
        "--kanji-camera-x": "0px",
        "--kanji-camera-y": "0px",
        "--kanji-camera-zoom": 1,
        "--kanji-layer-far-span": `${farSpan}px`,
        "--kanji-layer-mid-span": `${midSpan}px`,
        "--kanji-layer-near-span": `${nearSpan}px`,
        "--kanji-atmosphere-bleed": `${atmosphereBleed}px`,
        "--kanji-parallax-far-factor": `${
          graphicsProfile.shouldUseParallax
            ? -0.16 * qualityProfile.background.parallaxStrength * parallaxAttenuation
            : 0
        }`,
        "--kanji-parallax-mid-factor": `${
          graphicsProfile.shouldUseParallax
            ? -0.3 * qualityProfile.background.parallaxStrength * parallaxAttenuation
            : 0
        }`,
        "--kanji-parallax-near-factor": `${
          graphicsProfile.shouldUseParallax
            ? -0.48 * qualityProfile.background.parallaxStrength * parallaxAttenuation
            : 0
        }`,
        "--kanji-parallax-far-star-zoom": `${
          graphicsProfile.shouldUseParallax
            ? 0.034 * qualityProfile.background.zoomStrength * starZoomAttenuation
            : 0
        }`,
        "--kanji-parallax-mid-star-zoom": `${
          graphicsProfile.shouldUseParallax
            ? 0.052 * qualityProfile.background.zoomStrength * starZoomAttenuation
            : 0
        }`,
        "--kanji-parallax-near-star-zoom": `${
          graphicsProfile.shouldUseParallax
            ? 0.072 * qualityProfile.background.zoomStrength * starZoomAttenuation
            : 0
        }`,
        "--kanji-parallax-far-atmosphere-zoom": `${
          graphicsProfile.shouldUseParallax
            ? 0.05 * qualityProfile.background.zoomStrength * atmosphereZoomAttenuation
            : 0
        }`,
        "--kanji-parallax-mid-atmosphere-zoom": `${
          graphicsProfile.shouldUseParallax
            ? 0.078 * qualityProfile.background.zoomStrength * atmosphereZoomAttenuation
            : 0
        }`,
        "--kanji-parallax-near-atmosphere-zoom": `${
          graphicsProfile.shouldUseParallax
            ? 0.106 * qualityProfile.background.zoomStrength * atmosphereZoomAttenuation
            : 0
        }`,
      } as React.CSSProperties;
    },
    [graphicsProfile, qualityProfile],
  );

  const handleSelect = (nodeId: string) => {
    setManualSelectedId(nodeId);
    setDetailNodeId(nodeId);
  };

  const handleCloseDetail = () => {
    setDetailNodeId(null);
  };

  const setInteractionState = useCallback((isInteracting: boolean) => {
    isInteractingRef.current = isInteracting;

    const background = backgroundRef.current;
    if (!background) return;

    background.dataset.kanjiInteracting = isInteracting ? "true" : "false";
  }, []);

  useEffect(() => {
    qualityProfileRef.current = qualityProfile;
  }, [qualityProfile]);

  const applyBackgroundViewport = useCallback(
    (
      layer: HTMLDivElement,
      state: BackgroundViewportState,
      signals: KanjiConstellationQualitySignals,
    ) => {
      const formattedState = formatBackgroundViewportState(state, signals);
      const previousState = appliedViewportCss.current;

      if (formattedState.x !== previousState.x) {
        layer.style.setProperty("--kanji-camera-x", formattedState.x);
      }

      if (formattedState.y !== previousState.y) {
        layer.style.setProperty("--kanji-camera-y", formattedState.y);
      }

      if (formattedState.zoom !== previousState.zoom) {
        layer.style.setProperty("--kanji-camera-zoom", formattedState.zoom);
      }

      appliedViewportCss.current = formattedState;
    },
    [],
  );

  useEffect(() => {
    animateBackgroundViewportRef.current = (timestamp: number) => {
      viewportFrame.current = null;

      const layer = backgroundRef.current;
      if (!layer) return;

      const profile = qualityProfileRef.current;
      const signals = profile.graphics.signals;

      if (!profile.graphics.shouldUseParallax) {
        const restingState = {
          x: 0,
          y: 0,
          zoom: 1,
        };

        appliedViewport.current = restingState;
        applyBackgroundViewport(layer, restingState, signals);
        lastFrameTime.current = null;
        return;
      }

      const previousTime = lastFrameTime.current ?? timestamp;
      const delta = Math.min(32, Math.max(8, timestamp - previousTime));
      lastFrameTime.current = timestamp;

      const target = latestViewport.current;
      const previous = appliedViewport.current;
      const smoothing = profile.allowMotion
        ? 1 -
          Math.exp(
            -delta /
              (isInteractingRef.current
                ? profile.background.interactionSmoothingMs
                : profile.background.idleSmoothingMs),
          )
        : 1;

      const next = {
        x: previous.x + (target.x - previous.x) * smoothing,
        y: previous.y + (target.y - previous.y) * smoothing,
        zoom: previous.zoom + (target.zoom - previous.zoom) * smoothing,
      };

      if (Math.abs(target.x - next.x) < profile.background.epsilonPosition) next.x = target.x;
      if (Math.abs(target.y - next.y) < profile.background.epsilonPosition) next.y = target.y;
      if (Math.abs(target.zoom - next.zoom) < profile.background.epsilonZoom) next.zoom = target.zoom;

      const hasMeaningfulChange =
        Math.abs(previous.x - next.x) >= profile.background.epsilonPosition * 0.5 ||
        Math.abs(previous.y - next.y) >= profile.background.epsilonPosition * 0.5 ||
        Math.abs(previous.zoom - next.zoom) >= profile.background.epsilonZoom * 0.5;

      if (hasMeaningfulChange) {
        appliedViewport.current = next;
        applyBackgroundViewport(layer, next, signals);
      }

      const isSettled =
        Math.abs(target.x - next.x) < profile.background.epsilonPosition &&
        Math.abs(target.y - next.y) < profile.background.epsilonPosition &&
        Math.abs(target.zoom - next.zoom) < profile.background.epsilonZoom;

      if (!isSettled || isInteractingRef.current) {
        viewportFrame.current = window.requestAnimationFrame(animateBackgroundViewportRef.current);
        return;
      }

      appliedViewport.current = {
        x: target.x,
        y: target.y,
        zoom: target.zoom,
      };
      applyBackgroundViewport(layer, appliedViewport.current, signals);
      lastFrameTime.current = null;
    };
  }, [applyBackgroundViewport]);

  const ensureViewportAnimation = useCallback(() => {
    if (viewportFrame.current !== null) return;

    viewportFrame.current = window.requestAnimationFrame(animateBackgroundViewportRef.current);
  }, []);

  const syncViewportToScene = useCallback((viewport: Viewport) => {
    latestViewport.current = normalizeViewportForBackground(
      viewport,
      qualityProfileRef.current.graphics.signals,
    );

    if (!graphicsProfile.shouldUseParallax) return;

    ensureViewportAnimation();
  }, [ensureViewportAnimation, graphicsProfile.shouldUseParallax]);

  const handleInteractionChange = useCallback(
    (isInteracting: boolean) => {
      setInteractionState(isInteracting);

      if (!graphicsProfile.shouldUseParallax) return;

      ensureViewportAnimation();
    },
    [ensureViewportAnimation, graphicsProfile.shouldUseParallax, setInteractionState],
  );

  useEffect(() => {
    return () => {
      if (viewportFrame.current !== null) {
        window.cancelAnimationFrame(viewportFrame.current);
      }

      lastFrameTime.current = null;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-surface-primary"
    >
      <div
        ref={backgroundRef}
        data-kanji-interacting="false"
        data-kanji-quality={qualityProfile.tier}
        className="absolute inset-0 isolate [transform:translateZ(0)]"
        style={backgroundStyle}
      >
        <KanjiConstellationBackground
          qualityProfile={qualityProfile}
          graphicsProfile={graphicsProfile}
        />
      </div>

      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0">
          <KanjiConstellationMap
            nodes={graph.nodes}
            edges={graph.edges}
            layout={layout}
            onSelect={handleSelect}
            onViewportChange={syncViewportToScene}
            initialNodeId={selectedId}
            focusedNodeId={detailNodeId}
            onInteractionChange={handleInteractionChange}
            qualityProfile={qualityProfile}
          />
        </div>
      </div>

      <LessonDrawer
        open={detailNodeId !== null}
        onClose={handleCloseDetail}
        nodeId={detailNodeId}
        mode="writing"
        userId={GRAPH_USER_ID}
        entityId={selectedProgress?.kanji.id ?? null}
        entityKind={selectedProgress ? "kanji" : null}
        kanjiCtaDisabled={selectedProgress?.status === "locked"}
        kanjiCtaDisabledReason={
          selectedProgress?.status === "locked"
            ? `Consigue ${selectedProgress.completionScore}% en el kanji anterior para desbloquear la práctica.`
            : undefined
        }
      />
    </div>
  );
}
