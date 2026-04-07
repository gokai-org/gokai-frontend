"use client";

import { motion } from "framer-motion";
import type { KanaQuizQuestionItem } from "@/features/kana/types/quiz";

interface KanaQuizOptionCardProps {
  label: string;
  index: number;
  selected: boolean;
  revealed: boolean;
  correct: boolean;
  onSelect: (index: number) => void;
  largeText?: boolean;
}

export function KanaQuizOptionCard({
  label,
  index,
  selected,
  revealed,
  correct,
  onSelect,
  largeText = false,
}: KanaQuizOptionCardProps) {
  let borderClass = "border-border-subtle";
  let bgClass = "bg-surface-secondary hover:bg-surface-tertiary";
  let textClass = "text-content-primary";

  if (revealed) {
    if (correct) {
      borderClass = "border-emerald-400 dark:border-emerald-600";
      bgClass = "bg-emerald-50 dark:bg-emerald-950/30";
      textClass = "text-emerald-700 dark:text-emerald-300";
    } else if (selected && !correct) {
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
      } ${largeText ? "p-4" : "px-4 py-3.5"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            revealed && correct
              ? "bg-emerald-500 text-white"
              : revealed && selected && !correct
                ? "bg-red-500 text-white"
                : selected
                  ? "bg-accent text-content-inverted"
                  : "bg-surface-tertiary text-content-muted"
          }`}
        >
          {revealed && correct ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : revealed && selected && !correct ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            String.fromCharCode(65 + index)
          )}
        </div>

        <span
          className={`${textClass} font-semibold ${
            largeText ? "text-3xl leading-none py-1" : "text-sm"
          }`}
        >
          {label}
        </span>
      </div>
    </motion.button>
  );
}

/* ── FromKana Exercise ── */

interface KanaFromKanaExerciseProps {
  question: KanaQuizQuestionItem;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  onConfirm: () => void;
}

/**
 * Shows a kana symbol, user selects the correct romaji pronunciation.
 */
export function KanaFromKanaExercise({
  question,
  selectedIndex,
  revealed,
  onSelect,
  onConfirm,
}: KanaFromKanaExerciseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      <p className="text-sm text-content-tertiary text-center">
        ¿Cual es la pronunciacion de este caracter?
      </p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="w-28 h-28 rounded-2xl bg-gradient-to-b from-accent/[0.06] to-transparent border border-border-subtle flex items-center justify-center shadow-sm"
      >
        <span className="text-6xl font-bold text-content-primary select-none">
          {question.symbol}
        </span>
      </motion.div>

      <div className="w-full max-w-sm space-y-2.5">
        {question.options.map((opt, i) => (
          <KanaQuizOptionCard
            key={i}
            label={opt.option}
            index={i}
            selected={selectedIndex === i}
            revealed={revealed}
            correct={opt.correct}
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

/* ── FromRomaji Exercise ── */

interface KanaFromRomajiExerciseProps {
  question: KanaQuizQuestionItem;
  selectedIndex: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  onConfirm: () => void;
}

/**
 * Shows a romaji string, user selects the correct kana symbol from a grid.
 */
export function KanaFromRomajiExercise({
  question,
  selectedIndex,
  revealed,
  onSelect,
  onConfirm,
}: KanaFromRomajiExerciseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-5 w-full"
    >
      <p className="text-sm text-content-tertiary text-center">
        ¿Cual es el caracter correcto para esta pronunciacion?
      </p>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className="px-6 py-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-50/40 dark:from-emerald-950/40 dark:to-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-sm"
      >
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 text-center">
          {question.romaji}
        </p>
      </motion.div>

      <div className="w-full max-w-md grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {question.options.map((opt, i) => (
          <KanaQuizOptionCard
            key={i}
            label={opt.option}
            index={i}
            selected={selectedIndex === i}
            revealed={revealed}
            correct={opt.correct}
            onSelect={onSelect}
            largeText
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
          className="w-full max-w-md py-3.5 bg-gradient-to-r from-accent to-accent-hover text-content-inverted rounded-2xl font-bold shadow-lg shadow-accent/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Confirmar
        </motion.button>
      )}
    </motion.div>
  );
}
