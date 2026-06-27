"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type LegalDocumentKey = "terms" | "privacy" | "credits";

type LegalDocumentsModalProps = {
  activeDocument: LegalDocumentKey;
  children: ReactNode;
  documents: Array<{
    key: LegalDocumentKey;
    label: string;
    accepted?: boolean;
  }>;
  helperText?: string;
  onClose: () => void;
  onSelectDocument: (key: LegalDocumentKey) => void;
  open: boolean;
};

export function LegalDocumentsModal({
  activeDocument,
  children,
  documents,
  helperText,
  onClose,
  onSelectDocument,
  open,
}: LegalDocumentsModalProps) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-stretch justify-center bg-surface-primary px-0 py-0 sm:items-center sm:bg-black/45 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.995 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-dvh w-full max-w-5xl flex-col overflow-hidden rounded-none border-0 bg-surface-primary px-3 pb-3 pt-3 shadow-none will-change-transform sm:h-[calc(100dvh-2rem)] sm:max-h-[960px] sm:rounded-[24px] sm:border sm:border-border-default/70 sm:p-4 sm:shadow-[var(--shadow-xl)] md:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 border-b border-border-subtle pb-3 sm:pb-4">
              <div className="flex justify-end pb-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-primary text-content-secondary transition hover:border-accent/35 hover:text-content-primary focus:outline-none focus:ring-4 focus:ring-red-100"
                  aria-label="Cerrar modal legal"
                >
                  <span className="text-lg leading-none">X</span>
                </button>
              </div>

              <div className="flex min-w-0 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-2">
                  {documents.map((document) => {
                    const isActive = document.key === activeDocument;

                    return (
                      <button
                        key={document.key}
                        type="button"
                        onClick={() => onSelectDocument(document.key)}
                        className={[
                          "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                          isActive
                            ? "border-accent bg-accent text-content-inverted shadow-sm"
                            : "border-border-default bg-surface-primary text-content-secondary hover:border-accent/35 hover:text-content-primary",
                        ].join(" ")}
                      >
                        <span>{document.label}</span>
                        {document.accepted && (
                          <span
                            className={[
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-[11px]",
                              isActive
                                ? "bg-white/18 text-content-inverted"
                                : "bg-emerald-100 text-emerald-700",
                            ].join(" ")}
                          >
                            Aceptado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {helperText && (
                <p className="mt-3 text-xs leading-5 text-content-tertiary">
                  {helperText}
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-hidden pt-3 sm:pt-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
