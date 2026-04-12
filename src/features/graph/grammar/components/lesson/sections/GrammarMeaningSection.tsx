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
    <div className="space-y-4">
      {current.img && (
        <div className="overflow-hidden rounded-2xl border border-pink-100 dark:border-pink-900/30 bg-surface-secondary">
          <img
            src={current.img}
            alt={`Ilustración ${idx + 1}`}
            className="mx-auto max-h-52 w-full object-contain p-3"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      <div className="rounded-2xl border border-border-primary/50 bg-surface-secondary p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/40 text-[11px] font-black text-pink-600 dark:text-pink-400">
            {idx + 1}
          </span>
          <p className="text-sm text-content-secondary leading-relaxed">{current.description}</p>
        </div>
      </div>

      {/* Stepper controls */}
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

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === idx ? "w-5 bg-pink-500" : "w-2 bg-border-primary/50 hover:bg-pink-300"
                }`}
              />
            ))}
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
