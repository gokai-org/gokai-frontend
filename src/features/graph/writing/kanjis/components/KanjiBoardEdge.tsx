"use client";

import { memo } from "react";
import { getStraightPath, type EdgeProps } from "reactflow";
import type { KanjiBoardEdgeData } from "../types";
import { useMasteryTheme } from "@/features/mastery/components/MasteryThemeProvider";

function KanjiBoardEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<KanjiBoardEdgeData>) {
  const { isGolden } = useMasteryTheme();
  const [path, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const status = data?.status ?? "locked";
  const highlight = data?.highlight ?? false;
  const widthScale = data?.widthScale ?? 1;
  const opacityScale = data?.opacityScale ?? 1;
  const unlocking = data?.unlocking ?? false;

  const palette =
    status === "completed"
      ? {
          stroke: isGolden ? "var(--mastery-gold-edge-stroke)" : "var(--kanji-edge-completed-stroke)",
          width: (highlight ? 2.8 : 2.3) * widthScale,
          opacity: (highlight ? 0.96 : 0.88) * opacityScale,
        }
      : status === "available"
        ? {
            stroke: isGolden ? "var(--mastery-gold-edge-stroke)" : "var(--kanji-edge-available-stroke)",
            width: (highlight ? 2.4 : 2.1) * widthScale,
            opacity: (highlight ? 0.88 : 0.8) * opacityScale,
          }
        : {
            stroke: isGolden ? "var(--mastery-gold-edge-stroke)" : "var(--kanji-edge-locked-stroke)",
            width: 1.7 * widthScale,
            opacity: 0.42 * opacityScale,
          };

  return (
    <>
      <g>
        <path
          id={id}
          d={path}
          pathLength={unlocking ? 1 : undefined}
          className={unlocking ? "kanji-edge-unlocking" : undefined}
          style={{
            stroke: palette.stroke,
            strokeWidth: palette.width,
            opacity:
              status === "locked" ? palette.opacity * 0.92 : palette.opacity,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeDasharray: unlocking ? 1 : undefined,
          }}
          fill="none"
        />
      </g>
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
    previous.data?.unlocking === next.data?.unlocking &&
    previous.data?.requiredPoints === next.data?.requiredPoints
  );
});