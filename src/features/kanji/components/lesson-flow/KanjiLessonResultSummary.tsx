"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { KanjiLessonExerciseResult } from "@/features/kanji/types/lessonFlow";
import { EXERCISE_LABELS } from "@/features/kanji/types/lessonFlow";

interface KanjiLessonResultSummaryProps {
  symbol: string;
  meaning: string;
  results: KanjiLessonExerciseResult[];
  onRetry: () => void;
  onClose: () => void;
}

export function KanjiLessonResultSummary({
  symbol,
  meaning,
  results,
  onRetry,
  onClose,
}: KanjiLessonResultSummaryProps) {
  const overallScore = useMemo(() => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.score, 0);
    return Math.round(total / results.length);
  }, [results]);

  const grade = useMemo(() => {
    if (overallScore >= 90)
      return {
        label: "¡Excelente!",
        color: "text-emerald-600 dark:text-emerald-400",
        ring: "bg-emerald-400/20",
      };
    if (overallScore >= 70)
      return {
        label: "¡Bien hecho!",
        color: "text-blue-600 dark:text-blue-400",
        ring: "bg-blue-400/20",
      };
    if (overallScore >= 50)
      return {
        label: "Aceptable",
        color: "text-amber-600 dark:text-amber-400",
        ring: "bg-amber-400/20",
      };
    return {
      label: "Sigue practicando",
      color: "text-orange-600 dark:text-orange-400",
      ring: "bg-orange-400/20",
    };
  }, [overallScore]);

  const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 py-2 w-full"
    >
      {/* Score ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.15,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="relative"
      >
        <div
          className={`absolute inset-[-8px] rounded-full blur-xl ${grade.ring}`}
        />
        <div className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center">
          <svg
            className="absolute inset-0 w-28 h-28 -rotate-90"
            viewBox="0 0 112 112"
          >
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth="6"
            />
            <motion.circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke={
                overallScore >= 70
                  ? "#10b981"
                  : overallScore >= 50
                    ? "#f59e0b"
                    : "var(--accent)"
              }
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 50 * (1 - overallScore / 100),
              }}
              transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-3xl font-extrabold text-content-primary"
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

      {/* Grade label */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h3 className={`text-xl font-extrabold mb-1 ${grade.color}`}>
          {grade.label}
        </h3>
        <p className="text-sm text-content-tertiary">
          Lección completada para{" "}
          <span className="font-bold text-content-primary text-lg">
            {symbol}
          </span>
          {meaning && <span className="text-content-muted"> · {meaning}</span>}
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-0 bg-surface-secondary rounded-2xl overflow-hidden border border-border-subtle"
      >
        <div className="text-center px-5 py-3">
          <p className="text-lg font-extrabold text-content-primary">
            {results.length}
          </p>
          <p className="text-[10px] text-content-muted font-semibold">
            Ejercicios
          </p>
        </div>
        <div className="w-px h-10 bg-surface-tertiary" />
        <div className="text-center px-5 py-3">
          <p className="text-lg font-extrabold text-content-primary">
            {totalCorrect}/{totalQuestions}
          </p>
          <p className="text-[10px] text-content-muted font-semibold">
            Correctas
          </p>
        </div>
        <div className="w-px h-10 bg-surface-tertiary" />
        <div className="text-center px-5 py-3">
          <p className="text-lg font-extrabold text-content-primary">
            {overallScore}%
          </p>
          <p className="text-[10px] text-content-muted font-semibold">
            Promedio
          </p>
        </div>
      </motion.div>

      {/* Per-exercise breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-2"
      >
        <p className="text-xs font-bold text-content-muted text-center uppercase tracking-wide mb-2">
          Detalle por ejercicio
        </p>
        {results.map((r, i) => {
          const scoreColor =
            r.score >= 80
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              : r.score >= 50
                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.06 }}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${scoreColor}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-current/10 flex items-center justify-center text-[10px] font-bold opacity-60">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold">
                  {EXERCISE_LABELS[r.type]}
                </span>
              </div>
              <span className="text-sm font-bold">{r.score}%</span>
            </motion.div>
          );
        })}
      </motion.div>

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
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Repetir lección
        </motion.button>
        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-medium text-content-muted hover:text-content-secondary transition"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}
