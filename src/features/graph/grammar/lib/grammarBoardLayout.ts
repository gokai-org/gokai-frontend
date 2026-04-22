import {
  GRAMMAR_BOARD_CANVAS,
  GRAMMAR_SUGOROKU_SLOTS,
} from "../constants/grammarBoard";
import type {
  GrammarBoardCellLayout,
  GrammarBoardProgress,
  GrammarBoardSlot,
  GrammarBoardViewModel,
} from "../types";
import {
  createGrammarBoardStats,
  resolveGrammarBoardVisualState,
} from "./grammarBoardModel";

export function buildGrammarBoardLayout(
  ids: readonly string[],
  slots: readonly GrammarBoardSlot[] = GRAMMAR_SUGOROKU_SLOTS,
) {
  return ids.slice(0, slots.length).map((id, index) => ({
    ...(slots[index] as GrammarBoardSlot),
    id,
  }));
}

export function createGrammarBoardViewModel(
  items: readonly GrammarBoardProgress[],
  activeId: string | null,
  slots?: readonly GrammarBoardSlot[],
): GrammarBoardViewModel {
  const layout = buildGrammarBoardLayout(items.map((item) => item.id), slots);
  const itemsById = new Map(items.map((item) => [item.id, item]));

  const cells = layout.flatMap((cellLayout) => {
    const progress = itemsById.get(cellLayout.id);

    if (!progress) {
      return [];
    }

    return [
      {
        progress,
        layout: cellLayout,
        visualState: resolveGrammarBoardVisualState(progress, activeId),
        interactive:
          !progress.isMock &&
          (progress.status !== "locked" ||
            progress.isNextUnlockCandidate === true),
      },
    ];
  });

  return {
    cells,
    activeId,
    stats: createGrammarBoardStats(items),
    canvas: GRAMMAR_BOARD_CANVAS,
  };
}