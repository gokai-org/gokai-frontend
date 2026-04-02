"use client";

import { motion } from "framer-motion";
import type { KanjiLessonQuestion } from "@/features/kanji/types/lessonFlow";
import { ExerciseOptionCard } from "./ExerciseOptionCard";

interface KanjiMeaningExerciseProps {
  question: KanjiLessonQuestion;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  onConfirm: () => void;
}

/** Exercise 1: Show kanji → select correct meaning */
export function KanjiMeaningExercise({
  question,
  selectedIndex,
  revealed,
  onSelect,
  onConfirm,
}: KanjiMeaningExerciseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      {/* Instruction */}
      <p className="text-sm text-content-tertiary text-center">
        ¿Cuál es el significado de este kanji?
      </p>

      {/* Large kanji display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="w-28 h-28 rounded-2xl bg-gradient-to-b from-accent/[0.06] to-transparent border border-border-subtle flex items-center justify-center shadow-sm"
      >
        <span className="text-6xl font-bold text-content-primary select-none">
          {question.kanji}
        </span>
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
