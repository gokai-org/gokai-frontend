import type { UserKanaProgressDetailedResponse } from "../types";

export const KANA_ACCESS_REQUIREMENT_MESSAGE =
  "Necesitas dominar hiragana y katakana para acceder a gramática, kanji y vocabulario.";

export type KanaMasteryState = {
  hasHiraganaMastery: boolean;
  hasKatakanaMastery: boolean;
  hasKanasMastery: boolean;
  hasKanaContentAccess: boolean;
};

export function resolveKanaMasteryState(
  items: readonly UserKanaProgressDetailedResponse[] | null | undefined,
): KanaMasteryState {
  const masteryState = (items ?? []).reduce<KanaMasteryState>(
    (acc, item) => ({
      hasHiraganaMastery:
        acc.hasHiraganaMastery ||
        item.hasHiraganaMastery === true ||
        item.hasKanasMastery === true,
      hasKatakanaMastery:
        acc.hasKatakanaMastery ||
        item.hasKatakanaMastery === true ||
        item.hasKanasMastery === true,
      hasKanasMastery:
        acc.hasKanasMastery || item.hasKanasMastery === true,
      hasKanaContentAccess: false,
    }),
    {
      hasHiraganaMastery: false,
      hasKatakanaMastery: false,
      hasKanasMastery: false,
      hasKanaContentAccess: false,
    },
  );

  const hasKanaContentAccess =
    masteryState.hasHiraganaMastery && masteryState.hasKatakanaMastery;

  return {
    ...masteryState,
    hasKanasMastery: masteryState.hasKanasMastery || hasKanaContentAccess,
    hasKanaContentAccess,
  };
}