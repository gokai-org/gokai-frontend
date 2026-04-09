import type {
  KanaQuizQuestionItemRaw,
  KanaQuizQuestionItem,
  KanaQuizOption,
  KanaQuizResponseRaw,
  KanaQuizResponse,
  KanaQuizSessionType,
} from "@/features/kana/types/quiz";
import type { KanaType } from "@/features/kana/types";

const EARLY_KANA_POOLS: Record<
  KanaType,
  Array<{ symbol: string; romaji: string }>
> = {
  hiragana: [
    { symbol: "あ", romaji: "a" },
    { symbol: "い", romaji: "i" },
    { symbol: "う", romaji: "u" },
    { symbol: "え", romaji: "e" },
    { symbol: "お", romaji: "o" },
  ],
  katakana: [
    { symbol: "ア", romaji: "a" },
    { symbol: "イ", romaji: "i" },
    { symbol: "ウ", romaji: "u" },
    { symbol: "エ", romaji: "e" },
    { symbol: "オ", romaji: "o" },
  ],
};

type EarlyKanaOptionsContext = {
  kanaType: KanaType | null;
  currentLabel: string;
};

function normalizeKanaOptionLabel(label: string): string {
  return label.trim().toLocaleLowerCase("es");
}

function normalizeKanaOptions(options: KanaQuizOption[] | undefined): KanaQuizOption[] {
  const nextOptions: KanaQuizOption[] = [];
  const optionIndexByLabel = new Map<string, number>();

  for (const option of options ?? []) {
    const optionLabel = option.option.trim();
    if (!optionLabel) {
      continue;
    }

    const normalizedOptionLabel = normalizeKanaOptionLabel(optionLabel);
    const existingIndex = optionIndexByLabel.get(normalizedOptionLabel);

    if (existingIndex === undefined) {
      optionIndexByLabel.set(normalizedOptionLabel, nextOptions.length);
      nextOptions.push({
        option: optionLabel,
        correct: Boolean(option.correct),
      });
      continue;
    }

    if (option.correct) {
      nextOptions[existingIndex] = {
        ...nextOptions[existingIndex],
        correct: true,
      };
    }
  }

  return nextOptions;
}

function getSingleCorrectOptionIndex(options: KanaQuizOption[]): number {
  const markedCorrectIndices = options.reduce<number[]>((indices, option, index) => {
    if (option.correct) {
      indices.push(index);
    }

    return indices;
  }, []);

  if (markedCorrectIndices.length === 1) {
    return markedCorrectIndices[0];
  }

  if (markedCorrectIndices.length > 1) {
    return markedCorrectIndices[0];
  }

  return -1;
}

function withSingleCorrectOption(
  options: KanaQuizOption[],
  correctLabel?: string,
): KanaQuizOption[] {
  if (options.length === 0) {
    return options;
  }

  let correctIndex = -1;

  if (correctLabel) {
    const normalizedCorrectLabel = normalizeKanaOptionLabel(correctLabel);
    correctIndex = options.findIndex(
      (option) =>
        normalizeKanaOptionLabel(option.option) === normalizedCorrectLabel,
    );
  }

  if (correctIndex < 0) {
    correctIndex = getSingleCorrectOptionIndex(options);
  }

  if (correctIndex < 0) {
    return options.map((option) => ({ ...option, correct: false }));
  }

  return options.map((option, index) => ({
    ...option,
    correct: index === correctIndex,
  }));
}

function resolveEarlyKanaEntry(
  question: KanaQuizQuestionItem,
  context: EarlyKanaOptionsContext,
): { symbol: string; romaji: string } | null {
  if (question.type === "canvas" || !context.kanaType) {
    return null;
  }

  const candidateLabels = [question.symbol, question.romaji]
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  if (candidateLabels.length === 0 && context.currentLabel.trim()) {
    candidateLabels.push(context.currentLabel.trim());
  }

  if (candidateLabels.length === 0) {
    return null;
  }

  const normalizedCandidates = new Set(
    candidateLabels.map((label) => normalizeKanaOptionLabel(label)),
  );

  return (
    EARLY_KANA_POOLS[context.kanaType].find((item) => {
      const normalizedSymbol = normalizeKanaOptionLabel(item.symbol);
      const normalizedRomaji = normalizeKanaOptionLabel(item.romaji);

      return (
        normalizedCandidates.has(normalizedSymbol) ||
        normalizedCandidates.has(normalizedRomaji)
      );
    }) ?? null
  );
}

function resolveSessionType(
  questions: KanaQuizQuestionItem[],
  rawType?: KanaQuizResponseRaw["type"],
): KanaQuizSessionType {
  if (rawType) {
    return rawType;
  }

  const uniqueTypes = new Set(questions.map((question) => question.type));
  if (uniqueTypes.size === 1) {
    return questions[0]?.type ?? "from_kana";
  }

  return "mixed";
}

/**
 * Parses strokes that may arrive as a JSON-serialized string or already
 * parsed array from the backend.
 */
export function parseKanaQuizStrokes(
  raw: string | string[] | undefined | null,
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }
  if (typeof raw !== "string") return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  } catch {
    if (raw.startsWith("M") || raw.startsWith("m")) {
      return [raw];
    }
    return [];
  }
}

export function normalizeKanaQuizQuestion(
  raw: KanaQuizQuestionItemRaw,
): KanaQuizQuestionItem {
  return {
    type: raw.type,
    kanaId: raw.kanaId,
    symbol: raw.symbol ?? "",
    romaji: raw.romaji ?? "",
    options: normalizeKanaOptions(raw.options),
    viewBox: raw.viewBox ?? "0 0 109 109",
    strokes: parseKanaQuizStrokes(raw.strokes),
  };
}

export function normalizeKanaQuizResponse(
  raw: KanaQuizResponseRaw,
): KanaQuizResponse {
  const questions = (raw.questions ?? []).map(normalizeKanaQuizQuestion);

  return {
    type: resolveSessionType(questions, raw.type),
    submitType: questions[questions.length - 1]?.type ?? raw.type ?? "from_kana",
    questions,
  };
}

function getExpectedKanaCorrectLabel(
  question: KanaQuizQuestionItem,
  currentKana: { symbol: string; romaji: string },
): string {
  if (question.type === "from_romaji") {
    return currentKana.symbol.trim();
  }

  if (question.type === "from_kana") {
    return currentKana.romaji.trim();
  }

  return "";
}

function getPreferredCorrectIndex(
  question: KanaQuizQuestionItem,
  correctLabel: string,
): number {
  const normalizedCorrectLabel = normalizeKanaOptionLabel(correctLabel);

  return question.options.findIndex(
    (option) =>
      option.correct ||
      normalizeKanaOptionLabel(option.option) === normalizedCorrectLabel,
  );
}

function ensureCorrectKanaOption(
  options: KanaQuizOption[],
  correctLabel: string,
  preferredIndex: number,
  maxOptions: number,
): KanaQuizOption[] {
  const normalizedCorrectLabel = normalizeKanaOptionLabel(correctLabel);
  const existingCorrectIndex = options.findIndex(
    (option) =>
      normalizeKanaOptionLabel(option.option) === normalizedCorrectLabel,
  );

  if (existingCorrectIndex >= 0) {
    return withSingleCorrectOption(options, correctLabel);
  }

  const nextOptions = options.filter(
    (option) =>
      normalizeKanaOptionLabel(option.option) !== normalizedCorrectLabel,
  );
  const boundedIndex = preferredIndex >= 0
    ? Math.min(preferredIndex, nextOptions.length)
    : 0;

  nextOptions.splice(boundedIndex, 0, {
    option: correctLabel,
    correct: true,
  });

  while (maxOptions > 0 && nextOptions.length > maxOptions) {
    let removed = false;

    for (let index = nextOptions.length - 1; index >= 0; index -= 1) {
      if (
        normalizeKanaOptionLabel(nextOptions[index].option) ===
        normalizedCorrectLabel
      ) {
        continue;
      }

      nextOptions.splice(index, 1);
      removed = true;
      break;
    }

    if (!removed) {
      break;
    }
  }

  return withSingleCorrectOption(nextOptions, correctLabel);
}

function repairKanaQuestionOptions(
  question: KanaQuizQuestionItem,
  context: EarlyKanaOptionsContext,
): KanaQuizOption[] {
  const normalizedOptions = normalizeKanaOptions(question.options);

  if (question.type === "canvas") {
    return normalizedOptions;
  }

  const earlyKana = resolveEarlyKanaEntry(question, context);
  if (!earlyKana) {
    return withSingleCorrectOption(normalizedOptions);
  }

  const correctLabel = getExpectedKanaCorrectLabel(question, earlyKana);
  if (!correctLabel) {
    return withSingleCorrectOption(normalizedOptions);
  }

  return ensureCorrectKanaOption(
    normalizedOptions,
    correctLabel,
    getPreferredCorrectIndex(question, correctLabel),
    question.options.length || normalizedOptions.length || 1,
  );
}

export function applyEarlyKanaOptionPool(
  response: KanaQuizResponse,
  context: EarlyKanaOptionsContext,
): KanaQuizResponse {
  return {
    ...response,
    questions: response.questions.map((question) => ({
      ...question,
      options: repairKanaQuestionOptions(question, context),
    })),
  };
}

export function isValidCanvasQuestion(question: KanaQuizQuestionItem): boolean {
  return (
    !!question.viewBox &&
    Array.isArray(question.strokes) &&
    question.strokes.length > 0 &&
    question.strokes.every((s) => typeof s === "string" && s.length > 0)
  );
}
