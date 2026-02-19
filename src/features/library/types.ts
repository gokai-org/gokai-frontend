// LIBRARY UI
export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: 'leccion' | 'kanji' | 'gramatica' | 'vocabulario' | 'cultura' | 'ejercicio';
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  progress?: number;
  isFavorite?: boolean;
  duration?: string;
  itemCount?: number;
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

// WORDS
export type Word = {
  id: string;
  subtheme_id: string | null;
  kanji: string | null;
  hiragana: string | null;
  icon: string | null;
  meanings: string[] | null;
};

export type WordKanji = {
  word_id: string;
  kanji_id: string;
};

// FAVORITES (match backend: gokai-content)
export type FavoriteType = "kanji" | "grammar" | "word";

export interface BackendFavoriteItem {
  type: FavoriteType;
  id: string;
  createdAt: string;
  // Kanji fields
  symbol?: string | null;
  readings?: string | null; // stringified JSON from backend
  // Word fields
  kanjiWord?: string | null;
  meanings?: string | null; // stringified JSON from backend
  hiragana?: string | null;
  // Grammar lesson fields
  title?: string | null;
  description?: string | null;
}

export interface FavoritesResponse {
  kanji: BackendFavoriteItem[];
  grammar: BackendFavoriteItem[];
  word: BackendFavoriteItem[];
}

// RECENT ITEMS (match backend: gokai-content)
export type RecentEntityType = "kanji" | "grammar_lesson" | "grammar" | "word";

export interface BackendRecentItem {
  type: string;
  id: string;
  createdAt: string;
  // Kanji fields
  symbol?: string | null;
  readings?: string[] | Record<string, string[]> | null;
  // Word fields
  kanjiWord?: string | null;
  meanings?: string[] | Record<string, string[]> | null;
  hiragana?: string | null;
  // Grammar lesson fields
  title?: string | null;
  description?: string | null;
}

export interface RecentItemsResponse {
  kanji: BackendRecentItem[];
  grammar_lesson: BackendRecentItem[];
  word: BackendRecentItem[];
}
