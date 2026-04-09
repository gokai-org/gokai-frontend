"use client";

import { motion } from "framer-motion";
import type { KanjiQuizExerciseQuestion } from "@/features/kanji/types/quiz";
import { ExerciseOptionCard } from "./ExerciseOptionCard";

interface KanjiReadingExerciseProps {
  question: KanjiQuizExerciseQuestion;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  onConfirm: () => void;
}

/** Exercise: Show kanji -> select correct reading */
export function KanjiReadingExercise({
  question,
  selectedIndex,
  revealed,
  onSelect,
  onConfirm,
}: KanjiReadingExerciseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      <p className="text-sm text-content-tertiary text-center">
        ¿Como se lee este kanji?
      </p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="w-28 h-28 rounded-2xl bg-gradient-to-b from-blue-500/[0.08] to-transparent border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-sm"
      >
        <span className="text-6xl font-bold text-content-primary select-none">
          {question.kanji}
        </span>
      </motion.div>

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
