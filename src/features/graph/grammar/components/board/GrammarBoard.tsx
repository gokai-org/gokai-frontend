"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GrammarBoardCell,
  GrammarBoardCellPointsBadge,
} from "@/features/graph/grammar/components/board/cells/GrammarBoardCell";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { GrammarBoardBackdrop } from "./overlays/GrammarBoardBackdrop";
import GrammarBoardLoading from "./GrammarBoardLoading";
import type { GrammarBoardViewModel } from "../../types";
import {
  resolveGrammarBoardZoomTransform,
  type GrammarBoardTargetRect,
} from "../../lib/grammarBoardZoom";

const BOARD_EASE = [0.22, 1, 0.36, 1] as const;
type GrammarBoardTransitionState = "idle" | "zooming-in" | "hidden" | "zooming-out";

type GrammarBoardLoadStatus = "idle" | "loading" | "error" | "success";

interface GrammarBoardProps {
  board: GrammarBoardViewModel;
  status: GrammarBoardLoadStatus;
  onSelectLesson: (lessonId: string) => void;
  focusLessonId?: string | null;
  transitionState?: GrammarBoardTransitionState;
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
  focusLessonId = null,
  transitionState = "idle",
}: GrammarBoardProps) {
  const showLoading = status === "idle" || status === "loading";
  const platformMotion = usePlatformMotion();
  const boardViewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [focusTargetRect, setFocusTargetRect] = useState<GrammarBoardTargetRect | null>(null);

  const handleSelect = useCallback(
    (lessonId: string, target: HTMLButtonElement | null) => {
      const viewport = boardViewportRef.current;

      if (viewport && target) {
        const viewportRect = viewport.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        setFocusTargetRect({
          left: targetRect.left - viewportRect.left,
          top: targetRect.top - viewportRect.top,
          width: targetRect.width,
          height: targetRect.height,
        });
      }

      onSelectLesson(lessonId);
    },
    [onSelectLesson],
  );

  const cellsById = useMemo(
    () => new Map(board.cells.map((cell) => [cell.progress.id, cell])),
    [board.cells],
  );
  const focusCell = useMemo(
    () => (focusLessonId ? cellsById.get(focusLessonId) ?? null : null),
    [cellsById, focusLessonId],
  );
  const zoomTransform = useMemo(
    () =>
      resolveGrammarBoardZoomTransform(
        focusCell,
        viewportSize,
        focusLessonId ? focusTargetRect : null,
      ),
    [focusCell, focusLessonId, focusTargetRect, viewportSize],
  );

  const entranceMode = platformMotion.entranceMode;
  const shouldAnimateBoardEntrance = platformMotion.shouldAnimate;
  const isLightEntrance = entranceMode === "light";
  const boardDuration = (isLightEntrance ? 0.34 : 0.46) * platformMotion.durationScale;
  const boardEntryOffset = isLightEntrance ? 10 : 20;
  const boardEntryScale = isLightEntrance ? 1 : 0.985;
  const boardExitScale = isLightEntrance ? 1 : 0.992;
  const shouldAnimateBoardReveal = shouldAnimateBoardEntrance && !showLoading;
  const boardZoomDuration = Math.max(
    0.48,
    (platformMotion.shouldUseLightAnimations ? 0.56 : 0.72) *
      platformMotion.durationScale,
  );
  const boardResetDuration = Math.max(
    0.34,
    (platformMotion.shouldUseLightAnimations ? 0.42 : 0.52) *
      platformMotion.durationScale,
  );

  useEffect(() => {
    const viewport = boardViewportRef.current;

    if (!viewport) {
      return;
    }

    const updateViewportSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateViewportSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateViewportSize);
      return () => window.removeEventListener("resize", updateViewportSize);
    }

    const observer = new ResizeObserver(() => {
      updateViewportSize();
    });

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  const boardViewportAnimation = useMemo(() => {
    if (
      transitionState === "zooming-in" &&
      focusCell &&
      viewportSize.width > 0 &&
      viewportSize.height > 0
    ) {
      return {
        x: [0, zoomTransform.x * 0.2, zoomTransform.x],
        y: [0, zoomTransform.y * 0.2, zoomTransform.y],
        scale: [1, Math.max(1.24, 1 + (zoomTransform.scale - 1) * 0.22), zoomTransform.scale],
        opacity: [1, 1, 0.82, 0],
        filter: [
          "blur(0px) saturate(1)",
          "blur(0px) saturate(1.02)",
          "blur(6px) saturate(1.04)",
          "blur(16px) saturate(1.06)",
        ],
        transition: {
          duration: boardZoomDuration,
          ease: BOARD_EASE,
          times: [0, 0.4, 0.78, 1],
        },
      };
    }

    if (transitionState === "hidden") {
      return {
        x: zoomTransform.x,
        y: zoomTransform.y,
        scale: zoomTransform.scale,
        opacity: 0,
        filter: "blur(18px) saturate(1.08)",
        transition: {
          duration: 0,
        },
      };
    }

    return {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px) saturate(1)",
      transition: {
        duration: transitionState === "zooming-out" ? boardResetDuration : boardDuration,
        ease: BOARD_EASE,
      },
    };
  }, [
    boardDuration,
    boardResetDuration,
    boardZoomDuration,
    focusCell,
    transitionState,
    viewportSize.height,
    viewportSize.width,
    zoomTransform.scale,
    zoomTransform.x,
    zoomTransform.y,
  ]);

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
          ref={boardViewportRef}
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
          animate={
            shouldAnimateBoardReveal && transitionState === "idle"
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: {
                    duration: boardDuration,
                    ease: BOARD_EASE,
                  },
                }
              : undefined
          }
        >
          <motion.div
            className="relative h-full w-full will-change-transform"
            style={{
              transformOrigin: zoomTransform.transformOrigin,
            }}
            animate={boardViewportAnimation}
          >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}