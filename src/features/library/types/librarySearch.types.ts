export type LibrarySearchSectionType =
  | "kanji"
  | "hiragana"
  | "katakana"
  | "grammar"
  | "vocabulary";

export type LibrarySearchEntityType =
  | "kanji"
  | "hiragana"
  | "katakana"
  | "grammar"
  | "theme"
  | "subtheme"
  | "word";

export type LibrarySearchKanjiSource = {
  id: string;
  symbol: string;
  readings: string[];
  meanings: string[];
  pointsToUnlock: number;
};

export type LibrarySearchKanaSource = {
  id: string;
  symbol: string;
  kanaType: "hiragana" | "katakana";
  romaji: string;
  pointsToUnlock: number;
};

export type LibrarySearchGrammarSource = {
  id: string;
  title: string;
  description?: string;
  pointsToUnlock?: number | null;
  examples?: string[];
  contentText?: string[];
};

export type LibrarySearchVocabularyThemeSource = {
  id: string;
  kanji: string;
  kana: string;
  meaning: string;
  released: boolean;
};

export type LibrarySearchVocabularySubthemeSource = {
  id: string;
  themeId: string;
  kanji: string;
  kana: string;
  meaning: string;
};

export type LibrarySearchVocabularyWordSource = {
  id: string;
  subthemeId: string;
  themeId: string;
  kanji?: string;
  hiragana?: string;
  icon?: string;
  meanings?: string[];
};

export type LibrarySearchIndexPayload = {
  kanjis: LibrarySearchKanjiSource[];
  hiraganas: LibrarySearchKanaSource[];
  katakanas: LibrarySearchKanaSource[];
  grammarLessons: LibrarySearchGrammarSource[];
  vocabularyThemes: LibrarySearchVocabularyThemeSource[];
  vocabularySubthemes: LibrarySearchVocabularySubthemeSource[];
  vocabularyWords: LibrarySearchVocabularyWordSource[];
};

export type SearchIndexItem = {
  id: string;
  section: LibrarySearchSectionType;
  entityType: LibrarySearchEntityType;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  symbol: string | null;
  kanji: string | null;
  kana: string | null;
  hiragana: string | null;
  romaji: string | null;
  readings: string[];
  meanings: string[];
  examples: string[];
  pointsToUnlock: number | null;
  released: boolean | null;
  themeId: string | null;
  subthemeId: string | null;
  normalizedTitle: string;
  normalizedSearchText: string;
};

export type GroupedLibrarySearchResults = Record<
  LibrarySearchSectionType,
  SearchIndexItem[]
>;

export const LIBRARY_SEARCH_SECTION_ORDER: LibrarySearchSectionType[] = [
  "kanji",
  "hiragana",
  "katakana",
  "grammar",
  "vocabulary",
];

export const EMPTY_GROUPED_LIBRARY_SEARCH_RESULTS: GroupedLibrarySearchResults = {
  kanji: [],
  hiragana: [],
  katakana: [],
  grammar: [],
  vocabulary: [],
};
