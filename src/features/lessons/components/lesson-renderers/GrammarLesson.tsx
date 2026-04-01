"use client";

import type { LessonMode, LessonResolved } from "../../types";
import LessonCTA from "../LessonCTA";

export default function GrammarLesson({
  data,
  mode,
}: {
  data: Extract<LessonResolved, { kind: "grammar" }>;
  mode: LessonMode;
}) {
  const g = data.grammar;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border-subtle p-4 bg-gradient-to-b from-surface-elevated to-accent/4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-accent">
            GRAMMAR • {mode.toUpperCase()}
          </div>
          <div className="text-xs text-content-tertiary">
            Puntos:{" "}
            <span className="font-semibold text-content-primary">
              {g.pointsToUnlock ?? 0}
            </span>
          </div>
        </div>

        <div className="mt-2 text-lg font-semibold text-content-primary">
          {g.title}
        </div>
        <div className="mt-1 text-sm text-content-secondary">
          {g.description ?? data.lesson.description}
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-border-subtle p-3">
            <div className="text-xs font-semibold text-content-primary">Uso</div>
            <div className="text-sm text-content-secondary">{g.useCases ?? "—"}</div>
          </div>

          <div className="rounded-2xl border border-border-subtle p-3">
            <div className="text-xs font-semibold text-content-primary">Ejemplos</div>
            <div className="text-sm text-content-secondary whitespace-pre-wrap">
              {g.examples ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <LessonCTA
        variant="start"
        onClick={() => console.log("Start grammar lesson", data.lesson.id)}
      />
    </div>
  );
}
