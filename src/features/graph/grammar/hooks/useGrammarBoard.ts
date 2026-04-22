"use client";

import { useMemo } from "react";
import { createGrammarBoardViewModel } from "../lib/grammarBoardLayout";
import { getGrammarBoardActiveId } from "../lib/grammarBoardModel";
import { useGrammarLessons } from "./useGrammarLessons";

export function useGrammarBoard() {
  const {
    boardItems,
    status,
    error,
    refetch,
    userPoints,
    progress,
    nextUnlockCandidate,
    canUnlockNext,
    unlockCost,
    applyOptimisticUnlock,
    recentlyUnlockedIds,
  } = useGrammarLessons();

  const activeId = useMemo(
    () => getGrammarBoardActiveId(boardItems),
    [boardItems],
  );

  const board = useMemo(
    () => createGrammarBoardViewModel(boardItems, activeId),
    [activeId, boardItems],
  );

  return {
    board,
    boardItems,
    status,
    error,
    refetch,
    userPoints,
    progress,
    nextUnlockCandidate,
    canUnlockNext,
    unlockCost,
    applyOptimisticUnlock,
    recentlyUnlockedIds,
  };
}