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

// FAVORITES
export interface FavoriteItem {
  id: string;
  type: "lesson" | "exercise" | "kanji" | "article";
  addedAt: string;
}

export interface FavoritesResponse {
  favorites: FavoriteItem[];
}

// RECENT ITEMS
export interface RecentItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  progress?: number;
  level?: string;
  category?: string;
  lastAccessed: string;
}

export interface RecentItemsResponse {
  recentItems: RecentItem[];
}
