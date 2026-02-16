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
      <div className="rounded-3xl border border-gray-100 p-4 bg-gradient-to-b from-white to-[#f5fbff]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#993331]">
            GRAMMAR • {mode.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500">
            Puntos:{" "}
            <span className="font-semibold text-gray-800">
              {g.pointsToUnlock ?? 0}
            </span>
          </div>
        </div>

        <div className="mt-2 text-lg font-semibold text-gray-900">{g.title}</div>
        <div className="mt-1 text-sm text-gray-600">
          {g.description ?? data.lesson.description}
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-gray-100 p-3">
            <div className="text-xs font-semibold text-gray-900">Uso</div>
            <div className="text-sm text-gray-600">{g.useCases ?? "—"}</div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-3">
            <div className="text-xs font-semibold text-gray-900">Ejemplos</div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
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
