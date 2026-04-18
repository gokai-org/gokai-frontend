"use client";

import { useMemo } from "react";
import { createGrammarBoardViewModel } from "../lib/grammarBoardLayout";
import { getGrammarBoardActiveId } from "../lib/grammarBoardModel";
import { useGrammarLessons } from "./useGrammarLessons";

export function useGrammarBoard() {
  const { boardItems, status, error, refetch } = useGrammarLessons();

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
  };
}