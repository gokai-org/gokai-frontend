"use client";

import type { Kana } from "@/features/kana/types";
import { listHiraganas } from "@/features/kana/api/kanaApi";
import { HIRAGANA_DATA } from "../mock/data";
import {
  useKanaBoard,
  type KanaLookupMap,
} from "../../shared/hooks/useKanaBoard";

export function useHiraganaBoard() {
  return useKanaBoard({
    kanaType: "hiragana",
    listKanas: () => listHiraganas().catch(() => null),
    fallbackData: HIRAGANA_DATA,
    errorMessage: "No fue posible cargar el tablero de hiragana.",
  });
}
