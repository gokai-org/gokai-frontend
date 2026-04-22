"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSidebar } from "@/shared/components/SidebarContext";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { ContextualHelpButton } from "@/features/help/components/ContextualHelpButton";
import { createGrammarBoardContextTour } from "@/features/help/utils/contextualTours";
import {
  HELP_GUIDE_GRAMMAR_EVENT,
  dispatchHelpGuideGrammar,
  type HelpGuideGrammarDetail,
} from "@/features/help/utils/guideEvents";
import { useToast } from "@/shared/ui/ToastProvider";
import { UnlockStateDialog, type UnlockStateDialogStatus } from "@/shared/ui";
import { GrammarBoard } from "./board";
import GrammarLessonModal from "./lesson/GrammarLessonModal";
import GrammarQuizModal from "./lesson/exam/GrammarQuizModal";
import { useGrammarBoard } from "../hooks/useGrammarBoard";
import { useGrammarBoardQuality } from "../hooks/useGrammarBoardQuality";
import { useGrammarLesson } from "../hooks/useGrammarLesson";
import { unlockGrammar } from "../api/grammarApi";

type GrammarViewStage =
  | "board"
  | "zooming-in"
  | "lesson"
  | "quiz"
  | "zooming-out";

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.replace(/^HTTP\s+\d+:\s*/i, "").trim();

  return message || fallback;
}

function isForbiddenMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  return (
    normalized === "forbidden" ||
    normalized.includes('"error":"forbidden"') ||
    normalized.includes('"message":"forbidden"')
  );
}

type GrammarUnlockDialogState = {
  lessonId: string;
  status: UnlockStateDialogStatus;
};

export default function GrammarView() {
  const {
    board,
    status,
    refetch: refetchBoard,
    userPoints,
    progress: grammarProgress,
    nextUnlockCandidate,
    canUnlockNext,
    unlockCost,
  } = useGrammarBoard();
  const boardQuality = useGrammarBoardQuality();
  const { setHidden } = useSidebar();
  const toast = useToast();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [helpFocusedLessonId, setHelpFocusedLessonId] = useState<string | null>(null);
  const [unlockDialogState, setUnlockDialogState] = useState<GrammarUnlockDialogState | null>(null);
  const [stage, setStage] = useState<GrammarViewStage>("board");
  const [unlockPending, setUnlockPending] = useState(false);
  const [unlockPendingLessonId, setUnlockPendingLessonId] = useState<string | null>(null);

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

  const nextUnlockBlockedMessage = useMemo(() => {
    if (!nextUnlockCandidate) {
      return "Todas las lecciones de gramática ya estan desbloqueadas.";
    }

    const nextUnlockCost = nextUnlockCandidate.pointsToUnlock ?? unlockCost;

    if (grammarProgress && !grammarProgress.completed) {
      return `Completa ${grammarProgress.title} antes de desbloquear la siguiente leccion.`;
    }

    return `Necesitas ${Math.max(nextUnlockCost - userPoints, 0)} puntos mas para desbloquear ${nextUnlockCandidate.title}.`;
  }, [grammarProgress, nextUnlockCandidate, unlockCost, userPoints]);

  const unlockDialogCell = useMemo(
    () =>
      unlockDialogState
        ? board.cells.find((cell) => cell.progress.id === unlockDialogState.lessonId) ?? null
        : null,
    [board.cells, unlockDialogState],
  );

  const unlockDialogCost = useMemo(
    () => unlockDialogCell?.progress.pointsToUnlock ?? unlockCost,
    [unlockDialogCell, unlockCost],
  );

  const unlockDialogDescription = useMemo(() => {
    const progressItem = unlockDialogCell?.progress;

    if (!progressItem) {
      return "";
    }

    if (progressItem.status === "completed") {
      return `${progressItem.title} ya está completada. Puedes abrir la lección para repasar.`;
    }

    if (progressItem.status === "available") {
      return `${progressItem.title} ya está desbloqueada. Puedes abrir la lección y continuar con el recorrido.`;
    }

    if (progressItem.canUnlock) {
      return `Puedes gastar ${unlockDialogCost} puntos para desbloquear esta lección ahora mismo.`;
    }

    return nextUnlockBlockedMessage;
  }, [nextUnlockBlockedMessage, unlockDialogCell, unlockDialogCost]);

  const unlockDialogRequirement = useMemo(() => {
    const progressItem = unlockDialogCell?.progress;

    if (!progressItem || progressItem.status !== "locked" || progressItem.canUnlock) {
      return null;
    }

    if (progressItem.isNextUnlockCandidate) {
      const requiredPoints = progressItem.pointsToUnlock ?? unlockCost;

      if (grammarProgress && !grammarProgress.completed) {
        return `Requisito actual: completar ${grammarProgress.title}.`;
      }

      return `Requisito actual: reunir ${Math.max(requiredPoints - userPoints, 0)} puntos más.`;
    }

    return "Primero debes avanzar hasta esta casilla en el orden del tablero.";
  }, [grammarProgress, unlockCost, unlockDialogCell, userPoints]);

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
    if (stage === "lesson" || stage === "quiz") {
      setHidden(true);
    } else if (stage === "board") {
      setHidden(false);
    }

    return () => setHidden(false);
  }, [setHidden, stage]);

  const handleUnlockNextLesson = useCallback(async (lessonId: string) => {
    if (unlockPending) {
      return;
    }

    const targetLesson = board.cells.find((cell) => cell.progress.id === lessonId)?.progress;

    if (!targetLesson || !targetLesson.canUnlock) {
      return;
    }

    setUnlockPending(true);
    setUnlockPendingLessonId(lessonId);

    try {
      const response = await unlockGrammar(lessonId);
      dispatchMasteryProgressSync({ points: response.userPoints });
      await refetchBoard();
      setHelpFocusedLessonId(lessonId);
      setUnlockDialogState(null);
    } catch (error) {
      const message = getRequestErrorMessage(
        error,
        "No se pudo desbloquear la lección.",
      );

      toast.error(
        isForbiddenMessage(message)
          ? "El backend actual no autoriza el desbloqueo manual de gramática. La ruta esta respondiendo forbidden."
          : message,
      );
    } finally {
      setUnlockPending(false);
      setUnlockPendingLessonId(null);
    }
  }, [board.cells, refetchBoard, toast, unlockPending]);

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

      const targetCell = board.cells.find((cell) => cell.progress.id === lessonId);

      if (!targetCell || !targetCell.interactive || targetCell.progress.isMock) {
        return;
      }

      if (targetCell.progress.status === "locked") {
        setUnlockDialogState({
          lessonId,
          status: targetCell.progress.canUnlock ? "unlockable" : "locked",
        });
        return;
      }

      setUnlockDialogState({ lessonId, status: "unlocked" });
    },
    [
      board.cells,
      boardQuality.shouldAnimateBoardZoom,
      stage,
    ],
  );

  const handleUnlockDialogAction = useCallback(() => {
    const lessonId = unlockDialogCell?.progress.id;

    if (!lessonId) {
      return;
    }

    if (unlockDialogState?.status === "unlockable") {
      void handleUnlockNextLesson(lessonId);
      return;
    }

    setUnlockDialogState(null);
    setSelectedLessonId(lessonId);
    setStage(boardQuality.shouldAnimateBoardZoom ? "zooming-in" : "lesson");
  }, [boardQuality.shouldAnimateBoardZoom, handleUnlockNextLesson, unlockDialogCell?.progress.id, unlockDialogState?.status]);

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

  const handleCloseQuiz = useCallback(() => {
    if (stage !== "quiz") {
      return;
    }

    setStage("lesson");
  }, [stage]);

  const focusHelpLesson = useCallback(() => {
    if (!helpLessonId) {
      return;
    }

    setSelectedLessonId(null);
    setStage("board");
    setHelpFocusedLessonId(helpLessonId);
  }, [helpLessonId]);

  const openHelpLesson = useCallback(() => {
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
  }, [boardQuality.shouldAnimateBoardZoom, helpLessonId, selectedLessonId, stage]);

  const resetHelpTourState = useCallback(() => {
    setHelpFocusedLessonId(null);
    setSelectedLessonId(null);
    setStage("board");
  }, []);

  const buildHelpTour = useCallback(
    () =>
      createGrammarBoardContextTour({
        id: "grammar-context-tour",
        title: "Guia de Grammar",
        route: "/dashboard/graph/grammar",
        scopeSelector: '[data-help-surface="grammar-board"]',
        focusLesson: () => {
          dispatchHelpGuideGrammar("focus");
        },
        openLesson: () => {
          dispatchHelpGuideGrammar("open");
        },
        resetTourState: () => {
          dispatchHelpGuideGrammar("reset");
        },
      }),
    [],
  );

  useEffect(() => {
    const handleGrammarGuideEvent = (
      event: Event,
    ) => {
      const customEvent = event as CustomEvent<HelpGuideGrammarDetail>;
      const action = customEvent.detail?.action;

      if (action === "focus") {
        focusHelpLesson();
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
  }, [focusHelpLesson, openHelpLesson, resetHelpTourState]);

  const boardTransitionState = !boardQuality.shouldAnimateBoardZoom
    ? "idle"
    : stage === "board"
      ? "idle"
      : stage === "zooming-in"
        ? "zooming-in"
        : stage === "zooming-out"
          ? "zooming-out"
          : "hidden";

  return (
    <div
      data-help-surface="grammar-board"
      className="absolute inset-0 h-full w-full overflow-hidden"
    >
      <GrammarBoard
        board={board}
        status={status}
        onSelectLesson={handleSelectLesson}
        onPressUnlockLesson={handlePressUnlockLesson}
        unlockingLessonId={unlockPendingLessonId}
        focusLessonId={selectedLessonId}
        helpTargetLessonId={helpFocusedLessonId}
        transitionState={boardTransitionState}
      />

      {stage === "board" ? <ContextualHelpButton getTour={buildHelpTour} /> : null}

      <UnlockStateDialog
        open={unlockDialogState !== null && unlockDialogCell !== null}
        status={unlockDialogState?.status ?? "locked"}
        moduleLabel="Grammar"
        title={unlockDialogCell?.progress.title ?? "Lección"}
        symbol={unlockDialogCell?.progress.symbol ?? null}
        description={unlockDialogDescription}
        currentPoints={userPoints}
        unlockCost={unlockDialogCost}
        requirementLabel={unlockDialogRequirement}
        helperText={
          unlockDialogState?.status === "unlocked"
            ? "Desde aquí puedes abrir la lección y luego presentar el examen."
            : unlockDialogState?.status === "unlockable"
              ? "El desbloqueo manual respeta el orden del tablero y consume puntos del módulo."
              : null
        }
        actionLabel={
          unlockDialogState?.status === "unlockable"
            ? "Desbloquear lección"
            : unlockDialogState?.status === "unlocked"
              ? "Abrir lección"
              : undefined
        }
        actionPending={unlockPending}
        actionDisabled={unlockDialogState?.status === "unlockable" && !canUnlockNext}
        onAction={
          unlockDialogState?.status === "locked"
            ? undefined
            : handleUnlockDialogAction
        }
        onClose={() => setUnlockDialogState(null)}
      />

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
            onClose={handleCloseQuiz}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}