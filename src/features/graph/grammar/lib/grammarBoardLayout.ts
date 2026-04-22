import {
  GRAMMAR_BOARD_CANVAS,
  GRAMMAR_SUGOROKU_SLOTS,
} from "../constants/grammarBoard";
import type {
  GrammarBoardCellLayout,
  GrammarBoardPathSegment,
  GrammarBoardPoint,
  GrammarBoardProgress,
  GrammarBoardSlot,
  GrammarBoardStatus,
  GrammarBoardViewModel,
} from "../types";
import {
  createGrammarBoardStats,
  resolveGrammarBoardVisualState,
} from "./grammarBoardModel";

function getCellCenter(cell: GrammarBoardCellLayout): GrammarBoardPoint {
  return {
    x: cell.x + cell.width / 2,
    y: cell.y + cell.height / 2,
  };
}

function getPathStatus(
  source: GrammarBoardProgress,
  target: GrammarBoardProgress,
): GrammarBoardStatus {
  if (source.status === "completed" && target.status === "completed") {
    return "completed";
  }

  if (target.status === "locked") {
    return "locked";
  }

  return "available";
}

export function buildGrammarBoardLayout(
  ids: readonly string[],
  slots: readonly GrammarBoardSlot[] = GRAMMAR_SUGOROKU_SLOTS,
) {
  return ids.slice(0, slots.length).map((id, index) => ({
    ...(slots[index] as GrammarBoardSlot),
    id,
  }));
}

export function buildGrammarBoardPath(
  items: readonly GrammarBoardProgress[],
  layout: readonly GrammarBoardCellLayout[],
): GrammarBoardPathSegment[] {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const segments: GrammarBoardPathSegment[] = [];

  for (let index = 0; index < layout.length - 1; index += 1) {
    const source = layout[index];
    const target = layout[index + 1];
    const sourceItem = itemsById.get(source.id);
    const targetItem = itemsById.get(target.id);

    if (!sourceItem || !targetItem) {
      continue;
    }

    segments.push({
      id: `${source.id}-${target.id}`,
      fromId: source.id,
      toId: target.id,
      from: getCellCenter(source),
      to: getCellCenter(target),
      status: getPathStatus(sourceItem, targetItem),
      curveDirection: source.curveDirection ?? 0,
      routeTier: target.routeTier,
    });
  }

  return segments;
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
    path: buildGrammarBoardPath(items, layout),
    activeId,
    stats: createGrammarBoardStats(items),
    canvas: GRAMMAR_BOARD_CANVAS,
  };
}