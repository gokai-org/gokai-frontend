"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { GrammarBoard } from "./board";
import GrammarLessonModal from "./lesson/GrammarLessonModal";
import GrammarQuizModal from "./lesson/exam/GrammarQuizModal";
import { useGrammarBoard } from "../hooks/useGrammarBoard";
import { useGrammarBoardQuality } from "../hooks/useGrammarBoardQuality";
import { useGrammarLesson } from "../hooks/useGrammarLesson";
import { unlockGrammar } from "../api/grammarApi";
import { invalidateApiCache } from "@/shared/lib/api/client";
import type { GrammarQuizCompletionResult } from "../types";

type GrammarViewStage =
  | "board"
  | "zooming-in"
  | "lesson"
  | "quiz"
  | "zooming-out";

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
  const {
    board,
    status,
    refetch: refetchBoard,
    applyOptimisticUnlock,
    recentlyUnlockedIds,
    nextUnlockCandidate,
  } = useGrammarBoard();
  const autoUnlockedRef = useRef<Set<string>>(new Set());
  const boardQuality = useGrammarBoardQuality();
  const { setHidden } = useSidebar();
  const toast = useToast();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [helpFocusedLessonId, setHelpFocusedLessonId] = useState<string | null>(null);
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
      applyOptimisticUnlock(lessonId);
      setHelpFocusedLessonId(lessonId);
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
  }, [applyOptimisticUnlock, board.cells, refetchBoard, toast, unlockPending]);

  useEffect(() => {
    if (status !== "success") return;
    if (stage !== "board") return;
    if (unlockPending) return;
    const candidate = nextUnlockCandidate;
    if (!candidate || !candidate.canUnlock) return;
    if ((candidate.pointsToUnlock ?? 0) > 0) return;
    if (autoUnlockedRef.current.has(candidate.id)) return;
    autoUnlockedRef.current.add(candidate.id);
    void handleUnlockNextLesson(candidate.id);
  }, [handleUnlockNextLesson, nextUnlockCandidate, stage, status, unlockPending]);

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
        return;
      }

      setSelectedLessonId(lessonId);
      setStage(boardQuality.shouldAnimateBoardZoom ? "zooming-in" : "lesson");
    },
    [
      board.cells,
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

  const handleCloseQuiz = useCallback(() => {
    if (stage !== "quiz") {
      return;
    }

    setStage("lesson");
  }, [stage]);

  const handleQuizComplete = useCallback(
    (result: GrammarQuizCompletionResult) => {
      dispatchMasteryProgressSync({ points: result.userPoints });
      invalidateApiCache("/api/content/grammar/progress");
      void refetchBoard();
    },
    [refetchBoard],
  );

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
        title: "Guía de Gramática",
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
    if (!showHelpButton) {
      return;
    }

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
  }, [focusHelpLesson, openHelpLesson, resetHelpTourState, showHelpButton]);

  const boardTransitionState = !boardQuality.shouldAnimateBoardZoom
    ? "idle"
    : stage === "board"
      ? "idle"
      : stage === "zooming-in"
        ? "zooming-in"
        : stage === "zooming-out"
          ? "zooming-out"
          : "hidden";

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

  return (
    <div
      data-help-surface={showHelpButton ? "grammar-board" : undefined}
      className={rootClassName}
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
            onClose={handleCloseQuiz}
            onComplete={handleQuizComplete}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default GrammarExperience;