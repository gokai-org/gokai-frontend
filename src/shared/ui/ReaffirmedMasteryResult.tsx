"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

const UNLOCKED_MASTERY_INTRO_MS = 1450;

type MasteryResultFrameProps = {
  title: string;
  subtitle: string;
  score: number;
  statusLabel: string;
  topSlot?: ReactNode;
  detailSlot?: ReactNode;
  actions: ReactNode;
};

function MasteryResultFrame({
  title,
  subtitle,
  score,
  statusLabel,
  topSlot,
  detailSlot,
  actions,
}: MasteryResultFrameProps) {
  const accentStyle = { color: "var(--accent)" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 py-4"
    >
      <div className="mt-4 space-y-3">
        {topSlot}

        <div className="space-y-1.5">
          <p
            className="text-3xl font-black text-content-primary"
            style={accentStyle}
          >
            {title}
          </p>
          <p className="text-sm leading-6 text-content-secondary">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border-subtle pt-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
              Resultado
            </p>
            <p
              className="mt-1 text-4xl font-black text-content-primary"
              style={accentStyle}
            >
              {score}
              <span className="ml-1 text-base font-semibold text-content-muted">
                /100
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">
              Estado
            </p>
            <p
              className="mt-1 text-sm font-bold text-content-primary"
              style={accentStyle}
            >
              {statusLabel}
            </p>
          </div>
        </div>

        {detailSlot}

        {actions}
      </div>
    </motion.div>
  );
}

type ReaffirmedMasteryResultProps = {
  title: string;
  subtitle: string;
  score: number;
  statusLabel?: string;
  primaryActionLabel?: string;
  onRetry: () => void;
  onClose: () => void;
};

export function ReaffirmedMasteryResult({
  title,
  subtitle,
  score,
  statusLabel = "Dominio reafirmado",
  primaryActionLabel = "Practicar otra vez",
  onRetry,
  onClose,
}: ReaffirmedMasteryResultProps) {
  return (
    <MasteryResultFrame
      title={title}
      subtitle={subtitle}
      score={score}
      statusLabel={statusLabel}
      detailSlot={
        <div
          className="flex items-center gap-3 rounded-2xl border px-4 py-3"
          style={{
            backgroundColor: "var(--accent-subtle)",
            borderColor: "var(--accent-muted)",
          }}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
              Dominio confirmado de nuevo
            </p>
            <p className="text-xs text-content-secondary">
              Este intento no genera puntos ni desbloqueos nuevos.
            </p>
          </div>
        </div>
      }
      actions={
        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
          <button
            onClick={onRetry}
            className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-3 text-sm font-black text-content-inverted shadow-lg shadow-accent/15 transition hover:shadow-xl hover:shadow-accent/20"
          >
            {primaryActionLabel}
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary sm:min-w-32"
          >
            Cerrar
          </button>
        </div>
      }
    />
  );
}

type UnlockedMasteryResultProps = {
  title: string;
  subtitle: string;
  score: number;
  symbol: string;
  pointsDelta: number;
  statusLabel?: string;
  onClose: () => void;
};

export function UnlockedMasteryResult({
  title,
  subtitle,
  score,
  symbol,
  pointsDelta,
  statusLabel = "Nuevo progreso desbloqueado",
  onClose,
}: UnlockedMasteryResultProps) {
  return (
    <MasteryResultFrame
      title={title}
      subtitle={subtitle}
      score={score}
      statusLabel={statusLabel}
      topSlot={
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative">
            <div className="kanji-celebration-halo absolute inset-[-24px] rounded-full" />
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover"
              style={{ boxShadow: "0 0 48px var(--accent-glow, rgba(186,72,66,0.52))" }}
            >
              <span className="select-none text-5xl font-bold text-white">
                {symbol}
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.18,
              duration: 0.42,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2 shadow-lg shadow-accent/30"
          >
            <span className="text-xl font-black text-white">
              +{pointsDelta}
            </span>
            <span className="text-sm font-semibold text-white/80">
              puntos desbloqueados
            </span>
          </motion.div>
        </div>
      }
      actions={
        <div className="flex justify-center pt-1">
          <button
            onClick={onClose}
            className="rounded-2xl border border-border-subtle bg-surface-secondary px-6 py-3 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary"
          >
            Cerrar
          </button>
        </div>
      }
    />
  );
}

type UnlockedMasterySequenceProps = UnlockedMasteryResultProps;

export function UnlockedMasterySequence({
  title,
  subtitle,
  score,
  symbol,
  pointsDelta,
  statusLabel,
  onClose,
}: UnlockedMasterySequenceProps) {
  const [phase, setPhase] = useState<"intro" | "result">("intro");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPhase("result");
    }, UNLOCKED_MASTERY_INTRO_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pointsDelta, score, subtitle, symbol, title]);

  if (phase === "result") {
    return (
      <UnlockedMasteryResult
        title={title}
        subtitle={subtitle}
        score={score}
        symbol={symbol}
        pointsDelta={pointsDelta}
        statusLabel={statusLabel}
        onClose={onClose}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="kanji-celebration-halo absolute inset-[-24px] rounded-full" />
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover"
            style={{ boxShadow: "0 0 48px var(--accent-glow, rgba(186,72,66,0.52))" }}
          >
            <span className="select-none text-5xl font-bold text-white">
              {symbol}
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.18,
            duration: 0.42,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2 shadow-lg shadow-accent/30"
        >
          <span className="text-xl font-black text-white">
            +{pointsDelta}
          </span>
          <span className="text-sm font-semibold text-white/80">
            puntos desbloqueados
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}