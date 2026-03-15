import type { Notice } from "@/features/notices/types";

const now = new Date();

export const lessonNoticeMocks: Notice[] = [
  {
    id: "lesson-1",
    title: "Nueva lección disponible: Kanji N4 — Verbos de movimiento",
    description:
      "Se ha desbloqueado una nueva lección con 15 kanji nuevos sobre verbos de movimiento. Incluye ejercicios interactivos y ejemplos con audio.",
    category: "lesson",
    read: false,
    pinned: false,
    createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
    actionLabel: "Ir a la lección",
    actionHref: "/dashboard/lessons",
  },
];

export const reviewNoticeMocks: Notice[] = [
  {
    id: "review-1",
    title: "Tienes 42 revisiones pendientes",
    description:
      "Tu cola de revisiones SRS ha crecido. Completarlas a tiempo mejorará tu retención según tu historial.",
    category: "review",
    read: false,
    pinned: false,
    createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    actionLabel: "Comenzar revisiones",
    actionHref: "/dashboard/reviews",
  },
];

export const achievementNoticeMocks: Notice[] = [
  {
    id: "achievement-1",
    title: "¡100 kanji aprendidos!",
    description:
      "Has alcanzado la marca de 100 kanji aprendidos. Eso es el equivalente a poder leer textos básicos de nivel N5.",
    category: "achievement",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 96 * 3600000).toISOString(),
    actionLabel: "Ver logros",
    actionHref: "/dashboard/profile",
  },
];

export const streakNoticeMocks: Notice[] = [
  {
    id: "streak-1",
    title: "¡Racha de 30 días! 🔥",
    description:
      "Has mantenido tu racha de estudio durante 30 días consecutivos. ¡Sigue así!",
    category: "streak",
    read: false,
    pinned: true,
    createdAt: new Date(now.getTime() - 12 * 60000).toISOString(),
    actionLabel: "Ver racha",
    actionHref: "/dashboard/statistics",
  },
];

export const systemNoticeMocks: Notice[] = [
  {
    id: "system-1",
    title: "Actualización de plataforma v2.4",
    description:
      "Hemos mejorado el chatbot, optimizado la carga de la biblioteca y corregido errores menores en estadísticas.",
    category: "system",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
  },
  {
    id: "system-2",
    title: "Nueva función: Gráfico de conocimiento",
    description:
      "Explora cómo se conectan los kanji que has aprendido con nuestro nuevo gráfico interactivo.",
    category: "system",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 120 * 3600000).toISOString(),
    actionLabel: "Explorar gráfico",
    actionHref: "/dashboard/graph",
  },
];

export const mockNotices: Notice[] = [
  ...streakNoticeMocks,
  ...lessonNoticeMocks,
  ...reviewNoticeMocks,
  ...achievementNoticeMocks,
  ...systemNoticeMocks,
];