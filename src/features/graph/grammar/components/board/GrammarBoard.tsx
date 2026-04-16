"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef } from "react";
import {
  GrammarBoardCell,
  GrammarBoardCellPointsBadge,
} from "@/features/graph/grammar/components/board/cells/GrammarBoardCell";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { GrammarBoardBackdrop } from "./overlays/GrammarBoardBackdrop";
import GrammarBoardLoading from "./GrammarBoardLoading";
import type { GrammarBoardViewModel } from "../../types";

const BOARD_EASE = [0.22, 1, 0.36, 1] as const;

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

function getCellBounds(cell: GrammarBoardViewModel["cells"][number]) {
  return {
    left: cell.layout.x,
    right: cell.layout.x + cell.layout.width,
    top: cell.layout.y,
    bottom: cell.layout.y + cell.layout.height,
  };
}

function getBadgePosition(
  sourceCell: GrammarBoardViewModel["cells"][number],
  targetCell: GrammarBoardViewModel["cells"][number],
) {
  const sourceCenter = getCellCenter(sourceCell);
  const targetCenter = getCellCenter(targetCell);
  const sourceBounds = getCellBounds(sourceCell);
  const targetBounds = getCellBounds(targetCell);
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const sourceEdgeX = dx >= 0 ? sourceBounds.right : sourceBounds.left;
    const targetEdgeX = dx >= 0 ? targetBounds.left : targetBounds.right;
    const overlapTop = Math.max(sourceBounds.top, targetBounds.top);
    const overlapBottom = Math.min(sourceBounds.bottom, targetBounds.bottom);

    return {
      left: (sourceEdgeX + targetEdgeX) / 2,
      top:
        overlapBottom > overlapTop
          ? (overlapTop + overlapBottom) / 2
          : (sourceCenter.y + targetCenter.y) / 2,
    };
  }

  const sourceEdgeY = dy >= 0 ? sourceBounds.bottom : sourceBounds.top;
  const targetEdgeY = dy >= 0 ? targetBounds.top : targetBounds.bottom;
  const overlapLeft = Math.max(sourceBounds.left, targetBounds.left);
  const overlapRight = Math.min(sourceBounds.right, targetBounds.right);

  return {
    left:
      overlapRight > overlapLeft
        ? (overlapLeft + overlapRight) / 2
        : (sourceCenter.x + targetCenter.x) / 2,
    top: (sourceEdgeY + targetEdgeY) / 2,
  };
}

export function GrammarBoard({
  board,
  status,
  onSelectLesson,
}: GrammarBoardProps) {
  const showLoading = status === "idle" || status === "loading";
  const platformMotion = usePlatformMotion();
  const previousShowLoadingRef = useRef(showLoading);

  const handleSelect = useCallback(
    (lessonId: string) => {
      onSelectLesson(lessonId);
    },
    [onSelectLesson],
  );

  const cellsById = useMemo(
    () => new Map(board.cells.map((cell) => [cell.progress.id, cell])),
    [board.cells],
  );

  const entranceMode = platformMotion.entranceMode;
  const shouldAnimateBoardEntrance = platformMotion.shouldAnimate;
  const isLightEntrance = entranceMode === "light";
  const boardDuration = (isLightEntrance ? 0.34 : 0.46) * platformMotion.durationScale;
  const boardEntryOffset = isLightEntrance ? 10 : 20;
  const boardEntryScale = isLightEntrance ? 1 : 0.985;
  const boardExitScale = isLightEntrance ? 1 : 0.992;
  const shouldAnimateBoardReveal =
    shouldAnimateBoardEntrance && !showLoading && previousShowLoadingRef.current;

  previousShowLoadingRef.current = showLoading;

  return (
    <AnimatePresence initial={false} mode="wait">
      {showLoading ? (
        <motion.div
          key="grammar-board-loading"
          className="absolute inset-0"
          exit={
            shouldAnimateBoardEntrance
              ? {
                  opacity: 0,
                  scale: boardExitScale,
                  filter: "blur(8px)",
                  transition: {
                    duration: Math.max(0.2, boardDuration * 0.78),
                    ease: BOARD_EASE,
                  },
                }
              : undefined
          }
        >
          <GrammarBoardLoading />
        </motion.div>
      ) : (
        <motion.div
          key="grammar-board-content"
          className="absolute inset-0 overflow-hidden select-none"
          initial={
            shouldAnimateBoardReveal
              ? {
                  opacity: 0,
                  y: boardEntryOffset,
                  scale: boardEntryScale,
                  filter: "blur(12px)",
                }
              : false
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
              duration: boardDuration,
              ease: BOARD_EASE,
            },
          }}
        >
          <div className="relative h-full w-full">
            <GrammarBoardBackdrop />

            <div className="h-full w-full p-6 sm:p-8 lg:p-10">
              <div className="relative h-full w-full rounded-[24px]">
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

                      if (!sourceCell || !targetCell || targetCell.progress.isMock) {
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

                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}