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
      className="pointer-events-none fixed right-3 bottom-3 z-[70] md:right-4 md:bottom-4 lg:right-6 lg:bottom-6"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.24, ease }}
            className="pointer-events-auto absolute right-0 bottom-[calc(100%+10px)] w-[min(280px,calc(100vw-1.25rem))] overflow-hidden rounded-[24px] border border-border-subtle/80 bg-surface-primary shadow-[0_24px_50px_-24px_rgba(10,10,14,0.5)] md:bottom-[calc(100%+12px)] md:w-[min(300px,calc(100vw-2rem))] md:rounded-[26px] lg:bottom-[calc(100%+14px)] lg:w-[min(320px,calc(100vw-2rem))] lg:rounded-[28px]"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-accent via-[#8a2e2c] to-accent-hover px-4 pt-3.5 pb-3 text-content-inverted md:px-4.5 md:pt-4 lg:px-5">
              <div className="absolute -top-5 -right-3 h-20 w-20 rounded-full bg-white/10 blur-2xl md:h-24 md:w-24" />
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/60 md:text-[10.5px] lg:text-[11px]">
                Ayuda contextual
              </p>
              <h3 className="mt-1 text-sm font-extrabold md:text-[15px] lg:text-base">
                Elige cómo quieres continuar
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-white/70 md:text-[13px] lg:text-sm">
                Puedes recorrer esta pantalla paso a paso o abrir el centro de ayuda completo.
              </p>
            </div>

            <div className="space-y-2 p-2.5 md:p-3">
              <button
                type="button"
                onClick={handleStartTour}
                className="flex w-full items-start gap-2.5 rounded-[18px] border border-border-subtle bg-surface-secondary/70 px-3 py-2.5 text-left transition-all duration-200 hover:border-accent/20 hover:bg-accent/5 md:gap-3 md:rounded-2xl md:px-4 md:py-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent md:h-9 md:w-9 md:rounded-2xl lg:h-10 lg:w-10">
                  <Eye className="h-4 w-4 md:h-[18px] md:w-[18px] lg:h-5 lg:w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-content-primary md:text-sm">
                    Qué hay en mi pantalla
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-content-tertiary md:text-xs">
                    Te muestro tablero, nodos, lecciones y acciones importantes en una guía visual.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={handleGoToHelp}
                className="flex w-full items-start gap-2.5 rounded-[18px] border border-border-subtle bg-surface-secondary/70 px-3 py-2.5 text-left transition-all duration-200 hover:border-accent/20 hover:bg-accent/5 md:gap-3 md:rounded-2xl md:px-4 md:py-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary text-content-primary md:h-9 md:w-9 md:rounded-2xl lg:h-10 lg:w-10">
                  <LifeBuoy className="h-4 w-4 md:h-[18px] md:w-[18px] lg:h-5 lg:w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-[13px] font-bold text-content-primary md:text-sm">
                    Ir a ayuda
                    <ArrowUpRight className="h-3 w-3 text-content-muted md:h-3.5 md:w-3.5" />
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-content-tertiary md:text-xs">
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="pointer-events-auto relative flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white/88 text-slate-600 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.45)] backdrop-blur-md transition-colors duration-200 hover:border-black/12 hover:bg-white/96 hover:text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/14 dark:hover:text-white md:h-10 md:w-10 lg:h-10 lg:w-10"
        aria-label="Abrir ayuda contextual"
      >
        <span className="absolute inset-0 rounded-full bg-black/0 transition-colors duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]" />
        <span className="relative z-10 text-[16px] font-semibold leading-none md:text-[17px]">
          ?
        </span>
      </motion.button>
    </div>
  );
}