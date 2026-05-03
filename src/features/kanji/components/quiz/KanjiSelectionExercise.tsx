"use client";

import { motion } from "framer-motion";
import type { KanjiQuizExerciseQuestion } from "@/features/kanji/types/quiz";
import { normalizeKanjiDisplayText } from "@/features/kanji/utils/kanjiText";
import { ExerciseOptionCard } from "./ExerciseOptionCard";

interface KanjiSelectionExerciseProps {
  question: KanjiQuizExerciseQuestion;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
}

/** Exercise: Show meaning -> select correct kanji */
export function KanjiSelectionExercise({
  question,
  selectedIndex,
  revealed,
  onSelect,
}: KanjiSelectionExerciseProps) {
  const prompt = normalizeKanjiDisplayText(question.prompt || question.kanji);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      <p className="text-sm text-content-tertiary text-center">
        ¿Cual es el kanji correcto para este significado?
      </p>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="px-6 py-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-50/40 dark:from-emerald-950/40 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-sm"
      >
        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 text-center">
          {prompt}
        </p>
      </motion.div>

      <div className="w-full max-w-md grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {question.options.map((opt, i) => (
          <ExerciseOptionCard
            key={i}
            option={opt}
            index={i}
            selected={selectedIndex === i}
            revealed={revealed}
            onSelect={onSelect}
            kanjiMode
          />
        ))}
      </div>
    </motion.div>
  );
}
