"use client";

import { useState } from "react";
import type { TextStepperComponent } from "../../../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RichText } from "../../../lib/richText";

export default function GrammarExamplesSection({ examples }: { examples: TextStepperComponent }) {
  const [idx, setIdx] = useState(0);
  const steps = examples.content;
  const current = steps[idx];
  if (!current) return null;

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))] shadow-[0_16px_34px_rgba(0,0,0,0.05)] dark:bg-[linear-gradient(180deg,rgba(34,34,34,0.96),rgba(24,24,24,0.92))] lg:rounded-2xl">
        <div className="border-b border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(194,78,69,0.14),transparent_46%),linear-gradient(90deg,rgba(194,78,69,0.08),transparent)] px-3.5 py-3 lg:px-5 lg:py-4">
          <div className="flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent/80 lg:text-[11px]">
                Uso en contexto
              </p>
              <p className="mt-1 text-[11px] text-content-muted lg:text-xs">
                {idx + 1} de {steps.length}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-3.5 py-3.5 text-center lg:space-y-4 lg:px-5 lg:py-5">
          <div className="rounded-[16px] bg-surface-primary/75 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:px-4 lg:py-4">
            <p className="text-[1.02rem] font-bold leading-[1.45] text-content-primary lg:text-[1.18rem] xl:text-[1.3rem]">
              <RichText text={current.kanji} />
            </p>
            <div className="mt-2 flex justify-center">
              <p className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 text-[12px] font-semibold text-accent lg:text-[13px]">
              {current.kana}
              </p>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-secondary/70 px-3.5 py-3 lg:px-4 lg:py-3.5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-content-muted lg:text-[11px]">
              Interpretación
            </p>
            <p className="mt-2 text-[13px] leading-[1.55] text-content-secondary lg:text-sm">
              <RichText text={current.meaning} />
            </p>
          </div>
        </div>
      </div>

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
