"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { useSidebar } from "@/shared/components/SidebarContext";
import { WritingPracticeModal } from "@/features/kanji/components/WritingPracticeModal";
import type { Kanji } from "@/features/kanji/types";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useGraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import type { Viewport } from "reactflow";
import {
  buildKanjiBoardLayout,
  buildTranslateExtent,
  createKanjiBoardGraph,
} from "../lib/boardBuilder";
import { useKanjiBoard } from "../hooks/useKanjiBoard";
import { useKanjiBoardQuality } from "../hooks/useKanjiBoardQuality";
import type { KanjiBoardQualitySignals } from "../types";
import { KanjiBoardBackground } from "./KanjiBoardBackground";
import { KanjiBoardMap } from "./KanjiBoardMap";

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

function getBackgroundViewportConfig(signals: KanjiBoardQualitySignals) {
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
  signals: KanjiBoardQualitySignals,
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
  signals: KanjiBoardQualitySignals,
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
  const { items, summary } = useKanjiBoard();
  const { animationsEnabled, heavyAnimationsEnabled } = useAnimationPreferences();
  const graphicsProfile = useGraphicsProfile({
    animationsEnabled,
    heavyAnimationsEnabled,
    enableFpsProbe: true,
  });
  const qualityProfile = useKanjiBoardQuality(graphicsProfile);
  const { setHidden } = useSidebar();
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [writingKanji, setWritingKanji] = useState<Kanji | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const viewportFrame = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);
  const qualityProfileRef = useRef(qualityProfile);
  // Tracks shouldUseParallax without capturing it in callback closures.
  const shouldUseParallaxRef = useRef(graphicsProfile.shouldUseParallax);
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
  const layout = useMemo(() => buildKanjiBoardLayout(layoutIds), [layoutIds]);

  const translateExtent = useMemo(
    () => buildTranslateExtent(
      layout.nodeBounds,
      graphicsProfile.signals.width,
      graphicsProfile.signals.height,
    ),
    [layout.nodeBounds, graphicsProfile.signals.width, graphicsProfile.signals.height],
  );

  const selectedProgress = useMemo(
    () => items.find((item) => item.id === detailNodeId) ?? null,
    [detailNodeId, items],
  );

  const graph = useMemo(
    () => createKanjiBoardGraph(items, layout, selectedId, qualityProfile),
    // Depend only on the primitives that affect visible output. The full qualityProfile
    // object is recreated on every FPS-probe tick even when no visual param changes,
    // so a reference-equality dep would trigger a full graph recompute every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      items,
      layout,
      selectedId,
      qualityProfile.tier,
      qualityProfile.node.glowScale,
      qualityProfile.node.shadowScale,
      qualityProfile.node.showOrbitRings,
      qualityProfile.node.shouldUsePulse,
      qualityProfile.edge.widthScale,
      qualityProfile.edge.opacityScale,
      qualityProfile.edge.showLockedDash,
    ],
  );

  const backgroundStyle = useMemo(
    () => {
      const { width, height, pointerType } = graphicsProfile.signals;
      const compact = width <= 1180 || pointerType === "coarse";
      const diagonal = Math.hypot(width, height);
      // Single span for the one parallax star layer
      const span = Math.round(
        Math.max(diagonal * (compact ? 2.6 : 2.2), compact ? 2800 : 2200),
      );
      const parallaxAtten = compact ? 0.80 : 1;
      const zoomAtten = compact ? 0.55 : 1;

      return {
        "--kanji-camera-x": "0px",
        "--kanji-camera-y": "0px",
        "--kanji-camera-zoom": 1,
        "--kanji-layer-span": `${span}px`,
        "--kanji-parallax-factor": graphicsProfile.shouldUseParallax
          ? `${(-0.22 * qualityProfile.background.parallaxStrength * parallaxAtten).toFixed(4)}`
          : "0",
        "--kanji-parallax-zoom-factor": graphicsProfile.shouldUseParallax
          ? `${(0.052 * qualityProfile.background.zoomStrength * zoomAtten).toFixed(4)}`
          : "0",
      } as React.CSSProperties;
    },
    // Only recompute when layout/parallax signals change meaningfully.
    // FPS-probe ticks update graphicsProfile reference but don't change these primitives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      graphicsProfile.shouldUseParallax,
      graphicsProfile.signals.width,
      graphicsProfile.signals.height,
      graphicsProfile.signals.pointerType,
      graphicsProfile.signals.devicePixelRatio,
      qualityProfile.background.parallaxStrength,
      qualityProfile.background.zoomStrength,
    ],
  );

  const handleSelect = useCallback((nodeId: string) => {
    setManualSelectedId(nodeId);
    setDetailNodeId(nodeId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailNodeId(null);
  }, []);

  const handleWritingStart = useCallback((kanji: Kanji) => {
    setWritingKanji(kanji);
  }, []);

  const handleWritingEnd = useCallback(() => {
    setWritingKanji(null);
  }, []);

  useEffect(() => {
    setHidden(detailNodeId !== null);
    return () => {
      setHidden(false);
    };
  }, [detailNodeId, setHidden]);

  const setInteractionState = useCallback((isInteracting: boolean) => {
    isInteractingRef.current = isInteracting;

    const background = backgroundRef.current;
    if (!background) return;

    background.dataset.kanjiInteracting = isInteracting ? "true" : "false";
  }, []);

  useEffect(() => {
    qualityProfileRef.current = qualityProfile;
    shouldUseParallaxRef.current = qualityProfile.graphics.shouldUseParallax;
  }, [qualityProfile]);

  const applyBackgroundViewport = useCallback(
    (
      layer: HTMLDivElement,
      state: BackgroundViewportState,
      signals: KanjiBoardQualitySignals,
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

    if (!shouldUseParallaxRef.current) return;

    ensureViewportAnimation();
  }, [ensureViewportAnimation]);

  const handleInteractionChange = useCallback(
    (isInteracting: boolean) => {
      setInteractionState(isInteracting);

      if (!shouldUseParallaxRef.current) return;

      ensureViewportAnimation();
    },
    [ensureViewportAnimation, setInteractionState],
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
      {/*
       * SIDEBAR LAG FIX: removed `isolate` (was creating an expensive stacking
       * context that forced backdrop-blur to composite the whole subtree) and
       * `[transform:translateZ(0)]` (was promoting this wrapper as a useless
       * compositor layer). `contain: layout paint style` provides the same
       * visual containment without the compositing cost.
       */}
      <div
        ref={backgroundRef}
        data-kanji-interacting="false"
        data-kanji-quality={qualityProfile.tier}
        data-kanji-parallax={graphicsProfile.shouldUseParallax ? "active" : "inactive"}
        className="absolute inset-0"
        style={{ contain: "layout paint style", ...backgroundStyle } as React.CSSProperties}
      >
        <KanjiBoardBackground
          qualityProfile={qualityProfile}
          graphicsProfile={graphicsProfile}
        />
      </div>

      <div className="absolute inset-0 z-10">
        <KanjiBoardMap
          nodes={graph.nodes}
          edges={graph.edges}
          layout={layout}
          onSelect={handleSelect}
          onViewportChange={syncViewportToScene}
          initialNodeId={selectedId}
          focusedNodeId={detailNodeId}
          onInteractionChange={handleInteractionChange}
          qualityProfile={qualityProfile}
          translateExtent={translateExtent}
        />
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
        writingActive={writingKanji !== null}
        onWritingStart={handleWritingStart}
      />

      {writingKanji !== null && (
        <WritingPracticeModal kanji={writingKanji} onClose={handleWritingEnd} />
      )}
    </div>
  );
}
