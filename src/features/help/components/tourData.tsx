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
} from "lucide-react";
import type { TourDefinition } from "./GuideTourProvider";
import {
  createGrammarBoardContextTour,
  createWritingBoardContextTour,
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
        title: "¡Bienvenido a Gokai!",
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
        selector: '[data-help-target="graph-nav"]',
        spotlightPadding: 16,
        position: "bottom",
      },
      {
        title: "Nodos del progreso",
        description:
          "Cada nodo resume una actividad o punto de avance. Al explorarlos entiendes qué ya completaste y qué sigue después.",
        icon: <TrendingUp className="w-6 h-6" />,
        selector: '[data-help-target="graph-canvas"] .react-flow__node',
        spotlightPadding: 14,
        position: "bottom-right",
      },
      {
        title: "Consejos para empezar",
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
          "Bienvenido a tu biblioteca personal. Aquí se organizan todos los kanji, vocabulario y contenido que has explorado o guardado.",
        icon: <Library className="w-6 h-6" />,
        selector: '[data-help-target="library-page"]',
        autoScroll: false,
        spotlightPadding: 18,
        position: "right",
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
        title: "Panel de revisiones",
        description:
          "Este es tu centro de revisiones. El sistema de repetición espaciada (SRS) programa automáticamente qué contenido necesitas repasar hoy.",
        icon: <Target className="w-6 h-6" />,
        selector: '[data-help-target="reviews-banner"]',
        spotlightPadding: 20,
        position: "bottom-right",
      },
      {
        title: "Estadísticas de revisión",
        description:
          "En la parte superior verás tus métricas: items pendientes, precisión y racha actual. Estos números te ayudan a medir tu rendimiento.",
        icon: <BarChart3 className="w-6 h-6" />,
        selector: '[data-help-target="reviews-banner"]',
        spotlightPadding: 20,
        position: "left",
      },
      {
        title: "Lista de ítems por repasar",
        description:
          "Los ítems se muestran ordenados por urgencia. Los rojos necesitan atención inmediata, los amarillos pronto, y los verdes están bien.",
        icon: <RefreshCw className="w-6 h-6" />,
        selector: '[data-help-target="reviews-pending"]',
        spotlightPadding: 18,
        position: "right",
      },
      {
        title: "Práctica de escritura",
        description:
          "Puedes practicar la escritura de kanji directamente desde las revisiones. Traza los caracteres y recibe feedback en tiempo real.",
        icon: <Award className="w-6 h-6" />,
        selector: '[data-help-target="reviews-cta"]',
        spotlightPadding: 18,
        position: "top-right",
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
          "Bienvenido a tu centro de métricas. Aquí puedes visualizar todo tu progreso de aprendizaje con gráficos detallados e intuitivos.",
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
        position: "right",
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
  createGrammarBoardContextTour({
    id: "grammar-board-guide",
    title: "Guia de Grammar",
    route: "/dashboard/graph/grammar",
    scopeSelector: '[data-help-surface="grammar-board"]',
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
    title: "Guia de Hiragana",
    route: "/dashboard/graph/writing?tab=hiragana",
    scopeSelector: '[data-help-surface="hiragana-board"]',
    scriptLabel: "hiragana",
    unitLabel: "kana",
    lessonSummary: "significado, lectura y trazado",
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
];

/** Map para acceder a un tour por su index */
export function getTourByIndex(index: number): TourDefinition | undefined {
  return tourDefinitions[index];
}

/** Map para acceder a un tour por su id */
export function getTourById(id: string): TourDefinition | undefined {
  return tourDefinitions.find((t) => t.id === id);
}
