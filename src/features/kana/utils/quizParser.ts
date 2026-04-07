import type {
  KanaQuizQuestionItemRaw,
  KanaQuizQuestionItem,
  KanaQuizResponseRaw,
  KanaQuizResponse,
  KanaQuizSessionType,
} from "@/features/kana/types/quiz";

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
    options: raw.options ?? [],
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

export function isValidCanvasQuestion(question: KanaQuizQuestionItem): boolean {
  return (
    !!question.viewBox &&
    Array.isArray(question.strokes) &&
    question.strokes.length > 0 &&
    question.strokes.every((s) => typeof s === "string" && s.length > 0)
  );
}
