"use client";

import { Flame, Gauge } from "lucide-react";

import type { KazuMascotState } from "@/features/mascot";
import type { KazuProgressZone } from "../hooks/useReviewProgress";
import { KazuProgress } from "./KazuProgress";

interface ReviewHeroProps {
  zones: KazuProgressZone[];
  activeCount: number;
  currentStreak: number;
  constancyScore: number;
  daysSinceLatestReview: number | null;
  mascotState: KazuMascotState;
  loading?: boolean;
  reducedMotion?: boolean;
}

export function ReviewHero({
  zones,
  activeCount,
  currentStreak,
  constancyScore,
  daysSinceLatestReview,
  mascotState,
  loading = false,
  reducedMotion,
}: ReviewHeroProps) {
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const activeWeekDays = loading ? 0 : Math.min(currentStreak, weekDays.length);
  const freshnessLabel = loading
    ? "--"
    : daysSinceLatestReview === null
      ? "Sin repaso reciente"
      : daysSinceLatestReview === 0
        ? "Repasado hoy"
        : `Hace ${daysSinceLatestReview}d`;

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col gap-5 xl:h-full xl:min-h-0">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[32px] border border-border-subtle bg-surface-primary p-5 shadow-sm dark:bg-[#161616] sm:p-6 lg:p-8 xl:flex xl:flex-col">
        <div className="relative flex min-h-full flex-1 flex-col">
          <div>
            <h1 className="text-4xl font-extrabold leading-none tracking-[0.09em] text-accent sm:text-5xl lg:text-6xl">
              KAZU
            </h1>
            <p className="mt-1 text-sm font-semibold text-content-tertiary sm:text-base">
              Kazu refleja tu constancia
            </p>
            <p className="mt-2 max-w-sm text-xs font-semibold leading-relaxed text-content-muted sm:text-sm">
              Tu conocimiento se mantiene con práctica. Si dejas de repasar, el color se desvanece.
            </p>
          </div>

          <div className="mt-2 flex min-h-0 flex-1 items-center">
            <KazuProgress
              zones={zones}
              pendingReviewCount={loading ? 0 : activeCount}
              state={mascotState}
              reducedMotion={reducedMotion}
              className="mx-auto w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:gap-5">
        <div className="rounded-[28px] border border-border-subtle bg-surface-primary p-5 shadow-sm ring-1 ring-black/[0.02] dark:bg-[#161616] dark:ring-white/[0.04]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Flame className="h-4 w-4" />
                <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
                  Racha actual
                </p>
              </div>
              <p className="mt-2 text-4xl font-extrabold leading-none text-content-primary">
                {loading ? "--" : currentStreak}
                <span className="ml-2 text-sm font-bold text-content-tertiary">
                  días
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {weekDays.map((day, index) => {
              const active = index >= weekDays.length - activeWeekDays;

              return (
                <div key={day} className="text-center">
                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition-colors ${
                      active
                        ? "bg-accent text-content-inverted shadow-sm"
                        : "bg-surface-tertiary text-content-muted"
                    }`}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-border-subtle bg-surface-primary p-5 shadow-sm ring-1 ring-black/[0.02] dark:bg-[#161616] dark:ring-white/[0.04]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-accent">
                <Gauge className="h-4 w-4" />
                <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
                  Estado actual
                </p>
              </div>
              <p className="mt-2 text-4xl font-extrabold leading-none text-content-primary">
                {loading ? "--" : constancyScore}
                <span className="ml-2 text-sm font-bold text-content-tertiary">
                  activo
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-tertiary">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
              style={{
                width: `${constancyScore}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-content-tertiary">
            Mantén activo tu progreso. {freshnessLabel}.
          </p>
        </div>
      </div>
    </section>
  );
}
