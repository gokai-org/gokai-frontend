"use client";

import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";

interface StatsBannerProps {
  title: string;
  subtitle: string;
  averageScore: number;
  streak: number;
  loading?: boolean;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function StatsBanner({
  title,
  subtitle,
  averageScore,
  streak,
  loading = false,
  animationsEnabled = true,
  heavyAnimationsEnabled = true,
}: StatsBannerProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-accent to-accent-hover p-6 text-content-inverted shadow-lg sm:p-8 lg:p-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[32px]" style={{ background: "radial-gradient(ellipse at 72% -8%, rgba(255,255,255,0.20) 0%, transparent 52%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[32px]" style={{ background: "radial-gradient(ellipse at 12% 108%, rgba(255,255,255,0.11) 0%, transparent 48%)" }} />
      <div className="absolute right-[-20px] top-[-40px] h-44 w-44 rounded-full bg-surface-primary/8" />
      <div className="absolute bottom-[-30px] left-[30%] h-32 w-32 rounded-full bg-surface-primary/6" />
      <div className="absolute right-[12%] top-[50%] h-20 w-20 rounded-full bg-surface-primary/5" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <AnimatedEntrance
            index={0}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
              Resumen de rendimiento
            </p>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={1}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-content-inverted sm:text-3xl lg:text-4xl">
              {title}
            </h2>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-[15px]">
              {subtitle}
              <br />
              <span className="text-xs text-white/60 sm:text-sm">
                統計を確認して、学習の進歩を追跡しましょう。
              </span>
            </p>
          </AnimatedEntrance>
        </div>

        <AnimatedEntrance
          index={3}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/10 bg-surface-primary/8 p-3 backdrop-blur-sm sm:gap-4 sm:p-4">
            {loading ? (
              <>
                <div className="min-w-[90px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
                  <div className="mx-auto mb-2 h-8 w-14 animate-pulse rounded-lg bg-surface-primary/20" />
                  <div className="mx-auto h-3 w-20 animate-pulse rounded bg-surface-primary/10" />
                </div>
                <div className="min-w-[90px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
                  <div className="mx-auto mb-2 h-8 w-14 animate-pulse rounded-lg bg-surface-primary/20" />
                  <div className="mx-auto h-3 w-20 animate-pulse rounded bg-surface-primary/10" />
                </div>
              </>
            ) : (
              <>
                <div className="min-w-[90px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
                  <p className="text-3xl font-extrabold leading-none text-content-inverted sm:text-4xl">
                    {averageScore}%
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
                    Precisión promedio
                  </p>
                </div>

                <div className="min-w-[90px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
                  <p className="text-3xl font-extrabold leading-none text-content-inverted sm:text-4xl">
                    {streak}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
                    Días de racha
                  </p>
                </div>
              </>
            )}
          </div>
        </AnimatedEntrance>
      </div>
    </section>
  );
}