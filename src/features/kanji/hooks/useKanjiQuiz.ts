"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import type {
  KanjiQuizResponse,
  KanjiQuizSessionState,
  KanjiQuizStep,
  KanjiQuizQuestionResult,
  KanjiQuizType,
  KanjiQuizRoundResult,
} from "@/features/kanji/types/quiz";
import { QUIZ_TOTAL_ROUNDS } from "@/features/kanji/types/quiz";
import { getKanjiQuiz, submitKanjiQuiz } from "@/features/kanji/api/kanjiQuizApi";
import { getCurrentUser } from "@/features/auth/services/api";
import { isValidWritingQuestion } from "@/features/kanji/utils/quizParser";

const INITIAL_STATE: KanjiQuizSessionState = {
  step: "loading",
  currentQuestionIndex: 0,
  selectedOptionIndex: null,
  isAnswered: false,
  questionResults: [],
  writingQuestionIndex: 0,
  writingPhase: "demo",
  writingScores: [],
};

export interface UseKanjiQuizReturn {
  state: KanjiQuizSessionState;
  quizData: KanjiQuizResponse | null;
  currentQuestion: KanjiQuizResponse["questions"][number] | null;
  totalQuestions: number;
  overallProgress: number;
  finalScore: number;
  duration: number;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  isPointsError: boolean;
  updatedPoints: number | null;
  roundResults: KanjiQuizRoundResult[];
  currentRound: number;

  startQuiz: (kanjiId: string) => Promise<void>;
  selectOption: (optionIndex: number) => void;
  confirmAnswer: () => void;
  nextStep: () => void;
  setWritingPhase: (phase: "demo" | "practice" | "done") => void;
  completeWritingQuestion: (score: number) => void;
  reset: () => void;
}

export function useKanjiQuiz(): UseKanjiQuizReturn {
  const [state, setState] = useState<KanjiQuizSessionState>(INITIAL_STATE);
  const [quizData, setQuizData] = useState<KanjiQuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPointsError, setIsPointsError] = useState(false);
  const [updatedPoints, setUpdatedPoints] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<KanjiQuizRoundResult[]>([]);

  const roundResultsRef = useRef<KanjiQuizRoundResult[]>([]);
  const roundStartTimeRef = useRef<number>(0);
  const kanjiIdRef = useRef<string>("");
  // Prevents concurrent / duplicate calls to submitResults (StrictMode safety)
  const submittingRef = useRef(false);

  // Always-current state ref — safe to read in callbacks without stale closures
  const stateRef = useRef(state);
  stateRef.current = state;
  // Always-current quizData ref
  const quizDataRef = useRef(quizData);
  quizDataRef.current = quizData;

  const currentRound = roundResultsRef.current.length + 1;

  // ── Derived values ──
  const currentQuestion = useMemo(() => {
    if (!quizData) return null;
    if (quizData.type === "writing") {
      return quizData.questions[state.writingQuestionIndex] ?? null;
    }
    return quizData.questions[state.currentQuestionIndex] ?? null;
  }, [quizData, state.currentQuestionIndex, state.writingQuestionIndex]);

  const totalQuestions = useMemo(() => {
    if (!quizData) return 0;
    return quizData.questions.length;
  }, [quizData]);

  const overallProgress = useMemo(() => {
    if (totalQuestions === 0) return 0;
    if (state.step === "summary") return 100;
    if (quizData?.type === "writing") {
      return Math.round((state.writingQuestionIndex / totalQuestions) * 100);
    }
    const answered = state.questionResults.length;
    return Math.round((answered / totalQuestions) * 100);
  }, [totalQuestions, state.step, state.questionResults.length, state.writingQuestionIndex, quizData]);

  const finalScore = useMemo(() => {
    if (quizData?.type === "writing") {
      if (state.writingScores.length === 0) return 0;
      const total = state.writingScores.reduce((sum, s) => sum + s, 0);
      return Math.round(total / state.writingScores.length);
    }
    if (state.questionResults.length === 0) return 0;
    const correct = state.questionResults.filter((r) => r.correct).length;
    return Math.round((correct / state.questionResults.length) * 100);
  }, [quizData, state.questionResults, state.writingScores]);

  const duration = useMemo(() => {
    if (roundStartTimeRef.current === 0) return 0;
    return Math.round((Date.now() - roundStartTimeRef.current) / 1000);
  }, [state.step]);

  // ── Internal: load a single round ──
  const loadRound = useCallback(async (kanjiId: string) => {
    setLoading(true);
    setError(null);
    setState(INITIAL_STATE);
    setQuizData(null);
    roundStartTimeRef.current = Date.now();

    try {
      const data = await getKanjiQuiz(kanjiId);
      setQuizData(data);
      setState((s) => ({
        ...s,
        step: "exercise" as KanjiQuizStep,
        writingPhase: data.type === "writing" ? "demo" : s.writingPhase,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar el quiz";
      const is403 = msg.includes("403") || msg.toLowerCase().includes("puntos");
      setIsPointsError(is403);
      setError(
        is403 ? "No se tienen los puntos necesarios para este ejercicio" : msg,
      );
      setState((s) => ({ ...s, step: "error" as KanjiQuizStep }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Start quiz (resets full session) ──
  const startQuiz = useCallback(async (kanjiId: string) => {
    setIsPointsError(false);
    setUpdatedPoints(null);
    roundResultsRef.current = [];
    setRoundResults([]);
    kanjiIdRef.current = kanjiId;
    await loadRound(kanjiId);
  }, [loadRound]);

  // ── Submit results and chain next round (or show summary) ──
  // MUST be called OUTSIDE any setState updater — calling it inside causes double
  // invocation in React StrictMode, which corrupts roundResultsRef and triggers
  // premature summary after fewer than QUIZ_TOTAL_ROUNDS actual rounds.
  const submitResults = useCallback(async (
    quizType: KanjiQuizType,
    score: number,
  ) => {
    // Concurrent-call guard: prevents duplicate submissions if called more than once
    // (e.g., rapid double-click or StrictMode artefact)
    if (submittingRef.current) return;
    submittingRef.current = true;

    setSubmitting(true);
    setState((s) => ({ ...s, step: "submitting" as KanjiQuizStep }));

    const elapsed = Math.round((Date.now() - roundStartTimeRef.current) / 1000);

    try {
      await submitKanjiQuiz(kanjiIdRef.current, {
        type: quizType,
        score,
        duration: elapsed,
      });

      const newRoundResults: KanjiQuizRoundResult[] = [
        ...roundResultsRef.current,
        { type: quizType, score },
      ];
      roundResultsRef.current = newRoundResults;
      setRoundResults(newRoundResults);

      if (newRoundResults.length >= QUIZ_TOTAL_ROUNDS) {
        // All 4 rounds done — fetch updated points and show summary
        try {
          const user = await getCurrentUser();
          if (user && typeof user.points === "number") {
            setUpdatedPoints(user.points);
          }
        } catch {
          // Non-critical
        }
        setState((s) => ({ ...s, step: "summary" as KanjiQuizStep }));
      } else {
        // Load next round automatically
        await loadRound(kanjiIdRef.current);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al enviar resultado";
      setError(msg);
      setState((s) => ({ ...s, step: "error" as KanjiQuizStep }));
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [loadRound]);

  // ── Select option ──
  const selectOption = useCallback((optionIndex: number) => {
    setState((s) => {
      if (s.isAnswered) return s;
      return { ...s, selectedOptionIndex: optionIndex };
    });
  }, []);

  // ── Confirm answer (show feedback) ──
  const confirmAnswer = useCallback(() => {
    setState((s) => {
      if (s.selectedOptionIndex === null || s.isAnswered) return s;
      return { ...s, isAnswered: true, step: "exercise-feedback" as KanjiQuizStep };
    });
  }, []);

  // ── Next step ──
  // Uses stateRef / quizDataRef to avoid the functional-updater form, keeping
  // submitResults OUTSIDE setState so it is never double-invoked by StrictMode.
  const nextStep = useCallback(() => {
    const s = stateRef.current;
    const qd = quizDataRef.current;
    if (!qd) return;

    const question = qd.questions[s.currentQuestionIndex];
    if (!question) return;

    const isCorrect = question.options[s.selectedOptionIndex ?? -1]?.correct ?? false;

    const newResults: KanjiQuizQuestionResult[] = [
      ...s.questionResults,
      { questionIndex: s.currentQuestionIndex, correct: isCorrect },
    ];

    const nextQ = s.currentQuestionIndex + 1;
    if (nextQ < qd.questions.length) {
      setState({
        ...s,
        step: "exercise" as KanjiQuizStep,
        currentQuestionIndex: nextQ,
        selectedOptionIndex: null,
        isAnswered: false,
        questionResults: newResults,
      });
      return;
    }

    // All questions in this round done
    const correct = newResults.filter((r) => r.correct).length;
    const score = Math.round((correct / newResults.length) * 100);

    setState({ ...s, questionResults: newResults, step: "submitting" as KanjiQuizStep });
    // Submit OUTSIDE setState — submittingRef guard prevents duplicate calls
    submitResults(qd.type, score);
  }, [submitResults]);

  // ── Writing: set phase ──
  const setWritingPhase = useCallback((phase: "demo" | "practice" | "done") => {
    setState((s) => ({ ...s, writingPhase: phase }));
  }, []);

  // ── Writing: complete a single writing question ──
  // Also kept outside setState for the same StrictMode safety reason.
  const completeWritingQuestion = useCallback((score: number) => {
    const s = stateRef.current;
    const qd = quizDataRef.current;
    if (!qd || qd.type !== "writing") return;

    const newScores = [...s.writingScores, score];
    const nextIdx = s.writingQuestionIndex + 1;

    if (nextIdx < qd.questions.length) {
      const nextQuestion = qd.questions[nextIdx];
      const hasValidStrokes = isValidWritingQuestion(nextQuestion);
      setState({
        ...s,
        writingScores: newScores,
        writingQuestionIndex: nextIdx,
        writingPhase: hasValidStrokes ? "demo" : "done",
      });
      return;
    }

    // All writing questions done
    const avgScore = Math.round(
      newScores.reduce((sum, v) => sum + v, 0) / newScores.length,
    );

    setState({
      ...s,
      writingScores: newScores,
      writingPhase: "done",
      step: "submitting" as KanjiQuizStep,
    });
    // Submit OUTSIDE setState — submittingRef guard prevents duplicate calls
    submitResults(qd.type, avgScore);
  }, [submitResults]);

  // ── Reset ──
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setQuizData(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    setIsPointsError(false);
    setUpdatedPoints(null);
    roundResultsRef.current = [];
    setRoundResults([]);
    kanjiIdRef.current = "";
    roundStartTimeRef.current = 0;
    submittingRef.current = false;
  }, []);

  return {
    state,
    quizData,
    currentQuestion,
    totalQuestions,
    overallProgress,
    finalScore,
    duration,
    loading,
    error,
    submitting,
    isPointsError,
    updatedPoints,
    roundResults,
    currentRound,
    startQuiz,
    selectOption,
    confirmAnswer,
    nextStep,
    setWritingPhase,
    completeWritingQuestion,
    reset,
  };
}

