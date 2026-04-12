"use client";

import { ArrowLeft, BookOpen } from "lucide-react";
import type { GrammarLesson } from "../types";
import GrammarListSkeleton from "./GrammarListSkeleton";
import GrammarError from "./GrammarError";

interface GrammarLessonDetailProps {
  lesson: GrammarLesson | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export default function GrammarLessonDetail({
  lesson,
  loading,
  error,
  onBack,
}: GrammarLessonDetailProps) {
  return (
    <section className="w-full max-w-2xl mx-auto py-2">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-pink-500 dark:hover:text-pink-400 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a lecciones
      </button>

      {loading && <GrammarListSkeleton />}

      {error && <GrammarError message={error} />}

      {!loading && !error && lesson && (
        <div className="space-y-6">
          {/* Title card */}
          <div className="rounded-2xl border border-pink-200 dark:border-pink-900/40 bg-surface-elevated p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-950/30">
                <BookOpen className="h-5 w-5 text-pink-500 dark:text-pink-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-content-primary leading-snug">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="text-sm text-content-secondary mt-1.5">
                    {lesson.description}
                  </p>
                )}
                {(lesson.pointsToUnlock ?? 0) > 0 && (
                  <span className="inline-block mt-2 text-xs font-medium text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 rounded-full px-2.5 py-0.5">
                    {lesson.pointsToUnlock} pts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meaning - Image Stepper */}
          {lesson.content?.meaning && (
            <ContentSection title="Significado">
              <div className="space-y-4">
                {lesson.content.meaning.content.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start rounded-xl border border-border-primary/60 bg-surface-secondary p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/40 text-xs font-bold text-pink-600 dark:text-pink-400">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      {step.img && (
                        <img
                          src={step.img}
                          alt={`Paso ${i + 1}`}
                          className="rounded-lg mb-2 max-h-40 object-contain"
                        />
                      )}
                      <p className="text-sm text-content-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* How to use - Table */}
          {lesson.content?.howToUse && (
            <ContentSection title="Como usar">
              <div className="overflow-x-auto rounded-xl border border-border-primary/60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-pink-50 dark:bg-pink-950/20">
                      {lesson.content.howToUse.content.headers.map(
                        (header, i) => (
                          <th
                            key={i}
                            className="px-4 py-2.5 text-left text-xs font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide"
                          >
                            {header}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.content.howToUse.content.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-t border-border-primary/40"
                      >
                        {row.cells.map((cell, ci) => (
                          <td
                            key={ci}
                            rowSpan={cell.rowspan}
                            colSpan={cell.colspan}
                            className="px-4 py-2.5 text-content-primary"
                          >
                            {cell.value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentSection>
          )}

          {/* Examples - Text Stepper */}
          {lesson.content?.examples && (
            <ContentSection title="Ejemplos">
              <div className="space-y-3">
                {lesson.content.examples.content.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border-primary/60 bg-surface-secondary p-4"
                  >
                    <p className="text-base font-medium text-content-primary">
                      {ex.kanji}
                    </p>
                    <p className="text-sm text-pink-500 dark:text-pink-400 mt-0.5">
                      {ex.kana}
                    </p>
                    <p className="text-sm text-content-secondary mt-1">
                      {ex.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </ContentSection>
          )}

          {/* Exam preview */}
          {lesson.content?.exam && lesson.content.exam.length > 0 && (
            <ContentSection title="Ejercicio">
              <div className="rounded-xl border border-pink-200 dark:border-pink-900/40 bg-pink-50/50 dark:bg-pink-950/10 p-4 text-center">
                <p className="text-sm text-content-secondary">
                  Esta leccion tiene{" "}
                  <span className="font-semibold text-pink-600 dark:text-pink-400">
                    {lesson.content.exam.length}
                  </span>{" "}
                  preguntas de practica
                </p>
              </div>
            </ContentSection>
          )}
        </div>
      )}
    </section>
  );
}

function ContentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
