import type {
  GraphNodeVisualVariant,
  NodeStatus,
  NodeType,
} from "@/features/graph/lib/graphTypes";
import type {
  VocabularyGraphProgressItem,
  VocabularyGraphSummary,
  VocabularyNodeMastery,
  VocabularySubthemeContent,
  VocabularyWordLesson,
} from "../types";
import { createCustomGraph } from "./graphBuilder";
import {
  buildProgressiveConnections,
  compareProgressiveNodes,
} from "./progressiveGraph";
import {
  findWordProgress,
  getWordQuizProgressPercent,
  isWordFullyCompleted,
  mergeWordProgress,
} from "./vocabularyQuizProgress";

export type VocabularyNodeDefinition = {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  status: NodeStatus;
  imageUrl?: string | null;
  visualVariant?: GraphNodeVisualVariant;
  order?: number | null;
  selectedAt?: string | null;
  createdAt?: string | null;
  unlockedAt?: string | null;
  entityKind?: "theme" | "subtheme" | "word";
  entityId?: string;
  graphId?: string;
  symbol?: string;
  progress?: number;
  isAiRecommended?: boolean;
  recommendationRank?: number;
  recommendationSimilarity?: number;
};

export type VocabularySubthemeRecommendationMeta = {
  rank: number;
  similarity: number;
};

const answerTypeOrder: NodeType[] = [
  "speaking",
  "listening",
  "reading",
  "writing",
];

const visualVariantOrder: GraphNodeVisualVariant[] = ["red", "black", "white"];

function getVisualVariant(index: number): GraphNodeVisualVariant {
  return visualVariantOrder[index % visualVariantOrder.length] ?? "red";
}

export function getVocabularyNodeMastery(
  item: VocabularyGraphProgressItem,
): VocabularyNodeMastery {
  const scores = [
    item.speakingScore,
    item.listeningScore,
    item.meaningScore,
    item.writingScore,
  ];
  const completedTypes = scores.filter((score) => score >= 80).length;
  const average = Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length,
  );

  return {
    total: scores.length,
    completedTypes,
    average,
  };
}

function getNextNodeType(item: VocabularyGraphProgressItem): NodeType {
  const scores = [
    item.speakingScore,
    item.listeningScore,
    item.meaningScore,
    item.writingScore,
  ];
  const nextIndex = scores.findIndex((score) => score < 80);

  if (nextIndex === -1) {
    return "reading";
  }

  return answerTypeOrder[nextIndex] ?? "reading";
}

function getNodeStatus(item: VocabularyGraphProgressItem): NodeStatus {
  const mastery = getVocabularyNodeMastery(item);

  if (mastery.completedTypes === mastery.total) {
    return "completed";
  }

  return "available";
}

function pickNodeType(index: number): NodeType {
  return answerTypeOrder[index % answerTypeOrder.length] ?? "reading";
}

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function getWordSymbol(word: VocabularyWordLesson) {
  return word.kanji || word.hiragana || "語";
}

function getWordLabel(word: VocabularyWordLesson) {
  return word.meanings?.[0] || word.hiragana || word.kanji || "Palabra";
}

function getSubthemeProgressKey(item: VocabularyGraphProgressItem) {
  return item.subthemeId || [item.meaning, item.kanji, item.kana].map(normalizeText).join("|");
}

function getSubthemeContentKey(
  item: Pick<VocabularyGraphProgressItem | VocabularySubthemeContent, "meaning" | "kanji" | "kana">,
) {
  return [item.meaning, item.kanji, item.kana]
    .map(normalizeText)
    .join("|");
}

function compareProgressItems(
  a: VocabularyGraphProgressItem,
  b: VocabularyGraphProgressItem,
) {
  const progressiveResult = compareProgressiveNodes({
    id: a.nodeId,
    status: getNodeStatus(a),
    order: a.order,
    selectedAt: a.selectedAt,
    createdAt: a.createdAt,
    unlockedAt: a.unlockedAt,
  }, {
    id: b.nodeId,
    status: getNodeStatus(b),
    order: b.order,
    selectedAt: b.selectedAt,
    createdAt: b.createdAt,
    unlockedAt: b.unlockedAt,
  });

  if (progressiveResult !== 0) {
    return progressiveResult;
  }

  return `${a.meaning}|${a.kanji}|${a.kana}`.localeCompare(
    `${b.meaning}|${b.kanji}|${b.kana}`,
    "es",
    { sensitivity: "base" },
  );
}

function getWordOrder(word: VocabularyWordLesson, fallbackIndex: number) {
  const metadata = word as VocabularyWordLesson & {
    order?: number | null;
    unlockedAt?: string | null;
    completedAt?: string | null;
    score?: number | null;
  };

  return {
    order: metadata.order ?? fallbackIndex,
    unlockedAt: metadata.unlockedAt ?? null,
    completedAt: metadata.completedAt ?? null,
    score: metadata.score ?? null,
  };
}

function getProgressiveWords(
  item: VocabularyGraphProgressItem,
  words: VocabularyWordLesson[],
) {
  const seenWordIds = new Set<string>();
  const wordProgressById = new Map(
    (item.wordProgress ?? []).map((progress) => [progress.wordId, progress]),
  );
  const uniqueWords = words
    .filter((word) => {
      if (seenWordIds.has(word.wordId)) return false;
      seenWordIds.add(word.wordId);
      return true;
    })
    .map((word, index) => {
      const mergedWord = mergeWordProgress(word, findWordProgress(item, word.wordId));
      const progress = wordProgressById.get(word.wordId);
      const baseWordOrder = getWordOrder(word, index);

      return {
        ...mergedWord,
        order: baseWordOrder.order,
        unlockedAt: progress?.unlockedAt ?? baseWordOrder.unlockedAt,
        completedAt: progress?.completedAt ?? baseWordOrder.completedAt,
        score: progress?.score ?? baseWordOrder.score,
      };
    })
    .sort((a, b) =>
      compareProgressiveNodes(
        {
          id: a.wordId,
          status: "available",
          order: a.order,
          unlockedAt: a.unlockedAt,
        },
        {
          id: b.wordId,
          status: "available",
          order: b.order,
          unlockedAt: b.unlockedAt,
        },
      ),
    );

  const firstIncompleteIndex = uniqueWords.findIndex(
    (word) => !isWordFullyCompleted(word),
  );

  if (firstIncompleteIndex === -1) {
    return uniqueWords;
  }

  return uniqueWords.slice(0, firstIncompleteIndex + 1);
}

function getWordNodeStatus(words: VocabularyWordLesson[], index: number): NodeStatus {
  const currentWord = words[index];

  if (isWordFullyCompleted(currentWord)) {
    return "completed";
  }

  if (index === 0 || isWordFullyCompleted(words[index - 1])) {
    return "available";
  }

  return "locked";
}

export function buildVocabularyThemeGraphElements(
  graph: VocabularyGraphSummary,
  items: VocabularyGraphProgressItem[],
  themeSubthemes: VocabularySubthemeContent[],
  recommendedSubthemes: Partial<Record<string, VocabularySubthemeRecommendationMeta>> = {},
) {
  const sortedItems = [...items].sort(compareProgressItems);
  const selectedSubthemeKeys = new Set<string>();

  sortedItems.forEach((item) => {
    selectedSubthemeKeys.add(getSubthemeProgressKey(item));
    selectedSubthemeKeys.add(getSubthemeContentKey(item));
  });
  const definitions: VocabularyNodeDefinition[] = [];

  sortedItems.forEach((item, index) => {
    const mastery = getVocabularyNodeMastery(item);

    definitions.push({
      id: item.nodeId,
      type: getNextNodeType(item),
      label: item.meaning,
      description: item.meaning,
      status: getNodeStatus(item),
      order: item.order,
      selectedAt: item.selectedAt,
      createdAt: item.createdAt,
      unlockedAt: item.unlockedAt,
      entityKind: "subtheme",
      entityId: item.subthemeId ?? item.nodeId,
      graphId: graph.graphId,
      symbol: item.kanji || item.kana,
      progress: mastery.average,
      visualVariant: getVisualVariant(index),
      isAiRecommended: Boolean(item.subthemeId && recommendedSubthemes[item.subthemeId]),
      recommendationRank: item.subthemeId
        ? recommendedSubthemes[item.subthemeId]?.rank
        : undefined,
      recommendationSimilarity: item.subthemeId
        ? recommendedSubthemes[item.subthemeId]?.similarity
        : undefined,
    });
  });

  themeSubthemes
    .filter(
      (subtheme) =>
        !selectedSubthemeKeys.has(getSubthemeContentKey(subtheme)) &&
        !selectedSubthemeKeys.has(subtheme.id),
    )
    .forEach((subtheme, index) => {
      const recommendation = recommendedSubthemes[subtheme.id];

      definitions.push({
        id: `subtheme-${subtheme.id}`,
        type: pickNodeType(sortedItems.length + index),
        label: subtheme.meaning,
        description: subtheme.meaning,
        status: "available",
        order: sortedItems.length + index,
        entityKind: "subtheme",
        entityId: subtheme.id,
        graphId: graph.graphId,
        symbol: subtheme.kanji || subtheme.kana || subtheme.meaning.slice(0, 1),
        visualVariant: getVisualVariant(sortedItems.length + index),
        isAiRecommended: Boolean(recommendation),
        recommendationRank: recommendation?.rank,
        recommendationSimilarity: recommendation?.similarity,
      });
    });

  const connections = buildProgressiveConnections(definitions);
  return createCustomGraph(definitions, connections, {
    centerX: 480,
    centerY: 320,
    homeY: 124,
    paddingX: 136,
    paddingTop: 56,
    paddingBottom: 136,
  });
}

export function buildVocabularySubthemeGraphElements(
  item: VocabularyGraphProgressItem,
  words: VocabularyWordLesson[],
) {
  const visibleWords = getProgressiveWords(item, words);
  const mastery = getVocabularyNodeMastery(item);
  const isSubthemeCompleted = mastery.completedTypes === mastery.total;

  const definitions: VocabularyNodeDefinition[] = [];

  visibleWords.forEach((word, index) => {
    const wordMetadata = getWordOrder(word, index);
    const progressPercent = getWordQuizProgressPercent(word);

    definitions.push({
      id: `word-${word.wordId}`,
      type: pickNodeType(index),
      label: getWordLabel(word),
      description: getWordLabel(word),
      status: isSubthemeCompleted ? "completed" : getWordNodeStatus(visibleWords, index),
      imageUrl: word.icon ?? null,
      order: wordMetadata.order,
      unlockedAt: wordMetadata.unlockedAt,
      entityKind: "word",
      entityId: word.wordId,
      graphId: item.graphId,
      symbol: getWordSymbol(word),
      progress: isSubthemeCompleted ? 100 : progressPercent,
      visualVariant: getVisualVariant(index),
    });
  });

  const connections = buildProgressiveConnections(definitions);
  return createCustomGraph(definitions, connections, {
    centerX: 480,
    centerY: 320,
    homeY: 124,
    paddingX: 136,
    paddingTop: 56,
    paddingBottom: 136,
  });
}
