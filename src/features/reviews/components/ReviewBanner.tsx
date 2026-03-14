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
              Sesión de repaso
            </p>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={1}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              ¡Hora de repasar!
            </h2>
          </AnimatedEntrance>

          <AnimatedEntrance
            index={2}
            disabled={!animationsEnabled}
            mode={heavyAnimationsEnabled ? "default" : "light"}
          >
            <p className="mt-2 max-w-md text-sm text-white/80">
              復習の時間です。少しずつ進めましょう！
              <br />
              <span className="text-xs text-white/60">
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
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold">{pendingCount}</p>
              <p className="mt-1 text-xs font-medium text-white/70">
                Pendientes
              </p>
            </div>
          </div>
        </AnimatedEntrance>
      </div>
    </div>
  );
}