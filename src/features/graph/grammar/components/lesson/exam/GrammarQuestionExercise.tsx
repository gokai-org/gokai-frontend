"use client";

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
    <div className="space-y-[4px]">
      {/* ── Question bubble ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[3px] border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-[3.5px] py-[3.5px]">
        <div className="absolute -right-6 -top-6 h-[12px] w-[12px] rounded-full bg-accent/8 blur-xl" />
        <p
          className="relative text-[3px] leading-[1.5] text-content-primary"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
      </div>

      {/* ── Options ─────────────────────────────────────── */}
      <div className="flex flex-col gap-[2.5px]">
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
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              className={`flex w-full items-center gap-[2.5px] rounded-[3px] border px-[3.5px] py-[2.5px] text-left text-[3px] transition-colors duration-200 ${stateClass[state]}`}
            >
              {/* Letter badge */}
              <span
                className={`flex h-[6px] w-[6px] shrink-0 items-center justify-center rounded-[2px] border text-[2.5px] font-black transition-all duration-200 ${badgeClass[state]}`}
              >
                {String.fromCharCode(65 + i)}
              </span>

              <span className={`flex-1 leading-snug transition-colors duration-200 ${textClass[state]}`}>
                {opt.option}
              </span>

              {answered && isCorrect && (
                <CheckCircle2 className="h-[4px] w-[4px] shrink-0 text-emerald-500" />
              )}
              {answered && isSelected && !isCorrect && (
                <XCircle className="h-[4px] w-[4px] shrink-0 text-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}