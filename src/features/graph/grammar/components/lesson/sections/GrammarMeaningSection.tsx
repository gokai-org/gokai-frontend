"use client";

import { useState } from "react";
import type { ImageStepperComponent } from "../../../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GrammarMeaningSection({ meaning }: { meaning: ImageStepperComponent }) {
  const [idx, setIdx] = useState(0);
  const steps = meaning.content;
  const current = steps[idx];
  if (!current) return null;

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.62))] p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] dark:bg-[linear-gradient(180deg,rgba(41,41,41,0.88),rgba(28,28,28,0.84))] dark:ring-white/[0.06] lg:rounded-2xl lg:p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-black text-accent dark:bg-accent/20 dark:text-accent lg:h-6 lg:w-6 lg:text-[11px]">
            {idx + 1}
          </span>
          <p className="text-[13px] leading-[1.5] text-content-secondary lg:text-sm lg:leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>

      {/* Stepper controls */}
      {steps.length > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.58))] px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] dark:bg-[linear-gradient(180deg,rgba(41,41,41,0.88),rgba(28,28,28,0.84))] dark:ring-white/[0.06] lg:px-3.5 lg:py-3">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => setIdx((i) => i - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-primary/72 text-content-secondary shadow-[0_6px_18px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition hover:text-accent hover:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-surface-primary/60 dark:ring-white/[0.08] dark:hover:ring-accent/40 lg:h-9 lg:w-9 lg:rounded-xl"
          >
            <ChevronLeft className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </button>

          <div className="flex items-center gap-1.5 rounded-full bg-surface-primary/82 px-2.5 py-1 text-[11px] font-semibold text-content-muted shadow-[0_6px_16px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] dark:ring-white/[0.08] lg:text-xs">
            <span>{idx + 1}</span>
            <span>/</span>
            <span>{steps.length}</span>
          </div>

          <button
            type="button"
            disabled={idx === steps.length - 1}
            onClick={() => setIdx((i) => i + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-primary/72 text-content-secondary shadow-[0_6px_18px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition hover:text-accent hover:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-surface-primary/60 dark:ring-white/[0.08] dark:hover:ring-accent/40 lg:h-9 lg:w-9 lg:rounded-xl"
          >
            <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
