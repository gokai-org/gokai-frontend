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
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2 gap-y-1.5 sm:flex sm:items-start sm:justify-between sm:gap-2">
                <div
                  className={joinClassNames(
                    "col-start-1 row-start-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md sm:hidden",
                    meta.iconClassName,
                  )}
                >
                  <Icon className="h-4 w-4 text-content-inverted" />
                </div>

                <span
                  className={joinClassNames(
                    "col-start-3 row-start-1 inline-flex h-7 w-7 items-center justify-center justify-self-end rounded-full border text-[10px] font-extrabold leading-none sm:h-8 sm:w-8 sm:text-[11px]",
                    meta.badgeClassName,
                  )}
                >
                  {loading ? "..." : category.pendingCount}
                </span>

                <div className="col-span-3 min-w-0 pt-0.5 sm:col-auto sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:gap-2.5 sm:pt-0">
                  <div className="hidden sm:flex">
                    <div
                      className={joinClassNames(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md sm:h-10 sm:w-10",
                        meta.iconClassName,
                      )}
                    >
                      <Icon className="h-4 w-4 text-content-inverted sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div
                    className="min-w-0"
                  >
                    <p className="text-[11px] font-extrabold leading-tight text-content-primary sm:truncate sm:text-sm">
                      {category.label}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold leading-tight text-content-tertiary sm:truncate sm:font-mono sm:text-xs">
                      {category.japanese}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
