"use client";

import { memo } from "react";
import { getStraightPath, type EdgeProps } from "reactflow";
import type { GrammarBoardEdgeData, GrammarBoardStatus } from "../../types";

const PINK_PALETTE: Record<GrammarBoardStatus, { stroke: string; width: number; opacity: number }> = {
  completed: { stroke: "rgba(219,39,119,0.88)", width: 2.3,  opacity: 0.9  },
  available: { stroke: "rgba(219,39,119,0.65)", width: 2.1,  opacity: 0.8  },
  locked:    { stroke: "rgba(120,36,60,0.32)",  width: 1.7,  opacity: 0.42 },
};

function GrammarBoardEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<GrammarBoardEdgeData>) {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const status   = data?.status   ?? "locked";
  const wScale   = data?.widthScale  ?? 1;
  const oScale   = data?.opacityScale ?? 1;
  const palette  = PINK_PALETTE[status];

  return (
    <g>
      <path
        id={id}
        d={path}
        fill="none"
        style={{
          stroke:       palette.stroke,
          strokeWidth:  palette.width * wScale,
          opacity:      palette.opacity * oScale,
          strokeLinecap: "round",
        }}
      />
    </g>
  );
}

export default memo(GrammarBoardEdge);
