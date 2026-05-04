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
    label: "Hokkaidō",
    identity: "Naturaleza, nieve, clima, paisajes abiertos y fauna",
    themes: ["Clima y naturaleza"],
    color: regionColors.hokkaido,
  },
  tohoku: {
    label: "Tōhoku",
    identity: "Tradición, festivales, estaciones, calma y sensibilidad",
    themes: ["Fechas y horario", "Sentidos y emociones"],
    color: regionColors.tohoku,
  },
  kanto: {
    label: "Kantō",
    identity: "Tokio, ciudad, tecnología, educación, oficinas y ritmo moderno",
    themes: ["Tecnología", "Educación", "Trabajo y negocios"],
    color: regionColors.kanto,
  },
  chubu: {
    label: "Chūbu",
    identity: "Monte Fuji, montañas, industria, precisión y descripción visual",
    themes: ["Números y cantidades", "Colores y apariencia"],
    color: regionColors.chubu,
  },
  kansai: {
    label: "Kansai",
    identity: "Osaka, Kyoto, Nara, comida, convivencia y vida cotidiana",
    themes: ["Cocinar", "Vida diaria", "Interacción social"],
    color: regionColors.kansai,
  },
  chugoku: {
    label: "Chūgoku",
    identity: "Historia, rutas culturales, paisajes y ocio",
    themes: ["Viajes y turismo", "Hobbies"],
    color: regionColors.chugoku,
  },
  shikoku: {
    label: "Shikoku",
    identity: "Peregrinaje, calma, cuidado personal, salud y vínculos humanos",
    themes: ["Medicina y salud", "Familia y relaciones"],
    color: regionColors.shikoku,
  },
  kyushu: {
    label: "Kyūshū/Okinawa",
    identity: "Playas, energía, cultura popular, movimiento y estilo",
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

export function buildVocabularyRegionViewModels(
  themeCatalog: VocabularyThemeContent[],
  graphs: VocabularyGraphSummary[],
): VocabularyRegionViewModel[] {
  return REGION_ORDER.map((regionId) => {
    const config = REGION_CONFIG[regionId];
    const themes: VocabularyRegionThemeNode[] = config.themes.map((themeLabel) => {
      const theme = themeCatalog.find(
        (item) =>
          normalizeVocabularyText(item.meaning) ===
          normalizeVocabularyText(themeLabel),
      );
      const graph = theme
        ? graphs.find((item) => item.themeId === theme.id)
        : graphs.find(
            (item) =>
              normalizeVocabularyText(item.meaning) ===
              normalizeVocabularyText(themeLabel),
          );
      const status = !theme
        ? graph
          ? "completed"
          : "locked"
        : graph && graph.nodesCount > 0
          ? "completed"
          : "available";

      return {
        id:
          theme?.id ??
          graph?.themeId ??
          `${regionId}-${normalizeVocabularyText(themeLabel)}`,
        regionId,
        label: theme?.meaning ?? graph?.meaning ?? themeLabel,
        themeId: theme?.id ?? graph?.themeId,
        graphId: graph?.graphId,
        kanji: theme?.kanji ?? graph?.kanji,
        kana: theme?.kana ?? graph?.kana,
        status,
        progress: getThemeProgress(graph),
        isAvailable: Boolean(theme || graph),
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