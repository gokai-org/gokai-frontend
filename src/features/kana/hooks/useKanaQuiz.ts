"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { getCurrentUser } from "@/features/auth";
import type { KanaType } from "@/features/kana/types";
import type {
  KanaQuizResponse,
  KanaQuizSessionState,
  KanaQuizStep,
  KanaQuizQuestionResult,
  KanaQuizRoundResult,
  KanaQuizType,
} from "@/features/kana/types/quiz";
import { KANA_QUIZ_TOTAL_ROUNDS } from "@/features/kana/types/quiz";
import { getKanaQuiz, submitKanaQuiz } from "@/features/kana/api/kanaQuizApi";
import {
  applyEarlyKanaOptionPool,
  isValidCanvasQuestion,
} from "@/features/kana/utils/quizParser";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";

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

type KanaQuizSubmitResponse = Record<string, unknown>;

type KanaRewardSnapshot = {
  userPoints: number | null;
  kanaPoints: number | null;
  pointsDelta: number | null;
  kanaPointsDelta: number | null;
};

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
  roundResults: KanaQuizRoundResult[];
  currentRound: number;

  startQuiz: (
    kanaId: string,
    context?: { kanaType?: KanaType; label?: string },
  ) => Promise<void>;
  selectOption: (optionIndex: number) => void;
  confirmAnswer: () => void;
  nextStep: () => void;
  setCanvasPhase: (phase: "demo" | "practice" | "done") => void;
  completeCanvasQuestion: (score: number) => void;
  reset: () => void;
}

function buildFailedRoundResult(
  type: KanaQuizType,
  score: number,
  startedAt: number,
): KanaQuizRoundResult {
  return {
    type,
    score,
    duration:
      startedAt > 0 ? Math.round((Date.now() - startedAt) / 1000) : 0,
  };
}

function getQuestionScoreAverage(results: KanaQuizQuestionResult[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, result) => sum + result.score, 0);
  return Math.round(total / results.length);
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractKanaRewardSnapshot(
  payload: KanaQuizSubmitResponse | null | undefined,
): KanaRewardSnapshot {
  if (!payload) {
    return {
      userPoints: null,
      kanaPoints: null,
      pointsDelta: null,
      kanaPointsDelta: null,
    };
  }

  const nestedUser =
    payload.user && typeof payload.user === "object"
      ? (payload.user as Record<string, unknown>)
      : null;

  return {
    userPoints:
      readNumber(payload.updatedPoints) ??
      readNumber(payload.userPoints) ??
      readNumber(payload.points) ??
      readNumber(nestedUser?.points),
    kanaPoints:
      readNumber(payload.updatedKanaPoints) ??
      readNumber(payload.kanaPoints) ??
      readNumber(payload.userKanaPoints) ??
      readNumber(nestedUser?.kanaPoints),
    pointsDelta:
      readNumber(payload.pointsDelta) ?? readNumber(payload.earnedPoints),
    kanaPointsDelta:
      readNumber(payload.kanaPointsDelta) ?? readNumber(payload.earnedKanaPoints),
  };
}

function getInitialCanvasPhase(
  quizData: KanaQuizResponse | null,
): "demo" | "practice" | "done" {
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
  const [roundResults, setRoundResults] = useState<KanaQuizRoundResult[]>([]);

  const roundResultsRef = useRef<KanaQuizRoundResult[]>([]);
  const roundStartTimeRef = useRef<number>(0);
  const kanaIdRef = useRef<string>("");
  const kanaTypeRef = useRef<KanaType | null>(null);
  const kanaLabelRef = useRef<string>("");
  const latestSubmitRewardRef = useRef<KanaRewardSnapshot | null>(null);
  const startingPointsRef = useRef<number | null>(null);
  const startingKanaPointsRef = useRef<number | null>(null);
  const submittingRef = useRef(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const quizDataRef = useRef(quizData);
  quizDataRef.current = quizData;

  const currentRound = Math.min(
    KANA_QUIZ_TOTAL_ROUNDS,
    roundResultsRef.current.length + 1,
  );

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
      (state.questionResults.length / totalQuestions) * 100,
    );
  }, [totalQuestions, state.step, state.questionResults.length]);

  const finalScore = useMemo(() => {
    if (roundResults.length >= KANA_QUIZ_TOTAL_ROUNDS) {
      return Math.round(
        roundResults.reduce((sum, r) => sum + r.score, 0) / roundResults.length,
      );
    }
    return getQuestionScoreAverage(state.questionResults);
  }, [roundResults, state.questionResults]);

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
      const response = applyEarlyKanaOptionPool(
        await getKanaQuiz(kanaIdRef.current),
        {
          kanaType: kanaTypeRef.current,
          currentLabel: kanaLabelRef.current,
        },
      );

      if (response.questions.length === 0) {
        throw new Error("El backend devolvio un quiz de kana vacio");
      }

      setQuizData(response);
      setState({
        ...INITIAL_STATE,
        step: "exercise",
        canvasPhase: getInitialCanvasPhase(response),
      });
      roundStartTimeRef.current = Date.now();
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

  // ── Start quiz ──
  const startQuiz = useCallback(
    async (
      kanaId: string,
      context?: { kanaType?: KanaType; label?: string },
    ) => {
      setState(INITIAL_STATE);
      setQuizData(null);
      setError(null);
      setPointsDelta(0);
      roundResultsRef.current = [];
      setRoundResults([]);
      kanaIdRef.current = kanaId;
      kanaTypeRef.current = context?.kanaType ?? null;
      kanaLabelRef.current = context?.label?.trim() ?? "";
      latestSubmitRewardRef.current = null;
      submittingRef.current = false;

      try {
        const user = await getCurrentUser().catch(() => null);
        startingPointsRef.current =
          user && typeof user.points === "number" ? user.points : null;
        startingKanaPointsRef.current =
          user && typeof user.kanaPoints === "number" ? user.kanaPoints : null;
      } catch {
        startingPointsRef.current = null;
        startingKanaPointsRef.current = null;
      }

      await loadNextRound();
    },
    [loadNextRound],
  );

  // ── Finalize quiz (all rounds done) ──
  const finalizeQuiz = useCallback(
    async (_results: KanaQuizRoundResult[]) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setState((s) => ({ ...s, step: "submitting" as KanaQuizStep }));

      try {
        // Recover starting kana points if they weren't captured during startQuiz.
        if (startingKanaPointsRef.current === null) {
          try {
            const user = await getCurrentUser();
            if (user && typeof user.kanaPoints === "number") {
              startingKanaPointsRef.current = user.kanaPoints;
            }
          } catch {
            /* Non-critical */
          }
        }

        // Kana quizzes award kana_points (not regular points).
        // Fetch current user to get the latest kanaPoints.
        let currentKanaPoints: number | null = null;

        try {
          const user = await getCurrentUser();
          if (user && typeof user.kanaPoints === "number") {
            currentKanaPoints = user.kanaPoints;
          }
        } catch {
          /* Non-critical */
        }

        // If kanaPoints haven't changed yet, retry once after a short delay.
        if (
          currentKanaPoints === null ||
          (startingKanaPointsRef.current !== null &&
            currentKanaPoints <= startingKanaPointsRef.current)
        ) {
          await new Promise<void>((resolve) => setTimeout(resolve, 1200));
          try {
            const user = await getCurrentUser();
            if (user && typeof user.kanaPoints === "number") {
              currentKanaPoints = user.kanaPoints;
            }
          } catch {
            /* Non-critical */
          }
        }

        // Third attempt with a longer delay if still no change detected.
        if (
          currentKanaPoints === null ||
          (startingKanaPointsRef.current !== null &&
            currentKanaPoints <= startingKanaPointsRef.current)
        ) {
          await new Promise<void>((resolve) => setTimeout(resolve, 1500));
          try {
            const user = await getCurrentUser();
            if (user && typeof user.kanaPoints === "number") {
              currentKanaPoints = user.kanaPoints;
            }
          } catch {
            /* Non-critical */
          }
        }

        const kanaPointsDelta =
          currentKanaPoints !== null && startingKanaPointsRef.current !== null
            ? Math.max(0, currentKanaPoints - startingKanaPointsRef.current)
            : 0;

        const completedPerfectQuiz =
          _results.length >= KANA_QUIZ_TOTAL_ROUNDS &&
          _results.every((result) => result.score === 100);

        setPointsDelta(kanaPointsDelta);
        dispatchMasteryProgressSync({ kanaPoints: currentKanaPoints });
        setState((s) => ({
          ...s,
          step: completedPerfectQuiz
            ? ("celebration" as KanaQuizStep)
            : ("summary" as KanaQuizStep),
        }));
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al obtener puntos";
        setError(extractKanaQuizErrorMessage(msg));
        setState((s) => ({ ...s, step: "summary" as KanaQuizStep }));
      } finally {
        setSubmitting(false);
        submittingRef.current = false;
      }
    },
    [],
  );

  // ── Complete a single round (submit + advance) ──
  const completeRound = useCallback(
    async (quizType: KanaQuizType, score: number) => {
      const elapsed = Math.round(
        (Date.now() - roundStartTimeRef.current) / 1000,
      );
      const newRoundResults: KanaQuizRoundResult[] = [
        ...roundResultsRef.current,
        { type: quizType, score, duration: elapsed },
      ];

      roundResultsRef.current = newRoundResults;
      setRoundResults(newRoundResults);

      // Submit this round to the backend
      try {
        const submitResult = await submitKanaQuiz(kanaIdRef.current, {
          type: quizType,
          score,
          duration: elapsed,
        });
        latestSubmitRewardRef.current = extractKanaRewardSnapshot(submitResult);
      } catch (err) {
        console.error("[KANA QUIZ] Failed to submit round:", err);
      }

      // Check if all rounds are done
      if (newRoundResults.length >= KANA_QUIZ_TOTAL_ROUNDS) {
        await finalizeQuiz(newRoundResults);
        return;
      }

      // Load next round from backend
      await loadNextRound();
    },
    [finalizeQuiz, loadNextRound],
  );

  const failAttempt = useCallback(
    (quizType: KanaQuizType, score: number, nextState: KanaQuizSessionState) => {
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

    if (!isCorrect) {
      const failedScore = getQuestionScoreAverage(newResults);
      failAttempt(qd.submitType, failedScore, {
        ...s,
        questionResults: newResults,
        isAnswered: true,
      });
      return;
    }

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

    // All questions in this round done
    const score = getQuestionScoreAverage(newResults);

    setState({
      ...s,
      questionResults: newResults,
      step: "loading" as KanaQuizStep,
    });
    void completeRound(qd.submitType, score);
  }, [completeRound]);

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
      const currentCanvasQuestion =
        qd?.questions[s.currentQuestionIndex] ?? null;
      if (!qd || currentCanvasQuestion?.type !== "canvas") return;

      const newScores = [...s.canvasScores, score];
      const newResults: KanaQuizQuestionResult[] = [
        ...s.questionResults,
        {
          questionIndex: s.currentQuestionIndex,
          correct: score === 100,
          score,
        },
      ];

      if (score < 100) {
        failAttempt(qd.submitType, score, {
          ...s,
          questionResults: newResults,
          canvasScores: newScores,
          canvasPhase: "done",
        });
        return;
      }

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

      const completionScore =
        newScores.length > 0
          ? Math.round(
              newScores.reduce((sum, currentScore) => sum + currentScore, 0) /
                newScores.length,
            )
          : 0;

      setState({
        ...s,
        questionResults: newResults,
        canvasScores: newScores,
        canvasPhase: "done",
        step: "loading" as KanaQuizStep,
      });
      void completeRound(qd.submitType, completionScore);
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
    setPointsDelta(0);
    roundResultsRef.current = [];
    setRoundResults([]);
    kanaIdRef.current = "";
    kanaTypeRef.current = null;
    kanaLabelRef.current = "";
    latestSubmitRewardRef.current = null;
    startingPointsRef.current = null;
    startingKanaPointsRef.current = null;
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
    pointsDelta,
    roundResults,
    currentRound,
    startQuiz,
    selectOption,
    confirmAnswer,
    nextStep,
    setCanvasPhase,
    completeCanvasQuestion,
    reset,
  };
}
