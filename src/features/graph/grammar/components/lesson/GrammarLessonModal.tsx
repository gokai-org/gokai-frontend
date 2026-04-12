"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, BookOpen, Grid3x3, MessageSquareText, FlaskConical } from "lucide-react";
import { useSidebar } from "@/shared/components/SidebarContext";
import {
  AnimatedLessonTabs,
  LESSON_SECTION_TRANSITION,
  LESSON_SECTION_VARIANTS,
  getAnimatedTabDirection,
  type AnimatedLessonTab,
} from "@/features/lessons/components/AnimatedLessonTabs";
import { useGrammarLesson } from "../../hooks/useGrammarLesson";

import type { GrammarLesson, ImageStep, ExampleStep, TableComponent } from "../../types";

const CONCEPT_CALLOUTS = [
  "Claves de pronunciacion",
  "Cambio gramatical importante",
  "Matiz de uso recomendado",
  "Regla que conviene memorizar",
];

// ── SLIDE TYPES ───────────────────────────────────────────
type Slide =
  | { kind: "meaning"; step: ImageStep; index: number; total: number }
  | { kind: "howToUse" }
  | { kind: "example"; step: ExampleStep; index: number; total: number };

function buildSlides(lesson: GrammarLesson): Slide[] {
  const out: Slide[] = [];
  const ms = lesson.content?.meaning?.content ?? [];
  ms.forEach((step, i) => out.push({ kind: "meaning", step, index: i, total: ms.length }));
  if (lesson.content?.howToUse) out.push({ kind: "howToUse" });
  const es = lesson.content?.examples?.content ?? [];
  es.forEach((step, i) => out.push({ kind: "example", step, index: i, total: es.length }));
  return out;
}

// Groups slides into named sections for the tab bar
type TabId = "conceptos" | "estructura" | "ejemplos";
const TAB_CONFIG: AnimatedLessonTab<TabId>[] = [
  { id: "conceptos",  label: "Conceptos", icon: <BookOpen size={12} /> },
  { id: "estructura", label: "Estructura", icon: <Grid3x3 size={12} /> },
  { id: "ejemplos",   label: "Ejemplos",  icon: <MessageSquareText size={12} /> },
];

function slideToTab(s: Slide): TabId {
  if (s.kind === "meaning") return "conceptos";
  if (s.kind === "howToUse") return "estructura";
  return "ejemplos";
}

// ── CSS VARS – pink accent scope ──────────────────────────
const GRAMMAR_ACCENT_VARS: React.CSSProperties = {
  "--accent":               "#c0395a",
  "--accent-hover":         "#e06578",
  "--accent-subtle":        "rgba(192,57,90,0.10)",
  "--accent-muted":         "rgba(192,57,90,0.06)",
  "--scrollbar-thumb":      "rgba(192,57,90,0.35)",
  "--scrollbar-thumb-hover":"rgba(224,101,120,0.55)",
} as React.CSSProperties;

// ── PATTERN-FORMULA HELPERS ───────────────────────────────

function HighlightFormula({ text }: { text: string }) {
  const tagged = text.split(/(\bS[12]\b|は|が|を|に|で|と|も|の|へ|から|まで|より|です(?:か)?|ます(?:か)?|じゃありません|じゃないです|じゃない|ではありません)/).filter(Boolean);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-0.5 gap-y-3">
      {tagged.map((part, i) => {
        if (/^\bS[12]\b$/.test(part)) {
          const num = part === "S1" ? "1" : "2";
          return (
            <span key={i} className="inline-flex flex-col items-center gap-0.5 mx-1 align-bottom">
              <span className="text-[8px] font-bold uppercase tracking-widest text-content-muted">sujeto {num}</span>
              <span className="rounded-lg border border-border-default bg-surface-secondary px-2.5 py-1 font-mono text-[0.88em] font-extrabold italic text-content-secondary leading-none">{part}</span>
            </span>
          );
        }
        if (/^(は|が|を|に|で|と|も|の|へ|から|まで|より)$/.test(part))
          return (
            <span key={i} className="inline-flex flex-col items-center gap-0.5 align-bottom">
              <span className="text-[8px] font-bold uppercase tracking-widest text-accent/60">partícula</span>
              <span className="font-extrabold text-accent leading-none">{part}</span>
            </span>
          );
        if (/^(です(?:か)?|ます(?:か)?|じゃありません|じゃないです|じゃない|ではありません)$/.test(part))
          return (
            <span key={i} className="inline-flex flex-col items-center gap-0.5 align-bottom">
              <span className="text-[8px] font-bold uppercase tracking-widest text-accent-hover/60">forma verbal</span>
              <span className="font-extrabold text-accent-hover leading-none">{part}</span>
            </span>
          );
        return <span key={i} className="align-bottom leading-none">{part}</span>;
      })}
    </span>
  );
}

function HighlightSentence({ text }: { text: string }) {
  const parts = text.split(/(は|が|を|に|で|と|も|の|へ|から|まで|より|です(?:か)?|ます(?:か)?|じゃありません|じゃないです|じゃない|ではありません)/).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (/^(は|が|を|に|で|と|も|の|へ|から|まで|より)$/.test(p))
          return <span key={i} className="font-bold text-accent">{p}</span>;
        if (/^(です(?:か)?|ます(?:か)?|じゃありません|じゃないです|じゃない|ではありません)$/.test(p))
          return <span key={i} className="font-bold text-accent-hover">{p}</span>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function extractConceptTitle(text: string) {
  const firstSentence = text
    .split(/(?<=[.!?])\s+/)
    .find((segment) => segment.trim().length > 0)
    ?.trim();

  if (!firstSentence) {
    return "Idea central";
  }

  return firstSentence;
}

// ── PATTERN DECK (replaces plain table) ───────────────────
const ROW_STATES = ["Afirmativo","Negativo","Pregunta","Formal"] as const;
type RowState = typeof ROW_STATES[number];

const STATE_COLOR: Record<RowState, { border: string; bg: string; pill: string }> = {
  Afirmativo: { border: "border-emerald-200/70 dark:border-emerald-800/30", bg: "bg-emerald-50/40 dark:bg-emerald-950/10",  pill: "bg-emerald-100 border-emerald-300/60 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/40 dark:text-emerald-300" },
  Negativo:   { border: "border-rose-200/70   dark:border-rose-800/30",   bg: "bg-rose-50/40   dark:bg-rose-950/10",    pill: "bg-rose-100   border-rose-300/60   text-rose-700   dark:bg-rose-950/40   dark:border-rose-700/40   dark:text-rose-300" },
  Pregunta:   { border: "border-sky-200/70    dark:border-sky-800/30",    bg: "bg-sky-50/40    dark:bg-sky-950/10",     pill: "bg-sky-100    border-sky-300/60    text-sky-700    dark:bg-sky-950/40    dark:border-sky-700/40    dark:text-sky-300" },
  Formal:     { border: "border-violet-200/70 dark:border-violet-800/30", bg: "bg-violet-50/40 dark:bg-violet-950/10", pill: "bg-violet-100 border-violet-300/60 text-violet-700 dark:bg-violet-950/40 dark:border-violet-700/40 dark:text-violet-300" },
};
const DEFAULT_ROW = { border: "border-border-subtle", bg: "bg-surface-secondary/50", pill: "bg-surface-tertiary border-border-subtle text-content-muted" };

function getRowColor(val: string) {
  for (const k of ROW_STATES) {
    if (val.includes(k)) return STATE_COLOR[k];
  }
  return DEFAULT_ROW;
}

function PatternDeck({ table }: { table: TableComponent }) {
  const { headers, rows } = table.content;
  type FlatRow = { state?: string; style?: string; formula?: string };
  const flatRows: FlatRow[] = [];
  const pending: { col: number; value: string; rem: number }[] = [];

  for (const row of rows) {
    const resolved: string[] = [];
    let src = 0;
    for (let col = 0; col < headers.length; col++) {
      const ps = pending.find((p) => p.col === col);
      if (ps) {
        resolved.push(ps.value);
        ps.rem--;
        if (ps.rem === 0) pending.splice(pending.indexOf(ps), 1);
      } else {
        const cell = row.cells[src++];
        resolved.push(cell?.value ?? "");
        if (cell && cell.rowspan > 1) pending.push({ col, value: cell.value, rem: cell.rowspan - 1 });
      }
    }
    const flat: FlatRow = {};
    headers.forEach((h, i) => {
      const v = resolved[i] ?? "";
      const hl = h.toLowerCase();
      if (hl.includes("estado") || hl.includes("tipo")) flat.state = v;
      else if (hl.includes("estilo") || hl.includes("nivel")) flat.style = v;
      else flat.formula = v;
    });
    if (!flat.formula && headers.length <= 2) { flat.formula = flat.style; flat.style = undefined; }
    flatRows.push(flat);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {flatRows.map((row, i) => {
        const colors = getRowColor(row.state ?? "");
        return (
          <div key={i} className={`overflow-hidden rounded-2xl border ${colors.border}`}>
            {/* Header with full-name badge */}
            <div className={`flex flex-wrap items-center gap-2 px-4 py-2.5 ${colors.bg}`}>
              {row.state && (
                <span className={`rounded-full border px-3 py-0.5 text-[11px] font-bold ${colors.pill}`}>
                  {row.state}
                </span>
              )}
              {row.style && (
                <span className="rounded-full border border-border-subtle bg-surface-primary/80 px-2.5 py-0.5 text-[10px] font-semibold text-content-muted">
                  {row.style}
                </span>
              )}
            </div>
            {/* Formula area */}
            {row.formula && (
              <div className="bg-surface-primary/70 px-4 py-4">
                <div className="text-[15px] font-bold tracking-wide text-content-primary">
                  <HighlightFormula text={row.formula} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────
interface Props {
  lessonId: string;
  onClose: () => void;
  onExamOpen: () => void;
}

export default function GrammarLessonModal({ lessonId, onClose, onExamOpen }: Props) {
  const { setHidden } = useSidebar();
  const { lesson, status } = useGrammarLesson(lessonId);

  const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [activeTab, setActiveTab] = useState<TabId>("conceptos");
  const [slideIdx, setSlideIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const hasExam = !!(lesson?.content?.exam?.length);

  useEffect(() => {
    setHidden(true);
    return () => setHidden(false);
  }, [setHidden]);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setScreen("mobile");
      else if (window.innerWidth < 1024) setScreen("tablet");
      else setScreen("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const slides = useMemo(() => (lesson ? buildSlides(lesson) : []), [lesson]);

  // Available tabs filtered to what actually exists
  const availableTabs = useMemo(() => {
    const present = new Set(slides.map(slideToTab));
    return TAB_CONFIG.filter((t) => present.has(t.id));
  }, [slides]);
  const resolvedActiveTab =
    availableTabs.find((tab) => tab.id === activeTab)?.id ??
    availableTabs[0]?.id ??
    "conceptos";

  // Slides for the current tab
  const tabSlides = useMemo(
    () => slides.filter((s) => slideToTab(s) === resolvedActiveTab),
    [resolvedActiveTab, slides],
  );
  const resolvedSlideIdx =
    tabSlides.length === 0 ? 0 : Math.min(slideIdx, tabSlides.length - 1);
  const current = tabSlides[resolvedSlideIdx] ?? null;
  const isFirst  = resolvedSlideIdx === 0;
  const isLast   = resolvedSlideIdx === tabSlides.length - 1;

  const goNext = useCallback(() => {
    if (!isLast) { setDir(1); setSlideIdx((i) => i + 1); }
  }, [isLast]);

  const goPrev = useCallback(() => {
    if (!isFirst) { setDir(-1); setSlideIdx((i) => i - 1); }
  }, [isFirst]);

  const switchTab = useCallback((tab: TabId) => {
    if (tab === resolvedActiveTab) return;
    setDir(getAnimatedTabDirection(availableTabs, resolvedActiveTab, tab));
    setActiveTab(tab);
    setSlideIdx(0);
  }, [availableTabs, resolvedActiveTab]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, goNext, goPrev]);

  // ── Layout classes (same as LessonDrawer) ──────────────
  const wrapperCls =
    screen === "desktop"
      ? "fixed inset-0 z-[60] flex items-stretch justify-end p-3 pointer-events-none"
      : "fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 pointer-events-none";

  const asideCls =
    screen === "desktop"
      ? "pointer-events-auto flex h-full w-[min(58vw,760px)] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-border-default/60 bg-surface-primary shadow-2xl"
      : screen === "tablet"
        ? "pointer-events-auto flex w-[min(92vw,560px)] h-[min(82dvh,760px)] flex-col overflow-hidden rounded-3xl border border-border-default/60 bg-surface-primary shadow-2xl"
        : "pointer-events-auto flex w-[min(calc(100vw-16px),420px)] h-[min(82dvh,700px)] flex-col overflow-hidden rounded-[28px] border border-border-default/60 bg-surface-primary shadow-2xl";

  const initial = screen === "desktop" ? { x: 64, opacity: 0 } : { scale: 0.95, opacity: 0, y: 20 };
  const animate = screen === "desktop" ? { x: 0,  opacity: 1 } : { scale: 1,    opacity: 1, y: 0 };
  const exit    = screen === "desktop" ? { x: 64, opacity: 0 } : { scale: 0.95, opacity: 0, y: 16 };
  const footerHasContent = status === "success" && (tabSlides.length > 1 || hasExam);

  return (
    <AnimatePresence>
      {/* Backdrop (same weight as LessonDrawer) */}
      <motion.button
        key="backdrop"
        aria-label="Cerrar"
        onClick={onClose}
        className="fixed inset-0 z-[59] bg-black/25 backdrop-blur-[1px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      />

      <div key="wrapper" className={wrapperCls}>
        <motion.aside
          className={asideCls}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.85 }}
          style={GRAMMAR_ACCENT_VARS}
        >
          {/* ── HEADER (exact LessonDrawer structure) ──── */}
          <div className="shrink-0 overflow-hidden rounded-t-[28px] lg:rounded-t-3xl">
            <div className="bg-gradient-to-r from-accent to-accent-hover px-4 py-2.5 sm:px-5 sm:py-3">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                  {/* Symbol box */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner backdrop-blur-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                    <span className="select-none text-[11px] font-black leading-none text-white sm:text-[13px]">
                      文法
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:text-[10px]">
                        Gramática
                      </span>
                      {lesson?.pointsToUnlock != null && lesson.pointsToUnlock > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {lesson.pointsToUnlock}
                        </span>
                      )}
                    </div>

                    <h2
                      className="mt-0.5 text-balance font-extrabold leading-tight text-white"
                      style={{ fontSize: "clamp(0.98rem, 0.86rem + 0.55vw, 1.35rem)" }}
                    >
                      {status === "loading" ? "Cargando…" : (lesson?.title ?? "Lección")}
                    </h2>

                    {lesson?.description && (
                      <p
                        className="mt-0.5 text-pretty font-medium leading-relaxed text-white/78"
                        style={{ fontSize: "clamp(0.7rem, 0.68rem + 0.2vw, 0.82rem)" }}
                      >
                        {lesson.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── TAB BAR (same style as KanaLesson tabs) ── */}
          {availableTabs.length > 1 && (
            <div className="shrink-0 px-3 pt-3 sm:px-5">
              <AnimatedLessonTabs
                tabs={availableTabs}
                activeTab={resolvedActiveTab}
                onChange={switchTab}
                layoutId="grammar-tab-bg"
                className="[&>button]:min-h-[48px] sm:[&>button]:min-h-[56px]"
              />
            </div>
          )}

          {/* ── BODY ──────────────────────────────────── */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {status === "loading" && (
              <div className="flex h-full items-center justify-center px-3 sm:px-5">
                <div className="w-full space-y-3 animate-pulse">
                  <div className="h-48 rounded-3xl bg-surface-tertiary" />
                  <div className="h-3 w-3/4 rounded-full bg-surface-tertiary" />
                  <div className="h-3 w-1/2 rounded-full bg-surface-tertiary" />
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex h-full items-center justify-center px-3 sm:px-5">
                <div className="rounded-2xl border border-border-subtle bg-surface-secondary p-4 text-sm text-content-secondary sm:rounded-3xl sm:p-5">
                  No hay lecciones para este nodo todavía.
                </div>
              </div>
            )}

            {status === "success" && current && (
              <div
                className="absolute inset-0 overflow-x-hidden overflow-y-auto px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4"
                style={{ perspective: 1800 }}
              >
                <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={`${resolvedActiveTab}-${resolvedSlideIdx}`}
                  custom={dir}
                  variants={LESSON_SECTION_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={LESSON_SECTION_TRANSITION}
                  className="min-h-full origin-center will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <SlideContent
                    slide={current}
                    lesson={lesson!}
                  />
                </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {footerHasContent && (
            <div className="shrink-0 border-t border-border-subtle bg-surface-primary/95 px-3 py-3 backdrop-blur-sm sm:px-5 sm:py-4">
              {status === "success" && tabSlides.length > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={isFirst}
                    className="flex items-center gap-1 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-bold text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={13} /> Anterior
                  </button>

                  <div className="flex items-center gap-1.5">
                    {tabSlides.map((_, i) => {
                      const active = i === resolvedSlideIdx;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setDir(i > resolvedSlideIdx ? 1 : -1);
                            setSlideIdx(i);
                          }}
                          className="flex h-4 items-center"
                          aria-label={`Ir al paso ${i + 1}`}
                        >
                          <motion.span
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            className={active ? "rounded-full bg-[var(--accent)]" : "rounded-full bg-border-subtle"}
                            style={{
                              width: active ? 16 : 6,
                              height: active ? 8 : 6,
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={isLast}
                    className="flex items-center gap-1 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-bold text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Siguiente <ChevronRight size={13} />
                  </button>
                </div>
              )}

              {status === "success" && hasExam && (
                <div className={tabSlides.length > 1 ? "mt-3" : undefined}>
                  <button
                    type="button"
                    onClick={onExamOpen}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                  >
                    <FlaskConical size={15} />
                    Hacer examen
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}

// ── SLIDE CONTENT RENDERER ────────────────────────────────
function SlideContent({
  slide,
  lesson,
}: {
  slide: Slide;
  lesson: GrammarLesson;
}) {
  switch (slide.kind) {
    // ── MEANING (concept image card) ──────────────────
    case "meaning": {
      const { step, index, total } = slide;
      const conceptTitle = extractConceptTitle(step.description);
      const conceptTag = CONCEPT_CALLOUTS[index % CONCEPT_CALLOUTS.length];
      return (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-b from-surface-elevated via-surface-elevated to-surface-secondary shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:rounded-[28px]">
            <div className="h-1.5 bg-gradient-to-r from-accent via-accent-hover to-accent" />

            <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">
              {/* Counter */}
              {total > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-content-muted sm:text-[11px]">
                    Concepto {index + 1} de {total}
                  </p>
                  <div className="flex gap-1">
                    {Array.from({ length: total }, (_, i) => (
                      <span key={i} className={`h-1.5 rounded-full transition-all duration-200 ${i === index ? "w-4 bg-accent" : "w-1.5 bg-border-subtle"}`} />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-accent/15 bg-accent/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                    {conceptTag}
                  </span>
                  <span className="rounded-full border border-border-subtle bg-surface-primary/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-content-muted">
                    Concepto {index + 1}
                  </span>
                </div>

                <div>
                  <h3
                    className="text-pretty font-extrabold leading-tight text-content-primary"
                    style={{ fontSize: "clamp(1rem, 0.84rem + 0.58vw, 1.38rem)" }}
                  >
                    {conceptTitle}
                  </h3>
                  <p
                    className="mt-2 text-pretty leading-[1.9] text-content-secondary"
                    style={{ fontSize: "clamp(0.83rem, 0.76rem + 0.28vw, 1rem)" }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Image in accent-tinted container */}
              <div className="relative overflow-hidden rounded-[28px] border border-accent/10 bg-[radial-gradient(circle_at_top_right,rgba(192,57,90,0.14),transparent_38%),linear-gradient(135deg,rgba(192,57,90,0.08),rgba(224,101,120,0.04)_45%,rgba(255,255,255,0)_100%)] p-3 sm:p-4">
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
                <div className="relative overflow-hidden rounded-[22px] border border-white/50 bg-white/70 shadow-[0_14px_40px_rgba(192,57,90,0.10)] dark:border-white/10 dark:bg-black/10">
                  <div className="absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    Referencia visual
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.img}
                    alt={`Ilustración ${index + 1}`}
                    className="relative block h-[240px] w-full object-cover object-center sm:h-[300px]"
                    onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      );
    }

    // ── HOW TO USE (pattern deck) ──────────────────────
    case "howToUse":
      return (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-b from-surface-elevated via-surface-elevated to-surface-secondary shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:rounded-[28px]">
            <div className="h-1.5 bg-gradient-to-r from-accent via-accent-hover to-accent" />

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-content-muted sm:text-[11px]">
                Patrones de la estructura
              </p>

              <PatternDeck table={lesson.content!.howToUse} />
            </div>
          </div>
        </div>
      );

    // ── EXAMPLE (flash card) ───────────────────────────
    case "example": {
      const { step, index, total } = slide;
      return (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-b from-surface-elevated via-surface-elevated to-surface-secondary shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:rounded-[28px]">
            <div className="h-1.5 bg-gradient-to-r from-accent via-accent-hover to-accent" />

            <div className="p-4 sm:p-5">
              {/* Counter */}
              {total > 1 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-content-muted">
                    Ejemplo {index + 1} de {total}
                  </p>
                </div>
              )}

              {/* Main flash card — hero style */}
              <div className="relative overflow-hidden rounded-3xl border border-accent/10 bg-gradient-to-br from-accent/8 via-accent/4 to-transparent p-5 text-center sm:p-6">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/8 blur-2xl" />

                {/* Japanese sentence */}
                <p className="relative text-2xl font-bold leading-snug text-content-primary sm:text-[28px]">
                  <HighlightSentence text={step.kanji} />
                </p>
                <p className="relative mt-1.5 text-sm font-semibold text-accent sm:text-base">
                  <HighlightSentence text={step.kana} />
                </p>

                {/* Divider */}
                <div className="relative my-3.5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-accent/20" />
                  <span className="text-[9px] font-extrabold tracking-widest text-content-muted">ESPAÑOL</span>
                  <div className="h-px flex-1 bg-accent/20" />
                </div>

                <p className="relative text-sm text-content-secondary">{step.meaning}</p>
              </div>
            </div>
          </div>

          {/* Quick tips */}
          <div className="rounded-2xl border border-accent/12 bg-accent/5 p-3.5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">
              Analiza la oración
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
                <p className="text-[10px] font-bold text-content-muted">Kanji</p>
                <p className="mt-0.5 text-xs font-semibold text-content-primary">{step.kanji}</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
                <p className="text-[10px] font-bold text-content-muted">Lectura</p>
                <p className="mt-0.5 text-xs font-semibold text-content-primary">{step.kana}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }


  }
}