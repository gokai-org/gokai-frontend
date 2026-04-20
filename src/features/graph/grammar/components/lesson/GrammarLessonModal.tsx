"use client";

import { motion } from "framer-motion";
import { BookText, RefreshCw } from "lucide-react";
import type { GrammarLesson } from "../../types";
import GrammarLessonContent from "./GrammarLessonContent";

type GrammarLessonStatus = "idle" | "loading" | "error" | "success";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18 },
  },
  closing: {
    opacity: 0,
    transition: { duration: 0.18 },
  },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.985, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  closing: {
    opacity: 0,
    scale: 0.985,
    y: 12,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

export interface GrammarLessonModalProps {
  lesson: GrammarLesson | null;
  status: GrammarLessonStatus;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
  onStartExam: () => void;
  isClosing?: boolean;
}

export default function GrammarLessonModal({
  lesson,
  status,
  error,
  onClose,
  onRetry,
  onStartExam,
  isClosing = false,
}: GrammarLessonModalProps) {

  return (
    <motion.div
      key="grammar-lesson-overlay"
      variants={overlayVariants}
      initial="hidden"
      animate={isClosing ? "closing" : "visible"}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate={isClosing ? "closing" : "visible"}
        data-help-target="grammar-lesson-modal"
        className="relative flex h-[92dvh] w-[calc(100vw-2rem)] max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl sm:h-[90dvh] sm:max-w-4xl lg:h-[calc(100dvh-2rem)] lg:w-[calc(100vw-2rem)] lg:max-w-[1680px] lg:rounded-none lg:shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative z-10 flex-1 min-h-0 overflow-hidden lg:p-5">
          {status === "loading" || status === "idle" ? (
            <div
              data-help-loading="true"
              className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-[34px] border border-black/[0.05] bg-surface-primary shadow-2xl dark:border-white/[0.08]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-[28px] border border-black/[0.05] bg-surface-secondary/45 shadow-[0_16px_34px_rgba(0,0,0,0.12)] dark:border-white/[0.08]">
                <BookText className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm font-medium text-content-muted">
                Cargando la lección seleccionada...
              </p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-5 rounded-[34px] border border-black/[0.05] bg-surface-primary text-center shadow-2xl dark:border-white/[0.08]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/12 text-red-400 ring-1 ring-red-500/20">
                <RefreshCw className="h-6 w-6" />
              </div>

              <div className="max-w-md space-y-2">
                <p className="text-base font-semibold text-content-primary">
                  No se pudo abrir la lección
                </p>
                <p className="text-sm leading-6 text-content-secondary">
                  {error || "Ocurrió un error al cargar el contenido de grammar."}
                </p>
              </div>

              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
            </div>
          ) : null}

          {status === "success" && lesson ? <GrammarLessonContent lesson={lesson} onClose={onClose} onStartExam={onStartExam} /> : null}
        </div>
      </motion.div>
    </motion.div>
  );
}