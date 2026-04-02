"use client";

import { motion } from "framer-motion";
import type { KanjiLessonQuestion } from "@/features/kanji/types/lessonFlow";
import { ExerciseOptionCard } from "./ExerciseOptionCard";

interface KanjiReadingExerciseProps {
  question: KanjiLessonQuestion;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  onConfirm: () => void;
}

/** Exercise 3: Show readings → select correct meaning */
export function KanjiReadingExercise({
  question,
  selectedIndex,
  revealed,
  onSelect,
  onConfirm,
}: KanjiReadingExerciseProps) {
  const readings = (question.prompt || "").split("、").filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      {/* Instruction */}
      <p className="text-sm text-content-tertiary text-center">
        ¿Qué significan estas lecturas?
      </p>

      {/* Readings display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-wrap items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-50/40 dark:from-blue-950/40 dark:to-blue-950/20 border border-blue-200 dark:border-blue-800 shadow-sm"
      >
        {readings.length > 0 ? (
          readings.map((r, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-lg border border-blue-200 dark:border-blue-700 bg-white/60 dark:bg-blue-950/40 px-3 py-1.5 text-base font-bold text-blue-700 dark:text-blue-300"
            >
              {r}
            </span>
          ))
        ) : (
          <span className="text-base font-bold text-blue-700 dark:text-blue-300">
            {question.prompt || question.kanji}
          </span>
        )}
      </motion.div>

      {/* Options */}
      <div className="w-full max-w-sm space-y-2.5">
        {question.options.map((opt, i) => (
          <ExerciseOptionCard
            key={i}
            option={opt}
            index={i}
            selected={selectedIndex === i}
            revealed={revealed}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Confirm button */}
      {!revealed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedIndex !== null ? 1 : 0.4 }}
          whileHover={selectedIndex !== null ? { scale: 1.02 } : undefined}
          whileTap={selectedIndex !== null ? { scale: 0.98 } : undefined}
          onClick={onConfirm}
          disabled={selectedIndex === null}
          className="w-full max-w-sm py-3.5 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold shadow-lg shadow-accent/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Confirmar
        </motion.button>
      )}
    </motion.div>
  );
}
