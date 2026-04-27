"use client";

import { BookText, Headphones, Mic, PenTool } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import type { ReviewItem } from "../types";
import type { ReviewCategoryProgress } from "../hooks/useReviewProgress";

interface ReviewCategoriesProps {
  categories: ReviewCategoryProgress[];
  loading?: boolean;
}

type CategoryMeta = {
  icon: LucideIcon;
  iconClassName: string;
  barClassName: string;
  hoverClassName: string;
  badgeClassName: string;
};

const categoryMeta: Record<ReviewItem["type"], CategoryMeta> = {
  kanji: {
    icon: PenTool,
    iconClassName: "bg-gradient-to-br from-accent to-accent-hover",
    barClassName: "bg-accent",
    hoverClassName: "hover:border-accent/30 hover:bg-accent/[0.04]",
    badgeClassName: "bg-accent/10 text-accent border-accent/15",
  },
  grammar: {
    icon: BookText,
    iconClassName: "bg-gradient-to-br from-[#6B5B95] to-[#8B7BB5]",
    barClassName: "bg-[#6B5B95]",
    hoverClassName: "hover:border-[#6B5B95]/30 hover:bg-[#6B5B95]/[0.04]",
    badgeClassName: "bg-[#6B5B95]/10 text-[#6B5B95] border-[#6B5B95]/15 dark:text-[#A99AE0]",
  },
  listening: {
    icon: Headphones,
    iconClassName: "bg-gradient-to-br from-[#C4863B] to-[#D4A65B]",
    barClassName: "bg-[#C4863B]",
    hoverClassName: "hover:border-[#C4863B]/30 hover:bg-[#C4863B]/[0.05]",
    badgeClassName: "bg-[#C4863B]/10 text-[#C4863B] border-[#C4863B]/15 dark:text-[#DDB06C]",
  },
  speaking: {
    icon: Mic,
    iconClassName: "bg-gradient-to-br from-[#3B8A7A] to-[#5BAA9A]",
    barClassName: "bg-[#3B8A7A]",
    hoverClassName: "hover:border-[#3B8A7A]/30 hover:bg-[#3B8A7A]/[0.05]",
    badgeClassName: "bg-[#3B8A7A]/10 text-[#3B8A7A] border-[#3B8A7A]/15 dark:text-[#78C7B9]",
  },
};

const joinClassNames = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

export function ReviewCategories({ categories, loading = false }: ReviewCategoriesProps) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-content-tertiary">
            Categorías
          </p>
          <h2 className="text-lg font-extrabold tracking-tight text-content-primary">
            Total por tipo
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const meta = categoryMeta[category.type];
          const Icon = meta.icon;

          return (
            <motion.div
              key={category.type}
              whileHover={{ y: -2, scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={joinClassNames(
                "rounded-2xl border border-border-subtle bg-surface-primary p-3 shadow-sm transition-colors sm:p-4",
                meta.hoverClassName,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={joinClassNames(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-md sm:h-11 sm:w-11",
                      meta.iconClassName,
                    )}
                  >
                    <Icon className="h-5 w-5 text-content-inverted" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-content-primary">
                      {category.label}
                    </p>
                    <p className="font-mono text-xs font-bold text-content-tertiary">
                      {category.japanese}
                    </p>
                  </div>
                </div>

                <span
                  className={joinClassNames(
                    "rounded-full border px-2 py-0.5 text-[11px] font-extrabold",
                    meta.badgeClassName,
                  )}
                >
                  {loading ? "..." : category.pendingCount}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-tertiary">
                  <div
                    className={joinClassNames(
                      "h-full rounded-full transition-[width] duration-700 ease-out",
                      meta.barClassName,
                    )}
                    style={{ width: `${category.masteryPercent}%` }}
                  />
                </div>
                <span className="w-9 text-right text-xs font-extrabold text-content-secondary">
                  {loading ? "--" : `${category.masteryPercent}%`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
