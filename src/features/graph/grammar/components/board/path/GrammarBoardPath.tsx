import type {
  GrammarBoardStatus,
  GrammarBoardViewModel,
} from "../../../types";

const SEGMENT_THEME: Record<
  GrammarBoardStatus,
  { trace: string; line: string; glow: string; strokeWidth: number; opacity: number }
> = {
  completed: {
    trace: "rgba(224,117,128,0.1)",
    line: "rgba(206,103,116,0.44)",
    glow: "rgba(227,133,145,0.18)",
    strokeWidth: 1.45,
    opacity: 0.82,
  },
  available: {
    trace: "rgba(215,145,126,0.08)",
    line: "rgba(203,138,120,0.34)",
    glow: "rgba(219,161,139,0.14)",
    strokeWidth: 1.35,
    opacity: 0.76,
  },
  locked: {
    trace: "rgba(123,104,112,0.06)",
    line: "rgba(140,121,128,0.2)",
    glow: "rgba(123,104,112,0.08)",
    strokeWidth: 1.2,
    opacity: 0.52,
  },
};

function buildSegmentPath(
  segment: GrammarBoardViewModel["path"][number],
) {
  const dx = segment.to.x - segment.from.x;
  const dy = segment.to.y - segment.from.y;

  if (Math.abs(dx) < 1 || Math.abs(dy) < 1) {
    return `M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`;
  }

  const horizontalFirst = Math.abs(dx) >= Math.abs(dy);
  const midX = horizontalFirst ? segment.from.x + dx / 2 : segment.from.x;
  const midY = horizontalFirst ? segment.from.y : segment.from.y + dy / 2;

  if (horizontalFirst) {
    return [
      `M ${segment.from.x} ${segment.from.y}`,
      `L ${midX} ${segment.from.y}`,
      `L ${midX} ${segment.to.y}`,
      `L ${segment.to.x} ${segment.to.y}`,
    ].join(" ");
  }

  return [
    `M ${segment.from.x} ${segment.from.y}`,
    `L ${segment.from.x} ${midY}`,
    `L ${segment.to.x} ${midY}`,
    `L ${segment.to.x} ${segment.to.y}`,
  ].join(" ");
}

interface GrammarBoardPathProps {
  board: GrammarBoardViewModel;
}

export function GrammarBoardPath({ board }: GrammarBoardPathProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${board.canvas.width} ${board.canvas.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {board.path.map((segment) => {
        const path = buildSegmentPath(segment);
        const theme = SEGMENT_THEME[segment.status];
        const highlighted =
          board.activeId === segment.fromId || board.activeId === segment.toId;

        return (
          <g key={segment.id}>
            <path
              d={path}
              fill="none"
              stroke={theme.trace}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={theme.strokeWidth * 7.2}
            />
            <path
              d={path}
              fill="none"
              stroke={theme.glow}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={theme.strokeWidth * (highlighted ? 3.5 : 2.4)}
              opacity={highlighted ? 0.95 : 0.72}
            />
            <path
              d={path}
              fill="none"
              stroke={theme.line}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={theme.strokeWidth * (highlighted ? 1.2 : 1)}
              opacity={highlighted ? 1 : theme.opacity}
              strokeDasharray={segment.status === "locked" ? "1.2 2.2" : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}