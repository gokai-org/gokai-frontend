"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface KanjiStrokePlayerProps {
  viewBox: string;
  strokes: string[];
  activeStrokeIndex?: number;
  showNumbers?: boolean;
  numberMode?: "all" | "active" | "uptoActive";
  onStrokeClick?: (index: number) => void;
  size?: number;
}

export function KanjiStrokePlayer({
  viewBox,
  strokes,
  activeStrokeIndex = -1,
  showNumbers = false,
  numberMode = "active",
  onStrokeClick,
  size = 300,
}: KanjiStrokePlayerProps) {
  const [animatedLengths, setAnimatedLengths] = useState<number[]>([]);
  const [strokePositions, setStrokePositions] = useState<
    ({ cx: number; cy: number } | null)[]
  >([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const lengths = pathRefs.current.map((p) => (p ? p.getTotalLength() : 0));
      const positions = pathRefs.current.map((p) => {
        if (!p) return null;
        const pt = p.getPointAtLength(0);
        return { cx: pt.x + 2, cy: pt.y - 2 };
      });
      setAnimatedLengths(lengths);
      setStrokePositions(positions);
    });
    return () => cancelAnimationFrame(id);
  }, [strokes]);

  const setPathRef = useCallback(
    (index: number) => (el: SVGPathElement | null) => {
      pathRefs.current[index] = el;
    },
    [],
  );

  const showAll =
    activeStrokeIndex === -1 || activeStrokeIndex >= strokes.length;

  function shouldShowNumber(i: number) {
    if (!showNumbers) return false;
    if (showAll) return true;

    if (numberMode === "all") return true;
    if (numberMode === "uptoActive") return i <= activeStrokeIndex;
    return i === activeStrokeIndex;
  }

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      className="select-none"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {/* Grid guide lines */}
      <line
        x1="54.5"
        y1="0"
        x2="54.5"
        y2="109"
        stroke="var(--border-primary)"
        strokeWidth="0.5"
        strokeDasharray="3 3"
      />
      <line
        x1="0"
        y1="54.5"
        x2="109"
        y2="54.5"
        stroke="var(--border-primary)"
        strokeWidth="0.5"
        strokeDasharray="3 3"
      />

      {strokes.map((d, i) => {
        const len = animatedLengths[i] || 0;
        let strokeColor: string;
        let strokeOpacity: number;
        let animate = false;

        if (showAll) {
          strokeColor = "#1a1a1a";
          strokeOpacity = 1;
        } else if (i < activeStrokeIndex) {
          strokeColor = "#1a1a1a";
          strokeOpacity = 1;
        } else if (i === activeStrokeIndex) {
          strokeColor = "var(--accent)";
          strokeOpacity = 1;
          animate = true;
        } else {
          strokeColor = "#d1d5db";
          strokeOpacity = 0.5;
        }

        const renderNumber = shouldShowNumber(i) && len > 0;

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

            {renderNumber && (
              <StrokeNumber
                key={`${i}-${activeStrokeIndex}-${numberMode}`}
                pos={strokePositions[i] ?? null}
                index={i}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function StrokeNumber({
  pos,
  index,
}: {
  pos: { cx: number; cy: number } | null;
  index: number;
}) {
  if (!pos) return null;

  const { cx, cy } = pos;

  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: "kanji-num-in 220ms ease-out both",
      }}
    >
      <circle cx={cx} cy={cy} r={5.2} fill="var(--accent)" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={6}
        fontWeight={800}
        dy="0.1em"
      >
        {index + 1}
      </text>
    </g>
  );
}
