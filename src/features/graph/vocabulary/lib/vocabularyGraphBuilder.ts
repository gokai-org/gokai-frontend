import type { NodeStatus, NodeType } from "@/features/graph/lib/graphTypes";
import type {
  VocabularyGraphProgressItem,
  VocabularyGraphSummary,
  VocabularyNodeMastery,
  VocabularyRecommendation,
  VocabularyWordLesson,
} from "../types";
import { createCustomGraph } from "./graphBuilder";
import {
  buildProgressiveConnections,
  compareProgressiveNodes,
} from "./progressiveGraph";

export type VocabularyNodeDefinition = {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  status: NodeStatus;
  order?: number | null;
  selectedAt?: string | null;
  createdAt?: string | null;
  unlockedAt?: string | null;
  entityKind?: "theme" | "subtheme" | "word";
  entityId?: string;
  graphId?: string;
  recommendationId?: string;
  similarity?: number;
  isRecommendation?: boolean;
  symbol?: string;
  progress?: number;
};

const answerTypeOrder: NodeType[] = [
  "speaking",
  "listening",
  "reading",
  "writing",
];

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
  item: Pick<VocabularyGraphProgressItem | VocabularyRecommendation, "meaning" | "kanji" | "kana"> & {
    description?: string;
  },
) {
  return [item.meaning || item.description, item.kanji, item.kana]
    .map(normalizeText)
    .join("|");
}

function getRecommendationKey(recommendation: VocabularyRecommendation) {
  return recommendation.entityId || [recommendation.meaning, recommendation.kanji, recommendation.kana, recommendation.description]
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

function getUnlockedWordCount(
  item: VocabularyGraphProgressItem,
  words: VocabularyWordLesson[],
) {
  if (words.length === 0) {
    return 0;
  }

  if (item.unlockedWordIds?.length) {
    return Math.min(words.length, item.unlockedWordIds.length);
  }

  const mastery = getVocabularyNodeMastery(item);
  const byAverage = Math.ceil((words.length * mastery.average) / 100);
  const byCompletedTypes = mastery.completedTypes + 1;

  return Math.min(words.length, Math.max(1, byAverage, byCompletedTypes));
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
      const progress = wordProgressById.get(word.wordId);

      return {
        ...word,
        order: progress?.order ?? getWordOrder(word, index).order,
        unlockedAt: progress?.unlockedAt ?? getWordOrder(word, index).unlockedAt,
        completedAt: progress?.completedAt ?? getWordOrder(word, index).completedAt,
        score: progress?.score ?? getWordOrder(word, index).score,
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

  if (item.unlockedWordIds?.length) {
    const unlockedIds = new Set(item.unlockedWordIds);
    return uniqueWords.filter((word) => unlockedIds.has(word.wordId));
  }

  return uniqueWords.slice(0, getUnlockedWordCount(item, uniqueWords));
}

function compareRecommendations(
  a: VocabularyRecommendation,
  b: VocabularyRecommendation,
) {
  if (a.similarity !== b.similarity) {
    return b.similarity - a.similarity;
  }

  return `${a.meaning || a.description}|${a.kanji || ""}|${a.kana || ""}`.localeCompare(
    `${b.meaning || b.description}|${b.kanji || ""}|${b.kana || ""}`,
    "es",
    { sensitivity: "base" },
  );
}

export function buildVocabularyThemeGraphElements(
  graph: VocabularyGraphSummary,
  items: VocabularyGraphProgressItem[],
  subthemeRecommendations: VocabularyRecommendation[],
) {
  const sortedItems = [...items].sort(compareProgressItems);
  const selectedSubthemeKeys = new Set<string>();

  sortedItems.forEach((item) => {
    selectedSubthemeKeys.add(getSubthemeProgressKey(item));
    selectedSubthemeKeys.add(getSubthemeContentKey(item));
  });
  const definitions: VocabularyNodeDefinition[] = [];

  sortedItems.forEach((item) => {
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
    });
  });

  [...subthemeRecommendations]
    .sort(compareRecommendations)
    .filter(
      (recommendation) =>
        !selectedSubthemeKeys.has(getRecommendationKey(recommendation)) &&
        !selectedSubthemeKeys.has(getSubthemeContentKey(recommendation)),
    )
    .slice(0, 10)
    .forEach((recommendation, index) => {
      definitions.push({
        id: `subtheme-rec-${recommendation.entityId}`,
        type: pickNodeType(sortedItems.length + index),
        label: recommendation.meaning || recommendation.description,
        description: recommendation.meaning || recommendation.description,
        status: "available",
        order: sortedItems.length + index,
        entityKind: "subtheme",
        entityId: recommendation.entityId,
        graphId: graph.graphId,
        recommendationId: recommendation.id,
        similarity: recommendation.similarity,
        isRecommendation: true,
        symbol:
          recommendation.kanji || recommendation.kana || recommendation.description.slice(0, 1),
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

    definitions.push({
      id: `word-${word.wordId}`,
      type: pickNodeType(index),
      label: getWordLabel(word),
      description: getWordLabel(word),
      status: isSubthemeCompleted || index < visibleWords.length - 1 ? "completed" : "available",
      order: wordMetadata.order,
      unlockedAt: wordMetadata.unlockedAt,
      entityKind: "word",
      entityId: word.wordId,
      graphId: item.graphId,
      symbol: getWordSymbol(word),
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
