import type {
  VocabularyAnswerType,
  VocabularyGraphProgressItem,
  VocabularyWordLesson,
  VocabularyWordProgress,
} from "../types";

export const VOCABULARY_QUIZ_TYPES: VocabularyAnswerType[] = [
  "meaning",
  "listening",
  "speaking",
  "writing",
];

export const VOCABULARY_QUIZ_TYPE_LABELS: Record<VocabularyAnswerType, string> = {
  meaning: "Significado",
  listening: "Audio",
  speaking: "Habla",
  writing: "Escritura",
};

type VocabularyNodeQuizProgress = Pick<
  VocabularyGraphProgressItem,
  "meaningScore" | "listeningScore" | "speakingScore" | "writingScore"
>;

const completedKeys: Record<VocabularyAnswerType, keyof VocabularyWordProgress> = {
  meaning: "meaningCompleted",
  listening: "listeningCompleted",
  speaking: "speakingCompleted",
  writing: "writingCompleted",
};

const scoreKeys: Record<VocabularyAnswerType, keyof VocabularyWordProgress> = {
  meaning: "meaningScore",
  listening: "listeningScore",
  speaking: "speakingScore",
  writing: "writingScore",
};

const nodeScoreKeys: Record<VocabularyAnswerType, keyof VocabularyNodeQuizProgress> = {
  meaning: "meaningScore",
  listening: "listeningScore",
  speaking: "speakingScore",
  writing: "writingScore",
};

export function findWordProgress(
  item: Pick<VocabularyGraphProgressItem, "wordProgress"> | null | undefined,
  wordId: string,
) {
  return item?.wordProgress?.find((progress) => progress.wordId === wordId) ?? null;
}

export function mergeWordProgress(
  word: VocabularyWordLesson,
  progress: VocabularyWordProgress | null | undefined,
): VocabularyWordLesson {
  if (!progress) {
    return word;
  }

  return {
    ...word,
    unlockedAt: progress.unlockedAt ?? word.unlockedAt,
    completedAt: progress.completedAt ?? word.completedAt,
    score: progress.score ?? word.score,
    progress: progress.progress ?? word.progress,
    completedQuizTypes: progress.completedQuizTypes ?? word.completedQuizTypes,
    meaningCompleted: progress.meaningCompleted ?? word.meaningCompleted,
    listeningCompleted: progress.listeningCompleted ?? word.listeningCompleted,
    speakingCompleted: progress.speakingCompleted ?? word.speakingCompleted,
    writingCompleted: progress.writingCompleted ?? word.writingCompleted,
    meaningScore: progress.meaningScore ?? word.meaningScore,
    listeningScore: progress.listeningScore ?? word.listeningScore,
    speakingScore: progress.speakingScore ?? word.speakingScore,
    writingScore: progress.writingScore ?? word.writingScore,
    updatedAt: progress.updatedAt ?? word.updatedAt,
  };
}

export function getCompletedQuizTypes(
  progress: VocabularyWordProgress | VocabularyWordLesson | null | undefined,
) {
  if (!progress) {
    return [] as VocabularyAnswerType[];
  }

  if (progress.completedQuizTypes?.length) {
    return VOCABULARY_QUIZ_TYPES.filter((type) =>
      progress.completedQuizTypes?.includes(type),
    );
  }

  return VOCABULARY_QUIZ_TYPES.filter((type) => Boolean(progress[completedKeys[type]]));
}

export function getWordQuizProgressPercent(
  progress: VocabularyWordProgress | VocabularyWordLesson | null | undefined,
) {
  return getCompletedQuizTypes(progress).length * 25;
}

export function isWordFullyCompleted(
  progress: VocabularyWordProgress | VocabularyWordLesson | null | undefined,
) {
  return getWordQuizProgressPercent(progress) >= 100;
}

export function getQuizTypeProgress(
  progress: VocabularyWordProgress | VocabularyWordLesson | null | undefined,
  type: VocabularyAnswerType,
) {
  const completed = getCompletedQuizTypes(progress).includes(type);
  const rawScore = progress?.[scoreKeys[type]];
  const score = typeof rawScore === "number" ? rawScore : null;

  return {
    completed,
    correct: completed && score === 100,
    score,
  };
}

export function getNodeQuizTypeProgress(
  progress: VocabularyNodeQuizProgress | null | undefined,
  type: VocabularyAnswerType,
) {
  const score = progress?.[nodeScoreKeys[type]] ?? null;
  const normalizedScore = typeof score === "number" ? score : null;
  const completed = normalizedScore === 100;

  return {
    completed,
    correct: completed,
    score: normalizedScore,
  };
}

export function getNodeQuizProgressPercent(
  progress: VocabularyNodeQuizProgress | null | undefined,
) {
  return VOCABULARY_QUIZ_TYPES.filter((type) =>
    getNodeQuizTypeProgress(progress, type).completed,
  ).length * 25;
}