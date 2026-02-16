"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LessonMode, LessonResolved } from "../types";
import { getLessonsForNode } from "../lib/lessonService";
import LessonShell from "./LessonShell";

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
};

export default function LessonDrawer({
  open,
  onClose,
  nodeId,
  mode,
  userId,
  entityId = null,
  entityKind = null,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<LessonResolved[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const active = useMemo(() => lessons[activeIndex] ?? null, [lessons, activeIndex]);

  useEffect(() => {
    if (!open || !nodeId) return;

    let alive = true;
    setLoading(true);
    setActiveIndex(0);

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
      return { title: "Gramática", subtitle: "Mejora tu japonés paso a paso", pill: "Grammar" };
    }
    if (active?.kind === "subtheme") {
      return { title: "Vocabulario", subtitle: "Aprende palabras del subtema", pill: "Vocab" };
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

          {/* Drawer: desktop right | mobile bottom sheet */}
          <motion.aside
            className={[
              "fixed z-50 bg-white shadow-2xl border-gray-100 flex flex-col",
              "right-0 top-0 h-screen w-[460px] max-w-[92vw] border-l",
              "max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:bottom-0 max-sm:h-[85vh] max-sm:w-full max-sm:rounded-t-[28px] max-sm:border-l-0 max-sm:border-t",
            ].join(" ")}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
              <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold tracking-wide text-gray-500">
                    Lección
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <div className="text-xl font-extrabold text-gray-900 truncate">
                      {header.title}
                    </div>

                    {header.pill ? (
                      <span className="shrink-0 rounded-full bg-[#993331]/10 px-3 py-1 text-xs font-bold text-[#993331]">
                        {header.pill}
                      </span>
                    ) : null}
                  </div>

                  {header.subtitle ? (
                    <div className="mt-1 text-sm text-gray-600">{header.subtitle}</div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-600">
                      {modeTitle[mode]}
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
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
                            ? "bg-[#993331] text-white border-[#993331]"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
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
              {loading && (
                <div className="rounded-3xl border border-gray-100 p-5 text-gray-600">
                  Cargando lección…
                </div>
              )}

              {!loading && !active && (
                <div className="rounded-3xl border border-gray-100 p-5 text-gray-600">
                  No hay lecciones para este nodo todavía.
                </div>
              )}

              {!loading && active && (
                <div className="pb-2">
                  <LessonShell lesson={active} mode={mode} />
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
