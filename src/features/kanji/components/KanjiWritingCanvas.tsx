"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface DrawnStroke {
  points: { x: number; y: number }[];
}

interface KanjiWritingCanvasProps {
  /** SVG viewBox of the reference kanji */
  viewBox: string;
  /** Reference stroke paths (shown as faint guides) */
  guideStrokes: string[];
  /** Index of the stroke the user is expected to draw */
  activeStrokeIndex: number;
  /** Called when user finishes a stroke */
  onStrokeDrawn: (stroke: DrawnStroke) => void;
  /** Size in px (square) */
  size?: number;
  /** Whether drawing is enabled */
  disabled?: boolean;
}

/**
 * A drawing canvas overlaid on a faint kanji guide.
 * The user traces strokes with mouse / touch / pen.
 */
export function KanjiWritingCanvas({
  viewBox,
  guideStrokes,
  activeStrokeIndex,
  onStrokeDrawn,
  size = 300,
  disabled = false,
}: KanjiWritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const completedStrokes = useRef<DrawnStroke[]>([]);

  // Parse viewBox numbers
  const vbParts = viewBox.split(/\s+/).map(Number);
  const vbWidth = vbParts[2] || 109;
  const vbHeight = vbParts[3] || 109;

  // Clear and redraw everything
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

    // ── Grid guides ──
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

    // ── SVG guide strokes (faint) ──
    ctx.save();
    ctx.setLineDash([]);
    guideStrokes.forEach((d, i) => {
      const path = new Path2D();
      // Scale the SVG path to canvas coordinates
      const scaledD = scaleSvgPath(d, sx, sy);
      try {
        const p2d = new Path2D(scaledD);
        ctx.strokeStyle =
          i < activeStrokeIndex
            ? "rgba(26,26,26,0.15)"
            : i === activeStrokeIndex
            ? "rgba(153,51,49,0.25)"
            : "rgba(209,213,219,0.3)";
        ctx.lineWidth = 3 * Math.min(sx, sy);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke(p2d);
      } catch {
        // Invalid path — skip
      }
    });
    ctx.restore();

    // ── Already-completed user strokes ──
    ctx.save();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3 * Math.min(sx, sy);
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

    // ── Current in-progress stroke ──
    if (currentPoints.current.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#993331";
      ctx.lineWidth = 3.5 * Math.min(sx, sy);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(
        currentPoints.current[0].x * sx,
        currentPoints.current[0].y * sy
      );
      for (let j = 1; j < currentPoints.current.length; j++) {
        ctx.lineTo(
          currentPoints.current[j].x * sx,
          currentPoints.current[j].y * sy
        );
      }
      ctx.stroke();
      ctx.restore();
    }
  }, [guideStrokes, activeStrokeIndex, vbWidth, vbHeight]);

  // Redraw on index change
  useEffect(() => {
    completedStrokes.current = [];
    redraw();
  }, [activeStrokeIndex, redraw]);

  // Initial draw
  useEffect(() => {
    redraw();
  }, [redraw]);

  const getCanvasCoords = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = vbWidth / rect.width;
    const sy = vbHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    currentPoints.current = [getCanvasCoords(e)];
    redraw();
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    currentPoints.current.push(getCanvasCoords(e));
    redraw();
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    setIsDrawing(false);
    if (currentPoints.current.length >= 2) {
      const drawnStroke: DrawnStroke = {
        points: [...currentPoints.current],
      };
      completedStrokes.current.push(drawnStroke);
      onStrokeDrawn(drawnStroke);
    }
    currentPoints.current = [];
    redraw();
  };

  // Canvas pixel size (for sharp rendering)
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const canvasPx = size * dpr;

  return (
    <canvas
      ref={canvasRef}
      width={canvasPx}
      height={canvasPx}
      className="touch-none rounded-xl border-2 border-neutral-200 bg-white"
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

/**
 * Very simple SVG path scaler: multiplies numeric coordinates by sx/sy.
 * Works for basic KanjiVG paths (M, L, C, S, Q, T, Z commands).
 */
function scaleSvgPath(d: string, sx: number, sy: number): string {
  // For simplicity, since KanjiVG uses absolute coords,
  // we scale every number pair: odd index → *sx  even index → *sy
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g);
  if (!tokens) return d;

  let result = "";
  let numIdx = 0;
  let lastCmd = "";

  for (const token of tokens) {
    if (/^[a-zA-Z]$/.test(token)) {
      lastCmd = token;
      numIdx = 0;
      result += token;
    } else {
      const num = parseFloat(token);
      // For absolute commands, alternate x/y scaling
      const isRelative = lastCmd === lastCmd.toLowerCase() && lastCmd !== "z";
      if (!isRelative) {
        result += (numIdx % 2 === 0 ? num * sx : num * sy).toFixed(2) + " ";
      } else {
        result += (numIdx % 2 === 0 ? num * sx : num * sy).toFixed(2) + " ";
      }
      numIdx++;
    }
  }

  return result;
}
