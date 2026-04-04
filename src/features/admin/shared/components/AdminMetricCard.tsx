"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AdminMetricCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  trend?: number;
  animationsEnabled?: boolean;
  index?: number;
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

export function AdminMetricCard({
  title,
  value,
  hint,
  icon,
  trend,
  animationsEnabled = true,
  index = 0,
}: AdminMetricCardProps) {
  const Wrapper = animationsEnabled ? motion.article : "article";
  const TrendWrapper = animationsEnabled ? motion.span : "span";

  return (
    <Wrapper
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
      className="h-full min-h-[156px] rounded-2xl border border-border-subtle bg-surface-primary p-5 shadow-sm cursor-default select-none"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
          {icon ?? <span className="text-sm font-bold">数</span>}
        </div>

        {trend !== undefined && trend !== 0 && (
          <TrendWrapper
            {...(animationsEnabled
              ? {
                  initial: { opacity: 0, x: 8 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: index * 0.08 + 0.4 },
                }
              : {})}
            className={[
              "rounded-full px-2 py-1 text-xs font-bold",
              trend > 0
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600",
            ].join(" ")}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </TrendWrapper>
        )}
      </div>

      <p className="text-2xl font-extrabold tracking-tight text-content-primary">
        {value}
      </p>
      <h2 className="mt-1 text-xs font-medium text-content-tertiary">
        {title}
      </h2>
      {hint && (
        <p className="mt-1 line-clamp-2 text-xs text-content-tertiary">
          {hint}
        </p>
      )}
    </Wrapper>
  );
}
