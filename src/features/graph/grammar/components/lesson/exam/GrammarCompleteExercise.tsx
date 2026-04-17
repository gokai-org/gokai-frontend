"use client";

import { useCallback, useEffect, useMemo, useState, type DragEvent } from "react";
import type { CompleteExam } from "../../../types";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  question: CompleteExam;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
  onFooterStateChange?: (state: { canConfirm: boolean; onConfirm: () => void } | null) => void;
}

function parseTemplate(text: string): { type: "text" | "blank"; value: string }[] {
  return text.split(/({{[0-9]+}})/g).map((p) => {
    const m = p.match(/^{{([0-9]+)}}$/);
    return m ? { type: "blank", value: m[1] } : { type: "text", value: p };
  });
}

export default function GrammarCompleteExercise({
  question,
  answered,
  onAnswer,
  onFooterStateChange,
}: Props) {
  const segments = useMemo(() => parseTemplate(question.question), [question.question]);
  const blankIds = useMemo(
    () => [...new Set(segments.filter((s) => s.type === "blank").map((s) => s.value))],
    [segments],
  );
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeBlank, setActiveBlank] = useState<string | null>(() => blankIds[0] ?? null);
  const [draggedText, setDraggedText] = useState<string | null>(null);

  const allOptions = useMemo(
    () => [...new Map(question.options.map((o) => [`${o.value}-${o.text}`, o])).values()],
    [question.options],
  );
  const availableCountByText = allOptions.reduce<Record<string, number>>((acc, option) => {
    acc[option.text] = (acc[option.text] ?? 0) + 1;
    return acc;
  }, {});
  const selectedCountByText = Object.values(selections).reduce<Record<string, number>>((acc, text) => {
    acc[text] = (acc[text] ?? 0) + 1;
    return acc;
  }, {});

  const getCorrectTexts = useCallback((blankId: string) => {
    return question.options
      .filter((option) => option.value === blankId && option.correct)
      .map((option) => option.text);
  }, [question.options]);

  const isCorrectSelection = useCallback((blankId: string, selectedText?: string) => {
    if (!selectedText) return false;
    return getCorrectTexts(blankId).includes(selectedText);
  }, [getCorrectTexts]);

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

  const allFilled = useMemo(
    () => blankIds.every((id) => selections[id] !== undefined),
    [blankIds, selections],
  );

  const checkAnswer = useCallback(() => {
    if (!allFilled || answered) return;
    const correct = blankIds.every((id) => isCorrectSelection(id, selections[id]));
    onAnswer(correct);
  }, [allFilled, answered, blankIds, isCorrectSelection, onAnswer, selections]);

  useEffect(() => {
    if (!onFooterStateChange) {
      return;
    }

    if (answered) {
      onFooterStateChange(null);
      return;
    }

    onFooterStateChange({
      canConfirm: allFilled,
      onConfirm: checkAnswer,
    });

    return () => onFooterStateChange(null);
  }, [allFilled, answered, checkAnswer, onFooterStateChange]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="kanji-detail-scroll flex-1 min-h-0 space-y-4 overflow-y-auto pr-1 sm:space-y-6">
        <div className="relative overflow-hidden rounded-[20px] border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-4 py-4 sm:rounded-[24px] sm:px-6 sm:py-6">
          <div className="absolute -left-14 -top-14 h-28 w-28 rounded-full bg-accent/8 blur-3xl" />
          <p className="relative text-sm leading-7 text-content-primary sm:text-lg sm:leading-10">
            {segments.map((seg, i) => {
              if (seg.type === "text") return <span key={i}>{seg.value}</span>;

              const filled = selections[seg.value];
              const isOk = answered && isCorrectSelection(seg.value, filled);
              const isBad = answered && filled && !isOk;

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
                    "mx-1 my-1 inline-flex min-h-[34px] min-w-[68px] items-center justify-center rounded-lg px-2.5 py-1 text-[13px] font-bold leading-none transition-all duration-200 sm:min-h-[42px] sm:min-w-[104px] sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-base",
                    answered
                      ? isOk
                        ? "border border-emerald-400/60 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-300"
                        : isBad
                          ? "border border-red-400/60 bg-red-50/60 text-red-600 dark:bg-red-950/25 dark:text-red-400"
                          : "border border-black/[0.05] text-content-muted dark:border-white/[0.08]"
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
                    <span className="text-[13px] tracking-[0.22em] opacity-50 sm:text-base sm:tracking-[0.28em]">___</span>
                  )}
                </button>
              );
            })}
          </p>
        </div>

        {!answered ? (
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-wrap gap-2 sm:gap-3">
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
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-[15px] ${
                      isUsed
                        ? "cursor-default border-black/[0.05] bg-surface-tertiary text-content-tertiary opacity-50 dark:border-white/[0.08]"
                        : "cursor-pointer border-black/[0.05] bg-surface-elevated text-content-primary shadow-sm hover:border-accent/50 hover:bg-accent/8 hover:text-accent dark:border-white/[0.08]"
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {answered ? (
          <div className="space-y-3 pb-1">
            {blankIds.map((id) => {
              const correctTexts = getCorrectTexts(id);
              const isOk = isCorrectSelection(id, selections[id]);

              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 rounded-[18px] border p-3 text-xs font-medium leading-5 sm:rounded-[20px] sm:p-4 sm:text-[15px] sm:leading-6 ${
                    isOk
                      ? "border-emerald-400/50 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                      : "border-red-400/50 bg-red-50/50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                  }`}
                >
                  {isOk ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                  )}
                  <span>
                    {isOk ? "Correcto:" : correctTexts.length > 1 ? "Las respuestas validas eran:" : "La respuesta era:"}{" "}
                    <strong>{correctTexts.length > 0 ? correctTexts.join(" / ") : "—"}</strong>
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

    </div>
  );
}