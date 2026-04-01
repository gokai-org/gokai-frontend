"use client";

import type { LessonMode, LessonResolved } from "@/features/lessons/types";
import type { Kanji } from "@/features/kanji/types";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import {
  normalizeReadings,
  normalizeMeanings,
} from "@/features/kanji/lib/kanjiFormat";
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
  ctaDisabled = false,
  ctaDisabledReason,
  onWritingStart,
}: {
  data: Extract<LessonResolved, { kind: "kanji" }>;
  mode: LessonMode;
  ctaDisabled?: boolean;
  ctaDisabledReason?: string;
  onWritingStart?: (kanji: Kanji) => void;
}) {
  const k = data.kanji;

  const r = normalizeReadings(k.readings);
  const m = normalizeMeanings(k.meanings);

  const meanings = (m.es.length ? m.es : m.all.length ? m.all : []).slice(0, 4);
  const on = r.on.slice(0, 3);
  const kun = r.kun.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Card */}
      <div className="rounded-[20px] sm:rounded-[28px] border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary p-4 sm:p-5 shadow-sm">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              Kanji • {modeTitle[mode]}
            </span>

            {k.pointsToUnlock > 0 && (
              <span className="inline-flex items-center rounded-full bg-surface-tertiary px-3 py-1 text-xs font-semibold text-content-secondary">
                {k.pointsToUnlock} pts
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-[15px] leading-relaxed text-content-secondary">
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
            <div className="absolute -inset-3 rounded-3xl bg-accent/10 blur-2xl" />
            <div className="relative text-[72px] sm:text-[96px] font-black leading-none text-accent drop-shadow-sm">
              {k.symbol}
            </div>
          </motion.div>

          <div className="text-center sm:text-right sm:min-w-[140px]">
            <div className="text-xs font-bold text-content-primary">Lecturas</div>

            <div className="mt-1 text-sm text-content-secondary">
              <span className="font-semibold text-content-primary">On: </span>
              {on.length ? on.join(" ・ ") : "—"}
            </div>

            <div className="mt-1 text-sm text-content-secondary">
              <span className="font-semibold text-content-primary">Kun: </span>
              {kun.length ? kun.join(" ・ ") : "—"}
            </div>
          </div>
        </div>

        {/* Meanings */}
        <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-tertiary p-4">
          <div className="text-xs font-bold text-content-primary">Significados</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(meanings.length ? meanings : ["—"]).map((w) => (
              <span
                key={w}
                className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <LessonCTA
        variant={ctaDisabled ? "disabled" : "start"}
        label={
          ctaDisabled
            ? "Aún bloqueado"
            : mode === "writing"
              ? "Comenzar escritura"
              : "Comenzar"
        }
        onClick={() => {
          if (ctaDisabled) return;

          if (mode === "writing") {
            onWritingStart?.(k);
          } else {
            console.log("start", data.lesson.id, "kanji", k.id);
          }
        }}
      />

      {ctaDisabled && ctaDisabledReason ? (
        <p className="-mt-2 text-center text-xs leading-5 text-content-secondary">
          {ctaDisabledReason}
        </p>
      ) : null}
    </div>
  );
}
