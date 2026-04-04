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
  readonly eyebrow: string;
  readonly title: string;
  readonly desc: string;
  readonly highlights: readonly string[];
  readonly metric: string;
  readonly img: string;
};

export type Feature = {
  title: string;
  desc: string;
  icon: string;
  jp: string;
};

export const HOW_TABS: readonly HowTab[] = [
  {
    id: "explora",
    label: "Explora tus intereses",
    eyebrow: "Mapa inicial",
    title: "Tu ruta empieza desde lo que te mueve",
    desc: "Selecciona temas, ritmos y objetivos. GOKAI reorganiza la escena de aprendizaje para que cada nodo tenga sentido dentro de tu camino.",
    highlights: [
      "Intereses prioritarios",
      "Camino adaptativo",
      "Progreso visible",
    ],
    metric: "Rutas vivas",
    img: "/mockups/explora.png",
  },
  {
    id: "recompensas",
    label: "Recompensas",
    eyebrow: "Momentum",
    title: "Cada avance abre nuevas rutas dentro del grafo",
    desc: "Las recompensas no son cosméticas: refuerzan el hábito, desbloquean contenido y convierten el progreso en algo tangible.",
    highlights: [
      "Puntos y badges",
      "Desbloqueos progresivos",
      "Motivación diaria",
    ],
    metric: "+30 puntos",
    img: "/mockups/recompensas.png",
  },
  {
    id: "repaso",
    label: "Repasa con IA",
    eyebrow: "Asistencia inteligente",
    title: "La IA acompaña tu repaso justo donde lo necesitas",
    desc: "GOKAI detecta patrones, refuerza huecos de memoria y propone repasos con contexto para que estudiar se sienta continuo, no fragmentado.",
    highlights: [
      "Refuerzo contextual",
      "Repaso adaptativo",
      "Feedback inmediato",
    ],
    metric: "IA en contexto",
    img: "/mockups/repaso.png",
  },
] as const;

export const HERO_BADGES = [
  "Kanji y vocabulario conectados",
  "IA adaptativa",
  "Rutas dinámicas de estudio",
] as const;

export const SKILL_PANEL_CONTENT: Record<
  string,
  {
    eyebrow: string;
    stat: string;
    title: string;
    bullets: string[];
  }
> = {
  caracteristicas: {
    eyebrow: "Trazos con intención",
    stat: "Stroke Engine",
    title:
      "La escritura se siente como una práctica guiada, no como una hoja vacía.",
    bullets: ["Canvas de escritura", "Corrección visual", "Memoria motriz"],
  },
  leer: {
    eyebrow: "Comprensión viva",
    stat: "Reading Layer",
    title: "Cada lectura se integra a tu mapa personal de progreso.",
    bullets: ["Textos por nivel", "Seguimiento semántico", "Nuevas conexiones"],
  },
  pensar: {
    eyebrow: "Procesamiento natural",
    stat: "Thinking Path",
    title: "La plataforma empuja la intuición, no la traducción mecánica.",
    bullets: [
      "Asociación de ideas",
      "Contexto cultural",
      "Comprensión profunda",
    ],
  },
  hablar: {
    eyebrow: "Confianza activa",
    stat: "Speech Loop",
    title:
      "Practicar oralidad se convierte en una secuencia progresiva y medible.",
    bullets: ["Feedback de voz", "Entonación guiada", "Fluidez creciente"],
  },
  escuchar: {
    eyebrow: "Oído entrenado",
    stat: "Audio Sense",
    title:
      "Tu oído se afina como parte del mismo sistema visual de aprendizaje.",
    bullets: [
      "Comprensión auditiva",
      "Audio adaptativo",
      "Retención por patrones",
    ],
  },
};

export const FEATURES: Feature[] = [
  {
    title: "IA adaptativa",
    desc: "GOKAI analiza tu progreso y estilo de estudio para recomendarte lecciones, repasos y desafíos personalizados.",
    icon: "/icons/ia.svg",
    jp: "知能",
  },
  {
    title: "Ruta personalizada",
    desc: "Visualiza tu camino con puntos interactivos que representan tus avances y nuevas rutas por descubrir.",
    icon: "/icons/ruta.svg",
    jp: "道筋",
  },
  {
    title: "Chatbot de repaso",
    desc: "Conversa con un asistente inteligente que te ayuda a reforzar vocabulario, gramática y comprensión de forma natural.",
    icon: "/icons/chatbot.svg",
    jp: "復習",
  },
  {
    title: "Recompensas",
    desc: "Gana puntos, insignias y niveles al completar ejercicios. Cada logro desbloquea nuevas rutas en tu aprendizaje.",
    icon: "/icons/recompensas.svg",
    jp: "報酬",
  },
  {
    title: "Aprendizaje integral",
    desc: "GOKAI integra las cinco habilidades del idioma: escribir, leer, pensar, hablar y escuchar, para un progreso equilibrado.",
    icon: "/icons/integral.svg",
    jp: "総合",
  },
  {
    title: "IA que te escucha",
    desc: "Habla japonés, y deja que la inteligencia artificial te ayude a perfeccionar tu entonación y confianza.",
    icon: "/icons/escucha.svg",
    jp: "聞く",
  },
];

export const SECTIONS: Section[] = [
  {
    id: "inicio",
    nav: "Inicio",
    titleA: "Aprende",
    titleB: "Japonés",
    desc: "Con GOKAI, domina el japonés a tu ritmo mediante IA, gamificación y rutas dinámicas de aprendizaje que se adaptan a ti.",
    cta: { label: "Empieza gratis", href: "/auth/membership" },
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
