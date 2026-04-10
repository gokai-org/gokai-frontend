"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import type { MasteryModuleId, MasterySnapshot, MasteryState } from "../types";
import {
  MASTERY_MODULE_CONFIGS,
  getMasteryCelebratedKey,
} from "../constants/masteryConfig";

// ---------------------------------------------------------------------------
// State resolution
// ---------------------------------------------------------------------------

function resolveMasteryState(
  currentPoints: number,
  threshold: number,
  totalItems: number,
  completedItems: number,
  wasCelebrated: boolean,
): MasteryState {
  if (totalItems === 0) return "locked";

  const isMastered = currentPoints >= threshold;

  if (isMastered && !wasCelebrated) return "celebrating_mastery";
  if (isMastered) return "mastered";
  if (completedItems > 0 && completedItems < totalItems) return "in_progress";
  if (completedItems === 0 && totalItems > 0) return "available";

  return "completed";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Detects the mastery state of a specific writing module based on user points.
 *
 * @param moduleId - Which module to evaluate.
 * @param currentPoints - The user's current points for this module.
 * @param totalItems - Total items in the module (e.g., total kana count).
 * @param completedItems - Number of items the user has completed.
 *
 * @returns A `MasterySnapshot` with the resolved state and metadata.
 */
export function useMasteryState(
  moduleId: MasteryModuleId,
  currentPoints: number,
  totalItems: number,
  completedItems: number,
  /** When true the module was already mastered before this session started
   *  (e.g. from the global MasteredModulesProvider). The celebration is
   *  suppressed so it only fires during the session that earned mastery. */
  alreadyKnownMastered = false,
): MasterySnapshot {
  const config = MASTERY_MODULE_CONFIGS[moduleId];
  const threshold = config.masteryThreshold;

  // Track whether the celebration was already shown in a previous session.
  const [wasCelebrated, setWasCelebrated] = useState(() => {
    if (alreadyKnownMastered) return true;
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(getMasteryCelebratedKey(moduleId)) === "true";
    } catch {
      return false;
    }
  });

  // If the global mastered set loads after the initial state,
  // silently mark as celebrated so no animation fires.
  useEffect(() => {
    if (alreadyKnownMastered && !wasCelebrated) {
      setWasCelebrated(true);
      setIsNewMastery(false);
      try {
        localStorage.setItem(getMasteryCelebratedKey(moduleId), "true");
      } catch { /* silent */ }
    }
  }, [alreadyKnownMastered]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track the previous points to detect crossing the threshold *this session*.
  const previousPointsRef = useRef<number | null>(null);
  const [isNewMastery, setIsNewMastery] = useState(false);

  useEffect(() => {
    const prev = previousPointsRef.current;
    previousPointsRef.current = currentPoints;

    if (prev === null) {
      // First evaluation — the board mounts AFTER loading completes, so
      // currentPoints may already be at or above threshold. Trigger immediately
      // if the user hasn't been celebrated yet.
      if (currentPoints >= threshold && !wasCelebrated) {
        setIsNewMastery(true);
      }
      return;
    }

    // Detect crossing the threshold upward during an active session.
    if (prev < threshold && currentPoints >= threshold && !wasCelebrated) {
      setIsNewMastery(true);
    }
  }, [currentPoints, threshold, wasCelebrated]);

  /** Call after the celebration finishes to persist the flag. */
  const markCelebrated = useMemo(
    () => () => {
      setWasCelebrated(true);
      setIsNewMastery(false);
      try {
        localStorage.setItem(getMasteryCelebratedKey(moduleId), "true");
      } catch {
        // localStorage unavailable — silent.
      }
    },
    [moduleId],
  );

  const state = resolveMasteryState(
    currentPoints,
    threshold,
    totalItems,
    completedItems,
    wasCelebrated,
  );

  return useMemo(
    () => {
      const progress = threshold > 0 ? Math.min(currentPoints / threshold, 1) : 0;
      const isMastered =
        state === "mastered" || state === "celebrating_mastery";
      return {
        state,
        currentPoints,
        threshold,
        progress,
        isMastered,
        isNewMastery,
        markCelebrated,
      };
    },
    [state, currentPoints, threshold, isNewMastery, markCelebrated],
  );
}
