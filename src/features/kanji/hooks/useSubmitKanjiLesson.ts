"use client";

import { useState, useCallback } from "react";
import type {
  KanjiLessonResult,
  KanjiLessonResultBody,
} from "@/features/kanji/types";
import { submitKanjiLessonResult } from "@/features/kanji/api/kanjiApi";

interface UseSubmitKanjiLessonReturn {
  submit: (body: KanjiLessonResultBody) => Promise<KanjiLessonResult | null>;
  loading: boolean;
  error: string | null;
  result: KanjiLessonResult | null;
}

export function useSubmitKanjiLesson(): UseSubmitKanjiLessonReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KanjiLessonResult | null>(null);

  const submit = useCallback(
    async (body: KanjiLessonResultBody): Promise<KanjiLessonResult | null> => {
      // Guard: answers count must match totalExercises
      if (body.answers.length !== body.totalExercises) {
        const msg = `Submit bloqueado: answers.length (${body.answers.length}) !== totalExercises (${body.totalExercises})`;
        console.error("[HOOK]", msg);
        setError(msg);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("[HOOK] body que se enviará:", body);
        console.log("[HOOK] body JSON:", JSON.stringify(body, null, 2));

        const data = await submitKanjiLessonResult(body);

        console.log("[HOOK] respuesta exitosa del backend:", data);
        console.log(
          "[HOOK] respuesta backend JSON:",
          JSON.stringify(data, null, 2),
        );

        setResult(data);
        return data;
      } catch (err) {
        console.error("[HOOK] error al enviar resultado de lección:", err);

        const message =
          err instanceof Error
            ? err.message
            : "Error al enviar resultado de lección";

        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { submit, loading, error, result };
}
