"use client";

import { useCallback, useEffect, useState, type DragEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import type { OrderExam } from "../../../types";

function shuffleWords(words: string[]) {
  return [...words].sort(() => Math.random() - 0.5);
}

function normalizeSentence(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[\s\u3000]+/g, "")
    .replace(/[。．\.,！!？?「」『』（）()]/g, "")
    .trim();
}

function normalizeToken(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[\s\u3000]+/g, "")
    .trim();
}

function getOrderOptions(question: OrderExam) {
  return question.options ?? question.order ?? [];
}

function getOrderAnswer(question: OrderExam) {
  return question.answer ?? question.order?.join(" ") ?? "";
}

function getAcceptedOrderAnswers(question: OrderExam) {
  const accepted = new Set<string>();
  const canonicalAnswer = normalizeSentence(getOrderAnswer(question));
  const canonicalOrder = normalizeSentence((question.order ?? []).join(" "));

  if (canonicalAnswer) {
    accepted.add(canonicalAnswer);
  }

  if (canonicalOrder) {
    accepted.add(canonicalOrder);
  }

  return accepted;
}

function getExpectedOrderTokens(question: OrderExam) {
  return (question.order ?? []).map(normalizeToken).filter(Boolean);
}

function isOrderAnswerCorrect(question: OrderExam, placed: string[]) {
  const expectedTokens = getExpectedOrderTokens(question);

  if (expectedTokens.length > 0) {
    const placedTokens = placed.map(normalizeToken).filter(Boolean);

    if (placedTokens.length !== expectedTokens.length) {
      return false;
    }

    return placedTokens.every((token, index) => token === expectedTokens[index]);
  }

  const acceptedAnswers = getAcceptedOrderAnswers(question);
  return acceptedAnswers.size > 0 && acceptedAnswers.has(normalizeSentence(placed.join(" ")));
}

interface Props {
  question: OrderExam;
  answered: boolean;
  onAnswer: (correct: boolean) => void;
  onFooterStateChange?: (state: {
    canConfirm: boolean;
    onConfirm: () => void;
    secondaryAction?: { label: string; onAction: () => void } | null;
  } | null) => void;
}

export default function GrammarOrderExercise({
  question,
  answered,
  onAnswer,
  onFooterStateChange,
}: Props) {
  const orderOptions = getOrderOptions(question);
  const correctAnswer = getOrderAnswer(question);
  const [pool, setPool] = useState<string[]>(() => shuffleWords(orderOptions));
  const [placed, setPlaced] = useState<string[]>([]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  function removeOne(words: string[], target: string) {
    const index = words.indexOf(target);
    if (index < 0) {
      return words;
    }

    return [...words.slice(0, index), ...words.slice(index + 1)];
  }

  function take(word: string) {
    if (answered) return;

    setPool((p) => removeOne(p, word));
    setPlaced((p) => [...p, word]);
  }

  function remove(word: string) {
    if (answered) return;
    setPlaced((p) => removeOne(p, word));
    setPool((p) => [...p, word]);
  }

  const reset = useCallback(() => {
    if (answered) return;

    setPool(shuffleWords(orderOptions));
    setPlaced([]);
    setDraggedWord(null);
  }, [answered, orderOptions]);

  const checkAnswer = useCallback(() => {
    if (answered || placed.length === 0) return;
    const correct = isOrderAnswerCorrect(question, placed);
    onAnswer(correct);
  }, [answered, onAnswer, placed, question]);

  function handlePoolDragStart(event: DragEvent<HTMLButtonElement>, word: string) {
    if (answered) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", word);
    setDraggedWord(word);
  }

  function handleDragEnd() {
    setDraggedWord(null);
  }

  function handleAnswerZoneDragOver(event: DragEvent<HTMLDivElement>) {
    if (answered) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleAnswerZoneDrop(event: DragEvent<HTMLDivElement>) {
    if (answered) return;

    event.preventDefault();
    const word = event.dataTransfer.getData("text/plain") || draggedWord;
    if (!word || !pool.includes(word)) return;

    take(word);
    setDraggedWord(null);
  }

  const isCorrect = answered && isOrderAnswerCorrect(question, placed);

  useEffect(() => {
    if (!onFooterStateChange) {
      return;
    }

    if (answered) {
      onFooterStateChange(null);
      return;
    }

    onFooterStateChange({
      canConfirm: placed.length > 0,
      onConfirm: checkAnswer,
      secondaryAction: {
        label: "Reiniciar",
        onAction: reset,
      },
    });

    return () => onFooterStateChange(null);
  }, [answered, checkAnswer, onFooterStateChange, placed.length, reset]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="kanji-detail-scroll flex-1 min-h-0 space-y-4 overflow-y-auto pr-1 sm:space-y-6">
        <div className="relative overflow-hidden rounded-[20px] border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-4 py-4 sm:rounded-[24px] sm:px-6 sm:py-6">
          <div className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-accent/8 blur-3xl" />
          <p className="relative text-sm leading-6 text-content-primary sm:text-lg sm:leading-8">
            {question.question}
          </p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-content-muted sm:text-xs sm:tracking-[0.18em]">
            Tu respuesta
          </p>
          <div
            onDragOver={handleAnswerZoneDragOver}
            onDrop={handleAnswerZoneDrop}
            className={`min-h-[88px] rounded-[20px] border-2 border-dashed px-3 py-3 transition-colors duration-200 sm:min-h-[132px] sm:rounded-[24px] sm:px-5 sm:py-5 ${
              answered
                ? isCorrect
                  ? "border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-950/15"
                  : "border-red-400/50 bg-red-50/40 dark:bg-red-950/15"
                : draggedWord
                  ? "border-accent/50 bg-accent/8"
                  : placed.length
                    ? "border-accent/35 bg-accent/4"
                    : "border-black/[0.05] bg-surface-secondary/50 dark:border-white/[0.08]"
            }`}
          >
            {placed.length === 0 ? (
              <p className="flex min-h-[58px] items-center justify-center text-center text-xs leading-5 text-content-muted sm:min-h-[80px] sm:text-base sm:leading-6">
                Arrastra o toca las palabras de abajo para construir la frase
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {placed.map((word, i) => (
                  <button
                    key={`${word}-${i}`}
                    type="button"
                    disabled={answered}
                    onClick={() => remove(word)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-[15px] ${
                      answered
                        ? isCorrect
                          ? "border-emerald-400/60 bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "border-red-400/50 bg-red-100/60 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                        : "cursor-pointer border-accent/50 bg-accent/10 text-accent hover:opacity-75"
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!answered ? (
          <div className="flex min-h-[44px] flex-wrap gap-2 sm:min-h-[56px] sm:gap-3">
            {pool.map((word, i) => (
              <button
                key={word + i}
                draggable
                onDragStartCapture={(event) => handlePoolDragStart(event, word)}
                onDragEnd={handleDragEnd}
                type="button"
                onClick={() => take(word)}
                className="cursor-pointer rounded-xl border border-black/[0.05] bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-content-primary shadow-sm transition-colors duration-150 hover:border-accent/50 hover:bg-accent/8 hover:text-accent dark:border-white/[0.08] sm:rounded-2xl sm:px-5 sm:py-2.5 sm:text-[15px]"
              >
                {word}
              </button>
            ))}
          </div>
        ) : null}

        {answered && !isCorrect ? (
          <div className="flex items-start gap-3 rounded-[18px] border border-emerald-400/50 bg-emerald-50/50 p-3 dark:bg-emerald-950/20 sm:rounded-[20px] sm:p-4">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
            <div className="text-xs leading-5 sm:text-[15px] sm:leading-6">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">Respuesta correcta:</p>
              <p className="text-emerald-600 dark:text-emerald-400">{correctAnswer}</p>
            </div>
          </div>
        ) : null}

        {answered && isCorrect ? (
          <div className="flex items-center gap-3 rounded-[18px] border border-emerald-400/50 bg-emerald-50/50 p-3 dark:bg-emerald-950/20 sm:rounded-[20px] sm:p-4">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 sm:h-5 sm:w-5" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 sm:text-[15px]">¡Orden correcto!</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}