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
  kanto: "#881111",
  chubu: "#8E2E2E",
  kansai: "#A91F1F",
  chugoku: "#7A1D1D",
  shikoku: "#810404",
  kyushu: "#4A0909",
};

export const REGION_CONFIG: Record<
  VocabularyRegionId,
  {
    label: string;
    identity: string;
    color: string;
  }
> = {
  hokkaido: {
    label: "Hokkaidō",
    identity: "Naturaleza, nieve, clima, paisajes abiertos y fauna",
    color: regionColors.hokkaido,
  },
  tohoku: {
    label: "Tōhoku",
    identity: "Tradición, festivales, estaciones, calma y sensibilidad",
    color: regionColors.tohoku,
  },
  kanto: {
    label: "Kantō",
    identity: "Tokio, ciudad, tecnología, educación, oficinas y ritmo moderno",
    color: regionColors.kanto,
  },
  chubu: {
    label: "Chūbu",
    identity: "Monte Fuji, montañas, industria, precisión y descripción visual",
    color: regionColors.chubu,
  },
  kansai: {
    label: "Kansai",
    identity: "Osaka, Kyoto, Nara, comida, convivencia y vida cotidiana",
    color: regionColors.kansai,
  },
  chugoku: {
    label: "Chūgoku",
    identity: "Historia, rutas culturales, paisajes y ocio",
    color: regionColors.chugoku,
  },
  shikoku: {
    label: "Shikoku",
    identity: "Peregrinaje, calma, cuidado personal, salud y vínculos humanos",
    color: regionColors.shikoku,
  },
  kyushu: {
    label: "Kyūshū/Okinawa",
    identity: "Playas, energía, cultura popular, movimiento y estilo",
    color: regionColors.kyushu,
  },
};

export const REGION_FILL_TO_ID: Record<string, VocabularyRegionId> = {
  "#3A0B0B": "hokkaido",
  "#5A0F0F": "tohoku",
  "#881111": "kanto",
  "#C94A4A": "kanto",
  "#8E2E2E": "chubu",
  "#A91F1F": "kansai",
  "#7A1D1D": "chugoku",
  "#810404": "shikoku",
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

function getThemeProgress(graph?: VocabularyGraphSummary) {
  if (!graph) return 0;
  return Math.min(100, Math.max(8, graph.nodesCount * 10));
}

function isThemeUnlocked(theme?: VocabularyThemeContent) {
  if (!theme) {
    return false;
  }

  return theme.isUnlocked === true;
}

function isVocabularyRegionId(value?: string | null): value is VocabularyRegionId {
  return REGION_ORDER.includes(value as VocabularyRegionId);
}

function getThemeRegion(theme: VocabularyThemeContent) {
  return isVocabularyRegionId(theme.region) ? theme.region : null;
}

function findGraphForTheme(theme: VocabularyThemeContent, graphs: VocabularyGraphSummary[]) {
  return graphs.find((item) => item.themeId === theme.id);
}

function buildRegionThemeNode({
  regionId,
  theme,
  graph,
}: {
  regionId: VocabularyRegionId;
  theme: VocabularyThemeContent;
  graph?: VocabularyGraphSummary;
}): VocabularyRegionThemeNode {
  const label = theme.meaning;
  const status = graph && graph.nodesCount > 0
    ? "completed"
    : isThemeUnlocked(theme)
      ? "available"
      : "locked";

  return {
    id: theme.id,
    regionId,
    label,
    themeId: theme.id,
    graphId: graph?.graphId,
    kanji: theme.kanji || graph?.kanji,
    kana: theme.kana || graph?.kana,
    status,
    progress: getThemeProgress(graph),
    isAvailable: Boolean(graph || isThemeUnlocked(theme)),
  };
}

export function buildVocabularyRegionViewModels(
  themeCatalog: VocabularyThemeContent[],
  graphs: VocabularyGraphSummary[],
): VocabularyRegionViewModel[] {
  return REGION_ORDER.map((regionId) => {
    const config = REGION_CONFIG[regionId];
    const themes = themeCatalog
      .filter((theme) => getThemeRegion(theme) === regionId)
      .sort((left, right) =>
        left.meaning.localeCompare(right.meaning, "es", { sensitivity: "base" }),
      )
      .map((theme) =>
      buildRegionThemeNode({
        regionId,
        theme,
        graph: findGraphForTheme(theme, graphs),
      }),
      );

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