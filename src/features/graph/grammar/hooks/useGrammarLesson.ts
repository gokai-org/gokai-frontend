"use client";

import { useEffect, useState, useCallback } from "react";
import type { GrammarLesson } from "../types";
import { getGrammarLesson } from "../api/grammarApi";

type Status = "idle" | "loading" | "error" | "success";

export function useGrammarLesson(id: string | null) {
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await getGrammarLesson(id);
      setLesson(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { lesson, status, error, refetch: fetch };
}
