"use client";

import {
  memo,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
const TOUCH_INITIAL_BATCH_SIZE = 14;
const TOUCH_SUBSEQUENT_BATCH_SIZE = 14;
const TOUCH_BATCH_DELAY_MS = 42;
const DEFAULT_BATCH_DELAY_MS = 24;
const TAIL_SKELETON_COUNT = 6;

const GRID_ITEM_RENDER_CONTAINMENT_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "210px",
  contain: "layout paint style",
};

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
  optimizeForLargeCollection?: boolean;
  className?: string;
}

type LibraryGridCardProps = Omit<LibraryGridProps, "items" | "className"> & {
  item: LibraryGridItem;
  index: number;
};

const LibraryGridCard = memo(function LibraryGridCard({
  item,
  index,
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
}: LibraryGridCardProps) {
  if (item.type === "theme") {
    const card = themeToCard(item.data);

    return (
      <VocabularyCard
        id={item.data.id}
        title={card.title}
        subtitle={card.subtitle}
        thumbnail={card.thumbnail}
        variant="theme"
        index={index}
        locked={item.data.isUnlocked === false}
        onClick={onThemeClick ? () => onThemeClick(item.data) : undefined}
      />
    );
  }

  if (item.type === "grammar") {
    return (
      <GrammarLibraryCard
        lesson={item.data}
        index={index}
        isFavorite={favoriteGrammar?.has(item.data.id) ?? false}
        onSelect={onGrammarClick}
        onLockedSelect={onGrammarClick}
        onToggleFavorite={onToggleFavoriteGrammar}
      />
    );
  }

  if (item.type === "kanji") {
    const isLocked = lockedKanjiIds?.has(item.data.id) ?? false;
    return (
      <ScriptCard
        {...kanjiToScriptCard(
          item.data,
          favoriteKanjis.has(item.data.id),
        )}
        index={index}
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
        {...hiraganaToScriptCard(
          item.data,
          favoriteHiraganas.has(item.data.id),
        )}
        index={index}
        locked={isLocked}
        unlocking={newlyUnlockedKanaIds?.has(item.data.id) ?? false}
        onClick={isLocked ? undefined : () => onKanaClick(item.data)}
        onFavoriteToggle={isLocked ? undefined : toggleFavoriteHiragana}
      />
    );
  }

  const isLocked = lockedKatakanaIds?.has(item.data.id) ?? false;
  return (
    <ScriptCard
      {...katakanaToScriptCard(
        item.data,
        favoriteKatakanas.has(item.data.id),
      )}
      index={index}
      locked={isLocked}
      unlocking={newlyUnlockedKanaIds?.has(item.data.id) ?? false}
      onClick={isLocked ? undefined : () => onKanaClick(item.data)}
      onFavoriteToggle={isLocked ? undefined : toggleFavoriteKatakana}
    />
  );
});

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
  optimizeForLargeCollection = false,
  className = "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:gap-4 2xl:grid-cols-5",
}: LibraryGridProps) {
  const itemsRef = useRef(items);
  const [isCoarsePointer] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(pointer: coarse)").matches
      : false,
  );
  const useTouchBatches = optimizeForLargeCollection && isCoarsePointer;
  const initialBatchSize = useTouchBatches
    ? TOUCH_INITIAL_BATCH_SIZE
    : INITIAL_BATCH_SIZE;
  const subsequentBatchSize = useTouchBatches
    ? TOUCH_SUBSEQUENT_BATCH_SIZE
    : SUBSEQUENT_BATCH_SIZE;
  const batchDelayMs = useTouchBatches
    ? TOUCH_BATCH_DELAY_MS
    : DEFAULT_BATCH_DELAY_MS;
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(items.length, initialBatchSize),
  );
  const itemsChanged = itemsRef.current !== items;
  const effectiveVisibleCount = itemsChanged
    ? Math.min(items.length, initialBatchSize)
    : Math.min(items.length, visibleCount);

  useEffect(() => {
    itemsRef.current = items;
    setVisibleCount(Math.min(items.length, initialBatchSize));
  }, [initialBatchSize, items]);

  useEffect(() => {
    if (effectiveVisibleCount >= items.length) {
      return;
    }

    let timeoutId: number | null = null;
    const animationFrameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        startTransition(() => {
          setVisibleCount((currentVisibleCount) =>
            Math.min(items.length, currentVisibleCount + subsequentBatchSize),
          );
        });
      }, batchDelayMs);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [batchDelayMs, effectiveVisibleCount, items.length, subsequentBatchSize]);

  const visibleItems = useMemo(
    () => items.slice(0, effectiveVisibleCount),
    [effectiveVisibleCount, items],
  );
  const trailingSkeletonCount =
    effectiveVisibleCount < items.length
      ? Math.min(TAIL_SKELETON_COUNT, items.length - effectiveVisibleCount)
      : 0;

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <div
          key={`${item.type}-${item.data.id}`}
          className="h-full"
          style={GRID_ITEM_RENDER_CONTAINMENT_STYLE}
        >
          <LibraryGridCard
            item={item}
            index={index}
            favoriteKanjis={favoriteKanjis}
            favoriteHiraganas={favoriteHiraganas}
            favoriteKatakanas={favoriteKatakanas}
            favoriteGrammar={favoriteGrammar}
            lockedKanjiIds={lockedKanjiIds}
            nextUnlockReadyKanjiId={nextUnlockReadyKanjiId}
            unlockPendingKanjiId={unlockPendingKanjiId}
            currentKanjiPoints={currentKanjiPoints}
            lockedHiraganaIds={lockedHiraganaIds}
            lockedKatakanaIds={lockedKatakanaIds}
            newlyUnlockedKanjiIds={newlyUnlockedKanjiIds}
            newlyUnlockedKanaIds={newlyUnlockedKanaIds}
            toggleFavoriteKanji={toggleFavoriteKanji}
            toggleFavoriteHiragana={toggleFavoriteHiragana}
            toggleFavoriteKatakana={toggleFavoriteKatakana}
            onToggleFavoriteGrammar={onToggleFavoriteGrammar}
            onKanjiClick={onKanjiClick}
            onKanjiPressUnlock={onKanjiPressUnlock}
            onKanaClick={onKanaClick}
            onThemeClick={onThemeClick}
            onGrammarClick={onGrammarClick}
            optimizeForLargeCollection={optimizeForLargeCollection}
          />
        </div>
      ))}

      {Array.from({ length: trailingSkeletonCount }).map((_, index) => (
        <SkeletonCard key={`library-grid-skeleton-${effectiveVisibleCount + index}`} />
      ))}
    </div>
  );
}
