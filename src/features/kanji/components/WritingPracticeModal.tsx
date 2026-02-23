"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Kanji, KanjiStrokeData } from "@/features/kanji/types";
import { getKanjiStrokes } from "@/features/kanji/api/kanjiApi";
import { KanjiStrokePlayer } from "./KanjiStrokePlayer";
import { KanjiWritingCanvas, type DrawnStroke } from "./KanjiWritingCanvas";
import { getPrimaryMeaning } from "@/features/kanji/utils/kanjiText";

type PracticeStep = "loading" | "demo" | "practice" | "result";

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

  // Demo state
  const [demoStrokeIndex, setDemoStrokeIndex] = useState(0);
  const [demoAutoPlay, setDemoAutoPlay] = useState(false);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Practice state
  const [practiceStrokeIndex, setPracticeStrokeIndex] = useState(0);
  const [userStrokes, setUserStrokes] = useState<DrawnStroke[]>([]);
  const startTime = useRef<number>(0);

  // ── Load stroke data ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getKanjiStrokes(kanji.id);
        if (!cancelled) {
          setStrokeData(data);
          setStep("demo");
        }
      } catch (e) {
        if (!cancelled) {
          setError("No se pudieron cargar los trazos de este kanji.");
          setStep("demo"); // show error in the demo panel
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kanji.id]);

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

  // ── Handlers ──
  const handleDemoNext = () => {
    if (!strokeData) return;
    if (demoStrokeIndex < strokeData.strokes.length) {
      setDemoStrokeIndex((prev) => prev + 1);
    }
  };

  const handleDemoPrev = () => {
    if (demoStrokeIndex > 0) setDemoStrokeIndex((prev) => prev - 1);
  };

  const handleDemoRestart = () => {
    setDemoStrokeIndex(0);
    setDemoAutoPlay(false);
  };

  const handleStartPractice = () => {
    setPracticeStrokeIndex(0);
    setUserStrokes([]);
    startTime.current = Date.now();
    setStep("practice");
  };

  const handleStrokeDrawn = useCallback(
    (stroke: DrawnStroke) => {
      if (!strokeData) return;
      setUserStrokes((prev) => [...prev, stroke]);
      const nextIdx = practiceStrokeIndex + 1;
      if (nextIdx >= strokeData.strokes.length) {
        // All strokes done!
        setTimeout(() => setStep("result"), 400);
      } else {
        setPracticeStrokeIndex(nextIdx);
      }
    },
    [practiceStrokeIndex, strokeData]
  );

  const handleRetry = () => {
    setPracticeStrokeIndex(0);
    setUserStrokes([]);
    startTime.current = Date.now();
    setStep("practice");
  };

  const handleBackToDemo = () => {
    setDemoStrokeIndex(0);
    setDemoAutoPlay(false);
    setStep("demo");
  };

  const totalStrokes = strokeData?.strokes.length ?? 0;
  const meaning = getPrimaryMeaning(kanji.meanings) || "";
  const durationSec =
    startTime.current > 0
      ? ((Date.now() - startTime.current) / 1000).toFixed(1)
      : "0";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto shadow-2xl"
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
                Práctica de Escritura
              </h2>
              {meaning && (
                <p className="text-xs text-neutral-500">{meaning}</p>
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
        <div className="p-5">
          {/* LOADING */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-neutral-200 border-t-[#993331] rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Cargando trazos…</p>
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
                    reproducción automática.
                  </p>

                  {/* SVG Player */}
                  <div className="relative">
                    <KanjiStrokePlayer
                      viewBox={strokeData.viewBox}
                      strokes={strokeData.strokes}
                      activeStrokeIndex={demoStrokeIndex}
                      showNumbers
                      size={260}
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        demoAutoPlay
                          ? "bg-[#993331] text-white"
                          : "bg-[#993331]/10 text-[#993331] hover:bg-[#993331]/20"
                      }`}
                    >
                      {demoAutoPlay ? "⏸ Pausar" : "▶ Reproducir"}
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
                    className="w-full max-w-[260px] py-3 bg-[#993331] text-white rounded-xl font-semibold hover:bg-[#882d2d] transition shadow-lg shadow-[#993331]/20"
                  >
                    Comenzar a practicar ✍️
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
                de {totalStrokes}. Sigue la guía en rojo claro.
              </p>

              {/* Canvas */}
              <KanjiWritingCanvas
                viewBox={strokeData.viewBox}
                guideStrokes={strokeData.strokes}
                activeStrokeIndex={practiceStrokeIndex}
                onStrokeDrawn={handleStrokeDrawn}
                size={280}
              />

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {strokeData.strokes.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      i < practiceStrokeIndex
                        ? "bg-[#993331]"
                        : i === practiceStrokeIndex
                        ? "bg-[#993331]/50 ring-2 ring-[#993331]/30"
                        : "bg-neutral-200"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToDemo}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition"
                >
                  ← Ver demo
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
              {/* Success animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  ¡Bien hecho!
                </h3>
                <p className="text-sm text-neutral-500">
                  Completaste los {totalStrokes} trazos de{" "}
                  <span className="font-bold text-neutral-900">
                    {kanji.symbol}
                  </span>
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 bg-neutral-50 rounded-xl px-6 py-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {totalStrokes}
                  </p>
                  <p className="text-xs text-neutral-500">Trazos</p>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">
                    {durationSec}s
                  </p>
                  <p className="text-xs text-neutral-500">Tiempo</p>
                </div>
              </div>

              {/* Completed kanji preview */}
              <div className="border border-neutral-200 rounded-xl p-3">
                <KanjiStrokePlayer
                  viewBox={strokeData.viewBox}
                  strokes={strokeData.strokes}
                  activeStrokeIndex={-1}
                  size={160}
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
                  Ver demostración
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
