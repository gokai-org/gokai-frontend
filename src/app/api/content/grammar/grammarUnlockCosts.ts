import { FIXED_GRAMMAR_UNLOCK_COST } from "@/shared/config/unlockCosts";

type GrammarCostRecord = {
  id?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
};

function withFixedUnlockCost<T extends GrammarCostRecord>(item: T): T {
  return {
    ...item,
    pointsToUnlock: FIXED_GRAMMAR_UNLOCK_COST,
    points_to_unlock: FIXED_GRAMMAR_UNLOCK_COST,
  };
}

/**
 * Backend: costo fijo de GRAMMAR_POINTS=35 por lección
 * (gokaiauth/constants). Forzamos el valor fijo en BFF para que la
 * UI muestre y valide siempre contra 35.
 */
export function normalizeGrammarCatalogUnlockCosts<T extends GrammarCostRecord>(
  items: T[],
) {
  return items.map(withFixedUnlockCost);
}

export function normalizeGrammarDetailUnlockCost<T extends GrammarCostRecord>(
  detail: T,
) {
  return withFixedUnlockCost(detail);
}
