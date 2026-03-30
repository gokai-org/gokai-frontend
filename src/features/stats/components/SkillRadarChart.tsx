"use client";

import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SkillEntry } from "@/features/stats/types";

/*  Types   */

interface SkillRadarChartProps {
  data?: SkillEntry[] | null;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  animationsEnabled?: boolean;
}

/*  Component  */

export function SkillRadarChart({
  data,
  title = "Habilidades",
  subtitle = "Tu dominio en cada área de estudio",
  loading,
  animationsEnabled = true,
}: SkillRadarChartProps) {
  const chartData = (data ?? []).map((d) => ({ ...d, fullMark: 100 }));
  const Wrapper = animationsEnabled ? motion.div : "div";

  if (loading) {
    return (
      <div className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle animate-pulse">
        <div className="h-5 w-32 bg-surface-tertiary rounded mb-2" />
        <div className="h-3 w-48 bg-surface-tertiary rounded mb-6" />
        <div className="h-[280px] bg-surface-secondary rounded-xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Wrapper
        {...(animationsEnabled
          ? {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              },
            }
          : {})}
        className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle"
      >
        <div className="mb-4">
          <h3 className="text-lg font-extrabold text-content-primary">{title}</h3>
          <p className="text-xs text-content-tertiary">{subtitle}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 90,35 80,80 20,80 10,35"
                fill="none"
                stroke="var(--border-primary)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <polygon
                points="50,25 75,40 70,70 30,70 25,40"
                fill="none"
                stroke="var(--border-secondary)"
                strokeWidth="1"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-content-tertiary">
            Tus habilidades se mostrarán aquí
          </p>
          <p className="text-xs text-content-muted text-center max-w-[200px]">
            Practica kanji, kana, vocabulario y gramática para ver tu radar de
            dominio.
          </p>
        </div>
      </Wrapper>
    );
  }
  return (
    <Wrapper
      {...(animationsEnabled
        ? {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: {
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
          }
        : {})}
      className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle"
    >
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-content-primary">{title}</h3>
        <p className="text-xs text-content-tertiary">{subtitle}</p>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="var(--border-primary)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-elevated)",
                border: "1px solid var(--border-primary)",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [`${value}%`, "Dominio"]}
            />
            <Radar
              name="Habilidades"
              dataKey="value"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "var(--accent)",
                strokeWidth: 0,
              }}
              animationDuration={animationsEnabled ? 1200 : 0}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill pills */}
      <div className="flex flex-wrap gap-2 mt-2">
        {chartData.map((d) => (
          <span
            key={d.skill}
            className="text-xs font-bold px-3 py-1 rounded-full bg-accent/8 text-accent"
          >
            {d.skill}: {d.value}%
          </span>
        ))}
      </div>
    </Wrapper>
  );
}
