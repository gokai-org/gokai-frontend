"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export type AnimatedLessonTab<T extends string> = {
  id: T;
  label: string;
  icon: ReactNode;
};

export const LESSON_SECTION_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 42 : -42,
    opacity: 0,
    rotateY: direction > 0 ? -10 : 10,
    rotateX: 2,
    scale: 0.97,
    filter: "blur(3px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -42 : 42,
    opacity: 0,
    rotateY: direction > 0 ? 10 : -10,
    rotateX: -2,
    scale: 0.985,
    filter: "blur(2px)",
  }),
};

export const LESSON_SECTION_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function getAnimatedTabDirection<T extends string>(
  tabs: readonly AnimatedLessonTab<T>[],
  current: T,
  next: T,
) {
  const currentIndex = tabs.findIndex((tab) => tab.id === current);
  const nextIndex = tabs.findIndex((tab) => tab.id === next);

  if (currentIndex === -1 || nextIndex === -1) {
    return 1;
  }

  return nextIndex >= currentIndex ? 1 : -1;
}

export function AnimatedLessonTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  layoutId,
  className,
}: {
  tabs: readonly AnimatedLessonTab<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  layoutId: string;
  className?: string;
}) {
  return (
    <div
      data-help-target="lesson-section-tabs"
      className={[
        "grid gap-1 rounded-xl border border-border-subtle bg-surface-secondary p-1 sm:rounded-2xl",
        className,
      ].filter(Boolean).join(" ")}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            whileTap={{ scale: 0.965 }}
            className={[
              "relative flex min-h-[52px] flex-col items-center justify-center gap-1 overflow-hidden rounded-lg px-1 py-2 text-[10px] font-bold select-none sm:min-h-[60px] sm:rounded-xl sm:text-[11px]",
              active ? "text-white" : "text-content-tertiary hover:text-content-secondary",
            ].join(" ")}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-sm sm:rounded-xl"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}

            {!active && (
              <span className="absolute inset-0 rounded-lg bg-transparent transition-colors hover:bg-surface-tertiary sm:rounded-xl" />
            )}

            <span className="relative z-10 flex flex-col items-center gap-1">
              {tab.icon}
              <span className="text-center leading-tight">{tab.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}