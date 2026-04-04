"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import type {
  KanjiQuizResponse,
  KanjiQuizSessionState,
  KanjiQuizStep,
  KanjiQuizQuestionResult,
  KanjiQuizType,
  KanjiQuizRoundResult,
} from "@/features/kanji/types/quiz";
import type { Kanji, KanjiLessonResult } from "@/features/kanji/types";
import {
  QUIZ_QUESTIONS_PER_ROUND,
  QUIZ_TOTAL_ROUNDS,
} from "@/features/kanji/types/quiz";
import { submitKanjiQuiz } from "@/features/kanji/api/kanjiQuizApi";
import {
  getKanji,
  getKanjiLessonResults,
  getKanjiStrokes,
  listKanjis,
  submitKanjiLessonResult,
} from "@/features/kanji/api/kanjiApi";
import { getCurrentUser } from "@/features/auth/services/api";
import { safeRandomId } from "@/shared/lib/utils/safeRandomId";
import { isValidWritingQuestion } from "@/features/kanji/utils/quizParser";
import { buildFixedKanjiQuizRounds } from "@/features/kanji/lib/quizSessionBuilder";

const QUIZ_REVIEW_COMPLETION_SCORE = 70;
// The user must answer every round perfectly to earn the 30 points.
// Writing rounds are scored as 100 on completion (see completeWritingQuestion).
const QUIZ_REQUIRED_PERFECT_SCORE = 100;

function normalizeKanjis(payload: unknown): Kanji[] {
  if (Array.isArray(payload)) {
    return payload as Kanji[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as {
      kanjis?: unknown;
      items?: unknown;
      data?: unknown;
    };

    if (Array.isArray(candidate.kanjis)) return candidate.kanjis as Kanji[];
    if (Array.isArray(candidate.items)) return candidate.items as Kanji[];
    if (Array.isArray(candidate.data)) return candidate.data as Kanji[];
  }

  return [];
}

function normalizeResults(payload: unknown): KanjiLessonResult[] {
  if (Array.isArray(payload)) {
    return payload as KanjiLessonResult[];
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as {
      results?: unknown;
      data?: unknown;
      items?: unknown;
    };

    if (Array.isArray(candidate.results))
      return candidate.results as KanjiLessonResult[];
    if (Array.isArray(candidate.data))
      return candidate.data as KanjiLessonResult[];
    if (Array.isArray(candidate.items))
      return candidate.items as KanjiLessonResult[];
  }

  return [];
}

function uniqueKanjisById(kanjis: readonly Kanji[]): Kanji[] {
  const seen = new Set<string>();
  const next: Kanji[] = [];

  for (const kanji of kanjis) {
    if (!kanji?.id || seen.has(kanji.id)) continue;
    seen.add(kanji.id);
    next.push(kanji);
  }

  return next;
}

function getCatalogOrderKanjis(args: {
  allKanjis: Kanji[];
  currentKanji: Kanji;
}) {
  const { allKanjis, currentKanji } = args;
  const catalog = uniqueKanjisById([...allKanjis, currentKanji]);
  const currentIndex = catalog.findIndex(
    (kanji) => kanji.id === currentKanji.id,
  );

  return {
    catalog,
    currentIndex,
  };
}

function buildCompletedKanjiIds(
  results: readonly KanjiLessonResult[],
): Set<string> {
  const bestScoreByKanji = new Map<string, number>();

  for (const result of results) {
    const current = bestScoreByKanji.get(result.kanjiId) ?? 0;
    bestScoreByKanji.set(result.kanjiId, Math.max(current, result.score));
  }

  return new Set(
    [...bestScoreByKanji.entries()]
      .filter(([, score]) => score >= QUIZ_REVIEW_COMPLETION_SCORE)
      .map(([kanjiId]) => kanjiId),
  );
}

function buildLearnedKanjiSequence(args: {
  allKanjis: Kanji[];
  currentKanji: Kanji;
  completedIds: ReadonlySet<string>;
  userPoints: number;
}) {
  const { completedIds, currentKanji, userPoints } = args;
  const { catalog, currentIndex } = getCatalogOrderKanjis(args);

  let maxAccessibleIndex = -1;

  for (let index = 0; index < catalog.length; index += 1) {
    const kanji = catalog[index];
    if (completedIds.has(kanji.id) || kanji.pointsToUnlock <= userPoints) {
      maxAccessibleIndex = index;
    }
  }

  const boundedCatalog =
    maxAccessibleIndex >= 0
      ? catalog.slice(0, maxAccessibleIndex + 1)
      : [currentKanji];
  const learnedSequence = boundedCatalog.filter((kanji) =>
    completedIds.has(kanji.id),
  );
  const shouldIncludeCurrent =
    currentIndex >= 0 &&
    currentIndex === maxAccessibleIndex &&
    !completedIds.has(currentKanji.id) &&
    currentKanji.pointsToUnlock <= userPoints;

  if (!shouldIncludeCurrent) {
    return learnedSequence;
  }

  return uniqueKanjisById([...learnedSequence, currentKanji]);
}

function buildSmartQuizPool(args: {
  currentKanji: Kanji;
  allKanjis: Kanji[];
  learnedKanjis: Kanji[];
}): Kanji[] {
  const { currentKanji, allKanjis, learnedKanjis } = args;
  const COMPANIONS = QUIZ_QUESTIONS_PER_ROUND - 1; // 3

  const otherLearned = learnedKanjis.filter((k) => k.id !== currentKanji.id);

  if (otherLearned.length >= COMPANIONS) {
    return [currentKanji, ...otherLearned.slice(-COMPANIONS)];
  }

  const usedIds = new Set([currentKanji.id, ...otherLearned.map((k) => k.id)]);
  const stillNeeded = COMPANIONS - otherLearned.length;
  const fallback = allKanjis
    .filter((k) => !usedIds.has(k.id))
    .slice(0, stillNeeded);

  return [currentKanji, ...otherLearned, ...fallback];
}

const QUIZ_MIN_OPTION_POOL_SIZE = 12;

function buildQuizOptionPool(args: {
  currentKanji: Kanji;
  allKanjis: Kanji[];
  completedIds: ReadonlySet<string>;
  userPoints: number;
}): Kanji[] {
  const { currentKanji, completedIds, userPoints } = args;
  const { catalog } = getCatalogOrderKanjis(args);

  const accessibleByProgress = catalog.filter(
    (kanji) =>
      completedIds.has(kanji.id) ||
      kanji.pointsToUnlock <= userPoints ||
      kanji.id === currentKanji.id,
  );

  if (accessibleByProgress.length >= QUIZ_MIN_OPTION_POOL_SIZE) {
    return accessibleByProgress;
  }

  // The accessible pool is too small — pad with first base catalog kanjis.
  const accessibleIds = new Set(accessibleByProgress.map((k) => k.id));
  const needed = QUIZ_MIN_OPTION_POOL_SIZE - accessibleByProgress.length;
  const additional = catalog
    .filter((k) => !accessibleIds.has(k.id))
    .slice(0, needed);

  return [...accessibleByProgress, ...additional];
}

const INITIAL_STATE: KanjiQuizSessionState = {
  step: "loading",
  currentQuestionIndex: 0,
  selectedOptionIndex: null,
  isAnswered: false,
  questionResults: [],
  writingQuestionIndex: 0,
  writingPhase: "demo",
  writingScores: [],
};

export interface UseKanjiQuizReturn {
  state: KanjiQuizSessionState;
  quizData: KanjiQuizResponse | null;
  currentQuestion: KanjiQuizResponse["questions"][number] | null;
  totalQuestions: number;
  overallProgress: number;
  finalScore: number;
  duration: number;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  isPointsError: boolean;
  updatedPoints: number | null;
  pointsDelta: number;
  roundResults: KanjiQuizRoundResult[];
  currentRound: number;

  startQuiz: (kanjiId: string) => Promise<void>;
  selectOption: (optionIndex: number) => void;
  confirmAnswer: () => void;
  nextStep: () => void;
  setWritingPhase: (phase: "demo" | "practice" | "done") => void;
  completeWritingQuestion: (score: number) => void;
  reset: () => void;
}

export function useKanjiQuiz(): UseKanjiQuizReturn {
  const [state, setState] = useState<KanjiQuizSessionState>(INITIAL_STATE);
  const [quizData, setQuizData] = useState<KanjiQuizResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPointsError, setIsPointsError] = useState(false);
  const [updatedPoints, setUpdatedPoints] = useState<number | null>(null);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [roundResults, setRoundResults] = useState<KanjiQuizRoundResult[]>([]);

  const roundResultsRef = useRef<KanjiQuizRoundResult[]>([]);
  const roundStartTimeRef = useRef<number>(0);
  const kanjiIdRef = useRef<string>("");
  const quizPlanRef = useRef<KanjiQuizResponse[]>([]);
  const startingPointsRef = useRef<number | null>(null);
  // Prevents concurrent / duplicate calls to submitResults (StrictMode safety)
  const submittingRef = useRef(false);

  // Always-current state ref — safe to read in callbacks without stale closures
  const stateRef = useRef(state);
  stateRef.current = state;
  // Always-current quizData ref
  const quizDataRef = useRef(quizData);
  quizDataRef.current = quizData;

  const currentRound = Math.min(
    QUIZ_TOTAL_ROUNDS,
    roundResultsRef.current.length + 1,
  );

  // ── Derived values ──
  const currentQuestion = useMemo(() => {
    if (!quizData) return null;
    if (quizData.type === "writing") {
      return quizData.questions[state.writingQuestionIndex] ?? null;
    }
    return quizData.questions[state.currentQuestionIndex] ?? null;
  }, [quizData, state.currentQuestionIndex, state.writingQuestionIndex]);

  const totalQuestions = useMemo(() => {
    if (!quizData) return 0;
    return quizData.questions.length;
  }, [quizData]);

  const overallProgress = useMemo(() => {
    if (totalQuestions === 0) return 0;
    if (state.step === "summary" || state.step === "celebration") return 100;
    if (quizData?.type === "writing") {
      return Math.round((state.writingQuestionIndex / totalQuestions) * 100);
    }
    const answered = state.questionResults.length;
    return Math.round((answered / totalQuestions) * 100);
  }, [
    totalQuestions,
    state.step,
    state.questionResults.length,
    state.writingQuestionIndex,
    quizData,
  ]);

  const finalScore = useMemo(() => {
    if (roundResults.length >= QUIZ_TOTAL_ROUNDS) {
      return Math.round(
        roundResults.reduce((sum, result) => sum + result.score, 0) /
          roundResults.length,
      );
    }
    if (quizData?.type === "writing") {
      if (state.writingScores.length === 0) return 0;
      const total = state.writingScores.reduce((sum, s) => sum + s, 0);
      return Math.round(total / state.writingScores.length);
    }
    if (state.questionResults.length === 0) return 0;
    const correct = state.questionResults.filter((r) => r.correct).length;
    return Math.round((correct / state.questionResults.length) * 100);
  }, [quizData, roundResults, state.questionResults, state.writingScores]);

  const duration = useMemo(() => {
    if (roundStartTimeRef.current === 0) return 0;
    return Math.round((Date.now() - roundStartTimeRef.current) / 1000);
  }, [state.step]);

  const loadRoundFromPlan = useCallback((roundIndex: number) => {
    const nextRound = quizPlanRef.current[roundIndex] ?? null;

    if (!nextRound) {
      setError("No se pudo preparar el siguiente ejercicio del quiz");
      setState((s) => ({ ...s, step: "error" as KanjiQuizStep }));
      setLoading(false);
      return;
    }

    setError(null);
    setQuizData(nextRound);
    setState({
      ...INITIAL_STATE,
      step: "exercise",
      writingPhase: nextRound.type === "writing" ? "demo" : "demo",
    });
    roundStartTimeRef.current = Date.now();
    setLoading(false);
  }, []);

  // ── Start quiz (resets full session) ──
  const startQuiz = useCallback(
    async (kanjiId: string) => {
      setLoading(true);
      setError(null);
      setState(INITIAL_STATE);
      setQuizData(null);
      setIsPointsError(false);
      setUpdatedPoints(null);
      setPointsDelta(0);
      roundResultsRef.current = [];
      setRoundResults([]);
      kanjiIdRef.current = kanjiId;

      try {
        const [user, kanji, strokeData, kanjiPayload, resultsPayload] =
          await Promise.all([
            getCurrentUser().catch(() => null),
            getKanji(kanjiId),
            getKanjiStrokes(kanjiId).catch(() => null),
            listKanjis().catch(() => []),
            getKanjiLessonResults({ limit: 500 }).catch(() => []),
          ]);

        startingPointsRef.current =
          typeof user?.points === "number" ? user.points : null;

        const allKanjis = normalizeKanjis(kanjiPayload);
        const lessonResults = normalizeResults(resultsPayload);
        const completedIds = buildCompletedKanjiIds(lessonResults);
        const learnedKanjis = buildLearnedKanjiSequence({
          currentKanji: kanji,
          allKanjis,
          completedIds,
          userPoints: typeof user?.points === "number" ? user.points : 0,
        });
        // ── Determine quiz depth based on catalog position ──────────────────
        // Kanjis #1–#4 (index 0–3): intro mode — 1 question per type, only the
        // current kanji as source so every exercise is unambiguously about it.
        // Kanji #5+ (index 4+): full review — 4 questions per type drawn from
        // the pool of already-learned kanjis.
        const catalogIndex = allKanjis.findIndex((k) => k.id === kanji.id);
        const isEarlyKanji = catalogIndex >= 0 && catalogIndex < 4;

        const quizSourcePool = isEarlyKanji
          ? [kanji]
          : buildSmartQuizPool({
              currentKanji: kanji,
              allKanjis,
              learnedKanjis,
            });
        const questionCount = isEarlyKanji ? 1 : QUIZ_QUESTIONS_PER_ROUND;

        const optionSourcePool = buildQuizOptionPool({
          currentKanji: kanji,
          allKanjis,
          completedIds,
          userPoints: typeof user?.points === "number" ? user.points : 0,
        });

        const strokeEntries = await Promise.all(
          quizSourcePool.map(async (quizKanji) => {
            if (quizKanji.id === kanji.id) {
              return [quizKanji.id, strokeData] as const;
            }

            const reviewStrokeData = await getKanjiStrokes(quizKanji.id).catch(
              () => null,
            );
            return [quizKanji.id, reviewStrokeData] as const;
          }),
        );

        const strokeByKanjiId = new Map(strokeEntries);

        quizPlanRef.current = buildFixedKanjiQuizRounds(
          quizSourcePool.map((quizKanji) => ({
            kanji: quizKanji,
            strokeData: strokeByKanjiId.get(quizKanji.id) ?? null,
          })),
          {
            seedHint: kanjiId,
            questionCount,
            optionSources: optionSourcePool.map((quizKanji) => ({
              kanji: quizKanji,
            })),
          },
        );
        loadRoundFromPlan(0);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al cargar el quiz";
        const is403 =
          msg.includes("403") || msg.toLowerCase().includes("puntos");
        setIsPointsError(is403);
        setError(
          is403
            ? "No se tienen los puntos necesarios para este ejercicio"
            : msg,
        );
        setState((s) => ({ ...s, step: "error" as KanjiQuizStep }));
        setLoading(false);
      }
    },
    [loadRoundFromPlan],
  );

  const finalizeQuiz = useCallback(async (results: KanjiQuizRoundResult[]) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    setSubmitting(true);
    setState((s) => ({ ...s, step: "submitting" as KanjiQuizStep }));

    const overallScore = Math.round(
      results.reduce((sum, result) => sum + result.score, 0) / results.length,
    );

    // Only award points and show celebration when the user answered every
    // round perfectly (score === 100). A single wrong MCQ answer sends the
    // user to the summary screen without points.
    if (overallScore !== QUIZ_REQUIRED_PERFECT_SCORE) {
      setPointsDelta(0);
      setUpdatedPoints(startingPointsRef.current);
      setSubmitting(false);
      submittingRef.current = false;
      setState((s) => ({ ...s, step: "summary" as KanjiQuizStep }));
      return;
    }

    try {
      // If the starting points baseline was never captured (e.g. the initial
      // getCurrentUser call failed), lock it in now so the delta is accurate.
      if (startingPointsRef.current === null) {
        try {
          const user = await getCurrentUser();
          if (user && typeof user.points === "number") {
            startingPointsRef.current = user.points;
          }
        } catch {
          // Non-critical — delta will be 0 but celebration still shows
        }
      }

      let respBalance: number | null = null;
      try {
        for (const result of results) {
          const resp = await submitKanjiQuiz(kanjiIdRef.current, {
            type: result.type,
            score: result.score,
            duration: result.duration,
          });
          // The study backend may return the updated balance in the response.
          // Common field names: totalPoints, newBalance, balance, points.
          const anyResp = resp as Record<string, unknown>;
          const bal =
            anyResp.totalPoints ??
            anyResp.newBalance ??
            anyResp.balance ??
            anyResp.points ??
            null;
          if (typeof bal === "number") {
            respBalance = bal;
          }
        }
      } catch (quizSubmitErr) {
        console.error(
          "[QUIZ] Failed to submit round to study service:",
          quizSubmitErr,
        );
      }

      try {
        const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
        const lessonAnswers = results.map((r) => ({
          exerciseType: (r.type === "writing" ? "writing" : "meaning") as
            | "writing"
            | "meaning",
          points: r.score,
          duration: r.duration,
          isCorrect: true,
        }));
        const lessonResp = await submitKanjiLessonResult({
          lessonId: safeRandomId(),
          kanjiId: kanjiIdRef.current,
          mode: "reading",
          score: 100,
          duration: totalDuration,
          totalExercises: results.length,
          correctExercises: results.length,
          answers: lessonAnswers,
        });
        // If the lesson response includes updated balance, use it.
        const anyLesson = lessonResp as Record<string, unknown>;
        const lessonBal =
          anyLesson.totalPoints ??
          anyLesson.newBalance ??
          anyLesson.balance ??
          anyLesson.points ??
          null;
        if (typeof lessonBal === "number") {
          respBalance = lessonBal;
        }
      } catch (lessonErr) {
        // Non-critical: log but do not block the celebration screen.
        console.error(
          "[QUIZ] Failed to submit lesson result for points:",
          lessonErr,
        );
      }

      let nextPoints: number | null = null;

      // 1st attempt: trust the submission response if it carried a balance.
      if (respBalance !== null) {
        nextPoints = respBalance;
        setUpdatedPoints(respBalance);
      }

      // 2nd attempt: query the user service.
      if (nextPoints === null) {
        try {
          const user = await getCurrentUser();
          if (user && typeof user.points === "number") {
            nextPoints = user.points;
            setUpdatedPoints(user.points);
          }
        } catch {
          // Non-critical
        }
      }

      // 3rd attempt: if the user service returned the same (or lower) balance,
      // the study backend may still be propagating the award asynchronously.
      // Wait 800 ms and retry once.
      if (
        nextPoints === null ||
        (startingPointsRef.current !== null &&
          nextPoints <= startingPointsRef.current)
      ) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 800);
        });
        try {
          const user = await getCurrentUser();
          if (user && typeof user.points === "number") {
            nextPoints = user.points;
            setUpdatedPoints(user.points);
          }
        } catch {
          // Non-critical
        }
      }

      const nextPointsDelta =
        nextPoints !== null && startingPointsRef.current !== null
          ? Math.max(0, nextPoints - startingPointsRef.current)
          : 0;

      setPointsDelta(nextPointsDelta);
      setState((s) => ({ ...s, step: "celebration" as KanjiQuizStep }));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al enviar resultado";
      setError(msg);
      setState((s) => ({ ...s, step: "error" as KanjiQuizStep }));
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, []);

  const completeRound = useCallback(
    (quizType: KanjiQuizType, score: number) => {
      const elapsed = Math.round(
        (Date.now() - roundStartTimeRef.current) / 1000,
      );
      const newRoundResults: KanjiQuizRoundResult[] = [
        ...roundResultsRef.current,
        { type: quizType, score, duration: elapsed },
      ];

      roundResultsRef.current = newRoundResults;
      setRoundResults(newRoundResults);

      if (newRoundResults.length >= QUIZ_TOTAL_ROUNDS) {
        void finalizeQuiz(newRoundResults);
        return;
      }

      loadRoundFromPlan(newRoundResults.length);
    },
    [finalizeQuiz, loadRoundFromPlan],
  );

  // ── Select option ──
  const selectOption = useCallback((optionIndex: number) => {
    setState((s) => {
      if (s.isAnswered) return s;
      return { ...s, selectedOptionIndex: optionIndex };
    });
  }, []);

  // ── Confirm answer (show feedback) ──
  const confirmAnswer = useCallback(() => {
    setState((s) => {
      if (s.selectedOptionIndex === null || s.isAnswered) return s;
      return {
        ...s,
        isAnswered: true,
        step: "exercise-feedback" as KanjiQuizStep,
      };
    });
  }, []);

  // ── Next step ──
  // Uses stateRef / quizDataRef to avoid the functional-updater form.
  const nextStep = useCallback(() => {
    const s = stateRef.current;
    const qd = quizDataRef.current;
    if (!qd) return;

    const question = qd.questions[s.currentQuestionIndex];
    if (!question) return;

    const isCorrect =
      question.options[s.selectedOptionIndex ?? -1]?.correct ?? false;

    const newResults: KanjiQuizQuestionResult[] = [
      ...s.questionResults,
      { questionIndex: s.currentQuestionIndex, correct: isCorrect },
    ];

    const nextQ = s.currentQuestionIndex + 1;
    if (nextQ < qd.questions.length) {
      setState({
        ...s,
        step: "exercise" as KanjiQuizStep,
        currentQuestionIndex: nextQ,
        selectedOptionIndex: null,
        isAnswered: false,
        questionResults: newResults,
      });
      return;
    }

    // All questions in this round done
    const correct = newResults.filter((r) => r.correct).length;
    const score = Math.round((correct / newResults.length) * 100);

    setState({
      ...s,
      questionResults: newResults,
      step: "loading" as KanjiQuizStep,
    });
    completeRound(qd.type, score);
  }, [completeRound]);

  // ── Writing: set phase ──
  const setWritingPhase = useCallback((phase: "demo" | "practice" | "done") => {
    setState((s) => ({ ...s, writingPhase: phase }));
  }, []);

  // ── Writing: complete a single writing question ──
  // Also kept outside setState for the same StrictMode safety reason.
  const completeWritingQuestion = useCallback(
    (score: number) => {
      const s = stateRef.current;
      const qd = quizDataRef.current;
      if (!qd || qd.type !== "writing") return;

      const newScores = [...s.writingScores, score];
      const nextIdx = s.writingQuestionIndex + 1;

      if (nextIdx < qd.questions.length) {
        const nextQuestion = qd.questions[nextIdx];
        const hasValidStrokes = isValidWritingQuestion(nextQuestion);
        setState({
          ...s,
          writingScores: newScores,
          writingQuestionIndex: nextIdx,
          writingPhase: hasValidStrokes ? "demo" : "done",
        });
        return;
      }

      // All writing questions done.
      // Writing is a practice exercise: completion counts as 100% for scoring
      // purposes. Stroke-level accuracy feedback is shown to the user in real time
      // but does not gate the points award — that only depends on MCQ correctness.
      const completionScore = 100;

      setState({
        ...s,
        writingScores: newScores,
        writingPhase: "done",
        step: "loading" as KanjiQuizStep,
      });
      completeRound(qd.type, completionScore);
    },
    [completeRound],
  );

  // ── Reset ──
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setQuizData(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    setIsPointsError(false);
    setUpdatedPoints(null);
    setPointsDelta(0);
    roundResultsRef.current = [];
    setRoundResults([]);
    kanjiIdRef.current = "";
    quizPlanRef.current = [];
    startingPointsRef.current = null;
    roundStartTimeRef.current = 0;
    submittingRef.current = false;
  }, []);

  return {
    state,
    quizData,
    currentQuestion,
    totalQuestions,
    overallProgress,
    finalScore,
    duration,
    loading,
    error,
    submitting,
    isPointsError,
    updatedPoints,
    pointsDelta,
    roundResults,
    currentRound,
    startQuiz,
    selectOption,
    confirmAnswer,
    nextStep,
    setWritingPhase,
    completeWritingQuestion,
    reset,
  };
}
