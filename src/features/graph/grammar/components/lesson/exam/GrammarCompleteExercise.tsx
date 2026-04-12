"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CompleteExam } from "../../../types";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  question: CompleteExam;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
}

function parseTemplate(text: string): { type: "text" | "blank"; value: string }[] {
  return text.split(/({{[0-9]+}})/g).map((p) => {
    const m = p.match(/^{{([0-9]+)}}$/);
    return m ? { type: "blank", value: m[1] } : { type: "text", value: p };
  });
}

export default function GrammarCompleteExercise({ question, answered, onAnswer }: Props) {
  const segments = parseTemplate(question.question);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [lastFilled, setLastFilled] = useState<string | null>(null);

  useEffect(() => { setSelections({}); setLastFilled(null); }, [question.question]);

  const blankIds = [...new Set(segments.filter((s) => s.type === "blank").map((s) => s.value))];
  const allOptions = [...new Map(question.options.map((o) => [`${o.value}-${o.text}`, o])).values()];

  function selectOption(blankId: string, text: string) {
    if (answered) return;
    // Find first unfilled blank, or use the specified one
    const target = selections[blankId] !== undefined ? blankId : (blankIds.find((id) => selections[id] === undefined) ?? blankId);
    setSelections((prev) => ({ ...prev, [target]: text }));
    setLastFilled(target);
  }

  function clearBlank(blankId: string) {
    if (answered) return;
    setSelections((prev) => { const n = { ...prev }; delete n[blankId]; return n; });
    setLastFilled(null);
  }

  const allFilled = blankIds.every((id) => selections[id] !== undefined);

  function checkAnswer() {
    if (!allFilled || answered) return;
    const correct = blankIds.every((id) => {
      const correctOpt = question.options.find((o) => o.value === id && o.correct);
      return correctOpt?.text === selections[id];
    });
    onAnswer(correct);
  }

  return (
    <div className="space-y-5">
      {/* ── Sentence with interactive blanks ─────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-4 py-4">
        <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-accent/8 blur-2xl" />
        <p className="relative text-sm leading-[2.4] text-content-primary sm:text-[15px]">
          {segments.map((seg, i) => {
            if (seg.type === "text") return <span key={i}>{seg.value}</span>;

            const filled     = selections[seg.value];
            const isNew      = lastFilled === seg.value;
            const correctOpt = answered ? question.options.find((o) => o.value === seg.value && o.correct) : null;
            const isOk       = answered && correctOpt?.text === filled;
            const isBad      = answered && filled && !isOk;

            return (
              <motion.button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => filled && !answered && clearBlank(seg.value)}
                animate={isNew ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
                className={[
                  "mx-1.5 inline-flex min-w-[64px] items-center justify-center rounded-lg px-2.5 py-0.5 text-sm font-bold transition-all duration-200",
                  answered
                    ? isOk
                      ? "border border-emerald-400/60 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-300"
                      : isBad
                        ? "border border-red-400/60 bg-red-50/60 text-red-600 dark:bg-red-950/25 dark:text-red-400"
                        : "border border-border-subtle text-content-muted"
                    : filled
                      ? "cursor-pointer border border-accent/50 bg-accent/10 text-accent hover:opacity-75"
                      : "cursor-default border-b-2 border-accent/40 bg-transparent text-content-muted",
                ].join(" ")}
              >
                {filled ? (
                  <span>{filled}</span>
                ) : (
                  <span className="text-[11px] tracking-widest opacity-50">___</span>
                )}
              </motion.button>
            );
          })}
        </p>
      </div>

      {/* ── Option chips ─────────────────────────────────── */}
      <AnimatePresence>
        {!answered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex flex-wrap gap-2"
          >
            {allOptions.map((opt, i) => {
              const isUsed = Object.values(selections).includes(opt.text);
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => !isUsed && selectOption(opt.value, opt.text)}
                  whileHover={!isUsed ? { scale: 1.04, y: -1 } : {}}
                  whileTap={!isUsed ? { scale: 0.95 } : {}}
                  disabled={isUsed}
                  className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                    isUsed
                      ? "cursor-default border-border-subtle bg-surface-tertiary text-content-tertiary opacity-50"
                      : "cursor-pointer border-border-default bg-surface-elevated text-content-primary shadow-sm hover:border-accent/50 hover:bg-accent/8 hover:text-accent"
                  }`}
                >
                  {opt.text}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feedback ─────────────────────────────────────── */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {blankIds.map((id, i) => {
              const correctOpt = question.options.find((o) => o.value === id && o.correct);
              const isOk       = correctOpt?.text === selections[id];
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-sm font-medium ${
                    isOk
                      ? "border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                      : "border-red-400/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isOk
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <XCircle className="h-4 w-4 shrink-0" />}
                  <span>
                    {isOk ? "Correcto:" : "La respuesta era:"}{" "}
                    <strong>{correctOpt?.text ?? "—"}</strong>
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm ──────────────────────────────────────── */}
      {!answered && (
        <motion.button
          type="button"
          disabled={!allFilled}
          onClick={checkAnswer}
          whileHover={allFilled ? { scale: 1.01 } : {}}
          whileTap={allFilled ? { scale: 0.98 } : {}}
          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          Confirmar
        </motion.button>
      )}
    </div>
  );
}