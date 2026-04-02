"use client";

import { useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKanjiQuiz } from "@/features/kanji/hooks/useKanjiQuiz";
import { quizQuestionToLessonQuestion, isValidWritingQuestion } from "@/features/kanji/utils/quizParser";
import { QUIZ_TYPE_LABELS, QUIZ_ROUND_ORDER, QUIZ_TOTAL_ROUNDS } from "@/features/kanji/types/quiz";
import type { KanjiQuizRoundResult, KanjiQuizType } from "@/features/kanji/types/quiz";
import { KanjiMeaningExercise } from "@/features/kanji/components/lesson-flow/KanjiMeaningExercise";
import { KanjiSelectionExercise } from "@/features/kanji/components/lesson-flow/KanjiSelectionExercise";
import { KanjiReadingExercise } from "@/features/kanji/components/lesson-flow/KanjiReadingExercise";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { KanjiQuizWritingExercise } from "./KanjiQuizWritingExercise";

export interface KanjiQuizModalProps {
  kanjiId: string;
  label?: string;
  onClose: () => void;
  onComplete?: (score: number, updatedPoints: number | null) => void;
}

export function KanjiQuizModal({
  kanjiId,
  label,
  onClose,
  onComplete,
}: KanjiQuizModalProps) {
  const quiz = useKanjiQuiz();
  const platformMotion = usePlatformMotion();

  const overlayVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: platformMotion.shouldUseLightAnimations ? 0.18 : 0.24 } },
      exit: { opacity: 0, transition: { duration: platformMotion.shouldUseLightAnimations ? 0.14 : 0.18 } },
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
        transition: { duration: platformMotion.shouldUseLightAnimations ? 0.16 : 0.2 },
      },
    }),
    [platformMotion.shouldUseLightAnimations],
  );

  useEffect(() => {
    quiz.startQuiz(kanjiId);
    return () => quiz.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanjiId]);

  const handleRetry = useCallback(() => {
    quiz.reset();
    quiz.startQuiz(kanjiId);
  }, [quiz, kanjiId]);

  const handleClose = useCallback(() => {
    if ((quiz.state.step === "summary" || quiz.state.step === "celebration") && onComplete) {
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
    loading,
    error,
    submitting,
    isPointsError,
    updatedPoints,
    pointsDelta,
    roundResults,
    currentRound,
  } = quiz;

  const isTransitioning = state.step === "submitting" || (state.step === "loading" && roundResults.length > 0);

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
            (state.step === "summary" || state.step === "celebration") ? "max-w-2xl" : "max-w-lg",
            "rounded-3xl max-h-[95dvh]",
            "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-2rem)]",
            "max-sm:max-h-[92dvh] max-sm:rounded-3xl",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="shrink-0 rounded-t-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent to-accent-hover px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-primary/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-bold text-content-inverted select-none">
                    {label || "漢"}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-content-inverted leading-tight">
                    Quiz de Kanji
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Round dots */}
                {state.step !== "summary" && state.step !== "error" && (
                  <RoundDots
                    roundResults={roundResults}
                    currentRound={currentRound}
                    total={QUIZ_TOTAL_ROUNDS}
                  />
                )}

                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl bg-surface-primary/15 hover:bg-surface-primary/25 text-content-inverted flex items-center justify-center transition"
                  aria-label="Cerrar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Per-question progress bar (within a round) */}
            {(state.step === "exercise" || state.step === "exercise-feedback") && quizData && (
              <div className="bg-surface-primary border-b border-border-subtle px-5 py-2.5">
                <QuizProgress
                  current={quizData.type === "writing" ? state.writingQuestionIndex : state.questionResults.length}
                  total={totalQuestions}
                  progress={overallProgress}
                />
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto kanji-detail-scroll p-5 sm:p-6">

            {/* LOADING / TRANSITIONING */}
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
                  {roundResults.length > 0 ? `Ejercicio ${roundResults.length + 1} de ${QUIZ_TOTAL_ROUNDS}…` : "Preparando quiz…"}
                </p>
              </motion.div>
            )}

            {/* SUBMITTING / TRANSITIONING */}
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
                  {roundResults.length < QUIZ_TOTAL_ROUNDS - 1 ? "Guardando y preparando siguiente…" : "Guardando resultado…"}
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
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isPointsError
                    ? "bg-amber-50 dark:bg-amber-950/30"
                    : "bg-red-50 dark:bg-red-950/30"
                }`}>
                  {isPointsError ? (
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <p className={`text-sm font-semibold ${isPointsError ? "text-amber-600 dark:text-amber-400" : "text-content-tertiary"}`}>
                    {isPointsError ? "Puntos insuficientes" : "Error"}
                  </p>
                  <p className="text-content-muted text-xs max-w-[280px]">{error}</p>
                </div>

                <div className="flex gap-2">
                  {!isPointsError && (
                    <button
                      onClick={handleRetry}
                      className="px-5 py-2.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl text-sm font-semibold transition"
                    >
                      Reintentar
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-surface-tertiary rounded-xl text-sm font-semibold transition"
                  >
                    {isPointsError ? "Entendido" : "Cerrar"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* EXERCISES */}
            {(state.step === "exercise" || state.step === "exercise-feedback") && quizData && currentQuestion && (
              <AnimatePresence mode="wait">
                <div key={`q-${state.currentQuestionIndex}-${state.writingQuestionIndex}`}>
                  {quizData.type === "kanji" && (
                    <KanjiMeaningExercise
                      question={quizQuestionToLessonQuestion(currentQuestion, "kanji")}
                      selectedIndex={state.selectedOptionIndex}
                      revealed={state.isAnswered}
                      onSelect={quiz.selectOption}
                      onConfirm={quiz.confirmAnswer}
                    />
                  )}

                  {quizData.type === "meaning" && (
                    <KanjiSelectionExercise
                      question={quizQuestionToLessonQuestion(currentQuestion, "meaning")}
                      selectedIndex={state.selectedOptionIndex}
                      revealed={state.isAnswered}
                      onSelect={quiz.selectOption}
                      onConfirm={quiz.confirmAnswer}
                    />
                  )}

                  {quizData.type === "reading" && (
                    <KanjiReadingExercise
                      question={quizQuestionToLessonQuestion(currentQuestion, "reading")}
                      selectedIndex={state.selectedOptionIndex}
                      revealed={state.isAnswered}
                      onSelect={quiz.selectOption}
                      onConfirm={quiz.confirmAnswer}
                    />
                  )}

                  {quizData.type === "writing" && isValidWritingQuestion(currentQuestion) && (
                    <KanjiQuizWritingExercise
                      question={currentQuestion}
                      questionIndex={state.writingQuestionIndex}
                      totalWritingQuestions={totalQuestions}
                      phase={state.writingPhase}
                      onPhaseChange={quiz.setWritingPhase}
                      onComplete={quiz.completeWritingQuestion}
                    />
                  )}

                  {quizData.type === "writing" && !isValidWritingQuestion(currentQuestion) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center py-12 gap-4"
                    >
                      <p className="text-content-tertiary text-sm text-center">
                        Datos de trazos no disponibles para <strong>{currentQuestion.kanji}</strong>.
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

            {/* Next button after feedback */}
            {state.step === "exercise-feedback" && quizData && quizData.type !== "writing" && (
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
                  {state.questionResults.length + 1 >= totalQuestions
                    ? "Finalizar ejercicio"
                    : "Siguiente"}
                </motion.button>
              </motion.div>
            )}

            {/* PERFECT COMPLETION — the only success screen shown before close */}
            {state.step === "celebration" && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-8 gap-6 text-center"
              >
                {/* Kanji burst */}
                <div className="relative">
                  <div className="kanji-celebration-halo absolute inset-[-24px] rounded-full" />
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                    className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover shadow-[0_0_48px_rgba(186,72,66,0.52)]"
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
                    transition={{ delay: 0.32, duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2 shadow-lg shadow-accent/30"
                  >
                    <span className="text-xl font-black text-white">+{pointsDelta}</span>
                    <span className="text-sm font-semibold text-white/80">puntos ganados</span>
                  </motion.div>
                )}

                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.44, duration: 0.38 }}
                  className="space-y-1.5"
                >
                  <p className="text-2xl font-black text-content-primary">¡Kanji completado!</p>
                  <p className="text-sm text-content-muted">
                    {pointsDelta > 0 ? "Has superado los 4 ejercicios" : "Has completado los 4 ejercicios"}
                  </p>
                </motion.div>

                {/* CTA */}
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
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            )}

            {/* FINAL SUMMARY — only for non-perfect runs */}
            {state.step === "summary" && (
              <QuizMultiRoundSummary
                roundResults={roundResults}
                updatedPoints={updatedPoints}
                pointsDelta={pointsDelta}
                submitError={error}
                onRetry={handleRetry}
                onClose={handleClose}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Round Dots ── */
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
            transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 20 }}
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
              <svg className={`w-3 h-3 ${isPerfect ? "text-white" : "text-accent"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

/* ── Per-question Progress Bar ── */
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
        Pregunta <span className="text-accent font-bold">{Math.min(current + 1, total)}</span> de {total}
      </p>
    </div>
  );
}

/* ── Multi-round Final Summary ── */
function QuizMultiRoundSummary({
  roundResults,
  updatedPoints,
  pointsDelta,
  submitError,
  onRetry,
  onClose,
}: {
  roundResults: KanjiQuizRoundResult[];
  updatedPoints: number | null;
  pointsDelta: number;
  submitError: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  const earnedPoints = pointsDelta > 0 && updatedPoints !== null;

  const overallScore = roundResults.length > 0
    ? Math.round(roundResults.reduce((sum, r) => sum + r.score, 0) / roundResults.length)
    : 0;

  const grade = (() => {
    if (overallScore >= 90) return { label: "¡Excelente!", color: "text-emerald-400", glow: "rgba(52,211,153,0.35)" };
    if (overallScore >= 70) return { label: "¡Bien hecho!", color: "text-blue-400", glow: "rgba(96,165,250,0.35)" };
    if (overallScore >= 50) return { label: "Aceptable", color: "text-amber-400", glow: "rgba(251,191,36,0.35)" };
    return { label: "Sigue practicando", color: "text-orange-400", glow: "rgba(251,146,60,0.35)" };
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6 py-2 w-full"
    >
      {/* ── Overall score ring ── */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
        className="relative mt-2"
      >
        <div
          className="absolute inset-[-12px] rounded-full blur-2xl opacity-60"
          style={{ background: `radial-gradient(circle, ${grade.glow}, transparent 70%)` }}
        />
        <div className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center">
          <svg className="absolute inset-0 w-32 h-32 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="var(--border-primary)" strokeWidth="7" />
            <motion.circle
              cx="64" cy="64" r="56" fill="none"
              stroke={overallScore >= 70 ? "#10b981" : overallScore >= 50 ? "#f59e0b" : "var(--accent)"}
              strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - overallScore / 100) }}
              transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-4xl font-extrabold text-content-primary"
          >
            {overallScore}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[10px] text-content-muted font-semibold -mt-0.5"
          >
            / 100
          </motion.span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h3 className={`text-2xl font-extrabold mb-1 ${grade.color}`}>{grade.label}</h3>
        <p className="text-sm text-content-tertiary">
          {QUIZ_TOTAL_ROUNDS} ejercicios completados
        </p>
      </motion.div>

      {/* ── Per-round breakdown ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {QUIZ_ROUND_ORDER.map((type, i) => {
          const result = roundResults.find((r) => r.type === type);
          return (
            <RoundResultCard
              key={type}
              type={type}
              score={result?.score ?? null}
              delay={0.55 + i * 0.07}
            />
          );
        })}
      </motion.div>

      {/* Points earned badge */}
      {earnedPoints && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.75, type: "spring", stiffness: 200, damping: 14 }}
          className="flex items-center gap-2.5 px-5 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-400">+{pointsDelta} puntos obtenidos</p>
            <p className="text-xs text-emerald-400/70">Total: {updatedPoints} pts</p>
          </div>
        </motion.div>
      )}

      {submitError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-amber-500 text-center"
        >
          No se pudo guardar algún resultado: {submitError}
        </motion.p>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="flex flex-col w-full max-w-sm gap-2.5"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="w-full py-3.5 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold shadow-lg shadow-accent/15 hover:shadow-xl hover:shadow-accent/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Repetir quiz
        </motion.button>

        <button
          onClick={onClose}
          className="w-full py-3 bg-surface-secondary hover:bg-surface-tertiary rounded-2xl text-sm font-semibold text-content-secondary transition-all"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── Round Result Card ── */
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
          ? "bg-emerald-500/8 border-emerald-500/20"
          : isDone
            ? "bg-surface-secondary border-border-subtle"
            : "bg-surface-tertiary border-border-subtle opacity-40",
      ].join(" ")}
    >
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isPerfect ? "text-emerald-400" : "text-content-muted"}`}>
        {QUIZ_TYPE_LABELS[type]}
      </span>
      {isDone ? (
        <span className={`text-xl font-extrabold ${isPerfect ? "text-emerald-400" : score! >= 70 ? "text-blue-400" : score! >= 50 ? "text-amber-400" : "text-orange-400"}`}>
          {score}%
        </span>
      ) : (
        <span className="text-xl font-extrabold text-content-muted">—</span>
      )}
      {isPerfect && (
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
    </motion.div>
  );
}
