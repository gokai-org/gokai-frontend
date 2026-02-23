"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface KanjiStrokePlayerProps {
  viewBox: string;
  strokes: string[];
  /** Index of the stroke the user should draw next (-1 = show all) */
  activeStrokeIndex?: number;
  /** Show stroke order numbers */
  showNumbers?: boolean;
  /** Callback when user clicks a stroke */
  onStrokeClick?: (index: number) => void;
  /** Size in px (square) */
  size?: number;
}

/**
 * Renders an SVG kanji with individual strokes.
 * - Past strokes: solid dark
 * - Active stroke: animated red
 * - Future strokes: light guide
 */
export function KanjiStrokePlayer({
  viewBox,
  strokes,
  activeStrokeIndex = -1,
  showNumbers = false,
  onStrokeClick,
  size = 300,
}: KanjiStrokePlayerProps) {
  const [animatedLengths, setAnimatedLengths] = useState<number[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  // Measure every path length once rendered
  useEffect(() => {
    const lengths = pathRefs.current.map((p) =>
      p ? p.getTotalLength() : 0
    );
    setAnimatedLengths(lengths);
  }, [strokes]);

  const setPathRef = useCallback(
    (index: number) => (el: SVGPathElement | null) => {
      pathRefs.current[index] = el;
    },
    []
  );

  const showAll = activeStrokeIndex === -1;

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      className="select-none"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* Grid guide lines */}
      <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3 3" />
      <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3 3" />

      {strokes.map((d, i) => {
        const len = animatedLengths[i] || 0;
        let strokeColor: string;
        let strokeOpacity: number;
        let animate = false;

        if (showAll) {
          strokeColor = "#1a1a1a";
          strokeOpacity = 1;
        } else if (i < activeStrokeIndex) {
          // Already drawn
          strokeColor = "#1a1a1a";
          strokeOpacity = 1;
        } else if (i === activeStrokeIndex) {
          // Active – animate
          strokeColor = "#993331";
          strokeOpacity = 1;
          animate = true;
        } else {
          // Future – faint guide
          strokeColor = "#d1d5db";
          strokeOpacity = 0.5;
        }

        return (
          <g key={i}>
            <path
              ref={setPathRef(i)}
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={strokeOpacity}
              style={
                animate && len > 0
                  ? {
                      strokeDasharray: len,
                      strokeDashoffset: len,
                      animation: `kanji-draw ${Math.max(0.4, len / 200)}s ease forwards`,
                    }
                  : undefined
              }
              onClick={() => onStrokeClick?.(i)}
              className={onStrokeClick ? "cursor-pointer" : undefined}
            />
            {/* Stroke order number */}
            {showNumbers && len > 0 && (
              <StrokeNumber pathRef={pathRefs.current[i]} index={i} />
            )}
          </g>
        );
      })}

      {/* Inline keyframe for drawing animation */}
      <style>{`
        @keyframes kanji-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

/** Small circled number at the start of a stroke path */
function StrokeNumber({
  pathRef,
  index,
}: {
  pathRef: SVGPathElement | null;
  index: number;
}) {
  if (!pathRef) return null;
  const pt = pathRef.getPointAtLength(0);
  return (
    <g>
      <circle cx={pt.x} cy={pt.y} r={5} fill="#993331" />
      <text
        x={pt.x}
        y={pt.y + 1.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={6}
        fontWeight="bold"
      >
        {index + 1}
      </text>
    </g>
  );
}
