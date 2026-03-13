"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ── Tipos ── */
export interface TourStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
  /** Posición del spotlight: "center" | "top" | "bottom" | "left" | "right" */
  position?:
    | "center"
    | "top"
    | "top-left"
    | "top-right"
    | "bottom"
    | "bottom-left"
    | "bottom-right";
}

export interface TourDefinition {
  id: string;
  title: string;
  /** Ruta del dashboard a la que se navega */
  route: string;
  steps: TourStep[];
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
  const [activeTour, setActiveTour] = useState<TourDefinition | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = useCallback(
    (tour: TourDefinition) => {
      // Navegar a la ruta correspondiente
      router.push(tour.route);
      // Pequeño delay para que la navegación ocurra antes de mostrar el overlay
      setTimeout(() => {
        setActiveTour(tour);
        setCurrentStep(0);
      }, 400);
    },
    [router],
  );

  const closeTour = useCallback(() => {
    setActiveTour(null);
    setCurrentStep(0);
  }, []);

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
