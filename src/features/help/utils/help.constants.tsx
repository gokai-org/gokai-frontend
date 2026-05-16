import {
  BarChart3,
  BookOpen,
  BookText,
  GraduationCap,
  Heart,
  HelpCircle,
  Library,
  Lightbulb,
  MessageCircle,
  PenTool,
  Settings,
  Star,
  Target,
  Zap,
  Languages,
  Bell,
} from "lucide-react";
import type { FaqItem, GuideCardItem, TipItem } from "@/features/help/types";
import type { HelpTabKey } from "@/features/help/types";

export const HELP_FAQS: FaqItem[] = [
  {
    question: "¿Cómo empiezo en Gokai?",
    answer:
      "Completa tu registro, elige tu nivel de kana e intereses y luego entra al dashboard. Desde ahí puedes empezar por el mapa de aprendizaje, la biblioteca o tus repasos del día.",
  },
  {
    question: "¿Dónde veo qué estudiar hoy?",
    answer:
      "La página de Repasos es tu punto principal para retomar práctica. Ahí verás lo pendiente, tu racha y la recomendación más útil para continuar.",
  },
  {
    question: "¿Cómo funciona el sistema de repasos?",
    answer:
      "Gokai prioriza el contenido que te conviene reforzar antes de olvidarlo. Mientras más constante seas con tus repasos, mejor se mantiene tu progreso.",
  },
  {
    question: "¿Qué diferencia hay entre el mapa, la biblioteca y los repasos?",
    answer:
      "El mapa te orienta en tu progreso, la biblioteca te deja explorar contenido y los repasos te llevan directo a practicar lo que ya debes reforzar.",
  },
  {
    question: "¿Cómo uso la biblioteca?",
    answer:
      "La biblioteca organiza contenido como kanji, vocabulario y gramática para explorarlo con calma. Puedes buscar, revisar detalles y guardar elementos que quieras volver a consultar.",
  },
  {
    question: "¿Puedo guardar contenido para revisarlo después?",
    answer:
      "Sí. Puedes marcar contenido como favorito para encontrarlo más rápido después desde las vistas donde ese recurso esté disponible.",
  },
  {
    question: "¿Para qué sirve el chatbot de conversación?",
    answer:
      "El chatbot te ayuda a practicar conversación y recibir correcciones sobre lo que escribes. Es una función premium pensada para practicar japonés de forma más libre.",
  },
  {
    question: "¿Qué desbloquea una suscripción premium?",
    answer:
      "La suscripción premium amplía funciones como experiencias avanzadas de práctica y más acceso dentro de la plataforma. Si una función es premium, Gokai te lo indicará antes de entrar.",
  },
  {
    question: "¿Para qué sirven las estadísticas?",
    answer:
      "Las estadísticas te ayudan a leer tu constancia, actividad y avance. Son útiles para detectar qué estás practicando bien y qué área necesita más atención.",
  },
  {
    question: "¿Dónde cambio mis preferencias o ajustes?",
    answer:
      "En Configuración puedes actualizar tu perfil y ajustar opciones como notificaciones y otras preferencias de uso.",
  },
  {
    question: "¿Para qué sirve el centro de avisos?",
    answer:
      "El centro de avisos reúne recordatorios y mensajes importantes dentro de la plataforma. Te ayuda a no perder seguimiento de actividad relevante.",
  },
  {
    question: "¿Qué hago si no encuentro una función o algo no carga bien?",
    answer:
      "Usa el buscador del Centro de ayuda y, si no encuentras respuesta, abre soporte desde la misma página de Help. Así puedes reportar el problema directamente.",
  },
];

export const HELP_GUIDES: GuideCardItem[] = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Primeros pasos",
    description:
      "Configura tu perfil, elige tu nivel y comienza tu primera lección de japonés.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    tourId: "getting-started",
  },
  {
    icon: <Library className="w-6 h-6" />,
    title: "Explorar la biblioteca",
    description:
      "Descubre kanji organizados por nivel con ejemplos interactivos.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    tourId: "explore-library",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Sistema de repasos",
    description: "Entiende cómo se priorizan tus repasos y dónde retomar tu siguiente sesión.",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    tourId: "review-system",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Chatbot de conversación",
    description: "Practica japonés con IA, escenarios reales y correcciones.",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    tourId: "chatbot-guide",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Estadísticas y progreso",
    description:
      "Interpreta tus métricas, detecta patrones y mejora tu rutina.",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    tourId: "statistics-guide",
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: "Personalización",
    description:
      "Ajusta notificaciones, metas diarias, apariencia y accesibilidad.",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    tourId: "personalization-guide",
  },
  {
    icon: <BookText className="w-6 h-6" />,
    title: "Tablero de Gramática",
    description:
      "Recorre el tablero de gramática y abre una lección visual paso a paso.",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    tourId: "grammar-board-guide",
  },
  {
    icon: <Languages className="w-6 h-6" />,
    title: "Escritura",
    description:
      "Explora el tablero de escritura, sus nodos y la lección lateral con guía visual.",
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    tourId: "hiragana-writing-guide",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Centro de avisos",
    description:
      "Aprende a filtrar, fijar y gestionar tus notificaciones importantes.",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
    tourId: "notices-guide",
  },
  {
    icon: <HelpCircle className="w-6 h-6" />,
    title: "Centro de ayuda",
    description:
      "Encuentra guías, preguntas frecuentes y soporte desde una sola pantalla.",
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    tourId: "help-center-guide",
  },
];

export const HELP_TIPS: TipItem[] = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Estudia todos los días",
    description:
      "Aunque sean 10 minutos, la consistencia hace una gran diferencia.",
  },
  {
    icon: <PenTool className="w-5 h-5" />,
    title: "Practica la escritura",
    description: "Trazar los kanji a mano refuerza memoria visual y muscular.",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "No te saltes las revisiones",
    description: "El SRS funciona mejor cuando completas tus repasos a tiempo.",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Disfruta el proceso",
    description:
      "Aprender con contenido que te gusta hace más sostenible el hábito.",
  },
];

export const HELP_TABS: Array<{
  key: HelpTabKey;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: "guides",
    label: "Guías",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    key: "faq",
    label: "Preguntas frecuentes",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  {
    key: "tips",
    label: "Consejos",
    icon: <Lightbulb className="w-4 h-4" />,
  },
];
