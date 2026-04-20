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
} from "lucide-react";
import type { FaqItem, GuideCardItem, TipItem } from "@/features/help/types";
import type { HelpTabKey } from "@/features/help/types";

export const HELP_FAQS: FaqItem[] = [
  {
    question: "¿Cómo empiezo a aprender japonés en Gokai?",
    answer:
      "Después de registrarte, completa el onboarding donde seleccionas tus intereses y nivel. Luego accede al Dashboard donde encontrarás lecciones, ejercicios y tu biblioteca de kanji personalizada. Te recomendamos comenzar con las lecciones básicas de hiragana y katakana.",
  },
  {
    question: "¿Qué es el sistema de repaso espaciado (SRS)?",
    answer:
      "El sistema de repaso espaciado programa las revisiones en intervalos óptimos. Gokai utiliza este sistema para que repases kanji y vocabulario justo antes de que los olvides.",
  },
  {
    question: "¿Cómo funciona la biblioteca de kanji?",
    answer:
      "La biblioteca organiza los kanji por nivel de dificultad. Puedes explorar lecturas, significados, trazos y palabras de ejemplo, además de seguir tu progreso.",
  },
  {
    question: "¿Puedo usar el chatbot para practicar conversación?",
    answer:
      "Sí. El chatbot con IA te permite practicar conversación en japonés en tiempo real y recibir correcciones con explicaciones.",
  },
  {
    question: "¿Cómo interpreto mis estadísticas de progreso?",
    answer:
      "En Estadísticas encontrarás racha, precisión, kanji aprendidos y actividad reciente. Esto te ayuda a identificar patrones y áreas de mejora.",
  },
  {
    question: "¿Qué planes de membresía hay disponibles?",
    answer:
      "Existe un plan gratuito con acceso limitado y planes premium con más contenido, chatbot avanzado y estadísticas completas.",
  },
  {
    question: "¿Cómo personalizo mi experiencia de aprendizaje?",
    answer:
      "Desde Configuración puedes ajustar idioma, notificaciones, apariencia, metas diarias, accesibilidad y privacidad.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Sí. La plataforma utiliza medidas de protección de datos, autenticación segura y almacenamiento estructurado del progreso.",
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
    tourIndex: 0,
  },
  {
    icon: <Library className="w-6 h-6" />,
    title: "Explorar la biblioteca",
    description:
      "Descubre kanji organizados por nivel con ejemplos interactivos.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    tourIndex: 1,
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Sistema de revisiones",
    description: "Aprende cómo funciona el SRS y cómo maximizar tu retención.",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    tourIndex: 2,
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Chatbot de conversación",
    description: "Practica japonés con IA, escenarios reales y correcciones.",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    tourIndex: 3,
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Estadísticas y progreso",
    description:
      "Interpreta tus métricas, detecta patrones y mejora tu rutina.",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    tourIndex: 4,
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: "Personalización",
    description:
      "Ajusta notificaciones, metas diarias, apariencia y accesibilidad.",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    tourIndex: 5,
  },
  {
    icon: <BookText className="w-6 h-6" />,
    title: "Tablero de Grammar",
    description:
      "Recorre el tablero de gramática y abre una lección visual paso a paso.",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    tourIndex: 6,
  },
  {
    icon: <Languages className="w-6 h-6" />,
    title: "Escritura de Hiragana",
    description:
      "Explora el tablero de hiragana, sus nodos y la lección lateral con guía visual.",
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    tourIndex: 7,
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
