import type {
  BackendFavoriteItem,
  BackendRecentItem,
  LibraryCategory,
} from "@/features/library/types";
import type { RecentItemProps } from "@/features/library/components/RecentCard";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import {
  getPrimaryMeaning,
  getPrimaryReading,
} from "@/features/kanji/utils/kanjiText";

export function kanjiToCard(kanji: Kanji) {
  const meaning = getPrimaryMeaning(kanji.meanings) || kanji.symbol;
  const reading = getPrimaryReading(kanji.readings);

  const meaningsCount = Array.isArray(kanji.meanings)
    ? kanji.meanings.length
    : (kanji.meanings?.es?.length ?? 0) +
      (kanji.meanings?.en?.length ?? 0) +
      (kanji.meanings?.other?.length ?? 0);

  const readingsCount = Array.isArray(kanji.readings)
    ? kanji.readings.length
    : (kanji.readings?.on?.length ?? 0) +
      (kanji.readings?.kun?.length ?? 0) +
      (kanji.readings?.other?.length ?? 0);

  return {
    id: kanji.id,
    title: meaning,
    subtitle: reading ? `Lectura: ${reading}` : "Sin lectura",
    thumbnail: kanji.symbol,
    meta: `${readingsCount || 0} lecturas • ${meaningsCount || 0} significados`,
  };
}

export function katakanaToCard(katakana: Kana) {
  return {
    id: katakana.id,
    title: katakana.symbol,
    subtitle: "Katakana",
    thumbnail: katakana.symbol,
  };
}

export function hiraganaToCard(hiragana: Kana) {
  return {
    id: hiragana.id,
    title: hiragana.symbol,
    subtitle: "Hiragana",
    thumbnail: hiragana.symbol,
  };
}

export function recentToCardProps(
  item: BackendRecentItem,
  kanjis: Kanji[],
): RecentItemProps {
  switch (item.type) {
    case "kanji": {
      const kanji = kanjis.find((k) => k.id === item.id);
      return {
        id: item.id,
        title: kanji
          ? getPrimaryMeaning(kanji.meanings) || kanji.symbol
          : item.symbol || "漢",
        description: kanji
          ? getPrimaryReading(kanji.readings)
            ? `音: ${getPrimaryReading(kanji.readings)}`
            : undefined
          : undefined,
        thumbnail: item.symbol || kanji?.symbol || "漢",
        category: "kanji",
        lastAccessed: item.createdAt,
      };
    }

    case "grammar_lesson":
    case "grammar":
      return {
        id: item.id,
        title: item.title || "Gramática",
        description: item.description || undefined,
        thumbnail: "文",
        category: "grammar",
        lastAccessed: item.createdAt,
      };

    case "word": {
      const meanings = Array.isArray(item.meanings)
        ? (item.meanings as string[]).join(", ")
        : undefined;

      return {
        id: item.id,
        title: item.kanjiWord || item.hiragana || "Palabra",
        description: meanings,
        thumbnail: item.kanjiWord || item.hiragana || "言",
        category: "word",
        lastAccessed: item.createdAt,
      };
    }

    default:
      return {
        id: item.id,
        title: "Elemento",
        thumbnail: "?",
        lastAccessed: item.createdAt,
      };
  }
}

export function grammarFavToCard(fav: BackendFavoriteItem) {
  return {
    id: fav.id,
    title: fav.title || "Gramática",
    subtitle: fav.description || undefined,
    thumbnail: "文",
  };
}

export function wordFavToCard(fav: BackendFavoriteItem) {
  let parsedMeanings: string | undefined;

  if (fav.meanings) {
    try {
      const arr = JSON.parse(fav.meanings);
      if (Array.isArray(arr)) parsedMeanings = arr.join(", ");
    } catch {}
  }

  return {
    id: fav.id,
    title: fav.kanjiWord || fav.hiragana || "Palabra",
    subtitle: parsedMeanings || fav.hiragana || undefined,
    thumbnail: fav.kanjiWord || fav.hiragana || "言",
  };
}

export function buildLibraryCategories(params: {
  totalFavorites: number;
  recentCount: number;
  kanjiCount: number;
  katakanaCount: number;
  hiraganaCount: number;
}): LibraryCategory[] {
  return [
    {
      id: "favoritos",
      name: "Favoritos",
      icon: "",
      count: params.totalFavorites,
      color: "bg-red-500",
    },
    {
      id: "recent",
      name: "Reciente",
      icon: "",
      count: params.recentCount,
      color: "bg-gray-500",
    },
    {
      id: "kanji",
      name: "Kanjis",
      icon: "",
      count: params.kanjiCount,
      color: "bg-purple-500",
    },
    {
      id: "katakana",
      name: "Katakana",
      icon: "",
      count: params.katakanaCount,
      color: "bg-blue-500",
    },
    {
      id: "hiragana",
      name: "Hiragana",
      icon: "",
      count: params.hiraganaCount,
      color: "bg-green-500",
    },
  ];
}