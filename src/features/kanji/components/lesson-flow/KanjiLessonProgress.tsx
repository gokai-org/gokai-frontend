"use client";

import { motion } from "framer-motion";
import { EXERCISE_LABELS, type KanjiLessonExerciseKind } from "@/features/kanji/types/lessonFlow";

interface KanjiLessonProgressProps {
  currentIndex: number;
  totalExercises: number;
  exerciseTypes: KanjiLessonExerciseKind[];
  overallProgress: number;
}

export function KanjiLessonProgress({
  currentIndex,
  totalExercises,
  exerciseTypes,
  overallProgress,
}: KanjiLessonProgressProps) {
  return (
    <div className="w-full space-y-2.5">
      {/* Overall progress bar */}
      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {exerciseTypes.map((type, i) => {
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;
          return (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-4 h-px bg-border-subtle" />}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                  isActive
                    ? "bg-accent text-content-inverted shadow-sm"
                    : isDone
                      ? "bg-accent/15 text-accent"
                      : "bg-surface-tertiary text-content-muted"
                }`}
              >
                {isDone ? (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
                <span className="hidden sm:inline">{EXERCISE_LABELS[type]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
