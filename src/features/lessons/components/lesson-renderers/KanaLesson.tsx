"use client";

import { useState, useRef, useEffect } from "react";
import type { LessonMode, LessonResolved } from "@/features/lessons/types";
import LessonCTA from "@/features/lessons/components/LessonCTA";
import { KanaStrokePlayer } from "@/features/kana/components/KanaStrokePlayer";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Volume2, PenLine } from "lucide-react";
import type { KanaQuizType } from "@/features/kana/types/quiz";

type KanaTab = "meaning" | "reading" | "writing";

const KANA_TABS: { id: KanaTab; label: string; icon: React.ReactNode }[] = [
  { id: "meaning", label: "Significado", icon: <Layers size={12} /> },
  { id: "reading", label: "Lectura", icon: <Volume2 size={12} /> },
  { id: "writing", label: "Trazado", icon: <PenLine size={12} /> },
];

function getPhonemicGuide(romaji: string): { row: string; col: string; tip: string } {
  const r = romaji.toLowerCase();

  const vowelMap: Record<string, string> = {
    a: "1a columna (A)",
    i: "2a columna (I)",
    u: "3a columna (U)",
    e: "4a columna (E)",
    o: "5a columna (O)",
  };

  const rowNames: Record<string, string> = {
    k: "Fila K (KA-KI-KU-KE-KO)",
    s: "Fila S (SA-SU-SE-SO)",
    t: "Fila T (TA-TU-TE-TO)",
    n: "Fila N (NA-NI-NU-NE-NO)",
    h: "Fila H (HA-HI-HU-HE-HO)",
    m: "Fila M (MA-MI-MU-ME-MO)",
    y: "Fila Y (YA-YU-YO)",
    r: "Fila R (RA-RI-RU-RE-RO)",
    w: "Fila W (WA-WO)",
    g: "Fila G (GA-GI-GU-GE-GO)",
    z: "Fila Z (ZA-ZU-ZE-ZO)",
    d: "Fila D (DA-DU-DE-DO)",
    b: "Fila B (BA-BI-BU-BE-BO)",
    p: "Fila P (PA-PI-PU-PE-PO)",
  };

  const tips: Record<string, string> = {
    k: "Sonido K suave, sin aspiracion al inicio.",
    s: 'Sonido S sibilante, como en "si".',
    t: "Sonido T suave, dental.",
    n: "Sonido N nasal, similar al espanol.",
    h: "Sonido H ligeramente aspirado.",
    m: "Sonido M bilabial cerrado.",
    y: "Sonido Y semiconsonante.",
    r: "Entre R y L del espanol - toca levemente el paladar.",
    w: "Sonido W labial.",
    g: "Sonido G sonoro suave.",
    z: "Sonido Z sonoro, parecido a DS.",
    d: "Sonido D dental sonoro.",
    b: "Sonido B bilabial sonoro.",
    p: "Sonido P bilabial sordo.",
  };

  if (["a", "i", "u", "e", "o"].includes(r)) {
    return {
      row: "Vocales (fila A)",
      col: vowelMap[r] || `Vocal ${r.toUpperCase()}`,
      tip: `Vocal pura - suena como "${r.toUpperCase()}" del espanol.`,
    };
  }

  if (r === "n") {
    return {
      row: "N (consonante nasal)",
      col: "Consonante nasal",
      tip: 'Consonante sin vocal. Suena como "n" al final de silaba.',
    };
  }

  const lastChar = r.slice(-1);
  const consonant = r.slice(0, -1) || r[0];

  return {
    row: rowNames[consonant] || rowNames[consonant[0]] || `Fila ${consonant.toUpperCase()}`,
    col: vowelMap[lastChar] || `Vocal ${lastChar.toUpperCase()}`,
    tip:
      tips[consonant] ||
      tips[consonant[0]] ||
      `Consonante ${consonant.toUpperCase()} + vocal ${lastChar.toUpperCase()}.`,
  };
}

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
  onQuizStart?: (entity: { id: string; symbol: string }, quizType?: KanaQuizType) => void;
}) {
  const k = data.kana;
  const [activeTab, setActiveTab] = useState<KanaTab>("meaning");
  const [autoStroke, setAutoStroke] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typeLabel = k.kanaType === "hiragana" ? "Hiragana" : "Katakana";
  const hasStrokes = !!(k.strokes && k.strokes.length > 0 && k.viewBox);
  const phonemic = getPhonemicGuide(k.romaji ?? "");

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
      <div className="grid grid-cols-3 gap-1 rounded-xl sm:rounded-2xl bg-surface-secondary border border-border-subtle p-1">
        {KANA_TABS.map((tab) => {
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
              <span className="leading-tight text-center">{tab.label}</span>
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
          {activeTab === "meaning" && (
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
                      {typeLabel} &middot; {modeTitle[mode]}
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
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        {k.strokes!.length} trazos
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-[16px] border border-border-subtle bg-surface-secondary p-3 sm:p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
                  Posicion en el tablero
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-xl bg-accent/8 border border-accent/15 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-accent">
                    {phonemic.row}
                  </span>
                  <span className="rounded-xl bg-surface-tertiary border border-border-subtle px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-content-secondary">
                    {phonemic.col}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar este kana
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
                      <p className="mb-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-content-muted">
                        Lectura romanizada
                      </p>
                      <div className="truncate text-lg sm:text-3xl font-black tracking-wide text-content-primary">
                        {k.romaji ?? "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-accent/8 border border-accent/15 px-3 py-2 sm:px-4 sm:py-3">
                    <span className="text-lg sm:text-2xl font-black text-accent">{k.romaji ?? "-"}</span>
                    <span className="text-[11px] sm:text-xs leading-snug text-content-secondary">
                      {phonemic.tip}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-[16px] bg-accent/5 border border-accent/10 p-3">
                <p className="mb-1 text-[11px] font-bold text-accent">Fonetica</p>
                <p className="text-[12px] leading-relaxed text-content-secondary">
                  <span className="font-semibold text-content-primary">{phonemic.row}</span>
                  {" - "}columna de vocal{" "}
                  <span className="font-semibold text-content-primary">
                    {k.romaji?.slice(-1).toUpperCase()}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Lectura
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
                        <KanaStrokePlayer
                          viewBox={k.viewBox!}
                          strokes={k.strokes!}
                          activeStrokeIndex={autoStroke}
                          showNumbers={autoStroke >= 0}
                          size={typeof window !== "undefined" && window.innerWidth < 640 ? 112 : 130}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <div className="text-[44px] sm:text-[64px] font-black text-accent">{k.symbol}</div>
                      <p className="text-sm text-center text-content-secondary">
                        Datos de trazos no disponibles.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {hasStrokes && (
                <div className="rounded-2xl sm:rounded-[16px] bg-accent/5 border border-accent/10 p-3">
                  <p className="text-[12px] leading-relaxed text-content-secondary">
                    <span className="font-semibold text-content-primary">Observa el orden</span>{" "}
                    y direccion de cada trazo - el trazo correcto mejora tu precision.
                  </p>
                </div>
              )}

              <button
                type="button"
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/15"
              >
                Practicar: Trazado
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div>
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

        {ctaDisabled && ctaDisabledReason && (
          <p className="mt-1.5 text-center text-xs leading-5 text-content-secondary">
            {ctaDisabledReason}
          </p>
        )}
      </div>
    </div>
  );
}