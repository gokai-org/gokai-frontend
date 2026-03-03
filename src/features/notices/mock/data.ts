import type { Notice } from "../types";

const now = new Date();

export const mockNotices: Notice[] = [
  {
    id: "1",
    title: "¡Racha de 30 días! 🔥",
    description:
      "Has mantenido tu racha de estudio durante 30 días consecutivos. ¡Sigue así, tu constancia está dando frutos!",
    category: "streak",
    read: false,
    pinned: true,
    createdAt: new Date(now.getTime() - 12 * 60_000).toISOString(),
    actionLabel: "Ver racha",
    actionHref: "/dashboard/statistics",
  },
  {
    id: "2",
    title: "Nueva lección disponible: Kanji N4 — Verbos de movimiento",
    description:
      "Se ha desbloqueado una nueva lección con 15 kanji nuevos sobre verbos de movimiento. Incluye ejercicios interactivos y ejemplos con audio.",
    category: "lesson",
    read: false,
    pinned: false,
    createdAt: new Date(now.getTime() - 45 * 60_000).toISOString(),
    actionLabel: "Ir a la lección",
    actionHref: "/dashboard/lessons",
  },
  {
    id: "3",
    title: "Tienes 42 revisiones pendientes",
    description:
      "Tu cola de revisiones SRS ha crecido. Completarlas a tiempo mejorará tu retención un 85% según tu historial.",
    category: "review",
    read: false,
    pinned: false,
    createdAt: new Date(now.getTime() - 2 * 3600_000).toISOString(),
    actionLabel: "Comenzar revisiones",
    actionHref: "/dashboard/reviews",
  },
  {
    id: "4",
    title: "¡Logro desbloqueado: Maestro de Hiragana!",
    description:
      "Has dominado todos los caracteres hiragana con un 95% de precisión. Se ha añadido una insignia de oro a tu perfil.",
    category: "achievement",
    read: false,
    pinned: false,
    createdAt: new Date(now.getTime() - 5 * 3600_000).toISOString(),
    actionLabel: "Ver logros",
    actionHref: "/dashboard/profile",
  },
  {
    id: "5",
    title: "Actualización de plataforma v2.4",
    description:
      "Hemos mejorado el chatbot con respuestas más naturales, optimizado la velocidad de carga de la biblioteca y corregido errores menores en las estadísticas.",
    category: "system",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 24 * 3600_000).toISOString(),
  },
  {
    id: "6",
    title: "Revisión de verbos de la lección 12 lista",
    description:
      "Los kanji de la lección 12 están listos para su primera revisión SRS. Revísalos ahora para una retención óptima.",
    category: "review",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 48 * 3600_000).toISOString(),
    actionLabel: "Revisar ahora",
    actionHref: "/dashboard/reviews",
  },
  {
    id: "7",
    title: "Consejo: Activa las notificaciones de repaso",
    description:
      "Configura recordatorios diarios para no perder tu hora óptima de estudio. Los usuarios con recordatorios activos retienen un 40% más.",
    category: "system",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 72 * 3600_000).toISOString(),
    actionLabel: "Configurar",
    actionHref: "/dashboard/configuration",
  },
  {
    id: "8",
    title: "¡100 kanji aprendidos!",
    description:
      "Has alcanzado la marca de 100 kanji aprendidos. Eso es el equivalente a poder leer textos básicos de nivel N5. ¡Increíble progreso!",
    category: "achievement",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 96 * 3600_000).toISOString(),
  },
  {
    id: "9",
    title: "Nueva función: Gráfico de conocimiento",
    description:
      "Explora cómo se conectan los kanji que has aprendido con nuestro nuevo gráfico interactivo. Visualiza relaciones entre radicales, componentes y significados.",
    category: "system",
    read: true,
    pinned: false,
    createdAt: new Date(now.getTime() - 120 * 3600_000).toISOString(),
    actionLabel: "Explorar gráfico",
    actionHref: "/dashboard/graph",
  },
];
