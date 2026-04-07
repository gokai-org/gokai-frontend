"use client";

import type { LessonMode, LessonResolved } from "@/features/lessons/types";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import { KanaStrokePlayer } from "@/features/kana/components/KanaStrokePlayer";
import { motion } from "framer-motion";

const modeTitle: Record<LessonMode, string> = {
  writing: "Escritura",
  listening: "Audio",
  reading: "Lectura",
  speaking: "Hablar",
};

export default function KanaLesson({
  data,
  mode,
  ctaDisabled = false,
  ctaDisabledReason,
  onQuizStart,
}: {
  data: Extract<LessonResolved, { kind: "kana" }>;
  mode: LessonMode;
  ctaDisabled?: boolean;
  ctaDisabledReason?: string;
  onQuizStart?: (entity: { id: string; symbol: string }) => void;
}) {
  const k = data.kana;
  const typeLabel = k.kanaType === "hiragana" ? "Hiragana" : "Katakana";
  const hasStrokes = k.strokes && k.strokes.length > 0 && k.viewBox;

  return (
    <div className="space-y-5">
      {/* Card */}
      <div className="rounded-[20px] sm:rounded-[28px] border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary p-4 sm:p-5 shadow-sm">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              {typeLabel} &middot; {modeTitle[mode]}
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

        {/* Kana symbol + romaji */}
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-accent/10 blur-2xl" />
            {hasStrokes ? (
              <div className="relative">
                <KanaStrokePlayer
                  viewBox={k.viewBox!}
                  strokes={k.strokes!}
                  activeStrokeIndex={-1}
                  showNumbers={false}
                  size={120}
                />
              </div>
            ) : (
              <div className="relative text-[72px] sm:text-[96px] font-black leading-none text-accent drop-shadow-sm">
                {k.symbol}
              </div>
            )}
          </motion.div>

          <div className="text-center sm:text-right sm:min-w-[140px]">
            <div className="text-xs font-bold text-content-primary">
              Romaji
            </div>
            <div className="mt-1 text-lg font-semibold text-content-primary">
              {k.romaji ?? "---"}
            </div>

            <div className="mt-3 text-xs font-bold text-content-primary">
              Tipo
            </div>
            <div className="mt-1 text-sm text-content-secondary">
              {typeLabel}
            </div>
          </div>
        </div>

        {/* Stroke count info */}
        {hasStrokes && (
          <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-tertiary p-4">
            <div className="text-xs font-bold text-content-primary">
              Trazos
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                {k.strokes!.length} {k.strokes!.length === 1 ? "trazo" : "trazos"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quiz CTA */}
      {onQuizStart && (
        <LessonCTA
          variant={ctaDisabled ? "disabled" : "complete"}
          label={ctaDisabled ? "Quiz bloqueado" : "Comenzar Quiz"}
          onClick={() => {
            if (ctaDisabled) return;
            onQuizStart(k);
          }}
        />
      )}

      {ctaDisabled && ctaDisabledReason ? (
        <p className="-mt-2 text-center text-xs leading-5 text-content-secondary">
          {ctaDisabledReason}
        </p>
      ) : null}
    </div>
  );
}
