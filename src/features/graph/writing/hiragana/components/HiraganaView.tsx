"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { NodeTypes, EdgeTypes } from "reactflow";
import { WritingBoardView } from "../../shared/components/WritingBoardView";
import type { WritingBoardProgress } from "../../shared/types";
import WritingBoardEdge from "../../shared/components/WritingBoardEdge";
import HiraganaBoardNode from "./HiraganaBoardNode";
import { useHiraganaBoard } from "../hooks/useHiraganaBoard";
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
import {
  HELP_GUIDE_WRITING_EVENT,
  type HelpGuideWritingDetail,
} from "@/features/help/utils/guideEvents";

type KanaQuizCompletionResult = {
  newlyCompleted: boolean;
  newlyCompletedPoints: number;
  resultingModulePoints: number;
  dominated: boolean;
  score: number;
  triggeredModuleMastery: boolean;
};

const NODE_TYPES: NodeTypes = { "writing-node": HiraganaBoardNode };
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

export default function HiraganaView() {
  const { items, summary, loading, error, reload, userPoints } = useHiraganaBoard();
  const { setHidden } = useSidebar();
  const mastered = useMasteredModules();
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [helpFocusedNodeId, setHelpFocusedNodeId] = useState<string | null>(null);
  const [quizItem, setQuizItem] = useState<{
    id: string;
    label: string;
    quizType?: KanaQuizType;
    wasCompletedBefore: boolean;
    isPracticeOnly: boolean;
    progressEligible: boolean;
  } | null>(null);
  const wasMasteredBeforeQuizRef = useRef(false);
  const pendingMasteryCelebrationRef = useRef(false);
  const celebrationFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathPreviewTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const [suppressUnlockPointsDuringUnlock, setSuppressUnlockPointsDuringUnlock] = useState(false);

  const selectedProgress = useMemo(
    () => items.find((item) => item.id === detailNodeId) ?? null,
    [detailNodeId, items],
  );

  const helpNodeId = useMemo(
    () => items.find((item) => item.status !== "locked")?.id ?? null,
    [items],
  );
  const currentProgressKanaId = useMemo(
    () =>
      [...items].reverse().find((item) => item.status !== "locked")?.id ?? null,
    [items],
  );

  const handleNodeAction = useCallback((item: WritingBoardProgress) => {
    setDetailNodeId(item.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailNodeId(null);
  }, []);

  const clearPathPreview = useCallback(() => {
    pathPreviewTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    pathPreviewTimeoutsRef.current = [];
  }, []);

  const playHelpPathPreview = useCallback(() => {
    clearPathPreview();

    const orderedItems = [...items].sort((a, b) => a.index - b.index);

    if (orderedItems.length === 0) {
      setHelpFocusedNodeId(null);
      return;
    }

    orderedItems.slice(0, 8).forEach((item, index) => {
      const timeoutId = setTimeout(() => {
        setHelpFocusedNodeId(item.id);
      }, index * 520);
      pathPreviewTimeoutsRef.current.push(timeoutId);
    });
  }, [clearPathPreview, items]);

  const focusHelpNode = useCallback((target?: HelpGuideWritingDetail["target"]) => {
    if (target === "path") {
      setDetailNodeId(null);
      playHelpPathPreview();
      return;
    }

    clearPathPreview();
    if (!helpNodeId) {
      setHelpFocusedNodeId(null);
      return;
    }

    setDetailNodeId(null);
    setHelpFocusedNodeId(helpNodeId);
  }, [clearPathPreview, helpNodeId, playHelpPathPreview]);

  const openHelpLesson = useCallback(() => {
    clearPathPreview();
    if (!helpNodeId) {
      return;
    }

    setHelpFocusedNodeId(null);
    setDetailNodeId(helpNodeId);
  }, [clearPathPreview, helpNodeId]);

  const resetHelpTourState = useCallback(() => {
    clearPathPreview();
    setHelpFocusedNodeId(null);
    setDetailNodeId(null);
  }, [clearPathPreview]);

  useEffect(() => clearPathPreview, [clearPathPreview]);

  const buildHelpTour = useCallback(
    () => {
      if (!helpNodeId) {
        return createLockedBoardAccessTour({
          id: "hiragana-writing-locked-guide",
          title: "Cómo desbloquear Hiragana",
          scopeSelector: '[data-help-surface="hiragana-board"]',
          boardLabel: "Tablero de shōgi",
          requirementLabel: "la primera lección disponible",
        });
      }

      return createWritingBoardContextTour({
        id: "hiragana-context-tour",
        title: "Guía de Hiragana",
        scopeSelector: '[data-help-surface="hiragana-board"]',
        scriptLabel: "hiragana",
        unitLabel: "kana",
        lessonSummary: "significado, lectura y trazado",
        boardGameLabel: "shōgi",
        welcomeDescription:
          "Bienvenido al tablero de shōgi. Hiragana es el primer tablero disponible y desde aquí empiezas a aprender cada kana.",
        unlockFlowDescription:
          "Hiragana está disponible desde el inicio. Completa sus kanas para avanzar con seguridad y abrir el camino hacia Katakana.",
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

  useEffect(() => {
    const handleWritingGuideEvent = (event: Event) => {
      const customEvent = event as CustomEvent<HelpGuideWritingDetail>;
      const detail = customEvent.detail;

      if (detail?.script !== "hiragana") {
        return;
      }

      if (detail.action === "focus") {
        focusHelpNode(detail.target);
      } else if (detail.action === "open") {
        openHelpLesson();
      } else if (detail.action === "reset") {
        resetHelpTourState();
      }
    };

    window.addEventListener(HELP_GUIDE_WRITING_EVENT, handleWritingGuideEvent);

    return () => {
      window.removeEventListener(HELP_GUIDE_WRITING_EVENT, handleWritingGuideEvent);
    };
  }, [focusHelpNode, openHelpLesson, resetHelpTourState]);

  const handleQuizStart = useCallback(
    (
      entity: { id: string; symbol: string },
      quizType?: KanaQuizType | KanjiQuizType,
    ) => {
      if (!isKanaQuizType(quizType)) {
        return;
      }

      wasMasteredBeforeQuizRef.current = mastered.has("hiragana");
      const wasCompletedBefore =
        items.find((item) => item.id === entity.id)?.status === "completed";
      const progressEligible =
        quizType === undefined &&
        !wasCompletedBefore &&
        entity.id === currentProgressKanaId;
      setDetailNodeId(null);
      setQuizItem({
        id: entity.id,
        label: entity.symbol,
        quizType,
        wasCompletedBefore,
        isPracticeOnly:
          quizType !== undefined || wasCompletedBefore || !progressEligible,
        progressEligible,
      });
    },
    [currentProgressKanaId, items, mastered],
  );

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

  const handleQuizEnd = useCallback((result?: KanaQuizCompletionResult) => {
    const isPracticeOnly = quizItem?.isPracticeOnly === true;
    const resultingKanaPoints =
      result?.resultingModulePoints ??
      userPoints + (result?.newlyCompletedPoints ?? 0);
    const becameMastered =
      !wasMasteredBeforeQuizRef.current &&
      resultingKanaPoints >= MASTERY_THRESHOLDS.hiragana;

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
        kanaPoints:
          result.resultingModulePoints ??
          userPoints + result.newlyCompletedPoints,
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
        dispatchMasteryCelebrationRequest({ moduleId: "hiragana" });
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
        dispatchMasteryCelebrationRequest({ moduleId: "hiragana" });
      }, 2600);
    }
    void reload();
  }, [quizItem, reload, userPoints]);

  const handleUnlockAnimationComplete = useCallback(() => {
    setSuppressUnlockPointsDuringUnlock(false);
    if (!pendingMasteryCelebrationRef.current) return;

    pendingMasteryCelebrationRef.current = false;
    if (celebrationFallbackTimerRef.current !== null) {
      clearTimeout(celebrationFallbackTimerRef.current);
      celebrationFallbackTimerRef.current = null;
    }
    dispatchMasteryCelebrationRequest({ moduleId: "hiragana" });
  }, []);

  return (
    <WritingBoardView
      items={items}
      summary={summary}
      scriptType="hiragana"
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      loading={loading}
      error={error}
      onNodeAction={handleNodeAction}
      quizActive={quizItem !== null}
      drawerOpen={detailNodeId !== null}
      focusedNodeId={detailNodeId ?? helpFocusedNodeId}
      masteryModuleId="hiragana"
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
        kanaType="hiragana"
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

      {detailNodeId === null && quizItem === null && (
        <ContextualHelpButton getTour={buildHelpTour} />
      )}

      {quizItem && (
        <KanaQuizModal
          kanaId={quizItem.id}
          label={quizItem.label}
          kanaType="hiragana"
          quizType={quizItem.quizType}
          currentModulePoints={userPoints}
          wasCompletedBefore={quizItem.wasCompletedBefore}
          progressEligible={quizItem.progressEligible}
          onClose={handleQuizEnd}
        />
      )}
    </WritingBoardView>
  );
}
