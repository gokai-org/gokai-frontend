// LIBRARY UI
export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category:
    | "leccion"
    | "kanji"
    | "gramatica"
    | "vocabulario"
    | "cultura"
    | "ejercicio";
  progress?: number;
  isFavorite?: boolean;
  duration?: string;
  itemCount?: number;
  lastAccessed?: string | Date;
}

export interface LibraryCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface LibrarySection {
  id: string;
  title: string;
  items: LibraryItem[];
}

// THEMES / SUBTHEMES
export type Theme = {
  id: string;
  kanji: string;
  kana: string;
  meaning: string;
  released: boolean;
  isUnlocked?: boolean | null;
  selectedAt?: string | null;
  order?: number | null;
  graphId?: string | null;
};

export type Subtheme = {
  id: string;
  themeId?: string;
  kanji: string;
  kana: string;
  meaning: string;
  isRecommended?: boolean;
  recommendationRank?: number;
  recommendationSimilarity?: number;
  nodeId?: string | null;
  isSelectedInGraph?: boolean;
};

export type Word = {
  id: string;
  subthemeId?: string | null;
  kanji?: string | null;
  hiragana?: string | null;
  icon?: string | null;
  meanings?: string[] | null;
  order?: number | null;
  unlockedAt?: string | null;
  completedAt?: string | null;
  score?: number | null;
  progress?: number | null;
  completedQuizTypes?: Array<"speaking" | "listening" | "meaning" | "writing"> | null;
  meaningCompleted?: boolean | null;
  listeningCompleted?: boolean | null;
  speakingCompleted?: boolean | null;
  writingCompleted?: boolean | null;
  meaningScore?: number | null;
  listeningScore?: number | null;
  speakingScore?: number | null;
  writingScore?: number | null;
  updatedAt?: string | null;
};

// FAVORITES
export type FavoriteType =
  | "kanji"
  | "grammar"
  | "word";

export interface BackendFavoriteItem {
  type: FavoriteType;
  id: string;
  createdAt: string;
  symbol?: string | null;
  readings?: string | null;
  kanjiWord?: string | null;
  meanings?: string | string[] | Record<string, string[]> | null;
  hiragana?: string | null;
  icon?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface FavoritesResponse {
  kanji: BackendFavoriteItem[];
  grammar: BackendFavoriteItem[];
  word: BackendFavoriteItem[];
}

// RECENT ITEMS
export type RecentEntityType =
  | "kanji"
  | "grammar"
  | "word"
  | "hiragana"
  | "katakana";

export interface BackendRecentItem {
  type: string;
  id: string;
  createdAt: string;
  symbol?: string | null;
  readings?: string[] | Record<string, string[]> | null;
  kanjiWord?: string | null;
  meanings?: string[] | Record<string, string[]> | null;
  hiragana?: string | null;
  icon?: string | null;
  romaji?: string | null;
  kanaType?: "hiragana" | "katakana" | null;
  title?: string | null;
  description?: string | null;
}

export interface RecentItemsResponse {
  kanji: BackendRecentItem[];
  hiragana: BackendRecentItem[];
  katakana: BackendRecentItem[];
  grammar: BackendRecentItem[];
  word: BackendRecentItem[];
}
