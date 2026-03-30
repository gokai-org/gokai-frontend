"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { WeeklyActivityEntry } from "@/features/stats/types";

/*   Types  */

interface WeeklyActivityChartProps {
  data?: WeeklyActivityEntry[] | null;
  title?: string;
  subtitle?: string;
  highlight?: string;
  loading?: boolean;
  animationsEnabled?: boolean;
}

/*  Custom tooltip   */

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-primary px-4 py-2 rounded-xl border border-border-subtle shadow-lg">
      <p className="text-xs text-content-tertiary font-medium">{label}</p>
      <p className="text-sm font-extrabold text-content-primary">
        {payload[0].value} min
      </p>
    </div>
  );
}

/*  Component  */

export function WeeklyActivityChart({
  data,
  title = "Actividad semanal",
  subtitle = "Minutos de estudio por día",
  highlight,
  loading,
  animationsEnabled = true,
}: WeeklyActivityChartProps) {
  const Wrapper = animationsEnabled ? motion.div : "div";

  if (loading) {
    return (
      <div className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle animate-pulse">
        <div className="h-5 w-40 bg-surface-tertiary rounded mb-2" />
        <div className="h-3 w-56 bg-surface-tertiary rounded mb-6" />
        <div className="h-[220px] bg-surface-secondary rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Wrapper
        {...(animationsEnabled
          ? {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: {
                duration: 0.6,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              },
            }
          : {})}
        className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle"
      >
        <h3 className="text-lg font-extrabold text-content-primary">{title}</h3>
        <p className="text-xs text-content-tertiary mb-6">{subtitle}</p>
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-surface-tertiary flex items-center justify-center">
            <svg
              className="w-7 h-7 text-content-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-content-tertiary">
            Sin actividad esta semana
          </p>
          <p className="text-xs text-content-muted text-center max-w-[220px]">
            Completa lecciones de kanji, kana o gramática y tu progreso
            aparecerá aquí.
          </p>
        </div>
      </Wrapper>
    );
  }

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / data.length);
  const maxDay = data.reduce(
    (max, d) => (d.minutes > max.minutes ? d : max),
    data[0],
  );
  const highlightDay = highlight ?? maxDay.day;

  return (
    <Wrapper
      {...(animationsEnabled
        ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: {
              duration: 0.6,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
          }
        : {})}
      className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-lg font-extrabold text-content-primary">{title}</h3>
          <p className="text-xs text-content-tertiary">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-accent">
            +{((maxDay.minutes / avgMinutes - 1) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-content-tertiary">vs promedio</p>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 my-4">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-tertiary text-content-secondary">
          Total: {totalMinutes} min
        </span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/10 text-accent">
          Promedio: {avgMinutes} min/día
        </span>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32} barGap={8}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-secondary)"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-tertiary)", fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickFormatter={(v) => `${v}`}
              width={35}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(153,51,49,0.04)" }}
            />
            <Bar
              dataKey="minutes"
              radius={[8, 8, 0, 0]}
              animationDuration={animationsEnabled ? 1000 : 0}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.day}
                  fill={entry.day === highlightDay ? "var(--accent)" : "var(--text-primary)"}
                  opacity={entry.day === highlightDay ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Wrapper>
  );
}
