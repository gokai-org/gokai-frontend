import { FIXED_GRAMMAR_UNLOCK_COST } from "@/shared/config/unlockCosts";

type GrammarCostRecord = {
  id?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
};

function resolveUnlockCost(item: GrammarCostRecord) {
  const explicitUnlockCost =
    typeof item.pointsToUnlock === "number"
      ? item.pointsToUnlock
      : typeof item.points_to_unlock === "number"
        ? item.points_to_unlock
        : FIXED_GRAMMAR_UNLOCK_COST;

  return Math.max(0, explicitUnlockCost);
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
 * Conserva el costo real enviado por catálogo y solo usa el valor
 * fijo como fallback cuando el backend legacy no lo expone.
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
