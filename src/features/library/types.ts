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
};

export type Subtheme = {
  id: string;
  themeId?: string;
  kanji: string;
  kana: string;
  meaning: string;
};

export type Word = {
  id: string;
  subthemeId?: string | null;
  kanji?: string | null;
  hiragana?: string | null;
  icon?: string | null;
  meanings?: string[] | null;
};

// FAVORITES
export type FavoriteType =
  | "kanji"
  | "hiragana"
  | "katakana"
  | "grammar"
  | "word";

export interface BackendFavoriteItem {
  type: FavoriteType;
  id: string;
  createdAt: string;
  symbol?: string | null;
  readings?: string | null;
  kanjiWord?: string | null;
  meanings?: string | null;
  hiragana?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface FavoritesResponse {
  kanji: BackendFavoriteItem[];
  hiragana: BackendFavoriteItem[];
  katakana: BackendFavoriteItem[];
  grammar: BackendFavoriteItem[];
  word: BackendFavoriteItem[];
}

// RECENT ITEMS
export type RecentEntityType = "kanji" | "grammar_lesson" | "grammar" | "word";

export interface BackendRecentItem {
  type: string;
  id: string;
  createdAt: string;
  symbol?: string | null;
  readings?: string[] | Record<string, string[]> | null;
  kanjiWord?: string | null;
  meanings?: string[] | Record<string, string[]> | null;
  hiragana?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface RecentItemsResponse {
  kanji: BackendRecentItem[];
  grammar_lesson: BackendRecentItem[];
  word: BackendRecentItem[];
}
