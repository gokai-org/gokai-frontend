"use client";

import { useEffect, useState, useCallback } from "react";
import type { GrammarBoardProgress } from "../types";
import { listGrammarLessons } from "../api/grammarApi";
import { MOCK_GRAMMAR_LESSONS, GRAMMAR_BOARD_TOTAL } from "../data/mockLessons";

type Status = "idle" | "loading" | "error" | "success";

const JAPANESE_SYMBOL_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fffー々〆ヵヶ]+/g;

function extractLessonSymbol(title: string, index: number) {
  const matches = title.match(JAPANESE_SYMBOL_PATTERN) ?? [];
  const symbol = matches.find((token) => token.trim().length > 0);

  if (symbol) {
    return symbol.slice(0, Math.min(symbol.length, 3));
  }

  return index === 0 ? "文" : "法";
}

function buildBoardItems(realCount: number, realLessons: { id: string; title: string; pointsToUnlock: number | null }[]): GrammarBoardProgress[] {
  const items: GrammarBoardProgress[] = [];

  for (let i = 0; i < GRAMMAR_BOARD_TOTAL; i++) {
    const real = realLessons[i];
    if (real) {
      items.push({
        id: real.id,
        index: i,
        symbol: extractLessonSymbol(real.title, i),
        title: real.title,
        pointsToUnlock: real.pointsToUnlock ?? 0,
        status: "available",
        isMock: false,
      });
    } else {
      const mock = MOCK_GRAMMAR_LESSONS[i] ?? MOCK_GRAMMAR_LESSONS[MOCK_GRAMMAR_LESSONS.length - 1];
      items.push({
        id: mock.id,
        index: i,
        symbol: extractLessonSymbol(mock.title, i),
        title: mock.title,
        pointsToUnlock: mock.pointsToUnlock ?? (i * 30),
        status: "locked",
        isMock: true,
      });
    }
  }

  return items;
}

export function useGrammarLessons() {
  const [boardItems, setBoardItems] = useState<GrammarBoardProgress[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await listGrammarLessons();
      setBoardItems(buildBoardItems(data.length, data));
      setStatus("success");
    } catch (err) {
      // On error, still show the board with all mocks
      setBoardItems(buildBoardItems(0, []));
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetch();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetch]);

  return { boardItems, status, error, refetch: fetch };
}