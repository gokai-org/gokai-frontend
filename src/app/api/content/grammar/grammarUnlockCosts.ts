import { FIXED_GRAMMAR_UNLOCK_COST } from "@/shared/config/unlockCosts";

type GrammarCostRecord = {
  id?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
};

function resolveUnlockCost(item: GrammarCostRecord) {
  void item;
  return FIXED_GRAMMAR_UNLOCK_COST;
}

function normalizeUnlockCost<T extends GrammarCostRecord>(item: T): T {
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
export function normalizeGrammarCatalogUnlockCosts<T extends GrammarCostRecord>(
  items: T[],
) {
  return items.map(normalizeUnlockCost);
}

export function normalizeGrammarDetailUnlockCost<T extends GrammarCostRecord>(
  detail: T,
) {
  return normalizeUnlockCost(detail);
}
