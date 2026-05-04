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

export function buildVocabularyThemeGraphElements(
  graph: VocabularyGraphSummary,
  items: VocabularyGraphProgressItem[],
  subthemeRecommendations: VocabularyRecommendation[],
) {
  const selectedSubthemeKeys = new Set(
    items.map((item) => getSubthemeProgressKey(item)),
  );
  const definitions: VocabularyNodeDefinition[] = [
    {
      id: "home",
      type: "home",
      label: graph.meaning,
      status: "completed",
      entityKind: "theme",
      entityId: graph.themeId,
      graphId: graph.graphId,
      symbol: graph.kanji || graph.kana,
    },
  ];

  items.forEach((item) => {
    const mastery = getVocabularyNodeMastery(item);

    definitions.push({
      id: item.nodeId,
      type: getNextNodeType(item),
      label: item.meaning,
      status: getNodeStatus(item),
      entityKind: "subtheme",
      entityId: item.nodeId,
      graphId: graph.graphId,
      symbol: item.kanji || item.kana,
      progress: mastery.average,
    });
  });

  subthemeRecommendations
    .filter(
      (recommendation) =>
        !selectedSubthemeKeys.has(getRecommendationKey(recommendation)),
    )
    .slice(0, 10)
    .forEach((recommendation, index) => {
      definitions.push({
        id: `subtheme-rec-${recommendation.entityId}`,
        type: pickNodeType(items.length + index),
        label: recommendation.meaning || recommendation.description,
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
  });

  const definitions: VocabularyNodeDefinition[] = [
    {
      id: "home",
      type: "home",
      label: item.meaning,
      status: "completed",
      entityKind: "subtheme",
      entityId: item.nodeId,
      graphId: item.graphId,
      symbol: item.kanji || item.kana,
      progress: getVocabularyNodeMastery(item).average,
    },
  ];

  uniqueWords.forEach((word, index) => {
    definitions.push({
      id: `word-${word.wordId}`,
      type: pickNodeType(index),
      label: getWordLabel(word),
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
