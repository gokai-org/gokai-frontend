"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useGuideTour } from "./GuideTourProvider";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Dirección de la transición ── */
function useDirection() {
  const dirRef = useRef<1 | -1>(1);
  return {
    get: () => dirRef.current,
    set: (d: 1 | -1) => {
      dirRef.current = d;
    },
  };
}

export function GuideTourOverlay() {
  const { activeTour, currentStep, nextStep, prevStep, closeTour, goToStep } =
    useGuideTour();
  const direction = useDirection();
  const visible = !!activeTour;

  // Cerrar con Escape, navegar con flechas
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!activeTour) return;
      if (e.key === "Escape") closeTour();
      if (e.key === "ArrowRight") {
        direction.set(1);
        nextStep();
      }
      if (e.key === "ArrowLeft") {
        direction.set(-1);
        prevStep();
      }
    },
    [activeTour, closeTour, nextStep, prevStep, direction],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Bloquear scroll
  useEffect(() => {
    if (activeTour) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeTour]);

  if (!activeTour && !visible) return null;

  const step = activeTour?.steps[currentStep];
  const totalSteps = activeTour?.steps.length ?? 0;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const handleNext = () => {
    direction.set(1);
    nextStep();
  };

  const handlePrev = () => {
    direction.set(-1);
    prevStep();
  };

  const handleGoTo = (idx: number) => {
    direction.set(idx > currentStep ? 1 : -1);
    goToStep(idx);
  };

  /* Variantes para contenido que transiciona dentro del mismo card */
  const contentVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 50 : -50,
      scale: 0.97,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -50 : 50,
      scale: 0.97,
    }),
  };

  return (
    <AnimatePresence>
      {visible && activeTour && step && (
        <motion.div
          key="tour-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* ── Backdrop ── */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeTour}
          />

          {/* ── Glow decorativo que se mueve sutilmente ── */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] pointer-events-none -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.08, 0.14, 0.08],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full rounded-full bg-accent blur-[100px]" />
          </motion.div>

          {/* ── Contenedor: Card + Step dots a la derecha ── */}
          <motion.div
            initial={{ y: 40, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="relative z-10 flex items-stretch gap-4 w-full max-w-[560px]"
          >
            {/* ════════ Card principal (no se recrea, solo el contenido interno transiciona) ════════ */}
            <div className="flex-1 bg-surface-primary rounded-3xl shadow-2xl shadow-black/25 overflow-hidden border border-border-subtle/80 flex flex-col">
              {/* ── Header ── */}
              <div className="relative bg-gradient-to-br from-accent via-[#8a2e2c] to-accent-hover px-6 pt-5 pb-4 text-content-inverted overflow-hidden flex-shrink-0">
                {/* Decorativos */}
                <div className="absolute top-[-20px] right-[-10px] w-28 h-28 bg-surface-primary/[0.04] rounded-full" />
                <div className="absolute bottom-[-12px] left-[55%] w-16 h-16 bg-surface-primary/[0.04] rounded-full" />

                <div className="relative z-10">
                  {/* Título + cerrar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <Sparkles className="w-4 h-4 text-white/60" />
                      </motion.div>
                      <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.12em]">
                        {activeTour.title}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={closeTour}
                      className="w-7 h-7 rounded-full bg-surface-primary/10 hover:bg-surface-primary/20 flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-[3px] bg-surface-primary/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-surface-primary/90 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease }}
                    />
                  </div>

                  {/* Paso X de N */}
                  <motion.p
                    key={`counter-${currentStep}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[11px] text-white/50 font-medium mt-2"
                  >
                    Paso {currentStep + 1} de {totalSteps}
                  </motion.p>
                </div>
              </div>

              {/* ── Contenido (transiciona suavemente dentro del mismo card) ── */}
              <div className="flex-1 px-6 py-5 min-h-[160px] relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction.get()}>
                  <motion.div
                    key={currentStep}
                    custom={direction.get()}
                    variants={contentVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease }}
                    className="flex items-start gap-4"
                  >
                    {/* Ícono animado */}
                    {step.icon && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease, delay: 0.1 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center flex-shrink-0 text-accent border border-accent/10"
                      >
                        {step.icon}
                      </motion.div>
                    )}
                    <div className="flex-1 min-w-0">
                      <motion.h3
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 }}
                        className="text-base font-extrabold text-content-primary mb-1.5"
                      >
                        {step.title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="text-sm text-content-tertiary leading-relaxed"
                      >
                        {step.description}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 pb-5 flex items-center justify-between gap-3 flex-shrink-0">
                <motion.button
                  onClick={handlePrev}
                  disabled={isFirst}
                  whileHover={isFirst ? {} : { x: -3 }}
                  whileTap={isFirst ? {} : { scale: 0.95 }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isFirst
                      ? "text-content-muted cursor-not-allowed"
                      : "text-content-tertiary hover:bg-surface-tertiary hover:text-content-primary"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </motion.button>

                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  layout
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 ${
                    isLast
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-content-inverted shadow-emerald-500/25"
                      : "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-accent/25"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isLast ? (
                      <motion.span
                        key="finish"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        ¡Entendido!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="next"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

            {/* ════════ Step dots verticales a la derecha ════════ */}
            <div className="flex flex-col items-center justify-center gap-2 py-4 flex-shrink-0">
              {activeTour.steps.map((_, idx) => {
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;
                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleGoTo(idx)}
                    className="relative flex items-center justify-center"
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {/* Anillo activo */}
                    {isActive && (
                      <motion.div
                        layoutId="active-ring"
                        className="absolute w-6 h-6 rounded-full border-2 border-white/60"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 28,
                        }}
                      />
                    )}
                    {/* Dot */}
                    <motion.div
                      animate={{
                        width: isActive ? 10 : 7,
                        height: isActive ? 10 : 7,
                        backgroundColor: isActive
                          ? "#ffffff"
                          : isPast
                            ? "rgba(255,255,255,0.6)"
                            : "rgba(255,255,255,0.2)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className="rounded-full"
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Tip de teclado ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          >
            <span className="text-[11px] text-white/30 font-medium tracking-wide">
              ← → navegar · Esc cerrar
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
