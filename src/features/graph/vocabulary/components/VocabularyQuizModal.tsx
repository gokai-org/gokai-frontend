"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { classifyJapaneseCharacter } from "@/features/chatbot/utils/writingCharacters";
import {
  getWritingPalette,
  resolveWritingAccentColor,
} from "@/features/chatbot/utils/writingPalette";
import { useMiniDockBlocker } from "@/features/dashboard/utils/miniDockBlockers";
import { KanaWritingCanvas, type DrawnStroke } from "@/features/kana/components/KanaWritingCanvas";
import {
  getFeedbackColor,
  getFeedbackLabel,
  getPointsForFeedback,
  validateStroke,
  type StrokeValidationResult,
} from "@/features/kana/lib/strokeValidation";
import { getMockKanaStrokes } from "@/features/kana/mock/mockStrokeData";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { useAnswerConfirmationPreference } from "@/shared/hooks/useAnswerConfirmationPreference";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { useStudySessionActivity } from "@/features/configuration/lib/studySessionReminder";
import {
  AnswerConfirmationPanel,
  QuizAudioPlayer,
} from "@/shared/ui";
import {
  ReaffirmedMasteryResult,
  UnlockedMasterySequence,
} from "@/shared/ui/ReaffirmedMasteryResult";
import VocabularySpeakingExercise from "./VocabularySpeakingExercise";
import {
  getVocabularyQuiz,
  saveVocabularyNodeAnswers,
} from "../services/api";
import {
  VOCABULARY_QUIZ_TYPES,
  VOCABULARY_QUIZ_TYPE_LABELS,
  getQuizTypeProgress,
  getWordQuizProgressPercent,
} from "../lib/vocabularyQuizProgress";
import type { WritingScriptType } from "@/features/graph/writing/shared/types";
import type {
  VocabularyAnswerType,
  VocabularyGraphProgressItem,
  VocabularyQuizOption,
  VocabularyQuizQuestion,
  VocabularyQuizSaveContext,
  VocabularyQuizSaveResult,
  VocabularyWordAnswer,
  VocabularyWordLesson,
  VocabularyWritingOptionUnit,
} from "../types";

const VOCABULARY_WRITING_PASS_SCORE = 70;
const VOCABULARY_WRITING_BASE_STROKE_POINTS = 10;

type VocabularyQuizModalProps = {
  open: boolean;
  item: VocabularyGraphProgressItem;
  question: VocabularyWordLesson;
  initialType: VocabularyAnswerType;
  availableTypes?: VocabularyAnswerType[];
  onClose: () => void;
  onComplete?: () => void;
  onSaved: (
    context: VocabularyQuizSaveContext,
  ) => Promise<VocabularyQuizSaveResult | void> | VocabularyQuizSaveResult | void;
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

function getWordTitle(
  question: Pick<VocabularyQuizQuestion | VocabularyWordLesson, "kanji" | "hiragana">,
) {
  return question.kanji || question.hiragana || "語";
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

  if (type === "writing") {
    return question.kanji || "語";
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
      return null;
    case "speaking":
      return question.meanings?.join(" · ") || question.hiragana || "Graba tu pronunciación y revisa el feedback.";
    case "writing":
      return question.meanings?.[0]
        ? question.meanings[0]
        : "Selecciona la lectura en hiragana y trázala.";
  }
}

function getMeaningPromptWriting(question: VocabularyQuizQuestion) {
  return question.kanji || question.hiragana || "語";
}

function getMeaningPromptPrimaryLabel(question: VocabularyQuizQuestion) {
  return question.kanji ? "Kanji" : "Kana";
}

function getMeaningPromptReading(question: VocabularyQuizQuestion) {
  if (!question.hiragana) {
    return null;
  }

  if (!question.kanji) {
    return question.hiragana;
  }

  return question.kanji.trim() === question.hiragana.trim()
    ? null
    : question.hiragana;
}

function getOptionLabel(
  option: VocabularyQuizOption | string,
  type?: VocabularyAnswerType,
) {
  if (typeof option === "string") {
    return option;
  }

  if (type === "listening") {
    return option.meanings?.find(Boolean) || option.option || "Opcion";
  }

  return (
    option.option ||
    option.kanji ||
    option.hiragana ||
    "Opcion"
  );
}

function getOptionSecondary(
  option: VocabularyQuizOption | string,
  type?: VocabularyAnswerType,
) {
  if (type === "listening") {
    return null;
  }

  if (typeof option === "string" || option.option) {
    return null;
  }

  if (option.kanji && option.hiragana) {
    return option.hiragana;
  }

  return null;
}

function getOptionCorrect(option: VocabularyQuizOption | string) {
  return typeof option !== "string" && Boolean(option.correct);
}

function WritingSymbolText({
  text,
  className,
  colorMode = "none",
}: {
  text: string;
  className?: string;
  colorMode?: "none" | "hover" | "accent";
}) {
  return (
    <span className={className}>
      {Array.from(text).map((symbol, index) => (
        <WritingSymbolGlyph
          key={`${symbol}-${index}`}
          symbol={symbol}
          colorMode={colorMode}
        />
      ))}
    </span>
  );
}

function getDominantWritingScript(text: string): WritingScriptType | null {
  let hasHiragana = false;
  let hasKatakana = false;

  for (const symbol of Array.from(text)) {
    const scriptType = classifyJapaneseCharacter(symbol);

    if (scriptType === "kanji") {
      return "kanji";
    }

    if (scriptType === "katakana") {
      hasKatakana = true;
      continue;
    }

    if (scriptType === "hiragana") {
      hasHiragana = true;
    }
  }

  if (hasKatakana) {
    return "katakana";
  }

  if (hasHiragana) {
    return "hiragana";
  }

  return null;
}

function getWritingOptionToneStyle(text: string): CSSProperties | undefined {
  const scriptType = getDominantWritingScript(text);
  if (!scriptType) {
    return undefined;
  }

  const accentColor = resolveWritingAccentColor(scriptType);
  const palette = getWritingPalette(accentColor);

  return {
    ["--writing-option-accent" as string]: palette.accent,
    ["--writing-option-soft" as string]: palette.soft,
    ["--writing-option-soft-strong" as string]: palette.softStrong,
    ["--writing-option-border" as string]: palette.borderSoft,
    ["--writing-option-border-strong" as string]: palette.borderStrong,
    ["--writing-option-ring" as string]: palette.ring,
  };
}

function WritingSymbolGlyph({
  symbol,
  colorMode,
}: {
  symbol: string;
  colorMode: "none" | "hover" | "accent";
}) {
  const scriptType = classifyJapaneseCharacter(symbol);

  if (!scriptType || colorMode === "none") {
    return <span>{symbol}</span>;
  }

  const accentColor = resolveWritingAccentColor(scriptType);

  return (
    <span
      className={[
        "transition-colors duration-150",
        colorMode === "accent"
          ? "text-[color:var(--writing-symbol-accent)]"
          : "group-hover:text-[color:var(--writing-symbol-accent)] group-focus-visible:text-[color:var(--writing-symbol-accent)]",
      ].join(" ")}
      style={{ ["--writing-symbol-accent" as string]: accentColor }}
    >
      {symbol}
    </span>
  );
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
      return "Graba tu pronunciación y usa el puntaje para continuar con la palabra.";
    case "writing":
      return "Construye la lectura completa de cada palabra con las fichas disponibles.";
  }
}

function getVocabularyResultTitle(type: VocabularyAnswerType) {
  return `${VOCABULARY_QUIZ_TYPE_LABELS[type]} completado`;
}

function getVocabularyReaffirmedTitle(type: VocabularyAnswerType) {
  return `${VOCABULARY_QUIZ_TYPE_LABELS[type]} reforzado`;
}

function normalizeRoundResults(
  results: RoundResult[],
  quizTypes: VocabularyAnswerType[],
) {
  return quizTypes.flatMap((type) => {
    const result = results.find((entry) => entry.type === type);
    return result ? [result] : [];
  });
}

export default function VocabularyQuizModal({
  open,
  item,
  question,
  initialType,
  availableTypes,
  onClose,
  onComplete,
  onSaved,
}: VocabularyQuizModalProps) {
  useMiniDockBlocker(open);
  useStudySessionActivity("vocabulary-quiz", open);

  const platformMotion = usePlatformMotion();
  const { confirmAnswersEnabled } = useAnswerConfirmationPreference();
  const [step, setStep] = useState<QuizStep>("loading");
  const [roundIndex, setRoundIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [roundQuestions, setRoundQuestions] = useState<VocabularyQuizQuestion[]>([]);
  const [roundAnswers, setRoundAnswers] = useState<VocabularyWordAnswer[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selectedWritingOptionIndex, setSelectedWritingOptionIndex] = useState<number | null>(null);
  const [writingTraceScore, setWritingTraceScore] = useState<number | null>(null);
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultingUserPoints, setResultingUserPoints] = useState<number | null>(null);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const roundStartRef = useRef(0);
  const startingPointsRef = useRef<number | null>(null);
  const currentPointsRef = useRef<number | null>(null);
  const completedBeforeSessionRef = useRef(false);
  const wasOpenRef = useRef(false);

  const quizTypes = useMemo(() => {
    const requestedTypes = availableTypes?.length ? availableTypes : [initialType];
    const unique = new Set<VocabularyAnswerType>(requestedTypes);
    const normalized = VOCABULARY_QUIZ_TYPES.filter((type) => unique.has(type));

    return normalized.length > 0 ? normalized : [initialType];
  }, [availableTypes, initialType]);

  const currentType = quizTypes[roundIndex] ?? quizTypes[0] ?? initialType;
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
    setSelectedWritingOptionIndex(null);
    setWritingTraceScore(null);
    setSpeakingScore(null);
    setIsConfirmDialogOpen(false);
  }, []);

  const hydrateStartingPoints = useCallback(() => {
    const sessionStartPoints = currentPointsRef.current;

    void getCurrentUser()
      .then((user) => {
        const nextPoints = typeof user?.points === "number" ? user.points : null;
        startingPointsRef.current = nextPoints;
        if (currentPointsRef.current === sessionStartPoints) {
          currentPointsRef.current = nextPoints;
        }
      })
      .catch(() => {
        startingPointsRef.current = null;
        if (currentPointsRef.current === sessionStartPoints) {
          currentPointsRef.current = null;
        }
      });
  }, []);

  const loadRound = useCallback(
    async (nextRoundIndex: number) => {
      const nextType = quizTypes[nextRoundIndex] ?? quizTypes[0] ?? initialType;
      setStep("loading");
      setError(null);
      resetQuestionAnswer();

      try {
        const quiz = await getVocabularyQuiz(item.nodeId, nextType, question.wordId);

        if (!quiz.questions.length) {
          throw new Error("El backend no devolvio preguntas para este bloque de quiz.");
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
    [initialType, item.nodeId, question.wordId, quizTypes, resetQuestionAnswer],
  );

  const resetQuiz = useCallback(() => {
    setRoundResults([]);
    setResultingUserPoints(null);
    setPointsDelta(0);
    setError(null);
    setIsExitDialogOpen(false);
    startingPointsRef.current = currentPointsRef.current;
    void loadRound(Math.max(0, quizTypes.indexOf(initialType)));
    hydrateStartingPoints();
  }, [hydrateStartingPoints, initialType, loadRound, quizTypes]);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    if (wasOpenRef.current) {
      return;
    }

    wasOpenRef.current = true;
    completedBeforeSessionRef.current = getQuizTypeProgress(question, initialType).completed;
    resetQuiz();
  }, [initialType, item, open, question, resetQuiz]);

  const choiceOptions = useMemo(() => {
    if (!activeQuestion?.options || currentType === "writing") return [];
    return activeQuestion.options.filter(
      (option): option is VocabularyQuizOption => typeof option !== "string",
    );
  }, [activeQuestion?.options, currentType]);

  const writingOptions = useMemo(() => {
    if (!activeQuestion?.options || currentType !== "writing") return [];
    return activeQuestion.options.filter(
      (option): option is VocabularyQuizOption => typeof option !== "string",
    );
  }, [activeQuestion?.options, currentType]);

  const selectedWritingOption = selectedWritingOptionIndex === null
    ? null
    : writingOptions[selectedWritingOptionIndex] ?? null;
  const selectedWritingOptionIsCorrect = selectedWritingOption
    ? getOptionCorrect(selectedWritingOption)
    : false;

  const currentScore = useMemo(() => {
    if (!activeQuestion) return null;

    if (currentType === "speaking") {
      return speakingScore;
    }

    if (currentType === "writing") {
      if (!selectedWritingOption) return null;
      if (!selectedWritingOptionIsCorrect) return 0;
      if (step === "exercise") return 100;
      if (writingTraceScore === null) return null;
      return writingTraceScore >= VOCABULARY_WRITING_PASS_SCORE
        ? 100
        : 0;
    }

    if (selectedOptionIndex === null) return null;

    return getOptionCorrect(choiceOptions[selectedOptionIndex]) ? 100 : 0;
  }, [activeQuestion, choiceOptions, currentType, selectedOptionIndex, selectedWritingOption, selectedWritingOptionIsCorrect, speakingScore, step, writingTraceScore]);

  const audioSrc = buildAudioSrc(activeQuestion?.audio);
  const questionProgress = roundQuestions.length
    ? Math.round(((questionIndex + (step === "feedback" ? 1 : 0)) / roundQuestions.length) * 100)
    : 0;
  const hasNextRound = roundIndex < quizTypes.length - 1;
  const nextRoundType = hasNextRound ? quizTypes[roundIndex + 1] : null;
  const finalScore = roundResults.length
    ? Math.round(
        roundResults.reduce((sum, result) => sum + result.score, 0) /
          roundResults.length,
      )
    : 0;

  const confirmCurrentAnswer = useCallback(() => {
    if (!activeQuestion || currentScore === null) return;

    if (currentType === "writing" && selectedWritingOptionIsCorrect && writingTraceScore === null) {
      setIsConfirmDialogOpen(false);
      setStep("feedback");
      return;
    }

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
  }, [activeQuestion, currentScore, currentType, selectedWritingOptionIsCorrect, writingTraceScore]);

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

    currentPointsRef.current = nextUserPoints;
    setResultingUserPoints(nextUserPoints);
    dispatchMasteryProgressSync({ points: nextUserPoints });

    const nextTotalDelta =
      typeof startingPointsRef.current === "number"
        ? Math.max(0, nextUserPoints - startingPointsRef.current)
        : 0;
    setPointsDelta(nextTotalDelta);
  }, []);

  const saveCurrentRound = useCallback(
    async (answers: VocabularyWordAnswer[]) => {
      setStep("saving");
      setError(null);

      const questionWordIds = new Set(roundQuestions.map((roundQuestion) => roundQuestion.wordId));
      const completedAnswers = answers.filter((answer) => questionWordIds.has(answer.wordId));

      if (completedAnswers.length !== roundQuestions.length) {
        setError("No se completaron todas las respuestas de este quiz.");
        setStep("error");
        return;
      }

      const targetAnswer = completedAnswers.find(
		(answer) => answer.wordId === question.wordId,
	  );

	  if (!targetAnswer) {
		setError("No se encontro la respuesta de la palabra seleccionada.");
		setStep("error");
		return;
	  }

      try {
        const response = await saveVocabularyNodeAnswers(item.nodeId, {
          answerType: currentType,
          answers: [targetAnswer],
        });

        applyPointsSync(response.userPoints);

        const averageScore = targetAnswer.score;

        const nextRoundResult: RoundResult = {
          type: currentType,
          score: averageScore,
		  duration: targetAnswer.duration,
		  perfectAnswers: targetAnswer.score === 100 ? 1 : 0,
		  totalAnswers: 1,
        };

        setRoundResults((current) =>
          normalizeRoundResults([
            ...current.filter((result) => result.type !== currentType),
            nextRoundResult,
          ], quizTypes),
        );

        const saveResult = await onSaved({
          wordId: question.wordId,
          answerType: currentType,
          score: averageScore,
          response,
        });

        if (saveResult?.closeQuiz) {
          return;
        }

        if (roundIndex < quizTypes.length - 1) {
          await loadRound(roundIndex + 1);
          return;
        }

        setStep("summary");
        onComplete?.();
      } catch (saveError) {
        console.error("Error guardando quiz de vocabulario:", saveError);
        setError("No se pudo guardar este bloque del quiz.");
        setStep("error");
      }
    },
    [applyPointsSync, currentType, item.nodeId, loadRound, onComplete, onSaved, question.wordId, quizTypes, roundIndex, roundQuestions],
  );

  const handleNextQuestion = useCallback(() => {
    if (!activeQuestion) {
      return;
    }

    let nextRoundAnswers = roundAnswers;
    if (
      currentScore !== null &&
      !nextRoundAnswers.some((answer) => answer.wordId === activeQuestion.wordId)
    ) {
      const duration = roundStartRef.current
        ? Math.max(1, Math.round((Date.now() - roundStartRef.current) / 1000))
        : 1;
      nextRoundAnswers = [
        ...nextRoundAnswers.filter((answer) => answer.wordId !== activeQuestion.wordId),
        {
          wordId: activeQuestion.wordId,
          score: currentScore,
          duration,
        },
      ];
      setRoundAnswers(nextRoundAnswers);
    }

    if (questionIndex >= roundQuestions.length - 1) {
      void saveCurrentRound(nextRoundAnswers);
      return;
    }

    resetQuestionAnswer();
    setQuestionIndex((current) => current + 1);
    roundStartRef.current = Date.now();
    setStep("exercise");
  }, [activeQuestion, currentScore, questionIndex, resetQuestionAnswer, roundAnswers, roundQuestions.length, saveCurrentRound]);

  const retryCurrentQuestion = useCallback(() => {
    if (!activeQuestion) {
      return;
    }

    setRoundAnswers((current) =>
      current.filter((answer) => answer.wordId !== activeQuestion.wordId),
    );
    resetQuestionAnswer();
    roundStartRef.current = Date.now();
    setStep("exercise");
  }, [activeQuestion, resetQuestionAnswer]);

  const retryCurrentQuiz = useCallback(() => {
    resetQuiz();
  }, [resetQuiz]);

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

  const isPerfectSummary = step === "summary" && finalScore === 100;
  const shouldShowRewardSequence =
    isPerfectSummary && !completedBeforeSessionRef.current && pointsDelta > 0;
  const shouldShowReaffirmedResult = isPerfectSummary && completedBeforeSessionRef.current;

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
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
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
          <div className="shrink-0 overflow-hidden rounded-t-3xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-accent to-accent-hover px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold leading-tight text-content-inverted">
                  Quiz de Vocabulario
                </h2>
                <p className="text-xs font-medium text-white/70">
                  {step === "summary" || step === "error"
                    ? getNodeTitle(item)
                    : `${VOCABULARY_QUIZ_TYPE_LABELS[currentType]} · ${getNodeTitle(item)}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {step !== "summary" && step !== "error" ? (
                  <RoundDots current={currentType} question={question} results={roundResults} quizTypes={quizTypes} />
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
                    ? `Guardando ${VOCABULARY_QUIZ_TYPE_LABELS[currentType].toLowerCase()}...`
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
                    {currentType === "meaning" ? (
                      <div className="mt-3 space-y-2.5">
                        <div className="rounded-2xl border border-border-subtle bg-surface-primary px-4 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-content-tertiary">
                            {getMeaningPromptPrimaryLabel(activeQuestion)}
                          </p>
                          <p className="mt-2 text-4xl font-black leading-none text-content-primary">
                            {getMeaningPromptWriting(activeQuestion)}
                          </p>
                        </div>

                        {getMeaningPromptReading(activeQuestion) ? (
                          <div className="rounded-2xl border border-border-subtle bg-surface-primary/75 px-4 py-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-content-tertiary">
                              Hiragana
                            </p>
                            <p className="mt-1.5 text-lg font-bold leading-tight text-content-secondary">
                              {getMeaningPromptReading(activeQuestion)}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : currentType === "writing" ? (
                      <WritingSymbolText
                        text={getQuizPromptTitle(activeQuestion, currentType)}
                        className="mt-2 block text-4xl font-black leading-none text-content-primary jp-text"
                      />
                    ) : (
                      <p className="mt-2 text-4xl font-black leading-none text-content-primary">
                        {getQuizPromptTitle(activeQuestion, currentType)}
                      </p>
                    )}
                    <p className="mt-3 text-sm font-medium text-content-secondary">
                      {getRoundInstruction(currentType)}
                    </p>
                    {currentType !== "meaning" && getQuizPromptSupport(activeQuestion, currentType) ? (
                      <p className="mt-2 text-xs font-medium text-content-tertiary">
                        {getQuizPromptSupport(activeQuestion, currentType)}
                      </p>
                    ) : null}

                    {audioSrc && currentType === "listening" ? (
                      <QuizAudioPlayer
                        key={`${activeQuestion.wordId}-${audioSrc}`}
                        audioUrl={audioSrc}
                      />
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
                              {getOptionLabel(option, currentType)}
                            </span>
                            {getOptionSecondary(option, currentType) ? (
                              <span className="mt-0.5 block text-xs font-medium text-content-tertiary">
                                {getOptionSecondary(option, currentType)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {currentType === "writing" && (
                    <div className="space-y-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {writingOptions.map((option, index) => {
                          const selected = selectedWritingOptionIndex === index;
                          const answered = step === "feedback";
                          const correct = getOptionCorrect(option);
                          const optionLabel = getOptionLabel(option, currentType);
                          const optionToneStyle = getWritingOptionToneStyle(optionLabel);
                          const symbolColorMode = !answered ? "hover" : "none";

                          return (
                            <button
                              key={`${activeQuestion.wordId}-writing-${optionLabel}-${index}`}
                              type="button"
                              disabled={answered}
                              onClick={() => {
                                setSelectedWritingOptionIndex(index);
                                setWritingTraceScore(null);
                              }}
                              style={optionToneStyle}
                              className={`group min-h-14 rounded-2xl border px-3 py-2 text-left transition disabled:cursor-default ${
                                selected && answered
                                  ? correct
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                                    : "border-accent bg-accent/10 text-accent"
                                  : answered && correct
                                    ? "border-emerald-400 bg-emerald-500/5 text-emerald-700"
                                    : selected
                                      ? "border-border-subtle bg-surface-secondary text-content-primary ring-1 ring-black/5 dark:ring-white/8"
                                      : "border-border-subtle bg-surface-primary text-content-primary hover:border-[color:var(--writing-option-border)] hover:bg-[color:var(--writing-option-soft)]"
                              }`}
                            >
                              <WritingSymbolText
                                text={optionLabel}
                                className="block text-lg font-black leading-tight jp-text"
                                colorMode={symbolColorMode}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {step === "feedback" && selectedWritingOption && getOptionCorrect(selectedWritingOption) ? (
                        <VocabularyWritingTraceExercise
                          key={`${activeQuestion.wordId}-${getOptionLabel(selectedWritingOption, currentType)}`}
                          option={selectedWritingOption}
                          disabled={false}
                          onComplete={setWritingTraceScore}
                        />
                      ) : step === "feedback" && selectedWritingOption ? (
                        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-5 text-center text-sm font-semibold text-content-muted">
                          La lectura seleccionada no coincide con esta palabra.
                        </div>
                      ) : selectedWritingOption ? (
                        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-5 text-center text-sm font-semibold text-content-muted">
                          Revisa tu respuesta para continuar.
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-secondary/70 px-4 py-6 text-center text-sm font-semibold text-content-muted">
                          Elige una lectura en hiragana.
                        </div>
                      )}
                    </div>
                  )}

                  {currentType === "speaking" && (
                    <VocabularySpeakingExercise
                      key={activeQuestion.wordId}
                      question={activeQuestion}
                      step={step}
                      onScoreChange={setSpeakingScore}
                    />
                  )}

                  {step === "exercise" && currentScore !== null && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={requestConfirmAnswer}
                      className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all"
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
                      {currentType === "writing" && selectedWritingOptionIsCorrect && currentScore < 100 ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={retryCurrentQuestion}
                          className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all"
                        >
                          Reintentar escritura
                        </motion.button>
                      ) : null}

                      {(!selectedWritingOptionIsCorrect || currentType !== "writing") && currentScore < 100 ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={retryCurrentQuiz}
                          className="w-full rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all"
                        >
                          Repetir quiz
                        </motion.button>
                      ) : null}

                      {currentType !== "writing" || currentScore === 100 || !selectedWritingOptionIsCorrect ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNextQuestion}
                          className={
                            currentScore < 100
                              ? "w-full rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3.5 text-sm font-bold text-content-secondary transition hover:bg-surface-tertiary"
                              : "w-full rounded-2xl bg-gradient-to-r from-accent to-accent-hover py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/15 transition-all"
                          }
                        >
                          {currentScore < 100
                            ? questionIndex >= roundQuestions.length - 1
                              ? hasNextRound && nextRoundType
                                ? `Continuar con ${VOCABULARY_QUIZ_TYPE_LABELS[nextRoundType].toLowerCase()}`
                                : "Ver resumen"
                              : "Siguiente palabra"
                            : questionIndex >= roundQuestions.length - 1
                              ? hasNextRound && nextRoundType
                                ? `Continuar con ${VOCABULARY_QUIZ_TYPE_LABELS[nextRoundType].toLowerCase()}`
                                : `Guardar ${VOCABULARY_QUIZ_TYPE_LABELS[currentType].toLowerCase()}`
                              : "Siguiente palabra"}
                        </motion.button>
                      ) : null}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {step === "summary" && shouldShowRewardSequence ? (
              <UnlockedMasterySequence
                title={getVocabularyResultTitle(currentType)}
                subtitle={`Resolviste los ${roundQuestions.length} ejercicios de ${VOCABULARY_QUIZ_TYPE_LABELS[currentType].toLowerCase()} con resultado perfecto.`}
                score={finalScore}
                symbol={getCelebrationSymbol(item)}
                pointsDelta={pointsDelta}
                onClose={onClose}
              />
            ) : null}

            {step === "summary" && shouldShowReaffirmedResult ? (
              <ReaffirmedMasteryResult
                title={getVocabularyReaffirmedTitle(currentType)}
                subtitle={`Volviste a resolver los ${roundQuestions.length} ejercicios de ${VOCABULARY_QUIZ_TYPE_LABELS[currentType].toLowerCase()} con dominio total.`}
                score={finalScore}
                primaryActionLabel="Repetir quiz"
                onRetry={retryCurrentQuiz}
                onClose={onClose}
              />
            ) : null}

            {step === "summary" && !shouldShowRewardSequence && !shouldShowReaffirmedResult ? (
              <VocabularyQuizSummary
                finalScore={finalScore}
                item={item}
                question={question}
                results={roundResults}
                quizTypes={quizTypes}
                userPoints={resultingUserPoints}
                pointsDelta={pointsDelta}
                onRetry={retryCurrentQuiz}
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

type VocabularyWritingStrokeUnit = {
  symbol: string;
  traceable: boolean;
  sourceIndex: number;
  viewBox: string;
  strokes: string[];
};

type VocabularyWritingStrokeResult = {
  validation: StrokeValidationResult;
  pointsDelta: number;
};

function useVocabularyCanvasSize(max: number, padding = 96) {
  const [size, setSize] = useState(max);

  useEffect(() => {
    const update = () => setSize(Math.min(max, Math.max(180, window.innerWidth - padding)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [max, padding]);

  return size;
}

function normalizeWritingStrokeUnits(
  units: VocabularyWritingOptionUnit[] | null | undefined,
) {
  return (units ?? []).map((unit, index): VocabularyWritingStrokeUnit => {
    if (unit.viewBox && unit.strokes?.length) {
      return {
        symbol: unit.symbol,
        traceable: unit.traceable ?? true,
        sourceIndex: index,
        viewBox: unit.viewBox,
        strokes: unit.strokes,
      };
    }

    const fallbackSymbol = getWritableKanaFallbackSymbol(unit.symbol);
    const fallback = getFallbackWritingStrokeData(unit.symbol) ??
      getMockKanaStrokes(unit.kanaId ?? unit.symbol, fallbackSymbol);
    return {
      symbol: unit.symbol,
      traceable: Boolean(fallback?.strokes?.length),
      sourceIndex: index,
      viewBox: fallback?.viewBox ?? "0 0 109 109",
      strokes: fallback?.strokes ?? [],
    };
  });
}

function getFallbackWritingStrokeData(symbol: string) {
  if (["ー", "ｰ", "─", "—", "―"].includes(symbol)) {
    return {
      viewBox: "0 0 109 109",
      strokes: ["M20,54.5C38,54.5 71,54.5 89,54.5"],
    };
  }

  return null;
}

function getWritableKanaFallbackSymbol(symbol: string) {
  const smallKanaFallbacks: Record<string, string> = {
    "ぁ": "あ",
    "ぃ": "い",
    "ぅ": "う",
    "ぇ": "え",
    "ぉ": "お",
    "っ": "つ",
    "ゃ": "や",
    "ゅ": "ゆ",
    "ょ": "よ",
    "ゎ": "わ",
    "ァ": "ア",
    "ィ": "イ",
    "ゥ": "ウ",
    "ェ": "エ",
    "ォ": "オ",
    "ッ": "ツ",
    "ャ": "ヤ",
    "ュ": "ユ",
    "ョ": "ヨ",
    "ヮ": "ワ",
  };

  return smallKanaFallbacks[symbol] ?? symbol;
}

function VocabularyWritingTraceExercise({
  option,
  disabled,
  onComplete,
}: {
  option: VocabularyQuizOption;
  disabled: boolean;
  onComplete: (score: number) => void;
}) {
  const canvasSize = useVocabularyCanvasSize(220);
  const displayUnits = useMemo(() => normalizeWritingStrokeUnits(option.units), [option.units]);
  const units = useMemo(
    () => displayUnits.filter((unit) => unit.traceable && unit.strokes.length > 0),
    [displayUnits],
  );
  const [unitIndex, setUnitIndex] = useState(0);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [strokeResults, setStrokeResults] = useState<VocabularyWritingStrokeResult[]>([]);
  const [lastFeedback, setLastFeedback] = useState<VocabularyWritingStrokeResult | null>(null);
  const [flashError, setFlashError] = useState(false);
  const [traceCompleted, setTraceCompleted] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionScheduledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
    };
  }, []);

  const activeUnit = units[unitIndex] ?? null;
  const totalStrokes = units.reduce((sum, unit) => sum + unit.strokes.length, 0);
  const completedStrokes = strokeResults.length;
  const missingStrokeData = units.length === 0 || totalStrokes === 0;

  const handleStrokeDrawn = useCallback(
    (stroke: DrawnStroke) => {
      if (!activeUnit || disabled) return;

      const refPath = activeUnit.strokes[strokeIndex];
      if (!refPath) return;

      const validation = validateStroke(stroke.points, refPath, activeUnit.viewBox);
      const pointsDelta = getPointsForFeedback(
        validation.feedback,
        VOCABULARY_WRITING_BASE_STROKE_POINTS,
      );
      const result: VocabularyWritingStrokeResult = { validation, pointsDelta };
      const nextResults = [...strokeResults, result];

      setStrokeResults(nextResults);
      setLastFeedback(result);

      if (validation.feedback === "poor" || validation.feedback === "miss") {
        setFlashError(true);
        if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
        feedbackTimeout.current = setTimeout(() => setFlashError(false), 400);
      }

      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setLastFeedback(null), 1200);

      const nextStrokeIndex = strokeIndex + 1;
      if (nextStrokeIndex < activeUnit.strokes.length) {
        setStrokeIndex(nextStrokeIndex);
        return;
      }

      const nextUnitIndex = unitIndex + 1;
      if (nextUnitIndex < units.length) {
        setUnitIndex(nextUnitIndex);
        setStrokeIndex(0);
        return;
      }

      if (completionScheduledRef.current) {
        return;
      }

      completionScheduledRef.current = true;
      setTraceCompleted(true);
      const totalScore = nextResults.reduce((sum, entry) => sum + entry.pointsDelta, 0);
      const maxScore = totalStrokes * VOCABULARY_WRITING_BASE_STROKE_POINTS;
      const scorePercent = maxScore > 0
        ? Math.round((Math.max(0, totalScore) / maxScore) * 100)
        : 0;

      setTimeout(() => onComplete(scorePercent), 350);
    },
    [activeUnit, disabled, onComplete, strokeIndex, strokeResults, totalStrokes, unitIndex, units.length],
  );

  if (missingStrokeData) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-5 text-center">
        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
          Trazos no disponibles para esta opción
        </p>
        <p className="mt-1 text-xs leading-relaxed text-content-muted">
          El backend necesita enviar los trazos de cada kana para poder evaluar escritura.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-content-tertiary">
            Traza la lectura seleccionada
          </p>
          <p className="mt-1 text-lg font-black leading-none text-content-primary jp-text">
            <WritingSymbolText text={getOptionLabel(option)} />
          </p>
        </div>
        <div className="rounded-full border border-border-subtle bg-surface-primary px-3 py-1 text-xs font-bold text-content-secondary">
          {completedStrokes}/{totalStrokes} trazos
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-semibold text-content-muted">
          Kana activo:{" "}
          <span className="text-content-primary jp-text">
            {activeUnit?.symbol}
          </span>
        </p>

        <div className={`relative rounded-2xl border-2 transition-colors ${flashError ? "border-red-400" : "border-border-subtle"}`}>
          {activeUnit ? (
            <KanaWritingCanvas
              key={`${getOptionLabel(option)}-${unitIndex}-${activeUnit.symbol}`}
              viewBox={activeUnit.viewBox}
              guideStrokes={activeUnit.strokes}
              activeStrokeIndex={strokeIndex}
              size={canvasSize}
              disabled={disabled || traceCompleted}
              flashError={flashError}
              hideActiveGuide
              onStrokeDrawn={handleStrokeDrawn}
            />
          ) : null}

          <AnimatePresence>
            {lastFeedback ? (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2"
              >
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 shadow-lg backdrop-blur-md ${getFeedbackColor(lastFeedback.validation.feedback)}`}>
                  <span className="text-sm font-bold">
                    {getFeedbackLabel(lastFeedback.validation.feedback)}
                  </span>
                  <span className="text-sm font-bold opacity-70">
                    +{lastFeedback.pointsDelta}
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5">
          {displayUnits.map((unit) => {
            const traceableIndex = units.findIndex(
              (candidate) => candidate.sourceIndex === unit.sourceIndex,
            );
            const isTraceable = traceableIndex >= 0;
            const isCompleted = isTraceable && traceableIndex < unitIndex;
            const isActive = isTraceable && traceableIndex === unitIndex;

            return (
              <span
                key={`${unit.symbol}-${unit.sourceIndex}`}
                className={`flex h-7 min-w-7 items-center justify-center rounded-lg border px-1.5 text-sm font-black jp-text ${
                  isCompleted
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-700"
                    : isActive
                      ? "border-accent bg-accent/10 text-accent"
                      : isTraceable
                        ? "border-border-subtle bg-surface-primary text-content-muted"
                        : "border-dashed border-border-subtle bg-surface-secondary text-content-tertiary"
                }`}
              >
                {unit.symbol}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoundDots({
  current,
  question,
  results,
  quizTypes,
}: {
  current: VocabularyAnswerType;
  question: VocabularyWordLesson;
  results: RoundResult[];
  quizTypes: VocabularyAnswerType[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      {quizTypes.map((type, index) => {
        const result = results.find((entry) => entry.type === type);
        const persisted = getQuizTypeProgress(question, type);
        const isDone = Boolean(result) || persisted.completed;
        const isCurrent = type === current;
        const isPerfect = (result?.score ?? persisted.score ?? 0) === 100;
        const shouldShowCurrentMarker = isCurrent && !isDone;
        const baseClasses = isDone
          ? isPerfect
            ? "h-6 w-6 bg-emerald-400 shadow-md shadow-emerald-400/30"
            : "h-6 w-6 bg-white/70"
          : shouldShowCurrentMarker
            ? "h-6 w-6 bg-white/90 ring-2 ring-white/40 ring-offset-1 ring-offset-transparent"
            : "h-4 w-4 bg-white/25";

        return (
          <motion.div
            key={type}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
            className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${baseClasses}`}
          >
            {isDone ? (
              <Check
                className={`h-3 w-3 ${isPerfect ? "text-white" : "text-accent"}`}
                strokeWidth={3}
              />
            ) : null}
            {shouldShowCurrentMarker ? <span className="block h-2 w-2 rounded-full bg-accent" /> : null}
            {isCurrent && isDone ? (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white/80 bg-accent shadow-sm shadow-accent/40" />
            ) : null}
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

function VocabularyRoundResultCard({
  type,
  score,
  delay,
}: {
  type: VocabularyAnswerType;
  score: number | null;
  delay: number;
}) {
  const isPerfect = score === 100;
  const isDone = score !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 220, damping: 18 }}
      className={[
        "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-all",
        isPerfect
          ? "bg-surface-primary"
          : isDone
            ? "border-border-subtle bg-surface-secondary"
            : "border-border-subtle bg-surface-tertiary opacity-40",
      ].join(" ")}
      style={
        isPerfect
          ? {
              borderColor: "var(--accent-muted)",
              background:
                "linear-gradient(135deg, var(--accent-subtle), transparent 72%)",
            }
          : undefined
      }
    >
      <span
        className={`text-[0.625rem] font-bold uppercase tracking-wider ${isPerfect ? "" : "text-content-muted"}`}
        style={isPerfect ? { color: "var(--accent)" } : undefined}
      >
        {VOCABULARY_QUIZ_TYPE_LABELS[type]}
      </span>
      {isDone ? (
        <span
          className="text-xl font-extrabold text-content-primary"
          style={isPerfect ? { color: "var(--accent)" } : undefined}
        >
          {score}%
        </span>
      ) : (
        <span className="text-xl font-extrabold text-content-muted">-</span>
      )}
      <span className="text-[0.6875rem] text-content-muted">
        {isPerfect ? "Perfecta" : isDone ? "Por mejorar" : "Pendiente"}
      </span>
    </motion.div>
  );
}

function VocabularyQuizSummary({
  finalScore,
  item,
  question,
  results,
  quizTypes,
  userPoints,
  pointsDelta,
  onRetry,
  onClose,
}: {
  finalScore: number;
  item: VocabularyGraphProgressItem;
  question: VocabularyWordLesson;
  results: RoundResult[];
  quizTypes: VocabularyAnswerType[];
  userPoints: number | null;
  pointsDelta: number;
  onRetry: () => void;
  onClose: () => void;
}) {
  const success = finalScore === 100;
  const completedTypes = quizTypes.filter((type) => {
    const result = results.find((round) => round.type === type);
    const persisted = getQuizTypeProgress(question, type);
    return (result?.score ?? persisted.score ?? 0) === 100;
  }).length;
  const totalQuizProgress = Math.max(
    getWordQuizProgressPercent(question),
    quizTypes.length > 0 ? Math.round((completedTypes / quizTypes.length) * 100) : 0,
  );
  const earnedPoints = pointsDelta > 0 && typeof userPoints === "number";
  const statusLabel = success ? "Aprobada" : "Requiere reintento";
  const subtitle = success
    ? `Completaste ${getNodeTitle(item).toLowerCase()} con todos los ejercicios correctos.`
    : `Este intento se guardo, pero necesitas 100 para completar ${getNodeTitle(item).toLowerCase()}.`;
  const scoreStyle = success ? { color: "var(--accent)" } : undefined;
  const accentPanelStyle = {
    backgroundColor: "var(--accent-subtle)",
    borderColor: "var(--accent-muted)",
    color: "var(--accent)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 py-4"
    >
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <p className="text-3xl font-black text-content-primary" style={scoreStyle}>
            {success ? "Quiz guardado correctamente" : "Resumen del intento"}
          </p>
          <p className="text-sm leading-6 text-content-secondary">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border-subtle pt-4">
          <div>
            <p className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-content-muted">
              Resultado
            </p>
            <p className="mt-1 text-4xl font-black text-content-primary" style={scoreStyle}>
              {finalScore}
              <span className="ml-1 text-base font-semibold text-content-muted">
                /100
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-content-muted">
              Estado
            </p>
            <p className="mt-1 text-sm font-bold text-content-primary" style={scoreStyle}>
              {statusLabel}
            </p>
            <p className="mt-1 text-sm text-content-secondary">
              {completedTypes} de {quizTypes.length} tipos perfectos
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          {quizTypes.map((type, index) => {
            const result = results.find((round) => round.type === type);
            const persisted = getQuizTypeProgress(question, type);
            const score = result?.score ?? persisted.score;

            return (
              <VocabularyRoundResultCard
                key={type}
                type={type}
                score={score}
                delay={0.12 + index * 0.05}
              />
            );
          })}
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-content-tertiary">
            <span>Progreso total del quiz</span>
            <span>{totalQuizProgress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
              initial={{ width: 0 }}
              animate={{ width: `${totalQuizProgress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>

        {earnedPoints ? (
          <div
            className="flex items-center gap-2.5 rounded-2xl border px-4 py-3"
            style={accentPanelStyle}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-hover text-white shadow-lg shadow-accent/15">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2m0 14v2"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                +{pointsDelta} puntos obtenidos
              </p>
              <p className="text-xs text-content-secondary">
                Total actual: {userPoints} pts
              </p>
            </div>
          </div>
        ) : null}

        {!earnedPoints && typeof userPoints === "number" ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-3 text-sm font-semibold text-content-primary">
            Puntos actuales: {userPoints}
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-3 text-sm font-black text-content-inverted shadow-lg shadow-accent/15 transition hover:shadow-xl hover:shadow-accent/20"
          >
            Repetir quiz
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary sm:min-w-32"
          >
            Cerrar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
