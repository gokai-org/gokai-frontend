"use client";

import { startTransition, useCallback, useMemo, useState } from "react";
import { createGrammarBoardViewModel } from "../lib/grammarBoardLayout";
import { getGrammarBoardActiveId } from "../lib/grammarBoardModel";
import { useGrammarLessons } from "./useGrammarLessons";

export function useGrammarBoard() {
  const { boardItems, status, error, refetch } = useGrammarLessons();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [examLessonId, setExamLessonId] = useState<string | null>(null);

  const activeId = useMemo(
    () => getGrammarBoardActiveId(boardItems, selectedId),
    [boardItems, selectedId],
  );

  const board = useMemo(
    () => createGrammarBoardViewModel(boardItems, activeId),
    [activeId, boardItems],
  );

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      const targetItem = boardItems.find((item) => item.id === lessonId);

      if (!targetItem || targetItem.isMock || targetItem.status === "locked") {
        return;
      }

      startTransition(() => {
        setSelectedId(lessonId);
      });
    },
    [boardItems],
  );

  const handleCloseLesson = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleOpenExam = useCallback(() => {
    if (!selectedId) {
      return;
    }

    startTransition(() => {
      setExamLessonId(selectedId);
      setSelectedId(null);
    });
  }, [selectedId]);

  const handleCloseExam = useCallback(() => {
    setExamLessonId(null);
  }, []);

  return {
    board,
    boardItems,
    status,
    error,
    refetch,
    selectedId,
    examLessonId,
    handleSelectLesson,
    handleCloseLesson,
    handleOpenExam,
    handleCloseExam,
  };
}