import type {
  AdminGrammarCompleteExam,
  AdminGrammarCompleteOption,
  AdminGrammarComponent,
  AdminGrammarComponentType,
  AdminGrammarExamItem,
  AdminGrammarImageStep,
  AdminGrammarLesson,
  AdminGrammarLessonStats,
  AdminGrammarLessonSummary,
  AdminGrammarOrderExam,
  AdminGrammarQuestionExam,
  AdminGrammarQuestionOption,
  AdminGrammarSectionContent,
  AdminGrammarTableCell,
  AdminGrammarTableContent,
  AdminGrammarTableRow,
  AdminGrammarTextStep,
} from "../types/grammar";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toStringValue(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function toNullableString(value: unknown) {
  const normalized = toStringValue(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function toNumberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeComponentType(value: unknown): AdminGrammarComponentType {
  const type = toStringValue(value).trim().toLowerCase();

  if (type === "image_stepper" || type === "text_stepper" || type === "table") {
    return type;
  }

  return "table";
}

function normalizeTableCell(value: unknown): AdminGrammarTableCell | null {
  if (typeof value === "string" || typeof value === "number") {
    return {
      value: toStringValue(value),
      rowspan: 1,
      colspan: 1,
    };
  }

  const record = asRecord(value);
  if (!record) return null;

  return {
    value: toStringValue(record.value),
    rowspan: Math.max(1, toNumberOrNull(record.rowspan) ?? 1),
    colspan: Math.max(1, toNumberOrNull(record.colspan) ?? 1),
  };
}

function normalizeTableRow(value: unknown): AdminGrammarTableRow | null {
  if (Array.isArray(value)) {
    const cells = value
      .map(normalizeTableCell)
      .filter((cell): cell is AdminGrammarTableCell => cell !== null);

    return cells.length > 0 ? { cells } : null;
  }

  const record = asRecord(value);
  if (!record) return null;

  const cells = asArray(record.cells)
    .map(normalizeTableCell)
    .filter((cell): cell is AdminGrammarTableCell => cell !== null);

  return cells.length > 0 ? { cells } : null;
}

function normalizeTableContent(value: unknown): AdminGrammarTableContent {
  const record = asRecord(value);
  const source = asRecord(record?.content) ?? record;

  const headers = asArray(source?.headers)
    .map((header) => toStringValue(header).trim())
    .filter(Boolean);
  const rows = asArray(source?.rows)
    .map(normalizeTableRow)
    .filter((row): row is AdminGrammarTableRow => row !== null);

  return {
    headers: headers.length > 0 ? headers : ["Columna 1"],
    rows: rows.length > 0 ? rows : [{ cells: [{ value: "", rowspan: 1, colspan: 1 }] }],
  };
}

function normalizeImageStep(value: unknown): AdminGrammarImageStep | null {
  const record = asRecord(value);
  if (!record) {
    const text = toStringValue(value).trim();
    return text ? { img: "", description: text } : null;
  }

  return {
    img: toStringValue(record.img ?? record.image ?? record.imageUrl ?? record.url),
    description: toStringValue(
      record.description ?? record.text ?? record.content ?? record.explanation,
    ),
  };
}

function normalizeTextStep(value: unknown): AdminGrammarTextStep | null {
  const record = asRecord(value);
  if (!record) return null;

  return {
    kanji: toStringValue(record.kanji ?? record.japanese ?? record.text ?? record.sentence),
    kana: toStringValue(record.kana ?? record.reading ?? record.furigana ?? record.pronunciation),
    meaning: toStringValue(record.meaning ?? record.translation ?? record.spanish ?? record.description),
  };
}

function normalizeSectionContent(
  type: AdminGrammarComponentType,
  value: unknown,
): AdminGrammarSectionContent {
  const record = asRecord(value);
  const content = record?.content ?? value;

  if (type === "image_stepper") {
    const steps = asArray(content)
      .map(normalizeImageStep)
      .filter((step): step is AdminGrammarImageStep => step !== null);
    return steps.length > 0 ? steps : [{ img: "", description: "" }];
  }

  if (type === "text_stepper") {
    const steps = asArray(content)
      .map(normalizeTextStep)
      .filter((step): step is AdminGrammarTextStep => step !== null);
    return steps.length > 0 ? steps : [{ kanji: "", kana: "", meaning: "" }];
  }

  return normalizeTableContent(value);
}

export function normalizeAdminGrammarComponent(
  value: unknown,
  fallbackType: AdminGrammarComponentType,
): AdminGrammarComponent {
  const record = asRecord(value);
  const type = normalizeComponentType(record?.type ?? fallbackType);

  return {
    type,
    content: normalizeSectionContent(type, value),
  };
}

function normalizeQuestionOption(value: unknown): AdminGrammarQuestionOption | null {
  const record = asRecord(value);
  if (!record) {
    const text = toStringValue(value).trim();
    return text ? { option: text, correct: false } : null;
  }

  const option = toStringValue(record.option ?? record.text ?? record.label ?? record.value).trim();

  return option
    ? {
        option,
        correct: record.correct === true,
      }
    : null;
}

function normalizeCompleteOption(value: unknown, index: number): AdminGrammarCompleteOption | null {
  const record = asRecord(value);
  if (!record) {
    const text = toStringValue(value).trim();
    return text
      ? { value: String(index + 1), text, correct: false }
      : null;
  }

  const text = toStringValue(record.text ?? record.option ?? record.label ?? record.value).trim();
  if (!text) return null;

  return {
    value: toStringValue(record.value, String(index + 1)),
    text,
    correct: record.correct === true,
  };
}

function normalizeExamItem(value: unknown): AdminGrammarExamItem | null {
  const record = asRecord(value);
  if (!record) return null;

  const type = toStringValue(record.type).trim().toLowerCase();
  const question = toStringValue(record.question).trim();

  if (!question) return null;

  if (type === "complete") {
    const options = asArray(record.options)
      .map((option, index) => normalizeCompleteOption(option, index))
      .filter((option): option is AdminGrammarCompleteOption => option !== null);

    const item: AdminGrammarCompleteExam = {
      type: "complete",
      question,
      options: options.length > 0 ? options : [{ value: "1", text: "", correct: false }],
    };

    return item;
  }

  if (type === "order") {
    const order = asArray(record.order ?? record.options ?? record.answer)
      .map((entry) => toStringValue(entry).trim())
      .filter(Boolean);

    const item: AdminGrammarOrderExam = {
      type: "order",
      question,
      order: order.length > 0 ? order : [""],
      answer: toNullableString(record.answer) ?? undefined,
    };

    return item;
  }

  const options = asArray(record.options)
    .map(normalizeQuestionOption)
    .filter((option): option is AdminGrammarQuestionOption => option !== null);
  const item: AdminGrammarQuestionExam = {
    type: "question",
    question,
    options: options.length > 0 ? options : [{ option: "", correct: false }],
  };

  return item;
}

function normalizeExam(value: unknown): AdminGrammarExamItem[] {
  const items = asArray(value)
    .map(normalizeExamItem)
    .filter((item): item is AdminGrammarExamItem => item !== null);

  return items.length > 0
    ? items
    : [
        {
          type: "question",
          question: "",
          options: [{ option: "", correct: false }],
        },
      ];
}

export function normalizeAdminGrammarLessonSummary(value: unknown): AdminGrammarLessonSummary | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = toStringValue(record.id).trim();
  const title = toStringValue(record.title).trim();
  if (!id || !title) return null;

  const content = asRecord(record.content);
  const meaning = asRecord(content?.meaning);
  const howToUse = asRecord(content?.howToUse);
  const examples = asRecord(content?.examples);

  return {
    id,
    title,
    description: toNullableString(record.description),
    pointsToUnlock: toNumberOrNull(record.pointsToUnlock),
    meaningType: meaning ? normalizeComponentType(meaning.type) : null,
    howToUseType: howToUse ? normalizeComponentType(howToUse.type) : null,
    examplesType: examples ? normalizeComponentType(examples.type) : null,
    examCount: asArray(content?.exam).length,
  };
}

export function normalizeAdminGrammarLesson(value: unknown): AdminGrammarLesson {
  const record = asRecord(value) ?? {};
  const content = asRecord(record.content);

  return {
    id: toStringValue(record.id),
    title: toStringValue(record.title),
    description: toNullableString(record.description),
    pointsToUnlock: toNumberOrNull(record.pointsToUnlock),
    content: {
      meaning: normalizeAdminGrammarComponent(content?.meaning, "table"),
      howToUse: normalizeAdminGrammarComponent(content?.howToUse, "table"),
      examples: normalizeAdminGrammarComponent(content?.examples, "text_stepper"),
      exam: normalizeExam(content?.exam),
    },
  };
}

export function toAdminGrammarLessonSummary(
  lesson: AdminGrammarLesson,
): AdminGrammarLessonSummary {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    pointsToUnlock: lesson.pointsToUnlock,
    meaningType: lesson.content.meaning.type,
    howToUseType: lesson.content.howToUse.type,
    examplesType: lesson.content.examples.type,
    examCount: lesson.content.exam.length,
  };
}

export function serializeAdminGrammarLesson(lesson: AdminGrammarLesson) {
  return {
    id: lesson.id,
    title: lesson.title.trim(),
    description: lesson.description?.trim() ? lesson.description.trim() : null,
    pointsToUnlock: lesson.pointsToUnlock,
    content: {
      meaning: lesson.content.meaning,
      howToUse: lesson.content.howToUse,
      examples: lesson.content.examples,
      exam: lesson.content.exam,
    },
  };
}

export function buildAdminGrammarStats(
  lessons: AdminGrammarLessonSummary[],
): AdminGrammarLessonStats {
  return {
    totalLessons: lessons.length,
    tableSections: lessons.reduce((total, lesson) => {
      return total + [lesson.meaningType, lesson.howToUseType, lesson.examplesType].filter((type) => type === "table").length;
    }, 0),
    examItems: lessons.reduce((total, lesson) => total + lesson.examCount, 0),
    withDescription: lessons.filter((lesson) => Boolean(lesson.description)).length,
  };
}

export function normalizeGrammarSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}