"use client";

import { useState, type DragEvent } from "react";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import type { OrderExam } from "../../../types";

function shuffleWords(words: string[]) {
  return [...words].sort(() => Math.random() - 0.5);
}

function normalizeSentence(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[\s\u3000]+/g, "")
    .replace(/[。．\.、,！!？?「」『』（）()]/g, "")
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
}

export default function GrammarOrderExercise({ question, answered, onAnswer }: Props) {
  const orderOptions = getOrderOptions(question);
  const correctAnswer = getOrderAnswer(question);
  const [pool, setPool]     = useState<string[]>(() => shuffleWords(orderOptions));
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

  function reset() {
    if (answered) return;

    setPool(shuffleWords(orderOptions));
    setPlaced([]);
    setDraggedWord(null);
  }

  function checkAnswer() {
    if (answered || placed.length === 0) return;
    const correct = isOrderAnswerCorrect(question, placed);
    onAnswer(correct);
  }

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="kanji-detail-scroll flex-1 min-h-0 space-y-[4px] overflow-y-auto pr-[0.5px]">
        {/* ── Prompt ───────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[3px] border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-[3.5px] py-[3.5px]">
          <div className="absolute -right-6 -top-6 h-[12px] w-[12px] rounded-full bg-accent/8 blur-xl" />
          <p className="relative text-[3px] leading-[1.5] text-content-primary">
            {question.question}
          </p>
        </div>

        {/* ── Answer zone ──────────────────────────────────── */}
        <div>
          <p className="mb-[1px] text-[2.5px] font-semibold uppercase tracking-wider text-content-muted">
            Tu respuesta
          </p>
          <div
            onDragOver={handleAnswerZoneDragOver}
            onDrop={handleAnswerZoneDrop}
            className={`min-h-[12px] rounded-[3px] border-2 border-dashed px-[2.5px] py-[2.5px] transition-colors duration-200 ${
              answered
                ? isCorrect
                  ? "border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-950/15"
                  : "border-red-400/50 bg-red-50/40 dark:bg-red-950/15"
                : draggedWord
                  ? "border-accent/50 bg-accent/8"
                : placed.length
                  ? "border-accent/35 bg-accent/4"
                  : "border-border-subtle bg-surface-secondary/50"
            }`}
          >
            {placed.length === 0 ? (
              <p className="text-center text-[2.5px] text-content-muted">
                Arrastra o toca las palabras de abajo para construir la frase
              </p>
            ) : (
              <div className="flex flex-wrap gap-[2px]">
                {placed.map((word, i) => (
                  <button
                    key={`${word}-${i}`}
                    type="button"
                    disabled={answered}
                    onClick={() => remove(word)}
                    className={`rounded-[2px] border px-[2.5px] py-[1px] text-[3px] font-semibold transition-colors duration-150 ${
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

        {/* ── Pool ─────────────────────────────────────────── */}
        {!answered && (
            <div className="flex min-h-[9px] flex-wrap gap-[2px]">
              {pool.map((word, i) => (
                <button
                  key={word + i}
                  draggable
                  onDragStartCapture={(event) => handlePoolDragStart(event, word)}
                  onDragEnd={handleDragEnd}
                  type="button"
                  onClick={() => take(word)}
                  className="cursor-pointer rounded-[2px] border border-border-default bg-surface-elevated px-[3px] py-[1.5px] text-[3px] font-semibold text-content-primary shadow-sm transition-colors duration-150 hover:border-accent/50 hover:bg-accent/8 hover:text-accent"
                >
                  {word}
                </button>
              ))}
            </div>
        )}

        {/* ── Correct answer reveal ─────────────────────────── */}
        {answered && !isCorrect && (
            <div className="flex items-start gap-[2px] rounded-[2px] border border-emerald-400/50 bg-emerald-50/50 p-[2.5px] dark:bg-emerald-950/20">
              <CheckCircle2 className="h-[3.5px] w-[3.5px] shrink-0 text-emerald-500" />
              <div className="text-[3px]">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Respuesta correcta:</p>
                <p className="text-emerald-600 dark:text-emerald-400">{correctAnswer}</p>
              </div>
            </div>
          )}

        {answered && isCorrect && (
            <div className="flex items-center gap-[2px] rounded-[2px] border border-emerald-400/50 bg-emerald-50/50 p-[2.5px] dark:bg-emerald-950/20">
              <CheckCircle2 className="h-[3.5px] w-[3.5px] shrink-0 text-emerald-500" />
              <p className="text-[3px] font-semibold text-emerald-700 dark:text-emerald-300">¡Orden correcto!</p>
            </div>
          )}
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      {!answered && (
        <div className="shrink-0 border-t border-border-subtle bg-surface-primary pt-[3.5px]">
          <div className="flex gap-[2px]">
            <button
              type="button"
              onClick={reset}
              className="flex h-[8px] w-[8px] shrink-0 items-center justify-center rounded-[2px] border border-border-subtle bg-surface-elevated text-content-muted transition-colors hover:border-border-default hover:text-content-primary"
            >
              <RotateCcw className="h-[3.5px] w-[3.5px]" />
            </button>
            <button
              type="button"
              disabled={placed.length === 0}
              onClick={checkAnswer}
              className="flex-1 rounded-[2px] bg-gradient-to-r from-accent to-accent-hover py-[2px] text-[3px] font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}