import { FIXED_KANJI_UNLOCK_COST } from "@/shared/config/unlockCosts";

type KanjiCostRecord = {
  id?: string;
  pointsToUnlock?: number;
  points_to_unlock?: number;
};

function withFixedUnlockCost<T extends KanjiCostRecord>(item: T): T {
  return {
    ...item,
    pointsToUnlock: FIXED_KANJI_UNLOCK_COST,
    points_to_unlock: FIXED_KANJI_UNLOCK_COST,
  };
}

/**
 * Modelo del backend: costo fijo de KANJI_POINTS=30 por kanji
 * (gokaiauth/constants). Algunos catálogos legacy podrían exponer
 * valores variables; forzamos siempre el costo fijo aquí para que la
 * UI quede alineada con la lógica real de validación.
 */
export function normalizeKanjiCatalogUnlockCosts<T extends KanjiCostRecord>(
  items: T[],
) {
  return items.map(withFixedUnlockCost);
}

export function normalizeKanjiDetailUnlockCost<T extends KanjiCostRecord>(
  detail: T,
  _catalog: KanjiCostRecord[] = [],
) {
  return withFixedUnlockCost(detail);
}
