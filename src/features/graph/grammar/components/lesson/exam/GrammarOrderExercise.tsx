"use client";

import { useState, type DragEvent } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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
      <div className="kanji-detail-scroll flex-1 min-h-0 space-y-5 overflow-y-auto pr-1">
        {/* ── Prompt ───────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/6 via-accent/3 to-transparent px-4 py-4">
          <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/8 blur-2xl" />
          <p className="relative text-sm leading-relaxed text-content-primary sm:text-[15px] sm:leading-7">
            {question.question}
          </p>
        </div>

        {/* ── Answer zone ──────────────────────────────────── */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-content-muted">
            Tu respuesta
          </p>
          <div
            onDragOver={handleAnswerZoneDragOver}
            onDrop={handleAnswerZoneDrop}
            className={`min-h-[54px] rounded-2xl border-2 border-dashed px-3 py-3 transition-colors duration-200 ${
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
              <p className="text-center text-xs text-content-muted">
                Arrastra o toca las palabras de abajo para construir la frase
              </p>
            ) : (
              <Reorder.Group
                axis="x"
                values={placed}
                onReorder={(newOrder) => {
                  if (!answered) {
                    setPlaced(newOrder);
                  }
                }}
                className="flex gap-2 overflow-x-auto pb-1"
              >
                <AnimatePresence mode="popLayout">
                  {placed.map((word, i) => (
                    <Reorder.Item
                      key={`${word}-${i}`}
                      value={word}
                      initial={{ opacity: 0, scale: 0.75, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.75, y: 6 }}
                      transition={{ type: "spring", stiffness: 420, damping: 20 }}
                      whileHover={!answered ? { scale: 1.04, y: -1 } : {}}
                      whileTap={!answered ? { scale: 0.93 } : {}}
                      whileDrag={!answered ? { scale: 1.05, zIndex: 5 } : undefined}
                      dragListener={!answered}
                      onClick={() => remove(word)}
                      className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all duration-150 ${
                        answered
                          ? isCorrect
                            ? "border-emerald-400/60 bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                            : "border-red-400/50 bg-red-100/60 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          : "cursor-grab border-accent/50 bg-accent/10 text-accent hover:opacity-75 active:cursor-grabbing"
                      }`}
                    >
                      {word}
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>
        </div>

        {/* ── Pool ─────────────────────────────────────────── */}
        {!answered && (
            <div className="flex min-h-[40px] flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {pool.map((word, i) => (
                  <motion.button
                    key={word + i}
                    layout
                    draggable
                    onDragStartCapture={(event) => handlePoolDragStart(event, word)}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 0.8, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: i * 0.04, type: "spring", stiffness: 380, damping: 18 } }}
                    exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.15 } }}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.93 }}
                    type="button"
                    onClick={() => take(word)}
                    className="cursor-pointer rounded-xl border border-border-default bg-surface-elevated px-3.5 py-2 text-sm font-semibold text-content-primary shadow-sm transition-colors duration-150 hover:border-accent/50 hover:bg-accent/8 hover:text-accent"
                  >
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
        )}

        {/* ── Correct answer reveal ─────────────────────────── */}
        <AnimatePresence>
          {answered && !isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl border border-emerald-400/50 bg-emerald-50/50 p-3 dark:bg-emerald-950/20"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Respuesta correcta:</p>
                <p className="text-emerald-600 dark:text-emerald-400">{correctAnswer}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {answered && isCorrect && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-xl border border-emerald-400/50 bg-emerald-50/50 p-3 dark:bg-emerald-950/20"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">¡Orden correcto!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      {!answered && (
        <div className="shrink-0 border-t border-border-subtle bg-surface-primary pt-4">
          <div className="flex gap-2.5">
            <motion.button
              type="button"
              onClick={reset}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-elevated text-content-muted shadow-sm transition-colors hover:border-border-default hover:text-content-primary"
            >
              <motion.span whileHover={{ rotate: -180 }} transition={{ duration: 0.35 }} className="inline-flex">
                <RotateCcw className="h-4 w-4" />
              </motion.span>
            </motion.button>
            <motion.button
              type="button"
              disabled={placed.length === 0}
              onClick={checkAnswer}
              whileHover={placed.length ? { scale: 1.01 } : {}}
              whileTap={placed.length ? { scale: 0.98 } : {}}
              className="flex-1 rounded-xl bg-gradient-to-r from-accent to-accent-hover py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Confirmar
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}