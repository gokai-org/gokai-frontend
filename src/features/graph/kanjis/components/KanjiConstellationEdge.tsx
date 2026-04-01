"use client";

import { memo } from "react";
import { getBezierPath, type EdgeProps } from "reactflow";
import type { KanjiConstellationEdgeData } from "../types";

function KanjiConstellationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<KanjiConstellationEdgeData>) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: data?.curvature ?? 0.36,
  });

  const status = data?.status ?? "locked";
  const highlight = data?.highlight ?? false;
  const widthScale = data?.widthScale ?? 1;
  const opacityScale = data?.opacityScale ?? 1;
  const showLockedDash = data?.showLockedDash ?? true;
  // Glow is shown only on high-tier hardware to keep low/medium cost-free.
  const showGlow = data?.qualityTier === "high" && status !== "locked";

  const palette =
    status === "completed"
      ? {
          stroke: "rgba(196, 68, 66, 0.78)",
          width: (highlight ? 2.8 : 2.2) * widthScale,
          opacity: (highlight ? 0.98 : 0.84) * opacityScale,
          dash: undefined,
        }
      : status === "available"
        ? {
            stroke: "rgba(196, 68, 66, 0.52)",
            width: (highlight ? 2.4 : 1.9) * widthScale,
            opacity: (highlight ? 0.88 : 0.72) * opacityScale,
            dash: "8 14",
          }
        : {
            stroke: "rgba(140, 140, 148, 0.26)",
            width: 1.6 * widthScale,
            opacity: 0.44 * opacityScale,
            dash: showLockedDash ? "5 11" : undefined,
          };

  return (
    <>
      {/* Subtle glow halo — GPU-composited blur, high tier only */}
      {showGlow && (
        <path
          d={path}
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width * 3.8,
            opacity: palette.opacity * 0.18,
            strokeLinecap: "round",
            filter: "blur(4px)",
            pointerEvents: "none",
          }}
          fill="none"
          aria-hidden="true"
        />
      )}
      <path
        id={id}
        d={path}
        style={{
          stroke: palette.stroke,
          strokeWidth: palette.width,
          opacity: palette.opacity,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: palette.dash,
        }}
        fill="none"
      />
    </>
  );
}

export default memo(KanjiConstellationEdge, (previous, next) => {
  return (
    previous.sourceX === next.sourceX &&
    previous.sourceY === next.sourceY &&
    previous.targetX === next.targetX &&
    previous.targetY === next.targetY &&
    previous.data?.status === next.data?.status &&
    previous.data?.highlight === next.data?.highlight &&
    previous.data?.qualityTier === next.data?.qualityTier
  );
});
