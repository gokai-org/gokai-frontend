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
      <div className="rounded-3xl border border-gray-100 p-4 bg-gradient-to-b from-white to-[#fffaf0]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#993331]">
            SUBTHEME • {mode.toUpperCase()}
          </div>
          <div className="text-xs text-gray-500">
            Tema: <span className="font-semibold text-gray-800">{s.theme.meaning ?? "—"}</span>
          </div>
        </div>

        <div className="mt-2 text-lg font-semibold text-gray-900">{s.meaning}</div>
        <div className="mt-1 text-sm text-gray-600">{data.lesson.description}</div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-5xl font-bold text-[#993331]">{s.kanji}</div>
          <div className="text-right text-sm text-gray-600">
            <div className="text-xs text-gray-500">Lectura</div>
            <div className="font-semibold text-gray-900">{s.kana}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100 p-3">
          <div className="text-xs font-semibold text-gray-900">Qué incluirá</div>
          <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
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
