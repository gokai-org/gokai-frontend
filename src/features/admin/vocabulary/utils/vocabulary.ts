import type {
  AdminVocabularyLevel,
  AdminVocabularyRegionId,
} from "../types/vocabulary";

export const vocabularyRegionOptions: Array<{
  value: AdminVocabularyRegionId;
  label: string;
}> = [
  { value: "hokkaido", label: "Hokkaido" },
  { value: "tohoku", label: "Tohoku" },
  { value: "kanto", label: "Kanto" },
  { value: "chubu", label: "Chubu" },
  { value: "kansai", label: "Kansai" },
  { value: "chugoku", label: "Chugoku" },
  { value: "shikoku", label: "Shikoku" },
  { value: "kyushu", label: "Kyushu/Okinawa" },
];

export function getVocabularyRegionLabel(value?: string | null) {
  return (
    vocabularyRegionOptions.find((option) => option.value === value)?.label ??
    "Sin region"
  );
}

export function getVocabularyLevelLabel(level: AdminVocabularyLevel) {
  if (level === "themes") return "Temas";
  if (level === "subthemes") return "Subtemas";
  return "Palabras";
}

export function normalizeVocabularySearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isVocabularyRegionId(
  value: string | null | undefined,
): value is AdminVocabularyRegionId {
  return vocabularyRegionOptions.some((option) => option.value === value);
}