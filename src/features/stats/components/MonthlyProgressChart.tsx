"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

/*  Types */

export interface MonthlyData {
  month: string;
  score: number;
  reviews: number;
}

interface MonthlyProgressChartProps {
  data?: MonthlyData[];
  title?: string;
  subtitle?: string;
}

/*  Defaults */

const defaultData: MonthlyData[] = [
  { month: "Sep", score: 62, reviews: 120 },
  { month: "Oct", score: 68, reviews: 180 },
  { month: "Nov", score: 71, reviews: 210 },
  { month: "Dic", score: 75, reviews: 250 },
  { month: "Ene", score: 82, reviews: 310 },
  { month: "Feb", score: 87, reviews: 385 },
];

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
    <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-lg">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-bold text-gray-900">
          {p.dataKey === "score" ? `Precisión: ${p.value}%` : `Repasos: ${p.value}`}
        </p>
      ))}
    </div>
  );
}

/* Component */

export function MonthlyProgressChart({
  data = defaultData,
  title = "Progreso mensual",
  subtitle = "Evolución de tu precisión y sesiones",
}: MonthlyProgressChartProps) {
  const growth =
    data.length >= 2
      ? data[data.length - 1].score - data[0].score
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
          <span className="text-xs font-bold text-green-600">+{growth}%</span>
        </div>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#993331" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#993331" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }}
            />
            <YAxis
              domain={[50, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#993331"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ r: 4, fill: "#993331", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#993331", stroke: "#fff", strokeWidth: 2 }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#993331]" />
          <span className="text-xs text-gray-500 font-medium">Precisión</span>
        </div>
      </div>
    </motion.div>
  );
}
