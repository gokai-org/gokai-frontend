import type {
  VocabularyGraphSummary,
  VocabularyRegionId,
  VocabularyRegionThemeNode,
  VocabularyRegionViewModel,
  VocabularyThemeContent,
} from "../types";

export const REGION_ORDER: VocabularyRegionId[] = [
  "hokkaido",
  "tohoku",
  "kanto",
  "chubu",
  "kansai",
  "chugoku",
  "shikoku",
  "kyushu",
];

export const regionColors: Record<VocabularyRegionId, string> = {
  hokkaido: "#3A0B0B",
  tohoku: "#5A0F0F",
  kanto: "#C94A4A",
  chubu: "#8E2E2E",
  kansai: "#A91F1F",
  chugoku: "#7A1D1D",
  shikoku: "#B83A3A",
  kyushu: "#4A0909",
};

export const REGION_CONFIG: Record<
  VocabularyRegionId,
  {
    label: string;
    identity: string;
    themes: string[];
    color: string;
  }
> = {
  hokkaido: {
    label: "Hokkaido",
    identity: "Naturaleza, nieve, clima y paisajes abiertos.",
    themes: ["Clima y naturaleza", "Animales"],
    color: regionColors.hokkaido,
  },
  tohoku: {
    label: "Tohoku",
    identity: "Tradicion, festivales, vida tranquila y estaciones.",
    themes: ["Fechas y horario", "Sentidos y emociones"],
    color: regionColors.tohoku,
  },
  kanto: {
    label: "Kanto",
    identity: "Tokio, ciudad, tecnologia, educacion y ritmo moderno.",
    themes: ["Tecnologia", "Educacion", "Trabajo y negocios"],
    color: regionColors.kanto,
  },
  chubu: {
    label: "Chubu",
    identity: "Monte Fuji, montanas, trayectos y precision.",
    themes: ["Numeros y cantidades", "Colores y apariencia"],
    color: regionColors.chubu,
  },
  kansai: {
    label: "Kansai",
    identity: "Osaka, Kyoto, Nara, comida, cultura cotidiana y convivencia.",
    themes: ["Cocinar", "Vida diaria", "Interaccion social"],
    color: regionColors.kansai,
  },
  chugoku: {
    label: "Chugoku",
    identity: "Historia, rutas y paisajes culturales.",
    themes: ["Viajes y turismo", "Hobbies"],
    color: regionColors.chugoku,
  },
  shikoku: {
    label: "Shikoku",
    identity: "Peregrinaje, calma, rutas espirituales y cuidado personal.",
    themes: ["Medicina y salud", "Familia y relaciones"],
    color: regionColors.shikoku,
  },
  kyushu: {
    label: "Kyushu/Okinawa",
    identity: "Playas, energia, cultura popular, deporte y estilo.",
    themes: ["Deportes", "Ropa y moda", "Anime y Manga"],
    color: regionColors.kyushu,
  },
};

export const REGION_FILL_TO_ID: Record<string, VocabularyRegionId> = {
  "#3A0B0B": "hokkaido",
  "#5A0F0F": "tohoku",
  "#C94A4A": "kanto",
  "#8E2E2E": "chubu",
  "#A91F1F": "kansai",
  "#7A1D1D": "chugoku",
  "#B83A3A": "shikoku",
  "#4A0909": "kyushu",
  "#470F0F": "hokkaido",
  "#910404": "tohoku",
  "#FD9999": "kanto",
  "#A55858": "chubu",
  "#A50606": "kansai",
  "#AD3F3F": "chugoku",
  "#A31010": "shikoku",
  "#490A0A": "kyushu",
};

export function normalizeVocabularyText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "y")
    .replace(/\//g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function getThemeProgress(graph?: VocabularyGraphSummary) {
  if (!graph) return 0;
  return Math.min(100, Math.max(8, graph.nodesCount * 10));
}

export function getRegionIdForTheme(meaning?: string | null) {
  const normalizedMeaning = normalizeVocabularyText(meaning);

  return REGION_ORDER.find((regionId) =>
    REGION_CONFIG[regionId].themes.some(
      (theme) => normalizeVocabularyText(theme) === normalizedMeaning,
    ),
  ) ?? null;
}

export function buildVocabularyRegionViewModels(
  themeCatalog: VocabularyThemeContent[],
  graphs: VocabularyGraphSummary[],
): VocabularyRegionViewModel[] {
  return REGION_ORDER.map((regionId) => {
    const config = REGION_CONFIG[regionId];
    const themes: VocabularyRegionThemeNode[] = config.themes.map((themeLabel) => {
      const theme = themeCatalog.find(
        (item) => normalizeVocabularyText(item.meaning) === normalizeVocabularyText(themeLabel),
      );
      const graph = theme
        ? graphs.find((item) => item.themeId === theme.id)
        : undefined;
      const status = !theme
        ? "locked"
        : graph && graph.nodesCount > 0
          ? "completed"
          : "available";

      return {
        id: theme?.id ?? `${regionId}-${normalizeVocabularyText(themeLabel)}`,
        regionId,
        label: theme?.meaning ?? themeLabel,
        themeId: theme?.id,
        graphId: graph?.graphId,
        kanji: theme?.kanji,
        kana: theme?.kana,
        status,
        progress: getThemeProgress(graph),
        isAvailable: Boolean(theme),
      };
    });

    const availableCount = themes.filter((theme) => theme.isAvailable).length;
    const completedCount = themes.filter((theme) => theme.status === "completed").length;
    const activeCount = themes.filter((theme) => Boolean(theme.graphId)).length;

    return {
      id: regionId,
      label: config.label,
      identity: config.identity,
      themes,
      color: config.color,
      availableCount,
      completedCount,
      activeCount,
    };
  });
}