"use client";

import { useEffect, useRef } from "react";

type MiniDockBlockerListener = (isBlocked: boolean) => void;

const activeBlockers = new Set<number>();
const listeners = new Set<MiniDockBlockerListener>();
let blockerSequence = 0;

function notifyMiniDockBlockers() {
  const isBlocked = activeBlockers.size > 0;

  listeners.forEach((listener) => {
    listener(isBlocked);
  });
}

export function subscribeMiniDockBlockers(
  listener: MiniDockBlockerListener,
) {
  listeners.add(listener);
  listener(activeBlockers.size > 0);

  return () => {
    listeners.delete(listener);
  };
}

export function acquireMiniDockBlocker() {
  blockerSequence += 1;
  const blockerId = blockerSequence;
  let released = false;

  activeBlockers.add(blockerId);
  notifyMiniDockBlockers();

  return () => {
    if (released) {
      return;
    }

    released = true;
    activeBlockers.delete(blockerId);
    notifyMiniDockBlockers();
  };
}

export function useMiniDockBlocker(active: boolean) {
  const releaseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (active) {
      if (!releaseRef.current) {
        releaseRef.current = acquireMiniDockBlocker();
      }

      return () => {
        releaseRef.current?.();
        releaseRef.current = null;
      };
    }

    releaseRef.current?.();
    releaseRef.current = null;

    return () => {
      releaseRef.current?.();
      releaseRef.current = null;
    };
  }, [active]);
}