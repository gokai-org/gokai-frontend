"use client";

import { useState, type DragEvent } from "react";
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
  const blankIds = [...new Set(segments.filter((s) => s.type === "blank").map((s) => s.value))];
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeBlank, setActiveBlank] = useState<string | null>(() => blankIds[0] ?? null);
  const [draggedText, setDraggedText] = useState<string | null>(null);

  const allOptions = [...new Map(question.options.map((o) => [`${o.value}-${o.text}`, o])).values()];
  const availableCountByText = allOptions.reduce<Record<string, number>>((acc, option) => {
    acc[option.text] = (acc[option.text] ?? 0) + 1;
    return acc;
  }, {});
  const selectedCountByText = Object.values(selections).reduce<Record<string, number>>((acc, text) => {
    acc[text] = (acc[text] ?? 0) + 1;
    return acc;
  }, {});

  function getCorrectTexts(blankId: string) {
    return question.options
      .filter((option) => option.value === blankId && option.correct)
      .map((option) => option.text);
  }

  function isCorrectSelection(blankId: string, selectedText?: string) {
    if (!selectedText) return false;
    return getCorrectTexts(blankId).includes(selectedText);
  }

  function selectOption(text: string, forcedBlankId?: string) {
    if (answered) return;

    const target = forcedBlankId ?? activeBlank ?? blankIds.find((id) => selections[id] === undefined);
    if (!target) return;

    const nextSelections = { ...selections, [target]: text };
    setSelections(nextSelections);
    setActiveBlank(blankIds.find((id) => nextSelections[id] === undefined) ?? null);
  }

  function clearBlank(blankId: string) {
    if (answered) return;

    const nextSelections = { ...selections };
    delete nextSelections[blankId];
    setSelections(nextSelections);
    setActiveBlank(blankId);
  }

  function handleOptionDragStart(event: DragEvent<HTMLButtonElement>, text: string) {
    if (answered) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", text);
    setDraggedText(text);
  }

  function handleOptionDragEnd() {
    setDraggedText(null);
  }

  function handleBlankDrop(event: DragEvent<HTMLButtonElement>, blankId: string) {
    if (answered) return;

    event.preventDefault();
    const text = event.dataTransfer.getData("text/plain") || draggedText;
    if (!text) return;

    selectOption(text, blankId);
    setDraggedText(null);
  }

  function handleBlankDragOver(event: DragEvent<HTMLButtonElement>) {
    if (answered) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  const allFilled = blankIds.every((id) => selections[id] !== undefined);

  function checkAnswer() {
    if (!allFilled || answered) return;
    const correct = blankIds.every((id) => isCorrectSelection(id, selections[id]));
    onAnswer(correct);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="kanji-detail-scroll flex-1 min-h-0 space-y-[4px] overflow-y-auto pr-[0.5px]">
        {/* ── Sentence with interactive blanks ──────────────────── */}
        <div className="relative overflow-hidden rounded-[3px] border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-[3.5px] py-[3.5px]">
          <div className="absolute -left-6 -top-6 h-[12px] w-[12px] rounded-full bg-accent/8 blur-xl" />
          <p className="relative text-[3px] leading-[2.4] text-content-primary">
            {segments.map((seg, i) => {
              if (seg.type === "text") return <span key={i}>{seg.value}</span>;

              const filled     = selections[seg.value];
              const isOk       = answered && isCorrectSelection(seg.value, filled);
              const isBad      = answered && filled && !isOk;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={() => {
                    if (filled) {
                      clearBlank(seg.value);
                      return;
                    }

                    setActiveBlank(seg.value);
                  }}
                  onDrop={(event) => handleBlankDrop(event, seg.value)}
                  onDragOver={handleBlankDragOver}
                  className={[
                    "mx-[0.5px] inline-flex min-w-[14px] items-center justify-center rounded-[2px] px-[2px] py-[0.5px] text-[3px] font-bold transition-all duration-200",
                    answered
                      ? isOk
                        ? "border border-emerald-400/60 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-300"
                        : isBad
                          ? "border border-red-400/60 bg-red-50/60 text-red-600 dark:bg-red-950/25 dark:text-red-400"
                          : "border border-border-subtle text-content-muted"
                      : filled
                        ? "cursor-pointer border border-accent/50 bg-accent/10 text-accent hover:opacity-75"
                        : activeBlank === seg.value
                          ? "cursor-pointer border border-accent/50 bg-accent/8 text-accent shadow-[0_0_0_2px_rgba(153,51,49,0.12)]"
                          : draggedText
                            ? "cursor-pointer border border-accent/35 bg-accent/5 text-content-secondary"
                            : "cursor-pointer border-b-2 border-accent/40 bg-transparent text-content-muted",
                  ].join(" ")}
                >
                  {filled ? (
                    <span>{filled}</span>
                  ) : (
                    <span className="text-[2.5px] tracking-widest opacity-50">___</span>
                  )}
                </button>
              );
            })}
          </p>
        </div>

        {/* ── Option chips ─────────────────────────────────── */}
        {!answered && (
          <div className="space-y-[2px]">
            <div className="flex flex-wrap gap-[2px]">
              {allOptions.map((opt, i) => {
                const isUsed = (selectedCountByText[opt.text] ?? 0) >= (availableCountByText[opt.text] ?? 0);
                return (
                  <button
                    key={i}
                    type="button"
                    draggable={!isUsed}
                    onDragStartCapture={(event) => handleOptionDragStart(event, opt.text)}
                    onDragEnd={handleOptionDragEnd}
                    onClick={() => !isUsed && selectOption(opt.text)}
                    disabled={isUsed}
                    className={`rounded-[2px] border px-[3px] py-[1.5px] text-[3px] font-semibold transition-colors duration-150 ${
                      isUsed
                        ? "cursor-default border-border-subtle bg-surface-tertiary text-content-tertiary opacity-50"
                        : "cursor-pointer border-border-default bg-surface-elevated text-content-primary shadow-sm hover:border-accent/50 hover:bg-accent/8 hover:text-accent"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Feedback ─────────────────────────────────────── */}
        {answered && (
          <div className="space-y-[2px] pb-[0.5px]">
            {blankIds.map((id) => {
              const correctTexts = getCorrectTexts(id);
              const isOk       = isCorrectSelection(id, selections[id]);
              return (
                <div
                  key={id}
                  className={`flex items-center gap-[2px] rounded-[2px] border p-[2.5px] text-[3px] font-medium ${
                    isOk
                      ? "border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                      : "border-red-400/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {isOk
                    ? <CheckCircle2 className="h-[3.5px] w-[3.5px] shrink-0" />
                    : <XCircle className="h-[3.5px] w-[3.5px] shrink-0" />}
                  <span>
                    {isOk ? "Correcto:" : correctTexts.length > 1 ? "Las respuestas validas eran:" : "La respuesta era:"}{" "}
                    <strong>{correctTexts.length > 0 ? correctTexts.join(" / ") : "—"}</strong>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirm ──────────────────────────────────────── */}
      {!answered && (
        <div className="shrink-0 border-t border-border-subtle bg-surface-primary pt-[3.5px]">
          <button
            type="button"
            disabled={!allFilled}
            onClick={checkAnswer}
            className="w-full rounded-[2px] bg-gradient-to-r from-accent to-accent-hover py-[2px] text-[3px] font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}