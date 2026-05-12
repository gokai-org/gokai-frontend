"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ChatSurfacePanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  mode?: "contained" | "page";
  panelClassName?: string;
}

export function ChatSurfacePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  mode = "contained",
  panelClassName,
}: ChatSurfacePanelProps) {
  const containerClassName =
    mode === "contained"
      ? "absolute inset-0 z-30"
      : "fixed inset-0 z-50";

  const backdropClassName =
    mode === "contained"
      ? "absolute inset-0 rounded-[30px] bg-black/20 backdrop-blur-[2px]"
      : "absolute inset-0 bg-black/30 backdrop-blur-[2px]";

  const contentClassName =
    mode === "contained"
      ? "absolute inset-2 flex flex-col overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary shadow-2xl sm:inset-3"
      : "absolute inset-x-4 bottom-4 top-4 flex flex-col overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary shadow-2xl sm:left-auto sm:right-4 sm:w-[min(92vw,420px)]";

  return (
    <AnimatePresence>
      {open ? (
        <div className={containerClassName} role="dialog" aria-modal="true">
          <motion.button
            type="button"
            aria-label="Cerrar panel"
            className={backdropClassName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.section
            initial={mode === "contained" ? { opacity: 0, y: 18 } : { opacity: 0, x: 36 }}
            animate={mode === "contained" ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            exit={mode === "contained" ? { opacity: 0, y: 18 } : { opacity: 0, x: 36 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className={[contentClassName, panelClassName].filter(Boolean).join(" ")}
          >
            <div className="shrink-0 border-b border-border-subtle bg-surface-elevated px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-content-primary">
                    {title}
                  </h3>
                  {subtitle ? (
                    <p className="mt-1 text-sm text-content-tertiary">
                      {subtitle}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-default bg-surface-primary text-content-secondary transition hover:border-accent/30 hover:text-accent"
                  aria-label="Cerrar"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6 18 18" />
                    <path d="M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}