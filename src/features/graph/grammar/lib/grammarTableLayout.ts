import type { TableComponent } from "../types";

export type GrammarTableSection = "meaning" | "howToUse";

export type GrammarTableLayoutVariant =
  | "pattern-deck"
  | "contrast-cards"
  | "concept-panels"
  | "matrix-table";

export type ResolvedGrammarTableLayout = {
  variant: GrammarTableLayoutVariant;
  headers: string[];
  rows: string[][];
  primaryColumn: number;
  formulaColumns: number[];
};

type PendingSpan = {
  col: number;
  value: string;
  rowsLeft: number;
};

const PRIMARY_COLUMN_HINTS = [
  "concepto",
  "forma",
  "palabra",
  "particula",
  "uso",
  "grupo",
  "verbo",
  "categoria",
  "estado",
];

const PATTERN_HEADER_HINTS = [
  "estructura",
  "estado",
  "estilo",
  "forma",
  "grupo",
  "diccionario",
  "afirmativo",
  "negativo",
  "pregunta",
  "particula",
  "formas",
];

const CONCEPT_HEADER_HINTS = [
  "explicacion",
  "definicion",
  "matiz",
  "funcion",
  "uso principal",
  "regla",
  "lectura",
  "para que sirve",
  "como se siente",
  "significado",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function clampSpan(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function includesAny(source: string[], hints: string[]) {
  return source.some((value) => hints.some((hint) => value.includes(hint)));
}

export function looksLikeGrammarFormula(value: string) {
  const compact = normalizeText(value);

  return /\bs\d\b/.test(compact)
    || /[ぁ-んァ-ヶ一-龯]/.test(value)
    || /(です|ます|ません|ました|じゃありません|じゃない|ではありません|こちら|どちら|これ|それ|あれ|この|その|あの)/.test(value)
    || /(^|\s)(は|が|を|に|で|と|も|の|へ|から|まで|より|か)(\s|$)/.test(compact);
}

export function resolveTableRows(table: TableComponent) {
  const { headers, rows } = table.content;
  const pending: PendingSpan[] = [];

  return rows.map((row) => {
    const resolved = Array.from({ length: headers.length }, () => "");

    for (const span of pending) {
      resolved[span.col] = span.value;
    }

    let sourceIndex = 0;
    for (let col = 0; col < headers.length; col += 1) {
      if (resolved[col]) {
        continue;
      }

      const cell = row.cells[sourceIndex];
      sourceIndex += 1;

      if (!cell) {
        continue;
      }

      const rowSpan = clampSpan(cell.rowspan);
      const colSpan = clampSpan(cell.colspan);

      resolved[col] = cell.value;

      if (rowSpan > 1) {
        for (let offset = 0; offset < colSpan && col + offset < headers.length; offset += 1) {
          pending.push({
            col: col + offset,
            value: offset === 0 ? cell.value : "",
            rowsLeft: rowSpan - 1,
          });
        }
      }

      for (let offset = 1; offset < colSpan && col + offset < headers.length; offset += 1) {
        resolved[col + offset] = "";
      }

      col += colSpan - 1;
    }

    for (let index = pending.length - 1; index >= 0; index -= 1) {
      pending[index].rowsLeft -= 1;
      if (pending[index].rowsLeft <= 0) {
        pending.splice(index, 1);
      }
    }

    return resolved;
  });
}

function resolvePrimaryColumn(headers: string[]) {
  const normalizedHeaders = headers.map(normalizeText);
  const hintedIndex = normalizedHeaders.findIndex((header) =>
    PRIMARY_COLUMN_HINTS.some((hint) => header.includes(hint)),
  );

  return hintedIndex >= 0 ? hintedIndex : 0;
}

export function resolveGrammarTableLayout(
  table: TableComponent,
  section: GrammarTableSection,
): ResolvedGrammarTableLayout {
  const headers = table.content.headers;
  const rows = resolveTableRows(table);
  const normalizedHeaders = headers.map(normalizeText);
  const cells = rows.flat().filter((value) => value.trim().length > 0);
  const longTextCells = cells.filter((value) => value.length >= 85).length;
  const formulaColumns = headers
    .map((_, index) => index)
    .filter((index) => rows.some((row) => looksLikeGrammarFormula(row[index] ?? "")));
  const avgCellLength = cells.length > 0
    ? cells.reduce((total, value) => total + value.length, 0) / cells.length
    : 0;
  const hasPatternHeaders = includesAny(normalizedHeaders, PATTERN_HEADER_HINTS);
  const hasConceptHeaders = includesAny(normalizedHeaders, CONCEPT_HEADER_HINTS);
  const hasWideShape = headers.length >= 5 || (headers.length >= 4 && avgCellLength <= 24);
  const hasLongNarrative = longTextCells >= 2 || avgCellLength >= 56;

  let variant: GrammarTableLayoutVariant = "contrast-cards";

  if (hasWideShape) {
    variant = "matrix-table";
  } else if (section === "meaning" && (hasConceptHeaders || hasLongNarrative)) {
    variant = "concept-panels";
  } else if (section === "howToUse" && (hasPatternHeaders || formulaColumns.length >= 2)) {
    variant = "pattern-deck";
  } else if (hasLongNarrative && hasConceptHeaders) {
    variant = "concept-panels";
  }

  return {
    variant,
    headers,
    rows,
    primaryColumn: resolvePrimaryColumn(headers),
    formulaColumns,
  };
}