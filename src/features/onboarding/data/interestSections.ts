import type {
  OnboardingInterestDefinition,
  OnboardingInterestSection,
  OnboardingInterestSectionDefinition,
  OnboardingTheme,
} from "@/features/onboarding/types";

export const MAX_ONBOARDING_SELECTIONS = 8;

export const ONBOARDING_INTEREST_SECTIONS: OnboardingInterestSectionDefinition[] = [
  {
    id: "cultura-entretenimiento",
    title: "Cultura y entretenimiento",
    description: "Anime, manga y pasatiempos",
    interests: [
      {
        id: "anime-manga",
        kanji: "アニメ・マンガ",
        meaning: "Anime y Manga",
      },
      {
        id: "hobbies",
        kanji: "趣味",
        meaning: "Hobbies",
      },
    ],
  },
  {
    id: "vida-diaria-contexto",
    title: "Vida diaria y contexto",
    description: "Rutina, relaciones e interacción social",
    interests: [
      {
        id: "vida-diaria",
        kanji: "日常生活",
        meaning: "Vida diaria",
      },
      {
        id: "familia",
        kanji: "家族と人間関係",
        meaning: "Familia y relaciones",
      },
      {
        id: "interaccion-social",
        kanji: "対人交流",
        meaning: "Interacción social",
      },
      {
        id: "sentidos-emociones",
        kanji: "五感と感情",
        meaning: "Sentidos y emociones",
      },
    ],
  },
  {
    id: "aprendizaje-lenguaje",
    title: "Aprendizaje y lenguaje",
    description: "Temas académicos y bases de comunicación",
    interests: [
      {
        id: "educacion",
        kanji: "教育",
        meaning: "Educación",
      },
      {
        id: "numeros",
        kanji: "数字と数量",
        meaning: "Números y cantidades",
      },
      {
        id: "fechas",
        kanji: "日付と時刻",
        meaning: "Fechas y horario",
      },
    ],
  },
  {
    id: "estilo-vida",
    title: "Estilo de vida",
    description: "Cocina, salud, ropa y apariencia",
    interests: [
      {
        id: "cocinar",
        kanji: "料理",
        meaning: "Cocinar",
      },
      {
        id: "ropa-moda",
        kanji: "服とファッション",
        meaning: "Ropa y moda",
      },
      {
        id: "colores-apariencia",
        kanji: "色と外見",
        meaning: "Colores y apariencia",
      },
      {
        id: "medicina-salud",
        kanji: "医療と健康",
        meaning: "Medicina y salud",
      },
    ],
  },
  {
    id: "entorno-naturaleza",
    title: "Entorno y naturaleza",
    description: "Clima y mundo natural",
    interests: [
      {
        id: "clima-naturaleza",
        kanji: "天気と自然",
        meaning: "Clima y naturaleza",
      },
    ],
  },
  {
    id: "actividades",
    title: "Actividades",
    description: "Movimiento, deportes y acción",
    interests: [
      {
        id: "deportes",
        kanji: "スポーツ",
        meaning: "Deportes",
      },
    ],
  },
  {
    id: "profesional-tecnico",
    title: "Profesional y técnico",
    description: "Trabajo, negocios y tecnología",
    interests: [
      {
        id: "trabajo-negocios",
        kanji: "仕事とビジネス",
        meaning: "Trabajo y Negocios",
      },
      {
        id: "tecnologia",
        kanji: "技術",
        meaning: "Tecnología",
      },
    ],
  },
  {
    id: "experiencias",
    title: "Experiencias",
    description: "Viajes, turismo y vivencias",
    interests: [
      {
        id: "viajes-turismo",
        kanji: "旅行と観光",
        meaning: "Viajes y turismo",
      },
    ],
  },
];

function normalizeInterestMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:()&/|+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getInterestMatchValues(interest: OnboardingInterestDefinition) {
  return [
    interest.meaning,
    interest.kanji,
    ...(interest.matchMeanings ?? []),
    ...(interest.matchKanji ?? []),
  ].map(normalizeInterestMatch);
}

export function hydrateOnboardingInterestSections(
  themes: OnboardingTheme[],
): OnboardingInterestSection[] {
  const themesByMeaning = new Map(
    themes.map((theme) => [normalizeInterestMatch(theme.meaning), theme]),
  );
  const themesByKanji = new Map(
    themes.map((theme) => [normalizeInterestMatch(theme.kanji), theme]),
  );

  return ONBOARDING_INTEREST_SECTIONS.map((section) => ({
    ...section,
    interests: section.interests.map((interest) => {
      const matchValues = getInterestMatchValues(interest);
      const backendTheme =
        matchValues.map((value) => themesByMeaning.get(value)).find(Boolean) ??
        matchValues.map((value) => themesByKanji.get(value)).find(Boolean) ??
        null;

      return {
        ...interest,
        themeId: backendTheme?.id ?? null,
        backendTheme,
      };
    }),
  }));
}
