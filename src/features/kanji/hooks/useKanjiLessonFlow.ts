"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import type { Kanji } from "@/features/kanji/types";
import type {
  KanjiLessonFlowData,
  KanjiLessonFlowStep,
  KanjiLessonExerciseResult,
  KanjiLessonSessionState,
  KanjiWritingPhase,
  KanjiLessonBlockPayload,
} from "@/features/kanji/types/lessonFlow";
import { getKanjiLessonFlow, submitKanjiLessonExerciseResult } from "@/features/kanji/api/kanjiLessonFlowApi";
import { meaningsToArray, readingsToArray } from "@/features/kanji/utils/kanjiText";

const INITIAL_STATE: KanjiLessonSessionState = {
  step: "loading",
  currentExerciseIndex: 0,
  currentQuestionIndex: 0,
  results: [],
  selectedOptionIndex: null,
  isAnswered: false,
  writingPhase: "demo",
  writingScore: null,
};

export interface UseKanjiLessonFlowReturn {
  /** Current session state */
  state: KanjiLessonSessionState;
  /** Full lesson flow data (null while loading) */
  flowData: KanjiLessonFlowData | null;
  /** Current exercise block (null if not on exercise step) */
  currentExercise: KanjiLessonBlockPayload | null;
  /** Total number of exercises */
  totalExercises: number;
  /** Overall progress percentage (0–100) */
  overallProgress: number;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Whether a submission is in progress */
  submitting: boolean;

  /** Initialize the lesson flow for a kanji */
  startLesson: (kanji: Kanji) => Promise<void>;
  /** Move from intro to first exercise */
  beginExercises: () => void;
  /** Select an answer option (for choice exercises) */
  selectOption: (optionIndex: number) => void;
  /** Confirm the selected answer and show feedback */
  confirmAnswer: () => void;
  /** Advance to the next question or exercise */
  nextStep: () => void;
  /** Set writing phase (demo → practice) */
  setWritingPhase: (phase: KanjiWritingPhase) => void;
  /** Complete the writing exercise with a score */
  completeWriting: (score: number) => void;
  /** Reset the entire session */
  reset: () => void;
}

export function useKanjiLessonFlow(): UseKanjiLessonFlowReturn {
  const [state, setState] = useState<KanjiLessonSessionState>(INITIAL_STATE);
  const [flowData, setFlowData] = useState<KanjiLessonFlowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Derived
  const currentExercise = useMemo(() => {
    if (!flowData || state.step !== "exercise" && state.step !== "exercise-feedback") return null;
    return flowData.exercises[state.currentExerciseIndex] ?? null;
  }, [flowData, state.step, state.currentExerciseIndex]);

  const totalExercises = flowData?.exercises.length ?? 0;

  const overallProgress = useMemo(() => {
    if (totalExercises === 0) return 0;
    if (state.step === "summary") return 100;
    const completedWeight = state.results.length / totalExercises;
    const currentProgress = state.currentQuestionIndex /
      Math.max(1, currentExercise?.questions.length ?? 1);
    return Math.round((completedWeight + currentProgress / totalExercises) * 100);
  }, [totalExercises, state.step, state.results.length, state.currentQuestionIndex, currentExercise]);

  // ── Start lesson ──
  const startLesson = useCallback(async (kanji: Kanji) => {
    setLoading(true);
    setError(null);
    setState(INITIAL_STATE);
    setFlowData(null);
    startTimeRef.current = Date.now();

    try {
      const meanings = meaningsToArray(kanji.meanings);
      const readings = readingsToArray(kanji.readings);
      const data = await getKanjiLessonFlow(kanji.id, kanji.symbol, meanings, readings);
      setFlowData(data);
      setState((s) => ({ ...s, step: "intro" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar la lección";
      setError(msg);
      setState((s) => ({ ...s, step: "loading" }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Begin exercises (from intro) ──
  const beginExercises = useCallback(() => {
    setState((s) => ({
      ...s,
      step: "exercise",
      currentExerciseIndex: 0,
      currentQuestionIndex: 0,
      selectedOptionIndex: null,
      isAnswered: false,
      writingPhase: "demo",
      writingScore: null,
    }));
  }, []);

  // ── Select option ──
  const selectOption = useCallback((optionIndex: number) => {
    setState((s) => {
      if (s.isAnswered) return s; // Can't change after confirming
      return { ...s, selectedOptionIndex: optionIndex };
    });
  }, []);

  // ── Confirm answer (show feedback) ──
  const confirmAnswer = useCallback(() => {
    setState((s) => {
      if (s.selectedOptionIndex === null || s.isAnswered) return s;
      return { ...s, isAnswered: true, step: "exercise-feedback" };
    });
  }, []);

  // ── Submit block result to backend ──
  const submitBlockResult = useCallback(async (result: KanjiLessonExerciseResult) => {
    if (!flowData) return;
    setSubmitting(true);
    try {
      await submitKanjiLessonExerciseResult({
        type: result.type,
        kanjiId: flowData.kanjiId,
        score: result.score,
      });
    } catch (err) {
      console.error("[LessonFlow] Error submitting block result:", err);
    } finally {
      setSubmitting(false);
    }
  }, [flowData]);

  // ── Next step (after feedback or to next exercise) ──
  const nextStep = useCallback(() => {
    setState((s) => {
      if (!flowData) return s;
      const exercise = flowData.exercises[s.currentExerciseIndex];
      if (!exercise) return s;

      // Calculate if current answer was correct
      const question = exercise.questions[s.currentQuestionIndex];
      const isCorrect = question?.options[s.selectedOptionIndex ?? -1]?.correct ?? false;

      // Move to next question in same exercise
      const nextQ = s.currentQuestionIndex + 1;
      if (nextQ < exercise.questions.length) {
        return {
          ...s,
          step: "exercise" as KanjiLessonFlowStep,
          currentQuestionIndex: nextQ,
          selectedOptionIndex: null,
          isAnswered: false,
        };
      }

      // Exercise block complete — calculate score
      const totalQs = exercise.questions.length;
      const correctSoFar = s.results
        .filter((r) => r.type === exercise.type)
        .reduce((sum, r) => sum + r.correctAnswers, 0);
      const totalCorrect = correctSoFar + (isCorrect ? 1 : 0);

      const blockResult: KanjiLessonExerciseResult = {
        type: exercise.type,
        totalQuestions: totalQs,
        correctAnswers: totalCorrect,
        score: Math.round((totalCorrect / totalQs) * 100),
      };

      // Submit to backend (fire and forget)
      submitBlockResult(blockResult);

      const newResults = [...s.results, blockResult];

      // Move to next exercise
      const nextEx = s.currentExerciseIndex + 1;
      if (nextEx < flowData.exercises.length) {
        const nextExercise = flowData.exercises[nextEx];
        return {
          ...s,
          step: "exercise" as KanjiLessonFlowStep,
          currentExerciseIndex: nextEx,
          currentQuestionIndex: 0,
          selectedOptionIndex: null,
          isAnswered: false,
          results: newResults,
          writingPhase: nextExercise.type === "writing" ? "demo" as KanjiWritingPhase : s.writingPhase,
          writingScore: null,
        };
      }

      // All exercises done → summary
      return {
        ...s,
        step: "summary" as KanjiLessonFlowStep,
        results: newResults,
        selectedOptionIndex: null,
        isAnswered: false,
      };
    });
  }, [flowData, submitBlockResult]);

  // ── Writing-specific actions ──
  const setWritingPhase = useCallback((phase: KanjiWritingPhase) => {
    setState((s) => ({ ...s, writingPhase: phase }));
  }, []);

  const completeWriting = useCallback((score: number) => {
    setState((s) => {
      if (!flowData) return s;
      const exercise = flowData.exercises[s.currentExerciseIndex];
      if (!exercise || exercise.type !== "writing") return s;

      const blockResult: KanjiLessonExerciseResult = {
        type: "writing",
        totalQuestions: 1,
        correctAnswers: score >= 50 ? 1 : 0,
        score,
      };

      submitBlockResult(blockResult);

      const newResults = [...s.results, blockResult];
      const nextEx = s.currentExerciseIndex + 1;

      if (nextEx < flowData.exercises.length) {
        return {
          ...s,
          step: "exercise" as KanjiLessonFlowStep,
          currentExerciseIndex: nextEx,
          currentQuestionIndex: 0,
          selectedOptionIndex: null,
          isAnswered: false,
          results: newResults,
          writingScore: score,
          writingPhase: "done" as KanjiWritingPhase,
        };
      }

      return {
        ...s,
        step: "summary" as KanjiLessonFlowStep,
        results: newResults,
        writingScore: score,
        writingPhase: "done" as KanjiWritingPhase,
      };
    });
  }, [flowData, submitBlockResult]);

  // ── Reset ──
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setFlowData(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
  }, []);

  return {
    state,
    flowData,
    currentExercise,
    totalExercises,
    overallProgress,
    loading,
    error,
    submitting,
    startLesson,
    beginExercises,
    selectOption,
    confirmAnswer,
    nextStep,
    setWritingPhase,
    completeWriting,
    reset,
  };
}
