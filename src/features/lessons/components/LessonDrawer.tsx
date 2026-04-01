"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LessonMode, LessonResolved } from "../types";
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
  entityKind?: "kanji" | "subtheme" | "grammar" | null;
  kanjiCtaDisabled?: boolean;
  kanjiCtaDisabledReason?: string;
};

export default function LessonDrawer({
  open,
  onClose,
  nodeId,
  mode,
  userId,
  entityId = null,
  entityKind = null,
  kanjiCtaDisabled = false,
  kanjiCtaDisabledReason,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<LessonResolved[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const active = useMemo(
    () => lessons[activeIndex] ?? null,
    [lessons, activeIndex],
  );
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 640px)").matches;

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
        subtitle: `${k.symbol} • ${k.symbol ? "Kanji" : ""}`,
        pill: "Kanji",
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.button
            aria-label="Cerrar"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Drawer: desktop floating right | mobile bottom sheet */}
          <motion.aside
            className={[
              "fixed z-50 bg-surface-primary shadow-2xl flex flex-col border border-border-default/60",

              // Desktop (panel flotante a la derecha)
              "right-3 top-3 bottom-3 w-[440px] max-w-[90vw] rounded-3xl",

              // Mobile (sheet centrado con margen y FULL rounded)
              "max-sm:left-6 max-sm:right-4 max-sm:bottom-4 max-sm:top-auto",
              "max-sm:h-[85dvh] max-sm:w-auto max-sm:rounded-3xl",
            ].join(" ")}
            initial={isMobile ? { y: 40, opacity: 0 } : { x: 60, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: 40, opacity: 0 } : { x: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-surface-primary/90 backdrop-blur-md border-b border-border-subtle rounded-t-3xl">
              <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold tracking-wide text-content-tertiary">
                    Lección
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-xl font-extrabold text-content-primary truncate">
                      {header.title}
                    </div>

                    {header.pill ? (
                      <span className="shrink-0 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                        {header.pill}
                      </span>
                    ) : null}
                  </div>

                  {header.subtitle ? (
                    <div className="mt-1 text-sm text-content-secondary">
                      {header.subtitle}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-content-secondary">
                      {modeTitle[mode]}
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-content-secondary hover:bg-surface-tertiary"
                >
                  Cerrar
                </button>
              </div>

              {/* Tabs mini si hay varias lecciones */}
              {lessons.length > 1 && (
                <div className="px-6 pb-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {lessons.map((l, idx) => (
                      <button
                        key={l.lesson.id}
                        onClick={() => setActiveIndex(idx)}
                        className={[
                          "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border",
                          idx === activeIndex
                            ? "bg-gradient-to-r from-accent to-accent-hover text-content-inverted border-accent shadow-sm"
                            : "bg-surface-primary text-content-secondary border-border-default hover:bg-surface-secondary",
                        ].join(" ")}
                      >
                        {l.kind.toUpperCase()} {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 px-6 pb-6 pt-5 overflow-y-auto">
              {loading && <SkeletonDrawerContent />}

              {!loading && !active && (
                <div className="rounded-3xl border border-border-subtle p-5 text-content-secondary">
                  No hay lecciones para este nodo todavía.
                </div>
              )}

              {!loading && active && (
                <div className="pb-2">
                  <LessonShell
                    lesson={active}
                    mode={mode}
                    kanjiCtaDisabled={kanjiCtaDisabled}
                    kanjiCtaDisabledReason={kanjiCtaDisabledReason}
                  />
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
