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
    curvature: data?.curvature ?? 0.42,
  });

  const status = data?.status ?? "locked";
  const highlight = data?.highlight ?? false;
  const widthScale = data?.widthScale ?? 1;
  const opacityScale = data?.opacityScale ?? 1;
  const showLockedDash = data?.showLockedDash ?? true;

  const palette =
    status === "completed"
      ? {
          stroke: "rgba(196, 68, 66, 0.72)",
          width: (highlight ? 3 : 2.35) * widthScale,
          opacity: (highlight ? 0.96 : 0.8) * opacityScale,
          dash: undefined,
        }
      : status === "available"
        ? {
            stroke: "rgba(196, 68, 66, 0.48)",
            width: (highlight ? 2.6 : 2) * widthScale,
            opacity: (highlight ? 0.86 : 0.68) * opacityScale,
            dash: "8 14",
          }
        : {
            stroke: "rgba(140, 140, 145, 0.28)",
            width: 1.8 * widthScale,
            opacity: 0.46 * opacityScale,
            dash: showLockedDash ? "6 12" : undefined,
          };

  return (
    <>
      <path
        id={id}
        d={path}
        style={{
          stroke: palette.stroke,
          strokeWidth: palette.width,
          opacity: palette.opacity,
          strokeLinecap: "round",
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
