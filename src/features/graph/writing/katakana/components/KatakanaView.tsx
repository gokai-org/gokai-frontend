"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { NodeTypes, EdgeTypes } from "reactflow";
import { WritingBoardView } from "../../shared/components/WritingBoardView";
import type { WritingBoardProgress } from "../../shared/types";
import WritingBoardEdge from "../../shared/components/WritingBoardEdge";
import KatakanaBoardNode from "./KatakanaBoardNode";
import { useKatakanaBoard } from "../hooks/useKatakanaBoard";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { KanaQuizModal } from "@/features/kana/components/quiz";
import type { KanaQuizType } from "@/features/kana/types/quiz";
import type { KanjiQuizType } from "@/features/kanji/types/quiz";
import { useSidebar } from "@/shared/components/SidebarContext";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { MASTERY_THRESHOLDS } from "@/features/mastery/constants/masteryConfig";
import { dispatchMasteryCelebrationRequest, dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { ContextualHelpButton } from "@/features/help/components/ContextualHelpButton";
import {
  createLockedBoardAccessTour,
  createWritingBoardContextTour,
} from "@/features/help/utils/contextualTours";

type KanaQuizCompletionResult = {
  newlyCompleted: boolean;
  newlyCompletedPoints: number;
  dominated: boolean;
  score: number;
  triggeredModuleMastery: boolean;
};

const NODE_TYPES: NodeTypes = { "writing-node": KatakanaBoardNode };
const EDGE_TYPES: EdgeTypes = { "writing-edge": WritingBoardEdge };

const GRAPH_USER_ID = "user123";

function isKanaQuizType(
  quizType?: KanaQuizType | KanjiQuizType,
): quizType is KanaQuizType {
  return (
    quizType === undefined ||
    quizType === "from_kana" ||
    quizType === "from_romaji" ||
    quizType === "canvas"
  );
}

export default function KatakanaView() {
  const { items, summary, loading, error, reload, userPoints } = useKatakanaBoard();
  const { setHidden } = useSidebar();
  const mastered = useMasteredModules();

  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [helpSelectedNodeId, setHelpSelectedNodeId] = useState<string | null>(null);
  const [quizItem, setQuizItem] = useState<{
    id: string;
    label: string;
    quizType?: KanaQuizType;
    wasCompletedBefore: boolean;
    isPracticeOnly: boolean;
  } | null>(
    null,
  );
  const wasMasteredBeforeQuizRef = useRef(false);
  const pendingMasteryCelebrationRef = useRef(false);
  const celebrationFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [suppressUnlockPointsDuringUnlock, setSuppressUnlockPointsDuringUnlock] = useState(false);

  const selectedId = useMemo(() => {
    if (detailNodeId && items.some((item) => item.id === detailNodeId)) {
      return detailNodeId;
    }

    if (
      helpSelectedNodeId &&
      items.some((item) => item.id === helpSelectedNodeId)
    ) {
      return helpSelectedNodeId;
    }

    if (
      manualSelectedId &&
      items.some((item) => item.id === manualSelectedId)
    ) {
      return manualSelectedId;
    }

    return (
      [...items].reverse().find((item) => item.status !== "locked")?.id ??
      items[0]?.id ??
      null
    );
  }, [detailNodeId, helpSelectedNodeId, items, manualSelectedId]);

  const selectedProgress = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const helpNodeId = useMemo(
    () => items.find((item) => item.status !== "locked")?.id ?? null,
    [items],
  );

  const handleNodeAction = useCallback((item: WritingBoardProgress) => {
    setManualSelectedId(item.id);
    setDetailNodeId(item.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailNodeId(null);
  }, []);

  const focusHelpNode = useCallback(() => {
    if (!helpNodeId) {
      return;
    }

    setDetailNodeId(null);
    setHelpSelectedNodeId(helpNodeId);
  }, [helpNodeId]);

  const openHelpLesson = useCallback(() => {
    if (!helpNodeId) {
      return;
    }

    setHelpSelectedNodeId(null);
    setManualSelectedId(helpNodeId);
    setDetailNodeId(helpNodeId);
  }, [helpNodeId]);

  const resetHelpTourState = useCallback(() => {
    setHelpSelectedNodeId(null);
    setDetailNodeId(null);
  }, []);

  const buildHelpTour = useCallback(
    () => {
      if (!helpNodeId) {
        return createLockedBoardAccessTour({
          id: "katakana-context-tour-locked",
          title: "Guia de Katakana",
          scopeSelector: '[data-help-surface="katakana-board"]',
          boardLabel: "Tablero de katakana",
          requirementLabel: "puntos suficientes",
        });
      }

      return createWritingBoardContextTour({
        id: "katakana-context-tour",
        title: "Guia de Katakana",
        scopeSelector: '[data-help-surface="katakana-board"]',
        scriptLabel: "katakana",
        unitLabel: "kana",
        lessonSummary: "significado, lectura y trazado",
        focusNode: focusHelpNode,
        openLesson: openHelpLesson,
        resetTourState: resetHelpTourState,
        includeScriptTabs:
          typeof document !== "undefined" &&
          document.querySelector('[data-help-target="writing-script-tabs"]') !== null,
      });
    },
    [focusHelpNode, helpNodeId, openHelpLesson, resetHelpTourState],
  );

  const handleQuizStart = useCallback(
    (
      entity: { id: string; symbol: string },
      quizType?: KanaQuizType | KanjiQuizType,
    ) => {
      if (!isKanaQuizType(quizType)) {
        return;
      }

      wasMasteredBeforeQuizRef.current = mastered.has("katakana");
      const wasCompletedBefore =
        items.find((item) => item.id === entity.id)?.status === "completed";
      setDetailNodeId(null);
      setQuizItem({
        id: entity.id,
        label: entity.symbol,
        quizType,
        wasCompletedBefore,
        isPracticeOnly: quizType !== undefined,
      });
    },
    [items, mastered],
  );

  const handleQuizEnd = useCallback((result?: KanaQuizCompletionResult) => {
    const isPracticeOnly = quizItem?.isPracticeOnly === true;
    const resultingKanaPoints =
      userPoints + (result?.newlyCompletedPoints ?? 0);
    const becameMastered =
      !wasMasteredBeforeQuizRef.current &&
      resultingKanaPoints >= MASTERY_THRESHOLDS.katakana;

    setQuizItem(null);
    if (isPracticeOnly) {
      pendingMasteryCelebrationRef.current = false;
      setSuppressUnlockPointsDuringUnlock(false);
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
        celebrationFallbackTimerRef.current = null;
      }
      return;
    }
    if (result?.newlyCompleted && result.newlyCompletedPoints > 0) {
      dispatchMasteryProgressSync({
        kanaPoints: userPoints + result.newlyCompletedPoints,
      });
    }
    if (result?.triggeredModuleMastery) {
      pendingMasteryCelebrationRef.current = false;
      setSuppressUnlockPointsDuringUnlock(false);
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
        celebrationFallbackTimerRef.current = null;
      }
      window.requestAnimationFrame(() => {
        dispatchMasteryCelebrationRequest({ moduleId: "katakana" });
      });
      void reload();
      return;
    }
    if (becameMastered) {
      pendingMasteryCelebrationRef.current = true;
      setSuppressUnlockPointsDuringUnlock(true);
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
      }
      celebrationFallbackTimerRef.current = setTimeout(() => {
        if (!pendingMasteryCelebrationRef.current) return;
        pendingMasteryCelebrationRef.current = false;
        setSuppressUnlockPointsDuringUnlock(false);
        dispatchMasteryCelebrationRequest({ moduleId: "katakana" });
      }, 2600);
    }
    void reload();
  }, [quizItem, reload, userPoints]);

  useEffect(() => {
    setHidden(detailNodeId !== null);
    return () => {
      setHidden(false);
    };
  }, [detailNodeId, setHidden]);

  useEffect(() => {
    return () => {
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
      }
    };
  }, []);

  const handleUnlockAnimationComplete = useCallback(() => {
    setSuppressUnlockPointsDuringUnlock(false);
    if (!pendingMasteryCelebrationRef.current) return;

    pendingMasteryCelebrationRef.current = false;
    if (celebrationFallbackTimerRef.current !== null) {
      clearTimeout(celebrationFallbackTimerRef.current);
      celebrationFallbackTimerRef.current = null;
    }
    dispatchMasteryCelebrationRequest({ moduleId: "katakana" });
  }, []);

  return (
    <WritingBoardView
      items={items}
      summary={summary}
      scriptType="katakana"
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      loading={loading}
      error={error}
      onNodeAction={handleNodeAction}
      quizActive={quizItem !== null}
      drawerOpen={detailNodeId !== null}
      initialNodeId={selectedId}
      focusedNodeId={detailNodeId ?? helpSelectedNodeId}
      masteryModuleId="katakana"
      masteryPoints={userPoints}
      autoTriggerOnNewMastery={false}
      suppressUnlockPointsDuringUnlock={suppressUnlockPointsDuringUnlock}
      onUnlockAnimationComplete={handleUnlockAnimationComplete}
    >
      <LessonDrawer
        open={detailNodeId !== null}
        onClose={handleCloseDetail}
        nodeId={detailNodeId}
        mode="writing"
        userId={GRAPH_USER_ID}
        kanaType="katakana"
        entityId={selectedProgress?.id ?? null}
        entityKind={selectedProgress ? "kana" : null}
        kanjiCtaDisabled={selectedProgress?.status === "locked"}
        kanjiCtaDisabledReason={
          selectedProgress?.status === "locked"
            ? "Necesitas mas puntos para desbloquear este kana."
            : undefined
        }
        onQuizStart={handleQuizStart}
      />

      {detailNodeId === null && <ContextualHelpButton getTour={buildHelpTour} />}

      {quizItem && (
        <KanaQuizModal
          kanaId={quizItem.id}
          label={quizItem.label}
          kanaType="katakana"
          quizType={quizItem.quizType}
          currentModulePoints={userPoints}
          wasCompletedBefore={quizItem.wasCompletedBefore}
          onClose={handleQuizEnd}
        />
      )}
    </WritingBoardView>
  );
}