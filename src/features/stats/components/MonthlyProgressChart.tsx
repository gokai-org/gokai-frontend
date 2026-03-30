"use client";

import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { MonthlyProgressEntry } from "@/features/stats/types";

/*  Types */

interface MonthlyProgressChartProps {
  data?: MonthlyProgressEntry[] | null;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  animationsEnabled?: boolean;
}

/*  Custom tooltip  */

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-primary px-4 py-3 rounded-xl border border-border-subtle shadow-lg">
      <p className="text-xs text-content-tertiary font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-bold text-content-primary">
          {p.dataKey === "score"
            ? `Precisión: ${p.value}%`
            : `Repasos: ${p.value}`}
        </p>
      ))}
    </div>
  );
}

/* Component */

export function MonthlyProgressChart({
  data,
  title = "Progreso mensual",
  subtitle = "Evolución de tu precisión y sesiones",
  loading,
  animationsEnabled = true,
}: MonthlyProgressChartProps) {
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
                delay: 0.12,
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
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-content-tertiary">
            Sin datos mensuales aún
          </p>
          <p className="text-xs text-content-muted text-center max-w-[220px]">
            Tu evolución mes a mes aparecerá aquí conforme vayas estudiando.
          </p>
        </div>
      </Wrapper>
    );
  }

  const growth =
    data.length >= 2 ? data[data.length - 1].score - data[0].score : 0;

  return (
    <Wrapper
      {...(animationsEnabled
        ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: {
              duration: 0.6,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
          }
        : {})}
      className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-extrabold text-content-primary">{title}</h3>
          <p className="text-xs text-content-tertiary">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50">
          <svg
            className="w-3.5 h-3.5 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
          <span className="text-xs font-bold text-green-600">+{growth}%</span>
        </div>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-secondary)"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-tertiary)", fontWeight: 600 }}
            />
            <YAxis
              domain={[50, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--accent)"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: "var(--accent)",
                stroke: "var(--surface-primary)",
                strokeWidth: 2,
              }}
              animationDuration={animationsEnabled ? 1200 : 0}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-xs text-content-tertiary font-medium">Precisión</span>
        </div>
      </div>
    </Wrapper>
  );
}
