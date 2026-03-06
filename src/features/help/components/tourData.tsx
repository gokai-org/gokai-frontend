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

/**
 * Definiciones de tours para las 6 guías del Centro de Ayuda.
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
          "Esta es tu página principal de aprendizaje. Aquí encontrarás lecciones estructuradas o recomendadas para avanzar en tu estudio de japonés paso a paso.",
        icon: <GraduationCap className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Lecciones disponibles",
        description:
          "Las lecciones se organizan por temas y niveles. Comienza con hiragana y katakana antes de pasar a kanji y gramática.",
        icon: <BookOpen className="w-6 h-6" />,
        position: "top",
      },
      {
        title: "Tu progreso",
        description:
          "A medida que completes lecciones, tu progreso se guardará automáticamente. Puedes retomar donde lo dejaste en cualquier momento.",
        icon: <TrendingUp className="w-6 h-6" />,
        position: "bottom",
      },
      {
        title: "Consejos para empezar",
        description:
          "Te recomendamos dedicar al menos 15 minutos diarios. La consistencia es más importante que la intensidad. ¡Tú puedes!",
        icon: <Star className="w-6 h-6" />,
        position: "center",
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
        position: "center",
      },
      {
        title: "Filtros por categoría",
        description:
          "Usa los filtros superiores para navegar entre categorías: Kanji, Vocabulario, Gramática y más. Encuentra exactamente lo que buscas.",
        icon: <Filter className="w-6 h-6" />,
        position: "top",
      },
      {
        title: "Tarjetas de contenido",
        description:
          "Cada tarjeta muestra un resumen del contenido: significado, lecturas y nivel. Haz clic para ver los detalles completos con trazos animados.",
        icon: <Eye className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Favoritos y recientes",
        description:
          "Marca contenido como favorito con ★ para acceder rápidamente. La sección de recientes muestra lo que has consultado últimamente.",
        icon: <Star className="w-6 h-6" />,
        position: "bottom",
      },
      {
        title: "Búsqueda avanzada",
        description:
          "Usa el buscador para encontrar kanji por significado, lectura o número de trazos. Es la forma más rápida de localizar cualquier contenido.",
        icon: <Search className="w-6 h-6" />,
        position: "top",
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
        position: "center",
      },
      {
        title: "Estadísticas de revisión",
        description:
          "En la parte superior verás tus métricas: items pendientes, precisión y racha actual. Estos números te ayudan a medir tu rendimiento.",
        icon: <BarChart3 className="w-6 h-6" />,
        position: "top",
      },
      {
        title: "Lista de ítems por repasar",
        description:
          "Los ítems se muestran ordenados por urgencia. Los rojos necesitan atención inmediata, los amarillos pronto, y los verdes están bien.",
        icon: <RefreshCw className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Práctica de escritura",
        description:
          "Puedes practicar la escritura de kanji directamente desde las revisiones. Traza los caracteres y recibe feedback en tiempo real.",
        icon: <Award className="w-6 h-6" />,
        position: "bottom",
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
        position: "center",
      },
      {
        title: "Área de mensajes",
        description:
          "Los mensajes se muestran como una conversación natural. Las correcciones aparecen resaltadas para que identifiques tus errores fácilmente.",
        icon: <Eye className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Escribir un mensaje",
        description:
          "Escribe en japonés o español en el campo inferior. El chatbot responderá en japonés y te ayudará a mejorar tu expresión.",
        icon: <Send className="w-6 h-6" />,
        position: "bottom",
      },
      {
        title: "Entrada por voz",
        description:
          "Usa el micrófono para practicar tu pronunciación. El chatbot transcribirá lo que dices y te dará retroalimentación sobre tu habla.",
        icon: <Mic className="w-6 h-6" />,
        position: "bottom",
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
        position: "center",
      },
      {
        title: "Resumen general",
        description:
          "Las tarjetas superiores muestran tus métricas clave: kanji aprendidos, precisión en revisiones, tiempo de estudio y racha actual.",
        icon: <TrendingUp className="w-6 h-6" />,
        position: "top",
      },
      {
        title: "Gráficos de actividad",
        description:
          "Los gráficos de barras y radar muestran tu actividad semanal y habilidades por categoría. Filtra por semana, mes o todo el tiempo.",
        icon: <BarChart3 className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Calendario de racha",
        description:
          "El calendario muestra tus días de estudio consecutivos. Mantener una racha activa es la mejor forma de progresar constantemente.",
        icon: <Calendar className="w-6 h-6" />,
        position: "bottom",
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
        position: "center",
      },
      {
        title: "Notificaciones",
        description:
          "Configura la frecuencia de notificaciones por email, alertas prioritarias y define horarios silenciosos para no ser interrumpido.",
        icon: <Bell className="w-6 h-6" />,
        position: "top",
      },
      {
        title: "Apariencia y accesibilidad",
        description:
          "Activa el modo oscuro, ajusta el tamaño de fuente, elige la tipografía japonesa y habilita opciones de alto contraste o reducción de animaciones.",
        icon: <Palette className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Preferencias de estudio",
        description:
          "Define tu meta diaria de estudio, la cantidad de repasos por día y activa recordatorios para tus revisiones pendientes.",
        icon: <BookOpen className="w-6 h-6" />,
        position: "center",
      },
      {
        title: "Privacidad y cuenta",
        description:
          "Gestiona tus datos personales, seguridad de la cuenta, autenticación 2FA y opciones de privacidad todo desde un solo lugar.",
        icon: <Lock className="w-6 h-6" />,
        position: "bottom",
      },
    ],
  },
];

/** Map para acceder a un tour por su index (0-5 corresponde al orden en el array `guides` de HelpPage) */
export function getTourByIndex(index: number): TourDefinition | undefined {
  return tourDefinitions[index];
}

/** Map para acceder a un tour por su id */
export function getTourById(id: string): TourDefinition | undefined {
  return tourDefinitions.find((t) => t.id === id);
}
