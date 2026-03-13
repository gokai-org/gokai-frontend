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
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const lengths = pathRefs.current.map((p) => (p ? p.getTotalLength() : 0));
    setAnimatedLengths(lengths);
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
        stroke="#e5e7eb"
        strokeWidth="0.5"
        strokeDasharray="3 3"
      />
      <line
        x1="0"
        y1="54.5"
        x2="109"
        y2="54.5"
        stroke="#e5e7eb"
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
          strokeColor = "#993331";
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
                pathRef={pathRefs.current[i]}
                index={i}
              />
            )}
          </g>
        );
      })}

      <style>{`
        @keyframes kanji-draw {
          to { stroke-dashoffset: 0; }
        }

        /* pop-in for the number bubble */
        @keyframes kanji-num-in {
          0% { opacity: 0; transform: translateY(-2px) scale(0.75); }
          100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
      `}</style>
    </svg>
  );
}

function StrokeNumber({
  pathRef,
  index,
}: {
  pathRef: SVGPathElement | null;
  index: number;
}) {
  if (!pathRef) return null;

  const pt = pathRef.getPointAtLength(0);

  const ox = 2;
  const oy = -2;

  const cx = pt.x + ox;
  const cy = pt.y + oy;

  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: "kanji-num-in 220ms ease-out both",
      }}
    >
      <circle cx={cx} cy={cy} r={5.2} fill="#993331" />
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
