import {
  BookOpenText,
  Compass,
  LayoutPanelLeft,
  Layers3,
  MousePointerClick,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";
import type {
  TourDefinition,
  TourStep,
} from "@/features/help/components/GuideTourProvider";

type GuideSpotlightInsets = Partial<
  Record<"top" | "right" | "bottom" | "left", number>
>;

interface WritingBoardTourOptions {
  id: string;
  title: string;
  route?: string;
  scopeSelector: string;
  scriptLabel: string;
  unitLabel: string;
  lessonSummary: string;
  focusNode: () => void;
  openLesson: () => void;
  resetTourState: () => void;
  includeScriptTabs?: boolean;
  lessonOverviewSelector?: string;
  lessonOverviewSpotlightInsets?: GuideSpotlightInsets;
}

interface GrammarBoardTourOptions {
  id: string;
  title: string;
  route?: string;
  scopeSelector: string;
  focusLesson: () => void;
  openLesson: () => void;
  resetTourState: () => void;
}

interface LockedBoardTourOptions {
  id: string;
  title: string;
  scopeSelector: string;
  boardLabel: string;
  requirementLabel: string;
}

export function createWritingBoardContextTour({
  id,
  title,
  route,
  scopeSelector,
  scriptLabel,
  unitLabel,
  lessonSummary,
  focusNode,
  openLesson,
  resetTourState,
  includeScriptTabs = true,
  lessonOverviewSelector,
  lessonOverviewSpotlightInsets,
}: WritingBoardTourOptions): TourDefinition {
  const rawSteps: Array<TourStep | null> = [
    includeScriptTabs
      ? {
          title: "Cambio rápido de sistema",
          description:
            "Aquí cambias entre hiragana, katakana y kanji sin salir de la experiencia de escritura.",
          icon: <Compass className="h-6 w-6" />,
          selector: '[data-help-target="writing-script-tabs"]',
          spotlightPadding: 14,
          position: "bottom",
        }
      : null,
    {
      title: `Tablero de ${scriptLabel}`,
      description:
        "Este es el mapa principal. Puedes moverlo, hacer zoom y explorar tu progreso visualmente.",
      icon: <Layers3 className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
    },
    {
      title: `Nodos de ${unitLabel}`,
      description:
        `Cada nodo representa un ${unitLabel}. Aquí solo te mostramos cómo identificarlo dentro del tablero; la lección se abre en el siguiente paso.`,
      icon: <MousePointerClick className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="writing-focus-node"]`,
      spotlightPadding: 12,
      position: "right",
      onEnter: () => {
        focusNode();
      },
    },
    {
      title: "Lección del elemento activo",
      description:
        `Aquí ves la lección del ${unitLabel} seleccionado. Se abre como panel lateral para estudiar sin perder el contexto del tablero.`,
      icon: <PanelRightOpen className="h-6 w-6" />,
      selector:
        lessonOverviewSelector ??
        `${scopeSelector} [data-help-target="lesson-content"]`,
      spotlightPadding: 10,
      spotlightInsets: lessonOverviewSpotlightInsets,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
    {
      title: "Secciones de aprendizaje",
      description:
        `Estas pestañas dividen la lección en partes claras para que entiendas ${lessonSummary}.`,
      icon: <BookOpenText className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="lesson-section-tabs"]`,
      spotlightPadding: 12,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
    {
      title: "Contenido explicado paso a paso",
      description:
        "En esta zona se muestra la explicación activa con ejemplos visuales, reglas rápidas y apoyo para memorizar mejor.",
      icon: <Sparkles className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="lesson-section-content"]`,
      spotlightPadding: 14,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
    {
      title: "Práctica y quiz",
      description:
        "Desde aquí lanzas prácticas rápidas o el quiz principal para convertir la teoría en progreso real.",
      icon: <MousePointerClick className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="lesson-quiz-actions"]`,
      spotlightPadding: 12,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
  ];

  const steps = rawSteps.filter((step): step is TourStep => step !== null);

  return {
    id,
    title,
    route,
    steps,
    onClose: resetTourState,
  };
}

export function createGrammarBoardContextTour({
  id,
  title,
  route,
  scopeSelector,
  focusLesson,
  openLesson,
  resetTourState,
}: GrammarBoardTourOptions): TourDefinition {
  const steps: TourStep[] = [
    {
      title: "Tablero de gramática",
      description:
        "Aquí ves todo el recorrido de gramática. Cada casilla representa una lección dentro de la ruta de estudio.",
      icon: <Layers3 className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
    },
    {
      title: "Casilla seleccionada",
      description:
        "Esta casilla activa es un acceso directo a una lección disponible. Desde aquí entras al contenido detallado.",
      icon: <MousePointerClick className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-focus-cell"]`,
      spotlightPadding: 12,
      position: "right",
      onEnter: () => {
        focusLesson();
      },
    },
    {
      title: "Lección abierta",
      description:
        "La lección se abre en una ventana enfocada para que estudies la explicación sin perder el contexto del tablero.",
      icon: <PanelRightOpen className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-lesson-modal"]`,
      spotlightPadding: 12,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
    {
      title: "Secciones de la lección",
      description:
        "Aquí cambias entre conceptos, estructura y ejemplos para recorrer la explicación por bloques claros.",
      icon: <BookOpenText className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-lesson-panes"]`,
      spotlightPadding: 12,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
    {
      title: "Contenido explicado",
      description:
        "En esta zona se muestra el contenido principal de la lección con tablas, ejemplos y explicación detallada.",
      icon: <LayoutPanelLeft className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-lesson-active-frame"]`,
      spotlightPadding: 14,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
    {
      title: "Acciones de práctica",
      description:
        "Desde aquí puedes lanzar el examen de gramática cuando la lección tenga ejercicios disponibles.",
      icon: <Sparkles className="h-6 w-6" />,
      selector:
        `${scopeSelector} [data-help-target="grammar-lesson-exam"], ` +
        `${scopeSelector} [data-help-target="grammar-lesson-actions-fallback"]`,
      spotlightPadding: 12,
      position: "left",
      onEnter: () => {
        openLesson();
      },
    },
  ];

  return {
    id,
    title,
    route,
    steps,
    onClose: resetTourState,
  };
}

export function createLockedBoardAccessTour({
  id,
  title,
  scopeSelector,
  boardLabel,
  requirementLabel,
}: LockedBoardTourOptions): TourDefinition {
  return {
    id,
    title,
    steps: [
      {
        title: `${boardLabel} bloqueado`,
        description:
          `Todavía no tienes acceso a este tablero. Necesitas ${requirementLabel} para desbloquear sus primeros elementos y usar la guía completa.`,
        icon: <PanelRightOpen className="h-6 w-6" />,
        selector: `${scopeSelector} [data-help-target="board-canvas"]`,
        spotlightPadding: 18,
        position: "right",
      },
    ],
  };
}