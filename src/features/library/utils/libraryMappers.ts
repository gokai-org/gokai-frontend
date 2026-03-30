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
import type { ScriptCardProps } from "@/features/library/components/ScriptCard";

const RED_THEME = {
  primary: "#993331",
  secondary: "#BA5149",
  soft: "#E7D8D8",
  softBg: "#FFF8F7",
  softBg2: "#F8ECEA",
  badgeBg: "bg-[#993331]/10",
  badgeText: "text-[#993331]",
  badgeBorder: "border-[#993331]/10",
  surface:
    "border-[#E7D8D8] bg-gradient-to-br from-white via-[#FFF8F7] to-[#F8ECEA]",
  thumbStrong:
    "bg-gradient-to-br from-[#993331] to-[#BA5149] text-white shadow-lg",
  thumbSoft: "bg-[#993331]/10 text-[#993331]",
  thumbSoftAlt: "bg-[#993331]/8 text-[#993331]",
};

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
    thumbnailClassName:
      "w-[72px] h-[72px] text-[40px] rounded-2xl " + RED_THEME.thumbStrong,
    topRightBadge: `${kanji.pointsToUnlock} pts`,
    topRightBadgeClassName:
      "border border-[#993331]/20 bg-[#993331]/10 text-[#993331] backdrop-blur-sm",
    favoriteButtonThemeClassName: "border-[#993331]/25 bg-[#993331]/10",
    favoriteIconThemeClassName: "text-[#993331]",
    favoriteIconHoverClassName: "hover:text-[#BA5149]",
    meta: `${readingsCount || 0} lecturas • ${meaningsCount || 0} significados`,
  };
}

export function katakanaToCard(katakana: Kana) {
  const title = katakana.romaji?.trim() || katakana.symbol;
  return {
    id: katakana.id,
    title,
    thumbnail: katakana.symbol,
    thumbnailClassName:
      "w-[72px] h-[72px] text-[40px] rounded-2xl shadow-lg bg-gradient-to-br from-[#A63B38] to-[#C85B52] text-white",
    topRightBadge: `${katakana.pointsToUnlock} pts`,
    topRightBadgeClassName:
      "border border-[#A63B38]/25 bg-[#A63B38]/12 text-[#A63B38] backdrop-blur-sm",
    favoriteButtonThemeClassName: "border-[#A63B38]/30 bg-[#A63B38]/10",
    favoriteIconThemeClassName: "text-[#A63B38]",
    favoriteIconHoverClassName: "hover:text-[#C85B52]",
  };
}

export function hiraganaToCard(hiragana: Kana) {
  const title = hiragana.romaji?.trim() || hiragana.symbol;
  return {
    id: hiragana.id,
    title,
    thumbnail: hiragana.symbol,
    thumbnailClassName:
      "w-[72px] h-[72px] text-[40px] rounded-2xl shadow-lg bg-gradient-to-br from-[#8F2F2D] to-[#B84C45] text-white",
    topRightBadge: `${hiragana.pointsToUnlock} pts`,
    topRightBadgeClassName:
      "border border-[#8F2F2D]/25 bg-[#8F2F2D]/12 text-[#8F2F2D] backdrop-blur-sm",
    favoriteButtonThemeClassName: "border-[#8F2F2D]/30 bg-[#8F2F2D]/10",
    favoriteIconThemeClassName: "text-[#8F2F2D]",
    favoriteIconHoverClassName: "hover:text-[#B84C45]",
  };
}

// ─── ScriptCard mappers ───────────────────────────────────────────────────────

export function kanjiToScriptCard(
  kanji: Kanji,
  isFavorite = false,
): Omit<ScriptCardProps, "index" | "onClick" | "onFavoriteToggle"> & {
  id: string;
} {
  const meaning = getPrimaryMeaning(kanji.meanings) || kanji.symbol;
  const reading = getPrimaryReading(kanji.readings);

  return {
    id: kanji.id,
    symbol: kanji.symbol,
    title: meaning,
    subtitle: reading ? `Lectura: ${reading}` : undefined,
    pointsBadge: `${kanji.pointsToUnlock} pts`,
    variant: "kanji",
    isFavorite,
  };
}

export function hiraganaToScriptCard(
  kana: Kana,
  isFavorite = false,
): Omit<ScriptCardProps, "index" | "onClick" | "onFavoriteToggle"> & {
  id: string;
} {
  return {
    id: kana.id,
    symbol: kana.symbol,
    title: kana.romaji?.trim() || kana.symbol,
    pointsBadge: `${kana.pointsToUnlock} pts`,
    variant: "hiragana",
    isFavorite,
  };
}

export function katakanaToScriptCard(
  kana: Kana,
  isFavorite = false,
): Omit<ScriptCardProps, "index" | "onClick" | "onFavoriteToggle"> & {
  id: string;
} {
  return {
    id: kana.id,
    symbol: kana.symbol,
    title: kana.romaji?.trim() || kana.symbol,
    pointsBadge: `${kana.pointsToUnlock} pts`,
    variant: "katakana",
    isFavorite,
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

    case "hiragana":
      return {
        id: item.id,
        title: item.symbol || "Hiragana",
        description: "Hiragana",
        thumbnail: item.symbol || "あ",
        category: "word",
        lastAccessed: item.createdAt,
      };

    case "katakana":
      return {
        id: item.id,
        title: item.symbol || "Katakana",
        description: "Katakana",
        thumbnail: item.symbol || "ア",
        category: "word",
        lastAccessed: item.createdAt,
      };

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

export function hiraganaFavToCard(fav: BackendFavoriteItem) {
  const symbol = compactJapaneseText(fav.symbol) || "あ";

  return {
    id: fav.id,
    title: symbol,
    subtitle: "Hiragana",
    thumbnail: symbol,
    thumbnailClassName:
      "w-[72px] h-[72px] text-[40px] rounded-2xl shadow-lg bg-gradient-to-br from-[#8F2F2D] to-[#B84C45] text-white",
    favoriteButtonThemeClassName: "border-[#8F2F2D]/30 bg-[#8F2F2D]/10",
    favoriteIconThemeClassName: "text-[#8F2F2D]",
    favoriteIconHoverClassName: "hover:text-[#B84C45]",
  };
}

export function katakanaFavToCard(fav: BackendFavoriteItem) {
  const symbol = compactJapaneseText(fav.symbol) || "ア";

  return {
    id: fav.id,
    title: symbol,
    subtitle: "Katakana",
    thumbnail: symbol,
    thumbnailClassName:
      "w-[72px] h-[72px] text-[40px] rounded-2xl shadow-lg bg-gradient-to-br from-[#A63B38] to-[#C85B52] text-white",
    favoriteButtonThemeClassName: "border-[#A63B38]/30 bg-[#A63B38]/10",
    favoriteIconThemeClassName: "text-[#A63B38]",
    favoriteIconHoverClassName: "hover:text-[#C85B52]",
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
    topRightBadge: "Tema",
    topRightBadgeClassName:
      "border border-[#993331]/20 bg-[#993331]/10 text-[#993331] backdrop-blur-sm",
    thumbnailClassName:
      compactKanji && compactKanji.length > 2
        ? "min-h-[64px] min-w-[64px] max-w-[86px] px-3 py-2 text-[13px] font-extrabold leading-tight rounded-2xl bg-gradient-to-br from-[#993331] to-[#BA5149] text-white shadow-lg"
        : "w-[72px] h-[72px] text-[32px] rounded-2xl bg-gradient-to-br from-[#993331] to-[#BA5149] text-white shadow-lg",
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
    topRightBadge: "Subtema",
    topRightBadgeClassName:
      "border border-[#A63B38]/20 bg-[#A63B38]/10 text-[#A63B38] backdrop-blur-sm",
    thumbnailClassName:
      compactKanji && compactKanji.length > 2
        ? "min-h-[64px] min-w-[64px] max-w-[86px] px-3 py-2 text-[13px] font-extrabold leading-tight rounded-2xl bg-gradient-to-br from-[#A63B38] to-[#C85B52] text-white shadow-lg"
        : "w-[72px] h-[72px] text-[32px] rounded-2xl bg-gradient-to-br from-[#A63B38] to-[#C85B52] text-white shadow-lg",
  };
}

export function wordToCard(word: Word) {
  const mainTitle = word.kanji || word.hiragana || "Palabra";
  const meaningsText = (word.meanings ?? []).join(", ");
  const subtitle = [word.kanji && word.hiragana ? word.hiragana : null, meaningsText]
    .filter(Boolean)
    .join(" • ");

  const thumb = pickWordThumbnail(word);
  const thumbIsUrl = /^https?:\/\//i.test(thumb);

  return {
    id: word.id,
    title: mainTitle,
    subtitle: subtitle || "Vocabulario",
    thumbnail: thumb,
    topRightBadge: "Palabra",
    topRightBadgeClassName:
      "border border-[#B84C45]/20 bg-[#B84C45]/10 text-[#B84C45] backdrop-blur-sm",
    thumbnailClassName: thumbIsUrl
      ? "w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#B84C45]/10 to-[#D06A61]/10 shadow-sm"
      : "w-[72px] h-[72px] text-[28px] rounded-2xl bg-gradient-to-br from-[#B84C45] to-[#D06A61] text-white shadow-lg",
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
      color: "bg-[#993331]",
    },
    {
      id: "recent",
      name: "Reciente",
      icon: "",
      count: params.recentCount,
      color: "bg-[#A63B38]",
    },
    {
      id: "kanji",
      name: "Kanjis",
      icon: "",
      count: params.kanjiCount,
      color: "bg-[#B14540]",
    },
    {
      id: "katakana",
      name: "Katakana",
      icon: "",
      count: params.katakanaCount,
      color: "bg-[#BA5149]",
    },
    {
      id: "hiragana",
      name: "Hiragana",
      icon: "",
      count: params.hiraganaCount,
      color: "bg-[#C85B52]",
    },
    {
      id: "themes",
      name: "Temas",
      icon: "",
      count: params.themeCount,
      color: "bg-[#D06A61]",
    },
  ];
}