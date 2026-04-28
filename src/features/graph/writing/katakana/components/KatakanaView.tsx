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
    progressEligible: boolean;
  } | null>(
    null,
  );
  const wasMasteredBeforeQuizRef = useRef(false);
  const pendingMasteryCelebrationRef = useRef(false);
  const celebrationFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathPreviewTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
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
  const currentProgressKanaId = useMemo(
    () =>
      [...items].reverse().find((item) => item.status !== "locked")?.id ?? null,
    [items],
  );

  const handleNodeAction = useCallback((item: WritingBoardProgress) => {
    setManualSelectedId(item.id);
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
      setHelpSelectedNodeId(null);
      return;
    }

    orderedItems.slice(0, 8).forEach((item, index) => {
      const timeoutId = setTimeout(() => {
        setHelpSelectedNodeId(item.id);
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
      setHelpSelectedNodeId(null);
      return;
    }

    setDetailNodeId(null);
    setHelpSelectedNodeId(helpNodeId);
  }, [clearPathPreview, helpNodeId, playHelpPathPreview]);

  const openHelpLesson = useCallback(() => {
    clearPathPreview();
    if (!helpNodeId) {
      return;
    }

    setHelpSelectedNodeId(null);
    setManualSelectedId(helpNodeId);
    setDetailNodeId(helpNodeId);
  }, [clearPathPreview, helpNodeId]);

  const resetHelpTourState = useCallback(() => {
    clearPathPreview();
    setHelpSelectedNodeId(null);
    setDetailNodeId(null);
  }, [clearPathPreview]);

  useEffect(() => clearPathPreview, [clearPathPreview]);

  const buildHelpTour = useCallback(
    () => {
      if (!helpNodeId) {
        return createLockedBoardAccessTour({
          id: "katakana-context-tour-locked",
          title: "Guía de Katakana",
          scopeSelector: '[data-help-surface="katakana-board"]',
          boardLabel: "Tablero de katakana",
          requirementLabel: "pasar Hiragana",
        });
      }

      return createWritingBoardContextTour({
        id: "katakana-context-tour",
        title: "Guía de Katakana",
        scopeSelector: '[data-help-surface="katakana-board"]',
        scriptLabel: "katakana",
        unitLabel: "kana",
        lessonSummary: "significado, lectura y trazado",
        boardGameLabel: "mahjong",
        welcomeDescription:
          "Bienvenido al tablero de mahjong. Aquí aprenderás katakana cuando hayas pasado Hiragana y el tablero quede desbloqueado.",
        unlockFlowDescription:
          "Katakana permanece bloqueado hasta que avances lo suficiente en Hiragana. Cuando se desbloquee, cada kana abrirá su lección y práctica.",
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

      if (detail?.script !== "katakana") {
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
      window.removeEventListener(
        HELP_GUIDE_WRITING_EVENT,
        handleWritingGuideEvent,
      );
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

      wasMasteredBeforeQuizRef.current = mastered.has("katakana");
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

  const handleQuizEnd = useCallback((result?: KanaQuizCompletionResult) => {
    const isPracticeOnly = quizItem?.isPracticeOnly === true;
    const resultingKanaPoints =
      result?.resultingModulePoints ??
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

      {detailNodeId === null && quizItem === null && (
        <ContextualHelpButton getTour={buildHelpTour} />
      )}

      {quizItem && (
        <KanaQuizModal
          kanaId={quizItem.id}
          label={quizItem.label}
          kanaType="katakana"
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