import type { Kana } from "../types";

/** Devuelve el símbolo como label principal del kana. */
export function getKanaLabel(kana: Kana): string {
  return kana.symbol;
}
