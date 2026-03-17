import type { ReviewItem } from "../types";

export const MOCK_GRAMMAR: ReviewItem = {
  id: "grammar-1",
  type: "grammar",
  lastPracticed: "6h",
  title: "です / ます (Forma formal)",
  description:
    "Terminaciones formales usadas en japonés cortés para oraciones afirmativas.",
  examples: "これは水です。/ パンを食べます。",
};

export const MOCK_LISTENING: ReviewItem = {
  id: "listening-1",
  type: "listening",
  lastPracticed: "12h",
  title: "Ingredientes (材料)",
  description:
    "Escucha y reconoce vocabulario relacionado con ingredientes de cocina.",
  kana: "ざいりょう",
};

export const MOCK_SPEAKING: ReviewItem = {
  id: "speaking-1",
  type: "speaking",
  lastPracticed: "24h",
  title: "〜が好きです (Me gusta)",
  description:
    "Practica la pronunciación de la estructura para expresar gustos.",
  phrase: "ラーメンが好きです。",
};
