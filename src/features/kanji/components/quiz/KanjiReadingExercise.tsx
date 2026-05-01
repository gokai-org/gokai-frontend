"use client";

import { motion } from "framer-motion";
import type { KanjiQuizExerciseQuestion } from "@/features/kanji/types/quiz";
import { ExerciseOptionCard } from "./ExerciseOptionCard";

interface KanjiReadingExerciseProps {
  question: KanjiQuizExerciseQuestion;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
}

/** Exercise: Show kanji -> select correct reading */
export function KanjiReadingExercise({
  question,
  selectedIndex,
  revealed,
  onSelect,
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
        className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-blue-500/[0.08] to-transparent border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-sm overflow-hidden px-4 py-4 min-h-[5rem]"
      >
        <span
          className={[
            "font-bold text-content-primary select-none text-center leading-tight",
            question.kanji.length <= 1 ? "text-6xl" : question.kanji.length <= 4 ? "text-4xl" : "text-2xl",
          ].join(" ")}
        >
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
    </motion.div>
  );
}
