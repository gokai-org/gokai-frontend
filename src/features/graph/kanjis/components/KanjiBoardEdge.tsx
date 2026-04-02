"use client";

import { memo } from "react";
import { getSmoothStepPath, type EdgeProps } from "reactflow";
import type { KanjiBoardEdgeData } from "../types";

function KanjiBoardEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<KanjiBoardEdgeData>) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
    offset: 40,
  });

  const status = data?.status ?? "locked";
  const highlight = data?.highlight ?? false;
  const widthScale = data?.widthScale ?? 1;
  const opacityScale = data?.opacityScale ?? 1;
  const showLockedDash = data?.showLockedDash ?? true;
  const showGlow = data?.qualityTier === "high" && status !== "locked";
  const unlocking = data?.unlocking ?? false;

  const palette =
    status === "completed"
      ? {
          stroke: "var(--kanji-edge-completed-stroke)",
          width: (highlight ? 2.8 : 2.2) * widthScale,
          opacity: (highlight ? 0.92 : 0.78) * opacityScale,
          dash: undefined,
        }
      : status === "available"
        ? {
            stroke: "var(--kanji-edge-available-stroke)",
            width: (highlight ? 2.4 : 1.9) * widthScale,
            opacity: (highlight ? 0.80 : 0.64) * opacityScale,
            dash: "8 14",
          }
        : {
            stroke: "var(--kanji-edge-locked-stroke)",
            width: 1.6 * widthScale,
            opacity: 0.22 * opacityScale,
            dash: showLockedDash ? "5 11" : undefined,
          };

  return (
    <>
      {/* Subtle glow halo — wider stroke replaces CSS blur (no GPU off-screen compositing) */}
      {showGlow && (
        <path
          d={path}
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width * 6,
            opacity: palette.opacity * 0.13,
            strokeLinecap: "round",
            pointerEvents: "none",
          }}
          fill="none"
          aria-hidden="true"
        />
      )}
      <path
        id={id}
        d={path}
        pathLength={unlocking ? 1 : undefined}
        className={[
          status === "available" && !unlocking ? "kanji-edge-available" : undefined,
          unlocking ? "kanji-edge-unlocking" : undefined,
        ].filter(Boolean).join(" ") || undefined}
        style={{
          stroke: palette.stroke,
          strokeWidth: palette.width,
          opacity: palette.opacity,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: unlocking ? 1 : palette.dash,
        }}
        fill="none"
      />
    </>
  );
}

export default memo(KanjiBoardEdge, (previous, next) => {
  return (
    previous.sourceX === next.sourceX &&
    previous.sourceY === next.sourceY &&
    previous.targetX === next.targetX &&
    previous.targetY === next.targetY &&
    previous.data?.status === next.data?.status &&
    previous.data?.highlight === next.data?.highlight &&
    previous.data?.qualityTier === next.data?.qualityTier &&
    previous.data?.unlocking === next.data?.unlocking
  );
});
