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
    h: "Fila H-F (HA-HI-FU-HE-HO)",
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

export default function KanaLesson({
  data,
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
    <div className="overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-b from-surface-elevated via-surface-elevated to-surface-secondary shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:rounded-[28px]">
      <div className="h-1.5 bg-gradient-to-r from-accent via-accent-hover to-accent" />

      <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-accent/10 bg-gradient-to-br from-accent/8 via-accent/4 to-transparent p-4 sm:p-5">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-accent/8 blur-2xl" />

          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/12 bg-surface-elevated text-[38px] font-black leading-none text-accent shadow-sm sm:h-20 sm:w-20 sm:text-[52px]">
              {k.symbol}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-content-muted sm:text-[11px]">
                Valor del kana
              </p>

              <p className="mt-1 text-sm font-bold text-content-primary sm:text-base">
                Este {typeLabel.toLowerCase()} representa el sonido{" "}
                <span className="text-accent">{k.romaji}</span>
              </p>

              <p className="mt-1 text-[11px] leading-relaxed text-content-secondary sm:text-xs">
                Memorízalo como una unidad de sonido. La idea es que al verlo,
                identifiques su pronunciación de inmediato.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas rápidas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-accent/15 bg-accent/6 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">
              Sonido principal
            </p>
            <p className="mt-2 text-2xl font-black text-content-primary">
              {k.romaji}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-content-secondary">
              Esta es la lectura base que debes reconocer al instante.
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-surface-elevated to-surface-tertiary/70 p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-content-secondary">
              Tipo de carácter
            </p>
            <p className="mt-2 text-[13px] font-bold text-content-primary">
              {typeLabel}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-content-secondary">
              Úsalo para distinguir si estás leyendo el silabario hiragana o
              katakana.
            </p>
          </div>
        </div>

        {/* Posición útil */}
        <div className="rounded-3xl border border-border-subtle bg-surface-primary/70 p-3 shadow-sm sm:p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-content-muted sm:text-[11px]">
            Ubicación en la tabla fonética
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-2xl border border-accent/15 bg-accent/8 px-3 py-2 text-sm font-bold text-accent shadow-sm">
              {phonemic.row}
            </span>
            <span className="rounded-2xl border border-border-subtle bg-surface-tertiary px-3 py-2 text-sm font-semibold text-content-secondary shadow-sm">
              {phonemic.col}
            </span>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-content-secondary">
            Piensa en este kana como parte de una familia de sonidos. Su fila y
            columna te ayudan a ubicarlo mentalmente dentro del silabario.
          </p>
        </div>

        {/* Idea de aprendizaje */}
        <div className="rounded-2xl border border-accent/12 bg-accent/5 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-content-muted">
            Cómo aprenderlo rápido
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
              <p className="text-[10px] font-black text-accent">1</p>
              <p className="mt-1 text-[11px] text-content-secondary">
                Mira su <span className="font-semibold text-content-primary">forma</span>.
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
              <p className="text-[10px] font-black text-accent">2</p>
              <p className="mt-1 text-[11px] text-content-secondary">
                Repite su <span className="font-semibold text-content-primary">sonido</span>.
              </p>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
              <p className="text-[10px] font-black text-accent">3</p>
              <p className="mt-1 text-[11px] text-content-secondary">
                Relaciónalo con su <span className="font-semibold text-content-primary">posición</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={() => onQuizStart?.(k, "from_kana")}
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
                onClick={() => onQuizStart?.(k, "from_romaji")}
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
                        {displayedAutoStroke === -1
                          ? `${k.strokes!.length} trazos`
                          : `${displayedAutoStroke + 1} / ${k.strokes!.length}`}
                      </span>
                    )}
                  </div>

                  {hasStrokes ? (
                    <div className="flex justify-center">
                      <div className="rounded-2xl bg-white p-2 sm:p-3 ring-1 ring-border-subtle">
                        <KanaStrokePlayer
                          viewBox={k.viewBox!}
                          strokes={k.strokes!}
                          activeStrokeIndex={displayedAutoStroke}
                          showNumbers={displayedAutoStroke >= 0}
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
                onClick={() => onQuizStart?.(k, "canvas")}
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