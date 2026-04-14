"use client";

import { useCallback, useMemo } from "react";
import {
  GrammarBoardCell,
  GrammarBoardCellPointsBadge,
} from "@/features/graph/grammar/components/board/cells/GrammarBoardCell";
import { useGrammarBoardViewport } from "../../hooks/useGrammarBoardViewport";
import type { GrammarBoardViewModel } from "../../types";
import { GrammarBoardBackdrop } from "./overlays/GrammarBoardBackdrop";

type GrammarBoardLoadStatus = "idle" | "loading" | "error" | "success";

interface GrammarBoardProps {
  board: GrammarBoardViewModel;
  status: GrammarBoardLoadStatus;
  onSelectLesson: (lessonId: string) => void;
}

function getCellCenter(cell: GrammarBoardViewModel["cells"][number]) {
  return {
    x: cell.layout.x + cell.layout.width / 2,
    y: cell.layout.y + cell.layout.height / 2,
  };
}

function getBadgePosition(
  sourceCell: GrammarBoardViewModel["cells"][number],
  targetCell: GrammarBoardViewModel["cells"][number],
) {
  const sourceCenter = getCellCenter(sourceCell);
  const targetCenter = getCellCenter(targetCell);
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const sourceEdgeX =
      dx >= 0
        ? sourceCell.layout.x + sourceCell.layout.width
        : sourceCell.layout.x;
    const targetEdgeX =
      dx >= 0
        ? targetCell.layout.x
        : targetCell.layout.x + targetCell.layout.width;

    return {
      left: (sourceEdgeX + targetEdgeX) / 2,
      top: (sourceCenter.y + targetCenter.y) / 2,
    };
  }

  const sourceEdgeY =
    dy >= 0
      ? sourceCell.layout.y + sourceCell.layout.height
      : sourceCell.layout.y;
  const targetEdgeY =
    dy >= 0
      ? targetCell.layout.y
      : targetCell.layout.y + targetCell.layout.height;

  return {
    left: (sourceCenter.x + targetCenter.x) / 2,
    top: (sourceEdgeY + targetEdgeY) / 2,
  };
}

export function GrammarBoard({
  board,
  status,
  onSelectLesson,
}: GrammarBoardProps) {
  const {
    viewportRef,
    scale,
    isDragging,
    worldStyle,
    shouldSuppressClick,
    viewportProps,
  } = useGrammarBoardViewport();

  const handleSelect = useCallback(
    (lessonId: string) => {
      if (shouldSuppressClick()) {
        return;
      }

      onSelectLesson(lessonId);
    },
    [onSelectLesson, shouldSuppressClick],
  );

  const cellsById = useMemo(
    () => new Map(board.cells.map((cell) => [cell.progress.id, cell])),
    [board.cells],
  );

  return (
    <div
      ref={viewportRef}
      className={`absolute inset-0 overflow-hidden bg-surface-primary touch-none select-none ${
        isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-zoom-in"
      }`}
      {...viewportProps}
    >
      <div className="relative h-full w-full">
        <div style={worldStyle}>
          <div className="h-full w-full bg-[linear-gradient(180deg,var(--surface-primary),var(--surface-secondary))] dark:bg-[linear-gradient(180deg,rgba(14,14,16,1),rgba(9,10,12,1))] p-4 sm:p-5 lg:p-6">
            <div className="relative h-full w-full overflow-hidden rounded-[30px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,245,246,0.96))] shadow-[0_18px_50px_-28px_rgba(17,24,39,0.22),0_34px_90px_-52px_rgba(17,24,39,0.16)] dark:border-white/[0.06] dark:bg-[linear-gradient(180deg,rgba(23,24,27,0.98),rgba(12,13,15,0.98))] dark:shadow-[0_30px_70px_-34px_rgba(0,0,0,0.76)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_18%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0)_16%)]" />

              <div className="absolute inset-[14px] overflow-hidden rounded-[24px] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,241,242,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-white/[0.05] dark:bg-[linear-gradient(180deg,rgba(19,20,22,0.98),rgba(13,14,16,0.98))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <GrammarBoardBackdrop />

                <div className="relative z-10 h-full w-full">
                  {board.cells.map((cell) => (
                    <GrammarBoardCell
                      key={cell.progress.id}
                      cell={cell}
                      onSelect={handleSelect}
                    />
                  ))}

                  <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
                    {board.path.map((segment) => {
                      const sourceCell = cellsById.get(segment.fromId);
                      const targetCell = cellsById.get(segment.toId);

                      if (!sourceCell || !targetCell) {
                        return null;
                      }

                      const badgePosition = getBadgePosition(sourceCell, targetCell);

                      return (
                        <GrammarBoardCellPointsBadge
                          key={`badge-${segment.id}`}
                          cell={targetCell}
                          left={badgePosition.left}
                          top={badgePosition.top}
                        />
                      );
                    })}
                  </div>

                  {status === "loading" && (
                    <div className="pointer-events-none absolute inset-0 animate-pulse bg-[linear-gradient(120deg,rgba(15,23,42,0),rgba(15,23,42,0.07),rgba(15,23,42,0))] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0),rgba(255,255,255,0.05),rgba(255,255,255,0))]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}