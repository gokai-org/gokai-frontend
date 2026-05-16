import {
  BookOpenText,
  Compass,
  LayoutPanelLeft,
  Layers3,
  MapPinned,
  MousePointerClick,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";
import type {
  TourDefinition,
  TourStep,
} from "@/features/help/components/GuideTourProvider";
import type {
  HelpGuideGrammarDetail,
  HelpGuideWritingDetail,
} from "@/features/help/utils/guideEvents";

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
  boardGameLabel?: string;
  welcomeDescription?: string;
  unlockFlowDescription?: string;
  focusNode: (target?: HelpGuideWritingDetail["target"]) => void;
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
  boardGameLabel?: string;
  unlockFlowDescription?: string;
  focusLesson: (target?: HelpGuideGrammarDetail["target"]) => void;
  openLesson: () => void;
  resetTourState: () => void;
}

interface GrammarBoardWelcomeTourOptions {
  id: string;
  title: string;
  route?: string;
  scopeSelector: string;
  focusLesson: (target?: HelpGuideGrammarDetail["target"]) => void;
  resetTourState: () => void;
}

interface WritingBoardWelcomeTourOptions {
  id: string;
  title: string;
  route?: string;
  scopeSelector: string;
  boardGameLabel: string;
  introDescription: string;
  unlockDescription: string;
  pathDescription: string;
  focusNode: (target?: HelpGuideWritingDetail["target"]) => void;
  resetTourState: () => void;
}

interface LockedBoardTourOptions {
  id: string;
  title: string;
  scopeSelector: string;
  boardLabel: string;
  requirementLabel: string;
  targetName?: string;
}

interface VocabularyGraphTourOptions {
  id: string;
  title: string;
  route?: string;
  scopeSelector: string;
  focusMap: () => void;
  focusRegion: () => void | Promise<void>;
  focusThemeNode: () => void | Promise<void>;
  focusRecommendedSubtheme: () => void | Promise<void>;
  focusWordNode: () => void | Promise<void>;
  focusLessonTab: (tab: "meaning" | "listening" | "speaking" | "writing") => void | Promise<void>;
  openLesson: () => void | Promise<void>;
  focusCultureModeAction: () => void | Promise<void>;
  resetTourState: () => void;
}

export function createWritingBoardContextTour({
  id,
  title,
  route,
  scopeSelector,
  scriptLabel,
  unitLabel,
  lessonSummary,
  boardGameLabel,
  unlockFlowDescription,
  focusNode,
  openLesson,
  resetTourState,
  includeScriptTabs = true,
  lessonOverviewSelector,
  lessonOverviewSpotlightInsets,
}: WritingBoardTourOptions): TourDefinition {
  const boardLabel = boardGameLabel
    ? `tablero de ${boardGameLabel}`
    : `tablero de ${scriptLabel}`;

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
        `Este es el ${boardLabel}. Puedes moverlo, hacer zoom y revisar qué ${unitLabel} está disponible ahora.`,
      icon: <Layers3 className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
    },
    {
      title: "Desbloqueo del tablero",
      description:
        unlockFlowDescription ??
        "Los tableros de escritura se abren por progreso. Hiragana está disponible al comienzo; Katakana y Kanjis aparecen cuando cumples sus requisitos de avance o puntos.",
      icon: <MapPinned className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
    },
    {
      title: `Tu siguiente ${unitLabel}`,
      description:
        `La cámara se acerca al ${unitLabel} disponible para que veas exactamente qué estudiar ahora. Al completarlo, el tablero habilita el siguiente paso cuando cumplas el requisito.`,
      icon: <MousePointerClick className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="writing-focus-node"]`,
      spotlightPadding: 12,
      position: "right",
      onEnter: () => {
        focusNode("available");
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

export function createWritingBoardWelcomeTour({
  id,
  title,
  route,
  scopeSelector,
  boardGameLabel,
  introDescription,
  unlockDescription,
  pathDescription,
  focusNode,
  resetTourState,
}: WritingBoardWelcomeTourOptions): TourDefinition {
  const steps: TourStep[] = [
    {
      title: `Recorrido del tablero de ${boardGameLabel}`,
      description: introDescription,
      icon: <Sparkles className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
      onEnter: () => {
        focusNode("path");
      },
    },
    {
      title: "Cómo se abre el camino",
      description: unlockDescription,
      icon: <MapPinned className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
      onEnter: () => {
        focusNode("available");
      },
    },
    {
      title: "Orden de estudio",
      description: pathDescription,
      icon: <Layers3 className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
      onEnter: () => {
        focusNode("path");
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

export function createGrammarBoardContextTour({
  id,
  title,
  route,
  scopeSelector,
  boardGameLabel = "Sugoroku",
  unlockFlowDescription,
  focusLesson,
  openLesson,
  resetTourState,
}: GrammarBoardTourOptions): TourDefinition {
  const steps: TourStep[] = [
    {
      title: "Tablero de gramática",
      description:
        `Este es el tablero de ${boardGameLabel}. Cada casilla representa una lección y el recorrido se desbloquea con puntos y progreso.`,
      icon: <Layers3 className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
    },
    {
      title: "Flujo de desbloqueo",
      description:
        unlockFlowDescription ??
        "El recorrido avanza en espiral hacia el centro: en escritorio comienza en la esquina inferior izquierda y en celular desde la esquina superior izquierda. Cada casilla disponible marca el siguiente paso natural.",
      icon: <MapPinned className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
    },
    {
      title: "Casilla seleccionada",
      description:
        "La cámara destaca una casilla disponible para que identifiques qué estudiar ahora. Al abrirla entras al contenido detallado de esa lección.",
      icon: <MousePointerClick className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-focus-cell"]`,
      spotlightPadding: 12,
      position: "right",
      onEnter: () => {
        focusLesson("available");
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
  targetName = "board-canvas",
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
        selector: `${scopeSelector} [data-help-target="${targetName}"]`,
        spotlightPadding: 18,
        position: "right",
      },
    ],
  };
}

export function createVocabularyGraphContextTour({
  id,
  title,
  route,
  scopeSelector,
  focusMap,
  focusRegion,
  focusThemeNode,
  focusRecommendedSubtheme,
  focusWordNode,
  openLesson,
  focusCultureModeAction,
  resetTourState,
}: VocabularyGraphTourOptions): TourDefinition {
  const regionSpotlightSelector = `${scopeSelector} [data-help-target="vocabulary-selected-region"]`;
  const themeSpotlightSelector = `${scopeSelector} [data-help-target="vocabulary-theme-node"]`;
  const recommendedSubthemeSpotlightSelector = `${scopeSelector} [data-help-target="vocabulary-recommended-subtheme-node"]`;
  const wordSpotlightSelector = `${scopeSelector} [data-help-target="vocabulary-word-node"]`;

  const steps: TourStep[] = [
    {
      title: "Mapa de vocabulario",
      description:
        "Este mapa organiza tu avance por regiones de Japón. Desde aquí bajas por capas: región, tema, subtema y palabra.",
      icon: <Layers3 className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="graph-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
      onEnter: () => {
        focusMap();
      },
    },
    {
      title: "Región enfocada",
      description:
        "Al tocar una región, la cámara la centra para que puedas verla clara y separada del resto del mapa antes de bajar a sus intereses.",
      icon: <MapPinned className="h-6 w-6" />,
      selector: regionSpotlightSelector,
      spotlightPadding: 16,
      spotlightShape: "round",
      position: "top-right",
      stepTargetTimeout: 4000,
      onEnter: () => {
        void focusRegion();
      },
    },
    {
      title: "Interés desbloqueado",
      description:
        "Aquí aparece el interés principal disponible dentro de la región. Este es el punto de entrada al recorrido: desde aquí bajas al subtema recomendado para empezar a estudiar.",
      icon: <Compass className="h-6 w-6" />,
      selector: themeSpotlightSelector,
      spotlightPadding: 16,
      spotlightShape: "round",
      position: "top-right",
      stepTargetTimeout: 4000,
      onEnter: () => {
        void focusThemeNode();
      },
    },
    {
      title: "Subtema recomendado",
      description:
        "Al entrar al interés, la guía abre el subtema recomendado para mostrarte la rama más útil o más alineada con tu recorrido actual.",
      icon: <Sparkles className="h-6 w-6" />,
      selector: recommendedSubthemeSpotlightSelector,
      spotlightPadding: 16,
      spotlightShape: "round",
      position: "top-right",
      stepTargetTimeout: 6000,
      onEnter: () => {
        void focusRecommendedSubtheme();
      },
    },
    {
      title: "Palabra disponible",
      description:
        "Después de entrar al subtema, el grafo baja al nivel de palabras. Aquí ves la siguiente palabra lista para abrir y estudiar dentro de esa rama.",
      icon: <MousePointerClick className="h-6 w-6" />,
      selector: wordSpotlightSelector,
      spotlightPadding: 16,
      spotlightShape: "round",
      position: "top-right",
      stepTargetTimeout: 8000,
      onEnter: () => {
        void focusWordNode();
      },
    },
    {
      title: "Modal de la palabra",
      description:
        "Al abrir la palabra, aparece su modal de estudio con significado, audio, pronunciación y escritura para que entiendas qué contiene antes de empezar a practicar.",
      icon: <PanelRightOpen className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="lesson-drawer"]`,
      spotlightPadding: 12,
      position: "left",
      stepTargetTimeout: 10000,
      onEnter: () => {
        void openLesson();
      },
    },
    {
      title: "Modo cultura",
      description:
        "Después de cerrar el modal, la guía vuelve al mapa y te muestra este acceso para entrar al modo cultura y explorar pistas culturales por región.",
      icon: <Compass className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="vocabulary-help-action-culture-exploration-mode"]`,
      spotlightPadding: 10,
      position: "left",
      stepTargetTimeout: 6000,
      onEnter: () => {
        void focusCultureModeAction();
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

export function createGrammarBoardWelcomeTour({
  id,
  title,
  route,
  scopeSelector,
  focusLesson,
  resetTourState,
}: GrammarBoardWelcomeTourOptions): TourDefinition {
  const steps: TourStep[] = [
    {
      title: "Recorrido del Sugoroku",
      description:
        "La cámara recorre el tablero en el orden en que se desbloquean las casillas, desde el inicio del camino hasta la meta.",
      icon: <Sparkles className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-board-canvas"]`,
      spotlightPadding: 18,
      position: "top-right",
      onEnter: () => {
        focusLesson("path");
      },
    },
    {
      title: "Primera lección bloqueada",
      description:
        "Para desbloquear la primera lección de gramática necesitas 35 puntos. Cuando tengas los puntos, mantén presionada la casilla disponible para abrirla.",
      icon: <MapPinned className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-focus-cell"]`,
      spotlightPadding: 12,
      position: "right",
      onEnter: () => {
        focusLesson("next");
      },
    },
    {
      title: "El recorrido se va abriendo",
      description:
        "La cámara recorre el tablero para mostrar cómo el camino avanza por casillas. Cada nueva lección pide puntos o completar lo anterior.",
      icon: <Layers3 className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-focus-cell"]`,
      spotlightPadding: 12,
      position: "right",
      onEnter: () => {
        focusLesson("outer");
      },
    },
    {
      title: "Del borde al centro",
      description:
        "En escritorio el Sugoroku rodea el tablero desde la esquina inferior izquierda hasta el centro. En celular se adapta desde arriba para que el camino sea legible.",
      icon: <MousePointerClick className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-focus-cell"]`,
      spotlightPadding: 12,
      position: "right",
      onEnter: () => {
        focusLesson("inner");
      },
    },
    {
      title: "Meta del tablero",
      description:
        "El centro representa el final de esta ruta. Esta bienvenida no abre lecciones; cuando tengas una casilla desbloqueada, la guía de ayuda normal te mostrará qué hay dentro.",
      icon: <Sparkles className="h-6 w-6" />,
      selector: `${scopeSelector} [data-help-target="grammar-focus-cell"]`,
      spotlightPadding: 12,
      position: "left",
      onEnter: () => {
        focusLesson("goal");
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