"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Kana, KanaStrokeData } from "@/features/kana/types";
import { getKanaStrokes } from "@/features/kana/api/kanaApi";
import { KanaStrokePlayer } from "./KanaStrokePlayer";
import { KanaWritingCanvas, type DrawnStroke } from "./KanaWritingCanvas";
import { getMockKanaStrokes } from "@/features/kana/mock/mockStrokeData";
import {
  validateStroke,
  getPointsForFeedback,
  getFeedbackLabel,
  getFeedbackColor,
  type StrokeValidationResult,
} from "@/features/kana/lib/strokeValidation";

type PracticeStep = "loading" | "demo" | "practice" | "result";

const BASE_STROKE_POINTS = 10;

function useCanvasSize(max: number, padding = 64): number {
  const [size, setSize] = useState(max);
  useEffect(() => {
    const update = () => setSize(Math.min(max, window.innerWidth - padding));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [max, padding]);
  return size;
}

interface StrokeResult {
  validation: StrokeValidationResult;
  pointsDelta: number;
}

interface KanaWritingPracticeModalProps {
  kana: Kana;
  onClose: () => void;
}

export function KanaWritingPracticeModal({
  kana,
  onClose,
}: KanaWritingPracticeModalProps) {
  const [step, setStep] = useState<PracticeStep>("loading");
  const [strokeData, setStrokeData] = useState<KanaStrokeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const demoSize = useCanvasSize(260, 80);
  const practiceSize = useCanvasSize(280, 64);
  const previewSize = useCanvasSize(140, 100);

  // Demo state
  const [demoStrokeIndex, setDemoStrokeIndex] = useState(0);
  const [demoAutoPlay, setDemoAutoPlay] = useState(false);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Practice state
  const [practiceStrokeIndex, setPracticeStrokeIndex] = useState(0);
  const [userStrokes, setUserStrokes] = useState<DrawnStroke[]>([]);
  const [strokeResults, setStrokeResults] = useState<StrokeResult[]>([]);
  const [lastFeedback, setLastFeedback] = useState<StrokeResult | null>(null);
  const [flashError, setFlashError] = useState(false);
  const startTime = useRef<number>(0);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const kanaTypeLabel = kana.kanaType === "hiragana" ? "Hiragana" : "Katakana";

  // ── Load stroke data ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getKanaStrokes(kana.id);
        if (!cancelled) {
          if (data.strokes.length === 0) {
            setError("No se encontraron trazos para este kana.");
            setStep("demo");
          } else {
            setStrokeData(data);
            setStep("demo");
          }
        }
      } catch {
        if (!cancelled) {
          // Fallback 1: use kana's own strokes if available
          if (kana.strokes && kana.strokes.length > 0) {
            setStrokeData({
              kanaId: kana.id,
              viewBox: kana.viewBox ?? "0 0 109 109",
              strokes: kana.strokes,
            });
            setStep("demo");
          } else {
            // Fallback 2: mock stroke data
            const mock = getMockKanaStrokes(kana.id, kana.symbol);
            if (mock) {
              setStrokeData(mock);
              setUsingMock(true);
              setStep("demo");
            } else {
              setError("No se pudieron cargar los trazos de este kana.");
              setStep("demo");
            }
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kana.id, kana.symbol, kana.strokes, kana.viewBox]);

  // ── Demo auto-play ──
  useEffect(() => {
    if (!demoAutoPlay || !strokeData) return;
    if (demoStrokeIndex >= strokeData.strokes.length) {
      setDemoAutoPlay(false);
      return;
    }
    demoTimer.current = setTimeout(() => {
      setDemoStrokeIndex((prev) => prev + 1);
    }, 800);
    return () => {
      if (demoTimer.current) clearTimeout(demoTimer.current);
    };
  }, [demoAutoPlay, demoStrokeIndex, strokeData]);

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  // ── Handlers ──
  const handleDemoNext = useCallback(() => {
    if (!strokeData) return;
    if (demoStrokeIndex < strokeData.strokes.length)
      setDemoStrokeIndex((prev) => prev + 1);
  }, [demoStrokeIndex, strokeData]);

  const handleDemoPrev = useCallback(() => {
    if (demoStrokeIndex > 0) setDemoStrokeIndex((prev) => prev - 1);
  }, [demoStrokeIndex]);

  const handleDemoRestart = useCallback(() => {
    setDemoStrokeIndex(0);
    setDemoAutoPlay(false);
  }, []);

  const handleStartPractice = useCallback(() => {
    setPracticeStrokeIndex(0);
    setUserStrokes([]);
    setStrokeResults([]);
    setLastFeedback(null);
    setFlashError(false);
    startTime.current = Date.now();
    setStep("practice");
  }, []);

  const handleStrokeDrawn = useCallback(
    (stroke: DrawnStroke) => {
      if (!strokeData) return;
      const refPath = strokeData.strokes[practiceStrokeIndex];
      const validation = validateStroke(
        stroke.points,
        refPath,
        strokeData.viewBox,
      );
      const pointsDelta = getPointsForFeedback(
        validation.feedback,
        BASE_STROKE_POINTS,
      );
      const result: StrokeResult = { validation, pointsDelta };

      setUserStrokes((prev) => [...prev, stroke]);
      setStrokeResults((prev) => [...prev, result]);
      setLastFeedback(result);

      if (validation.feedback === "poor" || validation.feedback === "miss") {
        setFlashError(true);
        if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
        feedbackTimeout.current = setTimeout(() => setFlashError(false), 400);
      }

      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setLastFeedback(null), 1200);

      const nextIdx = practiceStrokeIndex + 1;
      if (nextIdx >= strokeData.strokes.length) {
        setTimeout(() => setStep("result"), 500);
      } else {
        setPracticeStrokeIndex(nextIdx);
      }
    },
    [practiceStrokeIndex, strokeData],
  );

  const handleRetry = useCallback(() => {
    setPracticeStrokeIndex(0);
    setUserStrokes([]);
    setStrokeResults([]);
    setLastFeedback(null);
    setFlashError(false);
    startTime.current = Date.now();
    setStep("practice");
  }, []);

  const handleBackToDemo = useCallback(() => {
    setDemoStrokeIndex(0);
    setDemoAutoPlay(false);
    setStep("demo");
  }, []);

  // ── Derived values ──
  const totalStrokes = strokeData?.strokes.length ?? 0;
  const durationSec =
    startTime.current > 0
      ? ((Date.now() - startTime.current) / 1000).toFixed(1)
      : "0";

  const totalScore = useMemo(
    () => strokeResults.reduce((sum, r) => sum + r.pointsDelta, 0),
    [strokeResults],
  );
  const maxScore = totalStrokes * BASE_STROKE_POINTS;
  const scorePercent =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const resultGrade = useMemo(() => {
    if (scorePercent >= 90)
      return { label: "Excelente", color: "text-green-600" };
    if (scorePercent >= 70)
      return { label: "Bien hecho", color: "text-blue-600" };
    if (scorePercent >= 50)
      return { label: "Aceptable", color: "text-amber-600" };
    return { label: "Sigue practicando", color: "text-orange-600" };
  }, [scorePercent]);

  /* ── Framer-motion helpers ── */
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
    exit: { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.2 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.06,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        key="kana-writing-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={[
            "bg-white w-full shadow-2xl ring-1 ring-black/5 flex flex-col",
            step === "result" ? "max-w-3xl" : "max-w-lg",
            "rounded-3xl max-h-[95dvh]",
            "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-2rem)]",
            "max-sm:max-h-[92dvh] max-sm:rounded-3xl",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="shrink-0 rounded-t-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#993331] to-[#BA5149] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-bold text-white select-none">
                    {kana.symbol}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">
                    Práctica de Escritura
                  </h2>
                  <p className="text-xs text-white/70 font-medium">
                    {kanaTypeLabel} · {kana.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {usingMock && (
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                    DEMO
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
                  aria-label="Cerrar"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Step indicator */}
            <div className="bg-white border-b border-neutral-100 px-5 py-2.5 flex items-center justify-center gap-3">
              <StepPill
                number={1}
                label="Observar"
                active={step === "demo"}
                done={step === "practice" || step === "result"}
              />
              <div className="w-6 h-px bg-neutral-200" />
              <StepPill
                number={2}
                label="Practicar"
                active={step === "practice"}
                done={step === "result"}
              />
              <div className="w-6 h-px bg-neutral-200" />
              <StepPill
                number={3}
                label="Resultado"
                active={step === "result"}
                done={false}
              />
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto kanji-detail-scroll p-5 sm:p-6">
            {/* LOADING */}
            {step === "loading" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-neutral-100 rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-[#993331] rounded-full animate-spin" />
                </div>
                <p className="text-sm text-neutral-400 font-medium">
                  Cargando trazos…
                </p>
              </motion.div>
            )}

            {/* DEMO */}
            {step === "demo" && (
              <motion.div
                key="demo"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-5"
              >
                {error ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <p className="text-neutral-500 mb-4">{error}</p>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-semibold transition"
                    >
                      Cerrar
                    </button>
                  </div>
                ) : strokeData ? (
                  <>
                    <motion.p
                      custom={0}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="text-sm text-neutral-500 text-center max-w-[280px]"
                    >
                      Observa el orden de los trazos. Usa los controles o
                      reproducción automática.
                    </motion.p>

                    <motion.div
                      custom={1}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="relative bg-gradient-to-b from-[#993331]/[0.03] to-transparent rounded-2xl p-4 border border-neutral-100"
                    >
                      <KanaStrokePlayer
                        viewBox={strokeData.viewBox}
                        strokes={strokeData.strokes}
                        activeStrokeIndex={demoStrokeIndex}
                        showNumbers
                        size={demoSize}
                      />
                    </motion.div>

                    {/* Progress bar */}
                    <motion.div
                      custom={2}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="w-full max-w-[280px]"
                    >
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#993331] to-[#BA5149] rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${totalStrokes > 0 ? (Math.min(demoStrokeIndex, totalStrokes) / totalStrokes) * 100 : 0}%`,
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-neutral-400 text-center mt-1.5 font-medium">
                        Trazo{" "}
                        <span className="text-[#993331] font-bold">
                          {Math.min(demoStrokeIndex, totalStrokes)}
                        </span>{" "}
                        de {totalStrokes}
                      </p>
                    </motion.div>

                    {/* Controls */}
                    <motion.div
                      custom={3}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-1.5"
                    >
                      <IconButton
                        onClick={handleDemoRestart}
                        title="Reiniciar"
                        disabled={demoStrokeIndex === 0}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </IconButton>
                      <IconButton
                        onClick={handleDemoPrev}
                        title="Anterior"
                        disabled={demoStrokeIndex === 0}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </IconButton>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (demoAutoPlay) {
                            setDemoAutoPlay(false);
                          } else {
                            if (demoStrokeIndex >= totalStrokes)
                              setDemoStrokeIndex(0);
                            setDemoAutoPlay(true);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                          demoAutoPlay
                            ? "bg-[#993331] text-white shadow-md shadow-[#993331]/20"
                            : "bg-[#993331]/10 text-[#993331] hover:bg-[#993331]/20"
                        }`}
                      >
                        {demoAutoPlay ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                            Pausar
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Reproducir
                          </>
                        )}
                      </motion.button>
                      <IconButton
                        onClick={handleDemoNext}
                        title="Siguiente"
                        disabled={demoStrokeIndex >= totalStrokes}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </IconButton>
                    </motion.div>

                    {/* Start practice CTA */}
                    <motion.button
                      custom={4}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartPractice}
                      className="w-full max-w-[280px] py-3.5 bg-gradient-to-r from-[#993331] to-[#BA5149] text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-[#993331]/20 transition-all shadow-lg shadow-[#993331]/15 flex items-center justify-center gap-2.5 text-[15px]"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Comenzar a practicar
                    </motion.button>
                  </>
                ) : null}
              </motion.div>
            )}

            {/* PRACTICE */}
            {step === "practice" && strokeData && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-5"
              >
                <p className="text-sm text-neutral-500 text-center">
                  Dibuja el trazo{" "}
                  <span className="font-bold text-[#993331] text-base">
                    #{practiceStrokeIndex + 1}
                  </span>{" "}
                  de {totalStrokes}
                </p>

                <div className="relative w-full flex justify-center">
                  <div className="relative rounded-2xl border-2 border-neutral-100 bg-gradient-to-b from-neutral-50/50 to-white p-1 shadow-sm">
                    <KanaWritingCanvas
                      viewBox={strokeData.viewBox}
                      guideStrokes={strokeData.strokes}
                      activeStrokeIndex={practiceStrokeIndex}
                      onStrokeDrawn={handleStrokeDrawn}
                      size={practiceSize}
                      flashError={flashError}
                    />
                  </div>

                  <AnimatePresence>
                    {lastFeedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                        className={`absolute -top-3 -right-3 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-lg ${getFeedbackColor(lastFeedback.validation.feedback)}`}
                      >
                        {getFeedbackLabel(lastFeedback.validation.feedback)}
                        <span className="ml-1.5 opacity-70">
                          {lastFeedback.pointsDelta >= 0 ? "+" : ""}
                          {lastFeedback.pointsDelta}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 bg-neutral-50 rounded-xl px-4 py-2">
                  <svg
                    className="w-4 h-4 text-[#993331]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="text-sm font-bold text-neutral-700">
                    {totalScore}
                  </span>
                  <span className="text-xs text-neutral-400">
                    /{" "}
                    {practiceStrokeIndex * BASE_STROKE_POINTS +
                      BASE_STROKE_POINTS}{" "}
                    pts
                  </span>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {strokeData.strokes.map((_, i) => {
                    const sr = strokeResults[i];
                    let dotClass = "bg-neutral-200";
                    if (sr) {
                      if (
                        sr.validation.feedback === "perfect" ||
                        sr.validation.feedback === "good"
                      )
                        dotClass = "bg-emerald-500";
                      else if (sr.validation.feedback === "acceptable")
                        dotClass = "bg-amber-400";
                      else dotClass = "bg-red-400";
                    } else if (i === practiceStrokeIndex) {
                      dotClass =
                        "bg-[#993331] ring-2 ring-[#993331]/30 ring-offset-1";
                    }
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${dotClass}`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleBackToDemo}
                    className="px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
                  >
                    Ver demo
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRetry}
                    className="px-4 py-2.5 text-sm font-semibold text-[#993331] bg-[#993331]/10 hover:bg-[#993331]/20 rounded-xl transition"
                  >
                    Reiniciar
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* RESULT */}
            {step === "result" && strokeData && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-start md:gap-8 gap-5 py-2"
              >
                {/* ── Left column: Score + Grade + Stats + Actions ── */}
                <div className="flex flex-col items-center gap-5 md:flex-1 md:min-w-0">
                  {/* Score ring */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.15,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    className="relative"
                  >
                    <div
                      className={`absolute inset-[-8px] rounded-full blur-xl ${scorePercent >= 70 ? "bg-emerald-400/20" : scorePercent >= 50 ? "bg-amber-400/20" : "bg-[#993331]/15"}`}
                    />
                    <div className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center">
                      <svg
                        className="absolute inset-0 w-28 h-28 -rotate-90"
                        viewBox="0 0 112 112"
                      >
                        <circle
                          cx="56"
                          cy="56"
                          r="50"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="6"
                        />
                        <motion.circle
                          cx="56"
                          cy="56"
                          r="50"
                          fill="none"
                          stroke={
                            scorePercent >= 70
                              ? "#10b981"
                              : scorePercent >= 50
                                ? "#f59e0b"
                                : "#993331"
                          }
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                          animate={{
                            strokeDashoffset:
                              2 * Math.PI * 50 * (1 - scorePercent / 100),
                          }}
                          transition={{
                            delay: 0.3,
                            duration: 1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </svg>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-3xl font-extrabold text-neutral-900"
                      >
                        {scorePercent}
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-[10px] text-neutral-400 font-semibold -mt-0.5"
                      >
                        / 100
                      </motion.span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <h3
                      className={`text-xl font-extrabold mb-1 ${resultGrade.color}`}
                    >
                      {resultGrade.label}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Completaste los {totalStrokes} trazos de{" "}
                      <span className="font-bold text-neutral-800">
                        {kana.symbol}
                      </span>
                    </p>
                  </motion.div>

                  {/* Stats row */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-0 bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100"
                  >
                    <div className="text-center px-5 py-3">
                      <p className="text-lg font-extrabold text-neutral-900">
                        {totalStrokes}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-semibold">
                        Trazos
                      </p>
                    </div>
                    <div className="w-px h-10 bg-neutral-200" />
                    <div className="text-center px-5 py-3">
                      <p className="text-lg font-extrabold text-neutral-900">
                        {durationSec}s
                      </p>
                      <p className="text-[10px] text-neutral-400 font-semibold">
                        Tiempo
                      </p>
                    </div>
                    <div className="w-px h-10 bg-neutral-200" />
                    <div className="text-center px-5 py-3">
                      <p className="text-lg font-extrabold text-neutral-900">
                        {totalScore}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-semibold">
                        Puntos
                      </p>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col w-full max-w-[280px] gap-2.5"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRetry}
                      className="w-full py-3.5 bg-gradient-to-r from-[#993331] to-[#BA5149] text-white rounded-2xl font-bold shadow-lg shadow-[#993331]/15 hover:shadow-xl hover:shadow-[#993331]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Practicar de nuevo
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBackToDemo}
                      className="w-full py-3 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-2xl transition"
                    >
                      Ver demostración
                    </motion.button>
                    <button
                      onClick={onClose}
                      className="w-full py-2.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                </div>

                {/* ── Right column: Stroke details + Preview (desktop) ── */}
                <div className="flex flex-col items-center gap-5 md:flex-1 md:min-w-0">
                  {/* Preview */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="border border-neutral-100 rounded-2xl p-3 bg-neutral-50/50"
                  >
                    <KanaStrokePlayer
                      viewBox={strokeData.viewBox}
                      strokes={strokeData.strokes}
                      activeStrokeIndex={-1}
                      size={previewSize}
                    />
                  </motion.div>

                  {/* Per-stroke breakdown */}
                  {strokeResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="w-full max-w-[300px]"
                    >
                      <p className="text-xs font-bold text-neutral-400 mb-2.5 text-center uppercase tracking-wide">
                        Detalle por trazo
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {strokeResults.map((sr, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.65 + i * 0.04 }}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${getFeedbackColor(sr.validation.feedback)}`}
                          >
                            <span className="font-semibold">Trazo {i + 1}</span>
                            <span className="font-bold">
                              {getFeedbackLabel(sr.validation.feedback)}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Sub-components ──────────────────────────────────────────

function StepPill({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
          active
            ? "bg-[#993331] text-white shadow-sm"
            : done
              ? "bg-[#993331]/20 text-[#993331]"
              : "bg-neutral-100 text-neutral-400"
        }`}
      >
        {done ? (
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          number
        )}
      </div>
      <span
        className={`text-xs font-semibold transition ${active ? "text-[#993331]" : done ? "text-neutral-500" : "text-neutral-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

function IconButton({
  onClick,
  title,
  disabled = false,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
    >
      {children}
    </button>
  );
}
