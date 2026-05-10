import type {
  OnboardingInterestDefinition,
  OnboardingInterestSection,
  OnboardingInterestSectionDefinition,
  OnboardingTheme,
} from "@/features/onboarding/types";

export const MAX_ONBOARDING_SELECTIONS = 8;

export const ONBOARDING_INTEREST_SECTIONS: OnboardingInterestSectionDefinition[] = [
  {
    id: "hokkaido",
    title: "Hokkaidō",
    description: "Naturaleza, nieve, clima, paisajes abiertos y fauna",
    interests: [
      {
        id: "clima-naturaleza",
        kanji: "天気と自然",
        meaning: "Clima y naturaleza",
      },
    ],
  },
  {
    id: "tohoku",
    title: "Tōhoku",
    description: "Tradición, festivales, estaciones, calma y sensibilidad",
    interests: [
      {
        id: "fechas",
        kanji: "日付と時刻",
        meaning: "Fechas y horario",
      },
      {
        id: "sentidos-emociones",
        kanji: "五感と感情",
        meaning: "Sentidos y emociones",
      },
    ],
  },
  {
    id: "kanto",
    title: "Kantō",
    description: "Tokio, ciudad, tecnología, educación, oficinas y ritmo moderno",
    interests: [
      {
        id: "tecnologia",
        kanji: "技術",
        meaning: "Tecnología",
      },
      {
        id: "educacion",
        kanji: "教育",
        meaning: "Educación",
      },
      {
        id: "trabajo-negocios",
        kanji: "仕事とビジネス",
        meaning: "Trabajo y Negocios",
      },
    ],
  },
  {
    id: "chubu",
    title: "Chūbu",
    description: "Monte Fuji, montañas, industria, precisión y descripción visual",
    interests: [
      {
        id: "numeros",
        kanji: "数字と数量",
        meaning: "Números y cantidades",
      },
      {
        id: "colores-apariencia",
        kanji: "色と外見",
        meaning: "Colores y apariencia",
      },
    ],
  },
  {
    id: "kansai",
    title: "Kansai",
    description: "Osaka, Kyoto, Nara, comida, convivencia y vida cotidiana",
    interests: [
      {
        id: "cocinar",
        kanji: "料理",
        meaning: "Cocinar",
      },
      {
        id: "vida-diaria",
        kanji: "日常生活",
        meaning: "Vida diaria",
      },
      {
        id: "interaccion-social",
        kanji: "対人交流",
        meaning: "Interacción social",
      },
    ],
  },
  {
    id: "chugoku",
    title: "Chūgoku",
    description: "Historia, rutas culturales, paisajes y ocio",
    interests: [
      {
        id: "viajes-turismo",
        kanji: "旅行と観光",
        meaning: "Viajes y turismo",
      },
      {
        id: "hobbies",
        kanji: "趣味",
        meaning: "Hobbies",
      },
    ],
  },
  {
    id: "shikoku",
    title: "Shikoku",
    description: "Peregrinaje, calma, cuidado personal, salud y vínculos humanos",
    interests: [
      {
        id: "medicina-salud",
        kanji: "医療と健康",
        meaning: "Medicina y salud",
      },
      {
        id: "familia",
        kanji: "家族と人間関係",
        meaning: "Familia y relaciones",
      },
    ],
  },
  {
    id: "kyushu",
    title: "Kyūshū/Okinawa",
    description: "Playas, energía, cultura popular, movimiento y estilo",
    interests: [
      {
        id: "deportes",
        kanji: "スポーツ",
        meaning: "Deportes",
      },
      {
        id: "ropa-moda",
        kanji: "服とファッション",
        meaning: "Ropa y moda",
      },
      {
        id: "anime-manga",
        kanji: "アニメ・マンガ",
        meaning: "Anime y Manga",
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
