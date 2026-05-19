"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Crown,
  Map,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useMiniDockBlocker } from "@/features/dashboard/utils/miniDockBlockers";
import { stopModalEvent, useModalPageLock } from "@/shared/hooks/useModalPageLock";

type PremiumThemeGateModalProps = {
  open: boolean;
  blockedThemeLabel?: string;
  onClose: () => void;
  onOpenUpgrade: () => void;
  onOpenPlans?: () => void;
};

const premiumBenefits = [
  "Todos los intereses del mapa de Japon",
  "Rutas completas en Graph y Library",
  "Exploracion premium sin perder tu progreso",
];

const freePlanItems = [
  "Tus intereses guardados actualmente",
  "Acceso a kana, kanji y gramatica ya desbloqueados",
  "Tu progreso y favoritos se mantienen intactos",
];

export function PremiumThemeGateModal({
  open,
  blockedThemeLabel,
  onClose,
  onOpenUpgrade,
  onOpenPlans,
}: PremiumThemeGateModalProps) {
  useMiniDockBlocker(open);
  useModalPageLock(open);

  const resolvedLabel = blockedThemeLabel?.trim() || "este interes";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-vocabulary-overlay="true"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-4"
          onClick={onClose}
          onWheelCapture={stopModalEvent}
          onPointerDown={stopModalEvent}
          onPointerMove={stopModalEvent}
          onTouchMoveCapture={stopModalEvent}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 14 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            data-vocabulary-overlay="true"
            className="relative my-2 flex max-h-[calc(100dvh-24px)] w-full max-w-[440px] flex-col overflow-hidden rounded-[26px] bg-surface-primary shadow-2xl ring-1 ring-border-subtle sm:my-4 sm:max-h-[calc(100dvh-32px)] sm:max-w-5xl sm:rounded-3xl md:flex-row"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex flex-col overflow-hidden bg-gradient-to-br from-accent to-accent-hover text-content-inverted md:w-[360px] md:min-h-[560px] md:flex-shrink-0 md:justify-between">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-surface-primary/10" />
              <div className="pointer-events-none absolute -left-6 bottom-8 h-20 w-20 rounded-full bg-surface-primary/5" />
              <div className="pointer-events-none absolute right-4 bottom-4 h-14 w-14 rounded-full bg-surface-primary/5" />

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/70 transition-colors hover:bg-surface-primary/10 hover:text-content-inverted md:hidden"
                aria-label="Cerrar modal premium"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="relative z-[1] px-5 pb-4 pt-4 text-center md:px-7 md:pb-0 md:pt-8 md:text-left">
                <div className="flex items-center justify-center gap-3 md:justify-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-primary/20 backdrop-blur-sm md:h-12 md:w-12">
                    <Crown className="h-5 w-5 text-content-inverted md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-[1.35rem] font-extrabold tracking-tight md:text-2xl">GOKAI+</p>
                    <p className="hidden text-xs text-white/78 md:block md:text-sm">Desbloquea todo tu mapa</p>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/92 backdrop-blur-sm md:mt-6 md:text-[11px] md:tracking-[0.24em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tema premium
                </div>

                <h2 className="mx-auto mt-3 max-w-[15ch] text-[1.7rem] font-black leading-[1.02] tracking-tight sm:text-[2.15rem] md:mx-0 md:mt-5 md:max-w-[13ch] md:text-[2.6rem]">
                  {resolvedLabel} necesita plan GOKAI+
                </h2>

                <p className="mt-4 hidden text-sm leading-7 text-white/82 md:block">
                  Este interes forma parte de las rutas premium. Activa GOKAI+ para abrirlo en graph y library sin perder tu progreso actual.
                </p>

                <p className="mx-auto mt-2 max-w-[28ch] text-[12px] leading-4 text-white/82 md:hidden">
                  Activa GOKAI+ para abrirlo.
                </p>

                <div className="mt-7 hidden space-y-3.5 md:block">
                  {premiumBenefits.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-white/80" />
                      <p className="text-sm leading-6 text-white/88">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden items-center gap-3 px-7 pb-6 text-xs text-white/52 md:flex">
                <Star className="h-3.5 w-3.5" />
                <span>Tu progreso, favoritos y ruta actual se mantienen</span>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 hidden rounded-full p-1.5 text-content-muted transition-colors hover:bg-surface-tertiary hover:text-content-secondary md:flex"
                aria-label="Cerrar modal premium"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:pb-4 md:pt-6">
                <p className="hidden text-sm font-semibold text-content-primary md:block">
                  Todo lo que desbloqueas con GOKAI+
                </p>

                <div className="space-y-2 md:mt-4 md:space-y-2.5">
                  {[
                    {
                      icon: Map,
                      title: "Todos los intereses del mapa de Japon",
                      description:
                        "Accede a temas premium que no formen parte de tus intereses guardados y recorre regiones completas sin bloqueos.",
                    },
                    {
                      icon: BookOpen,
                      title: "Graph y Library conectados",
                      description:
                        "Entra al mismo contenido premium desde el mapa o desde library con una experiencia coherente.",
                    },
                    {
                      icon: Sparkles,
                      title: "Exploracion completa sin reiniciar nada",
                      description:
                        "Mantienes tus favoritos, tu progreso actual y lo que ya desbloqueaste mientras amplias acceso.",
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-secondary md:p-2"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-content-primary">
                          {feature.title}
                        </p>
                        <p className="hidden text-xs leading-relaxed text-content-tertiary md:block">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 hidden rounded-2xl border border-border-subtle bg-surface-secondary/55 px-4 py-4 md:block">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-content-muted">
                    Con tu plan actual conservas
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {freePlanItems.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-primary text-content-secondary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-sm leading-6 text-content-secondary">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle bg-surface-secondary/50 px-4 py-3 md:px-6 md:py-5">
                <p className="mb-3 hidden text-sm leading-6 text-content-secondary md:block">
                  Activa GOKAI+ para abrir {resolvedLabel} ahora mismo y seguir explorando intereses premium desde cualquier ruta.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-accent/25 focus:outline-none focus:ring-4 focus:ring-accent/20"
                  >
                    Mejorar ahora
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {onOpenPlans ? (
                    <button
                      type="button"
                      onClick={onOpenPlans}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-border-default bg-surface-primary px-5 text-sm font-semibold text-content-secondary transition hover:bg-surface-tertiary hover:text-content-primary"
                    >
                      Ver planes
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}