"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasVisibleGuideLoading, resolveGuideTarget } from "@/features/help/utils/guideOverlay";

function getRoutePath(route?: string) {
  return route?.split("?")[0]?.split("#")[0];
}

/* ── Tipos ── */
export interface TourStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  selector?: string;
  autoScroll?: boolean;
  spotlightPadding?: number;
  spotlightInsets?: Partial<Record<"top" | "right" | "bottom" | "left", number>>;
  position?:
    | "center"
    | "top"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom"
    | "bottom-left"
    | "bottom-right";
  onEnter?: () => void | (() => void);
}

export interface TourDefinition {
  id: string;
  title: string;
  route?: string;
  steps: TourStep[];
  onClose?: () => void;
}

interface GuideTourContextValue {
  /** Tour activo — null si no hay tour corriendo */
  activeTour: TourDefinition | null;
  /** Step index actual (0-based) */
  currentStep: number;
  /** Iniciar un tour: navega a la ruta y muestra la guía */
  startTour: (tour: TourDefinition) => void;
  /** Avanzar al siguiente paso */
  nextStep: () => void;
  /** Retroceder al paso anterior */
  prevStep: () => void;
  /** Cerrar el tour */
  closeTour: () => void;
  /** Ir a un step específico */
  goToStep: (index: number) => void;
}

const GuideTourContext = createContext<GuideTourContextValue | null>(null);

export function useGuideTour() {
  const ctx = useContext(GuideTourContext);
  if (!ctx)
    throw new Error("useGuideTour debe usarse dentro de <GuideTourProvider>");
  return ctx;
}

export function GuideTourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTour, setActiveTour] = useState<TourDefinition | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingTour, setPendingTour] = useState<TourDefinition | null>(null);
  const activeTourRef = useRef<TourDefinition | null>(null);
  const stepCleanupRef = useRef<(() => void) | null>(null);
  const activationTokenRef = useRef(0);

  const clearStepCleanup = useCallback(() => {
    stepCleanupRef.current?.();
    stepCleanupRef.current = null;
  }, []);

  const teardownTourEffects = useCallback(() => {
    clearStepCleanup();
    activeTourRef.current?.onClose?.();
  }, [clearStepCleanup]);

  useEffect(() => {
    activeTourRef.current = activeTour;
  }, [activeTour]);

  useEffect(() => {
    if (!pendingTour) {
      return;
    }

    if (pendingTour.route && getRoutePath(pendingTour.route) !== pathname) {
      return;
    }

    const token = ++activationTokenRef.current;
    const firstStep = pendingTour.steps[0];
    let cancelled = false;
    const readinessTimeoutIds: Array<ReturnType<typeof setTimeout>> = [];
    let mutationObserver: MutationObserver | null = null;
    let detachReadyStateListener: (() => void) | null = null;

    const stopWatching = () => {
      readinessTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      readinessTimeoutIds.length = 0;

      mutationObserver?.disconnect();
      mutationObserver = null;
      detachReadyStateListener?.();
      detachReadyStateListener = null;
    };

    const cleanup = () => {
      cancelled = true;
      stopWatching();
    };

    const activateIfCurrent = () => {
      if (cancelled || activationTokenRef.current !== token) {
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled || activationTokenRef.current !== token) {
            return;
          }

          setActiveTour(pendingTour);
          setCurrentStep(0);
          setPendingTour(null);
        });
      });
    };

    const firstTargetReady = () => {
      if (!firstStep?.selector) {
        return !hasVisibleGuideLoading();
      }

      return !hasVisibleGuideLoading() && resolveGuideTarget(firstStep.selector) !== null;
    };

    const pageReady = () => {
      if (typeof document === "undefined") {
        return false;
      }

      return document.readyState === "complete" || document.readyState === "interactive";
    };

    const tryActivate = () => {
      if (!pageReady() || !firstTargetReady()) {
        return;
      }

      stopWatching();
      activateIfCurrent();
    };

    mutationObserver = new MutationObserver(() => {
      tryActivate();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    readinessTimeoutIds.push(setTimeout(tryActivate, 0));
    readinessTimeoutIds.push(setTimeout(tryActivate, 120));
    readinessTimeoutIds.push(setTimeout(tryActivate, 320));
    readinessTimeoutIds.push(setTimeout(tryActivate, 640));

    if (document.readyState === "loading") {
      const handleReadyState = () => {
        tryActivate();
      };

      document.addEventListener("readystatechange", handleReadyState);
      detachReadyStateListener = () => {
        document.removeEventListener("readystatechange", handleReadyState);
      };

      return cleanup;
    }

    tryActivate();
    return cleanup;
  }, [pathname, pendingTour]);

  useEffect(() => {
    clearStepCleanup();

    if (!activeTour) {
      return;
    }

    const step = activeTour.steps[currentStep];
    const cleanup = step?.onEnter?.();

    if (typeof cleanup === "function") {
      stepCleanupRef.current = cleanup;
    }

    return clearStepCleanup;
  }, [activeTour, currentStep, clearStepCleanup]);

  const startTour = useCallback(
    (tour: TourDefinition) => {
      teardownTourEffects();

      setActiveTour(null);
      setCurrentStep(0);
      setPendingTour(tour);

      if (tour.route && getRoutePath(tour.route) !== pathname) {
        router.push(tour.route);
        return;
      }
    },
    [pathname, router, teardownTourEffects],
  );

  const closeTour = useCallback(() => {
    activationTokenRef.current += 1;
    teardownTourEffects();
    setActiveTour(null);
    setPendingTour(null);
    setCurrentStep(0);
    activeTourRef.current = null;
  }, [teardownTourEffects]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStep < activeTour.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      closeTour();
    }
  }, [activeTour, currentStep, closeTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      if (!activeTour) return;
      setCurrentStep(Math.max(0, Math.min(index, activeTour.steps.length - 1)));
    },
    [activeTour],
  );

  return (
    <GuideTourContext.Provider
      value={{
        activeTour,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        closeTour,
        goToStep,
      }}
    >
      {children}
    </GuideTourContext.Provider>
  );
}
