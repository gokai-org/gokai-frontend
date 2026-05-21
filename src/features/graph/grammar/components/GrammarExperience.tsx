"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Node } from "reactflow";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GraphGateModal } from "@/features/graph/components/GraphGateModal";
import { useKanaContentAccess } from "@/features/kana/hooks/useKanaContentAccess";
import { useSidebar } from "@/shared/components/SidebarContext";
import { MasteryBoardWrapper } from "@/features/mastery/components/MasteryBoardWrapper";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { dispatchMasteryCelebrationRequest, dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { ContextualHelpButton } from "@/features/help/components/ContextualHelpButton";
import {
  createGrammarBoardContextTour,
  createLockedBoardAccessTour,
} from "@/features/help/utils/contextualTours";
import {
  HELP_GUIDE_GRAMMAR_EVENT,
  dispatchHelpGuideGrammar,
  type HelpGuideGrammarDetail,
} from "@/features/help/utils/guideEvents";
import { useToast } from "@/shared/ui/ToastProvider";
import { GrammarBoard } from "./board";
import GrammarLessonModal from "./lesson/GrammarLessonModal";
import GrammarQuizModal from "./lesson/exam/GrammarQuizModal";
import { useGrammarBoard } from "../hooks/useGrammarBoard";
import { useGrammarBoardQuality } from "../hooks/useGrammarBoardQuality";
import { useGrammarLesson } from "../hooks/useGrammarLesson";
import { unlockGrammar } from "../api/grammarApi";
import { invalidateApiCache } from "@/shared/lib/api/client";
import type { GrammarQuizCompletionResult } from "../types";
import type { GrammarBoardCellViewModel } from "../types";

type GrammarViewStage =
  | "board"
  | "zooming-in"
  | "lesson"
  | "quiz"
  | "zooming-out";

type GrammarFocusTarget = Exclude<
  HelpGuideGrammarDetail["target"],
  undefined | "path"
>;

export interface GrammarExperienceProps {
  embedded?: boolean;
  className?: string;
  showHelpButton?: boolean;
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.replace(/^HTTP\s+\d+:\s*/i, "").trim();

  return message || fallback;
}

export function GrammarExperience({
  embedded = false,
  className,
  showHelpButton = !embedded,
}: GrammarExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    board,
    status,
    refetch: refetchBoard,
    applyOptimisticUnlock,
    recentlyUnlockedIds,
    nextUnlockCandidate,
    hasGrammarMastery,
    hasKanaContentAccess,
    progress,
    userPoints,
  } = useGrammarBoard();
  const { blockedMessage } = useKanaContentAccess();
  const autoUnlockedRef = useRef<Set<string>>(new Set());
  const handledRecommendationLessonIdRef = useRef<string | null>(null);
  const recommendationFocusTimeoutRef = useRef<number | null>(null);
  const recommendationModalTimeoutRef = useRef<number | null>(null);
  const boardQuality = useGrammarBoardQuality();
  const { setHidden } = useSidebar();
  const mastered = useMasteredModules();
  const toast = useToast();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [helpFocusedLessonId, setHelpFocusedLessonId] = useState<string | null>(null);
  const [stage, setStage] = useState<GrammarViewStage>("board");
  const [unlockPending, setUnlockPending] = useState(false);
  const [unlockPendingLessonId, setUnlockPendingLessonId] = useState<string | null>(null);
  const [showKanaRequirementModal, setShowKanaRequirementModal] = useState(false);
  const [recommendationLockedLesson, setRecommendationLockedLesson] = useState<{
    title: string;
    requiresKana: boolean;
    remainingUnlockSteps: number;
    totalUnlockPoints: number;
    additionalPointsNeeded: number;
  } | null>(null);
  const pathPreviewTimeoutsRef = useRef<number[]>([]);
  const requestedLessonId = searchParams.get("lessonId");

  const { lesson, status: lessonStatus, error, refetch } = useGrammarLesson(selectedLessonId);

  const zoomDurationMs = useMemo(
    () => boardQuality.boardZoomDurationMs,
    [boardQuality.boardZoomDurationMs],
  );

  const zoomOutDurationMs = useMemo(
    () => boardQuality.boardZoomOutDurationMs,
    [boardQuality.boardZoomOutDurationMs],
  );

  const helpLessonId = useMemo(
    () =>
      board.cells.find(
        (cell) => cell.progress.status !== "locked" && !cell.progress.isMock,
      )?.progress.id ??
      null,
    [board.cells],
  );

  const findHelpFocusLessonId = useCallback(
    (target: GrammarFocusTarget = "available") => {
      const cells = board.cells.filter((cell) => !cell.progress.isMock);
      if (cells.length === 0) return null;

      const byTarget: Record<GrammarFocusTarget, () => GrammarBoardCellViewModel | undefined> = {
        available: () => cells.find((cell) => cell.progress.id === helpLessonId) ?? cells[0],
        start: () => cells[0],
        outer: () => cells.find((cell) => cell.layout.routeTier === "outer" && cell.layout.order >= 6) ?? cells[0],
        inner: () => cells.find((cell) => cell.layout.routeTier === "inner") ?? cells[Math.floor(cells.length / 2)],
        goal: () => cells.find((cell) => cell.layout.routeTier === "goal") ?? cells[cells.length - 1],
        next: () =>
          cells.find((cell) => cell.progress.isNextUnlockCandidate) ??
          cells.find((cell) => cell.progress.status === "locked") ??
          cells[0],
      };

      return byTarget[target]?.()?.progress.id ?? null;
    },
    [board.cells, helpLessonId],
  );

  const clearPathPreview = useCallback(() => {
    pathPreviewTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    pathPreviewTimeoutsRef.current = [];
  }, []);

  const clearRecommendationFocusTimeout = useCallback(() => {
    if (recommendationFocusTimeoutRef.current !== null) {
      window.clearTimeout(recommendationFocusTimeoutRef.current);
      recommendationFocusTimeoutRef.current = null;
    }
  }, []);

  const clearRecommendationModalTimeout = useCallback(() => {
    if (recommendationModalTimeoutRef.current !== null) {
      window.clearTimeout(recommendationModalTimeoutRef.current);
      recommendationModalTimeoutRef.current = null;
    }
  }, []);

  const playHelpPathPreview = useCallback(() => {
    const cells = board.cells
      .filter((cell) => !cell.progress.isMock)
      .sort((left, right) => left.layout.order - right.layout.order);

    if (cells.length === 0) {
      return;
    }

    clearPathPreview();
    setSelectedLessonId(null);
    setStage("board");
    setHelpFocusedLessonId(cells[0].progress.id);

    pathPreviewTimeoutsRef.current = cells.slice(1).map((cell, index) =>
      window.setTimeout(() => {
        setHelpFocusedLessonId(cell.progress.id);
      }, (index + 1) * 520),
    );
  }, [board.cells, clearPathPreview]);

  useEffect(() => {
    if (!boardQuality.shouldAnimateBoardZoom) {
      return;
    }

    if (stage !== "zooming-in" && stage !== "zooming-out") {
      return;
    }

    const duration = stage === "zooming-out" ? zoomOutDurationMs : zoomDurationMs;
    const timeoutId = window.setTimeout(() => {
      if (stage === "zooming-in") {
        setStage("lesson");
        return;
      }

      setStage("board");
      setSelectedLessonId(null);
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [boardQuality.shouldAnimateBoardZoom, stage, zoomDurationMs, zoomOutDurationMs]);

  useEffect(() => {
    if (stage === "lesson" || stage === "quiz" || showKanaRequirementModal) {
      setHidden(true);
    } else if (stage === "board") {
      setHidden(false);
    }

    return () => setHidden(false);
  }, [setHidden, showKanaRequirementModal, stage]);

  const handleUnlockNextLesson = useCallback(async (lessonId: string) => {
    if (!hasKanaContentAccess) {
      setShowKanaRequirementModal(true);
      return;
    }

    if (unlockPending) {
      return;
    }

    const targetLesson = board.cells.find((cell) => cell.progress.id === lessonId)?.progress;

    if (!targetLesson || !targetLesson.canUnlock) {
      return;
    }

    clearPathPreview();
    setHelpFocusedLessonId(null);
    setUnlockPending(true);
    setUnlockPendingLessonId(lessonId);

    try {
      const response = await unlockGrammar(lessonId);
      dispatchMasteryProgressSync({ points: response.userPoints });
      applyOptimisticUnlock(lessonId);
      void refetchBoard();
    } catch (error) {
      const message = getRequestErrorMessage(
        error,
        "No se pudo desbloquear la lección.",
      );

      toast.error(message);
    } finally {
      setUnlockPending(false);
      setUnlockPendingLessonId(null);
    }
  }, [applyOptimisticUnlock, board.cells, clearPathPreview, hasKanaContentAccess, refetchBoard, toast, unlockPending]);

  useEffect(() => {
    if (status !== "success") return;
    if (stage !== "board") return;
    if (!hasKanaContentAccess) return;
    if (unlockPending) return;
    const candidate = nextUnlockCandidate;
    if (!candidate || !candidate.canUnlock) return;
    if ((candidate.pointsToUnlock ?? 0) > 0) return;
    if (autoUnlockedRef.current.has(candidate.id)) return;
    autoUnlockedRef.current.add(candidate.id);
    void handleUnlockNextLesson(candidate.id);
  }, [handleUnlockNextLesson, hasKanaContentAccess, nextUnlockCandidate, stage, status, unlockPending]);

  const handlePressUnlockLesson = useCallback(
    (lessonId: string) => {
      if (stage !== "board") {
        return;
      }

      void handleUnlockNextLesson(lessonId);
    },
    [handleUnlockNextLesson, stage],
  );

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      if (stage !== "board") {
        return;
      }

      if (!hasKanaContentAccess) {
        setShowKanaRequirementModal(true);
        return;
      }

      const targetCell = board.cells.find((cell) => cell.progress.id === lessonId);

      if (!targetCell || !targetCell.interactive || targetCell.progress.isMock) {
        return;
      }

      if (targetCell.progress.status === "locked") {
        return;
      }

      setSelectedLessonId(lessonId);
      setStage(boardQuality.shouldAnimateBoardZoom ? "zooming-in" : "lesson");
    },
    [
      board.cells,
      hasKanaContentAccess,
      boardQuality.shouldAnimateBoardZoom,
      stage,
    ],
  );

  const handleCloseLesson = useCallback(() => {
    if (!selectedLessonId || stage !== "lesson") {
      return;
    }

    if (boardQuality.shouldAnimateBoardZoom) {
      setStage("zooming-out");
      return;
    }

    setSelectedLessonId(null);
    setStage("board");
  }, [boardQuality.shouldAnimateBoardZoom, selectedLessonId, stage]);

  const handleStartExam = useCallback(() => {
    if (stage !== "lesson" || !lesson?.content?.exam?.length) {
      return;
    }

    setStage("quiz");
  }, [lesson, stage]);

  const selectedBoardLesson = useMemo(
    () =>
      selectedLessonId
        ? (board.cells.find((cell) => cell.progress.id === selectedLessonId)?.progress ?? null)
        : null,
    [board.cells, selectedLessonId],
  );

  const handleCloseQuiz = useCallback(() => {
    if (stage !== "quiz") {
      return;
    }

    setStage("lesson");
  }, [stage]);

  const handleExitQuizToBoard = useCallback(() => {
    if (stage !== "quiz") {
      return;
    }

    if (boardQuality.shouldAnimateBoardZoom) {
      setStage("zooming-out");
      return;
    }

    setSelectedLessonId(null);
    setStage("board");
  }, [boardQuality.shouldAnimateBoardZoom, stage]);

  const handleQuizComplete = useCallback(
    (result: GrammarQuizCompletionResult) => {
      invalidateApiCache("/api/content/grammar/progress");
      if (result.hasGrammarMastery === true) {
        dispatchMasteryProgressSync({ hasGrammarMastery: true });

        if (!mastered.has("grammar")) {
          window.requestAnimationFrame(() => {
            dispatchMasteryCelebrationRequest({ moduleId: "grammar" });
          });
        }
      }
      void refetchBoard();
    },
    [mastered, refetchBoard],
  );

  const focusHelpLesson = useCallback((target?: HelpGuideGrammarDetail["target"]) => {
    if (target === "path") {
      playHelpPathPreview();
      return;
    }

    clearPathPreview();
    const targetLessonId = findHelpFocusLessonId(target);

    if (!targetLessonId) {
      return;
    }

    setSelectedLessonId(null);
    setStage("board");
    setHelpFocusedLessonId(targetLessonId);
  }, [clearPathPreview, findHelpFocusLessonId, playHelpPathPreview]);

  const openHelpLesson = useCallback(() => {
    clearPathPreview();

    if (!helpLessonId) {
      return;
    }

    if (
      selectedLessonId === helpLessonId &&
      (stage === "lesson" || stage === "quiz" || stage === "zooming-in")
    ) {
      return;
    }

    setHelpFocusedLessonId(null);
    setSelectedLessonId(helpLessonId);
    setStage(boardQuality.shouldAnimateBoardZoom ? "zooming-in" : "lesson");
  }, [boardQuality.shouldAnimateBoardZoom, clearPathPreview, helpLessonId, selectedLessonId, stage]);

  const resetHelpTourState = useCallback(() => {
    clearPathPreview();
    clearRecommendationFocusTimeout();
    clearRecommendationModalTimeout();
    setHelpFocusedLessonId(null);
    setSelectedLessonId(null);
    setStage("board");
  }, [
    clearPathPreview,
    clearRecommendationFocusTimeout,
    clearRecommendationModalTimeout,
  ]);

  const buildHelpTour = useCallback(
    () => {
      if (!helpLessonId) {
        return createLockedBoardAccessTour({
          id: "grammar-context-tour-locked",
          title: "Guía de Gramática",
          scopeSelector: '[data-help-surface="grammar-board"]',
          boardLabel: "Tablero de gramática",
          requirementLabel: hasKanaContentAccess ? "35 puntos" : blockedMessage,
          targetName: "grammar-board-canvas",
        });
      }

      return createGrammarBoardContextTour({
        id: "grammar-context-tour",
        title: "Guía de Gramática",
        route: "/dashboard/graph/grammar",
        scopeSelector: '[data-help-surface="grammar-board"]',
        boardGameLabel: "Sugoroku",
        unlockFlowDescription:
          "El recorrido se desbloquea como una espiral: en escritorio comienza en la esquina inferior izquierda y avanza hacia el centro; en celular empieza arriba a la izquierda para que el camino sea más legible.",
        focusLesson: (target) => {
          dispatchHelpGuideGrammar("focus", target);
        },
        openLesson: () => {
          dispatchHelpGuideGrammar("open");
        },
        resetTourState: () => {
          dispatchHelpGuideGrammar("reset");
        },
      });
    },
    [blockedMessage, hasKanaContentAccess, helpLessonId],
  );

  useEffect(() => clearPathPreview, [clearPathPreview]);

  useEffect(() => {
    if (status !== "success" || !requestedLessonId) {
      return;
    }

    if (handledRecommendationLessonIdRef.current === requestedLessonId) {
      return;
    }

    if (!board.cells.some((cell) => cell.progress.id === requestedLessonId)) {
      return;
    }

    const requestedCell =
      board.cells.find((cell) => cell.progress.id === requestedLessonId) ?? null;
    const currentLessonIndex = progress?.grammarId
      ? (board.cells.find((cell) => cell.progress.id === progress.grammarId)?.progress.index ?? -1)
      : -1;

    clearPathPreview();
    clearRecommendationFocusTimeout();
    clearRecommendationModalTimeout();
    setShowKanaRequirementModal(false);
    setRecommendationLockedLesson(null);
    setSelectedLessonId(null);
    setHelpFocusedLessonId(requestedLessonId);
    setStage("board");

    recommendationFocusTimeoutRef.current = window.setTimeout(() => {
      setHelpFocusedLessonId((currentLessonId) =>
        currentLessonId === requestedLessonId ? null : currentLessonId,
      );
      recommendationFocusTimeoutRef.current = null;
    }, 1800);

    if (
      requestedCell?.progress.status === "locked" &&
      requestedCell.progress.canUnlock !== true
    ) {
      const unlockCostPerStep =
        requestedCell.progress.unlockCost ??
        requestedCell.progress.pointsToUnlock ??
        0;
      const remainingUnlockSteps = Math.max(
        0,
        requestedCell.progress.index - currentLessonIndex,
      );
      const totalUnlockPoints = remainingUnlockSteps * unlockCostPerStep;

      recommendationModalTimeoutRef.current = window.setTimeout(() => {
        setRecommendationLockedLesson({
          title: requestedCell.progress.title,
          requiresKana: !hasKanaContentAccess,
          remainingUnlockSteps,
          totalUnlockPoints,
          additionalPointsNeeded: Math.max(0, totalUnlockPoints - userPoints),
        });
        recommendationModalTimeoutRef.current = null;
      }, 900);
    }

    handledRecommendationLessonIdRef.current = requestedLessonId;
  }, [
    board.cells,
    clearPathPreview,
    clearRecommendationFocusTimeout,
    clearRecommendationModalTimeout,
    hasKanaContentAccess,
    progress?.grammarId,
    requestedLessonId,
    status,
    userPoints,
  ]);

  useEffect(() => clearRecommendationFocusTimeout, [clearRecommendationFocusTimeout]);

  useEffect(() => clearRecommendationModalTimeout, [clearRecommendationModalTimeout]);

  useEffect(() => {
    if (!showHelpButton) {
      return;
    }

    const handleGrammarGuideEvent = (
      event: Event,
    ) => {
      const customEvent = event as CustomEvent<HelpGuideGrammarDetail>;
      const action = customEvent.detail?.action;
      const target = customEvent.detail?.target;

      if (action === "focus") {
        focusHelpLesson(target);
      } else if (action === "open") {
        openHelpLesson();
      } else if (action === "reset") {
        resetHelpTourState();
      }
    };

    window.addEventListener(HELP_GUIDE_GRAMMAR_EVENT, handleGrammarGuideEvent);

    return () => {
      window.removeEventListener(
        HELP_GUIDE_GRAMMAR_EVENT,
        handleGrammarGuideEvent,
      );
    };
  }, [focusHelpLesson, openHelpLesson, resetHelpTourState, showHelpButton]);

  const boardTransitionState = !boardQuality.shouldAnimateBoardZoom
    ? "idle"
    : stage === "board"
      ? helpFocusedLessonId
        ? "tour-focus"
        : "idle"
      : stage === "zooming-in"
        ? "zooming-in"
        : stage === "zooming-out"
          ? "zooming-out"
          : "hidden";

  const boardFocusLessonId = stage === "board"
    ? helpFocusedLessonId
    : selectedLessonId;

  const masteryNodes = useMemo<Node[]>(
    () =>
      board.cells
        .filter((cell) => !cell.progress.isMock)
        .sort((left, right) => left.layout.order - right.layout.order)
        .map((cell) => ({
          id: cell.progress.id,
          type: "grammar-mastery-node",
          position: {
            x: (cell.layout.x + cell.layout.width / 2) * 10,
            y: (cell.layout.y + cell.layout.height / 2) * 10,
          },
          data: {},
          style: { width: cell.layout.width * 10 },
        })),
    [board.cells],
  );

  const completedGrammarItems = useMemo(
    () =>
      board.cells.filter(
        (cell) => !cell.progress.isMock && cell.progress.status === "completed",
      ).length,
    [board.cells],
  );

  const noopSetCenter = useCallback(() => undefined, []);

  const rootClassName = embedded
    ? [
        "relative w-full overflow-hidden rounded-[30px] border border-black/[0.05] bg-surface-primary shadow-[0_24px_54px_rgba(0,0,0,0.12)] dark:border-white/[0.08]",
        "h-[min(76dvh,34rem)] sm:h-[min(80dvh,44rem)] lg:h-[min(82dvh,54rem)]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")
    : ["absolute inset-0 h-full w-full overflow-hidden", className ?? ""]
        .filter(Boolean)
        .join(" ");

  const content = (
    <div
      data-help-surface={showHelpButton ? "grammar-board" : undefined}
      data-grammar-mastered={hasGrammarMastery ? "true" : "false"}
      className={rootClassName}
    >
      <GrammarBoard
        board={board}
        status={status}
        hasMastery={hasGrammarMastery}
        onSelectLesson={handleSelectLesson}
        onPressUnlockLesson={handlePressUnlockLesson}
        unlockingLessonId={unlockPendingLessonId}
        focusLessonId={boardFocusLessonId}
        helpTargetLessonId={helpFocusedLessonId}
        transitionState={boardTransitionState}
        recentlyUnlockedIds={recentlyUnlockedIds}
        embedded={embedded}
      />

      {showHelpButton && stage === "board" ? <ContextualHelpButton getTour={buildHelpTour} /> : null}

      <AnimatePresence>
        {(stage === "lesson" || stage === "zooming-out") && selectedLessonId ? (
          <GrammarLessonModal
            lesson={lesson}
            status={lessonStatus}
            error={error}
            onClose={handleCloseLesson}
            onRetry={() => {
              void refetch();
            }}
            onStartExam={handleStartExam}
            isClosing={stage === "zooming-out"}
          />
        ) : null}

        {stage === "quiz" && lesson ? (
          <GrammarQuizModal
            lesson={lesson}
            wasCompletedBefore={selectedBoardLesson?.status === "completed"}
            onClose={handleCloseQuiz}
            onExitToBoard={handleExitQuizToBoard}
            onComplete={handleQuizComplete}
          />
        ) : null}

        <GraphGateModal
          open={showKanaRequirementModal}
          variant="kana-required"
          blockedContentLabel="gramatica"
          onClose={() => setShowKanaRequirementModal(false)}
          onOpenHiragana={() => {
            setShowKanaRequirementModal(false);
            router.push("/dashboard/graph/writing?tab=hiragana");
          }}
          onOpenKatakana={() => {
            setShowKanaRequirementModal(false);
            router.push("/dashboard/graph/writing?tab=katakana");
          }}
        />

        <AnimatePresence>
          {recommendationLockedLesson ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-4"
              onClick={() => setRecommendationLockedLesson(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 14 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-xl overflow-hidden rounded-[26px] bg-surface-primary shadow-[0_24px_64px_rgba(0,0,0,0.18)] ring-1 ring-border-subtle"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="px-5 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-xl">
                      <span className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                        Esta recomendacion aun esta bloqueada
                      </span>

                      <h2 className="mt-4 max-w-[18ch] text-2xl font-black leading-tight text-content-primary dark:text-white sm:text-4xl">
                        Aun no llegas a esta leccion de gramatica
                      </h2>

                      <p className="mt-4 text-sm leading-7 text-content-secondary dark:text-white/66 sm:text-base">
                        {recommendationLockedLesson.title} sigue bloqueada dentro de tu recorrido actual. Continua avanzando en el tablero y desbloquea las lecciones previas para poder abrirla.
                      </p>

                      {recommendationLockedLesson.requiresKana ? (
                        <p className="mt-3 text-sm font-semibold text-content-primary dark:text-white">
                          Antes de llegar aqui tambien necesitas desbloquear hiragana y katakana.
                        </p>
                      ) : null}

                      {recommendationLockedLesson.totalUnlockPoints > 0 ? (
                        <p className="mt-3 text-sm font-semibold text-content-primary dark:text-white">
                          {recommendationLockedLesson.remainingUnlockSteps === 1
                            ? `Te falta 1 desbloqueo de gramatica para llegar a esta leccion, equivalente a ${recommendationLockedLesson.totalUnlockPoints} puntos en total.`
                            : `Te faltan ${recommendationLockedLesson.remainingUnlockSteps} desbloqueos de gramatica para llegar a esta leccion, equivalentes a ${recommendationLockedLesson.totalUnlockPoints} puntos en total.`}
                        </p>
                      ) : null}

                      {recommendationLockedLesson.additionalPointsNeeded > 0 ? (
                        <p className="mt-2 text-sm text-content-secondary dark:text-white/66">
                          Con tu saldo actual, todavia necesitas reunir {recommendationLockedLesson.additionalPointsNeeded} puntos mas para completar ese recorrido.
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRecommendationLockedLesson(null)}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-secondary text-content-tertiary shadow-sm transition-colors hover:bg-surface-tertiary hover:text-content-primary"
                      aria-label="Cerrar modal"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M6 6 18 18" />
                        <path d="M18 6 6 18" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-7 flex flex-col gap-3 rounded-[26px] border border-[#E8C4BD] bg-[#FFF4F2] px-5 py-4 dark:border-[#50302E] dark:bg-[#1D1716] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-content-primary dark:text-white">
                        La recomendacion ya quedo enfocada en tu tablero
                      </p>

                      <p className="mt-1 text-sm leading-6 text-content-secondary dark:text-white/66">
                        Puedes usar este foco visual para ubicar la leccion y seguir el camino que te falta dentro del board.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRecommendationLockedLesson(null)}
                      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-accent/25 focus:outline-none focus:ring-4 focus:ring-accent/20"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );

  return (
    <MasteryBoardWrapper
      moduleId="grammar"
      isMastered={hasGrammarMastery}
      autoTriggerOnNewMastery={false}
      totalItems={masteryNodes.length}
      completedItems={completedGrammarItems}
      nodes={masteryNodes}
      setCenter={noopSetCenter}
      tourZoom={1}
    >
      {content}
    </MasteryBoardWrapper>
  );
}

export default GrammarExperience;