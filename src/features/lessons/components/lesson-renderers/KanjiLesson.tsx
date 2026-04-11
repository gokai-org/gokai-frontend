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
import WritingEvaluationGuide from "@/features/lessons/components/WritingEvaluationGuide";

type KanjiTab = "symbol" | "reading" | "meaning" | "writing";

const KANJI_TABS: { id: KanjiTab; label: string; icon: React.ReactNode }[] = [
  { id: "symbol", label: "Símbolo", icon: <Eye size={12} /> },
  { id: "reading", label: "Lecturas", icon: <Volume2 size={12} /> },
  { id: "meaning", label: "Significados", icon: <BookOpen size={12} /> },
  { id: "writing", label: "Escritura", icon: <PenLine size={12} /> },
];

const KANJI_WRITING_CRITERIA = [
  {
    title: "Orden",
    description: "",
    cue: "Cada kanji tiene una secuencia oficial que sostiene su estructura.",
  },
  {
    title: "Dirección",
    description: "",
    cue: "El sentido del trazo importa: un barrido invertido baja la precisión.",
  },
  {
    title: "Balance",
    description: "",
    cue: "Los radicales y espacios deben quedar proporcionados dentro del carácter.",
  },
] as const;

export default function KanjiLesson({
  data,
  ctaDisabled = false,
  ctaDisabledReason,
  onWritingStart: _onWritingStart,
  onQuizStart,
}: {
  data: Extract<LessonResolved, { kind: "kanji" }>;
  mode: LessonMode;
  ctaDisabled?: boolean;
  ctaDisabledReason?: string;
  onWritingStart?: (kanji: Kanji) => void;
  onQuizStart?: (
    entity: { id: string; symbol: string },
    quizType?: KanjiQuizType,
  ) => void;
}) {
  const k = data.kanji;
  const [activeTab, setActiveTab] = useState<KanjiTab>("symbol");
  const [autoStroke, setAutoStroke] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const r = normalizeReadings(k.readings);
  const m = normalizeMeanings(k.meanings);

  const meanings = (m.es.length ? m.es : m.all.length ? m.all : []).slice(0, 8);
  const on = r.on.slice(0, 6);
  const kun = r.kun.slice(0, 5);

  const hasStrokes = !!(k.strokes && k.strokes.length > 0 && k.viewBox);
  const displayedAutoStroke =
    activeTab === "writing" && hasStrokes ? autoStroke : -1;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeTab !== "writing" || !hasStrokes) {
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
      <div className="grid grid-cols-4 gap-1 rounded-xl border border-border-subtle bg-surface-secondary p-1 sm:rounded-2xl">
        {KANJI_TABS.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex min-h-[52px] sm:min-h-[60px] flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-bold transition-all duration-200 select-none sm:rounded-xl sm:text-[11px]",
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
            <div className="overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <div className="h-1.5 bg-gradient-to-r from-accent via-accent-hover to-accent" />

              <div className="flex flex-col items-center gap-5 px-4 py-6 sm:px-6 sm:py-8">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute -inset-5 rounded-full bg-accent/8 blur-2xl sm:-inset-7" />
                  <div className="relative text-[64px] xs:text-[72px] sm:text-[104px] leading-none font-black text-accent drop-shadow-sm select-none">
                    {k.symbol}
                  </div>
                </motion.div>

                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="rounded-full border border-accent/15 bg-accent/10 px-3 py-1 text-xs sm:text-sm font-bold text-accent">
                    Símbolo principal
                  </span>

                  <p className="max-w-[320px] text-[13px] sm:text-sm leading-relaxed text-content-secondary">
                    Observa su forma general y memorízalo visualmente antes de pasar a
                    sus lecturas, significados o escritura.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onQuizStart?.(k, "meaning")}
              className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
            >
              Practicar: Reconocer kanji
            </button>
          </div>
        )}

          {activeTab === "reading" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl sm:rounded-[20px] border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary">
                <div className="h-1 bg-gradient-to-r from-accent to-accent-hover" />

                <div className="space-y-4 p-3.5 sm:p-5">
                  {/* Hero */}
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 text-[38px] sm:text-[58px] font-black leading-none text-accent">
                      {k.symbol}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-content-muted">
                        Cómo se lee este kanji
                      </p>
                      <p className="mt-1 text-sm sm:text-base font-semibold text-content-primary">
                        {on.length > 0 && kun.length > 0
                          ? "Tiene lectura On’yomi y Kun’yomi"
                          : on.length > 0
                            ? "Usa lectura On’yomi"
                            : kun.length > 0
                              ? "Usa lectura Kun’yomi"
                              : "Sin lecturas registradas"}
                      </p>
                      <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-content-secondary">
                        {on.length > 0 && kun.length > 0
                          ? "Aprende ambas: una suele aparecer en compuestos y la otra en formas japonesas nativas."
                          : on.length > 0
                            ? "En este kanji, la lectura disponible registrada es de tipo On’yomi."
                            : kun.length > 0
                              ? "En este kanji, la lectura disponible registrada es de tipo Kun’yomi."
                              : "Todavía no hay información de lectura disponible para este kanji."}
                      </p>
                    </div>
                  </div>

                  {/* Idea clave rápida */}
                  {(on.length > 0 || kun.length > 0) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-2xl border border-accent/15 bg-accent/6 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                          On’yomi
                        </p>
                        <p className="mt-1 text-[12px] font-semibold text-content-primary">
                          Sonido chino adaptado
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-content-secondary">
                          Suele aparecer en palabras con varios kanjis.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border-subtle bg-surface-tertiary/70 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-content-secondary">
                          Kun’yomi
                        </p>
                        <p className="mt-1 text-[12px] font-semibold text-content-primary">
                          Lectura japonesa nativa
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-content-secondary">
                          Suele aparecer con hiragana o en formas japonesas.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Lo específico de este kanji */}
                  {(on.length > 0 || kun.length > 0) && (
                    <div className="rounded-2xl border border-border-subtle bg-surface-primary/70 p-3 sm:p-4">
                      <p className="mb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-content-muted">
                        En este kanji
                      </p>

                      <div className="grid gap-3">
                        {on.length > 0 && (
                          <div className="rounded-2xl border border-accent/15 bg-accent/6 p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full border border-accent/15 bg-accent/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-accent">
                                  On’yomi
                                </span>
                                <span className="text-[10px] text-content-muted">
                                  Úsala como referencia en compuestos
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {on.map((reading, index) => (
                                <span
                                  key={`${reading}-${index}`}
                                  className={[
                                    "rounded-xl border px-3 py-1.5 text-sm sm:text-base font-bold",
                                    index === 0
                                      ? "border-accent/20 bg-accent text-white shadow-sm"
                                      : "border-accent/15 bg-accent/8 text-accent",
                                  ].join(" ")}
                                >
                                  {reading}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {kun.length > 0 && (
                          <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full border border-border-subtle bg-surface-tertiary px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-content-secondary">
                                  Kun’yomi
                                </span>
                                <span className="text-[10px] text-content-muted">
                                  Úsala como referencia en formas japonesas
                                </span>
                              </div>
                              <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-content-secondary border border-border-subtle">
                                {kun.length}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {kun.map((reading, index) => (
                                <span
                                  key={`${reading}-${index}`}
                                  className={[
                                    "rounded-xl border px-3 py-1.5 text-sm sm:text-base font-semibold",
                                    index === 0
                                      ? "border-border-subtle bg-surface-tertiary text-content-primary shadow-sm"
                                      : "border-border-subtle bg-surface-primary text-content-primary",
                                  ].join(" ")}
                                >
                                  {reading}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mini guía de estudio */}
                  {(on.length > 0 || kun.length > 0) && (
                    <div className="rounded-2xl border border-accent/10 bg-accent/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
                        Cómo estudiarlo rápido
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-surface-elevated border border-border-subtle px-3 py-2">
                          <p className="text-[10px] font-black text-accent">1</p>
                          <p className="mt-1 text-[11px] text-content-secondary">
                            Memoriza primero la{" "}
                            <span className="font-semibold text-content-primary">
                              lectura principal
                            </span>.
                          </p>
                        </div>
                        <div className="rounded-xl bg-surface-elevated border border-border-subtle px-3 py-2">
                          <p className="text-[10px] font-black text-accent">2</p>
                          <p className="mt-1 text-[11px] text-content-secondary">
                            Relaciónala con el{" "}
                            <span className="font-semibold text-content-primary">
                              significado
                            </span>.
                          </p>
                        </div>
                        <div className="rounded-xl bg-surface-elevated border border-border-subtle px-3 py-2">
                          <p className="text-[10px] font-black text-accent">3</p>
                          <p className="mt-1 text-[11px] text-content-secondary">
                            Luego practica en{" "}
                            <span className="font-semibold text-content-primary">
                              palabras reales
                            </span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {on.length === 0 && kun.length === 0 && (
                    <div className="rounded-2xl border border-border-subtle bg-surface-primary/70 p-4 text-center">
                      <p className="text-sm font-semibold text-content-primary">
                        Sin lecturas disponibles
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-content-secondary">
                        Aún no hay lecturas registradas para este kanji.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onQuizStart?.(k, "reading")}
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Lecturas
              </button>
            </div>
          )}

          {activeTab === "meaning" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-elevated to-surface-secondary sm:rounded-[20px]">
                <div className="h-1 bg-gradient-to-r from-accent to-accent-hover" />

                <div className="p-3.5 sm:p-5">
                  {meanings.length > 0 ? (
                    <>
                      <div className="mb-3 flex items-start gap-3 sm:mb-4">
                        <div className="shrink-0 text-[36px] leading-none font-black text-accent sm:text-[56px]">
                          {k.symbol}
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-[10px] font-bold tracking-widest text-content-muted uppercase">
                            Significado principal
                          </p>
                          <p className="break-words text-lg font-black text-content-primary capitalize sm:text-2xl">
                            {meanings[0]}
                          </p>
                        </div>
                      </div>

                      {meanings.length > 1 && (
                        <>
                          <p className="mb-2 text-[10px] font-bold tracking-widest text-content-muted uppercase">
                            Otros significados
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {meanings.slice(1).map((w) => (
                              <span
                                key={w}
                                className="rounded-xl border border-border-subtle bg-surface-tertiary px-2.5 py-1 text-xs font-semibold text-content-secondary capitalize sm:px-3 sm:py-1.5 sm:text-sm"
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
                      <div className="text-[36px] leading-none font-black text-accent sm:text-[52px]">
                        {k.symbol}
                      </div>
                      <p className="text-sm text-content-secondary">
                        Sin significados disponibles.
                      </p>
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
                        "rounded-xl px-2.5 py-1 text-xs font-semibold capitalize sm:px-3.5 sm:py-1.5 sm:text-sm",
                        i === 0
                          ? "bg-accent text-white shadow-sm"
                          : "border border-border-subtle bg-surface-tertiary text-content-primary",
                      ].join(" ")}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => onQuizStart?.(k, "kanji")}
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Significados
              </button>
            </div>
          )}

          {activeTab === "writing" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-secondary sm:rounded-[20px]">
                <div className="h-1 bg-gradient-to-r from-accent to-accent-hover" />

                <div className="p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                    <p className="text-[10px] font-bold tracking-widest text-content-muted uppercase">
                      Orden de trazos
                    </p>

                    {hasStrokes && (
                      <span className="rounded-full bg-surface-tertiary px-2.5 py-0.5 text-[11px] font-medium text-content-muted">
                        {displayedAutoStroke === -1
                          ? `${k.strokes!.length} trazos`
                          : `${displayedAutoStroke + 1} / ${k.strokes!.length}`}
                      </span>
                    )}
                  </div>

                  {hasStrokes ? (
                    <div className="flex justify-center">
                      <div className="rounded-2xl bg-white p-2 ring-1 ring-border-subtle sm:p-3">
                        <KanjiStrokePlayer
                          viewBox={k.viewBox!}
                          strokes={k.strokes!}
                          activeStrokeIndex={displayedAutoStroke}
                          showNumbers
                          numberMode="uptoActive"
                          size={
                            typeof window !== "undefined" &&
                            window.innerWidth < 640
                              ? 112
                              : 130
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <div className="text-[44px] font-black text-accent sm:text-[64px]">
                        {k.symbol}
                      </div>
                      <p className="text-center text-sm text-content-secondary">
                        Datos de trazos aún no disponibles.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {hasStrokes && (
                <WritingEvaluationGuide
                  eyebrow="Qué corrige la práctica"
                  title="El kanji debe mantenerse estable y bien construido"
                  intro="La nota sale del recorrido real y del equilibrio visual del carácter completo."
                  emphasis="secuencia, dirección y balance"
                  criteria={KANJI_WRITING_CRITERIA}
                  coachNote="Primero asegura la estructura. Luego cuida la energía del trazo para que el kanji se vea firme y claro."
                />
              )}

              <button
                type="button"
                onClick={() => onQuizStart?.(k, "writing")}
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