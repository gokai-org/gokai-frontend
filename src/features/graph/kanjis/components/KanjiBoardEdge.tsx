"use client";

import { memo } from "react";
import { getBezierPath, type EdgeProps } from "reactflow";
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
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const status        = data?.status        ?? "locked";
  const highlight     = data?.highlight     ?? false;
  const widthScale    = data?.widthScale    ?? 1;
  const opacityScale  = data?.opacityScale  ?? 1;
  const showLockedDash = data?.showLockedDash ?? true;
  const qualityTier   = data?.qualityTier   ?? "medium";
  const unlocking     = data?.unlocking     ?? false;

  const isHighQuality  = qualityTier === "high";
  const isMediumOrHigh = qualityTier !== "low";

  const palette =
    status === "completed"
      ? {
          stroke: "var(--kanji-edge-completed-stroke)",
          width: (highlight ? 3.0 : 2.5) * widthScale,
          opacity: (highlight ? 0.97 : 0.90) * opacityScale,
          dash: undefined,
        }
      : status === "available"
        ? {
            stroke: "var(--kanji-edge-available-stroke)",
            width: (highlight ? 2.2 : 2.0) * widthScale,
            opacity: (highlight ? 0.84 : 0.76) * opacityScale,
            dash: "5 10",
          }
        : {
            stroke: "var(--kanji-edge-locked-stroke)",
            width: 1.2 * widthScale,
            opacity: 0.16 * opacityScale,
            dash: showLockedDash ? "3 9" : undefined,
          };

  const showAtmosphericBloom = status === "completed" && isHighQuality;   // high only
  const showRimLight         = status === "completed" && isMediumOrHigh;  // medium + high
  const showBrightCenter     = status === "completed" && isHighQuality;   // high only
  const showAvailableGlow    = status === "available" && isMediumOrHigh;
  const showDualDash         = status === "available" && isHighQuality && !unlocking; // high only

  return (
    <>
      {/* ── Completed: atmospheric bloom (wide, very faint) — high only ── */}
      {showAtmosphericBloom && (
        <path
          d={path}
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width * 8,
            opacity: palette.opacity * 0.07,
            strokeLinecap: "round",
            pointerEvents: "none",
          }}
          fill="none"
          aria-hidden="true"
        />
      )}

      {/* ── Completed: rim light (inner halo) — medium + high ── */}
      {showRimLight && (
        <path
          d={path}
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width * 3.5,
            opacity: palette.opacity * 0.18,
            strokeLinecap: "round",
            pointerEvents: "none",
          }}
          fill="none"
          aria-hidden="true"
        />
      )}

      {/* ── Available: soft outer glow ── */}
      {showAvailableGlow && (
        <path
          d={path}
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width * 5,
            opacity: palette.opacity * 0.06,
            strokeLinecap: "round",
            pointerEvents: "none",
          }}
          fill="none"
          aria-hidden="true"
        />
      )}

      {/* ── Available: staggered secondary dash for energy-particle effect ── */}
      {showDualDash && (
        <path
          d={path}
          className="kanji-edge-available"
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width * 0.65,
            opacity: palette.opacity * 0.55,
            strokeLinecap: "round",
            strokeDasharray: "3 12",
            animationDelay: "0.4s",
            pointerEvents: "none",
          }}
          fill="none"
          aria-hidden="true"
        />
      )}

      {/* ── Core stroke ── */}
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

      {/* ── Completed: bright center thread (high quality only) ── */}
      {showBrightCenter && (
        <path
          d={path}
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width * 0.4,
            opacity: palette.opacity * 0.45,
            strokeLinecap: "round",
            pointerEvents: "none",
          }}
          fill="none"
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default memo(KanjiBoardEdge, (previous, next) => {
  return (
    previous.sourceX === next.sourceX &&
    previous.sourceY === next.sourceY &&
    previous.targetX === next.targetX &&
    previous.targetY === next.targetY &&
    previous.data?.status      === next.data?.status &&
    previous.data?.highlight   === next.data?.highlight &&
    previous.data?.qualityTier === next.data?.qualityTier &&
    previous.data?.unlocking   === next.data?.unlocking
  );
});
