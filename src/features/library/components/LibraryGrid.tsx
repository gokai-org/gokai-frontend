"use client";

import { ContentCard } from "@/features/library/components/ContentCard";
import type { CombinedLibraryItem } from "@/features/library/hooks/useLibraryContent";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import {
  kanjiToCard,
  katakanaToCard,
  hiraganaToCard,
} from "@/features/library/utils/libraryMappers";

interface LibraryGridProps {
  items: CombinedLibraryItem[];
  favoriteKanjis: Set<string>;
  favoriteHiraganas: Set<string>;
  favoriteKatakanas: Set<string>;
  toggleFavoriteKanji: (id: string) => void;
  toggleFavoriteHiragana: (id: string) => void;
  toggleFavoriteKatakana: (id: string) => void;
  onKanjiClick: (kanji: Kanji) => void;
  onKanaClick: (kana: Kana) => void;
  className?: string;
}

export function LibraryGrid({
  items,
  favoriteKanjis,
  favoriteHiraganas,
  favoriteKatakanas,
  toggleFavoriteKanji,
  toggleFavoriteHiragana,
  toggleFavoriteKatakana,
  onKanjiClick,
  onKanaClick,
  className = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:gap-4 2xl:grid-cols-5",
}: LibraryGridProps) {
  return (
    <div className={className}>
      {items.map((item) => {
        if (item.type === "kanji") {
          return (
            <ContentCard
              key={item.data.id}
              {...kanjiToCard(item.data)}
              onClick={() => onKanjiClick(item.data)}
              onFavoriteToggle={toggleFavoriteKanji}
              isFavorite={favoriteKanjis.has(item.data.id)}
            />
          );
        }

        return (
          <ContentCard
            key={item.data.id}
            {...(item.type === "hiragana"
              ? hiraganaToCard(item.data)
              : katakanaToCard(item.data))}
            onClick={() => onKanaClick(item.data)}
            onFavoriteToggle={
              item.type === "hiragana"
                ? toggleFavoriteHiragana
                : toggleFavoriteKatakana
            }
            isFavorite={
              item.type === "hiragana"
                ? favoriteHiraganas.has(item.data.id)
                : favoriteKatakanas.has(item.data.id)
            }
          />
        );
      })}
    </div>
  );
}