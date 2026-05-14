"use client";

import { BookOpen, BookText, PenTool } from "lucide-react";
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
  hoverClassName: string;
  badgeClassName: string;
};

const categoryMeta: Record<ReviewItem["type"], CategoryMeta> = {
  kanji: {
    icon: PenTool,
    iconClassName: "bg-gradient-to-br from-accent to-accent-hover",
    hoverClassName: "hover:border-accent/30 hover:bg-accent/[0.04]",
    badgeClassName: "bg-accent/10 text-accent border-accent/15",
  },
  grammar: {
    icon: BookText,
    iconClassName: "bg-gradient-to-br from-[#6B5B95] to-[#8B7BB5]",
    hoverClassName: "hover:border-[#6B5B95]/30 hover:bg-[#6B5B95]/[0.04]",
    badgeClassName: "bg-[#6B5B95]/10 text-[#6B5B95] border-[#6B5B95]/15 dark:text-[#A99AE0]",
  },
  vocabulary: {
    icon: BookOpen,
    iconClassName: "bg-gradient-to-br from-[#C4863B] to-[#D4A65B]",
    hoverClassName: "hover:border-[#C4863B]/30 hover:bg-[#C4863B]/[0.05]",
    badgeClassName: "bg-[#C4863B]/10 text-[#C4863B] border-[#C4863B]/15 dark:text-[#DDB06C]",
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
            Resumen
          </p>
          <h2 className="text-lg font-extrabold tracking-tight text-content-primary">
            En total por grupo
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                "rounded-2xl border border-border-subtle bg-surface-primary p-2.5 shadow-sm transition-colors sm:p-3",
                meta.hoverClassName,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={joinClassNames(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md sm:h-10 sm:w-10",
                      meta.iconClassName,
                    )}
                  >
                    <Icon className="h-4 w-4 text-content-inverted sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-content-primary sm:text-sm">
                      {category.label}
                    </p>
                    <p className="truncate font-mono text-[10px] font-bold text-content-tertiary sm:text-xs">
                      {category.japanese}
                    </p>
                  </div>
                </div>

                <span
                  className={joinClassNames(
                    "rounded-full border px-2 py-0.5 text-[10px] font-extrabold sm:text-[11px]",
                    meta.badgeClassName,
                  )}
                >
                  {loading ? "..." : category.pendingCount}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
