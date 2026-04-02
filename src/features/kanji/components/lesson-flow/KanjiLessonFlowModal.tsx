"use client";

import { useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Kanji } from "@/features/kanji/types";
import { getPrimaryMeaning } from "@/features/kanji/utils/kanjiText";
import { useKanjiLessonFlow } from "@/features/kanji/hooks/useKanjiLessonFlow";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { KanjiLessonProgress } from "./KanjiLessonProgress";
import { KanjiMeaningExercise } from "./KanjiMeaningExercise";
import { KanjiSelectionExercise } from "./KanjiSelectionExercise";
import { KanjiReadingExercise } from "./KanjiReadingExercise";
import { KanjiWritingExercise } from "./KanjiWritingExercise";
import { KanjiLessonResultSummary } from "./KanjiLessonResultSummary";

interface KanjiLessonFlowModalProps {
  kanji: Kanji;
  onClose: () => void;
}

export function KanjiLessonFlowModal({ kanji, onClose }: KanjiLessonFlowModalProps) {
  const lesson = useKanjiLessonFlow();
  const platformMotion = usePlatformMotion();
  const meaning = getPrimaryMeaning(kanji.meanings) || "";

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

  // Start lesson on mount
  useEffect(() => {
    lesson.startLesson(kanji);
    return () => lesson.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanji.id]);

  const handleRetry = useCallback(() => {
    lesson.reset();
    lesson.startLesson(kanji);
  }, [lesson, kanji]);

  const handleNextAfterFeedback = useCallback(() => {
    lesson.nextStep();
  }, [lesson]);

  const { state, flowData, currentExercise, totalExercises, overallProgress, loading, error } = lesson;
  const exerciseTypes = flowData?.exercises.map((e) => e.type) ?? [];

  return (
    <AnimatePresence>
      <motion.div
        key="lesson-flow-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "bg-surface-primary w-full shadow-2xl ring-1 ring-border-subtle flex flex-col",
            state.step === "summary" ? "max-w-2xl" : "max-w-lg",
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
                    {kanji.symbol}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-content-inverted leading-tight">
                    Lección de Kanji
                  </h2>
                  {meaning && (
                    <p className="text-xs text-white/70 font-medium">{meaning}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {loading && (
                  <span className="px-2.5 py-1 bg-surface-primary/20 backdrop-blur-sm text-content-inverted text-[10px] font-bold rounded-full animate-pulse">
                    Cargando…
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-surface-primary/15 hover:bg-surface-primary/25 text-content-inverted flex items-center justify-center transition"
                  aria-label="Cerrar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress bar (visible during exercises) */}
            {(state.step === "exercise" || state.step === "exercise-feedback") && flowData && (
              <div className="bg-surface-primary border-b border-border-subtle px-5 py-2.5">
                <KanjiLessonProgress
                  currentIndex={state.currentExerciseIndex}
                  totalExercises={totalExercises}
                  exerciseTypes={exerciseTypes}
                  overallProgress={overallProgress}
                />
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto kanji-detail-scroll p-5 sm:p-6">
            {/* LOADING */}
            {state.step === "loading" && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-border-subtle rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-accent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-content-muted font-medium">Preparando lección…</p>
              </motion.div>
            )}

            {/* ERROR */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-content-tertiary text-sm text-center">{error}</p>
                <div className="flex gap-2">
                  <button onClick={handleRetry} className="px-5 py-2.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-xl text-sm font-semibold transition">
                    Reintentar
                  </button>
                  <button onClick={onClose} className="px-5 py-2.5 bg-surface-tertiary rounded-xl text-sm font-semibold transition">
                    Cerrar
                  </button>
                </div>
              </motion.div>
            )}

            {/* INTRO */}
            {state.step === "intro" && flowData && (
              <LessonIntro
                symbol={flowData.symbol}
                meaning={meaning}
                totalExercises={totalExercises}
                onBegin={lesson.beginExercises}
              />
            )}

            {/* EXERCISES */}
            {(state.step === "exercise" || state.step === "exercise-feedback") && currentExercise && flowData && (
              <AnimatePresence mode="wait">
                <div key={`${state.currentExerciseIndex}-${state.currentQuestionIndex}`}>
                  {/* Choice-based exercises */}
                  {currentExercise.type === "meaning" && (
                    <KanjiMeaningExercise
                      question={currentExercise.questions[state.currentQuestionIndex]}
                      selectedIndex={state.selectedOptionIndex}
                      revealed={state.isAnswered}
                      onSelect={lesson.selectOption}
                      onConfirm={lesson.confirmAnswer}
                    />
                  )}

                  {currentExercise.type === "kanji_selection" && (
                    <KanjiSelectionExercise
                      question={currentExercise.questions[state.currentQuestionIndex]}
                      selectedIndex={state.selectedOptionIndex}
                      revealed={state.isAnswered}
                      onSelect={lesson.selectOption}
                      onConfirm={lesson.confirmAnswer}
                    />
                  )}

                  {currentExercise.type === "reading_meaning" && (
                    <KanjiReadingExercise
                      question={currentExercise.questions[state.currentQuestionIndex]}
                      selectedIndex={state.selectedOptionIndex}
                      revealed={state.isAnswered}
                      onSelect={lesson.selectOption}
                      onConfirm={lesson.confirmAnswer}
                    />
                  )}

                  {/* Writing exercise */}
                  {currentExercise.type === "writing" && flowData.strokeData && (
                    <KanjiWritingExercise
                      symbol={flowData.symbol}
                      meaning={meaning}
                      strokeData={flowData.strokeData}
                      phase={state.writingPhase}
                      onPhaseChange={lesson.setWritingPhase}
                      onComplete={lesson.completeWriting}
                    />
                  )}

                  {/* Writing fallback: no stroke data */}
                  {currentExercise.type === "writing" && !flowData.strokeData && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center py-12 gap-4"
                    >
                      <p className="text-content-tertiary text-sm text-center">
                        Datos de trazos no disponibles para este kanji.
                      </p>
                      <button
                        onClick={() => lesson.completeWriting(0)}
                        className="px-5 py-2.5 bg-surface-tertiary rounded-xl text-sm font-semibold transition"
                      >
                        Omitir escritura
                      </button>
                    </motion.div>
                  )}

                  {/* "Continue" button after feedback on choice exercises */}
                  {state.isAnswered && currentExercise.type !== "writing" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center mt-5"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextAfterFeedback}
                        className="px-8 py-3 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold shadow-lg shadow-accent/15 transition-all flex items-center gap-2"
                      >
                        Continuar
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            )}

            {/* SUMMARY */}
            {state.step === "summary" && (
              <KanjiLessonResultSummary
                symbol={flowData?.symbol ?? kanji.symbol}
                meaning={meaning}
                results={state.results}
                onRetry={handleRetry}
                onClose={onClose}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Intro sub-component ──
function LessonIntro({
  symbol,
  meaning,
  totalExercises,
  onBegin,
}: {
  symbol: string;
  meaning: string;
  totalExercises: number;
  onBegin: () => void;
}) {
  const exerciseDescriptions = [
    { icon: "", label: "Significado", desc: "Identifica el significado del kanji" },
    { icon: "", label: "Selección", desc: "Encuentra el kanji correcto" },
    { icon: "", label: "Lecturas", desc: "Asocia lecturas con significados" },
    { icon: "", label: "Escritura", desc: "Practica el trazado del kanji" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 py-2"
    >
      {/* Big kanji */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 250, damping: 18 }}
        className="w-24 h-24 rounded-2xl bg-gradient-to-b from-accent/[0.08] to-transparent border border-border-subtle flex items-center justify-center shadow-sm"
      >
        <span className="text-5xl font-bold text-content-primary select-none">{symbol}</span>
      </motion.div>

      <div className="text-center">
        <h3 className="text-lg font-extrabold text-content-primary mb-1">
          Lección de {symbol}
        </h3>
        {meaning && (
          <p className="text-sm text-content-tertiary capitalize">{meaning}</p>
        )}
      </div>

      {/* Exercise preview list */}
      <div className="w-full max-w-sm space-y-2">
        <p className="text-xs font-bold text-content-muted uppercase tracking-wide text-center mb-2">
          {totalExercises} ejercicios
        </p>
        {exerciseDescriptions.slice(0, totalExercises).map((ex, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-secondary border border-border-subtle"
          >
            <span className="text-lg">{ex.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-content-primary">{ex.label}</p>
              <p className="text-xs text-content-muted truncate">{ex.desc}</p>
            </div>
            <span className="text-[10px] font-bold text-content-muted bg-surface-tertiary rounded-full px-2 py-0.5">
              {i + 1}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Begin CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBegin}
        className="w-full max-w-sm py-3.5 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold shadow-lg shadow-accent/15 hover:shadow-xl hover:shadow-accent/20 transition-all flex items-center justify-center gap-2.5 text-[15px]"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Comenzar lección
      </motion.button>
    </motion.div>
  );
}
