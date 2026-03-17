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
import type { Theme, Subtheme, Word } from "@/features/library/types";

function compactJapaneseText(value?: string | null) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function buildJapanesePreview(primary?: string | null, secondary?: string | null) {
  const p = compactJapaneseText(primary);
  const s = compactJapaneseText(secondary);

  if (p && s) return `${p} • ${s}`;
  return p || s || "";
}

function pickWordThumbnail(word: Word) {
  if (word.icon && word.icon.trim()) return word.icon.trim();
  if (word.kanji && word.kanji.trim()) return "語";
  if (word.hiragana && word.hiragana.trim()) return word.hiragana.trim().slice(0, 2);
  return "語";
}

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

export function themeToCard(theme: Theme) {
  const japanesePreview = buildJapanesePreview(theme.kanji, theme.kana);
  const compactKanji = compactJapaneseText(theme.kanji);

  return {
    id: theme.id,
    title: theme.meaning,
    subtitle: japanesePreview || "Tema de vocabulario",
    thumbnail: compactKanji || theme.kana || "題",
    badge: "Tema",
    accentClassName: "text-[#993331]",
    surfaceClassName:
      "border-[#E7D8D8] bg-gradient-to-br from-white via-[#FFF8F7] to-[#F8ECEA]",
    badgeClassName:
      "bg-[#993331]/10 text-[#993331] border border-[#993331]/10",
    thumbnailClassName:
      compactKanji && compactKanji.length > 2
        ? "min-h-[64px] min-w-[64px] max-w-[86px] px-3 py-2 text-[12px] font-extrabold leading-tight bg-[#993331]/8 text-[#993331]"
        : "h-14 w-14 text-[24px] font-bold bg-[#993331]/10 text-[#993331]",
  };
}

export function subthemeToCard(subtheme: Subtheme) {
  const japanesePreview = buildJapanesePreview(subtheme.kanji, subtheme.kana);
  const compactKanji = compactJapaneseText(subtheme.kanji);

  return {
    id: subtheme.id,
    title: subtheme.meaning,
    subtitle: japanesePreview || "Subtema",
    thumbnail: compactKanji || subtheme.kana || "章",
    badge: "Subtema",
    accentClassName: "text-[#9A5B16]",
    surfaceClassName:
      "border-[#E9DFC9] bg-gradient-to-br from-white via-[#FFF9F1] to-[#F8F0E2]",
    badgeClassName:
      "bg-[#B7791F]/10 text-[#9A5B16] border border-[#B7791F]/10",
    thumbnailClassName:
      compactKanji && compactKanji.length > 2
        ? "min-h-[64px] min-w-[64px] max-w-[86px] px-3 py-2 text-[12px] font-extrabold leading-tight bg-[#B7791F]/10 text-[#9A5B16]"
        : "h-14 w-14 text-[24px] font-bold bg-[#B7791F]/10 text-[#9A5B16]",
  };
}

export function wordToCard(word: Word) {
  const mainTitle = word.kanji || word.hiragana || "Palabra";
  const meaningsText = (word.meanings ?? []).join(", ");
  const subtitle = [word.kanji && word.hiragana ? word.hiragana : null, meaningsText]
    .filter(Boolean)
    .join(" • ");

  return {
    id: word.id,
    title: mainTitle,
    subtitle: subtitle || "Vocabulario",
    thumbnail: pickWordThumbnail(word),
    badge: "Palabra",
    accentClassName: "text-[#155E75]",
    surfaceClassName:
      "border-[#D7E7EC] bg-gradient-to-br from-white via-[#F6FBFC] to-[#EAF5F8]",
    badgeClassName:
      "bg-[#0891B2]/10 text-[#155E75] border border-[#0891B2]/10",
    thumbnailClassName:
      "h-14 w-14 text-[20px] font-bold bg-[#0891B2]/10 text-[#155E75]",
  };
}

export function buildLibraryCategories(params: {
  totalFavorites: number;
  recentCount: number;
  kanjiCount: number;
  katakanaCount: number;
  hiraganaCount: number;
  themeCount: number;
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
    {
      id: "themes",
      name: "Temas",
      icon: "",
      count: params.themeCount,
      color: "bg-amber-500",
    },
  ];
}