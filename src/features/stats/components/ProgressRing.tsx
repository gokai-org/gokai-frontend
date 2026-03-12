"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { DistributionCategory } from "@/features/stats/types";

/*  Types  */

interface ColoredCategory {
  label: string;
  value: number;
  color: string;
}

interface ProgressRingProps {
  total?: number;
  categories?: DistributionCategory[] | null;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

/* ── Color map para categorías ── */

const CATEGORY_COLORS: Record<string, string> = {
  Kanji: "#993331",
  Hiragana: "#b45309",
  Katakana: "#0369a1",
  Vocabulario: "#6b7280",
  "Gramática": "#059669",
};

const FALLBACK_COLOR = "#d1d5db";

function withColors(cats: DistributionCategory[]): ColoredCategory[] {
  return cats.map((c) => ({
    ...c,
    color: CATEGORY_COLORS[c.label] ?? FALLBACK_COLOR,
  }));
}

/*  SVG Ring  */

function Ring({
  categories,
  size = 180,
  strokeWidth = 20,
}: {
  categories: ColoredCategory[];
  size?: number;
  strokeWidth?: number;
}) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const segments = useMemo(() => {
    return categories.map((cat, i) => {
      const segmentLength = (cat.value / 100) * circumference;
      const startOffset = categories
        .slice(0, i)
        .reduce((sum, c) => sum + (c.value / 100) * circumference, 0);
      return { cat, segmentLength, startOffset };
    });
  }, [categories, circumference]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={strokeWidth}
      />
      {/* Segments */}
      {segments.map(({ cat, segmentLength, startOffset }) => (
        <circle
          key={cat.label}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={cat.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${animated ? segmentLength : 0} ${circumference}`}
          strokeDashoffset={-startOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: "stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      ))}
    </svg>
  );
}

/*  Component  */

export function ProgressRing({
  total = 0,
  categories,
  title = "Progreso total",
  subtitle = "Distribución de estudio por categoría",
  loading,
}: ProgressRingProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-48 bg-gray-100 rounded mb-6" />
        <div className="h-[180px] w-[180px] mx-auto bg-gray-50 rounded-full" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="mb-4">
          <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <div className="relative w-[140px] h-[140px]">
            <svg width={140} height={140} viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="55" fill="none" stroke="#f3f4f6" strokeWidth="16" />
              <circle cx="70" cy="70" r="55" fill="none" stroke="#e5e7eb" strokeWidth="16" strokeDasharray="12 8" opacity={0.5} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-gray-300">0</span>
              <span className="text-xs text-gray-300">items</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-500">Sin distribución aún</p>
          <p className="text-xs text-gray-400 text-center max-w-[200px]">
            A medida que estudies, verás aquí cómo se distribuye tu progreso entre categorías.
          </p>
        </div>
      </motion.div>
    );
  }

  const colored = withColors(categories);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <Ring categories={colored} />
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">Total</span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-2xl font-extrabold text-gray-900"
            >
              {total}
            </motion.span>
            <span className="text-xs text-gray-400">items</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 space-y-2">
        {colored.map((cat) => (
          <div key={cat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {cat.label}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">{cat.value}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
