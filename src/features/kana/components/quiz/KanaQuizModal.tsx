"use client";

import { useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKanaQuiz } from "@/features/kana/hooks/useKanaQuiz";
import { isValidCanvasQuestion } from "@/features/kana/utils/quizParser";
import { MASTERY_THRESHOLDS } from "@/features/mastery/constants/masteryConfig";
import {
  KANA_QUIZ_TYPE_LABELS,
} from "@/features/kana/types/quiz";
import type {
  KanaQuizRoundResult,
  KanaQuizType,
} from "@/features/kana/types/quiz";
import {
  KanaFromKanaExercise,
  KanaFromRomajiExercise,
} from "./KanaQuizExercises";
import { KanaQuizCanvasExercise } from "./KanaQuizCanvasExercise";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";

const KANA_COMPLETION_REWARD = 5;

export type KanaQuizCompletionResult = {
  score: number;
  newlyCompleted: boolean;
  newlyCompletedPoints: number;
  dominated: boolean;
  triggeredModuleMastery: boolean;
};

export interface KanaQuizModalProps {
  kanaId: string;
  label?: string;
  kanaType?: "hiragana" | "katakana";
  quizType?: KanaQuizType;
  currentModulePoints: number;
  wasCompletedBefore?: boolean;
  onClose: (result?: KanaQuizCompletionResult) => void;
  onComplete?: (result: KanaQuizCompletionResult) => void;
}

export function KanaQuizModal({
  kanaId,
  label,
  kanaType,
  quizType,
  currentModulePoints,
  wasCompletedBefore = false,
  onClose,
  onComplete,
}: KanaQuizModalProps) {
  const quiz = useKanaQuiz();
  const platformMotion = usePlatformMotion();
  const autoClosedForMasteryRef = useRef(false);

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
    quiz.startQuiz(kanaId, { kanaType, label, quizType });
    return () => quiz.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanaId, kanaType, quizType]);

  const handleRetry = useCallback(() => {
    quiz.reset();
    quiz.startQuiz(kanaId, { kanaType, label, quizType });
  }, [quiz, kanaId, kanaType, label, quizType]);

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
    submitError,
    pointsDelta,
    reachedMasteryThisAttempt,
    roundResults,
  } = quiz;

  const isPracticeSession = quiz.totalRounds === 1;
  const isMixedCompletion = quiz.totalRounds > 1;
  const isNewlyCompleted =
    !wasCompletedBefore && isMixedCompletion && finalScore === 100;
  const isDominated =
    wasCompletedBefore && isMixedCompletion && state.step === "celebration";
  const moduleMasteryThreshold = kanaType ? MASTERY_THRESHOLDS[kanaType] : null;
  const triggeredModuleMastery =
    isNewlyCompleted &&
    moduleMasteryThreshold !== null &&
    currentModulePoints + KANA_COMPLETION_REWARD >= moduleMasteryThreshold;
  const displayPointsDelta = isPracticeSession
    ? 0
    : isNewlyCompleted
      ? Math.max(pointsDelta, KANA_COMPLETION_REWARD)
      : pointsDelta;
  const shouldHidePointsDelta = isPracticeSession || reachedMasteryThisAttempt;

  const handleClose = useCallback(() => {
    const completionResult: KanaQuizCompletionResult | undefined =
      quiz.state.step === "summary" || quiz.state.step === "celebration"
        ? {
            score: quiz.finalScore,
            newlyCompleted: isNewlyCompleted,
            newlyCompletedPoints: isNewlyCompleted ? KANA_COMPLETION_REWARD : 0,
            dominated: isDominated,
            triggeredModuleMastery,
          }
        : undefined;

    if (
      (quiz.state.step === "summary" || quiz.state.step === "celebration") &&
      onComplete &&
      completionResult
    ) {
      onComplete(completionResult);
    }
    onClose(completionResult);
  }, [isDominated, isNewlyCompleted, onClose, onComplete, quiz, triggeredModuleMastery]);

  const shouldAutoCloseForMastery =
    triggeredModuleMastery &&
    (state.step === "summary" || state.step === "celebration");

  useEffect(() => {
    if (!shouldAutoCloseForMastery) {
      autoClosedForMasteryRef.current = false;
      return;
    }

    if (autoClosedForMasteryRef.current) return;
    autoClosedForMasteryRef.current = true;
    handleClose();
  }, [handleClose, shouldAutoCloseForMastery]);

  const kanaTypeLabel = kanaType === "katakana" ? "Katakana" : "Hiragana";
  const mastered = useMasteredModules();
  const isMastered = kanaType ? mastered.has(kanaType) : false;

  const strokeAccentColor = isMastered
    ? "#D4A843"
    : kanaType === "katakana"
      ? "#1B5078"
      : "#7B3F8A";

  const kanaAccentVars: React.CSSProperties = useMemo(
    () =>
      isMastered
        ? ({
            "--accent": "#D4A843",
            "--accent-hover": "#F0D27A",
            "--accent-subtle": "rgba(212,168,67,0.1)",
            "--accent-muted": "rgba(212,168,67,0.06)",
            "--accent-glow": "rgba(212,168,67,0.52)",
          } as React.CSSProperties)
        : kanaType === "katakana"
          ? ({
              "--accent": "#1B5078",
              "--accent-hover": "#2E82B5",
              "--accent-subtle": "rgba(27,80,120,0.1)",
              "--accent-muted": "rgba(27,80,120,0.06)",
              "--accent-glow": "rgba(27,80,120,0.52)",
            } as React.CSSProperties)
          : ({
              "--accent": "#7B3F8A",
              "--accent-hover": "#A866B5",
              "--accent-subtle": "rgba(123,63,138,0.1)",
              "--accent-muted": "rgba(123,63,138,0.06)",
              "--accent-glow": "rgba(123,63,138,0.52)",
            } as React.CSSProperties),
    [isMastered, kanaType],
  );
  const currentQuestionType = currentQuestion?.type ?? quizData?.type ?? quiz.sessionType;
  const quizTypeLabel = currentQuestionType
    ? KANA_QUIZ_TYPE_LABELS[currentQuestionType]
    : "Quiz";
  const completedQuestions = state.questionResults.length;
  const isCurrentCanvasQuestion = currentQuestion?.type === "canvas";
  const isCurrentAnswerCorrect =
    state.selectedOptionIndex !== null
      ? (currentQuestion?.options?.[state.selectedOptionIndex]?.correct ?? false)
      : false;

  if (shouldAutoCloseForMastery) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="kana-quiz-overlay"
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
          style={kanaAccentVars}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="shrink-0 rounded-t-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent to-accent-hover px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-content-inverted leading-tight">
                    Quiz de {kanaTypeLabel}
                  </h2>
                  <p className="text-xs text-white/70 font-medium">
                    {quizTypeLabel}
                  </p>
                </div>
              </div>

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

            {(state.step === "exercise" ||
              state.step === "exercise-feedback") &&
              quizData && (
                <div className="bg-surface-primary border-b border-border-subtle px-5 py-2.5">
                  <QuizProgress
                    current={completedQuestions}
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
                  {roundResults.length >= quiz.totalRounds
                    ? "Guardando resultado..."
                    : roundResults.length > 0
                      ? "Cargando siguiente ejercicio..."
                      : "Preparando quiz..."}
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
                  Guardando resultado...
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
                <div className="w-14 h-14 rounded-2xl bg-red-500/12 ring-1 ring-red-500/20 flex items-center justify-center shadow-[0_10px_30px_rgba(185,28,28,0.16)]">
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
                </div>

                <div className="text-center space-y-1.5">
                  <p className="text-sm font-semibold text-red-300">
                    Ocurrió un error
                  </p>
                  <p className="text-content-muted text-xs max-w-[300px] leading-relaxed">
                    {error}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition bg-red-500/12 text-red-300 ring-1 ring-red-500/18 hover:bg-red-500/20"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-surface-secondary hover:bg-surface-tertiary rounded-xl text-sm font-semibold text-content-secondary transition"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            )}

            {(state.step === "exercise" ||
              state.step === "exercise-feedback") &&
              quizData &&
              currentQuestion && (
                <AnimatePresence mode="wait">
                  <div key={`q-${state.currentQuestionIndex}`}>
                    {currentQuestion.type === "from_kana" && (
                      <KanaFromKanaExercise
                        question={currentQuestion}
                        selectedIndex={state.selectedOptionIndex}
                        revealed={state.isAnswered}
                        onSelect={quiz.selectOption}
                        onConfirm={quiz.confirmAnswer}
                      />
                    )}

                    {currentQuestion.type === "from_romaji" && (
                      <KanaFromRomajiExercise
                        question={currentQuestion}
                        selectedIndex={state.selectedOptionIndex}
                        revealed={state.isAnswered}
                        onSelect={quiz.selectOption}
                        onConfirm={quiz.confirmAnswer}
                      />
                    )}

                    {currentQuestion.type === "canvas" &&
                      isValidCanvasQuestion(currentQuestion) && (
                        <KanaQuizCanvasExercise
                          question={currentQuestion}
                          questionIndex={state.currentQuestionIndex}
                          totalQuestions={totalQuestions}
                          phase={state.canvasPhase}
                          onPhaseChange={quiz.setCanvasPhase}
                          onComplete={quiz.completeCanvasQuestion}
                          accentColor={strokeAccentColor}
                        />
                      )}

                    {currentQuestion.type === "canvas" &&
                      !isValidCanvasQuestion(currentQuestion) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center py-12 gap-4"
                        >
                          <p className="text-content-tertiary text-sm text-center">
                            Datos de trazos no disponibles para{" "}
                            <strong>
                              {currentQuestion.symbol ||
                                currentQuestion.romaji}
                            </strong>
                            .
                          </p>
                          <button
                            onClick={() => quiz.completeCanvasQuestion(0)}
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
              !isCurrentCanvasQuestion && (
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
                        ? "Finalizar"
                        : "Siguiente"
                      : "Ver resumen"}
                  </motion.button>
                </motion.div>
              )}

            {state.step === "celebration" &&
              (quiz.totalRounds === 1 ? (
                <KanaPracticeResult
                  success
                  score={finalScore}
                  quizTypeLabel={quizTypeLabel}
                  kanaTypeLabel={kanaTypeLabel}
                  pointsDelta={displayPointsDelta}
                  error={submitError}
                  hidePointsDelta={shouldHidePointsDelta}
                  isDominated={isDominated}
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
                    transition={{
                      duration: 0.55,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover"
                    style={{ boxShadow: "0 0 48px var(--accent-glow, rgba(186,72,66,0.52))" }}
                  >
                    <span className="text-5xl font-bold text-white select-none">
                      {label || "あ"}
                    </span>
                  </motion.div>
                </div>

                {!shouldHidePointsDelta && displayPointsDelta > 0 && !isDominated && (
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
                      +{displayPointsDelta}
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
                    {isDominated ? `¡Dominaste este ${kanaTypeLabel.toLowerCase()}!` : "¡Ejercicio completado!"}
                  </p>
                  <p className="text-sm text-content-muted">
                    {isDominated
                      ? `Resolviste este ${kanaTypeLabel.toLowerCase()} con dominio total.`
                      : `Has completado este ejercicio de ${kanaTypeLabel.toLowerCase()}`}
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
              (quiz.totalRounds === 1 ? (
                <KanaPracticeResult
                  success={finalScore === 100}
                  score={finalScore}
                  quizTypeLabel={quizTypeLabel}
                  kanaTypeLabel={kanaTypeLabel}
                  pointsDelta={displayPointsDelta}
                  error={submitError}
                  hidePointsDelta={shouldHidePointsDelta}
                  isDominated={isDominated}
                  onRetry={handleRetry}
                  onClose={handleClose}
                />
              ) : (
              <KanaQuizSummary
                score={finalScore}
                roundResults={roundResults}
                pointsDelta={displayPointsDelta}
                error={submitError}
                kanaTypeLabel={kanaTypeLabel}
                sessionType={quiz.sessionType}
                totalRounds={quiz.totalRounds}
                hidePointsDelta={shouldHidePointsDelta}
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

function KanaQuizSummary({
  score,
  roundResults,
  pointsDelta,
  error,
  kanaTypeLabel,
  sessionType,
  totalRounds,
  hidePointsDelta = false,
  onRetry,
  onClose,
}: {
  score: number;
  roundResults: KanaQuizRoundResult[];
  pointsDelta: number;
  error: string | null;
  kanaTypeLabel: string;
  sessionType: KanaQuizType | "mixed";
  totalRounds: number;
  hidePointsDelta?: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  const perfectRounds = roundResults.filter((result) => result.score === 100).length;
  const resultTypes =
    sessionType === "mixed"
      ? (["from_kana", "from_romaji", "canvas"] as KanaQuizType[])
      : [sessionType];
  const quizTypeLabel = KANA_QUIZ_TYPE_LABELS[sessionType];
  const accentStyle = {
    backgroundColor: "var(--accent-subtle)",
    borderColor: "var(--accent-muted)",
    color: "var(--accent)",
  };
  const scoreStyle = score >= 70 ? { color: "var(--accent)" } : undefined;
  const statusClass = "text-content-primary";
  const statusLabel = score >= 70 ? "Buen intento" : "Intentalo de nuevo";
  const subtitle =
    totalRounds === 1
      ? `Este intento evalua ${quizTypeLabel.toLowerCase()} de ${kanaTypeLabel.toLowerCase()}. Necesitas 100 para cerrarlo perfecto.`
      : `El intento se cerro en el primer error. Para completar ${kanaTypeLabel.toLowerCase()} con todos los ejercicios debes repetir el quiz completo.`;

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
              <p className={`mt-1 text-sm font-bold ${statusClass}`}>
                {statusLabel}
              </p>
              <p className="mt-1 text-sm text-content-secondary">
                {perfectRounds} de {resultTypes.length} rondas perfectas
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3">
            {resultTypes.map((type, index) => {
              const result = roundResults.find((round) => round.type === type);
              return (
                <KanaRoundResultCard
                  key={type}
                  type={type}
                  score={result?.score ?? null}
                  delay={0.12 + index * 0.05}
                />
              );
            })}
          </div>

          {!hidePointsDelta && pointsDelta > 0 && (
            <div
              className="flex items-center gap-2.5 rounded-2xl border px-4 py-3"
              style={accentStyle}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-hover text-white shadow-lg shadow-accent/15">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.4}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-12V4m0 16v-2"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                  +{pointsDelta} puntos en este intento
                </p>
                <p className="text-xs text-content-secondary">
                  Sigues avanzando. Otro intento y lo cierras mejor.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-content-secondary">
              No se pudo guardar el resultado: {error}
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
    </motion.div>
  );
}

function KanaRoundResultCard({
  type,
  score,
  delay,
}: {
  type: KanaQuizType;
  score: number | null;
  delay: number;
}) {
  const isPerfect = score === 100;
  const isDone = score !== null;
  const scoreColor =
    score === null
      ? "text-content-muted"
      : score >= 70
        ? "text-content-primary"
          : "text-content-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 220, damping: 18 }}
      className={[
        "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 transition-all",
        isPerfect
          ? "bg-surface-primary"
          : isDone
            ? "border-border-subtle bg-surface-secondary"
            : "border-border-subtle bg-surface-tertiary opacity-50",
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
        {KANA_QUIZ_TYPE_LABELS[type]}
      </span>
      {isDone ? (
        <span
          className={`text-xl font-extrabold ${isPerfect ? "" : scoreColor}`}
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

function KanaPracticeResult({
  success,
  score,
  quizTypeLabel,
  kanaTypeLabel,
  pointsDelta: _pointsDelta,
  error,
  hidePointsDelta: _hidePointsDelta = false,
  isDominated = false,
  onRetry,
  onClose,
}: {
  success: boolean;
  score: number;
  quizTypeLabel: string;
  kanaTypeLabel: string;
  pointsDelta: number;
  error: string | null;
  hidePointsDelta?: boolean;
  isDominated?: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  const scoreStyle = success ? { color: "var(--accent)" } : undefined;

  const title = isDominated
    ? `${kanaTypeLabel} dominado`
    : success
      ? "Practica completada"
      : "Practica incompleta";
  const subtitle = isDominated
    ? `Este ${kanaTypeLabel.toLowerCase()} ya es tuyo. Cerraste ${quizTypeLabel.toLowerCase()} con control total.`
    : success
      ? `Cerraste ${quizTypeLabel.toLowerCase()} de ${kanaTypeLabel.toLowerCase()} con precision.`
      : `Te falto cerrar ${quizTypeLabel.toLowerCase()} de ${kanaTypeLabel.toLowerCase()} en 100.`;

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
                {isDominated
                  ? "Dominado"
                  : success
                    ? "Aprobada"
                    : "Reintento recomendado"}
              </p>
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