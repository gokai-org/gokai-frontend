"use client";

import { Flame } from "lucide-react";

import type { KazuMascotState } from "@/features/mascot";
import {
  KAZU_ALERT_REVIEW_LIMIT,
  KAZU_LIGHT_REVIEW_LIMIT,
  type KazuProgressZone,
} from "../hooks/useReviewProgress";
import { KazuProgress } from "./KazuProgress";

interface ReviewHeroProps {
  zones: KazuProgressZone[];
  activeCount: number;
  currentStreak: number;
  streakActive?: boolean;
  mascotState: KazuMascotState;
  loading?: boolean;
  reducedMotion?: boolean;
}

const WEEKDAY_INDEX_BY_LABEL: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function getMexicoCityWeekdayIndex() {
  const weekdayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date());

  return WEEKDAY_INDEX_BY_LABEL[weekdayLabel] ?? 0;
}

export function ReviewHero({
  zones,
  activeCount,
  currentStreak,
  streakActive = currentStreak > 0,
  mascotState,
  loading = false,
  reducedMotion,
}: ReviewHeroProps) {
  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const currentWeekdayIndex = getMexicoCityWeekdayIndex();
  const activeWeekDays = loading || !streakActive
    ? 0
    : Math.min(currentStreak, weekDays.length);

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col gap-5 xl:h-full xl:min-h-0">
      <div
        data-help-target="reviews-kazu-card"
        data-help-target-priority="2"
        className="relative min-h-0 flex-1 overflow-hidden rounded-[32px] border border-border-subtle bg-surface-primary p-5 shadow-sm dark:bg-[#161616] sm:p-6 lg:p-8 xl:flex xl:flex-col"
      >
        <div className="relative flex min-h-full flex-1 flex-col">
          <div className="absolute right-0 top-0 lg:hidden">
            <div className="min-w-[92px] rounded-[22px] border border-accent/15 bg-gradient-to-br from-accent/10 via-surface-primary to-surface-secondary px-3 py-2 text-right shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm dark:ring-white/[0.03] sm:min-w-[108px] sm:px-3.5 sm:py-2.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent/80">
                Activos
              </p>
              <p className="mt-1 text-2xl font-extrabold leading-none text-content-primary sm:text-3xl">
                {loading ? "--" : activeCount}
              </p>
              <p className="mt-1 text-[11px] font-semibold leading-tight text-content-tertiary">
                repasos actuales
              </p>
            </div>
          </div>

          <div>
            <h1 className="pr-24 text-4xl font-extrabold leading-none tracking-[0.09em] text-accent sm:pr-28 sm:text-5xl lg:pr-0 lg:text-6xl">
              KAZU
            </h1>
            <p className="mt-1 pr-24 text-sm font-semibold text-content-tertiary sm:pr-28 sm:text-base lg:pr-0">
              Kazu refleja tu constancia
            </p>
            <p className="mt-2 max-w-sm pr-24 text-xs font-semibold leading-relaxed text-content-muted sm:pr-28 sm:text-sm lg:pr-0">
              Tu conocimiento se mantiene con práctica. Si dejas de repasar, el color se desvanece.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-border-subtle bg-surface-secondary px-3 py-1 text-[11px] font-extrabold text-content-secondary">
                Kazu sigue estable: 1 a {KAZU_LIGHT_REVIEW_LIMIT} repasos
              </span>
              <span className="rounded-full border border-border-subtle bg-surface-secondary px-3 py-1 text-[11px] font-extrabold text-content-secondary">
                Kazu te pide atencion: {KAZU_LIGHT_REVIEW_LIMIT + 1} a {KAZU_ALERT_REVIEW_LIMIT} repasos
              </span>
              <span className="rounded-full border border-border-subtle bg-surface-secondary px-3 py-1 text-[11px] font-extrabold text-content-secondary">
                Kazu empieza a apagarse: {KAZU_ALERT_REVIEW_LIMIT + 1}+ repasos
              </span>
            </div>
          </div>

          <div
            data-help-target="reviews-kazu-mascot"
            className="mt-2 flex min-h-0 flex-1 items-center"
          >
            <KazuProgress
              zones={zones}
              pendingReviewCount={loading ? 0 : activeCount}
              state={mascotState}
              reducedMotion={reducedMotion}
              className="mx-auto w-full"
            />
          </div>

          <div className="mt-3 lg:hidden">
            <div className="rounded-[24px] border border-border-subtle bg-surface-secondary/80 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
                    Racha
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className="text-3xl font-extrabold leading-none text-content-primary">
                      {loading ? "--" : currentStreak}
                    </p>
                    <span className="pb-0.5 text-xs font-bold text-content-tertiary">
                      dias
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl bg-surface-primary px-3 py-2 text-right shadow-sm ring-1 ring-border-subtle">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
                    Estado
                  </p>
                  <p className="mt-1 text-xs font-bold text-content-primary">
                    {loading ? "--" : streakActive ? "Activa" : "Pausada"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1.5">
                {weekDays.map((day, index) => {
                  const distanceFromToday = (currentWeekdayIndex - index + weekDays.length) % weekDays.length;
                  const active = distanceFromToday < activeWeekDays;

                  return (
                    <div key={`compact-${day}`} className="text-center">
                      <div
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-extrabold transition-colors ${
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
          </div>
        </div>
      </div>

      <div
        data-help-target="reviews-kazu-stats"
        data-help-target-priority="2"
        className="relative hidden overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary p-5 shadow-sm ring-1 ring-black/[0.02] dark:bg-[#161616] dark:ring-white/[0.04] lg:block"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl" />
        <div
          data-help-target="reviews-streak"
          className="relative grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(240px,1fr)] lg:items-center"
        >
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Flame className="h-4 w-4" />
              <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
                Racha actual
              </p>
            </div>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-5xl font-extrabold leading-none text-content-primary sm:text-6xl">
                {loading ? "--" : currentStreak}
              </p>
              <span className="pb-1 text-sm font-bold text-content-tertiary sm:text-base">
                días seguidos
              </span>
            </div>
            <p className="mt-2 max-w-sm text-sm font-semibold leading-relaxed text-content-tertiary">
              {loading
                ? "--"
                : streakActive
                  ? "Vas sosteniendo el hábito. Mantén la cadena activa con tu próximo repaso."
                  : "Tu cadena está en pausa. Un repaso hoy vuelve a encenderla."}
            </p>
          </div>

          <div className="rounded-[24px] border border-border-subtle bg-surface-secondary/75 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
                  Semana actual
                </p>
                <p className="mt-1 text-sm font-semibold text-content-secondary">
                  {loading
                    ? "--"
                    : streakActive
                      ? "Tus días encendidos se marcan aquí."
                      : "Completa un repaso para volver a llenarla."}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-primary px-3 py-2 text-right shadow-sm ring-1 ring-border-subtle">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
                  Estado
                </p>
                <p className="mt-1 text-sm font-bold text-content-primary">
                  {loading ? "--" : streakActive ? "En curso" : "Reiniciable"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const distanceFromToday = (currentWeekdayIndex - index + weekDays.length) % weekDays.length;
                const active = distanceFromToday < activeWeekDays;

                return (
                  <div key={day} className="text-center">
                    <div
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-extrabold transition-colors ${
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
        </div>
      </div>
    </section>
  );
}
