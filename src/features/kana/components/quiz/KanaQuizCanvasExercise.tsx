"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KanaStrokePlayer } from "@/features/kana/components/KanaStrokePlayer";
import {
  KanaWritingCanvas,
  type DrawnStroke,
} from "@/features/kana/components/KanaWritingCanvas";
import {
  validateStroke,
  getPointsForFeedback,
  getFeedbackLabel,
  getFeedbackColor,
  type StrokeValidationResult,
} from "@/features/kana/lib/strokeValidation";
import type { KanaQuizQuestionItem } from "@/features/kana/types/quiz";

const BASE_STROKE_POINTS = 10;

function useCanvasSize(max: number, padding = 64): number {
  const [size, setSize] = useState(max);
  useEffect(() => {
    const update = () => setSize(Math.min(max, window.innerWidth - padding));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [max, padding]);
  return size;
}

interface StrokeResult {
  validation: StrokeValidationResult;
  pointsDelta: number;
}

interface KanaQuizCanvasExerciseProps {
  question: KanaQuizQuestionItem;
  questionIndex: number;
  totalQuestions: number;
  phase: "demo" | "practice" | "done";
  onPhaseChange: (phase: "demo" | "practice" | "done") => void;
  onComplete: (score: number) => void;
  /** Stroke/guide accent colour (hiragana purple, katakana blue). */
  accentColor?: string;
}

export function KanaQuizCanvasExercise({
  question,
  questionIndex,
  totalQuestions,
  phase,
  onPhaseChange,
  onComplete,
  accentColor,
}: KanaQuizCanvasExerciseProps) {
  const demoSize = useCanvasSize(240, 80);
  const practiceSize = useCanvasSize(260, 64);

  const viewBox = question.viewBox || "0 0 109 109";
  const strokes = useMemo(() => question.strokes || [], [question.strokes]);
  const totalStrokes = strokes.length;

  const [demoStrokeIndex, setDemoStrokeIndex] = useState(0);
  const [demoAutoPlay, setDemoAutoPlay] = useState(false);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [practiceStrokeIndex, setPracticeStrokeIndex] = useState(0);
  const [strokeResults, setStrokeResults] = useState<StrokeResult[]>([]);
  const [lastFeedback, setLastFeedback] = useState<StrokeResult | null>(null);
  const [flashError, setFlashError] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prevQuestionIndex, setPrevQuestionIndex] = useState(questionIndex);
  if (questionIndex !== prevQuestionIndex) {
    setPrevQuestionIndex(questionIndex);
    setDemoStrokeIndex(0);
    setDemoAutoPlay(false);
    setPracticeStrokeIndex(0);
    setStrokeResults([]);
    setLastFeedback(null);
    setFlashError(false);
  }

  useEffect(() => {
    if (!demoAutoPlay || demoStrokeIndex >= totalStrokes) return;
    demoTimer.current = setTimeout(() => {
      setDemoStrokeIndex((prev) => {
        const next = prev + 1;
        if (next >= totalStrokes) setDemoAutoPlay(false);
        return next;
      });
    }, 800);
    return () => {
      if (demoTimer.current) clearTimeout(demoTimer.current);
    };
  }, [demoAutoPlay, demoStrokeIndex, totalStrokes]);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  const handleStartPractice = useCallback(() => {
    setPracticeStrokeIndex(0);
    setStrokeResults([]);
    setLastFeedback(null);
    setFlashError(false);
    onPhaseChange("practice");
  }, [onPhaseChange]);

  const handleStrokeDrawn = useCallback(
    (stroke: DrawnStroke) => {
      const refPath = strokes[practiceStrokeIndex];
      if (!refPath) return;

      const validation = validateStroke(stroke.points, refPath, viewBox);
      const pointsDelta = getPointsForFeedback(
        validation.feedback,
        BASE_STROKE_POINTS,
      );
      const result: StrokeResult = { validation, pointsDelta };

      setStrokeResults((prev) => [...prev, result]);
      setLastFeedback(result);

      if (validation.feedback === "poor" || validation.feedback === "miss") {
        setFlashError(true);
        if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
        feedbackTimeout.current = setTimeout(() => setFlashError(false), 400);
      }

      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setLastFeedback(null), 1200);

      const nextIdx = practiceStrokeIndex + 1;
      if (nextIdx >= totalStrokes) {
        const allResults = [...strokeResults, result];
        const totalScore = allResults.reduce(
          (sum, r) => sum + r.pointsDelta,
          0,
        );
        const maxScore = totalStrokes * BASE_STROKE_POINTS;
        const scorePercent =
          maxScore > 0
            ? Math.round((Math.max(0, totalScore) / maxScore) * 100)
            : 0;
        setTimeout(() => onComplete(scorePercent), 600);
      } else {
        setPracticeStrokeIndex(nextIdx);
      }
    },
    [practiceStrokeIndex, strokes, viewBox, totalStrokes, strokeResults, onComplete],
  );

  const handleBackToDemo = useCallback(() => {
    setDemoStrokeIndex(0);
    setDemoAutoPlay(false);
    onPhaseChange("demo");
  }, [onPhaseChange]);

  const kanaTypeLabel =
    question.type === "canvas"
      ? question.symbol
        ? `Hiragana`
        : "Kana"
      : "Kana";

  if (totalStrokes === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center py-12 gap-4"
      >
        <p className="text-content-tertiary text-sm text-center">
          Datos de trazos no disponibles para{" "}
          <strong>{question.symbol || question.romaji}</strong>.
        </p>
        <button
          onClick={() => onComplete(0)}
          className="px-5 py-2.5 bg-surface-tertiary rounded-xl text-sm font-semibold transition"
        >
          Omitir
        </button>
      </motion.div>
    );
  }

  if (phase === "demo") {
    return (
      <motion.div
        key={`canvas-demo-${questionIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-5 w-full"
      >
        {totalQuestions > 1 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < questionIndex
                    ? "bg-accent"
                    : i === questionIndex
                      ? "bg-accent w-6 rounded-[4px]"
                      : "bg-surface-tertiary"
                }`}
              />
            ))}
          </div>
        )}

        <p className="text-sm text-content-tertiary text-center max-w-[280px]">
          Dibuja el {kanaTypeLabel} para{" "}
          <span className="font-bold text-content-primary">
            &ldquo;{question.romaji}&rdquo;
          </span>
        </p>

        <p className="text-xs text-content-muted">
          Sigue el orden de los trazos
        </p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-b from-accent/[0.03] to-transparent rounded-2xl p-4 border border-border-subtle"
        >
          <KanaStrokePlayer
            viewBox={viewBox}
            strokes={strokes}
            activeStrokeIndex={demoStrokeIndex}
            showNumbers
            numberMode="uptoActive"
            size={demoSize}
          />
        </motion.div>

        <div className="w-full max-w-[260px]">
          <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
              animate={{
                width: `${totalStrokes > 0 ? (Math.min(demoStrokeIndex, totalStrokes) / totalStrokes) * 100 : 0}%`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-content-muted text-center mt-1.5 font-medium">
            Trazo{" "}
            <span className="text-accent font-bold">
              {Math.min(demoStrokeIndex, totalStrokes)}
            </span>{" "}
            de {totalStrokes}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <DemoButton
            onClick={() => {
              setDemoStrokeIndex(0);
              setDemoAutoPlay(false);
            }}
            disabled={demoStrokeIndex === 0}
            title="Reiniciar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </DemoButton>

          <DemoButton
            onClick={() => demoStrokeIndex > 0 && setDemoStrokeIndex((p) => p - 1)}
            disabled={demoStrokeIndex === 0}
            title="Anterior"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </DemoButton>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (demoAutoPlay) {
                setDemoAutoPlay(false);
              } else {
                if (demoStrokeIndex >= totalStrokes) setDemoStrokeIndex(0);
                setDemoAutoPlay(true);
              }
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              demoAutoPlay
                ? "bg-accent text-content-inverted shadow-md shadow-accent/20"
                : "bg-accent/10 text-accent hover:bg-accent/20"
            }`}
          >
            {demoAutoPlay ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pausar
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reproducir
              </>
            )}
          </motion.button>

          <DemoButton
            onClick={() => demoStrokeIndex < totalStrokes && setDemoStrokeIndex((p) => p + 1)}
            disabled={demoStrokeIndex >= totalStrokes}
            title="Siguiente"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </DemoButton>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartPractice}
          className="w-full max-w-[260px] py-3.5 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold shadow-lg shadow-accent/15 transition-all"
        >
          Practicar trazado
        </motion.button>
      </motion.div>
    );
  }

  // ── PRACTICE PHASE ──
  if (phase === "practice") {
    return (
      <motion.div
        key={`canvas-practice-${questionIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-4 w-full"
      >
        {totalQuestions > 1 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < questionIndex
                    ? "bg-accent"
                    : i === questionIndex
                      ? "bg-accent w-6 rounded-[4px]"
                      : "bg-surface-tertiary"
                }`}
              />
            ))}
          </div>
        )}

        <p className="text-sm text-content-tertiary text-center">
          Dibuja:{" "}
          <span className="font-bold text-content-primary">
            {question.symbol || question.romaji}
          </span>
        </p>

        {/* Canvas with floating feedback toast */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative rounded-2xl border-2 transition-colors ${
            flashError ? "border-red-400" : "border-border-subtle"
          }`}
        >
          <KanaWritingCanvas
            viewBox={viewBox}
            guideStrokes={strokes}
            activeStrokeIndex={practiceStrokeIndex}
            size={practiceSize}
            onStrokeDrawn={handleStrokeDrawn}
            accentColor={accentColor}
            hideActiveGuide
          />

          <AnimatePresence>
            {lastFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.85 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
              >
                <div
                  className={`px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg flex items-center gap-2 ${getFeedbackColor(lastFeedback.validation.feedback)}`}
                >
                  <span className="text-sm font-bold">
                    {getFeedbackLabel(lastFeedback.validation.feedback)}
                  </span>
                  <span className="text-sm font-bold opacity-70">
                    {lastFeedback.pointsDelta >= 0
                      ? `+${lastFeedback.pointsDelta}`
                      : lastFeedback.pointsDelta}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-content-muted font-medium">
            Trazos evaluados {strokeResults.length} / {totalStrokes}
          </span>
          <div className="flex gap-1">
            {strokes.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < strokeResults.length
                    ? strokeResults[i]?.validation.isCorrect
                      ? "bg-emerald-400"
                      : "bg-red-400"
                    : "bg-surface-tertiary"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleBackToDemo}
          className="text-xs text-content-muted hover:text-accent transition font-medium"
        >
          ← Volver a ver demostracion
        </button>
      </motion.div>
    );
  }

  return null;
}

function DemoButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-9 h-9 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-content-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
    >
      {children}
    </motion.button>
  );
}
