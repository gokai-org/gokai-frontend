import type { LibrarySearchIndexPayload } from "@/features/library/types/librarySearch.types";

export const mockLibrarySearchIndexPayload: LibrarySearchIndexPayload = {
  kanjis: [
    {
      id: "kanji-ichi",
      symbol: "一",
      readings: ["いち", "いつ"],
      meanings: ["uno", "primero"],
      pointsToUnlock: 5,
    },
  ],
  hiraganas: [
    {
      id: "hiragana-a",
      symbol: "あ",
      kanaType: "hiragana",
      romaji: "a",
      pointsToUnlock: 5,
    },
  ],
  katakanas: [
    {
      id: "katakana-a",
      symbol: "ア",
      kanaType: "katakana",
      romaji: "a",
      pointsToUnlock: 5,
    },
  ],
  grammarLessons: [
    {
      id: "grammar-desu",
      title: "Partícula desu",
      description: "Introduce afirmaciones corteses en japonés.",
      pointsToUnlock: 10,
      examples: ["わたし は がくせい です watashi wa gakusei desu soy estudiante"],
      contentText: ["copula", "cortesía", "afirmación"],
    },
  ],
  vocabularyThemes: [
    {
      id: "theme-food",
      kanji: "食べ物",
      kana: "たべもの",
      meaning: "Comida",
      released: true,
    },
  ],
  vocabularySubthemes: [
    {
      id: "subtheme-fruits",
      themeId: "theme-food",
      kanji: "果物",
      kana: "くだもの",
      meaning: "Frutas",
    },
  ],
  vocabularyWords: [
    {
      id: "word-apple",
      themeId: "theme-food",
      subthemeId: "subtheme-fruits",
      kanji: "林檎",
      hiragana: "りんご",
      icon: "https://example.com/apple.png",
      meanings: ["manzana"],
    },
  ],
};
