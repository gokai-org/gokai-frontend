"use client";

import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewActiveHeaderProps {
  activeCount: number;
  eyebrow: string;
  title: string;
  description: string;
  loading?: boolean;
  canStartReview?: boolean;
  onStartReview?: () => void;
}

export function ReviewActiveHeader({
  activeCount,
  eyebrow,
  title,
  description,
  loading = false,
  canStartReview = true,
  onStartReview,
}: ReviewActiveHeaderProps) {
  const canStart = !loading && activeCount > 0 && canStartReview;

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-accent to-accent-hover p-6 text-content-inverted shadow-lg sm:p-8 lg:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            "radial-gradient(ellipse at 72% -8%, rgba(255,255,255,0.20) 0%, transparent 52%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            "radial-gradient(ellipse at 12% 108%, rgba(255,255,255,0.11) 0%, transparent 48%)",
        }}
      />
      <div className="absolute right-[-20px] top-[-40px] h-44 w-44 rounded-full bg-surface-primary/8" />
      <div className="absolute bottom-[-30px] left-[30%] h-32 w-32 rounded-full bg-surface-primary/6" />
      <div className="absolute right-[12%] top-[50%] h-20 w-20 rounded-full bg-surface-primary/5" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
            Repasos activos
          </p>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-content-inverted sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-[15px]">
            {description}
            <br />
            <span className="text-xs text-white/60 sm:text-sm">
              {eyebrow}
            </span>
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-surface-primary/8 p-3 backdrop-blur-sm sm:p-4">
          <div className="min-w-[120px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
            <p className="text-4xl font-extrabold leading-none text-content-inverted sm:text-5xl">
              {loading ? "--" : activeCount}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
              Lecciones listas
            </p>
            <motion.button
              type="button"
              whileHover={canStart ? { y: -1, scale: 1.01 } : undefined}
              whileTap={canStart ? { scale: 0.98 } : undefined}
              disabled={!canStart}
              onClick={onStartReview}
              className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold shadow-md transition-all ${
                canStart
                  ? "bg-surface-primary text-accent hover:bg-white hover:shadow-lg"
                  : "cursor-not-allowed bg-white/12 text-white/48 shadow-none"
              }`}
            >
              <Play className="h-4 w-4" />
              Comenzar
              {canStart && <ArrowRight className="h-4 w-4" />}
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
