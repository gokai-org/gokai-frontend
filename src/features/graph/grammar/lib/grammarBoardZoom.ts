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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveTargetScale(width: number, height: number, viewport: GrammarBoardViewportSize) {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const fittedWidthScale = (viewport.width * 0.72) / safeWidth;
  const fittedHeightScale = (viewport.height * 0.72) / safeHeight;

  return clamp(Math.min(fittedWidthScale, fittedHeightScale), 2.35, 4.4);
}

export function resolveGrammarBoardZoomTransform(
  cell: GrammarBoardCellViewModel | null,
  viewport: GrammarBoardViewportSize,
  targetRect?: GrammarBoardTargetRect | null,
): GrammarBoardZoomTransform {
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
    const scale = resolveTargetScale(targetRect.width, targetRect.height, viewport);

    return {
      x: viewport.width / 2 - centerX * scale,
      y: viewport.height / 2 - centerY * scale,
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
  const scale = resolveTargetScale(estimatedWidth, estimatedHeight, viewport);

  return {
    x: viewport.width / 2 - centerX * scale,
    y: viewport.height / 2 - centerY * scale,
    scale,
    transformOrigin: "0% 0%",
  };
}