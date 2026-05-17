"use client";

import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface ChatSurfacePanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  mode?: "contained" | "page" | "dialog";
  panelClassName?: string;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
}

export function ChatSurfacePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  mode = "contained",
  panelClassName,
  bodyClassName,
  bodyStyle,
}: ChatSurfacePanelProps) {
  useEffect(() => {
    if (!open || mode === "contained") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mode, open]);

  const containerClassName =
    mode === "contained" ? "absolute inset-0 z-30" : "fixed inset-0 z-50";

  const backdropClassName =
    mode === "contained"
      ? "absolute inset-0 rounded-[30px] bg-black/20 backdrop-blur-[2px]"
      : mode === "dialog"
        ? "absolute inset-0 bg-black/68 backdrop-blur-md"
        : "absolute inset-0 bg-black/30 backdrop-blur-[2px]";

  const contentClassName =
    mode === "contained"
      ? "absolute inset-2 flex flex-col overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary shadow-2xl sm:inset-3"
      : mode === "dialog"
        ? "absolute left-1/2 top-1/2 flex max-h-[min(92vh,920px)] w-[min(96vw,1120px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[34px] border border-border-subtle bg-surface-primary shadow-[0_38px_120px_-48px_rgba(0,0,0,0.82)]"
        : "absolute inset-x-2 bottom-2 top-2 flex flex-col overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary shadow-2xl sm:inset-x-4 sm:bottom-4 sm:top-4 sm:left-auto sm:right-4 sm:w-[min(92vw,420px)]";

  const initialAnimation =
    mode === "contained"
      ? { opacity: 0, y: 18 }
      : mode === "dialog"
        ? { opacity: 0, y: 26, scale: 0.96 }
        : { opacity: 0, x: 36 };

  const animateAnimation =
    mode === "contained"
      ? { opacity: 1, y: 0 }
      : mode === "dialog"
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 1, x: 0 };

  const exitAnimation =
    mode === "contained"
      ? { opacity: 0, y: 18 }
      : mode === "dialog"
        ? { opacity: 0, y: 18, scale: 0.97 }
        : { opacity: 0, x: 36 };

  const panel = (
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
            initial={initialAnimation}
            animate={animateAnimation}
            exit={exitAnimation}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className={[contentClassName, panelClassName].filter(Boolean).join(" ")}
          >
            <div className="shrink-0 border-b border-border-subtle bg-surface-elevated px-4 py-4 sm:px-5 sm:py-4">
              <div className="flex min-h-[88px] items-center justify-between gap-3 sm:min-h-[104px]">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-content-primary sm:text-lg">
                    {title}
                  </h3>
                  {subtitle ? (
                    <p className="mt-1 text-xs text-content-tertiary sm:text-sm">
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

            <div
              className={["min-h-0 flex-1 overflow-y-auto", bodyClassName]
                .filter(Boolean)
                .join(" ")}
              style={bodyStyle}
            >
              {children}
            </div>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );

  if (mode === "contained") {
    return panel;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(panel, document.body);
}