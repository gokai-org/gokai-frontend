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
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/38 p-2 sm:items-center sm:p-4"
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
            className="w-full max-w-5xl overflow-hidden rounded-[24px] border border-border-default/70 bg-surface-primary p-2 shadow-[var(--shadow-xl)] will-change-transform sm:p-4 md:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border-subtle pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {documents.map((document) => {
                    const isActive = document.key === activeDocument;

                    return (
                      <button
                        key={document.key}
                        type="button"
                        onClick={() => onSelectDocument(document.key)}
                        className={[
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
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
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-primary text-content-secondary transition hover:border-accent/35 hover:text-content-primary focus:outline-none focus:ring-4 focus:ring-red-100"
                  aria-label="Cerrar modal legal"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
              {helperText && (
                <p className="mt-3 text-xs leading-5 text-content-tertiary">
                  {helperText}
                </p>
              )}
            </div>

            <div className="pt-3">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
