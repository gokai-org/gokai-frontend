/**
 * Stroke validation utilities for kanji/kana writing practice.
 *
 * Algorithm (v2 — Japanese writing teacher approach):
 *  • 20% — Start position: brush must touch down near the expected start
 *  • 15% — End position: stroke must end near the expected end
 *  • 40% — Path shape: real Dynamic Time Warping on normalized coordinates
 *  • 15% — Multi-sample direction: checks direction at 5 equidistant segments
 *  • 10% — Length ratio: penalises strokes that are far too short or too long
 *  × Reversal multiplier: 0.5× if the stroke was drawn backwards
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
  pass: 40,
} as const;

const POINT_REWARDS = {
  perfect: 10,   // 100%
  good: 7,       // 70%
  acceptable: 4, // 40%
  poor: 1,       // small credit — don't punish beginners with negative
  miss: 0,
} as const;

/**
 * Module-level cache for sampled SVG path points.
 * Kanji stroke paths are stable per-kanji, so repeated validateStroke calls
 * (across practice attempts, quiz retries, component remounts) reuse computed
 * points instead of recreating DOM elements each time.
 *
 * Memory: ~20 kanjis × ~12 strokes × 24 points = ~5 760 {x,y} objects — trivial.
 */
const _samplePointsCache = new Map<string, StrokePoint[]>();

/**
 * Sample points along an SVG path string for comparison.
 * Results are memoized per (pathD, viewBox, numSamples).
 */
export function sampleSvgPath(
  pathD: string,
  viewBox: string,
  numSamples = 20,
): StrokePoint[] {
  if (typeof document === "undefined") return [];

  const cacheKey = `${pathD}|${viewBox}|${numSamples}`;
  const cached = _samplePointsCache.get(cacheKey);
  if (cached) return cached;

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
    _samplePointsCache.set(cacheKey, points);
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
  targetCount = 20,
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

// ── Internal helpers for v2 algorithm ──────────────────────────────────────

function ptDist(a: StrokePoint, b: StrokePoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Normalise a set of points into [0,1]² space using the viewBox dimensions. */
function normalisePoints(
  pts: StrokePoint[],
  vbW: number,
  vbH: number,
): StrokePoint[] {
  return pts.map((p) => ({ x: p.x / vbW, y: p.y / vbH }));
}

/** Total arc length of a polyline. */
function polylineLength(pts: StrokePoint[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += ptDist(pts[i - 1], pts[i]);
  return len;
}

/**
 * Real Dynamic Time Warping on normalised [0,1]² point sets.
 * Space-optimised (two rows). Returns the average per-step cost so the
 * result is independent of sequence length.
 */
function computeDTW(a: StrokePoint[], b: StrokePoint[]): number {
  const n = a.length;
  const m = b.length;
  let prev = new Array<number>(m + 1).fill(Infinity);
  let curr = new Array<number>(m + 1).fill(Infinity);
  prev[0] = 0;
  for (let i = 1; i <= n; i++) {
    curr[0] = Infinity;
    for (let j = 1; j <= m; j++) {
      const cost = ptDist(a[i - 1], b[j - 1]);
      curr[j] = cost + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[m] / (n + m);
}

/**
 * Check direction at `numSegments` equidistant intervals along both sequences.
 * Returns 0-100.
 */
function multiSampleDirection(
  ref: StrokePoint[],
  drawn: StrokePoint[],
  numSegments = 5,
): number {
  if (ref.length < 2 || drawn.length < 2) return 50;
  let total = 0;
  for (let seg = 0; seg < numSegments; seg++) {
    const ri0 = Math.floor((seg / numSegments) * (ref.length - 1));
    const ri1 = Math.min(
      ri0 + Math.max(1, Math.floor(ref.length / numSegments)),
      ref.length - 1,
    );
    const di0 = Math.floor((seg / numSegments) * (drawn.length - 1));
    const di1 = Math.min(
      di0 + Math.max(1, Math.floor(drawn.length / numSegments)),
      drawn.length - 1,
    );
    const rdx = ref[ri1].x - ref[ri0].x;
    const rdy = ref[ri1].y - ref[ri0].y;
    const ddx = drawn[di1].x - drawn[di0].x;
    const ddy = drawn[di1].y - drawn[di0].y;
    const rl = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
    const dl = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
    const dot = (rdx * ddx + rdy * ddy) / (rl * dl); // -1..1
    total += Math.max(0, Math.min(100, (dot + 1) * 50));
  }
  return total / numSegments;
}

/**
 * Score based on how close the drawn-stroke length is to the reference length.
 * Uses a log-scale penalty, so a stroke that is 2× too long or 2× too short
 * loses about 30 points; 4× loses ~70 points.
 */
function lengthRatioScore(drawn: number, ref: number): number {
  if (ref <= 0) return 100;
  if (drawn <= 0) return 0;
  const ratio = drawn / ref;
  const logRatio = Math.abs(Math.log(ratio)); // 0 = perfect
  // log(5) ≈ 1.61 → maps to 0%; log(1) = 0 → maps to 100%
  return Math.max(0, Math.min(100, (1 - logRatio / Math.log(5)) * 100));
}

/**
 * Detect if the user drew the stroke in reverse order.
 * Returns true when the drawn start is much closer to the reference END
 * than to the reference START — and vice-versa for the endpoints.
 */
function isReversed(
  drawn: StrokePoint[],
  ref: StrokePoint[],
  vbSize: number,
): boolean {
  if (drawn.length < 2 || ref.length < 2) return false;
  const threshold = vbSize * 0.2;
  const startToRefStart = ptDist(drawn[0], ref[0]);
  const startToRefEnd = ptDist(drawn[0], ref[ref.length - 1]);
  if (startToRefEnd < threshold && startToRefEnd < startToRefStart * 0.7) {
    const endToRefStart = ptDist(drawn[drawn.length - 1], ref[0]);
    return endToRefStart < threshold;
  }
  return false;
}

/**
 * Validate a user-drawn stroke against the reference SVG path.
 *
 * Scoring breakdown (sums to 100%):
 *  20% — start-point proximity
 *  15% — end-point proximity
 *  40% — full-path shape via real DTW (normalised coordinates)
 *  15% — multi-sample direction (5 segments)
 *  10% — stroke length ratio
 *  × 0.5 multiplier if the stroke was drawn backwards
 */
export function validateStroke(
  drawnPoints: StrokePoint[],
  refPathD: string,
  viewBox: string,
): StrokeValidationResult {
  const NUM_SAMPLES = 30;
  const refPoints = sampleSvgPath(refPathD, viewBox, NUM_SAMPLES);
  const simplified = simplifyStroke(drawnPoints, NUM_SAMPLES);

  if (refPoints.length === 0 || simplified.length < 2) {
    return { accuracy: 0, isCorrect: false, feedback: "miss" };
  }

  const vb = viewBox.split(/\s+/).map(Number);
  const vbW = vb[2] || 109;
  const vbH = vb[3] || 109;
  const vbSize = Math.max(vbW, vbH);

  // ── 1. Start point (20%) ──────────────────────────────────────────────────
  const startDist = ptDist(simplified[0], refPoints[0]);
  const startScore = Math.max(0, (1 - startDist / (vbSize * 0.18)) * 100);

  // ── 2. End point (15%) ───────────────────────────────────────────────────
  const endDist = ptDist(
    simplified[simplified.length - 1],
    refPoints[refPoints.length - 1],
  );
  const endScore = Math.max(0, (1 - endDist / (vbSize * 0.18)) * 100);

  // ── 3. Path shape via DTW (40%) ──────────────────────────────────────────
  const normRef = normalisePoints(refPoints, vbW, vbH);
  const normDrawn = normalisePoints(simplified, vbW, vbH);
  const dtwDist = computeDTW(normRef, normDrawn); // avg step cost in [0,1]²
  // dtwDist ≈ 0 → perfect shape; 0.35 → very poor
  const shapeScore = Math.max(0, (1 - dtwDist / 0.35) * 100);

  // ── 4. Multi-sample direction (15%) ──────────────────────────────────────
  const dirScore = multiSampleDirection(normRef, normDrawn, 5);

  // ── 5. Length ratio (10%) ────────────────────────────────────────────────
  const refLength = polylineLength(refPoints);
  const drawnLength = polylineLength(simplified);
  const lenScore = lengthRatioScore(drawnLength, refLength);

  // ── Combined ─────────────────────────────────────────────────────────────
  const reversalPenalty = isReversed(simplified, refPoints, vbSize) ? 0.5 : 1.0;
  const rawAccuracy =
    (startScore * 0.2 +
      endScore * 0.15 +
      shapeScore * 0.4 +
      dirScore * 0.15 +
      lenScore * 0.1) *
    reversalPenalty;

  const accuracy = Math.round(Math.max(0, Math.min(100, rawAccuracy)));

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
 * Compute point reward for a stroke result.
 * No negative points — beginners should not be punished with score debts.
 */
export function getPointsForFeedback(
  feedback: StrokeValidationResult["feedback"],
  _basePoints: number,
): number {
  return POINT_REWARDS[feedback];
}

/**
 * Get a human-readable label for the feedback.
 */
export function getFeedbackLabel(
  feedback: StrokeValidationResult["feedback"],
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
  feedback: StrokeValidationResult["feedback"],
): string {
  switch (feedback) {
    case "perfect":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
    case "good":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    case "acceptable":
      return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
    case "poor":
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800";
    case "miss":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
  }
}
