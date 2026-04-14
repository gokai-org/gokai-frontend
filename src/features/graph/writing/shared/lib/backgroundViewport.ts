import type { Viewport } from "reactflow";
import type { GraphicsQualitySignals } from "@/shared/hooks/useGraphicsProfile";

export type BackgroundViewportState = {
  x: number;
  y: number;
  zoom: number;
};

export type BackgroundViewportCssState = {
  x: string;
  y: string;
  zoom: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snap(value: number, step: number) {
  return step <= 0 ? value : Math.round(value / step) * step;
}

export function getBackgroundViewportConfig(signals: GraphicsQualitySignals) {
  const compactViewport =
    signals.width <= 1180 || signals.pointerType === "coarse";
  const positionStep =
    compactViewport || signals.devicePixelRatio >= 2 ? 0.5 : 1;

  return {
    compactViewport,
    positionStep,
    zoomStep: compactViewport ? 0.0015 : 0.001,
    xLimit: Math.max(
      signals.width * (compactViewport ? 2.8 : 2.25),
      compactViewport ? 1400 : 980,
    ),
    yLimit: Math.max(
      signals.height * (compactViewport ? 1.95 : 1.6),
      compactViewport ? 960 : 720,
    ),
  };
}

export function normalizeViewportForBackground(
  viewport: Viewport,
  signals: GraphicsQualitySignals,
): BackgroundViewportState {
  const config = getBackgroundViewportConfig(signals);

  return {
    x: snap(
      clamp(viewport.x, -config.xLimit, config.xLimit),
      config.positionStep,
    ),
    y: snap(
      clamp(viewport.y, -config.yLimit, config.yLimit),
      config.positionStep,
    ),
    zoom: snap(viewport.zoom, config.zoomStep),
  };
}

export function formatBackgroundViewportState(
  state: BackgroundViewportState,
  signals: GraphicsQualitySignals,
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