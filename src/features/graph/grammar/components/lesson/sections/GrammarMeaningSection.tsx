"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useState } from "react";
import type { ImageStepperComponent } from "../../../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const passthroughImageLoader = ({ src }: ImageLoaderProps) => src;

export default function GrammarMeaningSection({ meaning }: { meaning: ImageStepperComponent }) {
  const [idx, setIdx] = useState(0);
  const steps = meaning.content;
  const current = steps[idx];
  if (!current) return null;

  return (
    <div className="space-y-4">
      {current.img && (
        <div className="overflow-hidden rounded-2xl border border-accent/20 dark:border-accent/20 bg-surface-secondary">
          <div className="relative h-52 w-full">
            <Image
              loader={passthroughImageLoader}
              unoptimized
              src={current.img}
              alt={`Ilustración ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="mx-auto object-contain p-3"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border-primary/50 bg-surface-secondary p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 dark:bg-accent/20 text-[11px] font-black text-accent dark:text-accent">
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-primary/60 text-content-secondary transition hover:border-accent/40 dark:hover:border-accent/50 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
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
                  i === idx ? "w-5 bg-accent" : "w-2 bg-border-primary/50 hover:bg-accent/40"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={idx === steps.length - 1}
            onClick={() => setIdx((i) => i + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-primary/60 text-content-secondary transition hover:border-accent/40 dark:hover:border-accent/50 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
