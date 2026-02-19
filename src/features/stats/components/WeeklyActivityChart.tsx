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

/*   Types  */

export interface WeeklyData {
  day: string;
  minutes: number;
}

interface WeeklyActivityChartProps {
  data?: WeeklyData[];
  title?: string;
  subtitle?: string;
  highlight?: string;
}

/*  Defaults  */

const defaultData: WeeklyData[] = [
  { day: "Lun", minutes: 45 },
  { day: "Mar", minutes: 62 },
  { day: "Mié", minutes: 78 },
  { day: "Jue", minutes: 55 },
  { day: "Vie", minutes: 40 },
  { day: "Sáb", minutes: 90 },
  { day: "Dom", minutes: 35 },
];

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
    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-lg">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-extrabold text-gray-900">
        {payload[0].value} min
      </p>
    </div>
  );
}

/*  Component  */

export function WeeklyActivityChart({
  data = defaultData,
  title = "Actividad semanal",
  subtitle = "Minutos de estudio por día",
  highlight = "Mié",
}: WeeklyActivityChartProps) {
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / data.length);
  const maxDay = data.reduce((max, d) => (d.minutes > max.minutes ? d : max), data[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-[#993331]">
            +{((maxDay.minutes / avgMinutes - 1) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">vs promedio</p>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 my-4">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
          Total: {totalMinutes} min
        </span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#993331]/10 text-[#993331]">
          Promedio: {avgMinutes} min/día
        </span>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32} barGap={8}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickFormatter={(v) => `${v}`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(153,51,49,0.04)" }} />
            <Bar
              dataKey="minutes"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.day}
                  fill={entry.day === highlight ? "#993331" : "#1f2937"}
                  opacity={entry.day === highlight ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
