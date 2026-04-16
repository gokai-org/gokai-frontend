"use client";

import { useEffect, useState, useCallback } from "react";
import type { GrammarLesson } from "../types";
import { getGrammarLesson } from "../api/grammarApi";

type Status = "idle" | "loading" | "error" | "success";

const lessonCache = new Map<string, GrammarLesson>();
const inflightLessons = new Map<string, Promise<GrammarLesson>>();

async function loadGrammarLesson(id: string) {
  const cachedLesson = lessonCache.get(id);

  if (cachedLesson) {
    return cachedLesson;
  }

  const inflightLesson = inflightLessons.get(id);

  if (inflightLesson) {
    return inflightLesson;
  }

  const request = getGrammarLesson(id)
    .then((data) => {
      lessonCache.set(id, data);
      return data;
    })
    .finally(() => {
      inflightLessons.delete(id);
    });

  inflightLessons.set(id, request);

  return request;
}

export function useGrammarLesson(id: string | null) {
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLesson(null);
      setStatus("idle");
      setError(null);
      return;
    }

    const cachedLesson = lessonCache.get(id);

    if (cachedLesson) {
      setLesson(cachedLesson);
      setStatus("success");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const data = await loadGrammarLesson(id);
      setLesson(data);
      setStatus("success");
    } catch (err) {
      setLesson(null);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetch();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetch]);

  return { lesson, status, error, refetch: fetch };
}
