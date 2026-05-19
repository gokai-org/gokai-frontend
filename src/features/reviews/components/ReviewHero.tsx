"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Flame, HelpCircle, X } from "lucide-react";

import type { KazuMascotState } from "@/features/mascot";
import {
  KAZU_ALERT_REVIEW_LIMIT,
  KAZU_LIGHT_REVIEW_LIMIT,
  type KazuProgressZone,
} from "../hooks/useReviewProgress";
import { KazuProgress } from "./KazuProgress";
import { ReviewStreakFlame } from "./ReviewStreakFlame";

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

const KAZU_MASCOT_SIZE_CLASSNAMES = {
  standard: {
    container:
      "min-h-[clamp(18rem,56vw,24rem)] md:min-h-[clamp(24rem,44vw,29rem)] xl:min-h-[clamp(24rem,34vh,30rem)]",
    mascot:
      "w-full max-w-[clamp(17rem,58vw,23rem)] md:max-w-[clamp(23rem,41vw,29rem)] xl:max-w-[clamp(28rem,31vw,35rem)]",
  },
  portrait: {
    container:
      "min-h-[clamp(20rem,62vw,26rem)] md:min-h-[clamp(28rem,54vh,38rem)] lg:min-h-[clamp(32rem,58vh,44rem)]",
    mascot:
      "w-full max-w-[clamp(18rem,64vw,24rem)] md:max-w-[clamp(26rem,68vw,36rem)] lg:max-w-[clamp(30rem,70vw,40rem)]",
  },
  largeDesktop: {
    container:
      "min-h-[clamp(18rem,56vw,24rem)] md:min-h-[clamp(24rem,44vw,30rem)] xl:min-h-0 xl:flex-1",
    mascot:
      "w-full max-w-[clamp(17rem,58vw,23rem)] md:max-w-[clamp(23rem,41vw,30rem)] xl:h-full xl:w-auto xl:max-w-[min(48vw,48rem)] 2xl:max-w-[min(50vw,52rem)]",
  },
} as const;

const KAZU_HEADER_BOTTOM_SPACING_CLASSNAME = "pb-4 sm:pb-5 lg:pb-6 xl:pb-7";

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
  const [showKazuGuide, setShowKazuGuide] = useState(false);
  const [showStreakGuide, setShowStreakGuide] = useState(false);
  const [useCompactDesktopHero, setUseCompactDesktopHero] = useState(false);
  const [usePortraitHeroLayout, setUsePortraitHeroLayout] = useState(false);
  const [useLargeDesktopMascot, setUseLargeDesktopMascot] = useState(false);

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
  const kazuMascotSizeMode = useLargeDesktopMascot
    ? "largeDesktop"
    : usePortraitHeroLayout
      ? "portrait"
      : "standard";
  const kazuMascotContainerClassName =
    KAZU_MASCOT_SIZE_CLASSNAMES[kazuMascotSizeMode].container;
  const kazuMascotClassName =
    KAZU_MASCOT_SIZE_CLASSNAMES[kazuMascotSizeMode].mascot;

  const currentWeekdayIndex = getMexicoCityWeekdayIndex();
  const showStreakFlame = !loading && streakActive && currentStreak > 0;
  const activeWeekDays =
    loading || !streakActive ? 0 : Math.min(currentStreak, weekDays.length);

  const streakStates = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const minDays = index * 30 + 1;
    const maxDays = month * 30;

    return {
      month,
      sampleDays: minDays,
      title: `Mes ${month}`,
      detail:
        month === 12
          ? `${minDays}+ días de racha`
          : `${minDays} a ${maxDays} días de racha`,
    };
  });

  const kazuGuideZones = useMemo(
    () => [
      {
        title: "Kazu colorido",
        detail: `1 a ${KAZU_LIGHT_REVIEW_LIMIT} repasos pendientes`,
        helper: "Tu ritmo mantiene el color vivo y estable.",
        pendingReviewCount: 1,
        minimumVitality: 0.22,
        zones: zones.map((zone) => ({ ...zone, progress: 100, active: true })),
      },
      {
        title: "Kazu pálido",
        detail: `${KAZU_LIGHT_REVIEW_LIMIT + 1} a ${KAZU_ALERT_REVIEW_LIMIT} repasos pendientes`,
        helper: "El color baja cuando se acumulan repasos sin atender.",
        pendingReviewCount: 5,
        minimumVitality: 0.22,
        zones: zones.map((zone) => ({ ...zone, progress: 36, active: true })),
      },
      {
        title: "Kazu completamente gris",
        detail: `${KAZU_ALERT_REVIEW_LIMIT + 1}+ repasos pendientes`,
        helper: "Demasiada carga pendiente apaga por completo a Kazu.",
        pendingReviewCount: 9,
        minimumVitality: 0,
        zones: zones.map((zone) => ({ ...zone, progress: 0, active: false })),
      },
    ],
    [zones],
  );

  useEffect(() => {
    if (!showStreakGuide && !showKazuGuide) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowStreakGuide(false);
        setShowKazuGuide(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showKazuGuide, showStreakGuide]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 768px) and (max-height: 980px)");
    const largeDesktopQuery = window.matchMedia("(min-width: 1280px)");
    const portraitQuery = window.matchMedia("(orientation: portrait) and (min-width: 768px)");

    const updateCompactHero = () => {
      setUseCompactDesktopHero(mediaQuery.matches);
      setUseLargeDesktopMascot(largeDesktopQuery.matches && !mediaQuery.matches);
      setUsePortraitHeroLayout(portraitQuery.matches && !largeDesktopQuery.matches);
    };

    updateCompactHero();
    mediaQuery.addEventListener("change", updateCompactHero);
    largeDesktopQuery.addEventListener("change", updateCompactHero);
    portraitQuery.addEventListener("change", updateCompactHero);

    return () => {
      mediaQuery.removeEventListener("change", updateCompactHero);
      largeDesktopQuery.removeEventListener("change", updateCompactHero);
      portraitQuery.removeEventListener("change", updateCompactHero);
    };
  }, []);

  const modalShellClassName = "fixed inset-0 z-[260] overflow-y-auto";
  const modalBackdropClassName = "fixed inset-0 bg-black/50 backdrop-blur-sm";
  const modalDialogClassName =
    "relative w-full overflow-hidden rounded-[32px] bg-surface-primary shadow-2xl ring-1 ring-border-subtle";

  const kazuGuideOverlay =
    showKazuGuide && typeof document !== "undefined"
      ? createPortal(
          <div className={modalShellClassName}>
            <div
              className={modalBackdropClassName}
              onClick={() => setShowKazuGuide(false)}
            />
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Estados de Kazu"
                className={`${modalDialogClassName} max-w-6xl`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-5 sm:px-6 lg:px-8">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
                      Estados de Kazu
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-content-primary">
                      Cómo cambia con tus repasos
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-content-tertiary">
                      Este panel muestra cómo luce Kazu cuando mantiene su color, cuando empieza a desvanecerse y cuando la carga pendiente lo apaga por completo.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Cerrar estados de Kazu"
                    onClick={() => setShowKazuGuide(false)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-secondary text-content-tertiary transition-colors hover:bg-surface-tertiary hover:text-content-primary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-5 py-5 sm:px-6 lg:px-8">
                  <div className="grid gap-4 lg:grid-cols-3">
                    {kazuGuideZones.map((state) => (
                      <div
                        key={state.title}
                        className="rounded-[28px] border border-border-subtle bg-surface-secondary/72 p-4 shadow-sm"
                      >
                        <div className="rounded-[24px] border border-border-subtle bg-surface-primary px-3 py-4 shadow-sm">
                          <KazuProgress
                            zones={state.zones}
                            pendingReviewCount={state.pendingReviewCount}
                            state="idle"
                            reducedMotion
                            minimumVitality={state.minimumVitality}
                            className="mx-auto w-full max-w-[8.5rem]"
                          />
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-extrabold text-content-primary">
                            {state.title}
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-accent">
                            {state.detail}
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-content-tertiary">
                            {state.helper}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  const streakGuideOverlay =
    showStreakGuide && typeof document !== "undefined"
      ? createPortal(
          <div className={modalShellClassName}>
            <div
              className={modalBackdropClassName}
              onClick={() => setShowStreakGuide(false)}
            />
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Estados de racha"
                className={`${modalDialogClassName} max-w-5xl`}
              >
                <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-5 sm:px-6 lg:px-8">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">
                      Racha de repasos
                    </p>
                    <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-content-primary">
                      Los 12 estados del fuego
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-content-tertiary">
                      Cada mes activo sube el nivel visual de tu racha. El color cambia por meses, pero el número dentro del fuego marca los días alcanzados.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Cerrar estados de racha"
                    onClick={() => setShowStreakGuide(false)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-secondary text-content-tertiary transition-colors hover:bg-surface-tertiary hover:text-content-primary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[calc(min(90vh,52rem)-7.5rem)] overflow-y-auto px-5 py-5 sm:px-6 lg:px-8">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {streakStates.map((state) => (
                      <div
                        key={state.month}
                        className="rounded-[26px] border border-border-subtle bg-surface-secondary/78 p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <ReviewStreakFlame
                            days={state.sampleDays}
                            size="compact"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-content-primary">
                              {state.title}
                            </p>
                            <p className="mt-1 text-xs font-semibold leading-relaxed text-content-tertiary">
                              {state.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section className={`flex min-h-0 flex-col gap-3 xl:h-[calc(100dvh-9rem)] xl:max-h-[calc(100dvh-9rem)] xl:gap-2.5 ${usePortraitHeroLayout ? "md:min-h-[calc(100dvh-8rem)]" : ""}`}>
      {kazuGuideOverlay}
      {streakGuideOverlay}

      <div
        data-help-target="reviews-kazu-card"
        data-help-target-priority="2"
        className="relative min-h-[31rem] flex-1 overflow-hidden rounded-[32px] border border-border-subtle bg-surface-primary p-4 shadow-sm dark:bg-[#161616] sm:min-h-[34rem] sm:p-5 md:min-h-[37rem] lg:p-5 xl:min-h-0 xl:flex xl:flex-col xl:p-6"
      >
        <div
          className={`relative flex min-h-full flex-1 flex-col ${useCompactDesktopHero ? "md:gap-2 lg:gap-1.5" : ""}`}
        >
          <div className="absolute right-0 top-0 z-40 lg:hidden">
            <div className="min-w-[96px] rounded-[22px] border border-accent/70 bg-accent px-3 py-2 text-right shadow-[0_16px_36px_rgba(155,43,43,0.28)] ring-1 ring-white/10 sm:min-w-[112px] sm:px-3.5 sm:py-2.5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/80">
                Activos
              </p>
              <p className="mt-1 text-2xl font-extrabold leading-none text-white sm:text-3xl">
                {loading ? "--" : activeCount}
              </p>
              <p className="mt-1 text-[11px] font-semibold leading-tight text-white/88">
                repasos actuales
              </p>
            </div>
          </div>

          <div className={`relative z-50 min-h-[9rem] max-w-[28rem] pr-[7rem] sm:min-h-[9.5rem] sm:max-w-[30rem] sm:pr-[8rem] md:min-h-[10rem] md:max-w-[32rem] lg:max-w-[34rem] lg:pr-0 xl:min-h-[10.5rem] ${KAZU_HEADER_BOTTOM_SPACING_CLASSNAME}`}>
            <h1 className="text-4xl font-extrabold leading-none tracking-[0.09em] text-accent sm:text-5xl lg:text-[4.5rem] xl:text-[5rem]">
              KAZU
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-content-tertiary sm:text-base">
                Kazu refleja tu constancia
              </p>
              <button
                type="button"
                aria-label="Ver estados de Kazu"
                onClick={() => setShowKazuGuide(true)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-accent/20 bg-surface-primary text-accent transition-colors hover:border-accent/35 hover:bg-accent/10"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            data-help-target="reviews-kazu-mascot"
            className={`pointer-events-none relative z-0 mt-2 flex flex-1 min-h-0 items-end justify-center overflow-visible ${kazuMascotContainerClassName}`}
          >
            <KazuProgress
              zones={zones}
              pendingReviewCount={loading ? 0 : activeCount}
              state={mascotState}
              reducedMotion={reducedMotion}
              preferHeight={useLargeDesktopMascot}
              preferTallCrop={useLargeDesktopMascot}
              className={`relative z-0 mx-auto shrink-0 ${kazuMascotClassName}`}
            />
          </div>

          <div className="mt-4 md:hidden">
            <div
              data-help-target="reviews-streak-panel"
              className="rounded-[24px] border border-border-subtle bg-surface-secondary/95 p-4 shadow-sm backdrop-blur"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
                      Racha
                    </p>
                    <button
                      type="button"
                      aria-label="Ver estados de racha"
                      onClick={() => setShowStreakGuide(true)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-accent/20 bg-surface-primary text-accent transition-colors hover:border-accent/35 hover:bg-accent/10"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2.5">
                    {showStreakFlame ? (
                      <ReviewStreakFlame days={currentStreak} size="compact" />
                    ) : (
                      <p className="text-3xl font-extrabold leading-none text-content-primary">
                        {loading ? "--" : currentStreak}
                      </p>
                    )}
                    <span className="translate-y-1.5 text-sm font-extrabold text-content-tertiary sm:translate-y-0 sm:text-base">
                      días
                    </span>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col items-center justify-center">
                  <p className="text-sm font-extrabold text-content-tertiary sm:text-base">
                    Calendario
                  </p>
                  <div className="mt-2 grid w-full max-w-[15.5rem] grid-cols-7 justify-items-center gap-1 sm:max-w-[18rem] sm:gap-1.5">
                    {weekDays.map((day, index) => {
                      const distanceFromToday =
                        (currentWeekdayIndex - index + weekDays.length) %
                        weekDays.length;
                      const active = distanceFromToday < activeWeekDays;

                      return (
                        <div
                          key={`compact-${day}`}
                          className={`flex h-7 w-full max-w-7 items-center justify-center rounded-[10px] text-[10px] font-extrabold transition-colors sm:h-8 sm:max-w-8 sm:rounded-xl sm:text-[11px] ${
                            active
                              ? "bg-accent text-content-inverted shadow-sm"
                              : "bg-surface-tertiary text-content-muted"
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-help-target="reviews-kazu-stats"
        data-help-target-priority="2"
        className="relative hidden overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary p-3.5 shadow-sm ring-1 ring-black/[0.02] dark:bg-[#161616] dark:ring-white/[0.04] md:block xl:shrink-0 xl:p-3.5 2xl:p-4.5"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl" />

        <div
          data-help-target="reviews-streak-panel"
          className="relative grid gap-3 lg:grid-cols-[minmax(0,0.82fr)_minmax(220px,1fr)] lg:items-center"
        >
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Flame className="h-4 w-4" />
              <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
                Racha actual
              </p>
              <button
                type="button"
                aria-label="Ver estados de racha"
                onClick={() => setShowStreakGuide(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-accent/20 bg-surface-primary text-accent transition-colors hover:border-accent/35 hover:bg-accent/10"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-2.5 flex items-end gap-2.5">
              {showStreakFlame ? (
                <ReviewStreakFlame days={currentStreak} />
              ) : (
                <p className="text-4xl font-extrabold leading-none text-content-primary sm:text-5xl">
                  {loading ? "--" : currentStreak}
                </p>
              )}
              <span className="pb-0.5 text-sm font-extrabold text-content-tertiary sm:text-base">
                días seguidos
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-border-subtle bg-surface-secondary/75 p-3 sm:p-3.5 xl:p-3 2xl:p-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-content-tertiary">
                Semana actual
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-content-secondary sm:text-sm">
                {loading
                  ? "--"
                  : streakActive
                    ? "Tus días encendidos se marcan aquí."
                    : "Completa un repaso para volver a llenarla."}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-1.5">
              {weekDays.map((day, index) => {
                const distanceFromToday =
                  (currentWeekdayIndex - index + weekDays.length) %
                  weekDays.length;
                const active = distanceFromToday < activeWeekDays;

                return (
                  <div key={day} className="flex items-center justify-center">
                    <div
                      className={`flex aspect-square w-full max-w-7 items-center justify-center rounded-xl text-[10px] font-extrabold transition-colors sm:max-w-8 sm:text-[11px] xl:max-w-7 2xl:max-w-10 2xl:rounded-2xl 2xl:text-xs ${
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