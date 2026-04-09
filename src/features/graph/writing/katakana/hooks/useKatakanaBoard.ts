"use client";

import { KATAKANA_DATA } from "../mock/data";
import { listKatakanas } from "@/features/kana/api/kanaApi";
import {
  useKanaBoard,
  type KanaLookupMap,
} from "../../shared/hooks/useKanaBoard";

export function useKatakanaBoard() {
  return useKanaBoard({
    kanaType: "katakana",
    listKanas: () => listKatakanas().catch(() => null),
    fallbackData: KATAKANA_DATA,
    errorMessage: "No fue posible cargar el tablero de katakana.",
  });
}
