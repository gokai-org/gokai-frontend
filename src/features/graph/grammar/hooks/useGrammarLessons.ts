"use client";

import { useEffect, useState, useCallback } from "react";
import type { GrammarBoardProgress } from "../types";
import { listGrammarLessons } from "../api/grammarApi";
import { buildGrammarBoardItems } from "../lib/grammarBoardModel";

type Status = "idle" | "loading" | "error" | "success";

export function useGrammarLessons() {
  const [boardItems, setBoardItems] = useState<GrammarBoardProgress[]>(() =>
    buildGrammarBoardItems([]),
  );
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await listGrammarLessons();
      setBoardItems(buildGrammarBoardItems(data));
      setStatus("success");
    } catch (err) {
      setBoardItems(buildGrammarBoardItems([]));
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