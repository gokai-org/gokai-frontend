"use client";

import type { LessonMode, LessonResolved } from "../../types";
import LessonCTA from "../LessonCTA";

export default function SubthemeLesson({
  data,
  mode,
}: {
  data: Extract<LessonResolved, { kind: "subtheme" }>;
  mode: LessonMode;
}) {
  const s = data.subtheme;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border-subtle p-4 bg-gradient-to-b from-surface-elevated to-accent/4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-accent">
            SUBTHEME • {mode.toUpperCase()}
          </div>
          <div className="text-xs text-content-tertiary">
            Tema:{" "}
            <span className="font-semibold text-content-primary">
              {s.theme.meaning ?? "—"}
            </span>
          </div>
        </div>

        <div className="mt-2 text-lg font-semibold text-content-primary">
          {s.meaning}
        </div>
        <div className="mt-1 text-sm text-content-secondary">
          {data.lesson.description}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-5xl font-bold text-accent">{s.kanji}</div>
          <div className="text-right text-sm text-content-secondary">
            <div className="text-xs text-content-tertiary">Lectura</div>
            <div className="font-semibold text-content-primary">{s.kana}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border-subtle p-3">
          <div className="text-xs font-semibold text-content-primary">
            Qué incluirá
          </div>
          <ul className="mt-2 text-sm text-content-secondary list-disc pl-5 space-y-1">
            <li>Vocabulario del subtema</li>
            <li>Ejercicios según el modo</li>
            <li>Revisión rápida al finalizar</li>
          </ul>
        </div>
      </div>

      <LessonCTA
        variant="start"
        onClick={() => console.log("Start subtheme lesson", data.lesson.id)}
      />
    </div>
  );
}
