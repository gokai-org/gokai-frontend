"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { StreakCalendarResponse } from "@/features/stats/types";

/*  Types  */

interface StudyStreakCalendarProps {
  data?: StreakCalendarResponse | null;
  title?: string;
  subtitle?: string;
  weeks?: number;
  loading?: boolean;
  animationsEnabled?: boolean;
}

/*  Helpers  */

function generateEmptyData(weeks: number): Record<string, number> {
  const map: Record<string, number> = {};
  const today = new Date();
  const totalDays = weeks * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }
  return map;
}

function getIntensity(minutes: number): string {
  if (minutes === 0) return "bg-surface-tertiary";
  if (minutes < 20) return "bg-accent/20";
  if (minutes < 40) return "bg-accent/40";
  if (minutes < 60) return "bg-accent/60";
  return "bg-accent";
}

const dayLabels = ["", "Lun", "", "Mié", "", "Vie", ""];

/*  Component  */

export function StudyStreakCalendar({
  data,
  title = "Calendario de estudio",
  subtitle = "Tu consistencia en las últimas semanas",
  weeks = 12,
  loading,
  animationsEnabled = true,
}: StudyStreakCalendarProps) {
  const Wrapper = animationsEnabled ? motion.div : "div";
  const CellWrapper = animationsEnabled ? motion.div : "div";

  const calendarData = useMemo(
    () => data?.streakDays ?? generateEmptyData(weeks),
    [data, weeks],
  );

  const grid = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const cols: Array<Array<{ date: string; minutes: number }>> = [];

    for (let w = 0; w < weeks; w++) {
      const col: Array<{ date: string; minutes: number }> = [];
      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(today);
        dateObj.setDate(dateObj.getDate() - (totalDays - 1 - (w * 7 + d)));
        const key = dateObj.toISOString().slice(0, 10);
        col.push({ date: key, minutes: calendarData[key] || 0 });
      }
      cols.push(col);
    }
    return cols;
  }, [calendarData, weeks]);

  const totalDays = Object.values(calendarData).filter((v) => v > 0).length;
  const totalMinutes = Object.values(calendarData).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle animate-pulse">
        <div className="h-5 w-40 bg-surface-tertiary rounded mb-2" />
        <div className="h-3 w-56 bg-surface-tertiary rounded mb-6" />
        <div className="h-[120px] bg-surface-secondary rounded-xl" />
      </div>
    );
  }

  const hasActivity = totalDays > 0;

  return (
    <Wrapper
      {...(animationsEnabled
        ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: {
              duration: 0.6,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
          }
        : {})}
      className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-extrabold text-content-primary">
            {title}
          </h3>
          <p className="text-xs text-content-tertiary">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/10 text-accent">
            {totalDays} días activos
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-tertiary text-content-secondary">
            {Math.round(totalMinutes / 60)}h totales
          </span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-2 shrink-0">
          {dayLabels.map((label, i) => (
            <div key={i} className="w-8 h-[14px] flex items-center justify-end">
              <span className="text-[10px] text-content-muted font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        {grid.map((col, wIdx) => (
          <div key={wIdx} className="flex flex-col gap-1">
            {col.map((cell) => (
              <CellWrapper
                key={cell.date}
                {...(animationsEnabled
                  ? {
                      initial: { scale: 0, opacity: 0 },
                      animate: { scale: 1, opacity: 1 },
                      transition: {
                        delay: wIdx * 0.02 + Math.random() * 0.1,
                        duration: 0.3,
                      },
                    }
                  : {})}
                title={`${cell.date}: ${cell.minutes} min`}
                className={`w-[14px] h-[14px] rounded-[3px] ${getIntensity(
                  cell.minutes,
                )} hover:ring-2 hover:ring-accent/30 transition-all cursor-default`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-content-muted">Menos</span>
        {[
          "bg-surface-tertiary",
          "bg-accent/20",
          "bg-accent/40",
          "bg-accent/60",
          "bg-accent",
        ].map((cls, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-content-muted">Más</span>
      </div>

      {!hasActivity && (
        <div className="mt-4 text-center border-t border-border-subtle pt-4">
          <p className="text-sm font-semibold text-content-tertiary">
            Tu calendario está esperando por ti
          </p>
          <p className="text-xs text-content-muted mt-1">
            Cada sesión de estudio iluminará un cuadro. ¡Comienza hoy!
          </p>
        </div>
      )}
    </Wrapper>
  );
}
