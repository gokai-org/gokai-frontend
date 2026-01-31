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
