"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LessonMode, LessonResolved } from "../types";
import type { Kanji } from "@/features/kanji/types";
import { getLessonsForNode } from "../lib/lessonService";
import LessonShell from "./LessonShell";
import { SkeletonDrawerContent } from "@/shared/ui/Skeleton";

const modeTitle: Record<LessonMode, string> = {
  writing: "Escritura",
  listening: "Audio",
  reading: "Lectura",
  speaking: "Hablar",
};

type Props = {
  open: boolean;
  onClose: () => void;
  nodeId: string | null;
  mode: LessonMode;
  userId: string;
  entityId?: string | null;
  entityKind?: "kanji" | "kana" | "subtheme" | "grammar" | null;
  /** Pre-known kana type — used to apply accent colors before lesson data loads */
  kanaType?: "hiragana" | "katakana";
  kanjiCtaDisabled?: boolean;
  kanjiCtaDisabledReason?: string;
  writingActive?: boolean;
  onWritingStart?: (kanji: Kanji) => void;
  onQuizStart?: (entity: { id: string; symbol: string }) => void;
};

export default function LessonDrawer({
  open,
  onClose,
  nodeId,
  mode,
  userId,
  entityId = null,
  entityKind = null,
  kanaType,
  kanjiCtaDisabled = false,
  kanjiCtaDisabledReason,
  writingActive = false,
  onWritingStart,
  onQuizStart,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<LessonResolved[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">("desktop");

  const active = useMemo(() => lessons[activeIndex] ?? null, [lessons, activeIndex]);

  useEffect(() => {
    const updateScreen = () => {
      if (window.innerWidth < 640) {
        setScreen("mobile");
      } else if (window.innerWidth < 1024) {
        setScreen("tablet");
      } else {
        setScreen("desktop");
      }
    };

    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  const kanaAccentVars: React.CSSProperties = useMemo(() => {
    // Use loaded lesson data when available; fall back to the pre-known kanaType prop
    // so the correct accent is applied immediately during the loading phase.
    const kt = active?.kind === "kana" ? active.kana.kanaType : kanaType;
    if (!kt) return {};

    return kt === "katakana"
      ? ({
          "--accent": "#1B5078",
          "--accent-hover": "#2E82B5",
          "--accent-subtle": "rgba(27,80,120,0.1)",
          "--accent-muted": "rgba(27,80,120,0.06)",
          "--scrollbar-thumb": "rgba(27,80,120,0.4)",
          "--scrollbar-thumb-hover": "rgba(46,130,181,0.65)",
        } as React.CSSProperties)
      : ({
          "--accent": "#7B3F8A",
          "--accent-hover": "#A866B5",
          "--accent-subtle": "rgba(123,63,138,0.1)",
          "--accent-muted": "rgba(123,63,138,0.06)",
          "--scrollbar-thumb": "rgba(123,63,138,0.4)",
          "--scrollbar-thumb-hover": "rgba(168,102,181,0.65)",
        } as React.CSSProperties);
  }, [active, kanaType]);

  useEffect(() => {
    if (!open || !nodeId) return;

    let alive = true;

    queueMicrotask(() => {
      if (!alive) return;
      setLoading(true);
      setActiveIndex(0);
    });

    getLessonsForNode({ nodeId, mode, userId, entityId, entityKind })
      .then((data) => {
        if (!alive) return;
        setLessons(data);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open, nodeId, mode, userId, entityId, entityKind]);

  const header = useMemo(() => {
    if (active?.kind === "kanji") {
      const k = active.kanji;
      return {
        title: `${modeTitle[mode]} de Kanji`,
        subtitle: `${k.symbol} • Kanji`,
        pill: "Kanji",
      };
    }

    if (active?.kind === "kana") {
      const k = active.kana;
      const typeLabel = k.kanaType === "hiragana" ? "Hiragana" : "Katakana";
      return {
        title: `${modeTitle[mode]} de ${typeLabel}`,
        subtitle: `${k.symbol} • ${k.romaji ?? ""}`,
        pill: typeLabel,
      };
    }

    if (active?.kind === "grammar") {
      return {
        title: "Gramática",
        subtitle: "Mejora tu japonés paso a paso",
        pill: "Grammar",
      };
    }

    if (active?.kind === "subtheme") {
      return {
        title: "Vocabulario",
        subtitle: "Aprende palabras del subtema",
        pill: "Vocab",
      };
    }

    return { title: "Lección", subtitle: "", pill: "" };
  }, [active, mode]);

  const headerSymbol = useMemo(() => {
    if (active?.kind === "kanji") return active.kanji.symbol;
    if (active?.kind === "kana") return active.kana.symbol;
    return null;
  }, [active]);

  const headerPoints = useMemo(() => {
    if (active?.kind === "kanji") return active.kanji.pointsToUnlock ?? 0;
    if (active?.kind === "kana") return active.kana.pointsToUnlock ?? 0;
    return 0;
  }, [active]);

  const wrapperClasses =
    screen === "desktop"
      ? "fixed inset-0 z-50 flex items-stretch justify-end p-3 pointer-events-none"
      : "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none";

  const asideClasses =
    screen === "desktop"
      ? [
          "pointer-events-auto flex h-full w-[440px] max-w-[90vw] flex-col overflow-hidden rounded-3xl border border-border-default/60 bg-surface-primary shadow-2xl",
        ].join(" ")
      : screen === "tablet"
        ? [
            "pointer-events-auto flex w-[min(92vw,560px)]",
            "h-[min(82dvh,760px)]",
            "flex-col overflow-hidden rounded-3xl border border-border-default/60 bg-surface-primary shadow-2xl",
          ].join(" ")
        : [
            "pointer-events-auto flex w-[min(calc(100vw-16px),420px)]",
            "h-[min(78dvh,700px)]",
            "flex-col overflow-hidden rounded-[28px] border border-border-default/60 bg-surface-primary shadow-2xl",
          ].join(" ");

  const initialAnimation =
    screen === "desktop" ? { x: 60, opacity: 0 } : { scale: 0.96, opacity: 0 };

  const animateAnimation = writingActive
    ? screen === "desktop"
      ? { x: 60, opacity: 0 }
      : { scale: 0.96, opacity: 0 }
    : screen === "desktop"
      ? { x: 0, opacity: 1 }
      : { scale: 1, opacity: 1 };

  const exitAnimation =
    screen === "desktop" ? { x: 60, opacity: 0 } : { scale: 0.96, opacity: 0 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Cerrar"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: writingActive ? 0 : 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: writingActive ? "none" : "auto" }}
          />

          <div className={wrapperClasses}>
            <motion.aside
              className={asideClasses}
              initial={initialAnimation}
              animate={animateAnimation}
              exit={exitAnimation}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              style={{
                ...(writingActive ? { pointerEvents: "none" as const } : {}),
                ...kanaAccentVars,
              }}
            >
              <div className="shrink-0 overflow-hidden rounded-t-[28px] lg:rounded-t-3xl">
                <div className="bg-gradient-to-r from-accent to-accent-hover px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      {headerSymbol && (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner backdrop-blur-sm sm:h-14 sm:w-14 sm:rounded-2xl">
                          <span className="select-none text-[22px] font-black leading-none text-white sm:text-[28px]">
                            {headerSymbol}
                          </span>
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {header.pill && (
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                              {header.pill}
                            </span>
                          )}

                          {headerPoints > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white sm:text-[11px]">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              {headerPoints}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-0.5 truncate text-sm font-extrabold leading-tight text-white sm:text-base">
                          {header.title}
                        </h2>

                        {header.subtitle && (
                          <p className="mt-0.5 truncate text-[11px] font-medium text-white/70 sm:text-xs">
                            {header.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                      aria-label="Cerrar"
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
                  </div>
                </div>

                {lessons.length > 1 && (
                  <div className="border-b border-border-subtle bg-surface-primary px-3 py-2 sm:px-5 sm:py-2.5">
                    <div className="flex gap-2 overflow-x-auto">
                      {lessons.map((l, idx) => (
                        <button
                          key={l.lesson.id}
                          onClick={() => setActiveIndex(idx)}
                          className={[
                            "shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold sm:text-xs",
                            idx === activeIndex
                              ? "border-accent bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-sm"
                              : "border-border-default bg-surface-primary text-content-secondary hover:bg-surface-secondary",
                          ].join(" ")}
                        >
                          {l.kind.toUpperCase()} {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lesson-drawer-body flex-1 overflow-y-auto px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4 lg:px-6 lg:pb-6 lg:pt-5">
                {loading && <SkeletonDrawerContent />}

                {!loading && !active && (
                  <div className="rounded-2xl border border-border-subtle p-4 text-sm text-content-secondary sm:rounded-3xl sm:p-5">
                    No hay lecciones para este nodo todavía.
                  </div>
                )}

                {!loading && active && (
                  <div className="pb-1 sm:pb-2">
                    <LessonShell
                      lesson={active}
                      mode={mode}
                      kanjiCtaDisabled={kanjiCtaDisabled}
                      kanjiCtaDisabledReason={kanjiCtaDisabledReason}
                      onWritingStart={onWritingStart}
                      onQuizStart={onQuizStart}
                    />
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}