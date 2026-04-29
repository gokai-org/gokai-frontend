import { FIXED_KANJI_UNLOCK_COST } from "@/shared/config/unlockCosts";

type KanjiCostRecord = {
  id?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
};

function resolveUnlockCost(item: KanjiCostRecord) {
  const explicitUnlockCost =
    typeof item.pointsToUnlock === "number"
      ? item.pointsToUnlock
      : typeof item.points_to_unlock === "number"
        ? item.points_to_unlock
        : FIXED_KANJI_UNLOCK_COST;

  return Math.max(0, explicitUnlockCost);
}

function normalizeUnlockCost<T extends KanjiCostRecord>(item: T): T {
  const unlockCost = resolveUnlockCost(item);

  return {
    ...item,
    pointsToUnlock: unlockCost,
    points_to_unlock: unlockCost,
  };
}

/**
 * Conserva el costo real enviado por catálogo y solo usa el valor
 * fijo como fallback cuando el backend legacy no lo expone.
 */
export function normalizeKanjiCatalogUnlockCosts<T extends KanjiCostRecord>(
  items: T[],
) {
  return items.map(normalizeUnlockCost);
}

export function normalizeKanjiDetailUnlockCost<T extends KanjiCostRecord>(
  detail: T,
  _catalog: KanjiCostRecord[] = [],
) {
  return normalizeUnlockCost(detail);
}
