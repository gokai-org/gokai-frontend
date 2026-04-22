"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LockKeyhole, Sparkles, Stars } from "lucide-react";
import { LoadingButton } from "./LoadingButton";
import { PrimaryActionButton } from "./PrimaryActionButton";

export type UnlockStateDialogStatus = "locked" | "unlockable" | "unlocked";

interface UnlockStateDialogProps {
  open: boolean;
  status: UnlockStateDialogStatus;
  moduleLabel: string;
  title: string;
  symbol?: string | null;
  description: string;
  currentPoints?: number;
  unlockCost?: number;
  requirementLabel?: string | null;
  helperText?: string | null;
  actionLabel?: string;
  actionPending?: boolean;
  actionDisabled?: boolean;
  onAction?: () => void;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 12,
    transition: { duration: 0.18 },
  },
};

const STATUS_THEME = {
  locked: {
    chip: "Bloqueado",
    icon: LockKeyhole,
    gradient: "from-[#4e4549] via-[#655a60] to-[#3a3137]",
    badge: "bg-white/14 text-white",
    panelRing: "ring-black/5 dark:ring-white/10",
    accentSurface: "bg-[#f3efed] dark:bg-[#1f1b1f]",
    accentText: "text-content-secondary dark:text-white/72",
  },
  unlockable: {
    chip: "Listo para desbloquear",
    icon: Sparkles,
    gradient: "from-accent via-accent-hover to-[#d36d58]",
    badge: "bg-white/16 text-white",
    panelRing: "ring-accent/12 dark:ring-accent/18",
    accentSurface: "bg-[#fff3ef] dark:bg-[#271a18]",
    accentText: "text-accent dark:text-[#ffb09e]",
  },
  unlocked: {
    chip: "Desbloqueado",
    icon: CheckCircle2,
    gradient: "from-[#b58d2f] via-[#d4a843] to-[#f0d27a]",
    badge: "bg-black/14 text-white",
    panelRing: "ring-[#d4a843]/18 dark:ring-[#d4a843]/22",
    accentSurface: "bg-[#fff7df] dark:bg-[#272214]",
    accentText: "text-[#8a6820] dark:text-[#f0d27a]",
  },
} as const;

export function UnlockStateDialog({
  open,
  status,
  moduleLabel,
  title,
  symbol,
  description,
  currentPoints,
  unlockCost,
  requirementLabel,
  helperText,
  actionLabel,
  actionPending = false,
  actionDisabled = false,
  onAction,
  onClose,
}: UnlockStateDialogProps) {
  const theme = STATUS_THEME[status];
  const StatusIcon = theme.icon;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="unlock-state-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(event) => event.stopPropagation()}
            className={[
              "relative w-full max-w-xl overflow-hidden rounded-[32px] bg-surface-primary shadow-2xl ring-1",
              theme.panelRing,
            ].join(" ")}
          >
            <div className={["relative overflow-hidden bg-gradient-to-br px-6 pb-6 pt-5", theme.gradient].join(" ")}>
              <div className="absolute right-0 top-0 h-36 w-36 translate-x-10 -translate-y-10 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-28 w-28 -translate-x-8 translate-y-8 rounded-full bg-black/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={["inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]", theme.badge].join(" ")}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {theme.chip}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/84">
                      {moduleLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm">
                      <span className="text-3xl font-black leading-none">
                        {symbol || <Stars className="h-7 w-7" />}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white/72">{moduleLabel}</p>
                      <h2 className="max-w-[22rem] text-2xl font-black leading-tight text-white">
                        {title}
                      </h2>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white transition hover:bg-white/18"
                  aria-label="Cerrar"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className={["rounded-[26px] p-5", theme.accentSurface].join(" ")}>
                <p className="text-base font-semibold leading-7 text-content-primary">{description}</p>
                {helperText ? (
                  <p className="mt-2 text-sm leading-6 text-content-secondary">{helperText}</p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-border-subtle/50 bg-surface-secondary/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-content-tertiary">Puntos actuales</p>
                  <p className="mt-2 text-2xl font-black text-content-primary">{currentPoints ?? 0}</p>
                </div>

                <div className="rounded-[24px] border border-border-subtle/50 bg-surface-secondary/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-content-tertiary">
                    {status === "unlocked" ? "Estado" : "Costo de unlock"}
                  </p>
                  <p className={["mt-2 text-2xl font-black", theme.accentText].join(" ")}>
                    {status === "unlocked" ? "Disponible" : unlockCost ?? 0}
                  </p>
                </div>
              </div>

              {requirementLabel ? (
                <div className="rounded-[24px] border border-dashed border-border-subtle/70 px-4 py-3 text-sm font-medium text-content-secondary">
                  {requirementLabel}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-full border border-border-default bg-surface-primary px-5 py-3 text-sm font-bold text-content-secondary transition hover:border-accent/20 hover:text-accent"
                >
                  Cerrar
                </button>

                {onAction && actionLabel ? (
                  status === "unlockable" ? (
                    <LoadingButton
                      type="button"
                      loading={actionPending}
                      disabled={actionDisabled}
                      loadingText="Desbloqueando..."
                      onClick={onAction}
                      className="inline-flex min-w-[14rem] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 transition hover:shadow-xl hover:shadow-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLabel}
                    </LoadingButton>
                  ) : (
                    <PrimaryActionButton fullWidth={false} onClick={onAction} className="sm:min-w-[13rem]">
                      {actionLabel}
                    </PrimaryActionButton>
                  )
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}