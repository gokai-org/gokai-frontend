import type { NodeStatus, NodeType } from "@/features/graph/lib/graphTypes";
import type {
  VocabularyGraphProgressItem,
  VocabularyGraphSummary,
  VocabularyNodeMastery,
  VocabularyRecommendation,
  VocabularyWordLesson,
} from "../types";
import { createCustomGraph, generateConnections } from "./graphBuilder";

export type VocabularyNodeDefinition = {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  status: NodeStatus;
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

function getRecommendationKey(recommendation: VocabularyRecommendation) {
  return recommendation.entityId || [recommendation.meaning, recommendation.kanji, recommendation.kana, recommendation.description]
    .map(normalizeText)
    .join("|");
}

function compareProgressItems(
  a: VocabularyGraphProgressItem,
  b: VocabularyGraphProgressItem,
) {
  const timeA = a.selectedAt ? new Date(a.selectedAt).getTime() : Number.MAX_SAFE_INTEGER;
  const timeB = b.selectedAt ? new Date(b.selectedAt).getTime() : Number.MAX_SAFE_INTEGER;

  if (timeA !== timeB) {
    return timeA - timeB;
  }

  return `${a.meaning}|${a.kanji}|${a.kana}`.localeCompare(
    `${b.meaning}|${b.kanji}|${b.kana}`,
    "es",
    { sensitivity: "base" },
  );
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
  const selectedSubthemeKeys = new Set(
    sortedItems.map((item) => getSubthemeProgressKey(item)),
  );
  const definitions: VocabularyNodeDefinition[] = [];

  sortedItems.forEach((item) => {
    const mastery = getVocabularyNodeMastery(item);

    definitions.push({
      id: item.nodeId,
      type: getNextNodeType(item),
      label: item.meaning,
      description: item.meaning,
      status: getNodeStatus(item),
      entityKind: "subtheme",
      entityId: item.nodeId,
      graphId: graph.graphId,
      symbol: item.kanji || item.kana,
      progress: mastery.average,
    });
  });

  [...subthemeRecommendations]
    .sort(compareRecommendations)
    .filter(
      (recommendation) =>
        !selectedSubthemeKeys.has(getRecommendationKey(recommendation)),
    )
    .slice(0, 10)
    .forEach((recommendation, index) => {
      definitions.push({
        id: `subtheme-rec-${recommendation.entityId}`,
        type: pickNodeType(sortedItems.length + index),
        label: recommendation.meaning || recommendation.description,
        description: recommendation.meaning || recommendation.description,
        status: "available",
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

  const connections = generateConnections(definitions);
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
  const seenWordIds = new Set<string>();
  const uniqueWords = words.filter((word) => {
    if (seenWordIds.has(word.wordId)) return false;
    seenWordIds.add(word.wordId);
    return true;
  }).sort((a, b) => getWordLabel(a).localeCompare(getWordLabel(b), "es", { sensitivity: "base" }));

  const definitions: VocabularyNodeDefinition[] = [];

  uniqueWords.forEach((word, index) => {
    definitions.push({
      id: `word-${word.wordId}`,
      type: pickNodeType(index),
      label: getWordLabel(word),
      description: getWordLabel(word),
      status: "available",
      entityKind: "word",
      entityId: word.wordId,
      graphId: item.graphId,
      symbol: getWordSymbol(word),
    });
  });

  const connections = generateConnections(definitions);
  return createCustomGraph(definitions, connections, {
    centerX: 480,
    centerY: 320,
    homeY: 124,
    paddingX: 136,
    paddingTop: 56,
    paddingBottom: 136,
  });
}
