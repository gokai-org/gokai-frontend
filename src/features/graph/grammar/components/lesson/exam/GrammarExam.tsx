"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

function shouldHideSubmitError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedMessage = error.message.toLowerCase();

  return (
    normalizedMessage.includes("http 403") &&
    normalizedMessage.includes("no se tienen los puntos necesarios")
  );
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [finished,   setFinished]   = useState(false);
  const startRef = useRef(Date.now());

  const total   = exam.length;
  const correctCount = results.filter(Boolean).length;

  useEffect(() => {
    onProgress?.(currentIdx, total);
  }, [currentIdx, total, onProgress]);
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
      setSubmitError(null);
      try {
        await submitGrammarQuiz(grammarId, { score, duration });
      } catch (error) {
        if (!shouldHideSubmitError(error)) {
          setSubmitError(error instanceof Error ? error.message : "No se pudo guardar el resultado");
        }
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
    const scoreStyle = success ? { color: "var(--accent)" } : undefined;
    const statusLabel = success ? "Buen intento" : "Intentalo de nuevo";
    const subtitle = success
      ? "Terminaste el examen completo. Revisa tus aciertos y consolida los puntos que ya dominaste."
      : "Terminaste el examen, pero todavia hay estructuras que conviene repasar antes del siguiente intento.";

    return (
      <div className="flex h-full min-h-0 flex-col">
          <div className="kanji-detail-scroll flex-1 min-h-0 overflow-y-auto pr-[0.5px]">
          <div className="mx-auto flex w-full flex-col gap-[3.5px] py-[0.5px]">
            <div className="space-y-[3.5px]">
              <div className="space-y-[1px]">
                <p className="text-[6.5px] font-black text-content-primary">
                  Resumen del intento
                </p>
                <p className="text-[3px] leading-[1.5] text-content-secondary">
                  {subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-[3.5px] border-t border-border-subtle pt-[3.5px]">
                <div>
                  <p className="text-[2px] font-black uppercase tracking-[0.2em] text-content-muted">
                    Resultado
                  </p>
                  <p
                    className="mt-[1px] text-[8px] font-black text-content-primary"
                    style={scoreStyle}
                  >
                    {score}
                    <span className="ml-[1px] text-[3.5px] font-semibold text-content-muted">
                      /100
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[2px] font-black uppercase tracking-[0.2em] text-content-muted">
                    Estado
                  </p>
                  <p className="mt-[1px] text-[3px] font-bold text-content-primary" style={scoreStyle}>
                    {statusLabel}
                  </p>
                  <p className="mt-[1px] text-[3px] text-content-secondary">
                    {correctCount} de {total} respuestas correctas
                  </p>
                </div>
              </div>

            </div>

          {submitting && (
            <p className="text-[2.5px] text-content-muted">
              Guardando resultados...
            </p>
          )}

            {submitError && (
              <p className="text-[2.5px] text-content-secondary">
                No se pudo guardar el resultado: {submitError}
              </p>
            )}
          </div>
        </div>

        <div
          className="shrink-0 flex w-full flex-col gap-[2px] border-t border-border-subtle bg-surface-primary pt-[3.5px] sm:flex-row"
        >
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 rounded-[3px] bg-gradient-to-r from-accent to-accent-hover px-[3.5px] py-[2.5px] text-[3px] font-black text-white shadow-sm transition hover:opacity-95"
          >
            Repetir examen
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[3px] border border-border-subtle bg-surface-secondary px-[3.5px] py-[2.5px] text-[3px] font-semibold text-content-secondary transition hover:bg-surface-tertiary"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-[4px]">
      {/* ── Context card ─────────────────────────────────── */}
      <div className="shrink-0 space-y-[2px]">
        <div className="flex flex-wrap items-center gap-[2px]">
          <span className="rounded-full bg-accent px-[2px] py-[0.5px] text-[2px] font-black uppercase tracking-[0.18em] text-white">
            {exerciseMeta?.label}
          </span>
          <span className="rounded-full bg-surface-secondary px-[2px] py-[0.5px] text-[2.5px] font-semibold text-content-secondary">
            {correctCount} correctas
          </span>
          <span className="rounded-full bg-surface-secondary px-[2px] py-[0.5px] text-[2.5px] font-semibold text-content-muted">
            {answered ? "Respuesta revisada" : "Modo interactivo"}
          </span>
        </div>
        <p className="text-[3px] leading-[1.5] text-content-secondary">
          {exerciseMeta?.hint}
        </p>
      </div>

      {/* ── Exercise ─────────────────────────────────────── */}
      <div
        key={`exercise-${currentIdx}`}
        className={current.type === "question" ? "kanji-detail-scroll flex-1 min-h-0 overflow-y-auto pr-1" : "flex-1 min-h-0"}
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
        </div>

      {/* ── Question controls ─────────────────────────────── */}
      {(current.type === "question" || ((current.type === "complete" || current.type === "order") && answered)) && (
        <div className="shrink-0 border-t border-border-subtle bg-surface-primary pt-[3.5px]">
          {current.type === "question" && (
            !answered ? (
              <button
                type="button"
                disabled={selectedIdx === null}
                onClick={handleQuestionConfirm}
                className="w-full rounded-[2px] bg-gradient-to-r from-accent to-accent-hover py-[2px] text-[3px] font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            ) : (
              <button
                type="button"
                onClick={proceed}
                className="flex w-full items-center justify-center gap-[1.5px] rounded-[2px] bg-gradient-to-r from-accent to-accent-hover py-[2px] text-[3px] font-bold text-white shadow-sm transition hover:opacity-90"
              >
                <CheckCircle2 className="h-[3.5px] w-[3.5px]" />
                {currentIdx + 1 >= total ? "Ver resultados" : "Siguiente"}
              </button>
            )
          )}

      {/* ── Complete / Order: next after answer ──────────── */}
      {(current.type === "complete" || current.type === "order") && answered && (
        <button
          type="button"
          onClick={proceed}
          className="flex w-full items-center justify-center gap-[1.5px] rounded-[2px] bg-gradient-to-r from-accent to-accent-hover py-[2px] text-[3px] font-bold text-white shadow-sm transition hover:opacity-90"
        >
          <CheckCircle2 className="h-[3.5px] w-[3.5px]" />
          {currentIdx + 1 >= total ? "Ver resultados" : "Siguiente"}
        </button>
      )}
        </div>
      )}
    </div>
  );
}