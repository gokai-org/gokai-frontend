"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { QuestionExam } from "../../../types";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  question: QuestionExam;
  answered: boolean;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function GrammarQuestionExercise({
  question,
  answered,
  selectedIndex,
  onSelect,
}: Props) {
  return (
    <div className="space-y-5">
      {/* ── Question bubble ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-4 py-4">
        <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/8 blur-2xl" />
        <p
          className="relative text-sm leading-relaxed text-content-primary sm:text-[15px] sm:leading-7"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
      </div>

      {/* ── Options ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect  = opt.correct;

          // State derivation
          const state: "idle" | "selected" | "correct" | "wrong" | "dimmed" =
            !answered
              ? isSelected ? "selected" : "idle"
              : isCorrect
                ? "correct"
                : isSelected
                  ? "wrong"
                  : "dimmed";

          const stateClass: Record<typeof state, string> = {
            idle:     "border-border-subtle bg-surface-primary hover:border-accent/40 hover:bg-accent/4 cursor-pointer",
            selected: "border-accent/60 bg-accent/8 cursor-pointer",
            correct:  "border-emerald-400/70 bg-emerald-50/60 dark:bg-emerald-950/25",
            wrong:    "border-red-400/70 bg-red-50/60 dark:bg-red-950/25",
            dimmed:   "border-border-subtle bg-transparent opacity-40 cursor-default",
          };

          const badgeClass: Record<typeof state, string> = {
            idle:     "border-border-default text-content-muted bg-surface-secondary",
            selected: "border-accent bg-accent text-white",
            correct:  "border-emerald-500 bg-emerald-500 text-white",
            wrong:    "border-red-500 bg-red-500 text-white",
            dimmed:   "border-border-subtle text-content-tertiary",
          };

          const textClass: Record<typeof state, string> = {
            idle:     "text-content-primary",
            selected: "text-content-primary font-semibold",
            correct:  "text-emerald-700 dark:text-emerald-300 font-semibold",
            wrong:    "text-red-600 dark:text-red-400",
            dimmed:   "text-content-tertiary",
          };

          return (
            <motion.button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              whileHover={!answered ? { scale: 1.01, y: -1 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.2 }}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200 ${stateClass[state]}`}
            >
              {/* Letter badge */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-[11px] font-black transition-all duration-200 ${badgeClass[state]}`}
              >
                {String.fromCharCode(65 + i)}
              </span>

              <span className={`flex-1 leading-snug transition-colors duration-200 ${textClass[state]}`}>
                {opt.option}
              </span>

              <AnimatePresence mode="wait">
                {answered && isCorrect && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  </motion.span>
                )}
                {answered && isSelected && !isCorrect && (
                  <motion.span
                    key="x"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}