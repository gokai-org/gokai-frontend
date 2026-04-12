"use client";

import { useState } from "react";
import type { TextStepperComponent } from "../../../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GrammarExamplesSection({ examples }: { examples: TextStepperComponent }) {
  const [idx, setIdx] = useState(0);
  const steps = examples.content;
  const current = steps[idx];
  if (!current) return null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border-primary/50 bg-surface-secondary p-5">
        <p className="text-xl font-bold text-content-primary leading-snug">{current.kanji}</p>
        <p className="mt-1 text-sm font-medium text-pink-500 dark:text-pink-400">{current.kana}</p>
        <p className="mt-2 text-sm text-content-secondary">{current.meaning}</p>
      </div>

      {steps.length > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => setIdx((i) => i - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-primary/60 text-content-secondary transition hover:border-pink-300 dark:hover:border-pink-700 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            <span className="text-xs text-content-muted">{idx + 1}</span>
            <span className="text-xs text-content-muted">/</span>
            <span className="text-xs text-content-muted">{steps.length}</span>
          </div>

          <button
            type="button"
            disabled={idx === steps.length - 1}
            onClick={() => setIdx((i) => i + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-primary/60 text-content-secondary transition hover:border-pink-300 dark:hover:border-pink-700 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
