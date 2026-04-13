"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import GrammarExam from "./GrammarExam";
import { useGrammarLesson } from "../../../hooks/useGrammarLesson";

// ── Pink accent vars (same as GrammarLessonModal) ─────────
const GRAMMAR_ACCENT_VARS: CSSProperties = {
  "--accent":               "#c0395a",
  "--accent-hover":         "#e06578",
  "--accent-subtle":        "rgba(192,57,90,0.10)",
  "--accent-muted":         "rgba(192,57,90,0.06)",
  "--scrollbar-thumb":      "rgba(192,57,90,0.35)",
  "--scrollbar-thumb-hover":"rgba(224,101,120,0.55)",
} as CSSProperties;

// ── Overlay / panel variants (same as KanjiQuizModal) ─────
const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.14 } },
};

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.94, y: 18 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring" as const, stiffness: 340, damping: 30, mass: 0.85 } },
  exit:    { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as [number, number, number, number] } },
};

// ─────────────────────────────────────────────────────────
interface Props {
  lessonId: string;
  onClose: () => void;
  onComplete?: (score: number) => void;
}

export default function GrammarExamModal({ lessonId, onClose, onComplete }: Props) {
  const { lesson, status } = useGrammarLesson(lessonId);
  const [retryKey, setRetryKey] = useState(0);
  const [examProgress, setExamProgress] = useState({ current: 0, total: 0, finished: false });

  const exam = useMemo(() => lesson?.content?.exam ?? [], [lesson]);

  const handleFinish = useCallback((score: number) => {
    setExamProgress((prev) => ({ ...prev, finished: true }));
    onComplete?.(score);
  }, [onComplete]);

  const handleRetry = useCallback(() => {
    setExamProgress({ current: 0, total: 0, finished: false });
    setRetryKey((k) => k + 1);
  }, []);

  const handleProgress = useCallback((current: number, total: number) => {
    setExamProgress((prev) => ({ ...prev, current, total }));
  }, []);

  return (
    <AnimatePresence>
      {/* ── Backdrop ─────────────────────────────────── */}
      <motion.div
        key="grammar-exam-backdrop"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* ── Panel ──────────────────────────────────── */}
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "relative flex w-full flex-col overflow-hidden",
            "rounded-3xl bg-surface-primary shadow-2xl ring-1 ring-border-subtle",
            "max-w-xl h-[min(70dvh,660px)]",
            "max-sm:max-w-none max-sm:w-[calc(100vw-2rem)] max-sm:h-[min(80dvh,660px)] max-sm:rounded-3xl",
          ].join(" ")}
          style={GRAMMAR_ACCENT_VARS}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────── */}
          <div className="shrink-0 overflow-hidden rounded-t-3xl">
            <div className="bg-gradient-to-r from-accent to-accent-hover px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner backdrop-blur-sm">
                  <span className="select-none text-xs font-black leading-none text-white">文法</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">
                    Examen de gramática
                  </h2>
                  <p className="text-xs text-white/70 font-medium">
                    {status === "success" ? (lesson?.title ?? "Lección") : "Cargando…"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Cerrar examen"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {/* ── Progress bar (like KanaQuizModal) ────────── */}
          {examProgress.total > 0 && !examProgress.finished && (
            <div className="bg-surface-primary border-b border-border-subtle px-5 py-2.5">
              <div className="w-full space-y-1.5">
                <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${examProgress.total > 0 ? (examProgress.current / examProgress.total) * 100 : 0}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-content-muted font-medium text-center">
                  Pregunta{" "}
                  <span className="font-bold" style={{ color: "var(--accent)" }}>
                    {Math.min(examProgress.current + 1, examProgress.total)}
                  </span>{" "}
                  de {examProgress.total}
                </p>
              </div>
            </div>
          )}
          {/* ── Body ───────────────────────────────── */}
          <div className="flex-1 min-h-0 overflow-hidden p-5 sm:p-6">
            {status === "loading" && (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-16 animate-pulse">
                <div className="h-14 w-14 rounded-full bg-surface-tertiary" />
                <div className="h-3 w-40 rounded-full bg-surface-tertiary" />
                <div className="h-3 w-28 rounded-full bg-surface-tertiary" />
              </div>
            )}

            {status === "error" && (
              <div className="flex h-full items-center justify-center py-16">
                <p className="text-sm text-content-secondary">
                  No se pudo cargar el examen.
                </p>
              </div>
            )}

            {status === "success" && exam.length === 0 && (
              <div className="flex h-full items-center justify-center py-16">
                <p className="text-sm text-content-secondary">
                  Esta lección no tiene examen todavía.
                </p>
              </div>
            )}

            {status === "success" && exam.length > 0 && (
              <GrammarExam
                key={retryKey}
                grammarId={lessonId}
                exam={exam}
                onFinish={handleFinish}
                onClose={onClose}
                onRetry={handleRetry}
                onProgress={handleProgress}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
