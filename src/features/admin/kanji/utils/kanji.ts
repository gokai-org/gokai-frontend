import type { AdminKanjiRecord } from "../types/kanji";

export type ParsedKanjiSvg = {
  viewBox: string;
  strokes: string[];
};

export function normalizeAdminKanjiSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function buildAdminKanjiSearchValue(record: AdminKanjiRecord) {
  return normalizeAdminKanjiSearch(
    [
      record.id,
      record.symbol,
      record.readings.join(" "),
      record.meanings.join(" "),
      String(record.pointsToUnlock),
    ].join(" "),
  );
}

export function splitKanjiLines(value: string) {
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseKanjiStrokeSvg(svgMarkup: string): ParsedKanjiSvg {
  const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
  const parserError = document.querySelector("parsererror");
  if (parserError) {
    throw new Error("El archivo SVG no es valido.");
  }

  const svg = document.querySelector("svg");
  if (!svg) {
    throw new Error("El archivo no contiene una etiqueta svg valida.");
  }

  const viewBox = svg.getAttribute("viewBox")?.trim();
  if (!viewBox) {
    throw new Error("El SVG debe incluir un viewBox.");
  }

  const transformedNode = svg.querySelector("[transform]");
  if (transformedNode) {
    throw new Error("El SVG no puede contener transformaciones. Usa paths directos.");
  }

  const strokes = Array.from(svg.querySelectorAll("path"))
    .map((path) => path.getAttribute("d")?.trim() ?? "")
    .filter(Boolean);

  if (strokes.length === 0) {
    throw new Error("El SVG debe contener al menos un path con atributo d.");
  }

  return { viewBox, strokes };
}