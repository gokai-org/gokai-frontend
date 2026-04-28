/**
 * Costos fijos de desbloqueo alineados con el modelo del backend
 * (gokaiauth/constants: KANJI_POINTS=30, GRAMMAR_POINTS=35).
 * Cualquier valor variable que llegue desde el catálogo (DB) debe
 * normalizarse a estos valores fijos para que la UI sea consistente.
 */
export const FIXED_KANJI_UNLOCK_COST = 30;
export const FIXED_GRAMMAR_UNLOCK_COST = 35;
