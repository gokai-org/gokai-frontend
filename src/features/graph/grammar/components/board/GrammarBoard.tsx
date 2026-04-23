"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GrammarBoardCell } from "./cells/GrammarBoardCell";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { GrammarBoardBackground } from "./overlays/GrammarBoardBackground";
import GrammarBoardLoading from "./GrammarBoardLoading";
import type { GrammarBoardViewModel } from "../../types";
import {
  resolveGrammarBoardZoomTransform,
  type GrammarBoardTargetRect,
} from "../../lib/grammarBoardZoom";
import { useGrammarBoardQuality } from "../../hooks/useGrammarBoardQuality";
import { createGrammarBoardViewModel } from "../../lib/grammarBoardLayout";
import { GRAMMAR_SUGOROKU_SLOTS_VERTICAL } from "../../constants/grammarBoard";

const BOARD_EASE = [0.22, 1, 0.36, 1] as const;
type GrammarBoardTransitionState = "idle" | "zooming-in" | "hidden" | "zooming-out";

type GrammarBoardLoadStatus = "idle" | "loading" | "error" | "success";

interface GrammarBoardProps {
  board: GrammarBoardViewModel;
  status: GrammarBoardLoadStatus;
  onSelectLesson: (lessonId: string) => void;
  onPressUnlockLesson?: (lessonId: string) => void;
  unlockingLessonId?: string | null;
  focusLessonId?: string | null;
  helpTargetLessonId?: string | null;
  transitionState?: GrammarBoardTransitionState;
  recentlyUnlockedIds?: ReadonlySet<string>;
  embedded?: boolean;
}

export function GrammarBoard({
  board,
  status,
  onSelectLesson,
  onPressUnlockLesson,
  unlockingLessonId = null,
  focusLessonId = null,
  helpTargetLessonId = null,
  transitionState = "idle",
  recentlyUnlockedIds,
  embedded = false,
}: GrammarBoardProps) {
  const showLoading = status === "idle" || status === "loading";
  const platformMotion = usePlatformMotion();
  const boardQuality = useGrammarBoardQuality();
  const boardViewportRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [focusTargetRect, setFocusTargetRect] = useState<GrammarBoardTargetRect | null>(null);

  // Portrait mode: use vertical snake layout
  const isPortrait = viewportSize.width > 0 && viewportSize.height > viewportSize.width;
  const isCompactPortrait = isPortrait && viewportSize.width > 0 && viewportSize.width <= 430;
  const isTinyPortrait = isPortrait && viewportSize.width > 0 && viewportSize.width <= 375;

  const boardItems = useMemo(
    () => board.cells.map((c) => c.progress),
    [board.cells],
  );

  const verticalBoard = useMemo(
    () => createGrammarBoardViewModel(boardItems, board.activeId, GRAMMAR_SUGOROKU_SLOTS_VERTICAL),
    [boardItems, board.activeId],
  );

  // Use the correct board for the current orientation
  const activeBoard = isPortrait ? verticalBoard : board;

  const handleSelect = useCallback(
    (lessonId: string, target: HTMLButtonElement | null) => {
      const viewport = boardViewportRef.current;

      if (viewport && target) {
        const viewportRect = viewport.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        setViewportSize({
          width: Math.max(viewport.clientWidth, Math.round(viewportRect.width)),
          height: Math.max(viewport.clientHeight, Math.round(viewportRect.height)),
        });

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
    () => new Map(activeBoard.cells.map((cell) => [cell.progress.id, cell])),
    [activeBoard.cells],
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
        { portrait: isPortrait },
      ),
    [focusCell, focusLessonId, focusTargetRect, viewportSize, isPortrait],
  );

  const entranceMode = platformMotion.entranceMode;
  const shouldAnimateBoardEntrance = boardQuality.shouldAnimateBoardEntrance;
  const isLightEntrance = entranceMode === "light";
  const boardDuration = (isLightEntrance ? 0.34 : 0.46) * platformMotion.durationScale;
  const boardEntryOffset = boardQuality.boardRevealOffset;
  const boardEntryScale = boardQuality.boardRevealScale;
  const boardExitScale = boardQuality.boardExitScale;
  const shouldAnimateBoardReveal = shouldAnimateBoardEntrance && !showLoading;
  const boardZoomDuration = boardQuality.boardZoomDurationMs / 1000;
  const boardZoomOutDuration = boardQuality.boardZoomOutDurationMs / 1000;
  const effectiveZoomScale =
    1 + (zoomTransform.scale - 1) * boardQuality.boardZoomScaleIntensity;
  const boardZoomFilter =
    boardQuality.boardZoomBlurPx > 0
      ? `blur(${boardQuality.boardZoomBlurPx}px) saturate(${boardQuality.boardZoomSaturate})`
      : "blur(0px) saturate(1)";

  const setBoardViewportRef = useCallback((node: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    boardViewportRef.current = node;

    if (!node) {
      return;
    }

    setViewportSize({ width: node.clientWidth, height: node.clientHeight });

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        setViewportSize({ width: node.clientWidth, height: node.clientHeight });
      });
      observer.observe(node);
      resizeObserverRef.current = observer;
    }
  }, []);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  const boardViewportAnimation = useMemo(() => {
    if (!boardQuality.shouldAnimateBoardZoom) {
      return {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px) saturate(1)",
        transition: {
          duration: boardDuration,
          ease: BOARD_EASE,
        },
      };
    }

    // Zoom-in: la cámara se acerca suavemente a la casilla y el tablero se desvanece al final
    if (
      transitionState === "zooming-in" &&
      viewportSize.width > 0 &&
      viewportSize.height > 0
    ) {
      const zoomEase = [0.4, 0, 1, 1] as const;

      return {
        x: zoomTransform.x,
        y: zoomTransform.y,
        scale: effectiveZoomScale,
        opacity: 0,
        filter: boardZoomFilter,
        transition: {
          x: { duration: boardZoomDuration, ease: zoomEase },
          y: { duration: boardZoomDuration, ease: zoomEase },
          scale: { duration: boardZoomDuration, ease: zoomEase },
          opacity: {
            delay: boardZoomDuration * 0.78,
            duration: boardZoomDuration * 0.22,
            ease: "easeIn",
          },
          filter: {
            delay: boardZoomDuration * 0.72,
            duration: boardZoomDuration * 0.28,
            ease: "easeIn",
          },
        },
      };
    }

    // Tablero invisible y congelado en posición zoom mientras la lección está abierta
    if (transitionState === "hidden") {
      return {
        x: zoomTransform.x,
        y: zoomTransform.y,
        scale: effectiveZoomScale,
        opacity: 0,
        filter: boardZoomFilter,
        transition: { duration: 0 },
      };
    }

    // Zoom-out: el tablero reaparece y vuelve a su escala original (espejo del zoom-in)
    if (transitionState === "zooming-out") {
      return {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px) saturate(1)",
        transition: {
          x: { duration: boardZoomOutDuration, ease: BOARD_EASE },
          y: { duration: boardZoomOutDuration, ease: BOARD_EASE },
          scale: { duration: boardZoomOutDuration, ease: BOARD_EASE },
          opacity: { duration: boardZoomOutDuration * 0.25, ease: "easeOut" },
          filter: { duration: boardZoomOutDuration * 0.2, ease: "easeOut" },
        },
      };
    }

    // Idle: tablero en reposo
    return {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px) saturate(1)",
      transition: {
        duration: boardDuration,
        ease: BOARD_EASE,
      },
    };
  }, [
    boardQuality.shouldAnimateBoardZoom,
    boardZoomFilter,
    boardDuration,
    boardZoomDuration,
    boardZoomOutDuration,
    effectiveZoomScale,
    transitionState,
    viewportSize.height,
    viewportSize.width,
    zoomTransform.x,
    zoomTransform.y,
  ]);

  const boardFrameClassName = isPortrait
    ? isTinyPortrait
      ? embedded
        ? "h-full w-full px-2.5 pb-2.5 pt-2"
        : "h-full w-full px-4 pb-2.5"
      : isCompactPortrait
        ? embedded
          ? "h-full w-full px-3 pb-3 pt-2.5"
          : "h-full w-full px-4 pb-3"
        : embedded
          ? "h-full w-full px-3 pb-3 pt-3 sm:px-4 sm:pb-4"
          : "h-full w-full px-3 pb-3 sm:px-6 sm:pb-4"
    : embedded
      ? "h-full w-full p-3 sm:p-5 lg:p-6"
      : "h-full w-full p-6 sm:p-8 lg:p-10";

  const boardCanvasClassName = isPortrait
    ? isTinyPortrait
      ? "relative mx-auto h-full w-[92%] max-w-[19.75rem] rounded-[24px]"
      : isCompactPortrait
        ? "relative mx-auto h-full w-[94%] max-w-[22rem] rounded-[24px]"
        : "relative mx-auto h-full w-[96%] max-w-[27rem] rounded-[24px]"
    : "relative h-full w-full rounded-[24px]";

  const boardFrameStyle = isPortrait
    ? embedded
      ? {
          paddingTop: isTinyPortrait
            ? "0.35rem"
            : isCompactPortrait
              ? "0.5rem"
              : "0.75rem",
          paddingBottom: isTinyPortrait ? "0.35rem" : "0.5rem",
        }
      : {
        // Portrait now docks graph navigation at the bottom, so the board needs
        // less top clearance and a moderate bottom safe area.
        paddingTop: isTinyPortrait
          ? "calc(env(safe-area-inset-top, 0px) + 1rem)"
          : isCompactPortrait
            ? "calc(env(safe-area-inset-top, 0px) + 1.15rem)"
            : "calc(env(safe-area-inset-top, 0px) + 1.35rem)",
        paddingBottom: isTinyPortrait
          ? "calc(env(safe-area-inset-bottom, 0px) + 3.85rem)"
          : isCompactPortrait
            ? "calc(env(safe-area-inset-bottom, 0px) + 4.1rem)"
            : "calc(env(safe-area-inset-bottom, 0px) + 4.35rem)",
      }
    : undefined;

  return (
    <>
      <GrammarBoardBackground />

      <AnimatePresence initial={false} mode="wait">
      {showLoading ? (
        <motion.div
          key="grammar-board-loading"
          className="absolute inset-0"
          data-help-loading="true"
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
          ref={setBoardViewportRef}
          className="absolute inset-0 overflow-hidden select-none"
          data-help-target="grammar-board-canvas"
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
            <div className={boardFrameClassName} style={boardFrameStyle}>
              <div className={boardCanvasClassName}>
                <div className="relative z-10 h-full w-full">
                  {activeBoard.cells.map((cell) => (
                    <GrammarBoardCell
                      key={cell.progress.id}
                      cell={cell}
                      onSelect={handleSelect}
                      onPressUnlock={onPressUnlockLesson}
                      unlockPending={unlockingLessonId === cell.progress.id}
                      helpTarget={cell.progress.id === helpTargetLessonId}
                      enableHoverMotion={boardQuality.shouldUseHoverMotion}
                      isPortrait={isPortrait}
                      isCompactPortrait={isCompactPortrait}
                      isTinyPortrait={isTinyPortrait}
                      justUnlocked={recentlyUnlockedIds?.has(cell.progress.id) ?? false}
                    />
                  ))}

                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}