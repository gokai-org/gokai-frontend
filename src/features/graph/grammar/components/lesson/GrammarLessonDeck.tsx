"use client";

import { useCallback, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, FlaskConical, Grid3x3, MessageSquareText } from "lucide-react";
import GrammarAdaptiveTable from "./sections/GrammarAdaptiveTable";
import { resolveTableRows } from "../../lib/grammarTableLayout";
import type { ExampleStep, GrammarLesson, ImageStep, TableComponent } from "../../types";

type Slide =
  | { kind: "meaning"; step: ImageStep; index: number; total: number }
  | { kind: "meaningTable"; table: TableComponent; rowIndex: number; total: number }
  | { kind: "howToUse"; table: TableComponent }
  | { kind: "example"; step: ExampleStep; index: number; total: number };

type TabId = "conceptos" | "estructura" | "ejemplos";

const TAB_CONFIG: Array<{ id: TabId; label: string; icon: typeof BookOpen }> = [
  { id: "conceptos", label: "Conceptos", icon: BookOpen },
  { id: "estructura", label: "Estructura", icon: Grid3x3 },
  { id: "ejemplos", label: "Ejemplos", icon: MessageSquareText },
];

function buildSlides(lesson: GrammarLesson): Slide[] {
  const slides: Slide[] = [];
  const meaning = lesson.content?.meaning;

  if (meaning?.type === "image_stepper") {
    meaning.content.forEach((step, index) => {
      slides.push({ kind: "meaning", step, index, total: meaning.content.length });
    });
  } else if (meaning?.type === "table") {
    const rows = resolveTableRows(meaning);
    const total = Math.max(rows.length, 1);

    for (let rowIndex = 0; rowIndex < total; rowIndex += 1) {
      slides.push({ kind: "meaningTable", table: meaning, rowIndex, total });
    }
  }

  if (lesson.content?.howToUse) {
    slides.push({ kind: "howToUse", table: lesson.content.howToUse });
  }

  const examples = Array.isArray(lesson.content?.examples?.content)
    ? lesson.content.examples.content
    : [];

  examples.forEach((step, index) => {
    slides.push({ kind: "example", step, index, total: examples.length });
  });

  return slides;
}

function slideToTab(slide: Slide): TabId {
  if (slide.kind === "meaning" || slide.kind === "meaningTable") {
    return "conceptos";
  }

  if (slide.kind === "howToUse") {
    return "estructura";
  }

  return "ejemplos";
}

function HighlightSentence({ text }: { text: string }) {
  const parts = text
    .split(/(は|が|を|に|で|と|も|の|へ|から|まで|より|です(?:か)?|ます(?:か)?|じゃありません|じゃないです|じゃない|ではありません)/)
    .filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (/^(は|が|を|に|で|と|も|の|へ|から|まで|より)$/.test(part)) {
          return (
            <span key={`${part}-${index}`} className="font-black text-[var(--accent)]">
              {part}
            </span>
          );
        }

        if (/^(です(?:か)?|ます(?:か)?|じゃありません|じゃないです|じゃない|ではありません)$/.test(part)) {
          return (
            <span key={`${part}-${index}`} className="font-black text-[var(--accent-hover)]">
              {part}
            </span>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function SurfaceSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[2px] border border-border-subtle/60 bg-surface-primary/70 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:bg-surface-secondary/50">
      <div className="border-b border-border-subtle/50 bg-accent/[0.04] px-[3px] py-[2px] dark:border-white/[0.04] dark:bg-white/[0.03]">
        <p className="text-[2px] font-black uppercase tracking-[0.22em] text-accent/75">
          {eyebrow}
        </p>
        <h3 className="text-[3px] font-black leading-tight text-content-primary">
          {title}
        </h3>
      </div>
      <div className="p-[3px]">
        {children}
      </div>
    </section>
  );
}

function MeaningImageSlide({ step, index, total }: { step: ImageStep; index: number; total: number }) {
  const hasImage = step.img.trim().length > 0;

  return (
    <SurfaceSection eyebrow={`Concepto ${index + 1} / ${total}`} title="Idea central">
      <div className="space-y-1">
        {hasImage ? (
          <div className="relative overflow-hidden rounded-[3px] border border-accent/10 bg-[radial-gradient(circle_at_top_right,rgba(153,51,49,0.14),transparent_38%),linear-gradient(135deg,rgba(153,51,49,0.08),rgba(186,81,73,0.04)_45%,rgba(255,255,255,0)_100%)] p-[1.5px]">
            <div className="relative flex min-h-[25px] items-center justify-center overflow-hidden rounded-[3px] border border-white/50 bg-white/80 px-[1.5px] py-[1.5px] shadow-[0_14px_30px_rgba(153,51,49,0.10)] dark:border-white/10 dark:bg-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.img}
                alt={`Ilustración ${index + 1}`}
                className="block max-h-[30px] w-full object-contain object-center"
                onError={(event) => {
                  (event.currentTarget.parentElement as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="rounded-[2px] border border-border-subtle bg-surface-primary/80 px-[2px] py-[1.5px] text-[2.5px] leading-[1.4] text-content-secondary">
          {step.description}
        </div>
      </div>
    </SurfaceSection>
  );
}

function MeaningTableSlide({ table, rowIndex, total }: { table: TableComponent; rowIndex: number; total: number }) {
  return (
    <SurfaceSection eyebrow={`Concepto ${rowIndex + 1} / ${total}`} title="Resumen visual">
      <GrammarAdaptiveTable table={table} section="meaning" visibleRowIndex={rowIndex} />
    </SurfaceSection>
  );
}

function HowToUseSlide({ table }: { table: TableComponent }) {
  return (
    <SurfaceSection eyebrow="Estructura" title="Como se usa">
      <GrammarAdaptiveTable table={table} section="howToUse" />
    </SurfaceSection>
  );
}

function ExampleSlide({ step, index, total }: { step: ExampleStep; index: number; total: number }) {
  return (
    <SurfaceSection eyebrow={`Ejemplo ${index + 1} / ${total}`} title="Aplicación en contexto">
      <div className="space-y-1">
        <div className="relative overflow-hidden rounded-[3px] border border-accent/10 bg-gradient-to-br from-accent/8 via-accent/4 to-transparent p-[2px] text-center">
          <div className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-accent/10 blur-2xl" />
          <div className="absolute -bottom-2 -left-2 h-5 w-5 rounded-full bg-accent/8 blur-2xl" />
          <p className="relative text-[3.5px] font-bold leading-[1.3] text-content-primary">
            <HighlightSentence text={step.kanji} />
          </p>
          {step.kana.trim().length > 0 ? (
            <p className="relative text-[2.5px] font-semibold text-accent">
              <HighlightSentence text={step.kana} />
            </p>
          ) : null}
          <div className="relative my-[0.5px] flex items-center gap-2">
            <div className="h-px flex-1 bg-accent/20" />
            <span className="text-[2px] font-black uppercase tracking-[0.18em] text-content-muted">ESPAÑOL</span>
            <div className="h-px flex-1 bg-accent/20" />
          </div>
          <p className="relative text-[2.5px] leading-[1.4] text-content-secondary">
            {step.meaning || "Este ejemplo todavía no trae traducción desde la API."}
          </p>
        </div>

        <div className="grid gap-[1.5px] sm:grid-cols-2">
          <div className="rounded-[2px] border border-border-subtle bg-surface-primary/75 px-[2px] py-[1.5px]">
            <p className="text-[2px] font-black uppercase tracking-[0.18em] text-content-muted">Kanji</p>
            <p className="text-[2.5px] font-semibold text-content-primary">{step.kanji}</p>
          </div>
          <div className="rounded-[2px] border border-border-subtle bg-surface-primary/75 px-[2px] py-[1.5px]">
            <p className="text-[2px] font-black uppercase tracking-[0.18em] text-content-muted">Lectura</p>
            <p className="text-[2.5px] font-semibold text-content-primary">{step.kana || "Sin lectura"}</p>
          </div>
        </div>
      </div>
    </SurfaceSection>
  );
}

export interface GrammarLessonDeckProps {
  lesson: GrammarLesson;
  onStartExam?: () => void;
}

export default function GrammarLessonDeck({ lesson, onStartExam }: GrammarLessonDeckProps) {
  const [activeTab, setActiveTab] = useState<TabId>("conceptos");
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = useMemo(() => buildSlides(lesson), [lesson]);
  const availableTabs = useMemo(() => {
    const present = new Set(slides.map(slideToTab));
    return TAB_CONFIG.filter((tab) => present.has(tab.id));
  }, [slides]);
  const resolvedActiveTab =
    availableTabs.find((tab) => tab.id === activeTab)?.id ?? availableTabs[0]?.id ?? "conceptos";
  const tabSlides = useMemo(
    () => slides.filter((slide) => slideToTab(slide) === resolvedActiveTab),
    [resolvedActiveTab, slides],
  );
  const resolvedSlideIndex = tabSlides.length === 0 ? 0 : Math.min(slideIndex, tabSlides.length - 1);
  const current = tabSlides[resolvedSlideIndex] ?? null;

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSlideIndex(0);
  }, []);

  const handlePrevious = useCallback(() => {
    setSlideIndex((value) => Math.max(0, value - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSlideIndex((value) => Math.min(tabSlides.length - 1, value + 1));
  }, [tabSlides.length]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-[1.5px] px-[3.5px] pb-[3.5px] pt-[3px]">
      {availableTabs.length > 1 ? (
        <div className="grid shrink-0 grid-cols-3 gap-[1.5px]">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const active = resolvedActiveTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={[
                  "flex items-center justify-center gap-[1.5px] rounded-[2px] border py-[1.5px] text-[2.5px] font-black uppercase tracking-[0.12em] transition-all",
                  active
                    ? "border-accent/30 bg-accent text-white shadow-[0_4px_12px_rgba(153,51,49,0.20)]"
                    : "border-border-subtle/70 bg-surface-primary/60 text-content-muted hover:border-accent/20 hover:text-content-secondary dark:bg-surface-secondary/50",
                ].join(" ")}
              >
                <Icon size={3} />
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="kanji-detail-scroll flex-1 min-h-0 overflow-y-auto">
        {!current ? (
          <div className="rounded-[2px] border border-dashed border-border-subtle/60 p-[2px] text-center text-[3px] text-content-secondary">
            Esta lección no trae contenido todavía.
          </div>
        ) : current.kind === "meaning" ? (
          <MeaningImageSlide step={current.step} index={current.index} total={current.total} />
        ) : current.kind === "meaningTable" ? (
          <MeaningTableSlide table={current.table} rowIndex={current.rowIndex} total={current.total} />
        ) : current.kind === "howToUse" ? (
          <HowToUseSlide table={current.table} />
        ) : (
          <ExampleSlide step={current.step} index={current.index} total={current.total} />
        )}
      </div>

      <div className="shrink-0 space-y-[2px]">
        {tabSlides.length > 1 ? (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={resolvedSlideIndex === 0}
              className="flex items-center gap-1 rounded-[2px] border border-accent/20 bg-accent/[0.06] px-[2px] py-[1.5px] text-[2.5px] font-black uppercase tracking-[0.1em] text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={3} />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {tabSlides.map((_, index) => {
                const active = index === resolvedSlideIndex;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSlideIndex(index)}
                    className={active ? "h-[1px] w-[3px] rounded-full bg-accent" : "h-[1px] w-[1px] rounded-full bg-border-subtle/80 hover:bg-accent/40"}
                    aria-label={`Ir al paso ${index + 1}`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={resolvedSlideIndex === tabSlides.length - 1}
              className="flex items-center gap-1 rounded-[2px] border border-accent/20 bg-accent/[0.06] px-[2px] py-[1.5px] text-[2.5px] font-black uppercase tracking-[0.1em] text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Siguiente
              <ChevronRight size={3} />
            </button>
          </div>
        ) : null}

        {onStartExam ? (
          <button
            type="button"
            onClick={onStartExam}
            className="flex w-full items-center justify-center gap-[2px] rounded-[2px] bg-gradient-to-r from-red-700 via-accent to-accent-hover py-[2px] text-[2.5px] font-black uppercase tracking-[0.14em] text-white shadow-[0_6px_18px_rgba(153,51,49,0.22)] transition hover:opacity-95 active:scale-[0.98]"
          >
            <FlaskConical size={3} />
            Iniciar examen
          </button>
        ) : null}
      </div>
    </div>
  );
}