"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  getKanaExam,
  submitKanaExam,
} from "@/features/kana/api/kanaApi";
import type {
  KanaExamResponse,
  KanaExamResult,
  KanaType,
} from "@/features/kana/types";
import type {
  KanaQuizQuestionResult,
  KanaQuizStep,
} from "@/features/kana/types/quiz";
import { isValidCanvasQuestion } from "@/features/kana/utils/quizParser";

type KanaExamSessionState = {
  step: KanaQuizStep;
  currentQuestionIndex: number;
  selectedOptionIndex: number | null;
  isAnswered: boolean;
  questionResults: KanaQuizQuestionResult[];
  canvasPhase: "demo" | "practice" | "done";
};

const INITIAL_STATE: KanaExamSessionState = {
  step: "loading",
  currentQuestionIndex: 0,
  selectedOptionIndex: null,
  isAnswered: false,
  questionResults: [],
  canvasPhase: "demo",
};

function extractErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "No se pudo completar la evaluación";
  }

  return error.message.replace(/^HTTP\s+\d+:\s*/i, "").trim() || error.message;
}

function getInitialCanvasPhase(examData: KanaExamResponse | null) {
  const firstQuestion = examData?.questions[0] ?? null;
  if (firstQuestion?.type === "canvas") {
    return isValidCanvasQuestion(firstQuestion) ? "demo" : "done";
  }

  return "demo";
}

function getQuestionScoreAverage(results: KanaQuizQuestionResult[]) {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, result) => sum + result.score, 0);
  return Math.round(total / results.length);
}

type PendingSubmission = {
  kanaType: KanaType;
  score: number;
  duration: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
};

export interface UseKanaExamReturn {
  state: KanaExamSessionState;
  examData: KanaExamResponse | null;
  currentQuestion: KanaExamResponse["questions"][number] | null;
  totalQuestions: number;
  overallProgress: number;
  finalScore: number;
  duration: number;
  loading: boolean;
  error: string | null;
  submitError: string | null;
  summary: KanaExamResult | null;
  kanaType: KanaType | null;
  startExam: (kanaType: KanaType) => Promise<void>;
  retry: () => Promise<void>;
  selectOption: (optionIndex: number) => void;
  confirmAnswer: () => void;
  nextStep: () => void;
  setCanvasPhase: (phase: "demo" | "practice" | "done") => void;
  completeCanvasQuestion: (score: number) => void;
  reset: () => void;
}

export function useKanaExam(): UseKanaExamReturn {
  const [state, setState] = useState<KanaExamSessionState>(INITIAL_STATE);
  const [examData, setExamData] = useState<KanaExamResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [summary, setSummary] = useState<KanaExamResult | null>(null);
  const [kanaType, setKanaType] = useState<KanaType | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;
  const examDataRef = useRef(examData);
  examDataRef.current = examData;
  const kanaTypeRef = useRef<KanaType | null>(null);
  const startedAtRef = useRef(0);
  const errorStageRef = useRef<"load" | "submit" | null>(null);
  const pendingSubmissionRef = useRef<PendingSubmission | null>(null);
  const activeLoadKanaTypeRef = useRef<KanaType | null>(null);

  const currentQuestion = useMemo(() => {
    if (!examData) return null;
    return examData.questions[state.currentQuestionIndex] ?? null;
  }, [examData, state.currentQuestionIndex]);

  const totalQuestions = examData?.totalQuestions ?? examData?.questions.length ?? 0;

  const overallProgress = useMemo(() => {
    if (totalQuestions === 0) return 0;
    if (state.step === "summary") return 100;
    return Math.round((state.questionResults.length / totalQuestions) * 100);
  }, [state.questionResults.length, state.step, totalQuestions]);

  const finalScore = useMemo(
    () => (summary ? summary.score : getQuestionScoreAverage(state.questionResults)),
    [state.questionResults, summary],
  );

  const duration = summary?.duration ??
    (startedAtRef.current > 0 ? Math.round((Date.now() - startedAtRef.current) / 1000) : 0);

  const loadExam = useCallback(async (nextKanaType: KanaType) => {
    if (activeLoadKanaTypeRef.current === nextKanaType) {
      return;
    }

    activeLoadKanaTypeRef.current = nextKanaType;
    setLoading(true);
    setError(null);
    setSubmitError(null);
    setSummary(null);
    errorStageRef.current = null;
    pendingSubmissionRef.current = null;

    try {
      const response = await getKanaExam(nextKanaType);

      if (response.questions.length === 0) {
        throw new Error("El backend devolvió una evaluación vacía");
      }

      setKanaType(nextKanaType);
      kanaTypeRef.current = nextKanaType;
      setExamData(response);
      setState({
        ...INITIAL_STATE,
        step: "exercise",
        canvasPhase: getInitialCanvasPhase(response),
      });
      startedAtRef.current = Date.now();
    } catch (nextError) {
      errorStageRef.current = "load";
      setError(extractErrorMessage(nextError));
      setState((current) => ({ ...current, step: "error" }));
    } finally {
      activeLoadKanaTypeRef.current = null;
      setLoading(false);
    }
  }, []);

  const submitCompletedExam = useCallback(async (submission: PendingSubmission) => {
    setLoading(true);
    setError(null);
    setSubmitError(null);
    errorStageRef.current = null;
    setState((current) => ({ ...current, step: "submitting" }));

    try {
      const response = await submitKanaExam(submission.kanaType, {
        score: submission.score,
        duration: submission.duration,
      });

      const passed = response.success === true && submission.score === 100;
      setSummary({
        kanaType: submission.kanaType,
        score: submission.score,
        correctAnswers: submission.correctAnswers,
        incorrectAnswers: submission.incorrectAnswers,
        totalQuestions: submission.totalQuestions,
        duration: submission.duration,
        passed,
        awardedPoints: response.awardedPoints ?? 0,
        message: response.message ?? null,
      });
      setState((current) => ({ ...current, step: "summary" }));
    } catch (nextError) {
      errorStageRef.current = "submit";
      const message = extractErrorMessage(nextError);
      setSubmitError(message);
      setError(message);
      setState((current) => ({ ...current, step: "error" }));
    } finally {
      setLoading(false);
    }
  }, []);

  const startExam = useCallback(async (nextKanaType: KanaType) => {
    setState(INITIAL_STATE);
    setExamData(null);
    await loadExam(nextKanaType);
  }, [loadExam]);

  const retry = useCallback(async () => {
    if (errorStageRef.current === "submit" && pendingSubmissionRef.current) {
      await submitCompletedExam(pendingSubmissionRef.current);
      return;
    }

    if (kanaTypeRef.current) {
      await loadExam(kanaTypeRef.current);
    }
  }, [loadExam, submitCompletedExam]);

  const selectOption = useCallback((optionIndex: number) => {
    setState((current) => {
      if (current.isAnswered) return current;
      return { ...current, selectedOptionIndex: optionIndex };
    });
  }, []);

  const confirmAnswer = useCallback(() => {
    setState((current) => {
      if (current.selectedOptionIndex === null || current.isAnswered) {
        return current;
      }

      return {
        ...current,
        isAnswered: true,
        step: "exercise-feedback",
      };
    });
  }, []);

  const finishQuestionSet = useCallback((questionResults: KanaQuizQuestionResult[]) => {
    const currentKanaType = kanaTypeRef.current;
    if (!currentKanaType) {
      setError("No se pudo resolver el alfabeto del examen");
      setState((current) => ({ ...current, step: "error" }));
      return;
    }

    const score = getQuestionScoreAverage(questionResults);
    const correctAnswers = questionResults.filter((item) => item.correct).length;
    const incorrectAnswers = questionResults.length - correctAnswers;
    const submission: PendingSubmission = {
      kanaType: currentKanaType,
      score,
      duration: Math.round((Date.now() - startedAtRef.current) / 1000),
      correctAnswers,
      incorrectAnswers,
      totalQuestions: questionResults.length,
    };

    pendingSubmissionRef.current = submission;
    void submitCompletedExam(submission);
  }, [submitCompletedExam]);

  const nextStep = useCallback(() => {
    const currentState = stateRef.current;
    const currentExamData = examDataRef.current;
    if (!currentExamData) return;

    const question = currentExamData.questions[currentState.currentQuestionIndex];
    if (!question) return;

    const isCorrect =
      question.options[currentState.selectedOptionIndex ?? -1]?.correct ?? false;

    const nextResults: KanaQuizQuestionResult[] = [
      ...currentState.questionResults,
      {
        questionIndex: currentState.currentQuestionIndex,
        correct: isCorrect,
        score: isCorrect ? 100 : 0,
      },
    ];

    const nextQuestionIndex = currentState.currentQuestionIndex + 1;
    if (nextQuestionIndex < currentExamData.questions.length) {
      const nextQuestion = currentExamData.questions[nextQuestionIndex] ?? null;
      setState({
        ...currentState,
        step: "exercise",
        currentQuestionIndex: nextQuestionIndex,
        selectedOptionIndex: null,
        isAnswered: false,
        questionResults: nextResults,
        canvasPhase:
          nextQuestion?.type === "canvas" && isValidCanvasQuestion(nextQuestion)
            ? "demo"
            : nextQuestion?.type === "canvas"
              ? "done"
              : "demo",
      });
      return;
    }

    setState((current) => ({
      ...current,
      questionResults: nextResults,
      step: "submitting",
    }));
    finishQuestionSet(nextResults);
  }, [finishQuestionSet]);

  const setCanvasPhase = useCallback((phase: "demo" | "practice" | "done") => {
    setState((current) => ({ ...current, canvasPhase: phase }));
  }, []);

  const completeCanvasQuestion = useCallback((score: number) => {
    const currentState = stateRef.current;
    const currentExamData = examDataRef.current;
    const question = currentExamData?.questions[currentState.currentQuestionIndex] ?? null;
    if (!currentExamData || question?.type !== "canvas") {
      return;
    }

    const nextResults: KanaQuizQuestionResult[] = [
      ...currentState.questionResults,
      {
        questionIndex: currentState.currentQuestionIndex,
        correct: score === 100,
        score,
      },
    ];

    const nextQuestionIndex = currentState.currentQuestionIndex + 1;
    if (nextQuestionIndex < currentExamData.questions.length) {
      const nextQuestion = currentExamData.questions[nextQuestionIndex] ?? null;
      setState({
        ...currentState,
        questionResults: nextResults,
        currentQuestionIndex: nextQuestionIndex,
        selectedOptionIndex: null,
        isAnswered: false,
        step: "exercise",
        canvasPhase:
          nextQuestion?.type === "canvas" && isValidCanvasQuestion(nextQuestion)
            ? "demo"
            : nextQuestion?.type === "canvas"
              ? "done"
              : "demo",
      });
      return;
    }

    setState((current) => ({
      ...current,
      questionResults: nextResults,
      canvasPhase: "done",
      step: "submitting",
    }));
    finishQuestionSet(nextResults);
  }, [finishQuestionSet]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setExamData(null);
    setLoading(false);
    setError(null);
    setSubmitError(null);
    setSummary(null);
    setKanaType(null);
    kanaTypeRef.current = null;
    startedAtRef.current = 0;
    errorStageRef.current = null;
    pendingSubmissionRef.current = null;
    activeLoadKanaTypeRef.current = null;
  }, []);

  return {
    state,
    examData,
    currentQuestion,
    totalQuestions,
    overallProgress,
    finalScore,
    duration,
    loading,
    error,
    submitError,
    summary,
    kanaType,
    startExam,
    retry,
    selectOption,
    confirmAnswer,
    nextStep,
    setCanvasPhase,
    completeCanvasQuestion,
    reset,
  };
}