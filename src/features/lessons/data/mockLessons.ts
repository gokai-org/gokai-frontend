import type { LessonResolved } from "../types";

// OJO: keys = nodeId del grafo (writing-1, listening-1, reading-1, speaking-1, etc.)
export const mockLessonsByNodeId: Record<string, LessonResolved[]> = {
  "writing-1": [
    {
      kind: "kanji",
      lesson: {
        id: "lesson-kanji-1",
        description: "Aprende el orden de trazos del kanji 月 (luna).",
        lessonType: "kanji",
        entityId: "kanji-tsuki",
      },
      kanji: {
        id: "kanji-tsuki",
        symbol: "月",
        readings: { on: ["ゲツ", "ガツ"], kun: ["つき"] },
        meanings: { es: ["luna", "mes"] },
        pointsToUnlock: 0,
      }
    },
  ],

  "writing-2": [
    {
      kind: "kanji",
      lesson: {
        id: "lesson-kanji-2",
        description: "Practica trazos del kanji 森 (bosque).",
        lessonType: "kanji",
        entityId: "kanji-mori",
      },
      kanji: {
        id: "kanji-tsuki",
        symbol: "月",
        readings: { on: ["ゲツ", "ガツ"], kun: ["つき"] },
        meanings: { es: ["luna", "mes"] },
        pointsToUnlock: 0,
      },
    },
  ],

  "listening-1": [
    {
      kind: "subtheme",
      lesson: {
        id: "lesson-subtheme-ingredients-audio",
        description: "Escucha y reconoce vocabulario de ingredientes.",
        lessonType: "subtheme",
        entityId: "subtheme-ingredientes",
      },
      subtheme: {
        id: "subtheme-ingredientes",
        meaning: "Ingredientes",
        themeId: "theme-cocinar",
        kanji: "材料",
        kana: "ざいりょう",
        theme: {
          id: "theme-cocinar",
          meaning: "Cocinar",
          kanji: "料理",
          kana: "りょうり",
          released: false,
        },
      },
    },
  ],

  "reading-1": [
    {
      kind: "grammar",
      lesson: {
        id: "lesson-grammar-1",
        description: "Estructura básica: です / ます (tono formal).",
        lessonType: "grammar",
        entityId: "grammar-desu-masu",
      },
      grammar: {
        id: "grammar-desu-masu",
        title: "です / ます (Forma formal)",
        description:
          "Se usa para hablar con cortesía. Útil al presentarte o pedir cosas en restaurantes.",
        pointsToUnlock: 0,
        useCases: "Presentarte, pedir comida, conversaciones con desconocidos.",
        examples: "これは水です。/ パンを食べます。",
      },
    },
  ],

  "speaking-1": [
    {
      kind: "grammar",
      lesson: {
        id: "lesson-grammar-2",
        description: "Práctica de frases cortas: 〜が好きです (me gusta).",
        lessonType: "grammar",
        entityId: "grammar-suki",
      },
      grammar: {
        id: "grammar-suki",
        title: "〜が好きです (Me gusta)",
        description: "Para expresar gustos de forma simple y clara.",
        pointsToUnlock: 0,
        useCases: "Decir qué comida te gusta o qué deportes te gustan.",
        examples: "ラーメンが好きです。/ サッカーが好きです。",
      },
    },
  ],
};
