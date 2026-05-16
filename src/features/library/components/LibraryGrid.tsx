"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { ScriptCard } from "@/features/library/components/ScriptCard";
import { VocabularyCard } from "@/features/library/components/VocabularyCard";
import { GrammarLibraryCard } from "@/features/graph/grammar/components/library/GrammarLibraryCard";
import type { GrammarBoardProgress } from "@/features/graph/grammar/types/board";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import type { Theme } from "@/features/library/types";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import {
  kanjiToScriptCard,
  katakanaToScriptCard,
  hiraganaToScriptCard,
  themeToCard,
} from "@/features/library/utils/libraryMappers";

const INITIAL_BATCH_SIZE = 24;
const SUBSEQUENT_BATCH_SIZE = 24;
const TAIL_SKELETON_COUNT = 6;

export type LibraryGridItem =
  | { type: "kanji"; data: Kanji }
  | { type: "katakana"; data: Kana }
  | { type: "hiragana"; data: Kana }
  | { type: "theme"; data: Theme }
  | { type: "grammar"; data: GrammarBoardProgress };

interface LibraryGridProps {
  items: LibraryGridItem[];
  favoriteKanjis: Set<string>;
  favoriteHiraganas: Set<string>;
  favoriteKatakanas: Set<string>;
  favoriteGrammar?: Set<string>;
  lockedKanjiIds?: Set<string>;
  nextUnlockReadyKanjiId?: string | null;
  unlockPendingKanjiId?: string | null;
  currentKanjiPoints?: number;
  lockedHiraganaIds?: Set<string>;
  lockedKatakanaIds?: Set<string>;
  newlyUnlockedKanjiIds?: ReadonlySet<string>;
  newlyUnlockedKanaIds?: ReadonlySet<string>;
  toggleFavoriteKanji: (id: string) => void;
  toggleFavoriteHiragana?: (id: string) => void;
  toggleFavoriteKatakana?: (id: string) => void;
  onToggleFavoriteGrammar?: (id: string) => void;
  onKanjiClick: (kanji: Kanji) => void;
  onKanjiPressUnlock?: (kanjiId: string) => void;
  onKanaClick: (kana: Kana) => void;
  onThemeClick?: (theme: Theme) => void;
  onGrammarClick?: (lessonId: string) => void;
  className?: string;
}

export function LibraryGrid({
  items,
  favoriteKanjis,
  favoriteHiraganas,
  favoriteKatakanas,
  favoriteGrammar,
  lockedKanjiIds,
  nextUnlockReadyKanjiId,
  unlockPendingKanjiId,
  currentKanjiPoints,
  lockedHiraganaIds,
  lockedKatakanaIds,
  newlyUnlockedKanjiIds,
  newlyUnlockedKanaIds,
  toggleFavoriteKanji,
  toggleFavoriteHiragana,
  toggleFavoriteKatakana,
  onToggleFavoriteGrammar,
  onKanjiClick,
  onKanjiPressUnlock,
  onKanaClick,
  onThemeClick,
  onGrammarClick,
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
        if (item.type === "theme") {
          const card = themeToCard(item.data);

          return (
            <VocabularyCard
              key={item.data.id}
              id={item.data.id}
              title={card.title}
              subtitle={card.subtitle}
              thumbnail={card.thumbnail}
              variant="theme"
              index={i}
              locked={item.data.isUnlocked === false}
              onClick={
                item.data.isUnlocked === false || !onThemeClick
                  ? undefined
                  : () => onThemeClick(item.data)
              }
            />
          );
        }

        if (item.type === "grammar") {
          return (
            <GrammarLibraryCard
              key={item.data.id}
              lesson={item.data}
              index={i}
              isFavorite={favoriteGrammar?.has(item.data.id) ?? false}
              onSelect={onGrammarClick}
              onToggleFavorite={onToggleFavoriteGrammar}
            />
          );
        }

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
              unlockReady={
                isLocked && nextUnlockReadyKanjiId === item.data.id
              }
              unlockPending={unlockPendingKanjiId === item.data.id}
              unlocking={newlyUnlockedKanjiIds?.has(item.data.id) ?? false}
              currentPoints={currentKanjiPoints}
              onClick={() => onKanjiClick(item.data)}
              onPressUnlock={onKanjiPressUnlock}
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
