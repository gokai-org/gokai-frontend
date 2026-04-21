"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { ScriptCard } from "@/features/library/components/ScriptCard";
import type { CombinedLibraryItem } from "@/features/library/hooks/useLibraryContent";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import {
  kanjiToScriptCard,
  katakanaToScriptCard,
  hiraganaToScriptCard,
} from "@/features/library/utils/libraryMappers";

const INITIAL_BATCH_SIZE = 24;
const SUBSEQUENT_BATCH_SIZE = 24;
const TAIL_SKELETON_COUNT = 6;

interface LibraryGridProps {
  items: CombinedLibraryItem[];
  favoriteKanjis: Set<string>;
  favoriteHiraganas: Set<string>;
  favoriteKatakanas: Set<string>;
  lockedKanjiIds?: Set<string>;
  lockedHiraganaIds?: Set<string>;
  lockedKatakanaIds?: Set<string>;
  newlyUnlockedKanjiIds?: ReadonlySet<string>;
  newlyUnlockedKanaIds?: ReadonlySet<string>;
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
  lockedHiraganaIds,
  lockedKatakanaIds,
  newlyUnlockedKanjiIds,
  newlyUnlockedKanaIds,
  toggleFavoriteKanji,
  toggleFavoriteHiragana,
  toggleFavoriteKatakana,
  onKanjiClick,
  onKanaClick,
  className = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:gap-4 2xl:grid-cols-5",
}: LibraryGridProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(items.length, INITIAL_BATCH_SIZE),
  );

  useEffect(() => {
    setVisibleCount(Math.min(items.length, INITIAL_BATCH_SIZE));
  }, [items]);

  useEffect(() => {
    if (visibleCount >= items.length) {
      return;
    }

    let timeoutId: number | null = null;
    const animationFrameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        startTransition(() => {
          setVisibleCount((currentVisibleCount) =>
            Math.min(items.length, currentVisibleCount + SUBSEQUENT_BATCH_SIZE),
          );
        });
      }, 24);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [items.length, visibleCount]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const trailingSkeletonCount =
    visibleCount < items.length
      ? Math.min(TAIL_SKELETON_COUNT, items.length - visibleCount)
      : 0;

  return (
    <div className={className}>
      {visibleItems.map((item, i) => {
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

        if (item.type === "hiragana") {
          const isLocked = lockedHiraganaIds?.has(item.data.id) ?? false;
          return (
            <ScriptCard
              key={item.data.id}
              {...hiraganaToScriptCard(
                item.data,
                favoriteHiraganas.has(item.data.id),
              )}
              index={i}
              locked={isLocked}
              unlocking={newlyUnlockedKanaIds?.has(item.data.id) ?? false}
              onClick={isLocked ? undefined : () => onKanaClick(item.data)}
              onFavoriteToggle={isLocked ? undefined : toggleFavoriteHiragana}
            />
          );
        }

        // katakana
        const isLocked = lockedKatakanaIds?.has(item.data.id) ?? false;
        return (
          <ScriptCard
            key={item.data.id}
            {...katakanaToScriptCard(
              item.data,
              favoriteKatakanas.has(item.data.id),
            )}
            index={i}
            locked={isLocked}
            unlocking={newlyUnlockedKanaIds?.has(item.data.id) ?? false}
            onClick={isLocked ? undefined : () => onKanaClick(item.data)}
            onFavoriteToggle={isLocked ? undefined : toggleFavoriteKatakana}
          />
        );
      })}

      {Array.from({ length: trailingSkeletonCount }).map((_, index) => (
        <SkeletonCard key={`library-grid-skeleton-${visibleCount + index}`} />
      ))}
    </div>
  );
}
