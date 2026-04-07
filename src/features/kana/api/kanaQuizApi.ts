import { apiFetch } from "@/shared/lib/api/client";
import { getCurrentUser } from "@/features/auth";
import {
  getKana,
  getKanaProgress,
  listHiraganas,
  listKatakanas,
} from "@/features/kana/api/kanaApi";
import type { Kana, UserKanaProgressDetailedResponse } from "@/features/kana/types";
import type {
  KanaQuizResponse,
  KanaQuizOption,
  KanaQuizType,
  KanaQuizSubmitBody,
} from "@/features/kana/types/quiz";

const KANA_QUIZ_CYCLE: KanaQuizType[] = [
  "from_kana",
  "from_romaji",
  "canvas",
];

function isKanaQuizType(value: string): value is KanaQuizType {
  return value === "from_kana" || value === "from_romaji" || value === "canvas";
}

function resolveKanaQuizType(progress?: UserKanaProgressDetailedResponse): KanaQuizType {
  if (progress?.exerciseType && isKanaQuizType(progress.exerciseType)) {
    return progress.exerciseType;
  }

  return "from_kana";
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = clone[index];
    clone[index] = clone[swapIndex];
    clone[swapIndex] = current;
  }

  return clone;
}

function buildOptions(values: string[], correctValue: string, size: number) {
  const distractors = shuffleArray(
    values.filter((value) => value !== correctValue),
  ).slice(0, Math.max(0, size - 1));

  const options: KanaQuizOption[] = shuffleArray([
    ...distractors.map((option) => ({ option, correct: false })),
    { option: correctValue, correct: true },
  ]);

  return options;
}

async function getKanaCatalogByType(kana: Kana) {
  return kana.kanaType === "katakana"
    ? listKatakanas()
    : listHiraganas();
}

function buildQuestion(
  quizType: KanaQuizType,
  currentKana: Kana,
  catalog: Kana[],
) {
  if (quizType === "from_kana") {
    return {
      type: "from_kana" as const,
      kanaId: currentKana.id,
      symbol: currentKana.symbol,
      romaji: currentKana.romaji ?? "",
      options: buildOptions(
        catalog.map((item) => item.romaji ?? "").filter(Boolean),
        currentKana.romaji ?? "",
        4,
      ),
      viewBox: currentKana.viewBox ?? "0 0 109 109",
      strokes: currentKana.strokes ?? [],
    };
  }

  if (quizType === "from_romaji") {
    return {
      type: "from_romaji" as const,
      kanaId: currentKana.id,
      symbol: currentKana.symbol,
      romaji: currentKana.romaji ?? "",
      options: buildOptions(
        catalog.map((item) => item.symbol),
        currentKana.symbol,
        6,
      ),
      viewBox: currentKana.viewBox ?? "0 0 109 109",
      strokes: currentKana.strokes ?? [],
    };
  }

  return {
    type: "canvas" as const,
    kanaId: currentKana.id,
    symbol: currentKana.symbol,
    romaji: currentKana.romaji ?? "",
    options: [],
    viewBox: currentKana.viewBox ?? "0 0 109 109",
    strokes: currentKana.strokes ?? [],
  };
}

function buildMixedKanaQuestions(
  currentKana: Kana,
  catalog: Kana[],
  startType: KanaQuizType,
) {
  const startIndex = KANA_QUIZ_CYCLE.indexOf(startType);
  const orderedTypes = Array.from({ length: KANA_QUIZ_CYCLE.length }, (_, index) => {
    return KANA_QUIZ_CYCLE[(startIndex + index) % KANA_QUIZ_CYCLE.length];
  });

  return orderedTypes.map((quizType) => buildQuestion(quizType, currentKana, catalog));
}

/**
 * Builds the kana quiz in the frontend, following the same gating strategy as
 * the kanji flow: availability depends on the user's general points.
 */
export async function getKanaQuiz(
  kanaId: string,
): Promise<KanaQuizResponse> {
  const [user, currentKana, progressItems] = await Promise.all([
    getCurrentUser().catch(() => null),
    getKana(kanaId),
    getKanaProgress().catch(() => []),
  ]);

  const userKanaPoints = typeof user?.kanaPoints === "number" ? user.kanaPoints : 0;

  if (userKanaPoints < currentKana.pointsToUnlock) {
    throw new Error(
      `No se tienen los puntos necesarios para este ejercicio (${userKanaPoints}/${currentKana.pointsToUnlock})`,
    );
  }

  const catalog = await getKanaCatalogByType(currentKana);
  const currentProgress = progressItems.find((item) => item.kanaId === kanaId);
  const startType = resolveKanaQuizType(currentProgress);

  return {
    type: "mixed",
    submitType: startType,
    questions: buildMixedKanaQuestions(currentKana, catalog, startType),
  };
}

export async function submitKanaQuiz(
  kanaId: string,
  body: KanaQuizSubmitBody,
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/api/content/kana/quiz/${kanaId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
