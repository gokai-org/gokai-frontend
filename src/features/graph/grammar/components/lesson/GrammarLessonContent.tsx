"use client";

import {
  BookOpen,
  FileText,
  FlaskConical,
  Lightbulb,
  LayoutPanelLeft,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import GrammarExamplesSection from "./sections/GrammarExamplesSection";
import GrammarMeaningSection from "./sections/GrammarMeaningSection";
import GrammarLessonTable from "./GrammarLessonTable";
import type { GrammarLesson } from "../../types";

type LessonPaneId = "conceptos" | "estructura" | "ejemplos";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-ES").format(value);
}

function LessonTabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof BookOpen;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition max-lg:hidden",
        active
          ? "border-accent bg-accent text-white shadow-[0_7px_16px_rgba(194,78,69,0.14)]"
          : "border-border-subtle bg-surface-primary/75 text-content-secondary hover:border-accent/25 hover:text-content-primary",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function MobilePaneButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof BookOpen;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-[4.2rem] w-full flex-col items-center justify-center gap-1 rounded-[18px] px-1.5 py-2 text-center text-[10px] font-bold transition focus:outline-none focus:ring-4 focus:ring-accent/20 lg:hidden",
        active
          ? "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30"
          : "bg-surface-tertiary text-content-primary ring-1 ring-border-subtle hover:bg-surface-secondary hover:ring-accent/40",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      <span className="leading-[1.08]">{label}</span>
    </button>
  );
}

function CloseLessonButton({
  onClick,
  variant = "panel",
}: {
  onClick: () => void;
  variant?: "panel" | "hero";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex shrink-0 items-center justify-center transition",
        variant === "hero"
          ? "h-8 w-8 rounded-xl bg-surface-primary/15 text-content-inverted hover:bg-surface-primary/25"
          : "h-10 w-10 rounded-2xl border border-border-subtle bg-surface-primary/88 text-content-primary shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur-md hover:border-accent/30 hover:text-accent",
      ].join(" ")}
      aria-label="Cerrar lección"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

function MobileLessonHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="shrink-0 overflow-hidden rounded-t-[34px] lg:hidden">
      <div className="bg-gradient-to-r from-accent to-accent-hover px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-surface-primary/20 text-content-inverted shadow-inner backdrop-blur-sm">
              <BookOpen className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/72">
                Gramática
              </p>
              <h1 className="mt-1 overflow-hidden pr-2 text-[clamp(0.88rem,3.4vw,1.04rem)] font-bold leading-[1.08] tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {title}
              </h1>
            </div>
          </div>

            <div className="flex shrink-0 items-center pt-0.5">
            <CloseLessonButton onClick={onClose} variant="hero" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamCallToAction({
  onClick,
  centered = false,
  compact = false,
}: {
  onClick: () => void;
  centered?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={centered ? "flex justify-center" : "flex justify-start lg:ml-8"}>
      <button
        type="button"
        onClick={onClick}
        className={[
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#8e342f_0%,#b3473f_52%,#d7685b_100%)] text-sm font-semibold text-white shadow-[0_10px_20px_rgba(179,71,63,0.20)] ring-1 ring-white/20 dark:ring-white/10 transition hover:brightness-[1.03]",
          compact ? "w-full px-4 py-3" : "px-5 py-3",
        ].join(" ")}
      >
        Completar examen
      </button>
    </div>
  );
}

function SidebarMetric({
  icon: Icon,
  value,
  title,
}: {
  icon: typeof BookOpen;
  value: string;
  title: string;
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col rounded-[18px] border border-white/12 bg-white/[0.08] px-[clamp(0.72rem,0.8vw,1rem)] py-[clamp(0.72rem,0.8vw,1rem)] shadow-[0_10px_22px_rgba(0,0,0,0.12)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-[clamp(1.8rem,1.7vw+0.35rem,2.45rem)] w-[clamp(1.8rem,1.7vw+0.35rem,2.45rem)] shrink-0 items-center justify-center rounded-[15px] bg-white/[0.12] text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)] dark:bg-white/[0.08]">
          <Icon className="h-[clamp(0.76rem,0.72vw+0.18rem,1.02rem)] w-[clamp(0.76rem,0.72vw+0.18rem,1.02rem)]" />
        </div>
      </div>
      <div className="mt-[clamp(0.55rem,0.62vw,0.78rem)] flex flex-1 flex-col justify-end">
        <p className="text-[clamp(0.62rem,0.52vw+0.18rem,0.82rem)] font-black uppercase tracking-[0.14em] text-white/55">
          {title}
        </p>
        <p className="mt-1.5 text-[clamp(1.35rem,1.5vw+0.55rem,2rem)] font-bold tracking-tight text-white">{value}</p>
      </div>
    </div>
  );
}

function ContentFrame({
  eyebrow,
  title,
  children,
  stretch = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  stretch?: boolean;
}) {
  return (
    <section className={[
      "min-w-0 overflow-hidden rounded-[20px] bg-surface-tertiary shadow-[0_8px_24px_rgba(0,0,0,0.05)] xl:rounded-[30px] xl:bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.64))] xl:shadow-[0_22px_50px_rgba(0,0,0,0.08)] dark:xl:bg-[linear-gradient(180deg,rgba(20,20,20,0.92),rgba(16,16,16,0.9))]",
      stretch ? "flex min-h-full flex-col" : "",
    ].join(" ")}>
      <div className="border-b border-border-subtle px-3.5 py-3.5 lg:px-4 lg:py-4 xl:bg-[radial-gradient(circle_at_top_left,rgba(194,78,69,0.14),transparent_42%),linear-gradient(90deg,rgba(194,78,69,0.08),transparent)] xl:px-[clamp(1.1rem,1.8vw,1.5rem)] xl:py-[clamp(0.95rem,1.7vw,1.25rem)]">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent/80 lg:text-[11px] lg:tracking-[0.2em]">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-[1rem] font-bold tracking-tight text-content-primary sm:text-[1.08rem] lg:text-[1.18rem] xl:text-xl 2xl:text-2xl">
          {title}
        </h3>
      </div>

      <div className={[
        "min-w-0 px-3.5 py-3.5 lg:px-4 lg:py-4 xl:px-[clamp(1.1rem,1.8vw,1.5rem)] xl:py-[clamp(1.1rem,1.9vw,1.5rem)]",
        stretch ? "flex flex-1 flex-col" : "",
      ].join(" ")}>{children}</div>
    </section>
  );
}

export interface GrammarLessonContentProps {
  lesson: GrammarLesson;
  onClose: () => void;
  onStartExam: () => void;
}

export default function GrammarLessonContent({ lesson, onClose, onStartExam }: GrammarLessonContentProps) {
  const [activePane, setActivePane] = useState<LessonPaneId>("conceptos");
  const meaning = lesson.content?.meaning ?? null;
  const howToUse = lesson.content?.howToUse ?? null;
  const examples = lesson.content?.examples ?? null;
  const exam = lesson.content?.exam ?? [];
  const contentBlockCount = [meaning, howToUse, examples].filter(Boolean).length;
  const availablePanes = useMemo(
    () => [
      meaning ? { id: "conceptos", label: "Conceptos", icon: Sparkles } : null,
      howToUse ? { id: "estructura", label: "Estructura", icon: LayoutPanelLeft } : null,
      examples ? { id: "ejemplos", label: "Ejemplos", icon: FileText } : null,
    ].filter(Boolean) as Array<{ id: LessonPaneId; label: string; icon: typeof BookOpen }>,
    [examples, howToUse, meaning],
  );
  const defaultPane = availablePanes[0]?.id ?? "conceptos";
  const resolvedPane = availablePanes.some((pane) => pane.id === activePane)
    ? activePane
    : defaultPane;

  const detailMetrics = [
    {
      icon: Sparkles,
      title: "Puntos",
      value: formatCompactNumber(lesson.pointsToUnlock ?? 0),
    },
    {
      icon: LayoutPanelLeft,
      title: "Bloques",
      value: formatCompactNumber(contentBlockCount),
    },
    {
      icon: Lightbulb,
      title: "Ejemplos",
      value: formatCompactNumber(examples?.content.length ?? 0),
    },
    {
      icon: FlaskConical,
      title: "Examen",
      value: formatCompactNumber(exam.length),
    },
  ];
  return (
    <div className="grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[34px] border border-black/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.78))] shadow-[0_28px_60px_rgba(0,0,0,0.12)] dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(14,14,14,0.96))] lg:grid-cols-[minmax(20rem,25vw)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[minmax(21.5rem,26vw)_minmax(0,1fr)] 2xl:grid-cols-[minmax(23rem,27vw)_minmax(0,1fr)]">
      <MobileLessonHeader
        title={lesson.title}
        onClose={onClose}
      />

      <aside className="relative hidden min-h-0 min-w-0 overflow-hidden border-r border-r-black/8 bg-[linear-gradient(180deg,#b74742_0%,#95342f_40%,#6f2223_100%)] px-[clamp(1rem,1.25vw,1.25rem)] py-[clamp(1rem,1.25vw,1.25rem)] dark:border-r-white/10 dark:bg-[linear-gradient(180deg,#a63d38_0%,#822926_42%,#5f1c1d_100%)] lg:block">
        <div className="relative flex h-full min-h-0 flex-col gap-[clamp(0.5rem,0.65vw,0.85rem)]">
          <div className="shrink-0 space-y-[clamp(0.7rem,0.9vw,1rem)]">
            <div className="space-y-[clamp(0.7rem,0.9vw,1rem)]">
              <h1 className="max-w-[18ch] text-[clamp(1.95rem,2.8vw,3rem)] font-bold leading-[1.01] tracking-tight text-white">
                {lesson.title}
              </h1>
              <p className="max-w-[34ch] text-[clamp(0.76rem,0.7vw+0.16rem,0.98rem)] leading-[1.46] text-white/76">
                {lesson.description?.trim() || "Esta lección ya está disponible, pero todavía no trae una descripción adicional desde la API."}
              </p>
            </div>
          </div>

          <div className="shrink-0 pt-[clamp(0.1rem,0.2vw,0.2rem)]">
            <div className="grid h-[clamp(16rem,33vh,21.5rem)] max-h-[clamp(16rem,33vh,21.5rem)] min-h-[15rem] grid-cols-2 grid-rows-2 gap-[clamp(0.55rem,0.7vw,0.9rem)]">
              {detailMetrics.map((metric) => (
                <SidebarMetric
                  key={`${metric.value}-${metric.icon.displayName ?? metric.icon.name ?? "metric"}`}
                  icon={metric.icon}
                  value={metric.value}
                  title={metric.title}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-transparent">
        <div className="hidden shrink-0 border-b border-border-subtle px-[clamp(1rem,1.8vw,1.5rem)] py-[clamp(1rem,1.8vw,1.25rem)] lg:block">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3 pr-4">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-content-primary">
                Contenido de la lección
              </p>

              <div className="flex flex-wrap items-center gap-y-3 pt-3 lg:flex-nowrap lg:gap-8">
                <div className="flex min-w-0 flex-wrap items-center gap-2 lg:gap-3">
                {availablePanes.map((pane) => (
                  <LessonTabButton
                    key={pane.id}
                    active={resolvedPane === pane.id}
                    icon={pane.icon}
                    label={pane.label}
                    onClick={() => setActivePane(pane.id)}
                  />
                ))}
                </div>

                {exam.length > 0 ? (
                  <ExamCallToAction onClick={onStartExam} />
                ) : null}
              </div>
            </div>

            <CloseLessonButton onClick={onClose} />
          </div>
        </div>

        <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
          <div className="kanji-detail-scroll h-full min-h-0 overflow-x-hidden overflow-y-auto px-4 py-4 [scrollbar-gutter:stable] [overscroll-behavior:contain] lg:px-[clamp(1rem,1.8vw,1.5rem)] lg:py-[clamp(1rem,1.8vw,1.5rem)] lg:pb-[clamp(1rem,1.8vw,1.5rem)]">
            <div className="mb-3 lg:hidden">
              <div className="grid grid-cols-3 gap-2">
                {availablePanes.map((pane) => (
                  <MobilePaneButton
                    key={pane.id}
                    active={resolvedPane === pane.id}
                    icon={pane.icon}
                    label={pane.label}
                    onClick={() => setActivePane(pane.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-h-full flex-col">
              {resolvedPane === "conceptos" && meaning ? (
                <ContentFrame stretch eyebrow="Conceptos" title="Idea central y significado">
                  {meaning.type === "image_stepper" ? (
                    <GrammarMeaningSection meaning={meaning} />
                  ) : (
                    <GrammarLessonTable table={meaning} />
                  )}
                </ContentFrame>
              ) : null}

              {resolvedPane === "estructura" && howToUse ? (
                <ContentFrame stretch eyebrow="Estructura" title="Cómo se construye y se usa">
                  <GrammarLessonTable table={howToUse} />
                </ContentFrame>
              ) : null}

              {resolvedPane === "ejemplos" && examples ? (
                <ContentFrame stretch eyebrow="Ejemplos" title="Frases y uso en contexto">
                  <GrammarExamplesSection examples={examples} />
                </ContentFrame>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {exam.length > 0 ? (
        <div className="shrink-0 rounded-b-[34px] border-t border-black/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.9))] px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(18,18,18,0.94),rgba(14,14,14,0.92))] lg:hidden">
          <div className="mx-auto w-full max-w-[16rem]">
            <ExamCallToAction centered compact onClick={onStartExam} />
          </div>
        </div>
      ) : null}
    </div>
  );
}