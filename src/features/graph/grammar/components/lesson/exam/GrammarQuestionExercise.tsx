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
    <div className="kanji-detail-scroll flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1 sm:gap-5">
      <div className="relative overflow-hidden rounded-[18px] border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-3.5 py-3.5 sm:rounded-[24px] sm:px-6 sm:py-6">
        <div className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-accent/8 blur-3xl" />
        <p
          className="relative text-[13px] leading-5 text-content-primary sm:text-lg sm:leading-8"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
      </div>

      <div className="grid gap-2.5 sm:gap-4">
        {question.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = opt.correct;

          const state: "idle" | "selected" | "correct" | "wrong" | "dimmed" =
            !answered
              ? isSelected ? "selected" : "idle"
              : isCorrect
                ? "correct"
                : isSelected
                  ? "wrong"
                  : "dimmed";

          const stateClass: Record<typeof state, string> = {
            idle: "cursor-pointer border-black/[0.05] bg-surface-primary shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:border-accent/30 hover:bg-accent/4 dark:border-white/[0.08]",
            selected: "cursor-pointer border-accent/60 bg-accent/8",
            correct: "border-emerald-400/70 bg-emerald-50/60 dark:bg-emerald-950/25",
            wrong: "border-red-400/70 bg-red-50/60 dark:bg-red-950/25",
            dimmed: "cursor-default border-black/[0.04] bg-transparent opacity-40 dark:border-white/[0.06]",
          };

          const badgeClass: Record<typeof state, string> = {
            idle: "border-black/[0.05] bg-surface-secondary text-content-muted dark:border-white/[0.08]",
            selected: "border-accent bg-accent text-white",
            correct: "border-emerald-500 bg-emerald-500 text-white",
            wrong: "border-red-500 bg-red-500 text-white",
            dimmed: "border-black/[0.04] text-content-tertiary dark:border-white/[0.06]",
          };

          const textClass: Record<typeof state, string> = {
            idle: "text-content-primary",
            selected: "font-semibold text-content-primary",
            correct: "font-semibold text-emerald-700 dark:text-emerald-300",
            wrong: "text-red-600 dark:text-red-400",
            dimmed: "text-content-tertiary",
          };

          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => onSelect(i)}
              className={`flex min-h-[54px] w-full items-center gap-3 rounded-[16px] border px-3 py-2.5 text-left transition-colors duration-200 sm:min-h-[84px] sm:gap-4 sm:rounded-[22px] sm:px-5 sm:py-4 ${stateClass[state]}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-black leading-none transition-all duration-200 sm:h-11 sm:w-11 sm:rounded-xl sm:text-base ${badgeClass[state]}`}
              >
                {String.fromCharCode(65 + i)}
              </span>

              <span className={`flex-1 text-[12px] leading-[1.35rem] transition-colors duration-200 sm:text-base sm:leading-7 ${textClass[state]}`}>
                {opt.option}
              </span>

              {answered && isCorrect ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
              ) : null}
              {answered && isSelected && !isCorrect ? (
                <XCircle className="h-4 w-4 shrink-0 text-red-500 sm:h-5 sm:w-5" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}