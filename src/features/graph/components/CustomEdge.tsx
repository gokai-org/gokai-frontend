"use client";

import { memo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  // Determinar el color basado en el estado
  const isCompleted = data?.status === "completed";
  const strokeColor = isCompleted ? "#993331" : "#6b7280";
  const strokeWidth = isCompleted ? 2.5 : 2;
  const opacity = isCompleted ? 0.5 : 0.35;

  return (
    <>
      {/* Línea principal */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          opacity,
          strokeLinecap: "round",
        }}
        fill="none"
      />

      {/* Línea de brillo para edges completados */}
      {isCompleted && (
        <path
          d={edgePath}
          style={{
            stroke: strokeColor,
            strokeWidth: strokeWidth + 4,
            opacity: 0.08,
            filter: "blur(4px)",
          }}
          fill="none"
        />
      )}
    </>
  );
}

export default memo(CustomEdge);
