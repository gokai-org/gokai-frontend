"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FlaskConical } from "lucide-react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import {
  ReaffirmedMasteryResult,
  UnlockedMasterySequence,
} from "@/shared/ui/ReaffirmedMasteryResult";
import { submitGrammarQuiz } from "../../../api/grammarApi";
import type { ExamItem, GrammarLesson, GrammarQuizCompletionResult } from "../../../types";
import GrammarCompleteExercise from "./GrammarCompleteExercise";
import GrammarOrderExercise from "./GrammarOrderExercise";
import GrammarQuestionExercise from "./GrammarQuestionExercise";

type GrammarQuizStep = "exercise" | "submitting" | "summary";
const GRAMMAR_COMPLETION_REWARD = 35;

type GrammarQuizFooterState = {
  canConfirm: boolean;
  onConfirm: () => void;
  secondaryAction?: {
    label: string;
    onAction: () => void;
  } | null;
};

function getExerciseMeta(item: ExamItem, answered: boolean) {
  if (item.type === "question") {
    return {
      label: "Seleccion multiple",
      hint: answered
        ? "Revisa la opcion correcta y continua cuando quieras."
        : "Puedes elegir con click, con las teclas 1-4 o con flechas y Enter.",
    };
  }

  if (item.type === "complete") {
    return {
      label: "Completar huecos",
      hint: answered
        ? "Comprueba cada hueco antes de pasar al siguiente bloque."
        : "Toca una ficha o arrastrala hasta el hueco que quieras completar.",
    };
  }

  return {
    label: "Ordenar frase",
    hint: answered
      ? "Si el orden ya esta revisado, continua con la siguiente pregunta."
      : "Toca las palabras para construir la frase y arrastra las fichas para reordenarlas.",
  };
}

function shouldHideSubmitError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedMessage = error.message.toLowerCase();

  return (
    normalizedMessage.includes("http 403") &&
    normalizedMessage.includes("no se tienen los puntos necesarios")
  );
}

function GrammarQuizProgress({
  current,
  total,
  progress,
}: {
  current: number;
  total: number;
  progress: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-content-secondary">
        <span>
          Pregunta {Math.min(Math.max(current, 1), Math.max(total, 1))} de {Math.max(total, 1)}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function GrammarQuizSummary({
  lessonTitle,
  score,
  correctCount,
  total,
  submitting,
  submitError,
}: {
  lessonTitle: string;
  score: number;
  correctCount: number;
  total: number;
  submitting: boolean;
  submitError: string | null;
}) {
  const success = score >= 70;
  const scoreStyle = success ? { color: "var(--accent)" } : undefined;
  const statusLabel = success ? "Buen intento" : "Intentalo de nuevo";
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-accent/80">
          Resumen del intento
        </p>
        <h3 className="text-2xl font-bold tracking-tight text-content-primary">
          {lessonTitle}
        </h3>
        <p className="max-w-2xl text-sm leading-7 text-content-secondary">
          Terminaste el examen completo de gramática. Revisa tu resultado y vuelve al tablero cuando quieras.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(183,71,66,0.12),rgba(183,71,66,0.03))] p-5 ring-1 ring-accent/15">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-content-muted">
            Resultado
          </p>
          <p className="mt-3 text-[clamp(3.2rem,8vw,5.2rem)] font-black leading-none tracking-tight text-content-primary" style={scoreStyle}>
            {score}
            <span className="ml-2 text-base font-semibold text-content-muted">/100</span>
          </p>
          <p className="mt-3 text-sm font-semibold text-content-primary" style={scoreStyle}>
            {statusLabel}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-rows-3">
          <div className="rounded-[22px] bg-surface-secondary/65 p-4 ring-1 ring-border-subtle">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-content-muted">
              Correctas
            </p>
            <p className="mt-2 text-2xl font-bold text-content-primary">
              {correctCount}
            </p>
          </div>

          <div className="rounded-[22px] bg-surface-secondary/65 p-4 ring-1 ring-border-subtle">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-content-muted">
              Total
            </p>
            <p className="mt-2 text-2xl font-bold text-content-primary">
              {total}
            </p>
          </div>

          <div className="rounded-[22px] bg-surface-secondary/65 p-4 ring-1 ring-border-subtle">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-content-muted">
              Precision
            </p>
            <p className="mt-2 text-2xl font-bold text-content-primary">
              {accuracy}%
            </p>
          </div>
        </div>
      </div>

      {submitting ? (
        <p className="text-sm text-content-muted">Guardando resultado...</p>
      ) : null}

      {submitError ? (
        <p className="text-sm text-content-secondary">
          No se pudo guardar el resultado: {submitError}
        </p>
      ) : null}
    </div>
  );
}

export interface GrammarQuizModalProps {
  lesson: GrammarLesson;
  onClose: () => void;
  onComplete?: (result: GrammarQuizCompletionResult) => void;
}

export default function GrammarQuizModal({ lesson, onClose, onComplete }: GrammarQuizModalProps) {
  const platformMotion = usePlatformMotion();
  const exam = lesson.content?.exam ?? [];
  const [step, setStep] = useState<GrammarQuizStep>("exercise");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCorrectCount, setFinalCorrectCount] = useState(0);
  const [awardedPoints, setAwardedPoints] = useState(0);
  const [completedSuccessfully, setCompletedSuccessfully] = useState(false);
  const [exerciseFooterState, setExerciseFooterState] = useState<GrammarQuizFooterState | null>(null);
  const startRef = useRef(Date.now());

  const overlayVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.18 : 0.24,
        },
      },
      exit: {
        opacity: 0,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.14 : 0.18,
        },
      },
    }),
    [platformMotion.shouldUseLightAnimations],
  );

  const panelVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        scale: platformMotion.shouldUseLightAnimations ? 1 : 0.95,
        y: platformMotion.shouldUseLightAnimations ? 10 : 24,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.24 : 0.35,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
      exit: {
        opacity: 0,
        scale: platformMotion.shouldUseLightAnimations ? 1 : 0.96,
        y: platformMotion.shouldUseLightAnimations ? 8 : 16,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.16 : 0.2,
        },
      },
    }),
    [platformMotion.shouldUseLightAnimations],
  );

  const resetSession = useCallback(() => {
    startRef.current = Date.now();
    setStep("exercise");
    setCurrentIdx(0);
    setAnswered(false);
    setSelectedIdx(null);
    setResults([]);
    setSubmitting(false);
    setSubmitError(null);
    setFinalScore(0);
    setFinalCorrectCount(0);
    setAwardedPoints(0);
    setCompletedSuccessfully(false);
  }, []);

  const total = exam.length;
  const current = exam[currentIdx] ?? null;
  const exerciseMeta = current ? getExerciseMeta(current, answered) : null;
  const completedQuestions = Math.min(currentIdx + (answered ? 1 : 0), total);
  const overallProgress = total > 0 ? (completedQuestions / total) * 100 : 0;

  const handleQuestionSelect = useCallback((idx: number) => {
    if (answered || step !== "exercise") return;
    setSelectedIdx(idx);
  }, [answered, step]);

  const handleQuestionConfirm = useCallback(() => {
    if (answered || selectedIdx === null || current?.type !== "question") return;

    const isCorrect = current.options[selectedIdx]?.correct ?? false;
    setAnswered(true);
    setResults((prev) => [...prev, isCorrect]);
  }, [answered, current, selectedIdx]);

  const handleSubAnswer = useCallback((correct: boolean) => {
    setAnswered(true);
    setResults((prev) => [...prev, correct]);
  }, []);

  const handleExerciseFooterStateChange = useCallback((state: GrammarQuizFooterState | null) => {
    setExerciseFooterState(state);
  }, []);

  const finalizeExam = useCallback(async () => {
    const score = total > 0
      ? Math.round((results.filter(Boolean).length / total) * 100)
      : 0;
    const duration = (Date.now() - startRef.current) / 1000;

    setFinalScore(score);
    setFinalCorrectCount(results.filter(Boolean).length);
    setSubmitting(true);
    setStep("submitting");
    setSubmitError(null);

    try {
      const response = await submitGrammarQuiz(lesson.id, { score, duration });
      setAwardedPoints(response.pointsAwarded ?? 0);
      setCompletedSuccessfully(response.isCorrect === true);
      onComplete?.({
        grammarId: lesson.id,
        score,
        isCorrect: response.isCorrect,
        pointsAwarded: response.pointsAwarded ?? 0,
        userPoints: response.userPoints ?? 0,
      });
    } catch (error) {
      setAwardedPoints(0);
      setCompletedSuccessfully(false);
      if (!shouldHideSubmitError(error)) {
        setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el resultado");
      }
    } finally {
      setSubmitting(false);
      setStep("summary");
    }
  }, [lesson.id, onComplete, results, total]);

  const proceed = useCallback(async () => {
    if (!answered) return;

    const nextIdx = currentIdx + 1;
    if (nextIdx >= total) {
      await finalizeExam();
      return;
    }

    setCurrentIdx(nextIdx);
    setAnswered(false);
    setSelectedIdx(null);
  }, [answered, currentIdx, finalizeExam, total]);

  useEffect(() => {
    if (!current || current.type !== "question" || step !== "exercise") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && answered) {
        event.preventDefault();
        void proceed();
        return;
      }

      if (answered) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIdx((prev) => (prev === null ? 0 : (prev + 1) % current.options.length));
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIdx((prev) => (prev === null ? current.options.length - 1 : (prev - 1 + current.options.length) % current.options.length));
        return;
      }

      if (/^[1-9]$/.test(event.key)) {
        const optionIndex = Number(event.key) - 1;
        if (optionIndex < current.options.length) {
          event.preventDefault();
          setSelectedIdx(optionIndex);
        }
        return;
      }

      if (event.key === "Enter" && selectedIdx !== null) {
        event.preventDefault();
        handleQuestionConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answered, current, handleQuestionConfirm, proceed, selectedIdx, step]);

  useEffect(() => {
    if (step !== "exercise" || !current || current.type === "question" || answered) {
      setExerciseFooterState(null);
    }
  }, [answered, current, step]);

  const shouldShowUnlockedCompletion = completedSuccessfully && awardedPoints > 0;
  const shouldShowReaffirmedCompletion = completedSuccessfully && awardedPoints === 0;
  const displayedAwardedPoints = Math.max(awardedPoints, GRAMMAR_COMPLETION_REWARD);

  const footerActionVisible = step === "exercise" && current && (
    answered || current.type === "question" || exerciseFooterState !== null
  );

  return (
    <motion.div
      key="grammar-quiz-overlay"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={[
          "bg-surface-primary w-full overflow-hidden shadow-2xl ring-1 ring-border-subtle flex flex-col rounded-3xl max-h-[95dvh]",
          step === "summary" ? "max-w-2xl" : "max-w-6xl",
          "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-1rem)] max-sm:max-h-[92dvh]",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 overflow-hidden rounded-t-3xl">
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-accent to-accent-hover px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-surface-primary/16 text-content-inverted">
                <FlaskConical className="h-4.5 w-4.5" />
              </div>

              <div>
                <h2 className="text-sm font-bold leading-tight text-content-inverted sm:text-base">
                  Examen de Gramática
                </h2>
                <p className="text-[11px] font-medium text-white/70 sm:text-xs">
                  {lesson.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-primary/15 text-content-inverted transition hover:bg-surface-primary/25"
              aria-label="Cerrar examen"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {step === "exercise" && total > 0 ? (
            <div className="border-b border-border-subtle bg-surface-primary px-4 py-2.5 sm:px-5">
              <GrammarQuizProgress
                current={completedQuestions + 1}
                total={total}
                progress={overallProgress}
              />
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-h-0 p-3 sm:p-6 lg:p-7">
          {total === 0 ? (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-surface-secondary/45 text-accent ring-1 ring-border-subtle">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-content-primary">
                  Este examen todavia no tiene ejercicios
                </p>
                <p className="max-w-md text-sm leading-6 text-content-secondary">
                  Vuelve al tablero y prueba otra leccion de grammar con examen disponible.
                </p>
              </div>
            </div>
          ) : null}

          {step === "submitting" ? (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 py-20">
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-4 border-border-subtle" />
                <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-accent" />
              </div>
              <p className="text-sm font-medium text-content-muted">
                Guardando resultado...
              </p>
            </div>
          ) : null}

          {step === "summary" ? (
            <div className="kanji-detail-scroll h-full min-h-0 overflow-y-auto pr-1">
              {shouldShowUnlockedCompletion ? (
                <UnlockedMasterySequence
                  title="Dominaste esta lección de grammar"
                  subtitle={`${lesson.title} quedo completada con un resultado perfecto y desbloqueo ${displayedAwardedPoints} puntos nuevos.`}
                  score={finalScore}
                  symbol="文"
                  pointsDelta={displayedAwardedPoints}
                  statusLabel="Lección completada"
                  onClose={onClose}
                />
              ) : shouldShowReaffirmedCompletion ? (
                <ReaffirmedMasteryResult
                  title="Volviste a dominar esta lección"
                  subtitle={`${lesson.title} se resolvio otra vez con un puntaje perfecto, sin otorgar puntos nuevos.`}
                  score={finalScore}
                  statusLabel="Dominio reafirmado"
                  primaryActionLabel="Repetir examen"
                  onRetry={resetSession}
                  onClose={onClose}
                />
              ) : (
                <GrammarQuizSummary
                  lessonTitle={lesson.title}
                  score={finalScore}
                  correctCount={finalCorrectCount}
                  total={total}
                  submitting={submitting}
                  submitError={submitError}
                />
              )}
            </div>
          ) : null}

          {step === "exercise" && current ? (
            <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden sm:gap-5">
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
                    {exerciseMeta?.label}
                  </span>
                  <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] font-semibold text-content-secondary sm:px-3 sm:text-xs">
                    {results.filter(Boolean).length} correctas
                  </span>
                </div>

                <p className="max-w-2xl text-xs leading-5 text-content-secondary sm:text-sm sm:leading-6">
                  {exerciseMeta?.hint}
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden rounded-[24px] border border-black/[0.05] bg-surface-primary/80 p-2.5 shadow-[0_20px_48px_rgba(0,0,0,0.08)] dark:border-white/[0.08] sm:min-h-[520px] sm:rounded-[32px] sm:p-5 lg:min-h-[600px] lg:p-6">
                <div key={`grammar-quiz-${currentIdx}`} className="h-full min-h-0">
                  {current.type === "question" ? (
                    <GrammarQuestionExercise
                      question={current}
                      answered={answered}
                      selectedIndex={selectedIdx}
                      onSelect={handleQuestionSelect}
                    />
                  ) : null}

                  {current.type === "complete" ? (
                    <GrammarCompleteExercise
                      question={current}
                      answered={answered}
                      onAnswer={handleSubAnswer}
                      onFooterStateChange={handleExerciseFooterStateChange}
                    />
                  ) : null}

                  {current.type === "order" ? (
                    <GrammarOrderExercise
                      question={current}
                      answered={answered}
                      onAnswer={handleSubAnswer}
                      onFooterStateChange={handleExerciseFooterStateChange}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {footerActionVisible ? (
          <div className="shrink-0 rounded-b-3xl border-t border-border-subtle bg-surface-primary px-4 py-3 sm:px-6 sm:py-4">
            {!answered && current?.type === "question" ? (
              <button
                type="button"
                disabled={selectedIdx === null}
                onClick={handleQuestionConfirm}
                className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35 sm:py-3"
              >
                Confirmar respuesta
              </button>
            ) : !answered && exerciseFooterState ? (
              <div className="flex gap-3">
                {exerciseFooterState.secondaryAction ? (
                  <button
                    type="button"
                    onClick={exerciseFooterState.secondaryAction.onAction}
                    className="shrink-0 rounded-2xl bg-surface-secondary px-3.5 py-2.5 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary sm:px-4 sm:py-3"
                  >
                    {exerciseFooterState.secondaryAction.label}
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={!exerciseFooterState.canConfirm}
                  onClick={exerciseFooterState.onConfirm}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-35 sm:py-3"
                >
                  Confirmar respuesta
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void proceed();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 sm:py-3"
              >
                <CheckCircle2 className="h-4 w-4" />
                {currentIdx + 1 >= total ? "Ver resumen" : "Siguiente"}
              </button>
            )}
          </div>
        ) : null}

        {step === "summary" && !(shouldShowUnlockedCompletion || shouldShowReaffirmedCompletion) ? (
          <div className="shrink-0 rounded-b-3xl border-t border-border-subtle bg-surface-primary px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={resetSession}
                className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Repetir examen
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-surface-secondary px-5 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary"
              >
                Volver al tablero
              </button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}