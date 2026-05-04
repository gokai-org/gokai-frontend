"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Undo2, X } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { useMiniDockBlocker } from "@/features/dashboard/utils/miniDockBlockers";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { useAnswerConfirmationPreference } from "@/shared/hooks/useAnswerConfirmationPreference";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { AnswerConfirmationPanel, PointsRewardFloat } from "@/shared/ui";
import {
  ReaffirmedMasteryResult,
  UnlockedMasterySequence,
} from "@/shared/ui/ReaffirmedMasteryResult";
import {
  getVocabularyQuiz,
  saveVocabularyNodeAnswers,
} from "../services/api";
import type {
  VocabularyAnswerType,
  VocabularyGraphProgressItem,
  VocabularyQuizOption,
  VocabularyQuizQuestion,
  VocabularyWordAnswer,
  VocabularyWordLesson,
} from "../types";

type VocabularyQuizModalProps = {
  open: boolean;
  item: VocabularyGraphProgressItem;
  question: VocabularyWordLesson;
  onClose: () => void;
  onSaved: () => void;
};

type QuizStep =
  | "loading"
  | "exercise"
  | "feedback"
  | "saving"
  | "summary"
  | "error";

type RoundResult = {
  type: VocabularyAnswerType;
  score: number;
  duration: number;
  perfectAnswers: number;
  totalAnswers: number;
};

const QUIZ_ROUNDS: VocabularyAnswerType[] = [
  "meaning",
  "listening",
  "speaking",
  "writing",
];

const QUIZ_TYPE_LABELS: Record<VocabularyAnswerType, string> = {
  meaning: "Significado",
  listening: "Audio",
  speaking: "Habla",
  writing: "Escritura",
};

function getWordTitle(
  question: Pick<VocabularyQuizQuestion | VocabularyWordLesson, "kanji" | "hiragana">,
) {
  return question.kanji || question.hiragana || "語";
}

function getWordSubtitle(
  question: Pick<VocabularyQuizQuestion | VocabularyWordLesson, "meanings" | "hiragana">,
) {
  return question.meanings?.join(", ") || question.hiragana || "Vocabulario";
}

function getNodeTitle(item: VocabularyGraphProgressItem) {
  return item.meaning || item.kanji || item.kana || "Nodo de vocabulario";
}

function getCelebrationSymbol(item: VocabularyGraphProgressItem) {
  const source = item.kanji || item.kana || item.meaning || "語";
  const normalized = source.trim();
  return normalized.slice(0, 2) || "語";
}

function getQuizPromptTitle(
  question: VocabularyQuizQuestion,
  type: VocabularyAnswerType,
) {
  if (type === "listening") {
    return "Escucha y responde";
  }

  if (type === "writing" && question.meanings?.[0]) {
    return question.meanings[0];
  }

  return getWordTitle(question);
}

function getQuizPromptSupport(
  question: VocabularyQuizQuestion,
  type: VocabularyAnswerType,
) {
  switch (type) {
    case "meaning":
      return question.kanji && question.hiragana ? question.hiragana : null;
    case "listening":
      return "Reproduce el audio y elige la palabra correcta.";
    case "speaking":
      return question.meanings?.join(" · ") || question.hiragana || "Pronuncia la palabra y autoevalua tu intento.";
    case "writing":
      return question.kanji
        ? question.kanji
        : "Construye la lectura con las fichas disponibles.";
  }
}

function getOptionLabel(option: VocabularyQuizOption | string) {
  if (typeof option === "string") {
    return option;
  }

  return (
    option.option ||
    [option.kanji, option.hiragana].filter(Boolean).join(" · ") ||
    "Opcion"
  );
}

function getOptionSecondary(option: VocabularyQuizOption | string) {
  if (typeof option === "string" || option.option) {
    return null;
  }

  return option.hiragana || null;
}

function getOptionCorrect(option: VocabularyQuizOption | string) {
  return typeof option !== "string" && Boolean(option.correct);
}

function buildAudioSrc(audio?: string) {
  if (!audio) return null;
  if (audio.startsWith("data:")) return audio;
  return `data:audio/mpeg;base64,${audio}`;
}

function getRoundInstruction(type: VocabularyAnswerType) {
  switch (type) {
    case "meaning":
      return "Responde todas las palabras del bloque eligiendo su significado correcto.";
    case "listening":
      return "Escucha cada audio y elige la escritura correcta.";
    case "speaking":
      return "Pronuncia cada palabra y marca tu precision para continuar.";
    case "writing":
      return "Construye la lectura completa de cada palabra con las fichas disponibles.";
  }
}

function getScoreTone(score: number) {
  if (score === 100) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-accent";
}

function getAverageScore(answers: VocabularyWordAnswer[]) {
  if (answers.length === 0) {
    return 0;
  }

  const total = answers.reduce((sum, answer) => sum + answer.score, 0);
  return Math.round(total / answers.length);
}

function getTotalDuration(answers: VocabularyWordAnswer[]) {
  return answers.reduce((sum, answer) => sum + answer.duration, 0);
}

function normalizeRoundResults(results: RoundResult[]) {
  return QUIZ_ROUNDS.flatMap((type) => {
    const result = results.find((entry) => entry.type === type);
    return result ? [result] : [];
  });
}

export default function VocabularyQuizModal({
  open,
  item,
  question,
  onClose,
  onSaved,
}: VocabularyQuizModalProps) {
  useMiniDockBlocker(open);

  const platformMotion = usePlatformMotion();
  const { confirmAnswersEnabled } = useAnswerConfirmationPreference();
  const [step, setStep] = useState<QuizStep>("loading");
  const [roundIndex, setRoundIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [roundQuestions, setRoundQuestions] = useState<VocabularyQuizQuestion[]>([]);
  const [roundAnswers, setRoundAnswers] = useState<VocabularyWordAnswer[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selectedWritingTileIndices, setSelectedWritingTileIndices] = useState<number[]>([]);
  const [manualScore, setManualScore] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultingUserPoints, setResultingUserPoints] = useState<number | null>(null);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [rewardFloatPoints, setRewardFloatPoints] = useState<number | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const roundStartRef = useRef(0);
  const startingPointsRef = useRef<number | null>(null);
  const currentPointsRef = useRef<number | null>(null);

  const currentType = QUIZ_ROUNDS[roundIndex] ?? "meaning";
  const totalRounds = QUIZ_ROUNDS.length;
  const activeQuestion = roundQuestions[questionIndex] ?? null;

  const overlayVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.18 : 0.24,
        },
      },
      exit: {
        opacity: 0,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.14 : 0.18,
        },
      },
    }),
    [platformMotion.shouldUseLightAnimations],
  );

  const panelVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        scale: platformMotion.shouldUseLightAnimations ? 1 : 0.95,
        y: platformMotion.shouldUseLightAnimations ? 10 : 24,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.24 : 0.35,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      },
      exit: {
        opacity: 0,
        scale: platformMotion.shouldUseLightAnimations ? 1 : 0.96,
        y: platformMotion.shouldUseLightAnimations ? 8 : 16,
        transition: {
          duration: platformMotion.shouldUseLightAnimations ? 0.16 : 0.2,
        },
      },
    }),
    [platformMotion.shouldUseLightAnimations],
  );

  const resetQuestionAnswer = useCallback(() => {
    setSelectedOptionIndex(null);
    setSelectedWritingTileIndices([]);
    setManualScore(null);
    setIsConfirmDialogOpen(false);
  }, []);

  const loadRound = useCallback(
    async (nextRoundIndex: number) => {
      const nextType = QUIZ_ROUNDS[nextRoundIndex] ?? "meaning";
      setStep("loading");
      setError(null);
      resetQuestionAnswer();

      try {
        const quiz = await getVocabularyQuiz(item.nodeId, nextType);

        if (!quiz.questions.length) {
          throw new Error("El backend devolvio un bloque vacio para este tipo de quiz.");
        }

        setRoundQuestions(quiz.questions);
        setRoundAnswers([]);
        setRoundIndex(nextRoundIndex);
        setQuestionIndex(0);
        roundStartRef.current = Date.now();
        setStep("exercise");
      } catch (loadError) {
        console.error("Error cargando quiz de vocabulario:", loadError);
        setRoundQuestions([]);
        setRoundAnswers([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el quiz de vocabulario.",
        );
        setStep("error");
      }
    },
    [item.nodeId, resetQuestionAnswer],
  );

  const resetQuiz = useCallback(() => {
    setRoundResults([]);
    setResultingUserPoints(null);
    setPointsDelta(0);
    setRewardFloatPoints(null);
    setError(null);
    setIsExitDialogOpen(false);
    void (async () => {
      const user = await getCurrentUser().catch(() => null);
      const nextPoints = typeof user?.points === "number" ? user.points : null;
      startingPointsRef.current = nextPoints;
      currentPointsRef.current = nextPoints;
      void loadRound(0);
    })();
  }, [loadRound]);

  useEffect(() => {
    if (!open) return;
    resetQuiz();
  }, [open, resetQuiz]);

  const choiceOptions = useMemo(() => {
    if (!activeQuestion?.options || currentType === "writing") return [];
    return activeQuestion.options.filter(
      (option): option is VocabularyQuizOption => typeof option !== "string",
    );
  }, [activeQuestion?.options, currentType]);

  const writingOptions = useMemo(() => {
    if (!activeQuestion?.options || currentType !== "writing") return [];
    return activeQuestion.options.filter(
      (option): option is string => typeof option === "string",
    );
  }, [activeQuestion?.options, currentType]);

  const writingAnswer = useMemo(
    () => selectedWritingTileIndices.map((index) => writingOptions[index] ?? "").join(""),
    [selectedWritingTileIndices, writingOptions],
  );

  const currentScore = useMemo(() => {
    if (!activeQuestion) return null;

    if (currentType === "speaking") {
      return manualScore;
    }

    if (currentType === "writing") {
      if (!writingAnswer) return null;
      return writingAnswer === activeQuestion.hiragana ? 100 : 0;
    }

    if (selectedOptionIndex === null) return null;

    return getOptionCorrect(choiceOptions[selectedOptionIndex]) ? 100 : 0;
  }, [activeQuestion, choiceOptions, currentType, manualScore, selectedOptionIndex, writingAnswer]);

  const audioSrc = buildAudioSrc(activeQuestion?.audio);
  const questionProgress = roundQuestions.length
    ? Math.round(((questionIndex + (step === "feedback" ? 1 : 0)) / roundQuestions.length) * 100)
    : 0;
  const finalScore = roundResults.length
    ? Math.round(
        roundResults.reduce((sum, result) => sum + result.score, 0) /
          roundResults.length,
      )
    : 0;

  const confirmCurrentAnswer = useCallback(() => {
    if (!activeQuestion || currentScore === null) return;

    const duration = roundStartRef.current
      ? Math.max(1, Math.round((Date.now() - roundStartRef.current) / 1000))
      : 1;

    const nextAnswer: VocabularyWordAnswer = {
      wordId: activeQuestion.wordId,
      score: currentScore,
      duration,
    };

    setRoundAnswers((current) => [
      ...current.filter((answer) => answer.wordId !== activeQuestion.wordId),
      nextAnswer,
    ]);
    setIsConfirmDialogOpen(false);
    setStep("feedback");
  }, [activeQuestion, currentScore]);

  const requestConfirmAnswer = useCallback(() => {
    if (currentScore === null) return;

    if (confirmAnswersEnabled) {
      setIsConfirmDialogOpen(true);
      return;
    }

    confirmCurrentAnswer();
  }, [confirmAnswersEnabled, confirmCurrentAnswer, currentScore]);

  const applyPointsSync = useCallback((nextUserPoints?: number) => {
    if (typeof nextUserPoints !== "number") {
      return;
    }

    const previousPoints = currentPointsRef.current ?? startingPointsRef.current;
    currentPointsRef.current = nextUserPoints;
    setResultingUserPoints(nextUserPoints);
    dispatchMasteryProgressSync({ points: nextUserPoints });

    const nextTotalDelta =
      typeof startingPointsRef.current === "number"
        ? Math.max(0, nextUserPoints - startingPointsRef.current)
        : 0;
    setPointsDelta(nextTotalDelta);

    if (typeof previousPoints === "number") {
      const awardedNow = Math.max(0, nextUserPoints - previousPoints);
      if (awardedNow > 0) {
        setRewardFloatPoints(awardedNow);
      }
    }
  }, []);

  const saveCurrentRound = useCallback(
    async (answers: VocabularyWordAnswer[]) => {
      setStep("saving");
      setError(null);

      try {
        const response = await saveVocabularyNodeAnswers(item.nodeId, {
          answerType: currentType,
          answers,
        });

        applyPointsSync(response.userPoints);

        const nextRoundResult: RoundResult = {
          type: currentType,
          score: getAverageScore(answers),
          duration: getTotalDuration(answers),
          perfectAnswers: answers.filter((answer) => answer.score === 100).length,
          totalAnswers: answers.length,
        };

        setRoundResults((current) =>
          normalizeRoundResults([
            ...current.filter((result) => result.type !== currentType),
            nextRoundResult,
          ]),
        );

        if (roundIndex >= totalRounds - 1) {
          onSaved();
          setStep("summary");
          return;
        }

        void loadRound(roundIndex + 1);
      } catch (saveError) {
        console.error("Error guardando quiz de vocabulario:", saveError);
        setError("No se pudo guardar este bloque del quiz.");
        setStep("error");
      }
    },
    [applyPointsSync, currentType, item.nodeId, loadRound, onSaved, roundIndex, totalRounds],
  );

  const handleNextQuestion = useCallback(() => {
    if (!activeQuestion) {
      return;
    }

    if (questionIndex >= roundQuestions.length - 1) {
      void saveCurrentRound(roundAnswers);
      return;
    }

    resetQuestionAnswer();
    setQuestionIndex((current) => current + 1);
    roundStartRef.current = Date.now();
    setStep("exercise");
  }, [activeQuestion, questionIndex, resetQuestionAnswer, roundAnswers, roundQuestions.length, saveCurrentRound]);

  const handleStayInQuiz = useCallback(
    (event?: ReactMouseEvent<HTMLDivElement> | ReactMouseEvent<HTMLButtonElement>) => {
      event?.stopPropagation();
      setIsExitDialogOpen(false);
    },
    [],
  );

  const handleDismissAnswerConfirmation = useCallback(
    (event?: ReactMouseEvent<HTMLDivElement>) => {
      event?.stopPropagation();
      setIsConfirmDialogOpen(false);
    },
    [],
  );

  const handleConfirmExit = useCallback(() => {
    setIsExitDialogOpen(false);
    onClose();
  }, [onClose]);

  const handleRequestClose = useCallback(
    (event?: ReactMouseEvent<HTMLElement>) => {
      event?.stopPropagation();

      if (isConfirmDialogOpen) {
        setIsConfirmDialogOpen(false);
        return;
      }

      if (step === "summary" || step === "error") {
        onClose();
        return;
      }

      setIsExitDialogOpen(true);
    },
    [isConfirmDialogOpen, onClose, step],
  );

  useEffect(() => {
    if (step !== "exercise") {
      setIsConfirmDialogOpen(false);
    }
  }, [questionIndex, roundIndex, step]);

  if (!open) return null;

  const shouldShowRewardSequence = step === "summary" && pointsDelta > 0;
  const shouldShowReaffirmedResult = step === "summary" && pointsDelta === 0 && finalScore === 100;

  return (
    <AnimatePresence>
      <motion.div
        key="vocabulary-quiz-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        data-vocabulary-overlay="true"
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={handleRequestClose}
        onWheelCapture={(event) => event.stopPropagation()}
        onPointerDownCapture={(event) => event.stopPropagation()}
        onPointerMoveCapture={(event) => event.stopPropagation()}
      >
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          data-vocabulary-overlay="true"
          className="relative flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface-primary shadow-2xl ring-1 ring-border-subtle max-sm:max-h-[92dvh] max-sm:w-[calc(100vw-2rem)]"
          onClick={(event) => event.stopPropagation()}
        >
          <PointsRewardFloat
            points={rewardFloatPoints}
            caption="Progreso de vocabulario"
            onComplete={() => setRewardFloatPoints(null)}
          />

          <div className="shrink-0 overflow-hidden rounded-t-3xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-accent to-accent-hover px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold leading-tight text-content-inverted">
                  Quiz de Vocabulario
                </h2>
                <p className="text-xs font-medium text-white/70">
                  {step === "summary" || step === "error"
                    ? getNodeTitle(item)
                    : `${QUIZ_TYPE_LABELS[currentType]} · ${getNodeTitle(item)}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {step !== "summary" && step !== "error" ? (
                  <RoundDots current={roundIndex + 1} results={roundResults} />
                ) : null}

                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-primary/15 text-content-inverted transition hover:bg-surface-primary/25"
                  aria-label="Cerrar"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {(step === "exercise" || step === "feedback") && roundQuestions.length > 0 ? (
              <div className="border-b border-border-subtle bg-surface-primary px-5 py-2.5">
                <QuizProgress
                  current={questionIndex}
                  total={roundQuestions.length}
                  progress={questionProgress}
                />
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {(step === "loading" || step === "saving") && (
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-20"
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-4 border-border-subtle" />
                  <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-accent" />
                </div>
                <p className="text-sm font-medium text-content-muted">
                  {step === "saving"
                    ? `Guardando ${QUIZ_TYPE_LABELS[currentType].toLowerCase()}...`
                    : "Preparando quiz..."}
                </p>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-16"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/12 text-red-400 ring-1 ring-red-500/20">
                  <X size={24} />
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="text-sm font-semibold text-red-400">Ocurrio un error</p>
                  <p className="max-w-[320px] text-xs leading-relaxed text-content-muted">
                    {error ?? "No se pudo completar el quiz."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="rounded-xl bg-red-500/12 px-5 py-2.5 text-sm font-semibold text-red-400 ring-1 ring-red-500/18 transition hover:bg-red-500/20"
                  >
                    Reintentar
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-surface-secondary px-5 py-2.5 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            )}

            {(step === "exercise" || step === "feedback") && activeQuestion && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentType}-${activeQuestion.wordId}-${questionIndex}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  <div className="rounded-3xl border border-border-subtle bg-surface-secondary/70 p-4 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-content-tertiary">
                      {QUIZ_TYPE_LABELS[currentType]} · palabra {questionIndex + 1} de {roundQuestions.length}
                    </p>
                    <p className="mt-2 text-4xl font-black leading-none text-content-primary">
                      {getQuizPromptTitle(activeQuestion, currentType)}
                    </p>
                    <p className="mt-3 text-sm font-medium text-content-secondary">
                      {getRoundInstruction(currentType)}
                    </p>
                    {getQuizPromptSupport(activeQuestion, currentType) ? (
                      <p className="mt-2 text-xs font-medium text-content-tertiary">
                        {getQuizPromptSupport(activeQuestion, currentType)}
                      </p>
                    ) : null}

                    {audioSrc && currentType === "listening" ? (
                      <audio controls className="mt-4 w-full" src={audioSrc} preload="metadata" />
                    ) : null}
                  </div>

                  {(currentType === "meaning" || currentType === "listening") && (
                    <div className="grid gap-2">
                      {choiceOptions.map((option, index) => {
                        const selected = selectedOptionIndex === index;
                        const answered = step === "feedback";
                        const correct = getOptionCorrect(option);

                        return (
                          <button
                            key={`${activeQuestion.wordId}-${index}`}
                            type="button"
                            disabled={answered}
                            onClick={() => setSelectedOptionIndex(index)}
                            className={`rounded-2xl border p-3 text-left transition disabled:cursor-default ${
                              selected && answered
                                ? correct
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                                  : "border-accent bg-accent/10 text-accent"
                                : answered && correct
                                  ? "border-emerald-400 bg-emerald-500/5 text-emerald-700"
                                  : selected
                                    ? "border-accent bg-accent/8 text-accent"
                                    : "border-border-subtle bg-surface-primary text-content-primary hover:bg-surface-secondary"
                            }`}
                          >
                            <span className="block text-sm font-bold">
                              {getOptionLabel(option)}
                            </span>
                            {getOptionSecondary(option) ? (
                              <span className="mt-0.5 block text-xs font-medium text-content-tertiary">
                                {getOptionSecondary(option)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentType === "writing" && (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 p-3 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-content-tertiary">
                          Lectura esperada
                        </p>
                        <p className="mt-2 text-lg font-black text-content-primary">
                          {activeQuestion.hiragana || "-"}
                        </p>
                      </div>

                      <div className="min-h-14 rounded-2xl border border-border-subtle bg-surface-primary p-3 text-center text-2xl font-black text-content-primary">
                        {writingAnswer || "..."}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {writingOptions.map((tile, index) => {
                          const used = selectedWritingTileIndices.includes(index);

                          return (
                            <button
                              key={`${tile}-${index}`}
                              type="button"
                              disabled={step === "feedback" || used}
                              onClick={() =>
                                setSelectedWritingTileIndices((current) => [...current, index])
                              }
                              className="min-h-11 rounded-xl border border-border-subtle bg-surface-primary text-lg font-black text-content-primary transition hover:bg-surface-secondary disabled:cursor-default disabled:opacity-45"
                            >
                              {tile}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={step === "feedback" || selectedWritingTileIndices.length === 0}
                          onClick={() =>
                            setSelectedWritingTileIndices((current) => current.slice(0, -1))
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle px-3 py-2 text-xs font-bold text-content-secondary transition hover:bg-surface-secondary disabled:cursor-default disabled:opacity-70"
                        >
                          <Undo2 size={14} />
                          Deshacer
                        </button>

                        <button
                          type="button"
                          disabled={step === "feedback" || selectedWritingTileIndices.length === 0}
                          onClick={() => setSelectedWritingTileIndices([])}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle px-3 py-2 text-xs font-bold text-content-secondary transition hover:bg-surface-secondary disabled:cursor-default disabled:opacity-70"
                        >
                          <RotateCcw size={14} />
                          Reiniciar
                        </button>
                      </div>
                    </div>
                  )}

                  {currentType === "speaking" && (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-content-tertiary">
                          Autoevaluacion
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                          Pronuncia la palabra en voz alta y marca como te salio en este intento.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Repasar", score: 0 },
                          { label: "Casi", score: 50 },
                          { label: "Perfecto", score: 100 },
                        ].map((choice) => (
                          <button
                            key={choice.score}
                            type="button"
                            disabled={step === "feedback"}
                            onClick={() => setManualScore(choice.score)}
                            className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition disabled:cursor-default ${
                              manualScore === choice.score
                                ? "border-accent bg-accent text-content-inverted"
                                : "border-border-subtle bg-surface-primary text-content-secondary hover:bg-surface-secondary"
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === "exercise" && (
                    <motion.button
                      type="button"
                      whileHover={currentScore !== null ? { scale: 1.02 } : undefined}
                      whileTap={currentScore !== null ? { scale: 0.98 } : undefined}
                      disabled={currentScore === null}
                      onClick={requestConfirmAnswer}
                      className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Revisar respuesta
                    </motion.button>
                  )}

                  {step === "feedback" && currentScore !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="rounded-2xl border border-border-subtle bg-surface-primary p-3 text-center text-sm font-bold text-content-secondary">
                        Resultado de esta palabra:{" "}
                        <span className={getScoreTone(currentScore)}>{currentScore}%</span>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNextQuestion}
                        className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all"
                      >
                        {questionIndex >= roundQuestions.length - 1
                          ? `Guardar ${QUIZ_TYPE_LABELS[currentType].toLowerCase()}`
                          : "Siguiente palabra"}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {step === "summary" && shouldShowRewardSequence ? (
              <UnlockedMasterySequence
                title={
                  finalScore === 100
                    ? "Nodo de vocabulario completado con premio"
                    : "Ganaste puntos en vocabulario"
                }
                subtitle={
                  finalScore === 100
                    ? `Cerraste ${getNodeTitle(item).toLowerCase()} con todas las rondas guardadas y desbloqueaste progreso nuevo.`
                    : `Completaste una o mas rondas perfectas en ${getNodeTitle(item).toLowerCase()} y el sistema ya acreditó tus puntos.`
                }
                score={finalScore}
                symbol={getCelebrationSymbol(item)}
                pointsDelta={pointsDelta}
                onClose={onClose}
              />
            ) : null}

            {step === "summary" && shouldShowReaffirmedResult ? (
              <ReaffirmedMasteryResult
                title="Vocabulario reforzado"
                subtitle={`Completaste ${getNodeTitle(item).toLowerCase()} con score perfecto. Este intento no sumó puntos nuevos porque ese progreso ya estaba acreditado.`}
                score={finalScore}
                primaryActionLabel="Repetir quiz"
                onRetry={resetQuiz}
                onClose={onClose}
              />
            ) : null}

            {step === "summary" && !shouldShowRewardSequence && !shouldShowReaffirmedResult ? (
              <VocabularyQuizSummary
                finalScore={finalScore}
                item={item}
                question={question}
                results={roundResults}
                userPoints={resultingUserPoints}
                pointsDelta={pointsDelta}
                onRetry={resetQuiz}
                onClose={onClose}
              />
            ) : null}
          </div>
        </motion.div>

        <AnimatePresence>
          {isConfirmDialogOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={handleDismissAnswerConfirmation}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
                className="relative z-10 w-full max-w-md"
                onClick={(event) => event.stopPropagation()}
              >
                <AnswerConfirmationPanel
                  title="Confirmar respuesta"
                  description="Si ya revisaste tu respuesta, confirma para registrar esta palabra y mostrar su resultado."
                  confirmLabel="Mostrar resultado"
                  onConfirm={confirmCurrentAnswer}
                  tone="kanji"
                  secondaryAction={{
                    label: "Seguir revisando",
                    onAction: () => setIsConfirmDialogOpen(false),
                  }}
                />
              </motion.div>
            </motion.div>
          ) : null}

          {isExitDialogOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={handleStayInQuiz}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18 }}
                className="relative z-10 w-full max-w-md"
                onClick={(event) => event.stopPropagation()}
              >
                <AnswerConfirmationPanel
                  title="Salir del quiz"
                  description="Si sales ahora, cerraras esta sesión y volverás a la guía del nodo sin terminar el bloque actual."
                  confirmLabel="Salir"
                  onConfirm={handleConfirmExit}
                  tone="kanji"
                  secondaryAction={{
                    label: "Seguir en el quiz",
                    onAction: () => setIsExitDialogOpen(false),
                  }}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

function RoundDots({
  current,
  results,
}: {
  current: number;
  results: RoundResult[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      {QUIZ_ROUNDS.map((type, index) => {
        const roundNumber = index + 1;
        const result = results.find((entry) => entry.type === type);
        const isDone = Boolean(result);
        const isCurrent = !isDone && roundNumber === current;
        const isPerfect = (result?.score ?? 0) === 100;

        return (
          <motion.div
            key={type}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
            className={`flex items-center justify-center rounded-full transition-all duration-300 ${
              isDone
                ? isPerfect
                  ? "h-6 w-6 bg-emerald-400 shadow-md shadow-emerald-400/30"
                  : "h-6 w-6 bg-white/70"
                : isCurrent
                  ? "h-6 w-6 bg-white/90 ring-2 ring-white/40 ring-offset-1 ring-offset-transparent"
                  : "h-4 w-4 bg-white/25"
            }`}
          >
            {isDone ? (
              <Check
                className={`h-3 w-3 ${isPerfect ? "text-white" : "text-accent"}`}
                strokeWidth={3}
              />
            ) : null}
            {isCurrent ? <span className="block h-2 w-2 rounded-full bg-accent" /> : null}
          </motion.div>
        );
      })}
    </div>
  );
}

function QuizProgress({
  current,
  total,
  progress,
}: {
  current: number;
  total: number;
  progress: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold text-content-tertiary">
        <span>
          Palabra {Math.min(current + 1, Math.max(total, 1))} de {Math.max(total, 1)}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );
}

function VocabularyQuizSummary({
  finalScore,
  item,
  question,
  results,
  userPoints,
  pointsDelta,
  onRetry,
  onClose,
}: {
  finalScore: number;
  item: VocabularyGraphProgressItem;
  question: VocabularyWordLesson;
  results: RoundResult[];
  userPoints: number | null;
  pointsDelta: number;
  onRetry: () => void;
  onClose: () => void;
}) {
  const success = finalScore >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 py-4 text-center"
    >
      <div
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${
          success ? "bg-emerald-500/12 text-emerald-600" : "bg-accent/10 text-accent"
        }`}
      >
        <span className="text-3xl font-black">{finalScore}%</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-content-primary">
          {success ? "Nodo guardado correctamente" : "Intento guardado"}
        </h3>
        <p className="text-sm leading-relaxed text-content-secondary">
          {getNodeTitle(item)} · {getWordTitle(question)}
        </p>
      </div>

      <div className="grid gap-2 text-left">
        {QUIZ_ROUNDS.map((type) => {
          const result = results.find((round) => round.type === type);

          return (
            <div
              key={type}
              className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-secondary/70 px-3 py-2.5"
            >
              <div>
                <span className="block text-sm font-bold text-content-primary">
                  {QUIZ_TYPE_LABELS[type]}
                </span>
                <span className="block text-xs text-content-tertiary">
                  {result?.perfectAnswers ?? 0}/{result?.totalAnswers ?? 0} perfectas
                </span>
              </div>
              <span className={`text-sm font-black ${getScoreTone(result?.score ?? 0)}`}>
                {result?.score ?? 0}%
              </span>
            </div>
          );
        })}
      </div>

      {pointsDelta > 0 ? (
        <div className="rounded-2xl border border-emerald-500/18 bg-emerald-500/8 px-4 py-3 text-sm font-semibold text-emerald-700">
          Ganaste +{pointsDelta} puntos en este quiz.
        </div>
      ) : null}

      {typeof userPoints === "number" ? (
        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-3 text-sm font-semibold text-content-primary">
          Puntos actuales: {userPoints}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-bold text-accent transition hover:bg-accent/10"
        >
          Reintentar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-3 text-sm font-bold text-content-inverted transition hover:brightness-110"
        >
          Terminar
        </button>
      </div>
    </motion.div>
  );
}
