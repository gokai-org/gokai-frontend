"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { getCurrentUser } from "@/features/auth";
import type {
  KanaQuizResponse,
  KanaQuizSessionState,
  KanaQuizStep,
  KanaQuizQuestionResult,
} from "@/features/kana/types/quiz";
import { getKanaQuiz, submitKanaQuiz } from "@/features/kana/api/kanaQuizApi";
import { isValidCanvasQuestion } from "@/features/kana/utils/quizParser";

function extractKanaQuizErrorMessage(message: string): string {
  const jsonStart = message.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(message.slice(jsonStart)) as {
        message?: string;
        points?: number;
        userPoints?: number;
      };

      if (typeof parsed.message === "string" && parsed.message.length > 0) {
        if (
          typeof parsed.points === "number" &&
          typeof parsed.userPoints === "number"
        ) {
          return `${parsed.message} (${parsed.userPoints}/${parsed.points})`;
        }

        return parsed.message;
      }
    } catch {
      // Fall through to generic cleanup below.
    }
  }

  return message.replace(/^HTTP\s+\d+:\s*/i, "").trim() || message;
}

const INITIAL_STATE: KanaQuizSessionState = {
  step: "loading",
  currentQuestionIndex: 0,
  selectedOptionIndex: null,
  isAnswered: false,
  questionResults: [],
  canvasPhase: "demo",
  canvasScores: [],
};

export interface UseKanaQuizReturn {
  state: KanaQuizSessionState;
  quizData: KanaQuizResponse | null;
  currentQuestion: KanaQuizResponse["questions"][number] | null;
  totalQuestions: number;
  overallProgress: number;
  finalScore: number;
  duration: number;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  pointsDelta: number;

  startQuiz: (kanaId: string) => Promise<void>;
  selectOption: (optionIndex: number) => void;
  confirmAnswer: () => void;
  nextStep: () => void;
  setCanvasPhase: (phase: "demo" | "practice" | "done") => void;
  completeCanvasQuestion: (score: number) => void;
  reset: () => void;
}

function getCompletedQuestionCount(state: KanaQuizSessionState): number {
  return state.questionResults.length;
}

function getQuestionScoreAverage(results: KanaQuizQuestionResult[]): number {
  if (results.length === 0) return 0;

  const total = results.reduce((sum, result) => sum + result.score, 0);
  return Math.round(total / results.length);
}

function getInitialCanvasPhase(quizData: KanaQuizResponse | null): "demo" | "practice" | "done" {
  const firstQuestion = quizData?.questions[0] ?? null;
  if (firstQuestion?.type === "canvas") {
    return isValidCanvasQuestion(firstQuestion) ? "demo" : "done";
  }

  return "demo";
}

export function useKanaQuiz(): UseKanaQuizReturn {
  const [state, setState] = useState<KanaQuizSessionState>(INITIAL_STATE);
  const [quizData, setQuizData] = useState<KanaQuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pointsDelta, setPointsDelta] = useState(0);

  const startTimeRef = useRef<number>(0);
  const kanaIdRef = useRef<string>("");
  const startingPointsRef = useRef<number | null>(null);
  const startingKanaPointsRef = useRef<number | null>(null);
  const submittingRef = useRef(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const quizDataRef = useRef(quizData);
  quizDataRef.current = quizData;

  // ── Derived values ──
  const currentQuestion = useMemo(() => {
    if (!quizData) return null;
    return quizData.questions[state.currentQuestionIndex] ?? null;
  }, [quizData, state.currentQuestionIndex]);

  const totalQuestions = useMemo(
    () => (quizData ? quizData.questions.length : 0),
    [quizData],
  );

  const overallProgress = useMemo(() => {
    if (totalQuestions === 0) return 0;
    if (state.step === "summary" || state.step === "celebration") return 100;
    return Math.round(
      (getCompletedQuestionCount(state) / totalQuestions) * 100,
    );
  }, [totalQuestions, state]);

  const finalScore = useMemo(() => {
    return getQuestionScoreAverage(state.questionResults);
  }, [state.questionResults]);

  const duration = useMemo(() => {
    if (startTimeRef.current === 0) return 0;
    return Math.round((Date.now() - startTimeRef.current) / 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step]);

  // ── Start quiz ──
  const startQuiz = useCallback(async (kanaId: string) => {
    setLoading(true);
    setError(null);
    setState(INITIAL_STATE);
    setQuizData(null);
    setPointsDelta(0);
    kanaIdRef.current = kanaId;
    submittingRef.current = false;

    try {
      const [response, user] = await Promise.all([
        getKanaQuiz(kanaId),
        getCurrentUser().catch(() => null),
      ]);
      if (response.questions.length === 0) {
        throw new Error("El backend devolvio un quiz de kana vacio");
      }

      startingPointsRef.current =
        user && typeof user.points === "number" ? user.points : null;
      startingKanaPointsRef.current =
        user && typeof user.kanaPoints === "number" ? user.kanaPoints : null;
      setQuizData(response);
      startTimeRef.current = Date.now();
      setState({
        ...INITIAL_STATE,
        step: "exercise",
        canvasPhase: getInitialCanvasPhase(response),
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar el quiz";
      const friendlyMsg = extractKanaQuizErrorMessage(msg);
      setError(friendlyMsg);
      setState((s) => ({ ...s, step: "error" as KanaQuizStep }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Finalize and submit ──
  const finalizeQuiz = useCallback(
    async (score: number, results: KanaQuizQuestionResult[]) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setState((s) => ({ ...s, step: "submitting" as KanaQuizStep }));

      const elapsed = Math.round(
        (Date.now() - startTimeRef.current) / 1000,
      );

      if (score !== 100) {
        setPointsDelta(0);
        setSubmitting(false);
        submittingRef.current = false;
        setState((s) => ({ ...s, step: "summary" as KanaQuizStep }));
        return;
      }

      try {
        const currentQuizData = quizDataRef.current;
        if (!currentQuizData) {
          throw new Error("No se pudo recuperar el estado del quiz de kana");
        }

        const durationPerExercise =
          currentQuizData.questions.length > 0
            ? Math.max(1, Math.round(elapsed / currentQuizData.questions.length))
            : elapsed;

        let lastResponse: Record<string, unknown> | null = null;

        for (let index = 0; index < currentQuizData.questions.length; index += 1) {
          const result = results[index];
          const question = currentQuizData.questions[index];

          if (!result || result.score < 100) {
            break;
          }

          lastResponse = await submitKanaQuiz(kanaIdRef.current, {
            type: question.type,
            score: result.score,
            duration: durationPerExercise,
          });
        }

        let nextUserPoints: number | null =
          lastResponse && typeof lastResponse.points === "number"
            ? lastResponse.points
            : null;
        let nextKanaPoints: number | null =
          lastResponse && typeof lastResponse.userPoints === "number"
            ? lastResponse.userPoints
            : null;

        if (nextUserPoints === null || nextKanaPoints === null) {
          try {
            const user = await getCurrentUser();
            if (user) {
              if (typeof user.points === "number") {
                nextUserPoints = user.points;
              }
              if (typeof user.kanaPoints === "number") {
                nextKanaPoints = user.kanaPoints;
              }
            }
          } catch {
            // Non-critical
          }
        }

        if (
          nextUserPoints === null ||
          nextKanaPoints === null ||
          (startingPointsRef.current !== null && nextUserPoints <= startingPointsRef.current) ||
          (startingKanaPointsRef.current !== null && nextKanaPoints <= startingKanaPointsRef.current)
        ) {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, 800);
          });

          try {
            const user = await getCurrentUser();
            if (user) {
              if (typeof user.points === "number") {
                nextUserPoints = user.points;
              }
              if (typeof user.kanaPoints === "number") {
                nextKanaPoints = user.kanaPoints;
              }
            }
          } catch {
            // Non-critical
          }
        }

        const userPointsDelta =
          nextUserPoints !== null && startingPointsRef.current !== null
            ? Math.max(0, nextUserPoints - startingPointsRef.current)
            : 0;
        const kanaPointsDelta =
          nextKanaPoints !== null && startingKanaPointsRef.current !== null
            ? Math.max(0, nextKanaPoints - startingKanaPointsRef.current)
            : 0;
        const nextPointsDelta = Math.max(userPointsDelta, kanaPointsDelta);

        setPointsDelta(nextPointsDelta);

        if (score === 100) {
          setState((s) => ({
            ...s,
            step: "celebration" as KanaQuizStep,
          }));
        } else {
          setState((s) => ({ ...s, step: "summary" as KanaQuizStep }));
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Error al enviar resultado";
        setError(extractKanaQuizErrorMessage(msg));
        setState((s) => ({ ...s, step: "summary" as KanaQuizStep }));
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
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
        step: "exercise-feedback" as KanaQuizStep,
      };
    });
  }, []);

  // ── Next step (after feedback) ──
  const nextStep = useCallback(() => {
    const s = stateRef.current;
    const qd = quizDataRef.current;
    if (!qd) return;

    const question = qd.questions[s.currentQuestionIndex];
    if (!question) return;

    const isCorrect =
      question.options[s.selectedOptionIndex ?? -1]?.correct ?? false;

    const newResults: KanaQuizQuestionResult[] = [
      ...s.questionResults,
      {
        questionIndex: s.currentQuestionIndex,
        correct: isCorrect,
        score: isCorrect ? 100 : 0,
      },
    ];

    const nextQ = s.currentQuestionIndex + 1;
    if (nextQ < qd.questions.length) {
      const nextQuestion = qd.questions[nextQ] ?? null;
      setState({
        ...s,
        step: "exercise" as KanaQuizStep,
        currentQuestionIndex: nextQ,
        selectedOptionIndex: null,
        isAnswered: false,
        questionResults: newResults,
        canvasPhase:
          nextQuestion?.type === "canvas" && isValidCanvasQuestion(nextQuestion)
            ? "demo"
            : nextQuestion?.type === "canvas"
              ? "done"
              : "demo",
      });
      return;
    }

    const score = getQuestionScoreAverage(newResults);

    setState({
      ...s,
      questionResults: newResults,
      step: "loading" as KanaQuizStep,
    });
    void finalizeQuiz(score, newResults);
  }, [finalizeQuiz]);

  // ── Canvas: set phase ──
  const setCanvasPhase = useCallback(
    (phase: "demo" | "practice" | "done") => {
      setState((s) => ({ ...s, canvasPhase: phase }));
    },
    [],
  );

  // ── Canvas: complete a single question ──
  const completeCanvasQuestion = useCallback(
    (score: number) => {
      const s = stateRef.current;
      const qd = quizDataRef.current;
      const currentCanvasQuestion = qd?.questions[s.currentQuestionIndex] ?? null;
      if (!qd || currentCanvasQuestion?.type !== "canvas") return;

      const newScores = [...s.canvasScores, score];
      const newResults: KanaQuizQuestionResult[] = [
        ...s.questionResults,
        {
          questionIndex: s.currentQuestionIndex,
          correct: score >= 70,
          score,
        },
      ];
      const nextIdx = s.currentQuestionIndex + 1;

      if (nextIdx < qd.questions.length) {
        const nextQuestion = qd.questions[nextIdx];
        const hasValidStrokes = isValidCanvasQuestion(nextQuestion);
        setState({
          ...s,
          questionResults: newResults,
          canvasScores: newScores,
          currentQuestionIndex: nextIdx,
          selectedOptionIndex: null,
          isAnswered: false,
          step: "exercise",
          canvasPhase:
            nextQuestion.type === "canvas"
              ? hasValidStrokes
                ? "demo"
                : "done"
              : "demo",
        });
        return;
      }

      const completionScore = getQuestionScoreAverage(newResults);

      setState({
        ...s,
        questionResults: newResults,
        canvasScores: newScores,
        canvasPhase: "done",
        step: "loading" as KanaQuizStep,
      });
      void finalizeQuiz(completionScore, newResults);
    },
    [finalizeQuiz],
  );

  // ── Reset ──
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setQuizData(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    setPointsDelta(0);
    kanaIdRef.current = "";
    startingPointsRef.current = null;
    startingKanaPointsRef.current = null;
    startTimeRef.current = 0;
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
    pointsDelta,
    startQuiz,
    selectOption,
    confirmAnswer,
    nextStep,
    setCanvasPhase,
    completeCanvasQuestion,
    reset,
  };
}
