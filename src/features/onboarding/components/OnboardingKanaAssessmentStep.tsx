"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle2,
  Crown,
  Gem,
  PenTool,
  Sparkles,
} from "lucide-react";
import type { KanaExamResult, KanaType } from "@/features/kana/types";
import type {
  OnboardingKanaAssessmentSelections,
  OnboardingKanaKnowledgeChoice,
} from "@/features/onboarding/types";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";

type OnboardingKanaAssessmentStepProps = {
  selections: OnboardingKanaAssessmentSelections;
  results: Partial<Record<KanaType, KanaExamResult>>;
  currentKanaPoints: number;
  busy?: boolean;
  skipIntroTransition?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSelect: (kanaType: KanaType, choice: OnboardingKanaKnowledgeChoice) => void;
};

const SHOGI_PATH = "M 33 5 Q 40 0 47 5 L 73 26 Q 80 31 80 39 L 80 86 Q 80 96 69 96 L 11 96 Q 0 96 0 86 L 0 39 Q 0 31 7 26 Z";
const SHOGI_MASK_IMAGE = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 80 96\"><path fill=\"white\" d=\"${SHOGI_PATH}\"/></svg>`)}")`;

export function OnboardingKanaAssessmentStep({
  selections,
  results,
  busy = false,
  skipIntroTransition = false,
  onBack,
  onContinue,
  onSelect,
}: OnboardingKanaAssessmentStepProps) {
  const platformMotion = usePlatformMotion();
  const answersReady = selections.hiragana !== null && selections.katakana !== null;
  const hasHiraganaApproved = results.hiragana?.passed === true;
  const canSelectKatakanaExam = hasHiraganaApproved || selections.hiragana === "exam";
  const canContinue = answersReady && !busy;
  const primaryLabel = "Continuar";
  const introDelayMs = !skipIntroTransition && platformMotion.shouldAnimate
    ? Math.max(3200, Math.round(4300 * platformMotion.durationScale))
    : 0;
  const [phase, setPhase] = useState<"intro" | "choices">(
    introDelayMs === 0 ? "choices" : "intro",
  );

  useEffect(() => {
    if (skipIntroTransition || introDelayMs === 0 || phase === "choices") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("choices");
    }, introDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [introDelayMs, phase, skipIntroTransition]);

  const introCopy = useMemo(
    () => ({
      title: "¿Conoces los alfabetos kana?",
      description: "Si ya los dominas, validamos tu nivel. Si no, empezamos desde cero.",
    }),
    [],
  );

  return (
    <div className="relative flex-1 overflow-hidden px-4 pb-8 sm:px-6 lg:px-16 lg:pb-10 xl:px-20">
      <GraphicField />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "intro" ? (
            <motion.div
              key="kana-intro"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, y: -24, filter: "blur(8px)" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-[70vh] flex-col items-center justify-center text-center"
            >
              <IntroSeal />
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-accent/10 bg-surface-primary/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-accent shadow-sm backdrop-blur-md"
              >
                Evaluación inicial
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.85 }}
                className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-content-primary sm:text-5xl"
              >
                {introCopy.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.95 }}
                className="mt-4 max-w-xl text-sm leading-relaxed text-content-tertiary sm:text-base"
              >
                {introCopy.description}
              </motion.p>
              <motion.div
                className="mt-8 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.7 }}
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="h-3 w-3 rounded-full bg-accent shadow-[0_0_16px_rgba(153,51,49,0.22)]"
                    animate={{
                      y: [0, -8, 0],
                      scale: [1, 1.45, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2.1,
                      repeat: Infinity,
                      delay: index * 0.24,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="kana-choices"
              initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-8"
            >
              <div className="max-w-2xl text-center sm:text-left">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-surface-primary/82 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-accent shadow-sm backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Selecciona tu punto de partida
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="mt-4 text-3xl font-black leading-tight tracking-tight text-content-primary md:text-5xl"
                >
                  Elige lo que ya conoces
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="mt-3 max-w-xl text-sm leading-relaxed text-content-secondary sm:text-base"
                >
                  Toca una pieza para decir si quieres examen o si prefieres empezar desde cero.
                </motion.p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
                <KanaKnowledgeBoardCard
                  kanaType="hiragana"
                  selection={selections.hiragana}
                  result={results.hiragana}
                  onSelect={onSelect}
                />
                <KanaKnowledgeBoardCard
                  kanaType="katakana"
                  selection={selections.katakana}
                  result={results.katakana}
                  disableExamSelection={!canSelectKatakanaExam}
                  onSelect={onSelect}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={busy}
                  className="inline-flex w-[170px] items-center justify-center gap-2 rounded-2xl bg-surface-primary/80 px-5 py-3 font-semibold text-content-primary shadow-lg transition hover:bg-surface-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Regresar
                </button>

                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!canContinue}
                  className="w-full rounded-2xl bg-accent px-6 py-3.5 font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {busy ? "Preparando..." : primaryLabel}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GraphicField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => ({
        id: index,
        size: 8 + (index % 4) * 4,
        left: `${6 + ((index * 9) % 84)}%`,
        top: `${8 + ((index * 13) % 76)}%`,
        duration: 8 + (index % 4) * 1.4,
        delay: index * 0.24,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-[12%] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
        animate={{ scale: [1, 1.12, 0.96, 1], opacity: [0.16, 0.28, 0.18, 0.16] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[8%] top-[36%] h-[220px] w-[220px] rounded-full bg-[#1B5078]/10 blur-3xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-surface-primary/18 blur-[1px] dark:bg-surface-primary/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -18, 0, 14, 0],
            x: [0, 8, -5, 3, 0],
            opacity: [0.14, 0.42, 0.18, 0.35, 0.14],
            scale: [1, 1.14, 0.96, 1.08, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function IntroSeal() {
  return (
    <div className="relative flex h-[190px] w-[190px] items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full bg-accent/12 blur-3xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.24, 0.46, 0.24] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-[156px] w-[156px] rounded-full border border-accent/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_16px_rgba(153,51,49,0.28)]" />
      </motion.div>
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-accent via-[#A83F3A] to-accent-hover shadow-[0_20px_60px_rgba(153,51,49,0.28)]"
        animate={{ y: [0, -5, 0], rotate: [0, 4, -4, 0] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Crown className="h-10 w-10 text-content-inverted" />
      </motion.div>
    </div>
  );
}

function KanaKnowledgeBoardCard({
  kanaType,
  selection,
  result,
  disableExamSelection = false,
  onSelect,
}: {
  kanaType: KanaType;
  selection: OnboardingKanaKnowledgeChoice | null;
  result?: KanaExamResult;
  disableExamSelection?: boolean;
  onSelect: (kanaType: KanaType, choice: OnboardingKanaKnowledgeChoice) => void;
}) {
  const config = kanaType === "katakana"
    ? {
        accent: "#1B5078",
        accentSoft: "rgba(27,80,120,0.14)",
        accentBorder: "rgba(27,80,120,0.24)",
        title: "Katakana",
        shortLabel: "Mahjong",
        symbol: "ア",
        boardLabel: "Sonidos modernos",
        shape: "mahjong" as const,
        icon: Gem,
      }
    : {
        accent: "#7B3F8A",
        accentSoft: "rgba(123,63,138,0.14)",
        accentBorder: "rgba(123,63,138,0.24)",
        title: "Hiragana",
        shortLabel: "Shōgi",
        symbol: "あ",
        boardLabel: "Base fonética del japonés",
        shape: "shogi" as const,
        icon: Crown,
      };

  const Icon = config.icon;
  const cardTone = result?.passed
    ? "passed"
    : selection === "exam"
      ? "selected"
      : selection === "learn"
        ? "muted"
        : "idle";
  const statusCopy = result?.passed
    ? `Aprobado ${result.score}%`
    : result
      ? `${result.score}%`
      : selection === "exam"
        ? "Haré examen"
        : selection === "learn"
          ? "Desde cero"
          : "Sin elegir";
  const pieceStyle = getBoardPieceStyle(config.shape);
  const pieceSymbolStyle = getBoardPieceSymbolStyle(config.shape);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-[34px] border border-border-default bg-surface-primary/88 shadow-[0_24px_70px_rgba(0,0,0,0.08)] backdrop-blur-md"
    >
      <div className="relative overflow-hidden border-b border-border-subtle px-5 py-5 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${config.accentSoft}, transparent 56%)`,
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-content-muted">
              {config.shortLabel}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-content-primary sm:text-[2rem]">
              {config.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-content-secondary">
              {config.boardLabel}
            </p>
          </div>

          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl sm:mx-0"
            style={{ background: config.accentSoft, border: `1px solid ${config.accentBorder}` }}
          >
            <Icon className="h-5 w-5" style={{ color: config.accent }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="order-2 flex flex-col gap-3 lg:order-1">
          <ChoiceOption
            title="Lo conozco"
            description="Quiero validar este alfabeto con examen."
            selected={selection === "exam"}
            accent={config.accent}
            disabled={disableExamSelection}
            hint={disableExamSelection ? "Primero marca Hiragana en examen." : undefined}
            onClick={() => onSelect(kanaType, "exam")}
          />
          <ChoiceOption
            title="Desde cero"
            description="Prefiero aprenderlo paso a paso."
            selected={selection === "learn"}
            accent={config.accent}
            onClick={() => onSelect(kanaType, "learn")}
            icon={PenTool}
          />
        </div>

        <div className="order-1 flex items-center justify-center lg:order-2">
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ duration: 0.28 }}
            className="relative flex h-[220px] w-full max-w-[220px] items-center justify-center sm:h-[240px] lg:h-[260px]"
          >
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ background: config.accentSoft }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.72, 0.45] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-[18px] rounded-full border"
              style={{ borderColor: config.accentBorder }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.9, 0.55] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10 flex items-center justify-center overflow-hidden" style={pieceStyle}>
              <span
                className="pointer-events-none absolute select-none font-black leading-none text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
                style={pieceSymbolStyle}
              >
                {config.symbol}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="border-t border-border-subtle bg-surface-secondary/58 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 text-center sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs font-semibold text-content-secondary">
            {getResultMessage(selection, result)}
          </p>
          <StatusChip tone={cardTone} label={statusCopy} />
        </div>
      </div>
    </motion.div>
  );
}

function getBoardPieceStyle(
  shape: "shogi" | "mahjong",
): CSSProperties {
  if (shape === "shogi") {
    return {
      width: 156,
      height: 188,
      background: "linear-gradient(160deg, #7B3F8A 0%, #A866B5 100%)",
      WebkitMaskImage: SHOGI_MASK_IMAGE,
      maskImage: SHOGI_MASK_IMAGE,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      boxShadow: "0 18px 54px rgba(0,0,0,0.18)",
    };
  }

  return {
    width: 140,
    height: 186,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "linear-gradient(165deg, #1B5078 0%, #2E82B5 100%)",
    boxShadow: "0 18px 54px rgba(0,0,0,0.18)",
  };
}

function getBoardPieceSymbolStyle(shape: "shogi" | "mahjong"): CSSProperties {
  if (shape === "shogi") {
    return {
      fontSize: "4.1rem",
      transform: "translateY(14px)",
    };
  }

  return {
    fontSize: "4.5rem",
    transform: "translateY(-2px)",
  };
}

function StatusChip({
  tone,
  label,
}: {
  tone: "passed" | "selected" | "muted" | "idle";
  label: string;
}) {
  const classes = tone === "passed"
    ? "bg-green-500/12 text-green-600 ring-green-500/20"
    : tone === "selected"
      ? "bg-accent/12 text-accent ring-accent/18"
      : tone === "muted"
        ? "bg-slate-500/10 text-content-secondary ring-border-subtle"
        : "bg-black/5 text-content-muted ring-border-subtle dark:bg-white/10";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ring-1 ${classes}`}>
      {tone === "passed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      {label}
    </span>
  );
}

function ChoiceOption({
  title,
  description,
  selected,
  accent,
  disabled = false,
  hint,
  onClick,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  selected: boolean;
  accent: string;
  disabled?: boolean;
  hint?: string;
  onClick: () => void;
  icon?: typeof Sparkles;
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -3, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      className={[
        "rounded-[24px] border p-4 text-left transition-all duration-300",
        selected
          ? "shadow-[0_18px_42px_rgba(153,51,49,0.16)]"
          : "bg-surface-primary/86 shadow-[0_10px_24px_rgba(0,0,0,0.05)]",
        disabled ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
      style={{
        borderColor: disabled
          ? "rgba(255,255,255,0.08)"
          : selected
            ? accent
            : "rgba(255,255,255,0.12)",
        background: disabled
          ? "rgba(255,255,255,0.02)"
          : selected
            ? `linear-gradient(180deg, ${accent} 0%, ${accent}DD 100%)`
            : undefined,
        color: selected ? "white" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold leading-tight">{title}</p>
          <p className={selected ? "mt-2 text-sm leading-relaxed text-white/80" : "mt-2 text-sm leading-relaxed text-content-secondary"}>
            {description}
          </p>
          {hint ? (
            <p className="mt-2 text-xs font-semibold text-content-muted">
              {hint}
            </p>
          ) : null}
        </div>
        <div className={selected ? "rounded-xl bg-white/16 p-2" : "rounded-xl bg-black/5 p-2 dark:bg-white/10"}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.button>
  );
}

function getResultMessage(
  selection: OnboardingKanaKnowledgeChoice | null,
  result?: KanaExamResult,
) {
  if (result?.passed) {
    return `Validado. Este alfabeto ya quedó aprobado.`;
  }

  if (result && !result.passed) {
    return `Harás el recorrido normal de aprendizaje.`;
  }

  if (selection === "exam") {
    return "Se abrirá un examen visual de 30 preguntas.";
  }

  if (selection === "learn") {
    return "Empezarás con la ruta base guiada.";
  }

  return "Elige examen o base para este alfabeto.";
}