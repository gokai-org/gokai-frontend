"use client";

import { useState } from "react";
import type { LessonMode, LessonResolved } from "@/features/lessons/types";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import {
  normalizeReadings,
  normalizeMeanings,
} from "@/features/kanji/lib/kanjiFormat";
import { WritingPracticeModal } from "@/features/kanji/components/WritingPracticeModal";
import { motion } from "framer-motion";

const modeTitle: Record<LessonMode, string> = {
  writing: "Escritura",
  listening: "Audio",
  reading: "Lectura",
  speaking: "Hablar",
};

export default function KanjiLesson({
  data,
  mode,
}: {
  data: Extract<LessonResolved, { kind: "kanji" }>;
  mode: LessonMode;
}) {
  const [showWritingPractice, setShowWritingPractice] = useState(false);
  const k = data.kanji;

  const r = normalizeReadings(k.readings);
  const m = normalizeMeanings(k.meanings);

  const meanings = (m.es.length ? m.es : m.all.length ? m.all : []).slice(0, 4);
  const on = r.on.slice(0, 3);
  const kun = r.kun.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Card */}
      <div className="rounded-[20px] sm:rounded-[28px] border border-gray-100 bg-gradient-to-b from-white to-[#fff7f7] p-4 sm:p-5 shadow-sm">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#993331]/10 px-3 py-1 text-xs font-bold text-[#993331]">
              Kanji • {modeTitle[mode]}
            </span>

            {k.pointsToUnlock > 0 && (
              <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-gray-700">
                {k.pointsToUnlock} pts
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          {data.lesson.description}
        </p>

        {/* Kanji + readings */}
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-[#993331]/10 blur-2xl" />
            <div className="relative text-[72px] sm:text-[96px] font-black leading-none text-[#993331] drop-shadow-sm">
              {k.symbol}
            </div>
          </motion.div>

          <div className="text-center sm:text-right sm:min-w-[140px]">
            <div className="text-xs font-bold text-gray-900">Lecturas</div>

            <div className="mt-1 text-sm text-gray-600">
              <span className="font-semibold text-gray-800">On: </span>
              {on.length ? on.join(" ・ ") : "—"}
            </div>

            <div className="mt-1 text-sm text-gray-600">
              <span className="font-semibold text-gray-800">Kun: </span>
              {kun.length ? kun.join(" ・ ") : "—"}
            </div>
          </div>
        </div>

        {/* Meanings */}
        <div className="mt-5 rounded-2xl border border-gray-100 bg-white/70 p-4">
          <div className="text-xs font-bold text-gray-900">Significados</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(meanings.length ? meanings : ["—"]).map((w) => (
              <span
                key={w}
                className="rounded-full bg-[#993331]/10 px-3 py-1 text-sm font-semibold text-[#7a2826]"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <LessonCTA
        variant={mode === "writing" ? "start" : "start"}
        label={mode === "writing" ? "Comenzar escritura" : "Comenzar"}
        onClick={() => {
          if (mode === "writing") {
            setShowWritingPractice(true);
          } else {
            console.log("start", data.lesson.id, "kanji", k.id);
          }
        }}
      />

      {/* Writing practice modal */}
      {showWritingPractice && (
        <WritingPracticeModal
          kanji={k}
          onClose={() => setShowWritingPractice(false)}
        />
      )}
    </div>
  );
}
