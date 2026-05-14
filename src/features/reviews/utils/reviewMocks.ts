import type { ReviewItem } from "../types";

export const MOCK_GRAMMAR: ReviewItem = {
  id: "grammar-1",
  type: "grammar",
  lessonType: "grammar",
  entityId: "grammar-1",
  strategy: "long_time_since_last_review",
  strategyLabel: "Repaso recomendado",
  title: "です / ます (Forma formal)",
  description:
    "Terminaciones formales usadas en japonés cortés para oraciones afirmativas.",
  exerciseLabel: "Repasar gramatica",
  actionLabel: "Abrir leccion",
  detail: "これは水です。/ パンを食べます。",
  meanings: [],
  readings: [],
};

export const MOCK_LISTENING: ReviewItem = {
  id: "listening-1",
  type: "vocabulary",
  lessonType: "word",
  entityId: "listening-1",
  exerciseType: "listening",
  availableExerciseTypes: ["listening", "meaning"],
  strategy: "low_listening_score",
  strategyLabel: "Audio por reforzar",
  title: "Ingredientes (材料)",
  description:
    "Escucha y reconoce vocabulario relacionado con ingredientes de cocina.",
  exerciseLabel: "Practicar audio",
  actionLabel: "Iniciar quiz",
  kana: "ざいりょう",
  meanings: ["Ingredientes"],
  readings: ["ざいりょう"],
};

export const MOCK_SPEAKING: ReviewItem = {
  id: "speaking-1",
  type: "vocabulary",
  lessonType: "word",
  entityId: "speaking-1",
  exerciseType: "speaking",
  availableExerciseTypes: ["speaking", "meaning"],
  strategy: "low_speaking_score",
  strategyLabel: "Pronunciacion por reforzar",
  title: "〜が好きです (Me gusta)",
  description:
    "Practica la pronunciación de la estructura para expresar gustos.",
  exerciseLabel: "Practicar habla",
  actionLabel: "Iniciar quiz",
  detail: "ラーメンが好きです。",
  meanings: ["Me gusta"],
  readings: [],
};
