"use client";

import { Fragment, useMemo } from "react";
import { GrammarLibraryCard } from "@/features/graph/grammar/components/library/GrammarLibraryCard";
import type { GrammarBoardProgress } from "@/features/graph/grammar/types/board";
import { LibraryCategorySection } from "@/features/library/components/LibraryCategorySection";
import { ScriptCard } from "@/features/library/components/ScriptCard";
import { VocabularyCard } from "@/features/library/components/VocabularyCard";
import { LibraryCardsSkeletonGrid } from "@/shared/ui/Skeleton";
import type {
  GroupedLibrarySearchResults,
  SearchIndexItem,
} from "@/features/library/types/librarySearch.types";

type LibrarySearchResultsProps = {
  query: string;
  groupedResults: GroupedLibrarySearchResults;
  totalResults: number;
  isLoading: boolean;
  hasNoResults: boolean;
  grammarLessonsById: ReadonlyMap<string, GrammarBoardProgress>;
  favoriteKanjis: ReadonlySet<string>;
  favoriteHiraganas: ReadonlySet<string>;
  favoriteKatakanas: ReadonlySet<string>;
  favoriteGrammar: ReadonlySet<string>;
  favoriteWords: ReadonlySet<string>;
  lockedKanjiIds: ReadonlySet<string>;
  lockedHiraganaIds: ReadonlySet<string>;
  lockedKatakanaIds: ReadonlySet<string>;
  themeLockStateById: ReadonlyMap<string, boolean>;
  wordLockStateById: ReadonlyMap<string, boolean>;
  newlyUnlockedKanjiIds: ReadonlySet<string>;
  newlyUnlockedKanaIds: ReadonlySet<string>;
  canUnlockNext: boolean;
  nextUnlockCandidateId: string | null;
  unlockPendingKanjiId: string | null;
  userPoints: number;
  onKanjiSelect: (item: SearchIndexItem) => void;
  onKanaSelect: (item: SearchIndexItem) => void;
  onGrammarSelect: (item: SearchIndexItem) => void;
  onVocabularySelect: (item: SearchIndexItem) => void;
  onToggleFavoriteKanji: (id: string) => void;
  onToggleFavoriteWord: (id: string) => void;
  onToggleFavoriteGrammar: (id: string) => void;
  onPressUnlockKanji: (id: string) => void;
};

function buildGrammarFallback(item: SearchIndexItem, index: number): GrammarBoardProgress {
  return {
    id: item.id,
    index,
    symbol: "",
    title: item.title,
    pointsToUnlock: item.pointsToUnlock ?? 0,
    status: "available",
    isMock: false,
  };
}

export function LibrarySearchResults({
  query,
  groupedResults,
  totalResults,
  isLoading,
  hasNoResults,
  grammarLessonsById,
  favoriteKanjis,
  favoriteHiraganas,
  favoriteKatakanas,
  favoriteGrammar,
  favoriteWords,
  lockedKanjiIds,
  lockedHiraganaIds,
  lockedKatakanaIds,
  themeLockStateById,
  wordLockStateById,
  newlyUnlockedKanjiIds,
  newlyUnlockedKanaIds,
  canUnlockNext,
  nextUnlockCandidateId,
  unlockPendingKanjiId,
  userPoints,
  onKanjiSelect,
  onKanaSelect,
  onGrammarSelect,
  onVocabularySelect,
  onToggleFavoriteKanji,
  onToggleFavoriteWord,
  onToggleFavoriteGrammar,
  onPressUnlockKanji,
}: LibrarySearchResultsProps) {
  const vocabularyCount = groupedResults.vocabulary.length;
  const normalizedQuery = query.trim();

  const grammarResults = useMemo(
    () =>
      groupedResults.grammar.map((item, index) => ({
        item,
        lesson: grammarLessonsById.get(item.id) ?? buildGrammarFallback(item, index),
      })),
    [grammarLessonsById, groupedResults.grammar],
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-content-primary">
          Resultados para &ldquo;{normalizedQuery}&rdquo;
        </h2>
        <span className="text-sm text-content-secondary">{totalResults} resultados</span>
      </div>

      {isLoading && totalResults === 0 ? (
        <LibraryCardsSkeletonGrid variant="vocabulary" />
      ) : hasNoResults ? (
        <div className="flex flex-col items-center justify-center py-16">
          <h3 className="mb-2 text-xl font-bold text-content-primary">Sin resultados</h3>
          <p className="max-w-md text-center text-content-secondary">
            No encontramos contenido que coincida con &ldquo;{normalizedQuery}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedResults.kanji.length > 0 && (
            <LibraryCategorySection
              title="Kanjis"
              countLabel={`${groupedResults.kanji.length} resultados`}
              emptyTitle=""
              emptyDescription=""
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {groupedResults.kanji.map((item, index) => {
                  const isLocked = lockedKanjiIds.has(item.id);

                  return (
                    <ScriptCard
                      key={item.id}
                      id={item.id}
                      symbol={item.symbol ?? item.title}
                      title={item.title}
                      subtitle={item.subtitle ?? undefined}
                      variant="kanji"
                      index={index}
                      isFavorite={favoriteKanjis.has(item.id)}
                      locked={isLocked}
                      unlockReady={isLocked && canUnlockNext && nextUnlockCandidateId === item.id}
                      unlockPending={unlockPendingKanjiId === item.id}
                      unlocking={newlyUnlockedKanjiIds.has(item.id)}
                      unlockPoints={item.pointsToUnlock ?? undefined}
                      currentPoints={userPoints}
                      onClick={() => onKanjiSelect(item)}
                      onPressUnlock={onPressUnlockKanji}
                      onFavoriteToggle={isLocked ? undefined : onToggleFavoriteKanji}
                    />
                  );
                })}
              </div>
            </LibraryCategorySection>
          )}

          {groupedResults.hiragana.length > 0 && (
            <LibraryCategorySection
              title="Hiraganas"
              countLabel={`${groupedResults.hiragana.length} resultados`}
              emptyTitle=""
              emptyDescription=""
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {groupedResults.hiragana.map((item, index) => {
                  const isLocked = lockedHiraganaIds.has(item.id);

                  return (
                    <ScriptCard
                      key={item.id}
                      id={item.id}
                      symbol={item.symbol ?? item.title}
                      title={item.romaji ?? item.title}
                      variant="hiragana"
                      index={index}
                      isFavorite={favoriteHiraganas.has(item.id)}
                      locked={isLocked}
                      unlocking={newlyUnlockedKanaIds.has(item.id)}
                      unlockPoints={item.pointsToUnlock ?? undefined}
                      onClick={isLocked ? undefined : () => onKanaSelect(item)}
                    />
                  );
                })}
              </div>
            </LibraryCategorySection>
          )}

          {groupedResults.katakana.length > 0 && (
            <LibraryCategorySection
              title="Katakanas"
              countLabel={`${groupedResults.katakana.length} resultados`}
              emptyTitle=""
              emptyDescription=""
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {groupedResults.katakana.map((item, index) => {
                  const isLocked = lockedKatakanaIds.has(item.id);

                  return (
                    <ScriptCard
                      key={item.id}
                      id={item.id}
                      symbol={item.symbol ?? item.title}
                      title={item.romaji ?? item.title}
                      variant="katakana"
                      index={index}
                      isFavorite={favoriteKatakanas.has(item.id)}
                      locked={isLocked}
                      unlocking={newlyUnlockedKanaIds.has(item.id)}
                      unlockPoints={item.pointsToUnlock ?? undefined}
                      onClick={isLocked ? undefined : () => onKanaSelect(item)}
                    />
                  );
                })}
              </div>
            </LibraryCategorySection>
          )}

          {grammarResults.length > 0 && (
            <LibraryCategorySection
              title="Lecciones de gramática"
              countLabel={`${grammarResults.length} resultados`}
              emptyTitle=""
              emptyDescription=""
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {grammarResults.map(({ item, lesson }, index) => (
                  <GrammarLibraryCard
                    key={item.id}
                    lesson={lesson}
                    index={index}
                    isFavorite={favoriteGrammar.has(item.id)}
                    onSelect={() => onGrammarSelect(item)}
                    onToggleFavorite={() => onToggleFavoriteGrammar(item.id)}
                  />
                ))}
              </div>
            </LibraryCategorySection>
          )}

          {(vocabularyCount > 0 || isLoading) && (
            <LibraryCategorySection
              title="Vocabulario"
              countLabel={`${vocabularyCount} resultados`}
              emptyTitle=""
              emptyDescription=""
              loading={isLoading && vocabularyCount === 0}
              skeletonVariant="vocabulary"
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {groupedResults.vocabulary.map((item, index) => {
                  const isThemeLocked = item.entityType === "theme"
                    ? (themeLockStateById.get(item.id) ?? false)
                    : false;
                  const isWordLocked = item.entityType === "word"
                    ? (wordLockStateById.get(item.id) ?? false)
                    : false;
                  const isLocked = isThemeLocked || isWordLocked;

                  return (
                    <Fragment key={`${item.entityType}-${item.id}`}>
                      <VocabularyCard
                        id={item.id}
                        title={item.title}
                        subtitle={item.subtitle ?? undefined}
                        thumbnail={item.thumbnail ?? item.title}
                        variant={item.entityType === "word" ? "word" : item.entityType === "subtheme" ? "subtheme" : "theme"}
                        index={index}
                        locked={isLocked}
                        isFavorite={item.entityType === "word" ? favoriteWords.has(item.id) : false}
                        onClick={isLocked ? undefined : () => onVocabularySelect(item)}
                        onFavoriteToggle={
                          item.entityType === "word" && !isLocked
                            ? () => onToggleFavoriteWord(item.id)
                            : undefined
                        }
                      />
                    </Fragment>
                  );
                })}
              </div>
            </LibraryCategorySection>
          )}
        </div>
      )}
    </div>
  );
}
