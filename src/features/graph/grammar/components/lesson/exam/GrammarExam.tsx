"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExamItem } from "../../../types";
import { submitGrammarQuiz } from "../../../api/grammarApi";
import GrammarQuestionExercise from "./GrammarQuestionExercise";
import GrammarCompleteExercise from "./GrammarCompleteExercise";
import GrammarOrderExercise from "./GrammarOrderExercise";
import { CheckCircle2 } from "lucide-react";

function getExerciseMeta(item: ExamItem, answered: boolean) {
  if (item.type === "question") {
    return {
      label: "Seleccion multiple",
      hint: answered
        ? "Revisa la opcion correcta y avanza cuando quieras."
        : "Puedes elegir con click, con las teclas 1-4 o con flechas y Enter.",
    };
  }

  if (item.type === "complete") {
    return {
      label: "Completar huecos",
      hint: answered
        ? "Comprueba cada hueco antes de pasar a la siguiente pregunta."
        : "Toca una ficha o arrastrala hasta el hueco que quieras completar.",
    };
  }

  return {
    label: "Ordenar frase",
    hint: answered
      ? "Si el orden ya esta revisado, continua con la siguiente pregunta."
      : "Toca las palabras para construir la frase y arrastra las fichas para reordenarlas.",
  };
}

interface Props {
  grammarId: string;
  exam: ExamItem[];
  onFinish: (score: number) => void;
  onClose: () => void;
  onRetry: () => void;
  onProgress?: (current: number, total: number) => void;
}

export default function GrammarExam({ grammarId, exam, onFinish, onClose, onRetry, onProgress }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered,   setAnswered]   = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [results,    setResults]    = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [finished,   setFinished]   = useState(false);
  const startRef = useRef(Date.now());

  const total   = exam.length;
  const correctCount = results.filter(Boolean).length;

  useEffect(() => {
    onProgress?.(results.length, total);
  }, [results.length, total, onProgress]);
  const current = exam[currentIdx];
  const exerciseMeta = current ? getExerciseMeta(current, answered) : null;

  const handleQuestionSelect = (idx: number) => {
    if (answered) return;
    setSelectedIdx(idx);
  };

  const handleQuestionConfirm = useCallback(() => {
    if (answered || selectedIdx === null || current?.type !== "question") return;
    const isCorrect = current.options[selectedIdx]?.correct ?? false;
    setAnswered(true);
    setResults((r) => [...r, isCorrect]);
  }, [answered, selectedIdx, current]);

  const handleSubAnswer = useCallback((correct: boolean) => {
    setAnswered(true);
    setResults((r) => [...r, correct]);
  }, []);

  const proceed = useCallback(async () => {
    const nextIdx = currentIdx + 1;

    if (nextIdx >= total) {
      const allResults = results;
      const score      = Math.round((allResults.filter(Boolean).length / total) * 100);
      const duration   = (Date.now() - startRef.current) / 1000;

      setFinished(true);
      setSubmitting(true);
      try {
        await submitGrammarQuiz(grammarId, { score, duration });
      } catch {
        // silent fail
      } finally {
        setSubmitting(false);
      }
      onFinish(score);
      return;
    }

    setCurrentIdx(nextIdx);
    setAnswered(false);
    setSelectedIdx(null);
  }, [currentIdx, grammarId, onFinish, results, total]);

  useEffect(() => {
    if (!current || current.type !== "question") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && answered) {
        event.preventDefault();
        void proceed();
        return;
      }

      if (answered) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIdx((prev) => {
          if (prev === null) {
            return 0;
          }

          return (prev + 1) % current.options.length;
        });
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIdx((prev) => {
          if (prev === null) {
            return current.options.length - 1;
          }

          return (prev - 1 + current.options.length) % current.options.length;
        });
        return;
      }

      if (/^[1-9]$/.test(event.key)) {
        const optionIndex = Number(event.key) - 1;
        if (optionIndex < current.options.length) {
          event.preventDefault();
          setSelectedIdx(optionIndex);
        }
        return;
      }

      if (event.key === "Enter" && selectedIdx !== null) {
        event.preventDefault();
        handleQuestionConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [answered, current, handleQuestionConfirm, proceed, selectedIdx]);

  // ── Finished screen ─────────────────────────────────────
  if (finished) {
    const score      = Math.round((correctCount / total) * 100);
    const success    = score >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full flex-col items-center gap-5 py-4"
      >
        {/* Animated score circle */}
        <div className="relative">
          {success && (
            <div className="absolute inset-[-20px] rounded-full bg-gradient-to-br from-accent/20 to-accent-hover/10 blur-xl animate-pulse" />
          )}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-full ${
              success
                ? "bg-gradient-to-br from-accent to-accent-hover"
                : "bg-surface-tertiary"
            }`}
            style={success ? { boxShadow: "0 0 48px var(--accent-muted, rgba(192,57,90,0.35))" } : undefined}
          >
            <span className={`text-4xl font-black select-none ${success ? "text-white" : "text-content-primary"}`}>
              {score}%
            </span>
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.38 }}
          className="space-y-1.5 text-center"
        >
          <p className="text-2xl font-black text-content-primary">
            {success ? "\u00a1Examen aprobado!" : "Sigue practicando"}
          </p>
          <p className="text-sm text-content-secondary">
            {correctCount} de {total} respuestas correctas
          </p>
        </motion.div>

        {/* Per-question result chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {results.map((ok, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, type: "spring", stiffness: 300, damping: 18 }}
              className={`flex flex-col items-center gap-0.5 rounded-2xl border px-3 py-2.5 ${
                ok
                  ? "border-[var(--accent-muted)] bg-[var(--accent-subtle)]"
                  : "border-border-subtle bg-surface-secondary"
              }`}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={ok ? { color: "var(--accent)" } : undefined}
              >
                P{i + 1}
              </span>
              <span
                className="text-base font-extrabold"
                style={ok ? { color: "var(--accent)" } : undefined}
              >
                {ok ? "\u2713" : "\u2717"}
              </span>
              <span className="text-[10px] text-content-muted">
                {ok ? "Correcta" : "Fallida"}
              </span>
            </motion.div>
          ))}
        </div>

        {submitting && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-content-muted"
          >
            Guardando resultados...
          </motion.p>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex w-full flex-col gap-2.5 pt-1 sm:flex-row"
        >
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-3 text-sm font-black text-white shadow-lg shadow-accent/15 transition hover:shadow-xl hover:shadow-accent/20"
          >
            Repetir examen
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary sm:min-w-28"
          >
            Cerrar
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (!current) return null;

  const progress = (currentIdx / total) * 100;

  return (
    <div className="space-y-5">
      {/* ── Context card ─────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
            {exerciseMeta?.label}
          </span>
          <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] font-semibold text-content-secondary">
            {correctCount} correctas
          </span>
          <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] font-semibold text-content-muted">
            {answered ? "Respuesta revisada" : "Modo interactivo"}
          </span>
        </div>
        <p className="text-sm leading-6 text-content-secondary">
          {exerciseMeta?.hint}
        </p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-tertiary/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* ── Exercise ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`exercise-${currentIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {current.type === "question" && (
            <GrammarQuestionExercise
              question={current}
              answered={answered}
              selectedIndex={selectedIdx}
              onSelect={handleQuestionSelect}
            />
          )}

          {current.type === "complete" && (
            <GrammarCompleteExercise
              question={current}
              answered={answered}
              onAnswer={handleSubAnswer}
            />
          )}

          {current.type === "order" && (
            <GrammarOrderExercise
              question={current}
              answered={answered}
              onAnswer={handleSubAnswer}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Question controls ─────────────────────────────── */}
      {current.type === "question" && (
        <div className="pt-1">
          {!answered ? (
            <button
              type="button"
              disabled={selectedIdx === null}
              onClick={handleQuestionConfirm}
              className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          ) : (
            <button
              type="button"
              onClick={proceed}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            >
              <CheckCircle2 className="h-4 w-4" />
              {currentIdx + 1 >= total ? "Ver resultados" : "Siguiente"}
            </button>
          )}
        </div>
      )}

      {/* ── Complete / Order: next after answer ──────────── */}
      {(current.type === "complete" || current.type === "order") && answered && (
        <button
          type="button"
          onClick={proceed}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
        >
          <CheckCircle2 className="h-4 w-4" />
          {currentIdx + 1 >= total ? "Ver resultados" : "Siguiente"}
        </button>
      )}
    </div>
  );
}