import type { KanjiQuizType } from "@/features/kanji/types/quiz";
import type {
  VocabularyAnswerType,
  VocabularyGraphProgressItem,
  VocabularyWordLesson,
} from "@/features/graph/vocabulary/types";

import type {
  ReviewExerciseType,
  ReviewItem,
  ReviewRecommendation,
  ReviewStrategiesRegister,
  ReviewStrategyKey,
} from "../types";

export const REVIEW_STRATEGY_ORDER: ReviewStrategyKey[] = [
  "low_avg_score",
  "low_recent_score",
  "suboptimal_avg_duration",
  "suboptimal_recent_duration",
  "long_time_since_last_review",
  "too_few_reviews",
  "low_reading_score",
  "low_writing_score",
  "low_listening_score",
  "low_speaking_score",
];

const REVIEW_EXERCISE_ORDER: ReviewExerciseType[] = [
  "kanji",
  "meaning",
  "reading",
  "writing",
  "listening",
  "speaking",
];

function buildReviewId(recommendation: Pick<ReviewRecommendation, "lessonType" | "entityId">) {
  return [recommendation.lessonType, recommendation.entityId].join(":");
}

function mapReviewType(recommendation: ReviewRecommendation): ReviewItem["type"] {
  if (recommendation.lessonType === "word") {
    return "vocabulary";
  }

  return recommendation.lessonType;
}

function getPrimaryMeaning(meanings: string[]) {
  return meanings.find((meaning) => meaning.trim().length > 0) ?? null;
}

function getPrimaryReading(readings: string[], kana?: string | null) {
  return readings.find((reading) => reading.trim().length > 0) ?? kana ?? null;
}

export function getReviewStrategyLabel(strategy: string) {
  switch (strategy) {
    case "low_avg_score":
      return "Área débil detectada";
    case "low_recent_score":
      return "Tu rendimiento bajó recientemente";
    case "suboptimal_avg_duration":
      return "Te está tomando más tiempo de lo normal";
    case "suboptimal_recent_duration":
      return "Tu ritmo reciente cambió";
    case "long_time_since_last_review":
      return "Hace tiempo que no lo repasas";
    case "too_few_reviews":
      return "Necesitas más práctica para medir progreso";
    case "low_reading_score":
      return "Refuerzo de lectura";
    case "low_writing_score":
      return "Refuerzo de escritura";
    case "low_listening_score":
      return "Refuerzo auditivo";
    case "low_speaking_score":
      return "Refuerzo de pronunciación";
    default:
      return "Kazu detectó una oportunidad de repaso";
  }
}

export function getStrategyKeyFromIndex(index?: number) {
  if (typeof index !== "number") {
    return null;
  }

  return REVIEW_STRATEGY_ORDER[index] ?? null;
}

export function getReviewStrategyProbabilityEntries(
  register?: ReviewStrategiesRegister | null,
) {
  return REVIEW_STRATEGY_ORDER
    .map((key) => {
      const item = register?.[key];

      return {
        key,
        label: getReviewStrategyLabel(key),
        probability: item?.probability,
        avgReward: item?.avg_reward,
        evaluationCount: item?.evaluation_count,
      };
    })
    .filter((entry) => entry.probability !== undefined || entry.evaluationCount !== undefined)
    .sort((left, right) => (right.probability ?? 0) - (left.probability ?? 0));
}

export function getReviewExerciseLabel(
  lessonType: ReviewRecommendation["lessonType"],
  exerciseType?: ReviewExerciseType | null,
) {
  if (lessonType === "grammar") {
    return "Examen";
  }

  switch (exerciseType) {
    case "kanji":
      return "Significado";
    case "meaning":
      return lessonType === "word" ? "Significado" : "Selección";
    case "reading":
      return "Lectura";
    case "writing":
      return "Escritura";
    case "listening":
      return "Audio";
    case "speaking":
      return "Pronunciación";
    default:
      return lessonType === "word" ? "Vocabulario" : "Repaso";
  }
}

function getGroupedReviewExerciseLabel(item: {
  lessonType: ReviewRecommendation["lessonType"];
  exerciseType?: ReviewExerciseType;
  availableExerciseTypes?: ReviewExerciseType[];
}) {
  const exerciseTypes = item.availableExerciseTypes ?? [];

  if (exerciseTypes.length <= 1) {
    return getReviewExerciseLabel(item.lessonType, item.exerciseType);
  }

  if (item.lessonType === "grammar") {
    return "Examen";
  }

  if (item.lessonType === "word") {
    return `${exerciseTypes.length} ejercicios`;
  }

  return `${exerciseTypes.length} repasos`;
}

function getReviewActionLabel(item: ReviewItem) {
  if (item.lessonType === "grammar") {
    return "Abrir examen";
  }

  if (item.lessonType === "word") {
    return "Abrir quiz";
  }

  return `Repasar ${item.exerciseLabel.toLowerCase()}`;
}

export function buildReviewItems(
  recommendations: ReviewRecommendation[],
): ReviewItem[] {
  const groupedRecommendations = recommendations
    .filter((recommendation) => !recommendation.isTodayAnswered)
    .reduce<Map<string, ReviewRecommendation & { availableExerciseTypes: ReviewExerciseType[] }>>(
      (groups, recommendation) => {
        const key = buildReviewId(recommendation);
        const existing = groups.get(key);
        const nextExerciseType = recommendation.exerciseType ?? undefined;

        if (!existing) {
          groups.set(key, {
            ...recommendation,
            availableExerciseTypes: nextExerciseType ? [nextExerciseType] : [],
          });
          return groups;
        }

        const availableExerciseTypes = existing.availableExerciseTypes.includes(nextExerciseType as ReviewExerciseType)
          || !nextExerciseType
          ? existing.availableExerciseTypes
          : [...existing.availableExerciseTypes, nextExerciseType];

        groups.set(key, {
          ...existing,
          availableExerciseTypes: availableExerciseTypes.sort(
            (left, right) => REVIEW_EXERCISE_ORDER.indexOf(left) - REVIEW_EXERCISE_ORDER.indexOf(right),
          ),
          exerciseType: existing.exerciseType ?? recommendation.exerciseType,
          isTodayAnswered: existing.isTodayAnswered && recommendation.isTodayAnswered,
        });

        return groups;
      },
      new Map(),
    );

  return Array.from(groupedRecommendations.values()).map((recommendation) => {
    const meanings = recommendation.meanings ?? [];
    const readings = recommendation.readings ?? [];
    const type = mapReviewType(recommendation);
    const strategyLabel = getReviewStrategyLabel(recommendation.strategy);
    const primaryMeaning = getPrimaryMeaning(meanings);
    const primaryReading = getPrimaryReading(readings, recommendation.hiragana);

    let title = recommendation.title?.trim() || "Repaso recomendado";
    let description = recommendation.description?.trim() || strategyLabel;
    let detail: string | undefined;
    const symbol = recommendation.kanji?.trim() || undefined;
    const kana = recommendation.hiragana?.trim() || undefined;

    if (recommendation.lessonType === "kanji") {
      title = symbol
        ? primaryReading
          ? `${symbol} (${primaryReading})`
          : symbol
        : title;
      description = primaryMeaning ?? description;
      detail = meanings.length > 0 ? meanings.join(" · ") : primaryReading ?? undefined;
    }

    if (recommendation.lessonType === "word") {
      title = symbol ?? kana ?? primaryMeaning ?? title;
      description = primaryMeaning ?? description;
      detail = [symbol, kana].filter(Boolean).join(" · ") || undefined;
    }

    if (recommendation.lessonType === "grammar") {
      detail = recommendation.description?.trim() || undefined;
    }

    const item: ReviewItem = {
      id: buildReviewId(recommendation),
      type,
      lessonType: recommendation.lessonType,
      entityId: recommendation.entityId,
      nodeId: recommendation.nodeId ?? undefined,
      exerciseType: recommendation.exerciseType ?? undefined,
      availableExerciseTypes: recommendation.availableExerciseTypes.length > 0
        ? recommendation.availableExerciseTypes
        : recommendation.exerciseType
          ? [recommendation.exerciseType]
          : undefined,
      strategy: recommendation.strategy,
      strategyLabel,
      title,
      description,
      exerciseLabel: getGroupedReviewExerciseLabel({
        lessonType: recommendation.lessonType,
        exerciseType: recommendation.exerciseType ?? undefined,
        availableExerciseTypes: recommendation.availableExerciseTypes,
      }),
      actionLabel: "",
      detail,
      symbol,
      kana,
      image: recommendation.image ?? undefined,
      meanings,
      readings,
    };

    item.actionLabel = getReviewActionLabel(item);

    return item;
  });
}

export function isKanjiReviewExerciseType(
  value?: ReviewExerciseType,
): value is KanjiQuizType {
  return value === "kanji" || value === "meaning" || value === "reading" || value === "writing";
}

export function isVocabularyReviewExerciseType(
  value?: ReviewExerciseType,
): value is VocabularyAnswerType {
  return value === "meaning" || value === "listening" || value === "speaking" || value === "writing";
}

export function buildVocabularyReviewGraphItem(
  item: ReviewItem,
): VocabularyGraphProgressItem | null {
  if (item.lessonType !== "word" || !item.nodeId) {
    return null;
  }

  return {
    graphId: "reviews",
    themeId: "reviews",
    subthemeId: null,
    meaning: getPrimaryMeaning(item.meanings) ?? item.description,
    kanji: item.symbol ?? "",
    kana: item.kana ?? "",
    nodeId: item.nodeId,
    currentWordId: item.entityId,
    unlockedWordIds: [item.entityId],
    wordProgress: null,
    speakingScore: 0,
    listeningScore: 0,
    meaningScore: 0,
    writingScore: 0,
    selectedAt: null,
  };
}

export function buildVocabularyReviewQuestion(
  item: ReviewItem,
): VocabularyWordLesson | null {
  if (item.lessonType !== "word") {
    return null;
  }

  return {
    wordId: item.entityId,
    kanji: item.symbol,
    hiragana: item.kana,
    meanings: item.meanings,
    icon: item.image ?? null,
  };
}
