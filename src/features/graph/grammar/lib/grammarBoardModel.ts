import { GRAMMAR_BOARD_TOTAL } from "../constants/grammarBoard";
import { MOCK_GRAMMAR_LESSONS } from "../data/mockLessons";
import type {
  GrammarBoardProgress,
  GrammarBoardStats,
  GrammarBoardStatus,
  GrammarBoardVisualState,
  GrammarLessonSummary,
} from "../types";

const JAPANESE_SYMBOL_PATTERN =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\u30fc\u3005\u3006\u30f5\u30f6]+/g;

const MAX_SYMBOL_LENGTH = 6;

function normalizeBoardStatus(value?: string | null): GrammarBoardStatus | null {
  if (value === "completed" || value === "available" || value === "locked") {
    return value;
  }

  return null;
}

function extractLessonSymbol(lesson: GrammarLessonSummary, index: number) {
  const explicitSymbol = lesson.symbol?.trim();
  if (explicitSymbol) {
    return explicitSymbol.slice(0, Math.min(explicitSymbol.length, MAX_SYMBOL_LENGTH));
  }

  const matches = (lesson.title.match(JAPANESE_SYMBOL_PATTERN) ?? []).filter(
    (token) => token.trim().length > 0,
  );

  if (matches.length > 0) {
    const combinedSymbol = matches.join("");

    if (combinedSymbol.length <= MAX_SYMBOL_LENGTH) {
      return combinedSymbol;
    }

    const longestToken = matches.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
    );

    return longestToken.slice(0, Math.min(longestToken.length, MAX_SYMBOL_LENGTH));
  }

  return index === 0 ? "文法" : "ことば";
}

function resolveLessonStatus(lesson: GrammarLessonSummary): GrammarBoardStatus {
  const explicitStatus = normalizeBoardStatus(lesson.status);
  if (explicitStatus) {
    return explicitStatus;
  }

  if (lesson.completed === true) {
    return "completed";
  }

  if (
    lesson.available === true ||
    lesson.unlocked === true ||
    lesson.current === true
  ) {
    return "available";
  }

  return "available";
}

export function buildGrammarBoardItems(
  lessons: readonly GrammarLessonSummary[],
): GrammarBoardProgress[] {
  const items: GrammarBoardProgress[] = [];

  for (let index = 0; index < GRAMMAR_BOARD_TOTAL; index += 1) {
    const lesson = lessons[index];

    if (lesson) {
      items.push({
        id: lesson.id,
        index,
        symbol: extractLessonSymbol(lesson, index),
        title: lesson.title,
        pointsToUnlock: lesson.pointsToUnlock ?? 0,
        status: resolveLessonStatus(lesson),
        isMock: false,
        isCurrent: lesson.current === true,
      });
      continue;
    }

    const fallbackLesson =
      MOCK_GRAMMAR_LESSONS[index] ??
      MOCK_GRAMMAR_LESSONS[MOCK_GRAMMAR_LESSONS.length - 1];

    items.push({
      id: fallbackLesson.id,
      index,
      symbol: extractLessonSymbol(fallbackLesson, index),
      title: fallbackLesson.title,
      pointsToUnlock: fallbackLesson.pointsToUnlock ?? index * 30,
      status: "locked",
      isMock: true,
      isCurrent: false,
    });
  }

  return items;
}

export function getGrammarBoardActiveId(
  items: readonly GrammarBoardProgress[],
  selectedId: string | null = null,
) {
  if (selectedId && items.some((item) => item.id === selectedId)) {
    return selectedId;
  }

  const currentItem = items.find(
    (item) => item.isCurrent && item.status !== "locked",
  );

  if (currentItem) {
    return currentItem.id;
  }

  const availableItem = items.find((item) => item.status === "available");
  if (availableItem) {
    return availableItem.id;
  }

  const completedItem = [...items]
    .reverse()
    .find((item) => item.status === "completed");

  return completedItem?.id ?? items[0]?.id ?? null;
}

export function resolveGrammarBoardVisualState(
  item: GrammarBoardProgress,
  activeId: string | null,
): GrammarBoardVisualState {
  if (item.id === activeId && item.status !== "locked") {
    return "active";
  }

  return item.status;
}

export function createGrammarBoardStats(
  items: readonly GrammarBoardProgress[],
): GrammarBoardStats {
  return items.reduce<GrammarBoardStats>(
    (stats, item) => {
      stats.total += 1;

      if (item.status === "completed") {
        stats.completed += 1;
        return stats;
      }

      if (item.status === "locked") {
        stats.locked += 1;
        return stats;
      }

      stats.available += 1;
      return stats;
    },
    { total: 0, completed: 0, available: 0, locked: 0 },
  );
}