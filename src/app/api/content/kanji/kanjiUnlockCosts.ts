import { FIXED_KANJI_UNLOCK_COST } from "@/shared/config/unlockCosts";

type KanjiCostRecord = {
  id?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
};

function resolveUnlockCost(item: KanjiCostRecord) {
  void item;
  return FIXED_KANJI_UNLOCK_COST;
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
 * Fuerza el costo manual fijo aunque el catálogo exponga points_to_unlock
 * progresivo para orden/ruta.
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
