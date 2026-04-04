"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KanjiStrokePlayer } from "@/features/kanji/components/KanjiStrokePlayer";
import {
  KanjiWritingCanvas,
  type DrawnStroke,
} from "@/features/kanji/components/KanjiWritingCanvas";
import {
  validateStroke,
  getPointsForFeedback,
  getFeedbackLabel,
  getFeedbackColor,
  type StrokeValidationResult,
} from "@/features/kanji/lib/strokeValidation";
import type {
  KanjiLessonStrokeData,
  KanjiWritingPhase,
} from "@/features/kanji/types/lessonFlow";

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

interface KanjiWritingExerciseProps {
  symbol: string;
  meaning: string;
  strokeData: KanjiLessonStrokeData;
  phase: KanjiWritingPhase;
  onPhaseChange: (phase: KanjiWritingPhase) => void;
  onComplete: (score: number) => void;
}

/** Exercise 4: Stroke demo + freehand writing practice */
export function KanjiWritingExercise({
  symbol,
  meaning,
  strokeData,
  phase,
  onPhaseChange,
  onComplete,
}: KanjiWritingExerciseProps) {
  const demoSize = useCanvasSize(240, 80);
  const practiceSize = useCanvasSize(260, 64);

  // Demo state
  const [demoStrokeIndex, setDemoStrokeIndex] = useState(0);
  const [demoAutoPlay, setDemoAutoPlay] = useState(false);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Practice state
  const [practiceStrokeIndex, setPracticeStrokeIndex] = useState(0);
  const [strokeResults, setStrokeResults] = useState<StrokeResult[]>([]);
  const [lastFeedback, setLastFeedback] = useState<StrokeResult | null>(null);
  const [flashError, setFlashError] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalStrokes = strokeData.strokes.length;

  // Demo auto-play
  useEffect(() => {
    if (!demoAutoPlay) return;
    if (demoStrokeIndex >= totalStrokes) {
      setDemoAutoPlay(false);
      return;
    }
    demoTimer.current = setTimeout(() => {
      setDemoStrokeIndex((prev) => prev + 1);
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
      const refPath = strokeData.strokes[practiceStrokeIndex];
      const validation = validateStroke(
        stroke.points,
        refPath,
        strokeData.viewBox,
      );
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
        // Calculate final score
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
    [practiceStrokeIndex, strokeData, totalStrokes, strokeResults, onComplete],
  );

  const handleBackToDemo = useCallback(() => {
    setDemoStrokeIndex(0);
    setDemoAutoPlay(false);
    onPhaseChange("demo");
  }, [onPhaseChange]);

  // Score computation for display during practice
  const runningScore = useMemo(
    () => strokeResults.reduce((sum, r) => sum + r.pointsDelta, 0),
    [strokeResults],
  );

  // ── DEMO PHASE ──
  if (phase === "demo") {
    return (
      <motion.div
        key="writing-demo"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-5 w-full"
      >
        <p className="text-sm text-content-tertiary text-center max-w-[280px]">
          Observa el orden de los trazos de{" "}
          <span className="font-bold text-content-primary">{symbol}</span>
          {meaning && <span className="text-content-muted"> ({meaning})</span>}
        </p>

        {/* Stroke player with numbers */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-b from-accent/[0.03] to-transparent rounded-2xl p-4 border border-border-subtle"
        >
          <KanjiStrokePlayer
            viewBox={strokeData.viewBox}
            strokes={strokeData.strokes}
            activeStrokeIndex={demoStrokeIndex}
            showNumbers
            numberMode="uptoActive"
            size={demoSize}
          />
        </motion.div>

        {/* Demo progress */}
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

        {/* Demo controls */}
        <div className="flex items-center gap-1.5">
          <DemoButton
            onClick={() => {
              setDemoStrokeIndex(0);
              setDemoAutoPlay(false);
            }}
            disabled={demoStrokeIndex === 0}
            title="Reiniciar"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </DemoButton>

          <DemoButton
            onClick={() =>
              demoStrokeIndex > 0 && setDemoStrokeIndex((p) => p - 1)
            }
            disabled={demoStrokeIndex === 0}
            title="Anterior"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
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
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pausar
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reproducir
              </>
            )}
          </motion.button>

          <DemoButton
            onClick={() =>
              demoStrokeIndex < totalStrokes && setDemoStrokeIndex((p) => p + 1)
            }
            disabled={demoStrokeIndex >= totalStrokes}
            title="Siguiente"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </DemoButton>
        </div>

        {/* Start practice CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartPractice}
          className="w-full max-w-[280px] py-3.5 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold hover:shadow-xl hover:shadow-accent/20 transition-all shadow-lg shadow-accent/15 flex items-center justify-center gap-2.5 text-[15px]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Comenzar a escribir
        </motion.button>
      </motion.div>
    );
  }

  // ── PRACTICE PHASE ──
  return (
    <motion.div
      key="writing-practice"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      <p className="text-sm text-content-tertiary text-center">
        Traza el kanji sin guia de orden
      </p>

      {/* Canvas */}
      <div className="relative w-full flex justify-center">
        <div className="relative rounded-2xl border-2 border-border-subtle bg-gradient-to-b from-surface-secondary to-surface-primary p-1 shadow-sm">
          <KanjiWritingCanvas
            viewBox={strokeData.viewBox}
            guideStrokes={strokeData.strokes}
            activeStrokeIndex={practiceStrokeIndex}
            onStrokeDrawn={handleStrokeDrawn}
            size={practiceSize}
            flashError={flashError}
            hideStrokeOrder
          />
        </div>

        {/* Per-stroke feedback badge */}
        <AnimatePresence>
          {lastFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`absolute -top-3 -right-3 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg ${getFeedbackColor(lastFeedback.validation.feedback)}`}
            >
              {getFeedbackLabel(lastFeedback.validation.feedback)}
              <span className="ml-1.5 opacity-70">
                {lastFeedback.pointsDelta >= 0 ? "+" : ""}
                {lastFeedback.pointsDelta}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Running score */}
      <div className="flex items-center gap-2 bg-surface-secondary rounded-xl px-4 py-2">
        <svg
          className="w-4 h-4 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <span className="text-sm font-bold text-content-secondary">
          {runningScore}
        </span>
        <span className="text-xs text-content-muted">
          / {(practiceStrokeIndex + 1) * BASE_STROKE_POINTS} pts
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {strokeData.strokes.map((_, i) => {
          const sr = strokeResults[i];
          let dotClass = "bg-surface-tertiary";
          if (sr) {
            if (
              sr.validation.feedback === "perfect" ||
              sr.validation.feedback === "good"
            )
              dotClass = "bg-emerald-500";
            else if (sr.validation.feedback === "acceptable")
              dotClass = "bg-amber-400";
            else dotClass = "bg-red-400";
          }
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${dotClass}`}
            />
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBackToDemo}
          className="px-4 py-2.5 text-sm font-semibold text-content-secondary hover:text-content-primary bg-surface-tertiary hover:bg-surface-tertiary rounded-xl transition"
        >
          Ver demo
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Helper sub-component ──
function DemoButton({
  onClick,
  title,
  disabled = false,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="p-2.5 rounded-xl text-content-tertiary hover:text-content-primary hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition"
    >
      {children}
    </button>
  );
}
