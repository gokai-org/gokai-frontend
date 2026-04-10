"use client";

import { motion } from "framer-motion";
import type { KanjiQuizOption } from "@/features/kanji/types/quiz";
import { normalizeKanjiDisplayText } from "@/features/kanji/utils/kanjiText";

interface ExerciseOptionCardProps {
  option: KanjiQuizOption;
  index: number;
  selected: boolean;
  revealed: boolean;
  onSelect: (index: number) => void;
  kanjiMode?: boolean;
}

export function ExerciseOptionCard({
  option,
  index,
  selected,
  revealed,
  onSelect,
  kanjiMode = false,
}: ExerciseOptionCardProps) {
  const isCorrect = option.correct;
  const displayValue = kanjiMode
    ? option.value
    : normalizeKanjiDisplayText(option.value);

  let borderClass = "border-border-subtle";
  let bgClass = "bg-surface-secondary hover:bg-surface-tertiary";
  let textClass = "text-content-primary";

  if (revealed) {
    if (isCorrect) {
      borderClass = "border-emerald-400 dark:border-emerald-600";
      bgClass = "bg-emerald-50 dark:bg-emerald-950/30";
      textClass = "text-emerald-700 dark:text-emerald-300";
    } else if (selected && !isCorrect) {
      borderClass = "border-red-400 dark:border-red-600";
      bgClass = "bg-red-50 dark:bg-red-950/30";
      textClass = "text-red-700 dark:text-red-300";
    } else {
      bgClass = "bg-surface-secondary opacity-50";
    }
  } else if (selected) {
    borderClass = "border-accent ring-2 ring-accent/20";
    bgClass = "bg-accent/5";
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.045,
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={!revealed ? { scale: 1.015, y: -1 } : undefined}
      whileTap={!revealed ? { scale: 0.97 } : undefined}
      onClick={() => !revealed && onSelect(index)}
      disabled={revealed}
      className={`relative w-full rounded-2xl border-2 ${borderClass} ${bgClass} transition-all duration-200 ${
        revealed ? "cursor-default" : "cursor-pointer"
      } ${kanjiMode ? "p-4" : "px-4 py-3.5"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            revealed && isCorrect
              ? "bg-emerald-500 text-white"
              : revealed && selected && !isCorrect
                ? "bg-red-500 text-white"
                : selected
                  ? "bg-accent text-content-inverted"
                  : "bg-surface-tertiary text-content-muted"
          }`}
        >
          {revealed && isCorrect ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : revealed && selected && !isCorrect ? (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            String.fromCharCode(65 + index)
          )}
        </div>

        <span
          className={`${textClass} font-semibold ${
            kanjiMode ? "text-3xl leading-none py-1" : "text-sm"
          }`}
        >
          {displayValue}
        </span>
      </div>
    </motion.button>
  );
}
