import type { Kanji, KanjiStrokeData } from "@/features/kanji/types";
import {
  QUIZ_DEFAULT_OPTION_COUNT,
  QUIZ_MEANING_OPTION_COUNT,
  QUIZ_QUESTIONS_PER_ROUND,
  type KanjiQuizOption,
  type KanjiQuizResponse,
} from "@/features/kanji/types/quiz";
import {
  meaningsToArray,
  normalizeKanjiDisplayText,
  readingsToArray,
} from "@/features/kanji/utils/kanjiText";

export interface KanjiQuizSource {
  kanji: Kanji;
  strokeData?: KanjiStrokeData | null;
}

interface BuildFixedKanjiQuizRoundsOptions {
  seedHint?: string;
  questionCount?: number;
  optionSources?: readonly KanjiQuizSource[];
}

interface PreparedKanjiQuizSource {
  kanji: Kanji;
  symbol: string;
  meanings: string[];
  readings: string[];
  primaryMeaning: string;
  writingViewBox: string;
  writingStrokes: string[];
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let current = seed || 1;
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const next = [...items];
  const random = createSeededRandom(seed);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function pickDistractors(
  pool: readonly string[],
  excluded: ReadonlySet<string>,
  count: number,
  seed: number,
) {
  return seededShuffle(
    pool.filter((item) => !excluded.has(item.toLowerCase())),
    seed,
  ).slice(0, count);
}

function buildOptions(
  correct: string,
  distractors: string[],
  seed: number,
): KanjiQuizOption[] {
  return seededShuffle(
    [
      { value: correct, correct: true },
      ...distractors.map((value) => ({ value, correct: false })),
    ],
    seed,
  );
}

function buildCappedOptions(
  correct: string,
  pool: readonly string[],
  optionCount: number,
  seed: number,
) {
  const excluded = new Set([correct.toLocaleLowerCase("es")]);
  const distractorCount = Math.max(0, optionCount - 1);
  const distractors = pickDistractors(pool, excluded, distractorCount, seed);

  return buildOptions(correct, distractors, seed + 7);
}

function uniqueValues(values: string[]) {
  const seen = new Set<string>();
  const next: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") continue;

    const normalized = normalizeKanjiDisplayText(value);
    if (!normalized) continue;

    const key = normalized.toLocaleLowerCase("es");
    if (seen.has(key)) continue;

    seen.add(key);
    next.push(normalized);
  }

  return next;
}

function expandSourcesToCount<T>(sources: readonly T[], count: number): T[] {
  if (sources.length === 0) return [];

  return Array.from(
    { length: count },
    (_, index) => sources[index % sources.length]!,
  );
}

function prepareQuizSource(source: KanjiQuizSource): PreparedKanjiQuizSource {
  const meanings = uniqueValues(meaningsToArray(source.kanji.meanings));
  const readings = uniqueValues(readingsToArray(source.kanji.readings));

  return {
    kanji: source.kanji,
    symbol: source.kanji.symbol,
    meanings,
    readings,
    primaryMeaning: meanings[0] || "Sin significado",
    writingViewBox:
      source.strokeData?.viewBox ?? source.kanji.viewBox ?? "0 0 109 109",
    writingStrokes: source.strokeData?.strokes ?? source.kanji.strokes ?? [],
  };
}

export function buildFixedKanjiQuizRounds(
  sources: readonly KanjiQuizSource[],
  options: BuildFixedKanjiQuizRoundsOptions = {},
): KanjiQuizResponse[] {
  const preparedSources = sources
    .map(prepareQuizSource)
    .filter((source) => source.symbol.length > 0);
  if (preparedSources.length === 0) return [];
  const preparedOptionSources = (options.optionSources ?? sources)
    .map(prepareQuizSource)
    .filter((source) => source.symbol.length > 0);
  const effectiveQuestionCount = Math.max(
    1,
    options.questionCount ?? QUIZ_QUESTIONS_PER_ROUND,
  );

  const baseSeed = hashString(
    `${options.seedHint ?? ""}:${preparedSources.map((source) => source.kanji.id).join("|")}`,
  );

  // All four rounds use the same effectiveQuestionCount:
  //  • 1  when the caller passes questionCount=1 (kanjis #1–#4, intro mode)
  //  • 4  when the caller passes questionCount=4 (kanji #5+, full review)
  const meaningQuestionSources = expandSourcesToCount(
    seededShuffle(preparedSources, baseSeed + 11),
    effectiveQuestionCount,
  );
  const selectionQuestionSources = expandSourcesToCount(
    seededShuffle(preparedSources, baseSeed + 23),
    effectiveQuestionCount,
  );
  const readingQuestionSources = expandSourcesToCount(
    seededShuffle(preparedSources, baseSeed + 31),
    effectiveQuestionCount,
  );
  const writingQuestionSources = expandSourcesToCount(
    seededShuffle(preparedSources, baseSeed + 41),
    effectiveQuestionCount,
  );

  const meaningQuestions = meaningQuestionSources.map((source, index) => {
    const meaningDistractorPool = uniqueValues(
      preparedOptionSources
        .filter((candidate) => candidate.kanji.id !== source.kanji.id)
        .flatMap((candidate) => candidate.meanings),
    );
    return {
      kanji: source.symbol,
      options: buildCappedOptions(
        source.primaryMeaning,
        meaningDistractorPool,
        QUIZ_DEFAULT_OPTION_COUNT,
        baseSeed + 47 + index * 17,
      ),
    };
  });

  const selectionQuestions = selectionQuestionSources.map((source, index) => {
    const kanjiDistractorPool = uniqueValues(
      preparedOptionSources
        .filter((candidate) => candidate.kanji.id !== source.kanji.id)
        .map((candidate) => candidate.symbol),
    );
    return {
      kanji: source.primaryMeaning,
      options: buildCappedOptions(
        source.symbol,
        kanjiDistractorPool,
        QUIZ_MEANING_OPTION_COUNT,
        baseSeed + 59 + index * 23,
      ),
    };
  });

  const readingQuestions = readingQuestionSources.map((source, index) => {
    // Show the kanji symbol → student picks the correct reading.
    const readingDistractorPool = uniqueValues(
      preparedOptionSources
        .filter((candidate) => candidate.kanji.id !== source.kanji.id)
        .flatMap((candidate) => candidate.readings),
    );
    return {
      kanji: source.symbol,
      options: buildCappedOptions(
        source.readings[0] ?? source.symbol,
        readingDistractorPool,
        QUIZ_DEFAULT_OPTION_COUNT,
        baseSeed + 67 + index * 31,
      ),
    };
  });

  const writingQuestions = writingQuestionSources.map((source) => ({
    kanji: source.symbol,
    options: [],
    viewBox: source.writingViewBox,
    strokes: source.writingStrokes,
  }));

  return [
    {
      type: "kanji",
      questions: meaningQuestions,
    },
    {
      type: "meaning",
      questions: selectionQuestions,
    },
    {
      type: "reading",
      questions: readingQuestions,
    },
    {
      type: "writing",
      questions: writingQuestions,
    },
  ];
}
