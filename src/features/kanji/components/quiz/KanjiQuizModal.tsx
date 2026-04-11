"use client";

import { useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKanjiQuiz } from "@/features/kanji/hooks/useKanjiQuiz";
import {
  toExerciseQuestion,
  isValidWritingQuestion,
} from "@/features/kanji/utils/quizParser";
import {
  QUIZ_TYPE_LABELS,
  QUIZ_ROUND_ORDER,
} from "@/features/kanji/types/quiz";
import type {
  KanjiQuizRoundResult,
  KanjiQuizType,
} from "@/features/kanji/types/quiz";
import { KanjiMeaningExercise } from "./KanjiMeaningExercise";
import { KanjiSelectionExercise } from "./KanjiSelectionExercise";
import { KanjiReadingExercise } from "./KanjiReadingExercise";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { KanjiQuizWritingExercise } from "./KanjiQuizWritingExercise";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";

export interface KanjiQuizModalProps {
  kanjiId: string;
  label?: string;
  quizType?: KanjiQuizType;
  onClose: () => void;
  onComplete?: (score: number, updatedPoints: number | null) => void;
}

export function KanjiQuizModal({
  kanjiId,
  label,
  quizType,
  onClose,
  onComplete,
}: KanjiQuizModalProps) {
  const quiz = useKanjiQuiz();
  const platformMotion = usePlatformMotion();
  const mastered = useMasteredModules();
  const isKanjiMastered = mastered.has("kanji");

  const goldenAccentVars = useMemo<React.CSSProperties | undefined>(
    () =>
      isKanjiMastered
        ? ({
            "--accent": "#D4A843",
            "--accent-hover": "#C49B3B",
            "--accent-subtle": "rgba(212,168,67,0.18)",
            "--accent-muted": "rgba(212,168,67,0.45)",
            "--accent-glow": "rgba(240,210,122,0.35)",
          } as React.CSSProperties)
        : undefined,
    [isKanjiMastered],
  );

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
    quiz.startQuiz(kanjiId, quizType);
    return () => quiz.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanjiId, quizType]);

  const handleRetry = useCallback(() => {
    quiz.reset();
    quiz.startQuiz(kanjiId, quizType);
  }, [quiz, kanjiId, quizType]);

  const handleClose = useCallback(() => {
    if (
      (quiz.state.step === "summary" || quiz.state.step === "celebration") &&
      onComplete
    ) {
      onComplete(quiz.finalScore, quiz.updatedPoints);
    }
    onClose();
  }, [quiz, onClose, onComplete]);

  const handleNextAfterFeedback = useCallback(() => {
    quiz.nextStep();
  }, [quiz]);

  const {
    state,
    quizData,
    currentQuestion,
    totalQuestions,
    overallProgress,
    finalScore,
    error,
    isPointsError,
    updatedPoints,
    pointsDelta,
    roundResults,
    currentRound,
    totalRounds,
    sessionType,
  } = quiz;

  const currentQuizType =
    quizData?.type ?? (sessionType === "mixed" ? undefined : sessionType);
  const quizSubtitle = currentQuizType
    ? QUIZ_TYPE_LABELS[currentQuizType]
    : "Quiz completo";

  const _isTransitioning =
    state.step === "submitting" ||
    (state.step === "loading" && roundResults.length > 0);
  const isCurrentAnswerCorrect =
    state.selectedOptionIndex !== null
      ? (currentQuestion?.options?.[state.selectedOptionIndex]?.correct ?? false)
      : false;

  return (
    <AnimatePresence>
      <motion.div
        key="quiz-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        onClick={handleClose}
      >
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "bg-surface-primary w-full shadow-2xl ring-1 ring-border-subtle flex flex-col",
            state.step === "summary" || state.step === "celebration"
              ? "max-w-2xl"
              : "max-w-lg",
            "rounded-3xl max-h-[95dvh]",
            "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-2rem)]",
            "max-sm:max-h-[92dvh] max-sm:rounded-3xl",
          ].join(" ")}
          style={goldenAccentVars}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="shrink-0 rounded-t-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent to-accent-hover px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-content-inverted leading-tight">
                    Quiz de Kanji
                  </h2>
                  <p className="text-xs text-white/70 font-medium">
                    {quizSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {totalRounds > 1 && state.step !== "summary" && state.step !== "error" && (
                  <RoundDots
                    roundResults={roundResults}
                    currentRound={currentRound}
                    total={totalRounds}
                  />
                )}

                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl bg-surface-primary/15 hover:bg-surface-primary/25 text-content-inverted flex items-center justify-center transition"
                  aria-label="Cerrar"
                >
                  <svg
                    className="w-4 h-4"
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
            </div>

            {(state.step === "exercise" ||
              state.step === "exercise-feedback") &&
              quizData && (
                <div className="bg-surface-primary border-b border-border-subtle px-5 py-2.5">
                  <QuizProgress
                    current={
                      quizData.type === "writing"
                        ? state.writingQuestionIndex
                        : state.questionResults.length
                    }
                    total={totalQuestions}
                    progress={overallProgress}
                  />
                </div>
              )}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto kanji-detail-scroll p-5 sm:p-6">
            {state.step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-border-subtle rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-accent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-content-muted font-medium">
                  {roundResults.length >= totalRounds
                    ? "Guardando resultado..."
                    : roundResults.length > 0
                      ? `Ejercicio ${Math.min(roundResults.length + 1, totalRounds)} de ${totalRounds}…`
                      : "Preparando quiz…"}
                </p>
              </motion.div>
            )}

            {state.step === "submitting" && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-border-subtle rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-accent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-content-muted font-medium">
                  {roundResults.length < totalRounds - 1
                    ? "Guardando y preparando siguiente…"
                    : "Guardando resultado…"}
                </p>
              </motion.div>
            )}

            {/* ERROR */}
            {state.step === "error" && error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div
                  className={[
                    "w-14 h-14 rounded-2xl flex items-center justify-center ring-1 shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
                    isPointsError
                      ? "bg-orange-500/12 ring-orange-500/22"
                      : "bg-red-500/12 ring-red-500/20",
                  ].join(" ")}
                >
                  {isPointsError ? (
                    <svg
                      className="w-6 h-6 text-orange-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-red-400"
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
                  )}
                </div>

                <div className="text-center space-y-1.5">
                  <p
                    className={[
                      "text-sm font-semibold",
                      isPointsError
                        ? "text-orange-200"
                        : "text-red-300",
                    ].join(" ")}
                  >
                    {isPointsError ? "Puntos insuficientes" : "Ocurrió un error"}
                  </p>
                  <p className="text-content-muted text-xs max-w-[300px] leading-relaxed">
                    {error}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!isPointsError && (
                    <button
                      onClick={handleRetry}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition bg-red-500/12 text-red-300 ring-1 ring-red-500/18 hover:bg-red-500/20"
                    >
                      Reintentar
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className={[
                      "px-5 py-2.5 rounded-xl text-sm font-semibold transition",
                      isPointsError
                        ? "bg-orange-500/12 text-orange-200 ring-1 ring-orange-500/18 hover:bg-orange-500/20"
                        : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary",
                    ].join(" ")}
                  >
                    {isPointsError ? "Entendido" : "Cerrar"}
                  </button>
                </div>
              </motion.div>
            )}

            {(state.step === "exercise" ||
              state.step === "exercise-feedback") &&
              quizData &&
              currentQuestion && (
                <AnimatePresence mode="wait">
                  <div
                    key={`q-${state.currentQuestionIndex}-${state.writingQuestionIndex}`}
                  >
                    {quizData.type === "kanji" && (
                      <KanjiMeaningExercise
                        question={toExerciseQuestion(
                          currentQuestion,
                          "kanji",
                        )}
                        selectedIndex={state.selectedOptionIndex}
                        revealed={state.isAnswered}
                        onSelect={quiz.selectOption}
                        onConfirm={quiz.confirmAnswer}
                      />
                    )}

                    {quizData.type === "meaning" && (
                      <KanjiSelectionExercise
                        question={toExerciseQuestion(
                          currentQuestion,
                          "meaning",
                        )}
                        selectedIndex={state.selectedOptionIndex}
                        revealed={state.isAnswered}
                        onSelect={quiz.selectOption}
                        onConfirm={quiz.confirmAnswer}
                      />
                    )}

                    {quizData.type === "reading" && (
                      <KanjiReadingExercise
                        question={toExerciseQuestion(
                          currentQuestion,
                          "reading",
                        )}
                        selectedIndex={state.selectedOptionIndex}
                        revealed={state.isAnswered}
                        onSelect={quiz.selectOption}
                        onConfirm={quiz.confirmAnswer}
                      />
                    )}

                    {quizData.type === "writing" &&
                      isValidWritingQuestion(currentQuestion) && (
                        <KanjiQuizWritingExercise
                          question={currentQuestion}
                          questionIndex={state.writingQuestionIndex}
                          totalWritingQuestions={totalQuestions}
                          phase={state.writingPhase}
                          onPhaseChange={quiz.setWritingPhase}
                          onComplete={quiz.completeWritingQuestion}
                        />
                      )}

                    {quizData.type === "writing" &&
                      !isValidWritingQuestion(currentQuestion) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center py-12 gap-4"
                        >
                          <p className="text-content-tertiary text-sm text-center">
                            Datos de trazos no disponibles para{" "}
                            <strong>{currentQuestion.kanji}</strong>.
                          </p>
                          <button
                            onClick={() => quiz.completeWritingQuestion(0)}
                            className="px-5 py-2.5 bg-surface-tertiary rounded-xl text-sm font-semibold transition"
                          >
                            Omitir
                          </button>
                        </motion.div>
                      )}
                  </div>
                </AnimatePresence>
              )}

            {state.step === "exercise-feedback" &&
              quizData &&
              quizData.type !== "writing" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center mt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextAfterFeedback}
                    className="w-full max-w-sm py-3.5 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold shadow-lg shadow-accent/15 transition-all"
                  >
                    {isCurrentAnswerCorrect
                      ? state.questionResults.length + 1 >= totalQuestions
                        ? "Finalizar ejercicio"
                        : "Siguiente"
                      : "Ver resumen"}
                  </motion.button>
                </motion.div>
              )}

            {state.step === "celebration" &&
              (totalRounds === 1 ? (
                <KanjiPracticeResult
                  success
                  score={finalScore}
                  quizTypeLabel={quizSubtitle}
                  label={label}
                  pointsDelta={pointsDelta}
                  error={error}
                  updatedPoints={updatedPoints}
                  onRetry={handleRetry}
                  onClose={handleClose}
                />
              ) : (
              <motion.div
                key="celebration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-8 gap-6 text-center"
              >
                <div className="relative">
                  <div className="kanji-celebration-halo absolute inset-[-24px] rounded-full" />
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover ${isKanjiMastered ? "shadow-[0_0_48px_rgba(212,168,67,0.52)]" : "shadow-[0_0_48px_rgba(186,72,66,0.52)]"}`}
                  >
                    <span className="text-5xl font-bold text-white select-none">
                      {label || "漢"}
                    </span>
                  </motion.div>
                </div>

                {pointsDelta > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.32,
                      duration: 0.42,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2 shadow-lg shadow-accent/30"
                  >
                    <span className="text-xl font-black text-white">
                      +{pointsDelta}
                    </span>
                    <span className="text-sm font-semibold text-white/80">
                      puntos ganados
                    </span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.44, duration: 0.38 }}
                  className="space-y-1.5"
                >
                  <p className="text-2xl font-black text-content-primary">
                    ¡Kanji completado!
                  </p>
                  <p className="text-sm text-content-muted">
                    {totalRounds === 1
                      ? pointsDelta > 0
                        ? `Has superado la practica de ${quizSubtitle.toLowerCase()}`
                        : `Has completado la practica de ${quizSubtitle.toLowerCase()}`
                      : pointsDelta > 0
                        ? `Has superado los ${totalRounds} ejercicios`
                        : `Has completado los ${totalRounds} ejercicios`}
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClose}
                  className="mt-2 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface-secondary px-6 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary"
                >
                  Cerrar
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
              </motion.div>
              ))}

            {state.step === "summary" &&
              (totalRounds === 1 ? (
                <KanjiPracticeResult
                  success={finalScore === 100}
                  score={finalScore}
                  quizTypeLabel={quizSubtitle}
                  label={label}
                  pointsDelta={pointsDelta}
                  error={error}
                  updatedPoints={updatedPoints}
                  onRetry={handleRetry}
                  onClose={handleClose}
                />
              ) : (
              <QuizMultiRoundSummary
                roundResults={roundResults}
                label={label}
                sessionType={sessionType}
                totalRounds={totalRounds}
                updatedPoints={updatedPoints}
                pointsDelta={pointsDelta}
                submitError={error}
                onRetry={handleRetry}
                onClose={handleClose}
              />
              ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function RoundDots({
  roundResults,
  currentRound,
  total,
}: {
  roundResults: KanjiQuizRoundResult[];
  currentRound: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const roundIndex = i + 1;
        const result = roundResults[i];
        const isDone = !!result;
        const isCurrent = !isDone && roundIndex === currentRound;
        const isPerfect = isDone && result.score === 100;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.05,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className={[
              "rounded-full flex items-center justify-center transition-all duration-300",
              isDone
                ? isPerfect
                  ? "w-6 h-6 bg-emerald-400 shadow-md shadow-emerald-400/30"
                  : "w-6 h-6 bg-white/70"
                : isCurrent
                  ? "w-6 h-6 bg-white/90 ring-2 ring-white/40 ring-offset-1 ring-offset-transparent"
                  : "w-4 h-4 bg-white/25",
            ].join(" ")}
          >
            {isDone && (
              <svg
                className={`w-3 h-3 ${isPerfect ? "text-white" : "text-accent"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {isCurrent && (
              <span className="w-2 h-2 rounded-full bg-accent block" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function QuizProgress({
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
      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <p className="text-[10px] text-content-muted font-medium text-center">
        Pregunta{" "}
        <span className="text-accent font-bold">
          {Math.min(current + 1, total)}
        </span>{" "}
        de {total}
      </p>
    </div>
  );
}

function QuizMultiRoundSummary({
  roundResults,
  label,
  sessionType,
  totalRounds,
  updatedPoints,
  pointsDelta,
  submitError,
  onRetry,
  onClose,
}: {
  roundResults: KanjiQuizRoundResult[];
  label?: string;
  sessionType: KanjiQuizType | "mixed";
  totalRounds: number;
  updatedPoints: number | null;
  pointsDelta: number;
  submitError: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  const earnedPoints = pointsDelta > 0 && updatedPoints !== null;
  const perfectRounds = roundResults.filter((result) => result.score === 100).length;
  const resultTypes = sessionType === "mixed" ? QUIZ_ROUND_ORDER : [sessionType];
  const quizTypeLabel = sessionType === "mixed" ? "Quiz completo" : QUIZ_TYPE_LABELS[sessionType];

  const overallScore =
    roundResults.length > 0
      ? Math.round(
          roundResults.reduce((sum, r) => sum + r.score, 0) /
            roundResults.length,
        )
      : 0;
  const accentStyle = {
    backgroundColor: "var(--accent-subtle)",
    borderColor: "var(--accent-muted)",
    color: "var(--accent)",
  };
  const scoreStyle = overallScore >= 70 ? { color: "var(--accent)" } : undefined;
  const statusClass = "text-content-primary";
  const statusLabel = overallScore >= 70 ? "Buen intento" : "Intentalo de nuevo";
  const subtitle =
    totalRounds === 1
      ? `Este intento evalua ${quizTypeLabel.toLowerCase()}. Necesitas 100 para cerrarlo perfecto.`
      : `El intento se cerro en el primer error. Para completar${label ? ` ${label}` : " este kanji"} con todos los ejercicios debes repetir el quiz completo.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 py-4"
    >
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <p className="text-3xl font-black text-content-primary">
              Resumen del intento
            </p>
            <p className="text-sm leading-6 text-content-secondary">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border-subtle pt-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
                Resultado
              </p>
              <p
                className="mt-1 text-4xl font-black text-content-primary"
                style={scoreStyle}
              >
                {overallScore}
                <span className="ml-1 text-base font-semibold text-content-muted">
                  /100
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
                Estado
              </p>
              <p className={`mt-1 text-sm font-bold ${statusClass}`}>
                {statusLabel}
              </p>
              <p className="mt-1 text-sm text-content-secondary">
                {perfectRounds} de {resultTypes.length} rondas perfectas
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
            {resultTypes.map((type, i) => {
              const result = roundResults.find((r) => r.type === type);
              return (
                <RoundResultCard
                  key={type}
                  type={type}
                  score={result?.score ?? null}
                  delay={0.12 + i * 0.05}
                />
              );
            })}
          </div>

          {earnedPoints && (
            <div
              className="flex items-center gap-2.5 rounded-2xl border px-4 py-3"
              style={accentStyle}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-hover text-white shadow-lg shadow-accent/15">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2m0 14v2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                  +{pointsDelta} puntos obtenidos
                </p>
                <p className="text-xs text-content-secondary">
                  Total actual: {updatedPoints} pts
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-xs text-content-secondary">
              No se pudo guardar algun resultado: {submitError}
            </p>
          )}

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <button
              onClick={onRetry}
              className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-3 text-sm font-black text-content-inverted shadow-lg shadow-accent/15 transition hover:shadow-xl hover:shadow-accent/20"
            >
              Repetir quiz
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary sm:min-w-32"
            >
              Cerrar
            </button>
          </div>
        </div>
    </motion.div>
  );
}

function RoundResultCard({
  type,
  score,
  delay,
}: {
  type: KanjiQuizType;
  score: number | null;
  delay: number;
}) {
  const isPerfect = score === 100;
  const isDone = score !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 220, damping: 18 }}
      className={[
        "flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all",
        isPerfect
          ? "bg-surface-primary"
          : isDone
            ? "bg-surface-secondary border-border-subtle"
            : "bg-surface-tertiary border-border-subtle opacity-40",
      ].join(" ")}
      style={
        isPerfect
          ? {
              borderColor: "var(--accent-muted)",
              background:
                "linear-gradient(135deg, var(--accent-subtle), transparent 72%)",
            }
          : undefined
      }
    >
      <span
        className={`text-[10px] font-bold uppercase tracking-wider ${isPerfect ? "" : "text-content-muted"}`}
        style={isPerfect ? { color: "var(--accent)" } : undefined}
      >
        {QUIZ_TYPE_LABELS[type]}
      </span>
      {isDone ? (
        <span
          className="text-xl font-extrabold text-content-primary"
          style={isPerfect ? { color: "var(--accent)" } : undefined}
        >
          {score}%
        </span>
      ) : (
        <span className="text-xl font-extrabold text-content-muted">—</span>
      )}
      <span className="text-[11px] text-content-muted">
        {isPerfect ? "Perfecta" : isDone ? "Por mejorar" : "Pendiente"}
      </span>
    </motion.div>
  );
}

function KanjiPracticeResult({
  success,
  score,
  quizTypeLabel,
  label,
  pointsDelta,
  updatedPoints,
  error,
  onRetry,
  onClose,
}: {
  success: boolean;
  score: number;
  quizTypeLabel: string;
  label?: string;
  pointsDelta: number;
  updatedPoints: number | null;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  const scoreStyle = success ? { color: "var(--accent)" } : undefined;
  const title = success ? "Practica completada" : "Practica incompleta";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 py-4"
    >
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <p
              className="text-3xl font-black text-content-primary"
              style={scoreStyle}
            >
              {title}
            </p>
            <p className="text-sm leading-6 text-content-secondary">
              {label
                ? `Terminaste la practica de ${quizTypeLabel.toLowerCase()} para ${label}.`
                : `Terminaste la practica de ${quizTypeLabel.toLowerCase()}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border-subtle pt-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
                Resultado
              </p>
              <p
                className="mt-1 text-4xl font-black text-content-primary"
                style={scoreStyle}
              >
                {score}
                <span className="ml-1 text-base font-semibold text-content-muted">
                  /100
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
                Estado
              </p>
              <p
                className="mt-1 text-sm font-bold text-content-primary"
                style={scoreStyle}
              >
                {success ? "Aprobada" : "Requiere reintento"}
              </p>
              <p className="mt-1 text-sm text-content-secondary">
                {pointsDelta > 0 ? `+${pointsDelta} puntos` : "Sin bonus en este intento"}
              </p>
              {updatedPoints !== null && (
                <p className="mt-1 text-xs text-content-muted">
                  Total actual: {updatedPoints} pts
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <button
              onClick={onRetry}
              className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-3 text-sm font-black text-content-inverted shadow-lg shadow-accent/15 transition hover:shadow-xl hover:shadow-accent/20"
            >
              Practicar otra vez
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary sm:min-w-32"
            >
              Cerrar
            </button>
          </div>
        </div>

      {error && (
        <p className="text-center text-xs text-content-secondary">
          No se pudo sincronizar todo el resultado: {error}
        </p>
      )}
    </motion.div>
  );
}