"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface DrawnStroke {
  points: { x: number; y: number }[];
}

interface KanaWritingCanvasProps {
  viewBox: string;
  guideStrokes: string[];
  activeStrokeIndex: number;
  onStrokeDrawn: (stroke: DrawnStroke) => void;
  size?: number;
  disabled?: boolean;
  flashError?: boolean;
}

export function KanaWritingCanvas({
  viewBox,
  guideStrokes,
  activeStrokeIndex,
  onStrokeDrawn,
  size = 300,
  disabled = false,
  flashError = false,
}: KanaWritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const completedStrokes = useRef<DrawnStroke[]>([]);
  const rafId = useRef(0);

  const vbParts = viewBox.split(/\s+/).map(Number);
  const vbWidth = vbParts[2] || 109;
  const vbHeight = vbParts[3] || 109;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const sx = w / vbWidth;
    const sy = h / vbHeight;

    ctx.clearRect(0, 0, w, h);

    // Grid guides
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.restore();

    // SVG guide strokes (faint)
    ctx.save();
    ctx.setLineDash([]);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const lw = 3 * Math.min(sx, sy);
    for (let i = 0; i < guideStrokes.length; i++) {
      try {
        const p2d = new Path2D(scaleSvgPath(guideStrokes[i], sx, sy));
        ctx.strokeStyle =
          i < activeStrokeIndex
            ? "rgba(26,26,26,0.15)"
            : i === activeStrokeIndex
              ? "rgba(153,51,49,0.25)"
              : "rgba(209,213,219,0.3)";
        ctx.lineWidth = lw;
        ctx.stroke(p2d);
      } catch {
        /* skip invalid paths */
      }
    }
    ctx.restore();

    // Completed user strokes
    ctx.save();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of completedStrokes.current) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x * sx, stroke.points[0].y * sy);
      for (let j = 1; j < stroke.points.length; j++) {
        ctx.lineTo(stroke.points[j].x * sx, stroke.points[j].y * sy);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Current in-progress stroke
    const pts = currentPoints.current;
    if (pts.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#993331";
      ctx.lineWidth = 3.5 * Math.min(sx, sy);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0].x * sx, pts[0].y * sy);
      for (let j = 1; j < pts.length; j++) {
        ctx.lineTo(pts[j].x * sx, pts[j].y * sy);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [guideStrokes, activeStrokeIndex, vbWidth, vbHeight]);

  const scheduleRedraw = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(redraw);
  }, [redraw]);

  useEffect(() => {
    completedStrokes.current = [];
    scheduleRedraw();
  }, [activeStrokeIndex, scheduleRedraw]);

  useEffect(() => {
    scheduleRedraw();
    return () => cancelAnimationFrame(rafId.current);
  }, [scheduleRedraw]);

  const getCoords = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (vbWidth / rect.width),
        y: (e.clientY - rect.top) * (vbHeight / rect.height),
      };
    },
    [vbWidth, vbHeight],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      currentPoints.current = [getCoords(e)];
      scheduleRedraw();
    },
    [disabled, getCoords, scheduleRedraw],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || disabled) return;
      e.preventDefault();
      const pt = getCoords(e);
      const last = currentPoints.current[currentPoints.current.length - 1];
      if (last) {
        const dx = pt.x - last.x;
        const dy = pt.y - last.y;
        if (dx * dx + dy * dy < 0.25) return;
      }
      currentPoints.current.push(pt);
      scheduleRedraw();
    },
    [disabled, getCoords, scheduleRedraw],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || disabled) return;
      e.preventDefault();
      isDrawingRef.current = false;
      if (currentPoints.current.length >= 2) {
        const drawnStroke: DrawnStroke = { points: [...currentPoints.current] };
        completedStrokes.current.push(drawnStroke);
        onStrokeDrawn(drawnStroke);
      } else if (currentPoints.current.length === 1) {
        // Keep parity with kanji practice: a tap still counts as a miss attempt.
        const drawnStroke: DrawnStroke = {
          points: [...currentPoints.current, currentPoints.current[0]],
        };
        completedStrokes.current.push(drawnStroke);
        onStrokeDrawn(drawnStroke);
      }
      currentPoints.current = [];
      scheduleRedraw();
    },
    [disabled, onStrokeDrawn, scheduleRedraw],
  );

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const canvasPx = size * dpr;

  return (
    <canvas
      ref={canvasRef}
      width={canvasPx}
      height={canvasPx}
      className={`touch-none rounded-xl border-2 bg-white transition-colors duration-200 ${
        flashError ? "border-red-400" : "border-neutral-200"
      }`}
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
        cursor: disabled ? "not-allowed" : "crosshair",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}

// ── Helpers ─────────────────────────────────────────────────

function scaleSvgPath(d: string, sx: number, sy: number): string {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g);
  if (!tokens) return d;

  let result = "";
  let numIdx = 0;
  let lastCmd = "";

  for (const tok of tokens) {
    if (/[a-zA-Z]/.test(tok)) {
      result += tok;
      lastCmd = tok;
      numIdx = 0;
    } else {
      const n = parseFloat(tok);
      const isRelative = lastCmd === lastCmd.toLowerCase();
      if (isRelative) {
        result += (numIdx % 2 === 0 ? n * sx : n * sy).toFixed(2) + " ";
      } else {
        result += (numIdx % 2 === 0 ? n * sx : n * sy).toFixed(2) + " ";
      }
      numIdx++;
    }
  }
  return result;
}
