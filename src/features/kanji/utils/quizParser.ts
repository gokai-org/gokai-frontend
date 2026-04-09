import type {
  KanjiQuizQuestionRaw,
  KanjiQuizQuestion,
  KanjiQuizResponseRaw,
  KanjiQuizResponse,
  KanjiQuizExerciseQuestion,
} from "@/features/kanji/types/quiz";

export function parseKanjiQuizStrokes(
  raw: string | undefined | null,
): string[] {
  if (!raw || typeof raw !== "string") return [];

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

export function normalizeQuizQuestion(
  raw: KanjiQuizQuestionRaw,
): KanjiQuizQuestion {
  const rawOptions = raw.options ?? [];
  const seen = new Set<string>();
  const uniqueOptions = rawOptions.filter((opt) => {
    if (seen.has(opt.value)) return false;
    seen.add(opt.value);
    return true;
  });

  return {
    kanji: raw.kanji,
    options: uniqueOptions,
    viewBox: raw.viewBox,
    strokes: raw.strokes ? parseKanjiQuizStrokes(raw.strokes) : undefined,
  };
}

export function normalizeQuizResponse(
  raw: KanjiQuizResponseRaw,
): KanjiQuizResponse {
  return {
    type: raw.type,
    questions: raw.questions.map(normalizeQuizQuestion),
  };
}

export function isValidWritingQuestion(question: KanjiQuizQuestion): boolean {
  return (
    !!question.viewBox &&
    Array.isArray(question.strokes) &&
    question.strokes.length > 0 &&
    question.strokes.every((s) => typeof s === "string" && s.length > 0)
  );
}

/**
 * Adapts a backend quiz question to the shape expected by exercise components.
 * For "meaning" type the kanji field carries the prompt text (meaning),
 * so it is moved to `prompt` and `kanji` is cleared.
 */
export function toExerciseQuestion(
  question: KanjiQuizQuestion,
  quizType: "kanji" | "meaning" | "reading",
): KanjiQuizExerciseQuestion {
  return {
    kanji: quizType !== "meaning" ? question.kanji : "",
    prompt: quizType === "meaning" ? question.kanji : undefined,
    options: question.options,
  };
}
