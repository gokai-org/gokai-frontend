"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Kanji, KanjiStrokeData } from "@/features/kanji/types";
import { getKanjiStrokes } from "@/features/kanji/api/kanjiApi";
import { getMockKanjiStrokes } from "@/features/kanji/mock/mockStrokeData";
import { KanjiStrokePlayer } from "./KanjiStrokePlayer";
import { KanjiWritingCanvas, type DrawnStroke } from "./KanjiWritingCanvas";
import { getPrimaryMeaning } from "@/features/kanji/utils/kanjiText";
import {
  validateStroke,
  getPointsForFeedback,
  getFeedbackLabel,
  getFeedbackColor,
  type StrokeValidationResult,
} from "@/features/kanji/lib/strokeValidation";

type PracticeStep = "loading" | "demo" | "practice" | "result";

/** Points awarded per perfect stroke. */
const BASE_STROKE_POINTS = 10;

/** Returns a clamped canvas/player size that fits the current viewport. */
function useCanvasSize(max: number, padding = 64): number {
  const [size, setSize] = useState(max);
  useEffect(() => {
    const update = () =>
      setSize(Math.min(max, window.innerWidth - padding));
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

interface WritingPracticeModalProps {
  kanji: Kanji;
  onClose: () => void;
}

export function WritingPracticeModal({
  kanji,
  onClose,
}: WritingPracticeModalProps) {
  const [step, setStep] = useState<PracticeStep>("loading");
  const [strokeData, setStrokeData] = useState<KanjiStrokeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  // Responsive canvas sizes
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

  // ── Load stroke data (with mock fallback) ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getKanjiStrokes(kanji.id);
        if (!cancelled) {
          setStrokeData(data);
          setStep("demo");
        }
      } catch {
        if (!cancelled) {
          const mock = getMockKanjiStrokes(kanji.id, kanji.symbol);
          if (mock) {
            setStrokeData(mock);
            setUsingMock(true);
            setStep("demo");
          } else {
            setError("No se pudieron cargar los trazos de este kanji.");
            setStep("demo");
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kanji.id, kanji.symbol]);

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

  // Cleanup feedback timers
  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  // ── Handlers ──
  const handleDemoNext = useCallback(() => {
    if (!strokeData) return;
    if (demoStrokeIndex < strokeData.strokes.length) {
      setDemoStrokeIndex((prev) => prev + 1);
    }
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

      // Validate against reference path
      const refPath = strokeData.strokes[practiceStrokeIndex];
      const validation = validateStroke(
        stroke.points,
        refPath,
        strokeData.viewBox
      );
      const pointsDelta = getPointsForFeedback(
        validation.feedback,
        BASE_STROKE_POINTS
      );
      const result: StrokeResult = { validation, pointsDelta };

      setUserStrokes((prev) => [...prev, stroke]);
      setStrokeResults((prev) => [...prev, result]);
      setLastFeedback(result);

      // Flash red on poor / miss
      if (
        validation.feedback === "poor" ||
        validation.feedback === "miss"
      ) {
        setFlashError(true);
        if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
        feedbackTimeout.current = setTimeout(
          () => setFlashError(false),
          400
        );
      }

      // Clear feedback badge after 1.2s
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setLastFeedback(null), 1200);

      const nextIdx = practiceStrokeIndex + 1;
      if (nextIdx >= strokeData.strokes.length) {
        setTimeout(() => setStep("result"), 500);
      } else {
        setPracticeStrokeIndex(nextIdx);
      }
    },
    [practiceStrokeIndex, strokeData]
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
  const meaning = getPrimaryMeaning(kanji.meanings) || "";
  const durationSec =
    startTime.current > 0
      ? ((Date.now() - startTime.current) / 1000).toFixed(1)
      : "0";

  const totalScore = useMemo(
    () => strokeResults.reduce((sum, r) => sum + r.pointsDelta, 0),
    [strokeResults]
  );
  const maxScore = totalStrokes * BASE_STROKE_POINTS;
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const resultGrade = useMemo(() => {
    if (scorePercent >= 90) return { label: "Excelente", color: "text-green-600" };
    if (scorePercent >= 70) return { label: "Bien hecho", color: "text-blue-600" };
    if (scorePercent >= 50) return { label: "Aceptable", color: "text-amber-600" };
    return { label: "Sigue practicando", color: "text-orange-600" };
  }, [scorePercent]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
            <div
            className={[
                "bg-white w-full overflow-y-auto shadow-2xl",
                "max-w-lg rounded-2xl max-h-[95dvh]",

                // Mobile: centrado con margen y redondeo (NO full-bleed)
                "max-sm:max-w-none max-sm:mx-auto max-sm:w-[calc(100vw-2rem)]",
                "max-sm:max-h-[92dvh] max-sm:rounded-2xl",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
            >
        {/* ── Header ── */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-5 py-3 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              {kanji.symbol}
            </span>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Practica de Escritura
              </h2>
              {meaning && (
                <p className="text-xs text-neutral-500">{meaning}</p>
              )}
              {usingMock && (
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">
                  DEMO (datos de ejemplo)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
            aria-label="Cerrar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-4 sm:p-5">
          {/* LOADING */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#993331] rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Cargando trazos...</p>
            </div>
          )}

          {/* DEMO */}
          {step === "demo" && (
            <div className="flex flex-col items-center gap-5">
              {error ? (
                <div className="text-center py-10">
                  <p className="text-neutral-500 mb-4">{error}</p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium transition"
                  >
                    Cerrar
                  </button>
                </div>
              ) : strokeData ? (
                <>
                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    <StepBadge active>1. Observar</StepBadge>
                    <StepBadge>2. Practicar</StepBadge>
                  </div>

                  <p className="text-sm text-neutral-500 text-center">
                    Observa el orden de los trazos. Usa los controles o
                    reproduccion automatica.
                  </p>

                  {/* SVG Player */}
                  <div className="relative w-full flex justify-center">
                    <KanjiStrokePlayer
                      viewBox={strokeData.viewBox}
                      strokes={strokeData.strokes}
                      activeStrokeIndex={demoStrokeIndex}
                      showNumbers
                      size={demoSize}
                    />
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-[260px]">
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#993331] rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            totalStrokes > 0
                              ? (Math.min(demoStrokeIndex, totalStrokes) /
                                  totalStrokes) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 text-center mt-1">
                      Trazo {Math.min(demoStrokeIndex, totalStrokes)} de{" "}
                      {totalStrokes}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={handleDemoRestart}
                      title="Reiniciar"
                      disabled={demoStrokeIndex === 0}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </IconButton>

                    <IconButton
                      onClick={handleDemoPrev}
                      title="Anterior"
                      disabled={demoStrokeIndex === 0}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </IconButton>

                    <button
                      onClick={() => {
                        if (demoAutoPlay) {
                          setDemoAutoPlay(false);
                        } else {
                          if (demoStrokeIndex >= totalStrokes) {
                            setDemoStrokeIndex(0);
                          }
                          setDemoAutoPlay(true);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                        demoAutoPlay
                          ? "bg-[#993331] text-white"
                          : "bg-[#993331]/10 text-[#993331] hover:bg-[#993331]/20"
                      }`}
                    >
                      {demoAutoPlay ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                          Pausar
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Reproducir
                        </>
                      )}
                    </button>

                    <IconButton
                      onClick={handleDemoNext}
                      title="Siguiente"
                      disabled={demoStrokeIndex >= totalStrokes}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </IconButton>
                  </div>

                  {/* Start practice */}
                  <button
                    onClick={handleStartPractice}
                    className="w-full max-w-[260px] py-3 bg-[#993331] text-white rounded-xl font-semibold hover:bg-[#882d2d] transition shadow-lg shadow-[#993331]/20 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Comenzar a practicar
                  </button>
                </>
              ) : null}
            </div>
          )}

          {/* PRACTICE */}
          {step === "practice" && strokeData && (
            <div className="flex flex-col items-center gap-5">
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <StepBadge>1. Observar</StepBadge>
                <StepBadge active>2. Practicar</StepBadge>
              </div>

              <p className="text-sm text-neutral-500 text-center">
                Dibuja el trazo{" "}
                <span className="font-bold text-[#993331]">
                  #{practiceStrokeIndex + 1}
                </span>{" "}
                de {totalStrokes}. Sigue la guia en rojo claro.
              </p>

              {/* Canvas with feedback overlay */}
              <div className="relative w-full flex justify-center">
                <KanjiWritingCanvas
                  viewBox={strokeData.viewBox}
                  guideStrokes={strokeData.strokes}
                  activeStrokeIndex={practiceStrokeIndex}
                  onStrokeDrawn={handleStrokeDrawn}
                  size={practiceSize}
                  flashError={flashError}
                />

                {/* Per-stroke feedback badge */}
                {lastFeedback && (
                  <div
                    className={`absolute -top-2 -right-2 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm animate-bounce-once ${getFeedbackColor(
                      lastFeedback.validation.feedback
                    )}`}
                  >
                    {getFeedbackLabel(lastFeedback.validation.feedback)}
                    <span className="ml-1 opacity-70">
                      {lastFeedback.pointsDelta >= 0 ? "+" : ""}
                      {lastFeedback.pointsDelta}
                    </span>
                  </div>
                )}
              </div>

              {/* Running score */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-neutral-400">Puntuacion:</span>
                <span className="font-bold text-neutral-900">
                  {totalScore} / {(practiceStrokeIndex) * BASE_STROKE_POINTS + BASE_STROKE_POINTS}
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                {strokeData.strokes.map((_, i) => {
                  const sr = strokeResults[i];
                  let dotColor = "bg-neutral-200";
                  if (sr) {
                    if (sr.validation.feedback === "perfect" || sr.validation.feedback === "good")
                      dotColor = "bg-green-500";
                    else if (sr.validation.feedback === "acceptable")
                      dotColor = "bg-amber-400";
                    else dotColor = "bg-red-400";
                  } else if (i === practiceStrokeIndex) {
                    dotColor = "bg-[#993331]/50 ring-2 ring-[#993331]/30";
                  }
                  return (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${dotColor}`}
                    />
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToDemo}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                >
                  Ver demo
                </button>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 text-sm font-medium text-[#993331] bg-[#993331]/10 hover:bg-[#993331]/20 rounded-lg transition"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === "result" && strokeData && (
            <div className="flex flex-col items-center gap-5 py-4">
              {/* Score circle */}
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
                    scorePercent >= 70 ? "bg-green-400/20" : scorePercent >= 50 ? "bg-amber-400/20" : "bg-orange-400/20"
                  }`}
                />
                <div className="relative w-24 h-24 bg-white border-2 border-neutral-200 rounded-full flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-neutral-900">
                    {totalScore}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    / {maxScore} pts
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h3 className={`text-xl font-bold mb-1 ${resultGrade.color}`}>
                  {resultGrade.label}
                </h3>
                <p className="text-sm text-neutral-500">
                  Completaste los {totalStrokes} trazos de{" "}
                  <span className="font-bold text-neutral-900">
                    {kanji.symbol}
                  </span>
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 sm:gap-4 bg-neutral-50 rounded-xl px-4 sm:px-5 py-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-neutral-900">
                    {totalStrokes}
                  </p>
                  <p className="text-[11px] text-neutral-500">Trazos</p>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-neutral-900">
                    {durationSec}s
                  </p>
                  <p className="text-[11px] text-neutral-500">Tiempo</p>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-neutral-900">
                    {scorePercent}%
                  </p>
                  <p className="text-[11px] text-neutral-500">Precision</p>
                </div>
              </div>

              {/* Per-stroke breakdown */}
              {strokeResults.length > 0 && (
                <div className="w-full max-w-[300px]">
                  <p className="text-xs font-semibold text-neutral-500 mb-2 text-center">
                    Detalle por trazo
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-1 sm:gap-1.5">
                    {strokeResults.map((sr, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${getFeedbackColor(
                          sr.validation.feedback
                        )}`}
                      >
                        <span className="font-medium">Trazo {i + 1}</span>
                        <span className="font-bold">
                          {getFeedbackLabel(sr.validation.feedback)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed kanji preview */}
              <div className="border border-neutral-200 rounded-xl p-2 sm:p-3">
                <KanjiStrokePlayer
                  viewBox={strokeData.viewBox}
                  strokes={strokeData.strokes}
                  activeStrokeIndex={-1}
                  size={previewSize}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col w-full max-w-[260px] gap-2">
                <button
                  onClick={handleRetry}
                  className="w-full py-3 bg-[#993331] text-white rounded-xl font-semibold hover:bg-[#882d2d] transition shadow-lg shadow-[#993331]/20"
                >
                  Practicar de nuevo
                </button>
                <button
                  onClick={handleBackToDemo}
                  className="w-full py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
                >
                  Ver demostracion
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-sm font-medium text-neutral-400 hover:text-neutral-600 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function StepBadge({
  active = false,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
        active
          ? "bg-[#993331] text-white"
          : "bg-neutral-100 text-neutral-400"
      }`}
    >
      {children}
    </span>
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
      className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
    >
      {children}
    </button>
  );
}
