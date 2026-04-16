import type { GrammarBoardPoint } from "../types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

export function roundTo(value: number, precision = 3) {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
}

export function easeInOutSine(value: number) {
  return 0.5 - Math.cos(Math.PI * value) / 2;
}

export function getDistance(from: GrammarBoardPoint, to: GrammarBoardPoint) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function getSuperellipsePoint(
  angle: number,
  radiusX: number,
  radiusY: number,
  exponent: number,
): GrammarBoardPoint {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const power = 2 / exponent;

  return {
    x: Math.sign(cos) * Math.abs(cos) ** power * radiusX,
    y: Math.sign(sin) * Math.abs(sin) ** power * radiusY,
  };
}

export function getEllipseEdgePoint(
  center: GrammarBoardPoint,
  halfWidth: number,
  halfHeight: number,
  direction: GrammarBoardPoint,
  padding = 0,
): GrammarBoardPoint {
  const adjustedHalfWidth = Math.max(halfWidth - padding, 0.01);
  const adjustedHalfHeight = Math.max(halfHeight - padding, 0.01);
  const denominator = Math.hypot(
    direction.x / adjustedHalfWidth,
    direction.y / adjustedHalfHeight,
  );

  if (denominator === 0) {
    return center;
  }

  return {
    x: center.x + direction.x / denominator,
    y: center.y + direction.y / denominator,
  };
}