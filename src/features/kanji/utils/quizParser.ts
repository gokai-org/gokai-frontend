import type {
  KanjiQuizQuestionRaw,
  KanjiQuizQuestion,
  KanjiQuizResponseRaw,
  KanjiQuizResponse,
} from "@/features/kanji/types/quiz";
import type { KanjiLessonQuestion } from "@/features/kanji/types/lessonFlow";

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
  return {
    kanji: raw.kanji,
    options: raw.options ?? [],
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

export function quizQuestionToLessonQuestion(
  question: KanjiQuizQuestion,
  quizType: "kanji" | "meaning" | "reading",
): KanjiLessonQuestion {
  return {
    // "meaning" shows a written meaning → the kanji field is unused; the meaning
    // text travels through `prompt` so KanjiSelectionExercise can render it.
    // "kanji" and "reading" both show the kanji symbol as the large prompt.
    kanji: quizType !== "meaning" ? question.kanji : "",
    kanjiId: "",
    prompt: quizType === "meaning" ? question.kanji : undefined,
    options: question.options.map((opt) => ({
      value: opt.value,
      correct: opt.correct,
    })),
  };
}
