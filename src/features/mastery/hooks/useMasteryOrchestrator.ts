"use client";

import { useCallback, useMemo, useState } from "react";
import type { Node } from "reactflow";
import type {
  CelebrationModalContent,
  MasteryModuleId,
  MasterySnapshot,
} from "../types";
import { MASTERY_MODULE_CONFIGS } from "../constants/masteryConfig";
import { useMasteryState } from "./useMasteryState";
import {
  useMasteryCelebration,
  type UseMasteryCelebrationReturn,
} from "./useMasteryCelebration";
import { buildCameraTourWaypoints } from "../utils/graphMasteryAnimation";
import { CAMERA_TOUR_NODE_DWELL } from "../constants/masteryConfig";
import { useMasteredModules } from "../components/MasteredModulesProvider";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface UseMasteryOrchestratorOptions {
  moduleId: MasteryModuleId;
  /** User's current points for the relevant field. */
  currentPoints: number;
  /** Whether threshold-crossing should auto-start the celebration. */
  autoTriggerOnNewMastery?: boolean;
  /** Total items in this module's board. */
  totalItems: number;
  /** Number of completed items. */
  completedItems: number;
  /** ReactFlow nodes (ordered) — used to build camera tour waypoints. */
  nodes: Node[];
  /** Callback to smoothly move the ReactFlow camera. */
  setCenter: (x: number, y: number, options: { zoom: number; duration: number }) => void;
  /** Zoom level to use during camera tour. */
  tourZoom?: number;
  /** Called after the full celebration finishes (including modal dismiss). */
  onCelebrationComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseMasteryOrchestratorReturn {
  /** Mastery detection snapshot. */
  mastery: MasterySnapshot;
  /** Celebration state + dismiss function. */
  celebration: UseMasteryCelebrationReturn["celebration"];
  /** Dismiss the celebration modal. */
  dismissModal: UseMasteryCelebrationReturn["dismissModal"];
  /** Content for the celebration modal (null when not celebrating). */
  modalContent: CelebrationModalContent | null;
  /** Current golden mix ratio for the theme provider. */
  goldenMixRatio: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Single entry-point hook that combines mastery detection, celebration
 * orchestration, camera tour, and modal content — ready to plug into
 * any writing board view.
 *
 * @example
 * ```tsx
 * const { mastery, celebration, dismissModal, modalContent, goldenMixRatio } =
 *   useMasteryOrchestrator({
 *     moduleId: "hiragana",
 *     currentPoints: userKanaPoints,
 *     totalItems: items.length,
 *     completedItems: summary.completedCount,
 *     nodes: graph.nodes,
 *     setCenter: reactFlowSetCenter,
 *   });
 * ```
 */
export function useMasteryOrchestrator({
  moduleId,
  currentPoints,
  autoTriggerOnNewMastery = true,
  totalItems,
  completedItems,
  nodes,
  setCenter,
  tourZoom = 1.4,
  onCelebrationComplete,
}: UseMasteryOrchestratorOptions): UseMasteryOrchestratorReturn {
  // If the global context already knows this module is mastered (fetched at
  // dashboard root), suppress the first-mount celebration so it only fires
  // during the session that actually earned mastery — not on every new browser.
  const masteredSet = useMasteredModules();
  const [alreadyKnownMastered] = useState(() => masteredSet.has(moduleId));

  const mastery = useMasteryState(
    moduleId,
    currentPoints,
    totalItems,
    completedItems,
    alreadyKnownMastered,
  );

  const waypoints = useMemo(
    () => buildCameraTourWaypoints(nodes, CAMERA_TOUR_NODE_DWELL),
    [nodes],
  );

  const handleFocusNode = useCallback(
    (x: number, y: number, duration: number) => {
      setCenter(x, y, { zoom: tourZoom, duration });
    },
    [setCenter, tourZoom],
  );

  const handleComplete = useCallback(() => {
    mastery.markCelebrated();
    onCelebrationComplete?.();
  }, [mastery, onCelebrationComplete]);

  const { celebration, dismissModal } = useMasteryCelebration({
    isNewMastery: mastery.isNewMastery,
    autoTriggerOnNewMastery,
    moduleId,
    waypoints,
    onFocusNode: handleFocusNode,
    onComplete: handleComplete,
  });

  // Build modal content when in the modal phase.
  const config = MASTERY_MODULE_CONFIGS[moduleId];
  const modalContent = useMemo<CelebrationModalContent | null>(() => {
    if (!celebration.active) return null;
    return {
      moduleId,
      title: `Maestria en ${config.label}`,
      subtitle:
        config.celebrationSubtitle ??
        `Has dominado ${config.label} por completo`,
      achievementLabel: "Nuevo logro desbloqueado",
    };
  }, [celebration.active, moduleId, config]);

  // Golden mix ratio follows propagation during active celebration,
  // stays at 1 for mastered modules, 0 otherwise.
  const goldenMixRatio = celebration.active
    ? celebration.propagationProgress
    : mastery.isMastered
      ? 1
      : 0;

  return {
    mastery,
    celebration,
    dismissModal,
    modalContent,
    goldenMixRatio,
  };
}
