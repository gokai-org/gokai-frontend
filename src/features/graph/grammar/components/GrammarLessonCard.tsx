"use client";

import type { GrammarLessonSummary } from "../types";
import { BookOpen, Lock, ChevronRight } from "lucide-react";

interface GrammarLessonCardProps {
  lesson: GrammarLessonSummary;
  userPoints?: number;
  onClick: (id: string) => void;
}

export default function GrammarLessonCard({
  lesson,
  userPoints = Infinity,
  onClick,
}: GrammarLessonCardProps) {
  const requiredPoints = lesson.pointsToUnlock ?? 0;
  const isLocked = userPoints < requiredPoints;

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => onClick(lesson.id)}
      className={[
        "group relative w-full text-left rounded-2xl border p-4 sm:p-5",
        "transition-all duration-200",
        isLocked
          ? "border-border-primary/60 bg-surface-secondary opacity-60 cursor-not-allowed"
          : "border-pink-200 dark:border-pink-900/40 bg-surface-elevated hover:border-pink-400 dark:hover:border-pink-700 hover:shadow-md hover:shadow-pink-500/5 cursor-pointer",
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            isLocked
              ? "bg-surface-tertiary text-content-muted"
              : "bg-pink-50 dark:bg-pink-950/30 text-pink-500 dark:text-pink-400",
          ].join(" ")}
        >
          {isLocked ? (
            <Lock className="h-5 w-5" />
          ) : (
            <BookOpen className="h-5 w-5" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3
            className={[
              "text-sm sm:text-base font-semibold truncate",
              isLocked
                ? "text-content-muted"
                : "text-content-primary group-hover:text-pink-600 dark:group-hover:text-pink-400",
            ].join(" ")}
          >
            {lesson.title}
          </h3>

          {requiredPoints > 0 && (
            <p className="text-xs text-content-tertiary mt-0.5">
              {isLocked
                ? `Necesitas ${requiredPoints} puntos`
                : `${requiredPoints} pts`}
            </p>
          )}

          {requiredPoints === 0 && (
            <p className="text-xs text-pink-500/70 dark:text-pink-400/60 mt-0.5">
              Gratis
            </p>
          )}
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ChevronRight className="h-4 w-4 shrink-0 text-content-muted group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" />
        )}
      </div>
    </button>
  );
}
