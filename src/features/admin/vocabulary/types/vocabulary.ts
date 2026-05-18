export type AdminVocabularyRegionId =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "chubu"
  | "kansai"
  | "chugoku"
  | "shikoku"
  | "kyushu";

export type AdminVocabularyLevel = "themes" | "subthemes" | "words";

export type AdminVocabularyTheme = {
  id: string;
  kanji: string;
  kana: string;
  meaning: string;
  region?: AdminVocabularyRegionId | string | null;
  released: boolean;
};

export type AdminVocabularySubtheme = {
  id: string;
  themeId: string;
  kanji: string;
  kana: string;
  meaning: string;
};

export type AdminVocabularyWord = {
  id: string;
  subthemeId: string;
  themeId?: string | null;
  kanji?: string | null;
  hiragana?: string | null;
  icon?: string | null;
  learnOrder?: number | null;
  meanings?: string[] | null;
};

export type AdminVocabularyItem =
  | AdminVocabularyTheme
  | AdminVocabularySubtheme
  | AdminVocabularyWord;

export type AdminVocabularyFormPayload = {
  id?: string;
  meaning?: string;
  kanji?: string;
  kana?: string;
  region?: AdminVocabularyRegionId;
  released?: boolean;
  themeId?: string;
  subthemeId?: string;
  hiragana?: string;
  icon?: string;
  learnOrder?: number;
  meanings?: string[];
};