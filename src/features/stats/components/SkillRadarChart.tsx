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
}

/*  Component  */

export function SkillRadarChart({
  data,
  title = "Habilidades",
  subtitle = "Tu dominio en cada área de estudio",
  loading,
}: SkillRadarChartProps) {
  const chartData = (data ?? []).map((d) => ({ ...d, fullMark: 100 }));

  if (loading || !data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-48 bg-gray-100 rounded mb-6" />
        <div className="h-[280px] bg-gray-50 rounded-xl" />
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
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
              stroke="#993331"
              fill="#993331"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: "#993331",
                strokeWidth: 0,
              }}
              animationDuration={1200}
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
            className="text-xs font-bold px-3 py-1 rounded-full bg-[#993331]/8 text-[#993331]"
          >
            {d.skill}: {d.value}%
          </span>
        ))}
      </div>
    </motion.div>
  );
}
