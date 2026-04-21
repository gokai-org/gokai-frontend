"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSidebar } from "@/shared/components/SidebarContext";
import { ContextualHelpButton } from "@/features/help/components/ContextualHelpButton";
import { createGrammarBoardContextTour } from "@/features/help/utils/contextualTours";
import {
  HELP_GUIDE_GRAMMAR_EVENT,
  dispatchHelpGuideGrammar,
  type HelpGuideGrammarDetail,
} from "@/features/help/utils/guideEvents";
import { GrammarBoard } from "./board";
import GrammarLessonModal from "./lesson/GrammarLessonModal";
import GrammarQuizModal from "./lesson/exam/GrammarQuizModal";
import { useGrammarBoard } from "../hooks/useGrammarBoard";
import { useGrammarBoardQuality } from "../hooks/useGrammarBoardQuality";
import { useGrammarLesson } from "../hooks/useGrammarLesson";

type GrammarViewStage =
  | "board"
  | "zooming-in"
  | "lesson"
  | "quiz"
  | "zooming-out";

export default function GrammarView() {
  const {
    board,
    status,
  } = useGrammarBoard();
  const boardQuality = useGrammarBoardQuality();
  const { setHidden } = useSidebar();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [helpFocusedLessonId, setHelpFocusedLessonId] = useState<string | null>(null);
  const [stage, setStage] = useState<GrammarViewStage>("board");

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
      board.cells.find((cell) => cell.interactive && !cell.progress.isMock)?.progress.id ??
      board.activeId ??
      null,
    [board.activeId, board.cells],
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

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      if (stage !== "board") {
        return;
      }

      const targetCell = board.cells.find((cell) => cell.progress.id === lessonId);

      if (!targetCell || !targetCell.interactive || targetCell.progress.isMock) {
        return;
      }

      setSelectedLessonId(lessonId);
      setStage(boardQuality.shouldAnimateBoardZoom ? "zooming-in" : "lesson");
    },
    [board.cells, boardQuality.shouldAnimateBoardZoom, stage],
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
        focusLessonId={selectedLessonId}
        helpTargetLessonId={helpFocusedLessonId}
        transitionState={boardTransitionState}
      />

      {stage === "board" ? <ContextualHelpButton getTour={buildHelpTour} /> : null}

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