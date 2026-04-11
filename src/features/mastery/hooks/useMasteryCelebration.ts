"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CelebrationState,
  CameraTourWaypoint,
  MasteryModuleId,
} from "../types";
import {
  CINEMATIC_ENTER_DURATION,
  GOLDEN_PROPAGATION_DURATION,
  CAMERA_TOUR_NODE_DWELL,
  CAMERA_TOUR_MIN_DURATION,
  CAMERA_TOUR_MAX_DURATION,
  CINEMATIC_EXIT_DURATION,
} from "../constants/masteryConfig";
import { subscribeMasteryCelebrationRequest } from "../utils/masteryProgressSync";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseMasteryCelebrationOptions {
  /** Whether the user just crossed the mastery threshold. */
  isNewMastery: boolean;
  /** Whether threshold-crossing should auto-start the sequence. */
  autoTriggerOnNewMastery?: boolean;
  /** Module being celebrated. */
  moduleId: MasteryModuleId;
  /** Ordered list of node positions for the camera tour. */
  waypoints: CameraTourWaypoint[];
  /** Called to focus the camera on a specific position. */
  onFocusNode: (x: number, y: number, duration: number) => void;
  /** Called when the golden propagation progress updates (0–1). */
  onPropagationTick?: (progress: number) => void;
  /** Called when the celebration sequence finishes completely. */
  onComplete: () => void;
}

export interface UseMasteryCelebrationReturn {
  /** Full celebration state snapshot. */
  celebration: CelebrationState;
  /** Dismiss the modal and finish the sequence. */
  dismissModal: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IDLE_STATE: CelebrationState = {
  active: false,
  phase: "idle",
  moduleId: null,
  propagationProgress: 0,
  tourNodeIndex: -1,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMasteryCelebration({
  isNewMastery,
  autoTriggerOnNewMastery = true,
  moduleId,
  waypoints,
  onFocusNode,
  onPropagationTick,
  onComplete,
}: UseMasteryCelebrationOptions): UseMasteryCelebrationReturn {
  const [state, setState] = useState<CelebrationState>(IDLE_STATE);
  const hasTriggeredRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number | null>(null);

  // Keep callbacks stable via refs.
  const onFocusNodeRef = useRef(onFocusNode);
  const onPropagationTickRef = useRef(onPropagationTick);
  const onCompleteRef = useRef(onComplete);
  const waypointsRef = useRef(waypoints);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    onFocusNodeRef.current = onFocusNode;
    onPropagationTickRef.current = onPropagationTick;
    onCompleteRef.current = onComplete;
    waypointsRef.current = waypoints;
  }, [onComplete, onFocusNode, onPropagationTick, waypoints]);

  // ---------------------------------------------------
  // Sequence runner
  // ---------------------------------------------------

  const runSequence = useCallback(() => {
    clearTimers();

    const schedule = (fn: () => void, delay: number) => {
      timersRef.current.push(setTimeout(fn, delay));
    };

    let elapsed = 0;

    // 1. Cinematic enter
    setState({
      active: true,
      phase: "cinematic_enter",
      moduleId,
      propagationProgress: 0,
      tourNodeIndex: -1,
    });
    elapsed += CINEMATIC_ENTER_DURATION;

    // 2. Golden propagation
    schedule(() => {
      setState((s) => ({ ...s, phase: "golden_propagation" }));

      // Animate propagation progress via rAF
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / GOLDEN_PROPAGATION_DURATION, 1);
        setState((s) => ({ ...s, propagationProgress: t }));
        onPropagationTickRef.current?.(t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, elapsed);
    elapsed += GOLDEN_PROPAGATION_DURATION;

    // 3. Camera tour (reverse order — last node to first)
    schedule(() => {
      setState((s) => ({ ...s, phase: "camera_tour" }));

      const wp = waypointsRef.current;
      if (wp.length === 0) return;

      // Build reversed tour from last to first.
      const reversed = [...wp].reverse();
      const totalNodes = reversed.length;
      const rawDuration = totalNodes * CAMERA_TOUR_NODE_DWELL;
      const tourDuration = Math.min(
        CAMERA_TOUR_MAX_DURATION,
        Math.max(CAMERA_TOUR_MIN_DURATION, rawDuration),
      );
      const perNode = tourDuration / totalNodes;

      reversed.forEach((waypoint, i) => {
        schedule(() => {
          setState((s) => ({ ...s, tourNodeIndex: totalNodes - 1 - i }));
          onFocusNodeRef.current(waypoint.x, waypoint.y, perNode * 0.8);
        }, i * perNode);
      });
    }, elapsed);

    // Estimate total camera tour time.
    const wp = waypointsRef.current;
    const totalNodes = wp.length || 1;
    const rawDuration = totalNodes * CAMERA_TOUR_NODE_DWELL;
    const tourDuration = Math.min(
      CAMERA_TOUR_MAX_DURATION,
      Math.max(CAMERA_TOUR_MIN_DURATION, rawDuration),
    );
    elapsed += tourDuration;

    // 4. Show modal
    schedule(() => {
      setState((s) => ({ ...s, phase: "modal", tourNodeIndex: -1 }));
    }, elapsed);
  }, [moduleId, clearTimers]);

  // ---------------------------------------------------
  // Dismiss modal → cinematic exit → complete
  // ---------------------------------------------------

  const dismissModal = useCallback(() => {
    clearTimers();

    setState((s) => ({ ...s, phase: "cinematic_exit" }));

    const timer = setTimeout(() => {
      setState(IDLE_STATE);
      hasTriggeredRef.current = false;
      onCompleteRef.current();
    }, CINEMATIC_EXIT_DURATION);

    timersRef.current.push(timer);
  }, [clearTimers]);

  // ---------------------------------------------------
  // Trigger on new mastery
  // ---------------------------------------------------

  useEffect(() => {
    if (autoTriggerOnNewMastery && isNewMastery && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      const startTimer = window.setTimeout(() => {
        runSequence();
      }, 0);

      return () => clearTimeout(startTimer);
    }
  }, [autoTriggerOnNewMastery, isNewMastery, runSequence]);

  useEffect(
    () =>
      subscribeMasteryCelebrationRequest((detail) => {
        if (detail.moduleId !== moduleId) return;
        hasTriggeredRef.current = true;
        runSequence();
      }),
    [moduleId, runSequence],
  );

  // Cleanup on unmount.
  useEffect(() => clearTimers, [clearTimers]);

  return { celebration: state, dismissModal };
}
