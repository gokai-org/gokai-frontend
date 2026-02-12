/** Tipos y datos estáticos para la landing page */

export type Section = {
  id: string;
  nav: string;
  titleA: string;
  titleB: string;
  desc: string;
  cta?: { label: string; href: string };
  layout?: "split" | "center";
};

export type HowTabId = "explora" | "recompensas" | "repaso";

export type HowTab = {
  readonly id: HowTabId;
  readonly label: string;
  readonly img: string;
};

export type Feature = {
  title: string;
  desc: string;
  icon: string;
};

export const HOW_TABS: readonly HowTab[] = [
  { id: "explora", label: "Explora tus intereses", img: "/mockups/explora.png" },
  { id: "recompensas", label: "Recompensas", img: "/mockups/recompensas.png" },
  { id: "repaso", label: "Repasa con IA", img: "/mockups/repaso.png" },
] as const;

export const FEATURES: Feature[] = [
  {
    title: "IA adaptativa",
    desc: "GOKAI analiza tu progreso y estilo de estudio para recomendarte lecciones, repasos y desafíos personalizados.",
    icon: "/icons/ia.svg",
  },
  {
    title: "Ruta personalizada",
    desc: "Visualiza tu camino con puntos interactivos que representan tus avances y nuevas rutas por descubrir.",
    icon: "/icons/ruta.svg",
  },
  {
    title: "Chatbot de repaso",
    desc: "Conversa con un asistente inteligente que te ayuda a reforzar vocabulario, gramática y comprensión de forma natural.",
    icon: "/icons/chatbot.svg",
  },
  {
    title: "Recompensas",
    desc: "Gana puntos, insignias y niveles al completar ejercicios. Cada logro desbloquea nuevas rutas en tu aprendizaje.",
    icon: "/icons/recompensas.svg",
  },
  {
    title: "Aprendizaje integral",
    desc: "GOKAI integra las cinco habilidades del idioma: escribir, leer, pensar, hablar y escuchar, para un progreso equilibrado.",
    icon: "/icons/integral.svg",
  },
  {
    title: "IA que te escucha",
    desc: "Habla japonés, y deja que la inteligencia artificial te ayude a perfeccionar tu entonación y confianza.",
    icon: "/icons/escucha.svg",
  },
];

export const SECTIONS: Section[] = [
  {
    id: "inicio",
    nav: "Inicio",
    titleA: "Aprende",
    titleB: "Japonés",
    desc: "Con GOKAI, domina el japonés a tu ritmo mediante IA, gamificación y rutas dinámicas de aprendizaje que se adaptan a ti.",
    cta: { label: "Empieza gratis", href: "/auth/login" },
    layout: "split",
  },
  {
    id: "caracteristicas",
    nav: "Características",
    titleA: "Domina el trazo con precisión",
    titleB: "Escritura",
    desc: "Practica la escritura de kanji. Cada trazo refuerza tu memoria visual y motriz, mientras GOKAI analiza tu progreso y te corrige con IA.",
    layout: "split",
  },
  {
    id: "leer",
    nav: "Leer",
    titleA: "Comprende y conecta con el idioma",
    titleB: "Leer",
    desc: "Mejora tu comprensión lectora con textos adaptados a tu nivel. GOKAI mide tu entendimiento y te sugiere nuevos recursos según los temas y estructuras que dominas.",
    layout: "split",
  },
  {
    id: "pensar",
    nav: "Pensar",
    titleA: "Comprende antes de traducir",
    titleB: "Pensar",
    desc: "Entrena tu mente para pensar en japonés, no solo traducir. La IA te guía con ejercicios semánticos que fortalecen tu intuición lingüística y cultural.",
    layout: "split",
  },
  {
    id: "hablar",
    nav: "Hablar",
    titleA: "Expresa tus ideas con naturalidad",
    titleB: "Hablar",
    desc: "Practica tu pronunciación y entonación con análisis de voz. Recibe retroalimentación personalizada para mejorar tu fluidez y confianza al comunicarte.",
    layout: "split",
  },
  {
    id: "escuchar",
    nav: "Escuchar",
    titleA: "Entiende más allá de las palabras",
    titleB: "Escuchar",
    desc: "Escucha ejercicios y entrena tu oído. GOKAI evalúa tu comprensión auditiva y adapta el contenido según tu desempeño.",
    layout: "split",
  },
  {
    id: "como-funciona",
    nav: "Cómo funciona",
    titleA: "¿Cómo funciona",
    titleB: "GOKAI?",
    desc: "Una experiencia educativa personalizada con inteligencia artificial, diseñada para motivarte a diario.",
    layout: "center",
  },
  {
    id: "experiencia",
    nav: "Experiencia",
    titleA: "Más que una app de idiomas",
    titleB: "Una experiencia inteligente",
    desc: "",
    layout: "center",
  },
  {
    id: "planes",
    nav: "Planes",
    titleA: "Empieza gratis",
    titleB: "Desbloquea todo con GOKAI+",
    desc: "",
    layout: "center",
  },
  {
    id: "contacto",
    nav: "Contacto",
    titleA: "¿Tienes alguna duda?",
    titleB: "Escríbenos",
    desc: "Tu aprendizaje es nuestra prioridad. Si tienes alguna pregunta o sugerencia, estamos aquí para ayudarte.",
    layout: "center",
  },
];
