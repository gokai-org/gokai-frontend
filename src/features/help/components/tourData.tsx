import React from "react";
import {
  GraduationCap,
  Library,
  Target,
  MessageCircle,
  BarChart3,
  Settings,
  BookOpen,
  Search,
  Star,
  Filter,
  RefreshCw,
  Send,
  Mic,
  TrendingUp,
  Calendar,
  Award,
  Bell,
  Palette,
  Lock,
  Eye,
  HelpCircle,
  Inbox,
  LifeBuoy,
  ListFilter,
  PanelsTopLeft,
} from "lucide-react";
import type { TourDefinition } from "./GuideTourProvider";
import {
  createGrammarBoardContextTour,
  createGrammarBoardWelcomeTour,
  createWritingBoardContextTour,
  createWritingBoardWelcomeTour,
} from "@/features/help/utils/contextualTours";
import {
  dispatchHelpGuideGrammar,
  dispatchHelpGuideLibraryReset,
  dispatchHelpGuideSection,
  dispatchHelpGuideWriting,
} from "@/features/help/utils/guideEvents";

/**
 * Definiciones de tours para las guías del Centro de Ayuda.
 * Cada tour describe los pasos generales de cada página del dashboard.
 */
export const tourDefinitions: TourDefinition[] = [
  /* ═══════════════════════════════════════════════════════
     1. PRIMEROS PASOS  →  /dashboard/lessons
     ═══════════════════════════════════════════════════════ */
  {
    id: "getting-started",
    title: "Primeros pasos",
    route: "/dashboard/graph",
    steps: [
      {
        title: "Tu mapa para empezar",
        description:
          "Esta es tu vista de exploración. Desde aquí ves tu mapa de progreso general y decides a qué ruta de aprendizaje entrar.",
        icon: <GraduationCap className="w-6 h-6" />,
        selector: '[data-help-target="graph-canvas"]',
        spotlightPadding: 20,
        position: "right",
      },
      {
        title: "Navegación del mapa",
        description:
          "Esta barra te deja cambiar rápidamente entre explorar, gramática y escritura sin perder el contexto del dashboard.",
        icon: <BookOpen className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Nodos del progreso",
        description:
          "Cada nodo resume una actividad o punto de avance. Al explorarlos entiendes qué ya completaste y qué sigue después.",
        icon: <TrendingUp className="w-6 h-6" />,
        selector: '[data-help-target="graph-canvas"] .react-flow__node',
        spotlightPadding: 14,
        position: "center",
      },
      {
        title: "Qué hacer después",
        description:
          "Usa esta pantalla como punto de orientación: explora primero, luego entra a gramática o escritura según tu siguiente objetivo.",
        icon: <Star className="w-6 h-6" />,
        selector: '[data-help-target="graph-canvas"]',
        spotlightPadding: 20,
        position: "left",
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════
     2. EXPLORAR BIBLIOTECA  →  /dashboard/library
     ═══════════════════════════════════════════════════════ */
  {
    id: "explore-library",
    title: "Explorar la biblioteca",
    route: "/dashboard/library",
    steps: [
      {
        title: "Biblioteca de contenido",
        description:
          "Aquí se organiza tu contenido personal: kanji, vocabulario y recursos que has explorado o guardado para volver a ellos rápido.",
        icon: <Library className="w-6 h-6" />,
        selector: '[data-help-target="library-page"]',
        autoScroll: false,
        spotlightPadding: 20,
        position: "bottom-right",
        onEnter: () => {
          dispatchHelpGuideLibraryReset();
        },
      },
      {
        title: "Filtros por categoría",
        description:
          "Usa los filtros superiores para navegar entre categorías: Kanji, Vocabulario, Gramática y más. Encuentra exactamente lo que buscas.",
        icon: <Filter className="w-6 h-6" />,
        selector: '[data-help-target="library-categories"]',
        spotlightPadding: 14,
        position: "bottom",
      },
      {
        title: "Tarjetas de contenido",
        description:
          "Esta sección central reúne el catálogo principal y te muestra cuántos elementos tienes disponibles para explorar.",
        icon: <Eye className="w-6 h-6" />,
        selector: '[data-help-target="library-main-overview"]',
        spotlightPadding: 14,
        position: "right",
      },
      {
        title: "Favoritos y recientes",
        description:
          "Marca contenido como favorito con ★ para acceder rápidamente. La sección de recientes muestra lo que has consultado últimamente.",
        icon: <Star className="w-6 h-6" />,
        selector: '[data-help-target="library-recent"]',
        spotlightPadding: 18,
        position: "left",
      },
      {
        title: "Búsqueda avanzada",
        description:
          "Usa el buscador para encontrar kanji por significado, lectura o número de trazos. Es la forma más rápida de localizar cualquier contenido.",
        icon: <Search className="w-6 h-6" />,
        selector: '[data-help-target="library-search"]',
        spotlightPadding: 14,
        position: "bottom",
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════
     3. SISTEMA DE REVISIONES  →  /dashboard/reviews
     ═══════════════════════════════════════════════════════ */
  {
    id: "review-system",
    title: "Sistema de revisiones",
    route: "/dashboard/reviews",
    steps: [
      {
        title: "Kazu y tus repasos",
        description:
          "Kazu muestra el estado de tu constancia. Si dejas pasar los repasos, sus colores se van apagando para avisarte que toca practicar.",
        icon: <Target className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Mantener sus colores",
        description:
          "Al realizar repasos, Kazu recupera color y refleja que tu conocimiento sigue activo. La racha y el estado te ayudan a leer ese progreso rápido.",
        icon: <BarChart3 className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Sesión recomendada",
        description:
          "Este panel resume cuántas lecciones están listas y te da el botón principal para empezar el repaso del día.",
        icon: <Award className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Tipos de repaso",
        description:
          "Estas categorías separan lo urgente, lo recomendado y lo estable para que sepas qué necesita atención primero.",
        icon: <RefreshCw className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Repasos pendientes",
        description:
          "Aquí aparecen los ítems listos para practicar. Completar esta lista mantiene activo tu progreso y ayuda a que Kazu conserve sus colores.",
        icon: <BookOpen className="w-6 h-6" />,
        position: "center",
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════
     4. CHATBOT  →  /dashboard/chatbot
     ═══════════════════════════════════════════════════════ */
  {
    id: "chatbot-guide",
    title: "Chatbot de conversación",
    route: "/dashboard/chatbot",
    steps: [
      {
        title: "Asistente de conversación",
        description:
          "Conoce a tu compañero de práctica. El chatbot con IA te permite practicar japonés en conversaciones naturales y recibir correcciones al instante.",
        icon: <MessageCircle className="w-6 h-6" />,
        selector: '[data-help-target="chat-conversation"]',
        spotlightPadding: 18,
        position: "right",
      },
      {
        title: "Área de mensajes",
        description:
          "Los mensajes se muestran como una conversación natural. Las correcciones aparecen resaltadas para que identifiques tus errores fácilmente.",
        icon: <Eye className="w-6 h-6" />,
        selector: '[data-help-target="chat-messages"]',
        spotlightPadding: 16,
        position: "right",
      },
      {
        title: "Escribir un mensaje",
        description:
          "Escribe en japonés o español en el campo inferior. El chatbot responderá en japonés y te ayudará a mejorar tu expresión.",
        icon: <Send className="w-6 h-6" />,
        selector: '[data-help-target="chat-input"]',
        spotlightPadding: 16,
        position: "top",
      },
      {
        title: "Entrada por voz",
        description:
          "Usa el micrófono para practicar tu pronunciación. El chatbot transcribirá lo que dices y te dará retroalimentación sobre tu habla.",
        icon: <Mic className="w-6 h-6" />,
        selector: '[data-help-target="chat-mic"]',
        spotlightPadding: 14,
        position: "top-right",
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════
     5. ESTADÍSTICAS  →  /dashboard/statistics
     ═══════════════════════════════════════════════════════ */
  {
    id: "statistics-guide",
    title: "Estadísticas y progreso",
    route: "/dashboard/statistics",
    steps: [
      {
        title: "Panel de estadísticas",
        description:
          "Aquí lees tu progreso con métricas claras: actividad, precisión, racha y señales para decidir qué reforzar después.",
        icon: <BarChart3 className="w-6 h-6" />,
        selector: '[data-help-target="stats-banner"]',
        spotlightPadding: 18,
        position: "bottom-right",
      },
      {
        title: "Resumen general",
        description:
          "Las tarjetas superiores muestran tus métricas clave: kanji aprendidos, precisión en revisiones, tiempo de estudio y racha actual.",
        icon: <TrendingUp className="w-6 h-6" />,
        selector: '[data-help-target="stats-overview"]',
        spotlightPadding: 16,
        position: "right",
      },
      {
        title: "Gráficos de actividad",
        description:
          "Los gráficos de barras y radar muestran tu actividad semanal y habilidades por categoría. Filtra por semana, mes o todo el tiempo.",
        icon: <BarChart3 className="w-6 h-6" />,
        selector: '[data-help-target="stats-activity"]',
        spotlightPadding: 18,
        position: "right",
      },
      {
        title: "Calendario de racha",
        description:
          "El calendario muestra tus días de estudio consecutivos. Mantener una racha activa es la mejor forma de progresar constantemente.",
        icon: <Calendar className="w-6 h-6" />,
        selector: '[data-help-target="stats-streak"]',
        spotlightPadding: 18,
        position: "top-right",
      },
    ],
  },

  /* ═══════════════════════════════════════════════════════
     6. PERSONALIZACIÓN  →  /dashboard/configuration
     ═══════════════════════════════════════════════════════ */
  {
    id: "personalization-guide",
    title: "Personalización",
    route: "/dashboard/configuration",
    steps: [
      {
        title: "Centro de configuración",
        description:
          "Aquí puedes personalizar toda tu experiencia en Gokai. La barra lateral izquierda te permite navegar entre las distintas secciones.",
        icon: <Settings className="w-6 h-6" />,
        selector: '[data-help-target="settings-sidebar"]',
        spotlightPadding: 16,
        position: "right",
        onEnter: () => {
          dispatchHelpGuideSection("general");
        },
      },
      {
        title: "Notificaciones",
        description:
          "Configura la frecuencia de notificaciones por email, alertas prioritarias y define horarios silenciosos para no ser interrumpido.",
        icon: <Bell className="w-6 h-6" />,
        selector: '[data-help-target="settings-notifications"]',
        spotlightPadding: 16,
        position: "left",
        onEnter: () => {
          dispatchHelpGuideSection("notifications");
        },
      },
      {
        title: "Apariencia y accesibilidad",
        description:
          "Activa el modo oscuro, ajusta el tamaño de fuente, elige la tipografía japonesa y habilita opciones de alto contraste o reducción de animaciones.",
        icon: <Palette className="w-6 h-6" />,
        selector: '[data-help-target="settings-appearance"]',
        spotlightPadding: 16,
        position: "left",
        onEnter: () => {
          dispatchHelpGuideSection("appearance");
        },
      },
      {
        title: "Preferencias de estudio",
        description:
          "Define tu meta diaria de estudio, la cantidad de repasos por día y activa recordatorios para tus revisiones pendientes.",
        icon: <BookOpen className="w-6 h-6" />,
        selector: '[data-help-target="settings-learning"]',
        spotlightPadding: 16,
        position: "left",
        onEnter: () => {
          dispatchHelpGuideSection("learning");
        },
      },
      {
        title: "Privacidad y cuenta",
        description:
          "Gestiona tus datos personales, seguridad de la cuenta, autenticación 2FA y opciones de privacidad todo desde un solo lugar.",
        icon: <Lock className="w-6 h-6" />,
        selector: '[data-help-target="settings-privacy"]',
        spotlightPadding: 16,
        position: "left",
        onEnter: () => {
          dispatchHelpGuideSection("privacy");
        },
      },
    ],
  },
  {
    id: "notices-guide",
    title: "Centro de avisos",
    route: "/dashboard/notices",
    steps: [
      {
        title: "Centro de notificaciones",
        description:
          "Aquí ves avisos importantes sobre lecciones, repasos, logros y cambios de la plataforma.",
        icon: <Inbox className="w-6 h-6" />,
        selector: '[data-help-target="notices-banner"]',
        spotlightPadding: 18,
        position: "bottom-right",
      },
      {
        title: "Búsqueda y filtros rápidos",
        description:
          "Usa el buscador y el filtro de no leídas para encontrar mensajes importantes sin revisar todo el historial.",
        icon: <ListFilter className="w-6 h-6" />,
        selector: '[data-help-target="notices-tools"]',
        spotlightPadding: 14,
        position: "bottom",
      },
      {
        title: "Categorías de avisos",
        description:
          "Cambia entre tipos de aviso para separar actualizaciones, logros, repasos y recordatorios de estudio.",
        icon: <PanelsTopLeft className="w-6 h-6" />,
        selector: '[data-help-target="notices-categories"]',
        spotlightPadding: 14,
        position: "bottom",
      },
      {
        title: "Lista de notificaciones",
        description:
          "Cada tarjeta puede marcarse como leída, fijarse o eliminarse. Las no leídas quedan resaltadas para que no se pierdan.",
        icon: <Bell className="w-6 h-6" />,
        selector: '[data-help-target="notices-list"]',
        spotlightPadding: 16,
        position: "right",
      },
    ],
  },
  {
    id: "help-center-guide",
    title: "Centro de ayuda",
    route: "/dashboard/help",
    steps: [
      {
        title: "Buscar ayuda",
        description:
          "Usa este encabezado para buscar respuestas y saltar rápidamente a las preguntas frecuentes.",
        icon: <Search className="w-6 h-6" />,
        selector: '[data-help-target="help-banner"]',
        spotlightPadding: 18,
        position: "bottom-right",
      },
      {
        title: "Pestañas del centro",
        description:
          "Cambia entre guías, preguntas frecuentes y consejos según el tipo de apoyo que necesites.",
        icon: <PanelsTopLeft className="w-6 h-6" />,
        selector: '[data-help-target="help-tabs"]',
        spotlightPadding: 14,
        position: "bottom",
      },
      {
        title: "Guías por página",
        description:
          "Estas tarjetas abren recorridos visuales de cada sección del dashboard con los mismos controles de esta guía.",
        icon: <HelpCircle className="w-6 h-6" />,
        selector: '[data-help-target="help-guides"]',
        spotlightPadding: 16,
        position: "right",
      },
      {
        title: "Contactar soporte",
        description:
          "Si necesitas ayuda directa, desde aquí puedes abrir el formulario de soporte sin salir del centro de ayuda.",
        icon: <LifeBuoy className="w-6 h-6" />,
        selector: '[data-help-target="help-support"]',
        spotlightPadding: 16,
        position: "top-right",
      },
    ],
  },
  createGrammarBoardContextTour({
    id: "grammar-board-guide",
    title: "Guía de Gramática",
    route: "/dashboard/graph/grammar",
    scopeSelector: '[data-help-surface="grammar-board"]',
    boardGameLabel: "Sugoroku",
    unlockFlowDescription:
      "El recorrido se desbloquea como una espiral: en escritorio comienza en la esquina inferior izquierda y avanza hacia el centro; en celular empieza arriba a la izquierda para que el camino sea más legible.",
    focusLesson: () => {
      dispatchHelpGuideGrammar("focus");
    },
    openLesson: () => {
      dispatchHelpGuideGrammar("open");
    },
    resetTourState: () => {
      dispatchHelpGuideGrammar("reset");
    },
  }),
  createWritingBoardContextTour({
    id: "hiragana-writing-guide",
    title: "Guía de Escritura",
    route: "/dashboard/graph/writing?tab=hiragana",
    scopeSelector: '[data-help-surface="hiragana-board"]',
    scriptLabel: "hiragana",
    unitLabel: "kana",
    lessonSummary: "significado, lectura y trazado",
    boardGameLabel: "shōgi",
    welcomeDescription:
      "Bienvenido al tablero de shōgi. Hiragana es el primer tablero disponible y desde aquí empiezas a aprender cada kana.",
    unlockFlowDescription:
      "Hiragana está disponible desde el inicio. Completa sus kanas para avanzar con seguridad y abrir el camino hacia Katakana.",
    focusNode: () => {
      dispatchHelpGuideWriting("hiragana", "focus");
    },
    openLesson: () => {
      dispatchHelpGuideWriting("hiragana", "open");
    },
    resetTourState: () => {
      dispatchHelpGuideWriting("hiragana", "reset");
    },
    includeScriptTabs: true,
  }),
  createWritingBoardContextTour({
    id: "katakana-writing-guide",
    title: "Guía de Katakana",
    route: "/dashboard/graph/writing?tab=katakana",
    scopeSelector: '[data-help-surface="katakana-board"]',
    scriptLabel: "katakana",
    unitLabel: "kana",
    lessonSummary: "significado, lectura y trazado",
    boardGameLabel: "mahjong",
    welcomeDescription:
      "Bienvenido al tablero de mahjong. Aquí aprenderás katakana cuando hayas pasado Hiragana y el tablero quede desbloqueado.",
    unlockFlowDescription:
      "Katakana permanece bloqueado hasta que avances lo suficiente en Hiragana. Cuando se desbloquee, cada kana abrirá su lección y práctica.",
    focusNode: () => {
      dispatchHelpGuideWriting("katakana", "focus");
    },
    openLesson: () => {
      dispatchHelpGuideWriting("katakana", "open");
    },
    resetTourState: () => {
      dispatchHelpGuideWriting("katakana", "reset");
    },
    includeScriptTabs: true,
  }),
  createWritingBoardContextTour({
    id: "kanji-writing-guide",
    title: "Guía de Kanjis",
    route: "/dashboard/graph/writing?tab=kanji",
    scopeSelector: '[data-help-surface="kanji-board"]',
    scriptLabel: "kanjis",
    unitLabel: "kanji",
    lessonSummary: "símbolo, lecturas, significados y escritura",
    boardGameLabel: "go",
    welcomeDescription:
      "Bienvenido al tablero de go. Aquí aprenderás kanjis cuando consigas los puntos necesarios para desbloquearlos.",
    unlockFlowDescription:
      "Los kanjis permanecen bloqueados hasta que consigas los puntos necesarios. Cuando un kanji esté disponible, la guía te mostrará su lección y práctica.",
    focusNode: () => {
      dispatchHelpGuideWriting("kanji", "focus");
    },
    openLesson: () => {
      dispatchHelpGuideWriting("kanji", "open");
    },
    resetTourState: () => {
      dispatchHelpGuideWriting("kanji", "reset");
    },
    includeScriptTabs: true,
  }),
  createGrammarBoardWelcomeTour({
    id: "grammar-first-run-guide",
    title: "Bienvenida a Gramática",
    route: "/dashboard/graph/grammar",
    scopeSelector: '[data-help-surface="grammar-board"]',
    focusLesson: (target) => {
      dispatchHelpGuideGrammar("focus", target);
    },
    resetTourState: () => {
      dispatchHelpGuideGrammar("reset");
    },
  }),
  createWritingBoardWelcomeTour({
    id: "hiragana-first-run-guide",
    title: "Bienvenida a Hiragana",
    route: "/dashboard/graph/writing?tab=hiragana",
    scopeSelector: '[data-help-surface="hiragana-board"]',
    boardGameLabel: "shōgi",
    introDescription:
      "Este tablero de shōgi es tu primera ruta de escritura. Aquí empiezas con hiragana y ves cómo cada kana abre el siguiente paso.",
    unlockDescription:
      "Hiragana está disponible desde el inicio. Al completar sus prácticas, el avance queda preparado para desbloquear Katakana con más contexto.",
    pathDescription:
      "La cámara recorre el orden real del tablero para que ubiques de un vistazo por dónde empieza tu camino y cómo progresa.",
    focusNode: (target) => {
      dispatchHelpGuideWriting("hiragana", "focus", target);
    },
    resetTourState: () => {
      dispatchHelpGuideWriting("hiragana", "reset");
    },
  }),
  createWritingBoardWelcomeTour({
    id: "katakana-first-run-guide",
    title: "Bienvenida a Katakana",
    route: "/dashboard/graph/writing?tab=katakana",
    scopeSelector: '[data-help-surface="katakana-board"]',
    boardGameLabel: "mahjong",
    introDescription:
      "Este tablero de mahjong organiza katakana. Al entrar por primera vez, la guía te muestra el tablero sin abrir lecciones todavía.",
    unlockDescription:
      "Katakana se desbloquea después de avanzar en Hiragana. Si todavía está cerrado, la ayuda contextual te dirá exactamente qué falta.",
    pathDescription:
      "Cuando haya kanas disponibles, la cámara seguirá el camino real de estudio para que entiendas cómo se conecta cada ficha.",
    focusNode: (target) => {
      dispatchHelpGuideWriting("katakana", "focus", target);
    },
    resetTourState: () => {
      dispatchHelpGuideWriting("katakana", "reset");
    },
  }),
  createWritingBoardWelcomeTour({
    id: "kanji-first-run-guide",
    title: "Bienvenida a Kanjis",
    route: "/dashboard/graph/writing?tab=kanji",
    scopeSelector: '[data-help-surface="kanji-board"]',
    boardGameLabel: "go",
    introDescription:
      "Este tablero de go reúne los kanjis. La primera visita se queda en el mapa para que entiendas el flujo antes de entrar a una lección.",
    unlockDescription:
      "Los kanjis dependen de puntos y desbloqueos. Si aún no hay uno disponible, la ayuda contextual mostrará el requisito en lugar de forzar pasos internos.",
    pathDescription:
      "Cuando el tablero tenga kanjis abiertos, la cámara recorre el orden real para que veas cómo avanzar entre posiciones.",
    focusNode: (target) => {
      dispatchHelpGuideWriting("kanji", "focus", target);
    },
    resetTourState: () => {
      dispatchHelpGuideWriting("kanji", "reset");
    },
  }),
];

/** Map para acceder a un tour por su index */
export function getTourByIndex(index: number): TourDefinition | undefined {
  return tourDefinitions[index];
}

/** Map para acceder a un tour por su id */
export function getTourById(id: string): TourDefinition | undefined {
  return tourDefinitions.find((t) => t.id === id);
}
