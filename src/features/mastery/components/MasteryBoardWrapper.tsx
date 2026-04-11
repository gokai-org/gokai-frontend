"use client";

import { type ReactNode, useEffect } from "react";
import type { Node } from "reactflow";
import type { MasteryModuleId } from "../types";
import { useMasteryOrchestrator } from "../hooks/useMasteryOrchestrator";
import { MasteryThemeProvider } from "./MasteryThemeProvider";
import { MasteryOverlay } from "./MasteryOverlay";
import { MasteryCelebrationModal } from "./MasteryCelebrationModal";
import { useSidebar } from "@/shared/components/SidebarContext";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MasteryBoardWrapperProps {
  /** Which module this board represents. */
  moduleId: MasteryModuleId;
  /** User's current points for the module's point field. */
  currentPoints: number;
  /** Whether threshold-crossing should auto-start the celebration. */
  autoTriggerOnNewMastery?: boolean;
  /** Total items on this board. */
  totalItems: number;
  /** Number of completed items. */
  completedItems: number;
  /** ReactFlow nodes (used for camera tour). */
  nodes: Node[];
  /**
   * React Flow's `setCenter` — injected from the parent view so the
   * celebration can drive the camera without owning the ReactFlow instance.
   */
  setCenter: (x: number, y: number, options: { zoom: number; duration: number }) => void;
  /** Optional zoom level for the camera tour. */
  tourZoom?: number;
  /** Called after the celebration finishes. */
  onCelebrationComplete?: () => void;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Drop-in wrapper that adds mastery detection, golden theme propagation,
 * cinematic overlay, camera tour, and celebration modal to any writing board.
 *
 * @example
 * ```tsx
 * <MasteryBoardWrapper
 *   moduleId="hiragana"
 *   currentPoints={userKanaPoints}
 *   totalItems={items.length}
 *   completedItems={summary.completedCount}
 *   nodes={graph.nodes}
 *   setCenter={setCenter}
 * >
 *   {/* Board content (ReactFlow, background, etc.) *\/}
 * </MasteryBoardWrapper>
 * ```
 */
export function MasteryBoardWrapper({
  moduleId,
  currentPoints,
  autoTriggerOnNewMastery = true,
  totalItems,
  completedItems,
  nodes,
  setCenter,
  tourZoom,
  onCelebrationComplete,
  children,
}: MasteryBoardWrapperProps) {
  const {
    celebration,
    dismissModal,
    modalContent,
    goldenMixRatio,
  } = useMasteryOrchestrator({
    moduleId,
    currentPoints,
    autoTriggerOnNewMastery,
    totalItems,
    completedItems,
    nodes,
    setCenter,
    tourZoom,
    onCelebrationComplete,
  });

  // Hide sidebar + top navbar during celebration, restore on finish
  const { setHidden } = useSidebar();
  useEffect(() => {
    if (celebration.active) {
      setHidden(true);
      return () => setHidden(false);
    }
  }, [celebration.active, setHidden]);

  return (
    <MasteryThemeProvider
      mixRatio={goldenMixRatio}
      phase={celebration.phase}
      moduleId={celebration.moduleId}
    >
      {children}

      <MasteryOverlay
        phase={celebration.phase}
        propagationProgress={celebration.propagationProgress}
      />

      <MasteryCelebrationModal
        phase={celebration.phase}
        content={modalContent}
        onDismiss={dismissModal}
      />
    </MasteryThemeProvider>
  );
}
