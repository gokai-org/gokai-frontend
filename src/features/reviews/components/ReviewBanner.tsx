"use client";

import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";

interface ReviewBannerProps {
  pendingCount: number;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function ReviewBanner({
  pendingCount,
  animationsEnabled = true,
  heavyAnimationsEnabled = true,
}: ReviewBannerProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-accent to-accent-hover p-6 text-content-inverted shadow-lg sm:p-8 lg:p-10">
      <div className="absolute right-[-20px] top-[-40px] h-44 w-44 rounded-full bg-surface-primary/5" />
      <div className="absolute bottom-[-30px] left-[30%] h-32 w-32 rounded-full bg-surface-primary/5" />
      <div className="absolute right-[12%] top-[50%] h-20 w-20 rounded-full bg-surface-primary/5" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <AnimatedEntrance
            index={0}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
              Sesión de repaso
            </p>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={1}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-content-inverted sm:text-3xl lg:text-4xl">
              ¡Hora de repasar!
            </h2>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-[15px]">
              復習の時間です。少しずつ進めましょう！
              <br />
              <span className="text-xs text-white/60 sm:text-sm">
                Es momento de repasar. ¡Vamos paso a paso!
              </span>
            </p>
          </AnimatedEntrance>
        </div>

        <AnimatedEntrance
          index={3}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div className="rounded-[24px] border border-white/10 bg-surface-primary/8 p-3 backdrop-blur-sm sm:p-4">
            <div className="min-w-[120px] rounded-2xl bg-surface-primary/6 px-4 py-4 text-center">
              <p className="text-3xl font-extrabold leading-none text-content-inverted sm:text-4xl">
                {pendingCount}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-white/70 sm:text-xs">
                Pendientes
              </p>
            </div>
          </div>
        </AnimatedEntrance>
      </div>
    </section>
  );
}