"use client";

import { ScriptCard } from "@/features/library/components/ScriptCard";
import type { CombinedLibraryItem } from "@/features/library/hooks/useLibraryContent";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import {
  kanjiToScriptCard,
  katakanaToScriptCard,
  hiraganaToScriptCard,
} from "@/features/library/utils/libraryMappers";

interface LibraryGridProps {
  items: CombinedLibraryItem[];
  favoriteKanjis: Set<string>;
  favoriteHiraganas: Set<string>;
  favoriteKatakanas: Set<string>;
  lockedKanjiIds?: Set<string>;
  newlyUnlockedKanjiIds?: ReadonlySet<string>;
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
  lockedKanjiIds,
  newlyUnlockedKanjiIds,
  toggleFavoriteKanji,
  toggleFavoriteHiragana,
  toggleFavoriteKatakana,
  onKanjiClick,
  onKanaClick,
  className = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:gap-4 2xl:grid-cols-5",
}: LibraryGridProps) {
  return (
    <div className={className}>
      {items.map((item, i) => {
        if (item.type === "kanji") {
          const isLocked = lockedKanjiIds?.has(item.data.id) ?? false;
          return (
            <ScriptCard
              key={item.data.id}
              {...kanjiToScriptCard(
                item.data,
                favoriteKanjis.has(item.data.id),
              )}
              index={i}
              locked={isLocked}
              unlocking={newlyUnlockedKanjiIds?.has(item.data.id) ?? false}
              onClick={isLocked ? undefined : () => onKanjiClick(item.data)}
              onFavoriteToggle={isLocked ? undefined : toggleFavoriteKanji}
            />
          );
        }

        return (
          <ScriptCard
            key={item.data.id}
            {...(item.type === "hiragana"
              ? hiraganaToScriptCard(
                  item.data,
                  favoriteHiraganas.has(item.data.id),
                )
              : katakanaToScriptCard(
                  item.data,
                  favoriteKatakanas.has(item.data.id),
                ))}
            index={i}
            onClick={() => onKanaClick(item.data)}
            onFavoriteToggle={
              item.type === "hiragana"
                ? toggleFavoriteHiragana
                : toggleFavoriteKatakana
            }
          />
        );
      })}
    </div>
  );
}
