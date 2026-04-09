"use client";

import { useState, useRef, useEffect } from "react";
import type { LessonMode, LessonResolved } from "@/features/lessons/types";
import type { Kanji } from "@/features/kanji/types";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import {
  normalizeReadings,
  normalizeMeanings,
} from "@/features/kanji/lib/kanjiFormat";
import { KanjiStrokePlayer } from "@/features/kanji/components/KanjiStrokePlayer";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Volume2, BookOpen, PenLine } from "lucide-react";
import type { KanjiQuizType } from "@/features/kanji/types/quiz";

type KanjiTab = "symbol" | "reading" | "meaning" | "writing";

const KANJI_TABS: { id: KanjiTab; label: string; icon: React.ReactNode }[] = [
  { id: "symbol", label: "Simbolo", icon: <Eye size={12} /> },
  { id: "reading", label: "Lecturas", icon: <Volume2 size={12} /> },
  { id: "meaning", label: "Significados", icon: <BookOpen size={12} /> },
  { id: "writing", label: "Escritura", icon: <PenLine size={12} /> },
];

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
  onQuizStart,
}: {
  data: Extract<LessonResolved, { kind: "kanji" }>;
  mode: LessonMode;
  ctaDisabled?: boolean;
  ctaDisabledReason?: string;
  onWritingStart?: (kanji: Kanji) => void;
  onQuizStart?: (entity: { id: string; symbol: string }, quizType?: KanjiQuizType) => void;
}) {
  const k = data.kanji;
  const [activeTab, setActiveTab] = useState<KanjiTab>("symbol");
  const [autoStroke, setAutoStroke] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const r = normalizeReadings(k.readings);
  const m = normalizeMeanings(k.meanings);
  const meanings = (m.es.length ? m.es : m.all.length ? m.all : []).slice(0, 8);
  const on = (r.on.length > 0 ? r.on : r.all).slice(0, 6);
  const kun = r.kun.slice(0, 5);
  const hasStrokes = !!(k.strokes && k.strokes.length > 0 && k.viewBox);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeTab !== "writing" || !hasStrokes) {
      setAutoStroke(-1);
      return;
    }

    const strokeCount = k.strokes!.length;

    function showStroke(i: number) {
      setAutoStroke(i);
      timerRef.current = setTimeout(() => {
        if (i < strokeCount - 1) {
          showStroke(i + 1);
        } else {
          timerRef.current = setTimeout(() => {
            setAutoStroke(-1);
            timerRef.current = setTimeout(() => showStroke(0), 500);
          }, 1500);
        }
      }, 900);
    }

    showStroke(0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeTab, hasStrokes, k.strokes]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="grid grid-cols-4 gap-1 rounded-xl sm:rounded-2xl bg-surface-secondary border border-border-subtle p-1">
        {KANJI_TABS.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex min-h-[52px] sm:min-h-[60px] flex-col items-center justify-center gap-1 rounded-lg sm:rounded-xl px-1 py-2 text-[10px] sm:text-[11px] font-bold transition-all duration-200 select-none",
                active
                  ? "bg-gradient-to-br from-accent to-accent-hover text-white shadow-sm"
                  : "text-content-tertiary hover:bg-surface-tertiary hover:text-content-secondary",
              ].join(" ")}
            >
              {tab.icon}
              <span className="text-center leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === "symbol" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl sm:rounded-[20px] border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary">
                <div className="h-1 bg-gradient-to-r from-accent to-accent-hover" />

                <div className="flex flex-col items-center gap-3 p-4 pb-4 sm:gap-4 sm:p-6 sm:pb-5">
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-accent/8 blur-2xl" />
                    <div className="relative text-[56px] xs:text-[64px] sm:text-[96px] leading-none font-black text-accent drop-shadow-sm select-none">
                      {k.symbol}
                    </div>
                  </motion.div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-full bg-accent/10 border border-accent/15 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-accent">
                      Kanji &middot; {modeTitle[mode]}
                    </span>

                    {k.pointsToUnlock > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-tertiary border border-border-subtle px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-content-secondary">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {k.pointsToUnlock} pts
                      </span>
                    )}

                    {hasStrokes && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-tertiary border border-border-subtle px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-content-secondary">
                        {k.strokes!.length} trazos
                      </span>
                    )}
                  </div>

                  {data.lesson.description && (
                    <p className="max-w-[280px] text-center text-[12px] sm:text-[13px] leading-relaxed text-content-secondary">
                      {data.lesson.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Lectura de Kanji
              </button>
            </div>
          )}

          {activeTab === "reading" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl sm:rounded-[20px] border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary">
                <div className="h-1 bg-gradient-to-r from-accent to-accent-hover" />

                <div className="space-y-3 p-3.5 sm:p-5 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 text-[36px] sm:text-[56px] font-black leading-none text-accent">
                      {k.symbol}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-content-muted">
                        Lecturas del kanji
                      </p>
                      <p className="mt-0.5 text-[11px] sm:text-xs text-content-secondary">
                        {on.length + kun.length} forma{on.length + kun.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {on.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full border border-accent/15 bg-accent/8 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-accent">
                          ON
                        </span>
                        <span className="text-[10px] text-content-muted">Origen chino</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {on.map((reading) => (
                          <span
                            key={reading}
                            className="rounded-xl border border-accent/15 bg-accent/8 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-sm sm:text-base font-bold text-accent"
                          >
                            {reading}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {kun.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full border border-border-subtle bg-surface-tertiary px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-content-secondary">
                          KUN
                        </span>
                        <span className="text-[10px] text-content-muted">Origen japones</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {kun.map((reading) => (
                          <span
                            key={reading}
                            className="rounded-xl border border-border-subtle bg-surface-tertiary px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-sm sm:text-base font-semibold text-content-primary"
                          >
                            {reading}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {on.length === 0 && kun.length === 0 && (
                    <p className="py-2 text-center text-sm text-content-secondary">
                      Sin lecturas disponibles.
                    </p>
                  )}
                </div>
              </div>

              {(on.length > 0 || kun.length > 0) && (
                <div className="rounded-2xl sm:rounded-[16px] bg-accent/5 border border-accent/10 p-3">
                  <p className="text-[12px] leading-relaxed text-content-secondary">
                    <span className="font-semibold text-content-primary">ON</span>{" "}
                    se usa en palabras compuestas.{" "}
                    <span className="font-semibold text-content-primary">KUN</span>{" "}
                    es la lectura japonesa nativa.
                  </p>
                </div>
              )}

              <button
                type="button"
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Lecturas
              </button>
            </div>
          )}

          {activeTab === "meaning" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl sm:rounded-[20px] border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary">
                <div className="h-1 bg-gradient-to-r from-accent to-accent-hover" />

                <div className="p-3.5 sm:p-5">
                  {meanings.length > 0 ? (
                    <>
                      <div className="mb-3 sm:mb-4 flex items-start gap-3">
                        <div className="shrink-0 text-[36px] sm:text-[56px] font-black leading-none text-accent">
                          {k.symbol}
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-content-muted">
                            Significado principal
                          </p>
                          <p className="text-lg sm:text-2xl font-black capitalize text-content-primary break-words">
                            {meanings[0]}
                          </p>
                        </div>
                      </div>

                      {meanings.length > 1 && (
                        <>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-content-muted">
                            Otros significados
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {meanings.slice(1).map((w) => (
                              <span
                                key={w}
                                className="rounded-xl border border-border-subtle bg-surface-tertiary px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold capitalize text-content-secondary"
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 py-2">
                      <div className="text-[36px] sm:text-[52px] font-black leading-none text-accent">
                        {k.symbol}
                      </div>
                      <p className="text-sm text-content-secondary">Sin significados disponibles.</p>
                    </div>
                  )}
                </div>
              </div>

              {meanings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {meanings.map((w, i) => (
                    <span
                      key={w}
                      className={[
                        "rounded-xl px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs sm:text-sm font-semibold capitalize",
                        i === 0
                          ? "bg-accent text-white shadow-sm"
                          : "bg-surface-tertiary text-content-primary border border-border-subtle",
                      ].join(" ")}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Significados
              </button>
            </div>
          )}

          {activeTab === "writing" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl sm:rounded-[20px] border border-border-subtle bg-surface-secondary">
                <div className="h-1 bg-gradient-to-r from-accent to-accent-hover" />

                <div className="p-3 sm:p-4">
                  <div className="mb-2 sm:mb-3 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
                      Orden de trazos
                    </p>

                    {hasStrokes && (
                      <span className="rounded-full bg-surface-tertiary px-2.5 py-0.5 text-[11px] font-medium text-content-muted">
                        {autoStroke === -1
                          ? `${k.strokes!.length} trazos`
                          : `${autoStroke + 1} / ${k.strokes!.length}`}
                      </span>
                    )}
                  </div>

                  {hasStrokes ? (
                    <div className="flex justify-center">
                      <div className="rounded-2xl bg-white p-2 sm:p-3 ring-1 ring-border-subtle">
                        <KanjiStrokePlayer
                          viewBox={k.viewBox!}
                          strokes={k.strokes!}
                          activeStrokeIndex={autoStroke}
                          showNumbers
                          numberMode="uptoActive"
                          size={typeof window !== "undefined" && window.innerWidth < 640 ? 112 : 130}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <div className="text-[44px] sm:text-[64px] font-black text-accent">{k.symbol}</div>
                      <p className="text-sm text-center text-content-secondary">
                        Datos de trazos aun no disponibles.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {hasStrokes && (
                <div className="rounded-2xl sm:rounded-[16px] bg-accent/5 border border-accent/10 p-3">
                  <p className="text-[12px] leading-relaxed text-content-secondary">
                    <span className="font-semibold text-content-primary">Observa el orden</span>{" "}
                    y la direccion de cada trazo - el orden correcto mejora tu escritura.
                  </p>
                </div>
              )}

              <button
                type="button"
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Escritura
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div>
        {onQuizStart && (
          <LessonCTA
            variant={ctaDisabled ? "disabled" : "complete"}
            label={ctaDisabled ? "Quiz bloqueado" : "Quiz completo"}
            onClick={() => {
              if (ctaDisabled) return;
              onQuizStart(k);
            }}
          />
        )}

        {ctaDisabled && ctaDisabledReason && (
          <p className="mt-1.5 text-center text-xs leading-5 text-content-secondary">
            {ctaDisabledReason}
          </p>
        )}
      </div>
    </div>
  );
}