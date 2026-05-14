"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  useGuideTour,
  type TourDefinition,
  type TourStep,
} from "@/features/help/components/GuideTourProvider";
import { getTourById } from "@/features/help/components/tourData";
import {
  activateFirstRunOnboardingSession,
  readFirstRunSeenPages,
  writeFirstRunSeenPages,
} from "@/features/help/utils/firstRunOnboardingState";

type OnboardingPageConfig = {
  pageId: string;
  pageName: string;
  tour: TourDefinition;
  prependIntro?: boolean;
  introTitle?: string;
  introDescription?: string;
};

type IntroCopy = {
  title: string;
  description: string;
};

function createPageIntroStep({ title, description }: IntroCopy): TourStep {
  return {
    title,
    description,
    icon: <Sparkles className="h-6 w-6" />,
    position: "center",
  };
}

function getIntroCopy(config: OnboardingPageConfig): IntroCopy {
  return {
    title: config.introTitle ?? `Bienvenido a ${config.pageName}`,
    description:
      config.introDescription ??
      `Aquí vas a entender lo esencial de ${config.pageName} en unos pasos claros.`,
  };
}

function cloneTourForFirstRun(
  config: OnboardingPageConfig,
  onComplete: () => void,
): TourDefinition {
  const introStep = createPageIntroStep(getIntroCopy(config));
  const shouldPrependIntro = config.prependIntro !== false;
  const introSteps = shouldPrependIntro ? [introStep] : [];

  return {
    ...config.tour,
    id: `first-run-${config.tour.id}`,
    title: "Primer recorrido",
    steps: [...introSteps, ...config.tour.steps],
    onClose: () => {
      config.tour.onClose?.();
      onComplete();
    },
  };
}

function getPageConfig(
  pathname: string | null,
  searchParams: URLSearchParams,
): OnboardingPageConfig | null {
  if (!pathname) return null;

  const byId = (id: string) => getTourById(id);

  if (pathname === "/dashboard/library") {
    const tour = byId("explore-library");
    return tour
      ? {
          pageId: "library",
          pageName: "Biblioteca",
          introTitle: "Aquí encuentras tu contenido",
          introDescription:
            "Usa la biblioteca para buscar, revisar y guardar kanji, vocabulario y gramática sin perder tiempo navegando.",
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/reviews") {
    const tour = byId("review-system");
    return tour
      ? {
          pageId: "reviews",
          pageName: "Repasos",
          introTitle: "Aquí vas a repasar lo importante",
          introDescription:
            "Esta sección te ayuda a volver justo a lo que necesita práctica para que tu memoria siga fresca.",
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/chatbot") {
    const tour = byId("chatbot-guide");
    return tour
      ? {
          pageId: "chatbot",
          pageName: "Chatbot",
          introTitle: "Aquí practicas conversación",
          introDescription:
            "El chatbot te da un espacio para escribir, hablar y recibir correcciones mientras practicas japonés en contexto.",
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/statistics") {
    const tour = byId("statistics-guide");
    return tour
      ? {
          pageId: "statistics",
          pageName: "Estadísticas",
          introTitle: "Aquí lees tu progreso",
          introDescription:
            "Estas métricas te ayudan a ver ritmo, constancia y áreas que conviene reforzar en tu rutina.",
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/configuration") {
    const tour = byId("personalization-guide");
    return tour
      ? {
          pageId: "configuration",
          pageName: "Configuración",
          introTitle: "Aquí ajustas tu experiencia",
          introDescription:
            "Configura preferencias, notificaciones y accesibilidad para que Gokai se adapte mejor a tu forma de estudiar.",
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/notices") {
    const tour = byId("notices-guide");
    return tour
      ? {
          pageId: "notices",
          pageName: "Avisos",
          introTitle: "Aquí revisas lo importante",
          introDescription:
            "Los avisos reúnen recordatorios, logros y novedades para que nada clave se pierda entre sesiones.",
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/help") {
    const tour = byId("help-center-guide");
    return tour
      ? {
          pageId: "help",
          pageName: "Ayuda",
          introTitle: "Aquí encuentras apoyo rápido",
          introDescription:
            "Este centro reúne guías, preguntas frecuentes y soporte para resolver dudas sin cortar tu sesión de estudio.",
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/graph/grammar") {
    const tour = byId("grammar-first-run-guide");
    return tour
      ? {
          pageId: "grammar",
          pageName: "Gramática",
          prependIntro: false,
          tour,
        }
      : null;
  }

  if (pathname === "/dashboard/graph/kanjis") {
    const tour = byId("kanji-first-run-guide");
    return tour
      ? {
          pageId: "writing-kanji",
          pageName: "Kanjis",
          prependIntro: false,
          tour: { ...tour, route: "/dashboard/graph/kanjis" },
        }
      : null;
  }

  if (
    pathname === "/dashboard/graph/writing" &&
    searchParams.get("tab") === "hiragana"
  ) {
    const tour = byId("hiragana-first-run-guide");
    return tour
      ? {
          pageId: "writing-hiragana",
          pageName: "Hiragana",
          prependIntro: false,
          tour,
        }
      : null;
  }

  if (
    pathname === "/dashboard/graph/writing" &&
    searchParams.get("tab") === "katakana"
  ) {
    const tour = byId("katakana-first-run-guide");
    return tour
      ? {
          pageId: "writing-katakana",
          pageName: "Katakana",
          prependIntro: false,
          tour,
        }
      : null;
  }

  if (
    pathname === "/dashboard/graph/writing" &&
    searchParams.get("tab") === "kanji"
  ) {
    const tour = byId("kanji-first-run-guide");
    return tour
      ? {
          pageId: "writing-kanji",
          pageName: "Kanjis",
          prependIntro: false,
          tour,
        }
      : null;
  }

  return null;
}

export function FirstRunOnboarding() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const { activeTour, pendingTour, startTour } = useGuideTour();
  const [enabled, setEnabled] = useState(false);
  const [seenPages, setSeenPages] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const isActive = activateFirstRunOnboardingSession();
      setEnabled(isActive);
      setSeenPages(isActive ? readFirstRunSeenPages() : new Set());
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentConfig = useMemo(
    () => getPageConfig(pathname, new URLSearchParams(search)),
    [pathname, search],
  );

  const markPageSeen = useCallback((pageId: string) => {
    setSeenPages((current) => {
      const next = new Set(current);
      next.add(pageId);
      writeFirstRunSeenPages(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled || !currentConfig || activeTour || pendingTour) {
      return;
    }

    if (seenPages.has(currentConfig.pageId)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startTour(
        cloneTourForFirstRun(currentConfig, () => {
          markPageSeen(currentConfig.pageId);
        }),
      );
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeTour,
    currentConfig,
    enabled,
    markPageSeen,
    pendingTour,
    seenPages,
    startTour,
  ]);

  return null;
}
