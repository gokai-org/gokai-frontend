/**
 * Stroke validation utilities for kanji writing practice.
 * Compares user-drawn strokes against reference SVG paths.
 */

export interface StrokeValidationResult {
  /** 0-100 accuracy score */
  accuracy: number;
  /** Whether the stroke is considered correct (accuracy >= threshold) */
  isCorrect: boolean;
  /** Feedback message */
  feedback: "perfect" | "good" | "acceptable" | "poor" | "miss";
}

export interface StrokePoint {
  x: number;
  y: number;
}

const ACCURACY_THRESHOLDS = {
  perfect: 85,
  good: 65,
  acceptable: 40,
  pass: 40, // minimum to count as correct
} as const;

const POINT_PENALTIES = {
  perfect: 0,
  good: -2,
  acceptable: -5,
  poor: -10,
  miss: -15,
} as const;

/**
 * Sample points along an SVG path string for comparison.
 */
export function sampleSvgPath(
  pathD: string,
  viewBox: string,
  numSamples = 20
): StrokePoint[] {
  if (typeof document === "undefined") return [];

  try {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const vb = viewBox.split(/\s+/).map(Number);
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("width", String(vb[2] || 109));
    svg.setAttribute("height", String(vb[3] || 109));

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathD);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const totalLen = path.getTotalLength();
    const points: StrokePoint[] = [];

    for (let i = 0; i < numSamples; i++) {
      const t = (i / (numSamples - 1)) * totalLen;
      const pt = path.getPointAtLength(t);
      points.push({ x: pt.x, y: pt.y });
    }

    document.body.removeChild(svg);
    return points;
  } catch {
    return [];
  }
}

/**
 * Simplify a drawn stroke by keeping every nth point (Douglas-Peucker-lite).
 */
export function simplifyStroke(
  points: StrokePoint[],
  targetCount = 20
): StrokePoint[] {
  if (points.length <= targetCount) return points;

  const step = (points.length - 1) / (targetCount - 1);
  const result: StrokePoint[] = [];
  for (let i = 0; i < targetCount; i++) {
    const idx = Math.round(i * step);
    result.push(points[Math.min(idx, points.length - 1)]);
  }
  return result;
}

/**
 * Compute average distance between two ordered point arrays (DTW-lite).
 * Returns a value in viewBox units.
 */
function averagePointDistance(
  a: StrokePoint[],
  b: StrokePoint[]
): number {
  if (a.length === 0 || b.length === 0) return Infinity;

  let totalDist = 0;
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const ai = a[Math.floor((i / len) * a.length)];
    const bi = b[Math.floor((i / len) * b.length)];
    const dx = ai.x - bi.x;
    const dy = ai.y - bi.y;
    totalDist += Math.sqrt(dx * dx + dy * dy);
  }

  return totalDist / len;
}

/**
 * Check if the general stroke direction matches (start→end vector).
 */
function directionScore(
  ref: StrokePoint[],
  drawn: StrokePoint[]
): number {
  if (ref.length < 2 || drawn.length < 2) return 0;

  const refDx = ref[ref.length - 1].x - ref[0].x;
  const refDy = ref[ref.length - 1].y - ref[0].y;
  const drawnDx = drawn[drawn.length - 1].x - drawn[0].x;
  const drawnDy = drawn[drawn.length - 1].y - drawn[0].y;

  const refLen = Math.sqrt(refDx * refDx + refDy * refDy) || 1;
  const drawnLen = Math.sqrt(drawnDx * drawnDx + drawnDy * drawnDy) || 1;

  // Cosine similarity
  const dot = (refDx * drawnDx + refDy * drawnDy) / (refLen * drawnLen);
  // -1..1 → 0..100
  return Math.max(0, Math.min(100, (dot + 1) * 50));
}

/**
 * Validate a user-drawn stroke against the reference SVG path.
 */
export function validateStroke(
  drawnPoints: StrokePoint[],
  refPathD: string,
  viewBox: string
): StrokeValidationResult {
  const refPoints = sampleSvgPath(refPathD, viewBox, 24);
  const simplified = simplifyStroke(drawnPoints, 24);

  if (refPoints.length === 0 || simplified.length < 2) {
    return { accuracy: 0, isCorrect: false, feedback: "miss" };
  }

  // viewBox diagonal for normalization
  const vb = viewBox.split(/\s+/).map(Number);
  const diagonal = Math.sqrt(
    (vb[2] || 109) ** 2 + (vb[3] || 109) ** 2
  );

  // Distance score: lower average distance = better
  const avgDist = averagePointDistance(refPoints, simplified);
  const distNorm = Math.max(0, 1 - avgDist / (diagonal * 0.35));
  const distScore = distNorm * 100;

  // Direction score
  const dirScore = directionScore(refPoints, simplified);

  // Combined: 70% distance, 30% direction
  const accuracy = Math.round(distScore * 0.7 + dirScore * 0.3);

  let feedback: StrokeValidationResult["feedback"];
  if (accuracy >= ACCURACY_THRESHOLDS.perfect) feedback = "perfect";
  else if (accuracy >= ACCURACY_THRESHOLDS.good) feedback = "good";
  else if (accuracy >= ACCURACY_THRESHOLDS.acceptable) feedback = "acceptable";
  else if (accuracy >= 20) feedback = "poor";
  else feedback = "miss";

  return {
    accuracy,
    isCorrect: accuracy >= ACCURACY_THRESHOLDS.pass,
    feedback,
  };
}

/**
 * Compute point change for a stroke result.
 */
export function getPointsForFeedback(
  feedback: StrokeValidationResult["feedback"],
  basePoints: number
): number {
  switch (feedback) {
    case "perfect":
      return basePoints;
    case "good":
      return Math.max(1, basePoints + POINT_PENALTIES.good);
    case "acceptable":
      return Math.max(0, basePoints + POINT_PENALTIES.acceptable);
    case "poor":
      return POINT_PENALTIES.poor;
    case "miss":
      return POINT_PENALTIES.miss;
  }
}

/**
 * Get a human-readable label for the feedback.
 */
export function getFeedbackLabel(
  feedback: StrokeValidationResult["feedback"]
): string {
  switch (feedback) {
    case "perfect":
      return "Perfecto";
    case "good":
      return "Bien";
    case "acceptable":
      return "Aceptable";
    case "poor":
      return "Impreciso";
    case "miss":
      return "Incorrecto";
  }
}

/**
 * Get a color for the feedback badge.
 */
export function getFeedbackColor(
  feedback: StrokeValidationResult["feedback"]
): string {
  switch (feedback) {
    case "perfect":
      return "text-green-600 bg-green-50 border-green-200";
    case "good":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "acceptable":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "poor":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "miss":
      return "text-red-600 bg-red-50 border-red-200";
  }
}
