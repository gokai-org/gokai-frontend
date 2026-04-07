"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStraightPath, EdgeLabelRenderer, type EdgeProps } from "reactflow";
import type { WritingBoardEdgeData, WritingScriptType } from "../types";

const STROKE_VARS: Record<
  WritingScriptType,
  { completed: string; available: string; locked: string }
> = {
  hiragana: {
    completed: "var(--hiragana-edge-completed-stroke)",
    available: "var(--hiragana-edge-available-stroke)",
    locked: "var(--hiragana-edge-locked-stroke)",
  },
  katakana: {
    completed: "var(--katakana-edge-completed-stroke)",
    available: "var(--katakana-edge-available-stroke)",
    locked: "var(--katakana-edge-locked-stroke)",
  },
  kanji: {
    completed: "var(--kanji-edge-completed-stroke)",
    available: "var(--kanji-edge-available-stroke)",
    locked: "var(--kanji-edge-locked-stroke)",
  },
};

function WritingBoardEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<WritingBoardEdgeData>) {
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
  const scriptType = data?.scriptType ?? "hiragana";

  const requiredPoints = data?.requiredPoints;
  const vars = STROKE_VARS[scriptType];
  const labelStroke = status === "available" ? vars.available : vars.locked;

  const palette =
    status === "completed"
      ? {
          stroke: vars.completed,
          width: (highlight ? 2.8 : 2.3) * widthScale,
          opacity: (highlight ? 0.96 : 0.88) * opacityScale,
          dash: undefined,
        }
      : status === "available"
        ? {
            stroke: vars.available,
            width: (highlight ? 2.4 : 2.1) * widthScale,
            opacity: (highlight ? 0.88 : 0.8) * opacityScale,
            dash: undefined,
          }
        : {
            stroke: vars.locked,
            width: 1.7 * widthScale,
            opacity: 0.42 * opacityScale,
            dash: undefined,
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
          opacity: status === "locked" ? palette.opacity * 0.92 : palette.opacity,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeDasharray: unlocking ? 1 : undefined,
        }}
        fill="none"
      />
      </g>

      {/* ── Score label: required score to unlock this connection ── */}
      {requiredPoints != null && status !== "completed" && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
              zIndex: 10,
            }}
            className="nodrag nopan"
          >
            <AnimatePresence mode="wait">
              {unlocking ? (
                <motion.div
                  key="writing-score-complete"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: [0.4, 1.25, 1] }}
                  exit={{ opacity: 0, scale: 0.3, y: -10, transition: { duration: 0.3, ease: "easeIn" } }}
                  transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                  className="edge-score-label-complete"
                >
                  ✓
                </motion.div>
              ) : (
                <motion.div
                  key="writing-score"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
                  className="edge-score-label"
                  style={{
                    color: labelStroke,
                    borderColor: labelStroke,
                  }}
                >
                  <span className="edge-score-value">{requiredPoints}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(WritingBoardEdge, (previous, next) => {
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
