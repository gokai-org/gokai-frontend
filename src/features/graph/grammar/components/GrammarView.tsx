"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { useSidebar } from "@/shared/components/SidebarContext";
import { GrammarBoard } from "./board";
import GrammarLessonModal from "./lesson/GrammarLessonModal";
import GrammarQuizModal from "./lesson/exam/GrammarQuizModal";
import { useGrammarBoard } from "../hooks/useGrammarBoard";
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
  const platformMotion = usePlatformMotion();
  const { setHidden } = useSidebar();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [stage, setStage] = useState<GrammarViewStage>("board");

  const { lesson, status: lessonStatus, error, refetch } = useGrammarLesson(selectedLessonId);

  const zoomDurationMs = useMemo(
    () =>
      Math.round(
        Math.max(
          480,
          (platformMotion.shouldUseLightAnimations ? 560 : 720) *
            platformMotion.durationScale,
        ),
      ),
    [platformMotion.durationScale, platformMotion.shouldUseLightAnimations],
  );

  const zoomOutDurationMs = useMemo(
    () =>
      Math.round(
        Math.max(
          320,
          (platformMotion.shouldUseLightAnimations ? 360 : 460) *
            platformMotion.durationScale,
        ),
      ),
    [platformMotion.durationScale, platformMotion.shouldUseLightAnimations],
  );

  useEffect(() => {
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
  }, [stage, zoomDurationMs, zoomOutDurationMs]);

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
      setStage("zooming-in");
    },
    [board.cells, stage],
  );

  const handleCloseLesson = useCallback(() => {
    if (!selectedLessonId || stage !== "lesson") {
      return;
    }

    setStage("zooming-out");
  }, [selectedLessonId, stage]);

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

  const boardTransitionState =
    stage === "board"
      ? "idle"
      : stage === "zooming-in"
        ? "zooming-in"
        : stage === "zooming-out"
          ? "zooming-out"
          : "hidden";

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <GrammarBoard
        board={board}
        status={status}
        onSelectLesson={handleSelectLesson}
        focusLessonId={selectedLessonId}
        transitionState={boardTransitionState}
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