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
  currentExerciseCorrectCount: 0,
  results: [],
  selectedOptionIndex: null,
  isAnswered: false,
  writingPhase: "demo",
  writingScore: null,
};

export interface UseKanjiLessonFlowReturn {
  state: KanjiLessonSessionState;
  flowData: KanjiLessonFlowData | null;
  currentExercise: KanjiLessonBlockPayload | null;
  totalExercises: number;
  overallProgress: number;
  loading: boolean;
  error: string | null;
  submitting: boolean;

  startLesson: (kanji: Kanji) => Promise<void>;
  beginExercises: () => void;
  selectOption: (optionIndex: number) => void;
  confirmAnswer: () => void;
  nextStep: () => void;
  setWritingPhase: (phase: KanjiWritingPhase) => void;
  completeWriting: (score: number) => void;
  reset: () => void;
}

export function useKanjiLessonFlow(): UseKanjiLessonFlowReturn {
  const [state, setState] = useState<KanjiLessonSessionState>(INITIAL_STATE);
  const [flowData, setFlowData] = useState<KanjiLessonFlowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Always-current refs — safe to read inside callbacks without stale closure risk
  const stateRef = useRef(state);
  stateRef.current = state;
  const flowDataRef = useRef(flowData);
  flowDataRef.current = flowData;

  // Idempotency guard: tracks which exercise indices have already been submitted.
  // Prevents double-submission caused by React StrictMode double-invoking setState updaters.
  const submittedIndicesRef = useRef<Set<number>>(new Set());

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
    submittedIndicesRef.current.clear();
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
      currentExerciseCorrectCount: 0,
      selectedOptionIndex: null,
      isAnswered: false,
      writingPhase: "demo",
      writingScore: null,
    }));
  }, []);

  // ── Select option ──
  const selectOption = useCallback((optionIndex: number) => {
    setState((s) => {
      if (s.isAnswered) return s; 
      return { ...s, selectedOptionIndex: optionIndex };
    });
  }, []);

  const confirmAnswer = useCallback(() => {
    setState((s) => {
      if (s.selectedOptionIndex === null || s.isAnswered) return s;
      return { ...s, isAnswered: true, step: "exercise-feedback" };
    });
  }, []);

  // ── Submit block result — idempotent via exerciseIndex guard ──
  // IMPORTANT: This must be called OUTSIDE any setState updater to prevent
  // double-invocation in React StrictMode (which calls updaters twice per update).
  const submitBlockResult = useCallback(async (
    result: KanjiLessonExerciseResult,
    exerciseIndex: number,
  ) => {
    // Idempotency: skip if this exercise index was already submitted in this session
    if (submittedIndicesRef.current.has(exerciseIndex)) return;
    submittedIndicesRef.current.add(exerciseIndex);

    const fd = flowDataRef.current;
    if (!fd) return;

    setSubmitting(true);
    try {
      await submitKanjiLessonExerciseResult({
        type: result.type,
        kanjiId: fd.kanjiId,
        score: result.score,
      });
    } catch (err) {
      console.error("[LessonFlow] Error submitting block result:", err);
      // Allow a retry attempt on the next call
      submittedIndicesRef.current.delete(exerciseIndex);
    } finally {
      setSubmitting(false);
    }
  }, []);

  // ── Next step: advance question → exercise → summary ──
  // Uses stateRef / flowDataRef instead of the functional-updater form so that
  // submitBlockResult stays OUTSIDE setState and is never double-invoked.
  const nextStep = useCallback(() => {
    const s = stateRef.current;
    const fd = flowDataRef.current;
    if (!fd) return;

    const exercise = fd.exercises[s.currentExerciseIndex];
    if (!exercise) return;

    const question = exercise.questions[s.currentQuestionIndex];
    const isCorrect = question?.options[s.selectedOptionIndex ?? -1]?.correct ?? false;

    // Accumulate correct count for this exercise (fixes multi-question scoring)
    const newCorrectCount = s.currentExerciseCorrectCount + (isCorrect ? 1 : 0);
    const nextQ = s.currentQuestionIndex + 1;

    // ── More questions remain in this exercise ──
    if (nextQ < exercise.questions.length) {
      setState({
        ...s,
        step: "exercise" as KanjiLessonFlowStep,
        currentQuestionIndex: nextQ,
        selectedOptionIndex: null,
        isAnswered: false,
        currentExerciseCorrectCount: newCorrectCount,
      });
      return;
    }

    // ── Last question of this exercise done: build result ──
    const totalQs = exercise.questions.length;
    const blockResult: KanjiLessonExerciseResult = {
      type: exercise.type,
      totalQuestions: totalQs,
      correctAnswers: newCorrectCount,
      score: Math.round((newCorrectCount / totalQs) * 100),
    };

    const newResults = [...s.results, blockResult];
    const exerciseIndex = s.currentExerciseIndex;
    const nextEx = exerciseIndex + 1;

    if (nextEx < fd.exercises.length) {
      const nextExercise = fd.exercises[nextEx];
      setState({
        ...s,
        step: "exercise" as KanjiLessonFlowStep,
        currentExerciseIndex: nextEx,
        currentQuestionIndex: 0,
        selectedOptionIndex: null,
        isAnswered: false,
        results: newResults,
        currentExerciseCorrectCount: 0,
        writingPhase: nextExercise.type === "writing" ? "demo" as KanjiWritingPhase : s.writingPhase,
        writingScore: null,
      });
    } else {
      setState({
        ...s,
        step: "summary" as KanjiLessonFlowStep,
        results: newResults,
        selectedOptionIndex: null,
        isAnswered: false,
        currentExerciseCorrectCount: 0,
      });
    }

    // Submit OUTSIDE setState — idempotency guard prevents duplicates
    submitBlockResult(blockResult, exerciseIndex);
  }, [submitBlockResult]);

  const setWritingPhase = useCallback((phase: KanjiWritingPhase) => {
    setState((s) => ({ ...s, writingPhase: phase }));
  }, []);

  const completeWriting = useCallback((score: number) => {
    const s = stateRef.current;
    const fd = flowDataRef.current;
    if (!fd) return;

    const exercise = fd.exercises[s.currentExerciseIndex];
    if (!exercise || exercise.type !== "writing") return;

    const blockResult: KanjiLessonExerciseResult = {
      type: "writing",
      totalQuestions: 1,
      correctAnswers: score >= 50 ? 1 : 0,
      score,
    };

    const newResults = [...s.results, blockResult];
    const exerciseIndex = s.currentExerciseIndex;
    const nextEx = exerciseIndex + 1;

    if (nextEx < fd.exercises.length) {
      setState({
        ...s,
        step: "exercise" as KanjiLessonFlowStep,
        currentExerciseIndex: nextEx,
        currentQuestionIndex: 0,
        selectedOptionIndex: null,
        isAnswered: false,
        results: newResults,
        writingScore: score,
        writingPhase: "done" as KanjiWritingPhase,
        currentExerciseCorrectCount: 0,
      });
    } else {
      setState({
        ...s,
        step: "summary" as KanjiLessonFlowStep,
        results: newResults,
        writingScore: score,
        writingPhase: "done" as KanjiWritingPhase,
        currentExerciseCorrectCount: 0,
      });
    }

    // Submit OUTSIDE setState — idempotency guard prevents duplicates
    submitBlockResult(blockResult, exerciseIndex);
  }, [submitBlockResult]);

  // ── Reset ──
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setFlowData(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    submittedIndicesRef.current.clear();
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
