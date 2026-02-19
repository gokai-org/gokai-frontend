"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Flame,
  Target,
  Clock,
  TrendingUp,
  Award,
} from "lucide-react";
import type { ReactNode } from "react";

/* ── Types ────────────────────────────────────────────── */

export interface OverviewStat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: ReactNode;
  trend?: number; // percentage change
  accentColor?: string;
}

interface StatsOverviewProps {
  stats?: OverviewStat[];
}

/* ── Defaults ─────────────────────────────────────────── */

const defaultStats: OverviewStat[] = [
  {
    id: "study-time",
    label: "Horas de estudio",
    value: 142,
    suffix: "h",
    icon: <Clock className="w-6 h-6" />,
    trend: 12,
  },
  {
    id: "kanji-learned",
    label: "Kanji aprendidos",
    value: 384,
    icon: <BookOpen className="w-6 h-6" />,
    trend: 8,
  },
  {
    id: "accuracy",
    label: "Precisión promedio",
    value: 87,
    suffix: "%",
    icon: <Target className="w-6 h-6" />,
    trend: 3,
  },
  {
    id: "streak",
    label: "Racha actual",
    value: 14,
    suffix: " días",
    icon: <Flame className="w-6 h-6" />,
    trend: 0,
  },
  {
    id: "level",
    label: "Nivel actual",
    value: 12,
    prefix: "N",
    icon: <Award className="w-6 h-6" />,
    trend: 1,
  },
  {
    id: "reviews",
    label: "Repasos completados",
    value: 1256,
    icon: <TrendingUp className="w-6 h-6" />,
    trend: 15,
  },
];

/* ── Animated counter ─────────────────────────────────── */

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const step = end / (duration * 60);
    let raf: number;

    const animate = () => {
      start += step;
      if (start >= end) {
        setCount(end);
        return;
      }
      setCount(Math.floor(start));
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── Card ─────────────────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

function StatOverviewCard({
  stat,
  index,
}: {
  stat: OverviewStat;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, boxShadow: "0 12px 24px -4px rgba(153,51,49,0.12)" }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-default select-none"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#993331]/10 flex items-center justify-center text-[#993331]">
          {stat.icon}
        </div>
        {stat.trend !== undefined && stat.trend !== 0 && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 + 0.4 }}
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              stat.trend > 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {stat.trend > 0 ? "+" : ""}
            {stat.trend}%
          </motion.span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
        <AnimatedCounter
          value={stat.value}
          prefix={stat.prefix}
          suffix={stat.suffix}
        />
      </p>
      <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
    </motion.div>
  );
}

/* ── Main ─────────────────────────────────────────────── */

export function StatsOverview({ stats = defaultStats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <StatOverviewCard key={stat.id} stat={stat} index={i} />
      ))}
    </div>
  );
}
