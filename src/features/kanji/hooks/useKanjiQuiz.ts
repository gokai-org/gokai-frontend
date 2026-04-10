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
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";

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
  pointsDelta: number;
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

function buildFailedRoundResult(
  type: KanjiQuizType,
  score: number,
  startedAt: number,
): KanjiQuizRoundResult {
  return {
    type,
    score,
    duration:
      startedAt > 0 ? Math.round((Date.now() - startedAt) / 1000) : 0,
  };
}

export function useKanjiQuiz(): UseKanjiQuizReturn {
  const [state, setState] = useState<KanjiQuizSessionState>(INITIAL_STATE);
  const [quizData, setQuizData] = useState<KanjiQuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPointsError, setIsPointsError] = useState(false);
  const [updatedPoints, setUpdatedPoints] = useState<number | null>(null);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [roundResults, setRoundResults] = useState<KanjiQuizRoundResult[]>([]);

  const roundResultsRef = useRef<KanjiQuizRoundResult[]>([]);
  const roundStartTimeRef = useRef<number>(0);
  const kanjiIdRef = useRef<string>("");
  const startingPointsRef = useRef<number | null>(null);
  const submittingRef = useRef(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const quizDataRef = useRef(quizData);
  quizDataRef.current = quizData;

  const currentRound = Math.min(
    QUIZ_TOTAL_ROUNDS,
    roundResultsRef.current.length + 1,
  );

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
    if (state.step === "summary" || state.step === "celebration") return 100;
    if (quizData?.type === "writing") {
      return Math.round((state.writingQuestionIndex / totalQuestions) * 100);
    }
    const answered = state.questionResults.length;
    return Math.round((answered / totalQuestions) * 100);
  }, [
    totalQuestions,
    state.step,
    state.questionResults.length,
    state.writingQuestionIndex,
    quizData,
  ]);

  const finalScore = useMemo(() => {
    if (roundResults.length >= QUIZ_TOTAL_ROUNDS) {
      return Math.round(
        roundResults.reduce((sum, result) => sum + result.score, 0) /
          roundResults.length,
      );
    }
    if (quizData?.type === "writing") {
      if (state.writingScores.length === 0) return 0;
      const total = state.writingScores.reduce((sum, s) => sum + s, 0);
      return Math.round(total / state.writingScores.length);
    }
    if (state.questionResults.length === 0) return 0;
    const correct = state.questionResults.filter((r) => r.correct).length;
    return Math.round((correct / state.questionResults.length) * 100);
  }, [quizData, roundResults, state.questionResults, state.writingScores]);

  const duration = useMemo(() => {
    if (roundStartTimeRef.current === 0) return 0;
    return Math.round((Date.now() - roundStartTimeRef.current) / 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  // ── Load next round from backend ──
  const loadNextRound = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getKanjiQuiz(kanjiIdRef.current);

      if (response.questions.length === 0) {
        throw new Error("El backend devolvio un quiz de kanji vacio");
      }

      setQuizData(response);
      setState({
        ...INITIAL_STATE,
        step: "exercise",
        writingPhase: response.type === "writing" ? "demo" : "demo",
      });
      roundStartTimeRef.current = Date.now();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar el quiz";
      const is403 =
        msg.includes("403") || msg.toLowerCase().includes("puntos");
      setIsPointsError(is403);
      setError(
        is403
          ? "No se tienen los puntos necesarios para este ejercicio"
          : msg,
      );
      setState((s) => ({ ...s, step: "error" as KanjiQuizStep }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Start quiz (resets full session) ──
  const startQuiz = useCallback(
    async (kanjiId: string) => {
      setState(INITIAL_STATE);
      setQuizData(null);
      setError(null);
      setIsPointsError(false);
      setUpdatedPoints(null);
      setPointsDelta(0);
      roundResultsRef.current = [];
      setRoundResults([]);
      kanjiIdRef.current = kanjiId;
      submittingRef.current = false;

      try {
        const user = await getCurrentUser().catch(() => null);
        startingPointsRef.current =
          typeof user?.points === "number" ? user.points : null;
      } catch {
        startingPointsRef.current = null;
      }

      await loadNextRound();
    },
    [loadNextRound],
  );

  // ── Finalize quiz (all rounds done) ──
  const finalizeQuiz = useCallback(async (_results: KanjiQuizRoundResult[]) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    setSubmitting(true);
    setState((s) => ({ ...s, step: "submitting" as KanjiQuizStep }));

    try {
      // Points are awarded per-round by the backend (30 pts on first correct writing).
      // Always detect the actual point change instead of gating on overall average score.
      if (startingPointsRef.current === null) {
        try {
          const user = await getCurrentUser();
          if (user && typeof user.points === "number") {
            startingPointsRef.current = user.points;
          }
        } catch {
          /* Non-critical */
        }
      }

      let nextPoints: number | null = null;

      try {
        const user = await getCurrentUser();
        if (user && typeof user.points === "number") {
          nextPoints = user.points;
          setUpdatedPoints(user.points);
        }
      } catch {
        /* Non-critical */
      }

      if (
        nextPoints === null ||
        (startingPointsRef.current !== null &&
          nextPoints <= startingPointsRef.current)
      ) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 800);
        });
        try {
          const user = await getCurrentUser();
          if (user && typeof user.points === "number") {
            nextPoints = user.points;
            setUpdatedPoints(user.points);
          }
        } catch {
          /* Non-critical */
        }
      }

      // Third attempt with a longer delay if still no change detected.
      if (
        nextPoints === null ||
        (startingPointsRef.current !== null &&
          nextPoints <= startingPointsRef.current)
      ) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 1500);
        });
        try {
          const user = await getCurrentUser();
          if (user && typeof user.points === "number") {
            nextPoints = user.points;
            setUpdatedPoints(user.points);
          }
        } catch {
          /* Non-critical */
        }
      }

      const nextPointsDelta =
        nextPoints !== null && startingPointsRef.current !== null
          ? Math.max(0, nextPoints - startingPointsRef.current)
          : 0;

      const completedPerfectQuiz =
        _results.length >= QUIZ_TOTAL_ROUNDS &&
        _results.every((result) => result.score === 100);

      setPointsDelta(nextPointsDelta);
      dispatchMasteryProgressSync({ points: nextPoints });
      setState((s) => ({
        ...s,
        step: completedPerfectQuiz
          ? ("celebration" as KanjiQuizStep)
          : ("summary" as KanjiQuizStep),
      }));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al enviar resultado";
      setError(msg);
      setState((s) => ({ ...s, step: "error" as KanjiQuizStep }));
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, []);

  // ── Complete a single round (submit + advance) ──
  const completeRound = useCallback(
    async (quizType: KanjiQuizType, score: number) => {
      const elapsed = Math.round(
        (Date.now() - roundStartTimeRef.current) / 1000,
      );
      const newRoundResults: KanjiQuizRoundResult[] = [
        ...roundResultsRef.current,
        { type: quizType, score, duration: elapsed },
      ];

      roundResultsRef.current = newRoundResults;
      setRoundResults(newRoundResults);

      // Submit this round to the backend
      try {
        await submitKanjiQuiz(kanjiIdRef.current, {
          type: quizType,
          score,
          duration: elapsed,
        });
      } catch (err) {
        console.error("[KANJI QUIZ] Failed to submit round:", err);
      }

      // Check if all rounds are done
      if (newRoundResults.length >= QUIZ_TOTAL_ROUNDS) {
        await finalizeQuiz(newRoundResults);
        return;
      }

      // Load next round from backend
      await loadNextRound();
    },
    [finalizeQuiz, loadNextRound],
  );

  const failAttempt = useCallback(
    (
      quizType: KanjiQuizType,
      score: number,
      nextState: KanjiQuizSessionState,
    ) => {
      const failedRound = buildFailedRoundResult(
        quizType,
        score,
        roundStartTimeRef.current,
      );
      const failedResults = [...roundResultsRef.current, failedRound];

      roundResultsRef.current = failedResults;
      setRoundResults(failedResults);
      setError(null);
      setState({
        ...nextState,
        step: "summary",
      });
    },
    [],
  );

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
      return {
        ...s,
        isAnswered: true,
        step: "exercise-feedback" as KanjiQuizStep,
      };
    });
  }, []);

  // ── Next step ──
  const nextStep = useCallback(() => {
    const s = stateRef.current;
    const qd = quizDataRef.current;
    if (!qd) return;

    const question = qd.questions[s.currentQuestionIndex];
    if (!question) return;

    const isCorrect =
      question.options[s.selectedOptionIndex ?? -1]?.correct ?? false;

    const newResults: KanjiQuizQuestionResult[] = [
      ...s.questionResults,
      { questionIndex: s.currentQuestionIndex, correct: isCorrect },
    ];

    if (!isCorrect) {
      const correct = newResults.filter((result) => result.correct).length;
      const failedScore = Math.round((correct / newResults.length) * 100);
      failAttempt(qd.type, failedScore, {
        ...s,
        questionResults: newResults,
        isAnswered: true,
      });
      return;
    }

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

    setState({
      ...s,
      questionResults: newResults,
      step: "loading" as KanjiQuizStep,
    });
    void completeRound(qd.type, score);
  }, [completeRound, failAttempt]);

  // ── Writing: set phase ──
  const setWritingPhase = useCallback((phase: "demo" | "practice" | "done") => {
    setState((s) => ({ ...s, writingPhase: phase }));
  }, []);

  // ── Writing: complete a single writing question ──
  const completeWritingQuestion = useCallback(
    (score: number) => {
      const s = stateRef.current;
      const qd = quizDataRef.current;
      if (!qd || qd.type !== "writing") return;

      const newScores = [...s.writingScores, score];

      if (score < 100) {
        const failedScore =
          newScores.length > 0
            ? Math.round(
                newScores.reduce(
                  (sum, currentScore) => sum + currentScore,
                  0,
                ) / newScores.length,
              )
            : 0;

        failAttempt(qd.type, failedScore, {
          ...s,
          writingScores: newScores,
          writingPhase: "done",
        });
        return;
      }

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

      const completionScore =
        newScores.length > 0
          ? Math.round(
              newScores.reduce((sum, currentScore) => sum + currentScore, 0) /
                newScores.length,
            )
          : 0;

      setState({
        ...s,
        writingScores: newScores,
        writingPhase: "done",
        step: "loading" as KanjiQuizStep,
      });
      void completeRound(qd.type, completionScore);
    },
    [completeRound, failAttempt],
  );

  // ── Reset ──
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setQuizData(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    setIsPointsError(false);
    setUpdatedPoints(null);
    setPointsDelta(0);
    roundResultsRef.current = [];
    setRoundResults([]);
    kanjiIdRef.current = "";
    startingPointsRef.current = null;
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
    pointsDelta,
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
