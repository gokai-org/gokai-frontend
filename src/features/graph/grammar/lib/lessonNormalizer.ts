import type {
  CompleteExam,
  CompleteOption,
  ExamItem,
  ExampleStep,
  GrammarLesson,
  GrammarLessonSummary,
  ImageStep,
  MeaningComponent,
  LessonContent,
  OrderExam,
  QuestionExam,
  QuestionOption,
  TableCell,
  TableComponent,
  TableRow,
  TextStepperComponent,
  ImageStepperComponent,
} from "../types";

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
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function toNullableString(value: unknown) {
  const normalized = toStringValue(value);
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

function toBooleanOrNull(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  return null;
}

function normalizeImageStep(value: unknown): ImageStep | null {
  if (typeof value === "string") {
    const description = toStringValue(value);
    return description ? { img: "", description } : null;
  }

  const record = asRecord(value);
  if (!record) return null;

  const img =
    toStringValue(record.img) ||
    toStringValue(record.image) ||
    toStringValue(record.imageUrl) ||
    toStringValue(record.url) ||
    toStringValue(record.svg);
  const description =
    toStringValue(record.description) ||
    toStringValue(record.text) ||
    toStringValue(record.content) ||
    toStringValue(record.explanation) ||
    toStringValue(record.meaning);

  if (!img && !description) return null;

  return {
    img,
    description,
  };
}

function normalizeImageStepperSection(value: unknown): ImageStepperComponent | null {
  const record = asRecord(value);
  const source = record
    ? record.content ?? record.steps ?? record.items ?? record.data
    : value;
  const content = asArray(source)
    .map(normalizeImageStep)
    .filter((step): step is ImageStep => step !== null);

  return content.length > 0
    ? {
        type: "image_stepper",
        content,
      }
    : null;
}

function looksLikeTableContent(value: unknown) {
  const record = asRecord(value);
  if (!record) return false;

  return Array.isArray(record.headers) || Array.isArray(record.rows) || Array.isArray(record.body);
}

function normalizeMeaningSection(value: unknown): MeaningComponent | null {
  const record = asRecord(value);
  if (!record) return null;

  const type = toStringValue(record.type).toLowerCase();

  if (type === "table" || looksLikeTableContent(record.content)) {
    return normalizeTableSection(record);
  }

  return normalizeImageStepperSection(record) ?? normalizeTableSection(record);
}

function normalizeTableCell(value: unknown): TableCell | null {
  if (typeof value === "string" || typeof value === "number") {
    return {
      value: toStringValue(value),
      rowspan: 1,
      colspan: 1,
    };
  }

  const record = asRecord(value);
  if (!record) return null;

  const cellValue =
    toStringValue(record.value) ||
    toStringValue(record.text) ||
    toStringValue(record.label) ||
    toStringValue(record.content);

  return {
    value: cellValue,
    rowspan: toNumberOrNull(record.rowspan) ?? 1,
    colspan: toNumberOrNull(record.colspan) ?? 1,
  };
}

function buildRowsFromObjects(rows: UnknownRecord[], headers: string[]): TableRow[] {
  const effectiveHeaders = headers.length > 0 ? headers : Object.keys(rows[0] ?? {});

  return rows
    .map((row) => ({
      cells: effectiveHeaders
        .map((header) => normalizeTableCell(row[header]))
        .filter((cell): cell is TableCell => cell !== null),
    }))
    .filter((row) => row.cells.length > 0);
}

function normalizeTableSection(value: unknown): TableComponent | null {
  const record = asRecord(value);
  if (!record) return null;

  const rawContent = asRecord(record.content) ?? record;
  let headers = asArray(rawContent.headers).map((header) => toStringValue(header)).filter(Boolean);
  const rawRows = asArray(rawContent.rows ?? rawContent.body ?? rawContent.items ?? rawContent.data);

  let rows: TableRow[] = rawRows
    .map((row) => {
      if (Array.isArray(row)) {
        return {
          cells: row
            .map(normalizeTableCell)
            .filter((cell): cell is TableCell => cell !== null),
        };
      }

      const rowRecord = asRecord(row);
      if (!rowRecord) return null;

      if (Array.isArray(rowRecord.cells)) {
        return {
          cells: rowRecord.cells
            .map(normalizeTableCell)
            .filter((cell): cell is TableCell => cell !== null),
        };
      }

      return null;
    })
    .filter((row): row is TableRow => row !== null && row.cells.length > 0);

  if (rows.length === 0) {
    const objectRows = rawRows
      .map(asRecord)
      .filter((row): row is UnknownRecord => row !== null);

    if (objectRows.length > 0) {
      if (headers.length === 0) {
        headers = Object.keys(objectRows[0]);
      }
      rows = buildRowsFromObjects(objectRows, headers);
    }
  }

  if (headers.length === 0 && rows.length > 0) {
    const longestRow = Math.max(...rows.map((row) => row.cells.length));
    headers = Array.from({ length: longestRow }, (_, index) => `Columna ${index + 1}`);
  }

  return headers.length > 0 && rows.length > 0
    ? {
        type: "table",
        content: {
          headers,
          rows,
        },
      }
    : null;
}

function normalizeExampleStep(value: unknown): ExampleStep | null {
  if (typeof value === "string") {
    const text = toStringValue(value);
    return text
      ? {
          kanji: text,
          kana: "",
          meaning: "",
        }
      : null;
  }

  const record = asRecord(value);
  if (!record) return null;

  const kanji =
    toStringValue(record.kanji) ||
    toStringValue(record.japanese) ||
    toStringValue(record.text) ||
    toStringValue(record.sentence) ||
    toStringValue(record.example);
  const kana =
    toStringValue(record.kana) ||
    toStringValue(record.reading) ||
    toStringValue(record.furigana) ||
    toStringValue(record.pronunciation);
  const meaning =
    toStringValue(record.meaning) ||
    toStringValue(record.translation) ||
    toStringValue(record.spanish) ||
    toStringValue(record.description);

  if (!kanji && !kana && !meaning) return null;

  return { kanji, kana, meaning };
}

function normalizeExamplesSection(value: unknown): TextStepperComponent | null {
  const record = asRecord(value);
  const source = record
    ? record.content ?? record.steps ?? record.items ?? record.data
    : value;
  const content = asArray(source)
    .map(normalizeExampleStep)
    .filter((step): step is ExampleStep => step !== null);

  return content.length > 0
    ? {
        type: "text_stepper",
        content,
      }
    : null;
}

function normalizeQuestionOption(value: unknown): QuestionOption | null {
  if (typeof value === "string") {
    return { option: value, correct: false };
  }

  const record = asRecord(value);
  if (!record) return null;

  const option =
    toStringValue(record.option) ||
    toStringValue(record.text) ||
    toStringValue(record.label) ||
    toStringValue(record.value);

  if (!option) return null;

  return {
    option,
    correct: record.correct === true,
  };
}

function normalizeCompleteOption(value: unknown, index: number): CompleteOption | null {
  if (typeof value === "string") {
    return {
      value: String(index + 1),
      text: value,
      correct: false,
    };
  }

  const record = asRecord(value);
  if (!record) return null;

  const text =
    toStringValue(record.text) ||
    toStringValue(record.option) ||
    toStringValue(record.label) ||
    toStringValue(record.value);

  if (!text) return null;

  return {
    value: toStringValue(record.value, String(index + 1)),
    text,
    correct: record.correct === true,
  };
}

function normalizeOrderItem(value: unknown) {
  return toStringValue(value);
}

function normalizeExamItem(value: unknown): ExamItem | null {
  const record = asRecord(value);
  if (!record) return null;

  const type = toStringValue(record.type).toLowerCase();
  const question = toStringValue(record.question);

  if (!question) return null;

  if (type === "complete") {
    const options = asArray(record.options)
      .map((option, index) => normalizeCompleteOption(option, index))
      .filter((option): option is CompleteOption => option !== null);

    const normalized: CompleteExam = {
      type: "complete",
      question,
      options,
    };

    return normalized;
  }

  if (type === "order") {
    const order = asArray(record.order ?? record.options ?? record.answer)
      .map(normalizeOrderItem)
      .filter(Boolean);
    const normalized: OrderExam = {
      type: "order",
      question,
      order,
      answer: toStringValue(record.answer),
    };

    return normalized;
  }

  const options = asArray(record.options)
    .map(normalizeQuestionOption)
    .filter((option): option is QuestionOption => option !== null);
  const normalized: QuestionExam = {
    type: "question",
    question,
    options,
  };

  return normalized;
}

function normalizeExam(value: unknown): ExamItem[] {
  return asArray(value)
    .map(normalizeExamItem)
    .filter((item): item is ExamItem => item !== null);
}

function normalizeLessonContent(value: unknown): LessonContent | null {
  const record = asRecord(value);
  if (!record) return null;

  const normalized: LessonContent = {
    meaning: normalizeMeaningSection(record.meaning),
    howToUse: normalizeTableSection(record.howToUse),
    examples: normalizeExamplesSection(record.examples),
    exam: normalizeExam(record.exam),
  };

  const hasVisibleContent =
    normalized.meaning !== null ||
    normalized.howToUse !== null ||
    normalized.examples !== null ||
    normalized.exam.length > 0;

  return hasVisibleContent ? normalized : null;
}

export function normalizeGrammarLessonSummary(value: unknown): GrammarLessonSummary | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = toStringValue(record.id);
  const title = toStringValue(record.title);

  if (!id || !title) return null;

  return {
    id,
    title,
    pointsToUnlock: toNumberOrNull(record.pointsToUnlock),
    status:
      toStringValue(record.status) ||
      toStringValue(record.lessonStatus) ||
      null,
    completed:
      toBooleanOrNull(record.completed) ??
      toBooleanOrNull(record.isCompleted),
    available:
      toBooleanOrNull(record.available) ??
      toBooleanOrNull(record.isAvailable),
    unlocked:
      toBooleanOrNull(record.unlocked) ??
      toBooleanOrNull(record.isUnlocked),
    current:
      toBooleanOrNull(record.current) ??
      toBooleanOrNull(record.isCurrent),
    symbol: toStringValue(record.symbol) || null,
  };
}

export function normalizeGrammarLesson(value: unknown): GrammarLesson {
  const record = asRecord(value);

  return {
    id: toStringValue(record?.id),
    title: toStringValue(record?.title, "Lección de gramática"),
    description: toNullableString(record?.description),
    pointsToUnlock: toNumberOrNull(record?.pointsToUnlock),
    content: normalizeLessonContent(record?.content),
  };
}