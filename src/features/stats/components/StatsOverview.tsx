"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BookOpen, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import type { OverviewStatsResponse } from "@/features/stats/types";

interface StatCard {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: ReactNode;
  trend?: number;
  formatter?: (value: number) => string;
}

interface StatsOverviewProps {
  data?: OverviewStatsResponse | null;
  loading?: boolean;
  animationsEnabled?: boolean;
}

const defaultCards: StatCard[] = [
  {
    id: "kanji-learned",
    label: "Kanji aprendidos",
    value: 0,
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: "hiragana-learned",
    label: "Hiragana aprendidos",
    value: 0,
    icon: (
      <span className="text-base font-bold leading-none select-none">あ</span>
    ),
  },
  {
    id: "katakana-learned",
    label: "Katakana aprendidos",
    value: 0,
    icon: (
      <span className="text-base font-bold leading-none select-none">カ</span>
    ),
  },
  {
    id: "reviews",
    label: "Repasos completados",
    value: 0,
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapToCards(data: OverviewStatsResponse): StatCard[] {
  return [
    {
      id: "kanji-learned",
      label: "Kanji aprendidos",
      value: safeNumber(data.kanjiLearned),
      icon: <BookOpen className="w-6 h-6" />,
      trend: safeNumber(data.kanjiLearnedTrend),
    },
    {
      id: "hiragana-learned",
      label: "Hiragana aprendidos",
      value: safeNumber(data.hiraganaLearned),
      icon: (
        <span className="text-base font-bold leading-none select-none">あ</span>
      ),
      trend: safeNumber(data.hiraganaLearnedTrend),
    },
    {
      id: "katakana-learned",
      label: "Katakana aprendidos",
      value: safeNumber(data.katakanaLearned),
      icon: (
        <span className="text-base font-bold leading-none select-none">カ</span>
      ),
      trend: safeNumber(data.katakanaLearnedTrend),
    },
    {
      id: "reviews",
      label: "Repasos completados",
      value: safeNumber(data.reviewsCompleted),
      icon: <TrendingUp className="w-6 h-6" />,
      trend: safeNumber(data.reviewsCompletedTrend),
    },
  ];
}

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
  animationsEnabled = true,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  animationsEnabled?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = Number.isFinite(value) ? value : 0;

    if (!animationsEnabled || end <= 0) {
      const finalValue = end <= 0 ? 0 : end;
      const raf = requestAnimationFrame(() => setCount(finalValue));
      return () => cancelAnimationFrame(raf);
    }

    let start = 0;
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
  }, [value, duration, animationsEnabled]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-primary rounded-2xl p-5 shadow-sm border border-border-subtle animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-surface-tertiary" />
        <div className="w-12 h-5 rounded-full bg-surface-tertiary" />
      </div>
      <div className="h-7 w-20 bg-surface-tertiary rounded mb-2" />
      <div className="h-3 w-24 bg-surface-tertiary rounded" />
    </div>
  );
}

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
  animationsEnabled = true,
}: {
  stat: StatCard;
  index: number;
  animationsEnabled?: boolean;
}) {
  const CardWrapper = animationsEnabled ? motion.div : "div";
  const TrendWrapper = animationsEnabled ? motion.span : "span";

  return (
    <CardWrapper
      {...(animationsEnabled
        ? {
            custom: index,
            variants: cardVariants,
            initial: "hidden" as const,
            animate: "visible" as const,
            whileHover: {
              y: -4,
              boxShadow: "0 12px 24px -4px rgba(153,51,49,0.12)",
            },
          }
        : {})}
      className="bg-surface-primary rounded-2xl p-5 shadow-sm border border-border-subtle cursor-default select-none"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/15 to-accent/6 ring-1 ring-inset ring-accent/14 flex items-center justify-center text-accent">
          {stat.icon}
        </div>

        {stat.trend !== undefined && stat.trend !== 0 && (
          <TrendWrapper
            {...(animationsEnabled
              ? {
                  initial: { opacity: 0, x: 8 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: index * 0.08 + 0.4 },
                }
              : {})}
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              stat.trend > 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {stat.trend > 0 ? "+" : ""}
            {stat.trend}%
          </TrendWrapper>
        )}
      </div>

      <p className="text-2xl font-extrabold text-content-primary tracking-tight">
        {stat.formatter ? (
          stat.formatter(stat.value)
        ) : (
          <AnimatedCounter
            value={stat.value}
            prefix={stat.prefix}
            suffix={stat.suffix}
            animationsEnabled={animationsEnabled}
          />
        )}
      </p>

      <p className="text-xs text-content-tertiary font-medium mt-1">
        {stat.label}
      </p>
    </CardWrapper>
  );
}

export function StatsOverview({
  data,
  loading,
  animationsEnabled = true,
}: StatsOverviewProps) {
  const cards = data ? mapToCards(data) : defaultCards;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <StatOverviewCard
          key={stat.id}
          stat={stat}
          index={i}
          animationsEnabled={animationsEnabled}
        />
      ))}
    </div>
  );
}
