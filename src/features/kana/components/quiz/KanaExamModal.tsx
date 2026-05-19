"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useKanaExam } from "@/features/kana/hooks/useKanaExam";
import type { KanaExamResult, KanaType } from "@/features/kana/types";
import { isValidCanvasQuestion } from "@/features/kana/utils/quizParser";
import { KanaQuizCanvasExercise } from "./KanaQuizCanvasExercise";
import {
  KanaFromKanaExercise,
  KanaFromRomajiExercise,
} from "./KanaQuizExercises";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { useAnswerConfirmationPreference } from "@/shared/hooks/useAnswerConfirmationPreference";
import { stopModalEvent, useModalPageLock } from "@/shared/hooks/useModalPageLock";
import { AnswerConfirmationPanel } from "@/shared/ui";
import { useStudySessionActivity } from "@/features/configuration/lib/studySessionReminder";

export interface KanaExamModalProps {
  kanaType: KanaType;
  onClose: (result?: KanaExamResult) => void;
}

function getKanaAccentVars(kanaType: KanaType): React.CSSProperties {
  if (kanaType === "katakana") {
    return {
      "--accent": "#1B5078",
      "--accent-hover": "#2E82B5",
      "--accent-subtle": "rgba(27,80,120,0.1)",
      "--accent-muted": "rgba(27,80,120,0.06)",
      "--accent-glow": "rgba(27,80,120,0.52)",
    } as React.CSSProperties;
  }

  return {
    "--accent": "#7B3F8A",
    "--accent-hover": "#A866B5",
    "--accent-subtle": "rgba(123,63,138,0.1)",
    "--accent-muted": "rgba(123,63,138,0.06)",
    "--accent-glow": "rgba(123,63,138,0.52)",
  } as React.CSSProperties;
}

export function KanaExamModal({ kanaType, onClose }: KanaExamModalProps) {
  const exam = useKanaExam();
  const { startExam, reset } = exam;
  useModalPageLock(true);
  const platformMotion = usePlatformMotion();
  const { confirmAnswersEnabled } = useAnswerConfirmationPreference();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

  useStudySessionActivity(`${kanaType}-exam`);

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

  useEffect(() => {
    void startExam(kanaType);
    return () => reset();
  }, [kanaType, reset, startExam]);

  const kanaTypeLabel = kanaType === "katakana" ? "Katakana" : "Hiragana";
  const strokeAccentColor = kanaType === "katakana" ? "#1B5078" : "#7B3F8A";
  const accentVars = useMemo(() => getKanaAccentVars(kanaType), [kanaType]);

  const showExerciseAdvance =
    exam.state.step === "exercise" &&
    !exam.state.isAnswered &&
    exam.currentQuestion?.type !== "canvas" &&
    exam.state.selectedOptionIndex !== null;

  const isCurrentCanvasQuestion = exam.currentQuestion?.type === "canvas";
  const isCurrentAnswerCorrect =
    exam.state.selectedOptionIndex !== null
      ? (exam.currentQuestion?.options?.[exam.state.selectedOptionIndex]?.correct ?? false)
      : false;

  const handleClose = useCallback(() => {
    onClose(exam.summary ?? undefined);
  }, [exam.summary, onClose]);

  const handleExerciseAdvance = useCallback(() => {
    if (!showExerciseAdvance) return;

    if (confirmAnswersEnabled) {
      setIsConfirmDialogOpen(true);
      return;
    }

    exam.confirmAnswer();
  }, [confirmAnswersEnabled, exam, showExerciseAdvance]);

  const handleConfirmCurrentAnswer = useCallback(() => {
    setIsConfirmDialogOpen(false);
    exam.confirmAnswer();
  }, [exam]);

  const handleDismissAnswerConfirmation = useCallback(
    (event?: ReactMouseEvent<HTMLDivElement>) => {
      event?.stopPropagation();
      setIsConfirmDialogOpen(false);
    },
    [],
  );

  const handleStayInExam = useCallback(
    (event?: ReactMouseEvent<HTMLDivElement> | ReactMouseEvent<HTMLButtonElement>) => {
      event?.stopPropagation();
      setIsExitDialogOpen(false);
    },
    [],
  );

  const handleConfirmExit = useCallback(() => {
    setIsExitDialogOpen(false);
    handleClose();
  }, [handleClose]);

  const handleRequestClose = useCallback(
    (event?: ReactMouseEvent<HTMLElement>) => {
      event?.stopPropagation();

      if (isConfirmDialogOpen) {
        setIsConfirmDialogOpen(false);
        return;
      }

      if (exam.state.step === "summary") {
        handleClose();
        return;
      }

      setIsExitDialogOpen(true);
    },
    [exam.state.step, handleClose, isConfirmDialogOpen],
  );

  const summary = exam.summary;

  return (
    <AnimatePresence>
      <motion.div
        key="kana-exam-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[80] flex items-center justify-center bg-surface-secondary/96 p-4"
        onClick={handleRequestClose}
        onWheelCapture={stopModalEvent}
        onPointerDown={stopModalEvent}
        onPointerMove={stopModalEvent}
        onTouchMoveCapture={stopModalEvent}
      >
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "relative flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface-primary shadow-2xl ring-1 ring-border-subtle",
            "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-2rem)]",
          ].join(" ")}
          style={accentVars}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 overflow-hidden rounded-t-3xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-accent to-accent-hover px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-content-inverted leading-tight">
                  Evaluación inicial de {kanaTypeLabel}
                </h2>
                <p className="text-xs font-medium text-white/70">
                  {exam.totalQuestions > 0
                    ? `${exam.totalQuestions} preguntas aleatorias`
                    : "Preparando evaluación"}
                </p>
              </div>

              <button
                onClick={handleRequestClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-primary/15 text-content-inverted transition hover:bg-surface-primary/25"
                aria-label="Cerrar"
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

            {(exam.state.step === "exercise" || exam.state.step === "exercise-feedback") && (
              <div className="border-b border-border-subtle bg-surface-primary px-5 py-2.5">
                <ExamProgress
                  current={exam.state.questionResults.length}
                  total={exam.totalQuestions}
                  progress={exam.overallProgress}
                />
              </div>
            )}
          </div>

          <div className="kanji-detail-scroll flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
            {(exam.state.step === "loading" || exam.state.step === "submitting") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-20"
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-4 border-border-subtle" />
                  <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-accent" />
                </div>
                <p className="text-sm font-medium text-content-muted">
                  {exam.state.step === "submitting"
                    ? "Guardando resultado del examen..."
                    : "Preparando evaluación..."}
                </p>
              </motion.div>
            )}

            {exam.state.step === "error" && exam.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-16"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/12 ring-1 ring-red-500/20 shadow-[0_10px_30px_rgba(185,28,28,0.16)]">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                <div className="space-y-1.5 text-center">
                  <p className="text-sm font-semibold text-red-300">
                    No pudimos completar la evaluación
                  </p>
                  <p className="max-w-[320px] text-xs leading-relaxed text-content-muted">
                    {exam.error}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => void exam.retry()}
                    className="rounded-xl bg-red-500/12 px-5 py-2.5 text-sm font-semibold text-red-300 ring-1 ring-red-500/18 transition hover:bg-red-500/20"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={handleClose}
                    className="rounded-xl bg-surface-secondary px-5 py-2.5 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary"
                  >
                    Volver
                  </button>
                </div>
              </motion.div>
            )}

            {(exam.state.step === "exercise" || exam.state.step === "exercise-feedback") &&
              exam.currentQuestion && (
                <AnimatePresence mode="wait">
                  <div key={`exam-q-${exam.state.currentQuestionIndex}`}>
                    {exam.currentQuestion.type === "from_kana" && (
                      <KanaFromKanaExercise
                        question={exam.currentQuestion}
                        selectedIndex={exam.state.selectedOptionIndex}
                        revealed={exam.state.isAnswered}
                        onSelect={exam.selectOption}
                      />
                    )}

                    {exam.currentQuestion.type === "from_romaji" && (
                      <KanaFromRomajiExercise
                        question={exam.currentQuestion}
                        selectedIndex={exam.state.selectedOptionIndex}
                        revealed={exam.state.isAnswered}
                        onSelect={exam.selectOption}
                      />
                    )}

                    {exam.currentQuestion.type === "canvas" &&
                      isValidCanvasQuestion(exam.currentQuestion) && (
                        <KanaQuizCanvasExercise
                          question={exam.currentQuestion}
                          questionIndex={exam.state.currentQuestionIndex}
                          totalQuestions={exam.totalQuestions}
                          phase={exam.state.canvasPhase}
                          onPhaseChange={exam.setCanvasPhase}
                          onComplete={exam.completeCanvasQuestion}
                          accentColor={strokeAccentColor}
                        />
                      )}

                    {exam.currentQuestion.type === "canvas" &&
                      !isValidCanvasQuestion(exam.currentQuestion) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center gap-4 py-12"
                        >
                          <p className="text-center text-sm text-content-tertiary">
                            Datos de trazos no disponibles para{" "}
                            <strong>
                              {exam.currentQuestion.symbol || exam.currentQuestion.romaji}
                            </strong>
                            .
                          </p>
                          <button
                            onClick={() => exam.completeCanvasQuestion(0)}
                            className="rounded-xl bg-surface-tertiary px-5 py-2.5 text-sm font-semibold transition"
                          >
                            Omitir
                          </button>
                        </motion.div>
                      )}
                  </div>
                </AnimatePresence>
              )}

            {showExerciseAdvance ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExerciseAdvance}
                  className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all"
                >
                  Mostrar resultado
                </motion.button>
              </motion.div>
            ) : null}

            {exam.state.step === "exercise-feedback" && !isCurrentCanvasQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-4 flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exam.nextStep}
                  className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all"
                >
                  {exam.state.questionResults.length + 1 >= exam.totalQuestions
                    ? "Finalizar examen"
                    : isCurrentAnswerCorrect
                      ? "Siguiente"
                      : "Continuar"}
                </motion.button>
              </motion.div>
            )}

            {exam.state.step === "summary" && summary && (
              <KanaExamSummaryView summary={summary} onClose={handleClose} />
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {isConfirmDialogOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={handleDismissAnswerConfirmation}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
                className="relative z-10 w-full max-w-md"
                onClick={(event) => event.stopPropagation()}
              >
                <AnswerConfirmationPanel
                  title="Confirmar respuesta"
                  description="Si ya revisaste tu respuesta, confirma para mostrar el resultado de esta pregunta."
                  confirmLabel="Mostrar resultado"
                  onConfirm={handleConfirmCurrentAnswer}
                  tone={kanaType === "katakana" ? "katakana" : "hiragana"}
                  secondaryAction={{
                    label: "Seguir revisando",
                    onAction: () => setIsConfirmDialogOpen(false),
                  }}
                />
              </motion.div>
            </motion.div>
          ) : null}

          {isExitDialogOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={handleStayInExam}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
                className="relative z-10 w-full max-w-md"
                onClick={(event) => event.stopPropagation()}
              >
                <AnswerConfirmationPanel
                  title="Salir de la evaluación"
                  description="Si sales ahora, cerrarás esta evaluación inicial y volverás al onboarding."
                  confirmLabel="Salir"
                  onConfirm={handleConfirmExit}
                  tone={kanaType === "katakana" ? "katakana" : "hiragana"}
                  secondaryAction={{
                    label: "Seguir evaluando",
                    onAction: () => setIsExitDialogOpen(false),
                  }}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

function ExamProgress({
  current,
  total,
  progress,
}: {
  current: number;
  total: number;
  progress: number;
}) {
  return (
    <div className="w-full space-y-1.5">
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-content-muted">
        <span>Pregunta {Math.min(current + 1, total || 1)}</span>
        <span>{current} / {total}</span>
      </div>
    </div>
  );
}

function KanaExamSummaryView({
  summary,
  onClose,
}: {
  summary: KanaExamResult;
  onClose: () => void;
}) {
  const kanaTypeLabel = summary.kanaType === "katakana" ? "Katakana" : "Hiragana";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-accent-subtle text-2xl font-black text-accent shadow-[0_18px_40px_rgba(153,51,49,0.14)]">
          {summary.score}%
        </div>
        <h3 className="mt-4 text-2xl font-black tracking-tight text-content-primary">
          {summary.passed
            ? `${kanaTypeLabel} aprobado`
            : `Evaluación de ${kanaTypeLabel} finalizada`}
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-content-secondary">
          {summary.passed
            ? "Obtuviste una puntuación perfecta. El backend ya registró este alfabeto como aprobado dentro de tu progreso."
            : "No alcanzaste la aprobación perfecta, así que seguirás el recorrido normal para aprender este alfabeto desde cero."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetricCard label="Aciertos" value={String(summary.correctAnswers)} />
        <SummaryMetricCard label="Errores" value={String(summary.incorrectAnswers)} />
        <SummaryMetricCard label="Duración" value={`${summary.duration}s`} />
      </div>

      <div className="rounded-[28px] border border-border-default bg-surface-secondary/75 p-5 shadow-[0_18px_42px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-content-muted">
              Estado
            </p>
            <p className="mt-2 text-base font-bold text-content-primary">
              {summary.passed ? "Desbloqueado por examen" : "Seguir desde cero"}
            </p>
          </div>

          <span
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
              summary.passed
                ? "bg-green-500/12 text-green-600 ring-1 ring-green-500/20"
                : "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20",
            ].join(" ")}
          >
            {summary.passed ? "Aprobado" : "No aprobado"}
          </span>
        </div>

        {summary.message ? (
          <p className="mt-4 text-sm leading-relaxed text-content-secondary">
            {summary.message}
          </p>
        ) : null}

        {summary.passed && summary.awardedPoints > 0 ? (
          <p className="mt-3 text-sm font-semibold text-accent">
            Puntos otorgados: +{summary.awardedPoints}
          </p>
        ) : null}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all hover:opacity-95"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  );
}

function SummaryMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-border-default bg-surface-secondary/72 p-4 text-center shadow-[0_14px_30px_rgba(0,0,0,0.05)]">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-content-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight text-content-primary">
        {value}
      </p>
    </div>
  );
}