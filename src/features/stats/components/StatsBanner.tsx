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
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#993331] to-[#7a2927] p-8 text-white shadow-lg md:p-10">
      <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-white/5" />
      <div className="absolute bottom-0 left-1/2 h-48 w-48 translate-y-1/2 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <AnimatedEntrance
            index={0}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mb-1 text-sm font-medium text-white/80">
              Resumen de rendimiento
            </p>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={1}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {title}
            </h2>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mt-2 max-w-md text-sm text-white/80">
              {subtitle}
              <br />
              <span className="text-xs text-white/60">
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
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="mb-1 h-10 w-16 animate-pulse rounded-lg bg-white/20" />
                  <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <div className="mb-1 h-10 w-12 animate-pulse rounded-lg bg-white/20" />
                  <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-4xl font-extrabold">{averageScore}%</p>
                  <p className="mt-1 text-xs font-medium text-white/70">
                    Precisión promedio
                  </p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-4xl font-extrabold">{streak}</p>
                  <p className="mt-1 text-xs font-medium text-white/70">
                    Días de racha
                  </p>
                </div>
              </>
            )}
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
}