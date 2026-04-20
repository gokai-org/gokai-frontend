"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Eye, LifeBuoy } from "lucide-react";
import { useGuideTour, type TourDefinition } from "./GuideTourProvider";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ContextualHelpButtonProps {
  getTour: () => TourDefinition;
  helpHref?: string;
}

export function ContextualHelpButton({
  getTour,
  helpHref = "/dashboard/help",
}: ContextualHelpButtonProps) {
  const router = useRouter();
  const { startTour } = useGuideTour();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleStartTour = useCallback(() => {
    setOpen(false);
    startTour(getTour());
  }, [getTour, startTour]);

  const handleGoToHelp = useCallback(() => {
    setOpen(false);
    router.push(helpHref);
  }, [helpHref, router]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed right-5 bottom-5 z-[70] sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.24, ease }}
            className="pointer-events-auto absolute right-0 bottom-[calc(100%+14px)] w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-border-subtle/80 bg-surface-primary shadow-[0_28px_60px_-24px_rgba(10,10,14,0.5)]"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-accent via-[#8a2e2c] to-accent-hover px-5 pt-4 pb-3 text-content-inverted">
              <div className="absolute -top-5 -right-3 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/60">
                Ayuda contextual
              </p>
              <h3 className="mt-1 text-base font-extrabold">
                Elige cómo quieres continuar
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                Puedes recorrer esta pantalla paso a paso o abrir el centro de ayuda completo.
              </p>
            </div>

            <div className="space-y-2 p-3">
              <button
                type="button"
                onClick={handleStartTour}
                className="flex w-full items-start gap-3 rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-3 text-left transition-all duration-200 hover:border-accent/20 hover:bg-accent/5"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Eye className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-content-primary">
                    Qué hay en mi pantalla
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-content-tertiary">
                    Te muestro tablero, nodos, lecciones y acciones importantes en una guía visual.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={handleGoToHelp}
                className="flex w-full items-start gap-3 rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-3 text-left transition-all duration-200 hover:border-accent/20 hover:bg-accent/5"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-tertiary text-content-primary">
                  <LifeBuoy className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-bold text-content-primary">
                    Ir a ayuda
                    <ArrowUpRight className="h-3.5 w-3.5 text-content-muted" />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-content-tertiary">
                    Abre el centro de ayuda con más guías, preguntas frecuentes y soporte.
                  </span>
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="pointer-events-auto relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-accent to-accent-hover text-[28px] font-black text-white shadow-[0_18px_36px_-18px_rgba(153,51,49,0.85)]"
        aria-label="Abrir ayuda contextual"
      >
        <span className="absolute inset-0 rounded-full bg-white/0 transition-opacity duration-200 hover:bg-white/5" />
        <span className="relative z-10 leading-none">?</span>
      </motion.button>
    </div>
  );
}