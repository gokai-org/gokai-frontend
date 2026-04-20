"use client";

import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useGuideTour } from "./GuideTourProvider";
import {
  GUIDE_SPOTLIGHT_GLOW,
  getGuideCardMetrics,
  isGuideStepReady,
  getSpotlightCardStyle,
  resolveGuideTarget,
  resolveSpotlightRect,
  type SpotlightRect,
} from "@/features/help/utils/guideOverlay";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function useDirection() {
  const dirRef = useRef<1 | -1>(1);
  return {
    get: () => dirRef.current,
    set: (direction: 1 | -1) => {
      dirRef.current = direction;
    },
  };
}

export function GuideTourOverlay() {
  const { activeTour, currentStep, nextStep, prevStep, closeTour } =
    useGuideTour();
  const direction = useDirection();
  const visible = !!activeTour;
  const [targetRect, setTargetRect] = useState<SpotlightRect | null>(null);
  const [cardHeight, setCardHeight] = useState(320);
  const [stepReady, setStepReady] = useState(false);
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 900 : window.innerHeight,
  }));
  const spotlightCardRef = useRef<HTMLDivElement | null>(null);

  const step = activeTour?.steps[currentStep];
  const totalSteps = activeTour?.steps.length ?? 0;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const canAdvance = !!activeTour && !!step && stepReady;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!activeTour) {
        return;
      }

      if (event.key === "Escape") {
        closeTour();
      }

      if (event.key === "ArrowRight") {
        if (!canAdvance) {
          return;
        }

        setStepReady(false);
        direction.set(1);
        nextStep();
      }

      if (event.key === "ArrowLeft") {
        direction.set(-1);
        prevStep();
      }
    },
    [activeTour, canAdvance, closeTour, nextStep, prevStep, direction],
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  useEffect(() => {
    if (!activeTour || !step) {
      return;
    }

    let frameId: number | null = null;

    const updateStepReady = () => {
      setStepReady(isGuideStepReady(step.selector));
    };

    const queueUpdate = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        updateStepReady();
      });
    };

    const mutationObserver = new MutationObserver(() => {
      queueUpdate();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    queueUpdate();

    window.addEventListener("resize", queueUpdate);
    window.addEventListener("scroll", queueUpdate, true);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      mutationObserver.disconnect();
      window.removeEventListener("resize", queueUpdate);
      window.removeEventListener("scroll", queueUpdate, true);
    };
  }, [activeTour, currentStep, step, step?.selector]);

  useEffect(() => {
    if (!activeTour || !step?.selector) {
      return;
    }

    const selector = step.selector;

    let frameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let observedTarget: HTMLElement | null = null;
    const timeoutIds: Array<ReturnType<typeof setTimeout>> = [];

    const measure = () => {
      const target = resolveGuideTarget(selector);

      if (!target) {
        setTargetRect(null);
        return;
      }

      setTargetRect(
        resolveSpotlightRect(
          target,
          step.spotlightPadding ?? 16,
          step.spotlightInsets,
        ),
      );

      if (observedTarget === target) {
        return;
      }

      resizeObserver?.disconnect();
      observedTarget = target;
      resizeObserver = new ResizeObserver(() => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }

        frameId = requestAnimationFrame(() => {
          measure();
        });
      });
      resizeObserver.observe(target);
    };

    const queueMeasure = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        measure();
      });
    };

    const scrollTargetIntoView = () => {
      if (step.autoScroll === false) {
        return;
      }

      const target = resolveGuideTarget(selector);

      target?.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: "smooth",
      });
    };

    scrollTargetIntoView();
    queueMeasure();

    timeoutIds.push(setTimeout(queueMeasure, 160));
    timeoutIds.push(setTimeout(queueMeasure, 360));
    timeoutIds.push(setTimeout(scrollTargetIntoView, 120));

    window.addEventListener("resize", queueMeasure);
    window.addEventListener("scroll", queueMeasure, true);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      resizeObserver?.disconnect();
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      window.removeEventListener("resize", queueMeasure);
      window.removeEventListener("scroll", queueMeasure, true);
    };
  }, [activeTour, currentStep, step?.selector, step?.autoScroll, step?.spotlightPadding, step?.spotlightInsets]);

  const spotlightMode = !!step?.selector && targetRect !== null;

  useEffect(() => {
    if (!spotlightMode || !spotlightCardRef.current) {
      return;
    }

    const updateSize = () => {
      const rect = spotlightCardRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setCardHeight(rect.height);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(spotlightCardRef.current);
    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [spotlightMode, currentStep]);

  const handleNext = () => {
    if (!canAdvance) {
      return;
    }

    setStepReady(false);
    direction.set(1);
    nextStep();
  };

  const handlePrev = () => {
    direction.set(-1);
    prevStep();
  };

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

  const cardMetrics = useMemo(
    () => getGuideCardMetrics(viewportSize.width, viewportSize.height),
    [viewportSize],
  );

  const spotlightCardStyle = useMemo(() => {
    if (!spotlightMode || !targetRect) {
      return undefined;
    }

    return getSpotlightCardStyle(
      targetRect,
      cardMetrics.width,
      cardHeight,
      step?.position,
    );
  }, [spotlightMode, targetRect, cardMetrics.width, cardHeight, step?.position]);

  if (typeof document === "undefined" || !visible || !activeTour || !step) {
    return null;
  }

  const renderCard = (compact: boolean) => (
    <div
      className={compact
        ? "flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-border-subtle/80 bg-surface-primary shadow-[0_28px_60px_-24px_rgba(10,10,14,0.5)] sm:rounded-[28px]"
        : "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border-subtle/80 bg-surface-primary shadow-2xl shadow-black/25 sm:rounded-3xl"
      }
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-accent via-[#8a2e2c] to-accent-hover px-4 pt-4 pb-3 text-content-inverted sm:px-6 sm:pt-5 sm:pb-4">
        <div className="absolute top-[-20px] right-[-10px] h-28 w-28 rounded-full bg-surface-primary/[0.04]" />
        <div className="absolute bottom-[-12px] left-[55%] h-16 w-16 rounded-full bg-surface-primary/[0.04]" />

        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white/60 sm:h-4 sm:w-4" />
              </motion.div>
              <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 sm:text-[11px]">
                {activeTour.title}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.12, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              onClick={closeTour}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-primary/10 transition-colors duration-200 hover:bg-surface-primary/20"
            >
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </motion.button>
          </div>

          <div className="h-[3px] w-full overflow-hidden rounded-full bg-surface-primary/10">
            <motion.div
              className="h-full rounded-full bg-surface-primary/90"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease }}
            />
          </div>

          <motion.p
            key={`counter-${currentStep}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-[10px] font-medium text-white/50 sm:text-[11px]"
          >
            Paso {currentStep + 1} de {totalSteps}
          </motion.p>
        </div>
      </div>

      <div
        className={compact
          ? "relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4"
          : "relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
        }
      >
        <AnimatePresence mode="wait" custom={direction.get()}>
          <motion.div
            key={currentStep}
            custom={direction.get()}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease }}
            className={compact ? "flex flex-col gap-4" : "flex items-start gap-4"}
          >
            {step.icon && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease, delay: 0.1 }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-accent/10 bg-gradient-to-br from-accent/10 to-accent/5 text-accent sm:h-12 sm:w-12"
              >
                {step.icon}
              </motion.div>
            )}

            <div className="min-w-0 flex-1">
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 }}
                className="mb-1.5 text-[15px] font-extrabold leading-snug text-content-primary sm:text-base"
              >
                {step.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="text-[13px] leading-relaxed text-content-tertiary sm:text-sm"
              >
                {step.description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={compact ? "px-4 pb-3 sm:px-5 sm:pb-4" : "px-4 pb-4 sm:px-6 sm:pb-5"}>
        <div className="flex items-center justify-between gap-3">
          <motion.button
            onClick={handlePrev}
            disabled={isFirst}
            whileHover={isFirst ? {} : { x: -3 }}
            whileTap={isFirst ? {} : { scale: 0.95 }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-all duration-200 sm:px-4 sm:text-sm ${
              isFirst
                ? "cursor-not-allowed text-content-muted"
                : "text-content-tertiary hover:bg-surface-tertiary hover:text-content-primary"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={!canAdvance}
            whileHover={canAdvance ? { scale: 1.03 } : {}}
            whileTap={canAdvance ? { scale: 0.96 } : {}}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold shadow-lg transition-all duration-300 sm:px-5 sm:text-sm ${
              !canAdvance
                ? "cursor-wait bg-surface-tertiary text-content-muted shadow-none"
                : isLast
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-content-inverted shadow-emerald-500/25"
                : "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-accent/25"
            }`}
          >
            <AnimatePresence mode="wait">
              {!canAdvance ? (
                <motion.span
                  key="waiting"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  Esperando...
                </motion.span>
              ) : isLast ? (
                <motion.span
                  key="finish"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
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
                  <ChevronRight className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease }}
        className="pointer-events-none fixed inset-0 z-[99999] isolate"
      >
        <motion.button
          type="button"
          className="pointer-events-auto absolute inset-0 bg-black/46"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={closeTour}
          aria-label="Cerrar guía"
        />

        {spotlightMode && targetRect ? (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease }}
              className="pointer-events-none absolute rounded-[28px] border border-white/30"
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
                boxShadow: GUIDE_SPOTLIGHT_GLOW,
              }}
            />

            <motion.div
              ref={spotlightCardRef}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.34, ease }}
              className="pointer-events-auto absolute z-10 max-h-[calc(100dvh-2rem)]"
              style={{
                ...spotlightCardStyle,
                maxHeight: cardMetrics.maxHeight,
              }}
            >
              {renderCard(true)}
            </motion.div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 40, scale: 0.92, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 30, scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="pointer-events-auto relative z-10 w-full max-w-[560px]"
              style={{
                maxWidth: cardMetrics.width,
                maxHeight: cardMetrics.maxHeight,
              }}
            >
              {renderCard(false)}
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        >
          <span className="text-[11px] font-medium tracking-wide text-white/35">
            ← → navegar · Esc cerrar
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}