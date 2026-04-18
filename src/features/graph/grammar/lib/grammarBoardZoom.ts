import type { GrammarBoardCellViewModel } from "../types";

export interface GrammarBoardViewportSize {
  width: number;
  height: number;
}

export interface GrammarBoardTargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface GrammarBoardZoomTransform {
  x: number;
  y: number;
  scale: number;
  transformOrigin: string;
}

export interface GrammarBoardZoomOptions {
  portrait?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveTargetScale(
  width: number,
  height: number,
  viewport: GrammarBoardViewportSize,
  portrait = false,
) {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  // Portrait cells are narrower relative to screen → use 1.0x instead of 1.18x
  // to avoid overshooting the viewport width; tighter clamp range too.
  const fittedWidthScale = portrait
    ? (viewport.width * 1.0) / safeWidth
    : (viewport.width * 1.18) / safeWidth;
  const fittedHeightScale = portrait
    ? (viewport.height * 1.0) / safeHeight
    : (viewport.height * 1.12) / safeHeight;
  const minScale = portrait ? 2.4 : 3.4;
  const maxScale = portrait ? 5.0 : 6.8;

  return clamp(Math.min(fittedWidthScale, fittedHeightScale), minScale, maxScale);
}

export function resolveGrammarBoardZoomTransform(
  cell: GrammarBoardCellViewModel | null,
  viewport: GrammarBoardViewportSize,
  targetRect?: GrammarBoardTargetRect | null,
  options?: GrammarBoardZoomOptions,
): GrammarBoardZoomTransform {
  const portrait = options?.portrait ?? false;
  // On portrait the board has extra top padding (navbar clearance).
  // Shift the zoom focal point slightly below the geometric center so the
  // zoomed cell sits in the visual centre of the board area.
  const vertCenterRatio = portrait ? 0.53 : 0.5;
  if (viewport.width <= 0 || viewport.height <= 0) {
    return {
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "50% 50%",
    };
  }

  if (targetRect && targetRect.width > 0 && targetRect.height > 0) {
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;
    const scale = resolveTargetScale(targetRect.width, targetRect.height, viewport, portrait);

    return {
      x: viewport.width / 2 - centerX * scale,
      y: viewport.height * vertCenterRatio - centerY * scale,
      scale,
      transformOrigin: "0% 0%",
    };
  }

  if (!cell) {
    return {
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "50% 50%",
    };
  }

  const centerXPercent = cell.layout.x + cell.layout.width / 2;
  const centerYPercent = cell.layout.y + cell.layout.height / 2;
  const centerX = viewport.width * (centerXPercent / 100);
  const centerY = viewport.height * (centerYPercent / 100);
  const estimatedWidth = viewport.width * (cell.layout.width / 100);
  const estimatedHeight = viewport.height * (cell.layout.height / 100);
  const scale = resolveTargetScale(estimatedWidth, estimatedHeight, viewport, portrait);

  return {
    x: viewport.width / 2 - centerX * scale,
    y: viewport.height * vertCenterRatio - centerY * scale,
    scale,
    transformOrigin: "0% 0%",
  };
}