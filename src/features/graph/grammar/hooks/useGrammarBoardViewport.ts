"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEventHandler,
  WheelEventHandler,
} from "react";

type Point = {
  x: number;
  y: number;
};

type GrammarBoardViewportState = {
  scale: number;
  x: number;
  y: number;
  isDragging: boolean;
};

type DragState = {
  pointerId: number | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
};

const MIN_SCALE = 1;
const MAX_SCALE = 2.4;
const WHEEL_ZOOM_FACTOR = 1.08;
const DRAG_THRESHOLD = 6;
const CLICK_SUPPRESSION_MS = 220;
const VIEWPORT_EDGE_PADDING_PX = 96;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDistance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getMidpoint(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function isBoardCellTarget(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest('[data-grammar-board-cell="true"]') !== null
    : false;
}

export function useGrammarBoardViewport() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<DragState>({
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
  });
  const pinchRef = useRef<{ distance: number; midpoint: Point } | null>(null);
  const suppressClickUntilRef = useRef(0);
  const [state, setState] = useState<GrammarBoardViewportState>({
    scale: 1,
    x: 0,
    y: 0,
    isDragging: false,
  });

  const getViewportRect = useCallback(() => {
    return viewportRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const markGesture = useCallback(() => {
    suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESSION_MS;
  }, []);

  const clampOffsets = useCallback(
    (scale: number, x: number, y: number) => {
      const rect = getViewportRect();

      if (!rect || scale <= MIN_SCALE) {
        return { x: 0, y: 0 };
      }

      const padX = Math.max(rect.width * 0.09, VIEWPORT_EDGE_PADDING_PX);
      const padY = Math.max(rect.height * 0.09, VIEWPORT_EDGE_PADDING_PX);
      const maxX = ((rect.width * scale) - rect.width) / 2 + padX;
      const maxY = ((rect.height * scale) - rect.height) / 2 + padY;

      return {
        x: clamp(x, -maxX, maxX),
        y: clamp(y, -maxY, maxY),
      };
    },
    [getViewportRect],
  );

  const updateState = useCallback(
    (
      updater: (previous: GrammarBoardViewportState) => GrammarBoardViewportState,
    ) => {
      setState((previous) => {
        const next = updater(previous);
        const clamped = clampOffsets(next.scale, next.x, next.y);

        return {
          ...next,
          ...clamped,
        };
      });
    },
    [clampOffsets],
  );

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      setState((previous) => {
        const clamped = clampOffsets(previous.scale, previous.x, previous.y);

        if (clamped.x === previous.x && clamped.y === previous.y) {
          return previous;
        }

        return {
          ...previous,
          ...clamped,
        };
      });
    });

    observer.observe(viewport);

    return () => observer.disconnect();
  }, [clampOffsets]);

  const handleWheel = useCallback<WheelEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();

      const rect = getViewportRect();
      if (!rect) {
        return;
      }

      const factor =
        event.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;

      updateState((previous) => {
        const nextScale = clamp(
          previous.scale * factor,
          MIN_SCALE,
          MAX_SCALE,
        );

        if (nextScale === previous.scale) {
          return previous;
        }

        const offsetX = event.clientX - (rect.left + rect.width / 2);
        const offsetY = event.clientY - (rect.top + rect.height / 2);
        const scaleRatio = nextScale / previous.scale;

        return {
          ...previous,
          scale: nextScale,
          x: previous.x - offsetX * (scaleRatio - 1),
          y: previous.y - offsetY * (scaleRatio - 1),
          isDragging: false,
        };
      });

      markGesture();
    },
    [getViewportRect, markGesture, updateState],
  );

  const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      if (isBoardCellTarget(event.target)) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (pointersRef.current.size === 1) {
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          lastX: event.clientX,
          lastY: event.clientY,
          moved: false,
        };
        pinchRef.current = null;
        setState((previous) =>
          previous.isDragging ? { ...previous, isDragging: false } : previous,
        );
        return;
      }

      if (pointersRef.current.size === 2) {
        const [first, second] = Array.from(pointersRef.current.values());
        pinchRef.current = {
          distance: getDistance(first, second),
          midpoint: getMidpoint(first, second),
        };
        dragRef.current.pointerId = null;
        setState((previous) =>
          previous.isDragging ? { ...previous, isDragging: false } : previous,
        );
      }
    },
    [],
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (!pointersRef.current.has(event.pointerId)) {
        return;
      }

      event.preventDefault();

      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (pointersRef.current.size >= 2) {
        const [first, second] = Array.from(pointersRef.current.values());
        const pinch = pinchRef.current;
        const distance = getDistance(first, second);
        const midpoint = getMidpoint(first, second);

        if (!pinch || pinch.distance === 0 || distance === 0) {
          pinchRef.current = { distance, midpoint };
          return;
        }

        const rect = getViewportRect();
        if (!rect) {
          return;
        }

        updateState((previous) => {
          const nextScale = clamp(
            previous.scale * (distance / pinch.distance),
            MIN_SCALE,
            MAX_SCALE,
          );
          const offsetX = midpoint.x - (rect.left + rect.width / 2);
          const offsetY = midpoint.y - (rect.top + rect.height / 2);
          const scaleRatio = nextScale / previous.scale;

          return {
            ...previous,
            scale: nextScale,
            x:
              previous.x - offsetX * (scaleRatio - 1) +
              (midpoint.x - pinch.midpoint.x),
            y:
              previous.y - offsetY * (scaleRatio - 1) +
              (midpoint.y - pinch.midpoint.y),
            isDragging: false,
          };
        });

        pinchRef.current = { distance, midpoint };
        markGesture();
        return;
      }

      const drag = dragRef.current;
      if (drag.pointerId !== event.pointerId) {
        return;
      }

      const totalDx = event.clientX - drag.startX;
      const totalDy = event.clientY - drag.startY;

      if (!drag.moved && Math.abs(totalDx) + Math.abs(totalDy) < DRAG_THRESHOLD) {
        return;
      }

      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;

      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.moved = true;

      updateState((previous) => ({
        ...previous,
        x: previous.x + deltaX,
        y: previous.y + deltaY,
        isDragging: previous.scale > MIN_SCALE,
      }));

      markGesture();
    },
    [getViewportRect, markGesture, updateState],
  );

  const handlePointerEnd = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pointersRef.current.delete(event.pointerId);

      const remainingPointers = Array.from(pointersRef.current.entries());
      if (remainingPointers.length >= 2) {
        const [, first] = remainingPointers[0];
        const [, second] = remainingPointers[1];

        pinchRef.current = {
          distance: getDistance(first, second),
          midpoint: getMidpoint(first, second),
        };

        return;
      }

      pinchRef.current = null;

      if (remainingPointers.length === 1) {
        const [pointerId, point] = remainingPointers[0];
        dragRef.current = {
          pointerId,
          startX: point.x,
          startY: point.y,
          lastX: point.x,
          lastY: point.y,
          moved: false,
        };
        setState((previous) =>
          previous.isDragging ? { ...previous, isDragging: false } : previous,
        );
        return;
      }

      dragRef.current = {
        pointerId: null,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        moved: false,
      };
      setState((previous) =>
        previous.isDragging ? { ...previous, isDragging: false } : previous,
      );
    },
    [],
  );

  const worldStyle = useMemo<CSSProperties>(() => {
    return {
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      transformOrigin: "50% 50%",
      transform: `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`,
      transition: state.isDragging
        ? "none"
        : "transform 180ms cubic-bezier(0.22,1,0.36,1)",
      willChange: "transform",
      backfaceVisibility: "hidden",
    };
  }, [state.isDragging, state.scale, state.x, state.y]);

  const shouldSuppressClick = useCallback(() => {
    return Date.now() < suppressClickUntilRef.current;
  }, []);

  return {
    viewportRef,
    scale: state.scale,
    isDragging: state.isDragging,
    worldStyle,
    shouldSuppressClick,
    viewportProps: {
      onWheel: handleWheel,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
}