"use client";

import { createContext, useContext } from "react";

// ─── Types ───────────────────────────────────────────────────────

export type FontSize = "Pequeño" | "Mediano" | "Grande" | "Muy grande";
export type JapaneseFont =
  | "Noto Sans JP"
  | "Hiragino"
  | "Yu Gothic"
  | "Meiryo";

export interface TypographyContextValue {
  fontSize: FontSize;
  japaneseFont: JapaneseFont;
  setFontSize: (size: FontSize) => void;
  setJapaneseFont: (font: JapaneseFont) => void;
}

// ─── Mappings (also used by the anti-flash script) ───────────────

export const FONT_SIZE_ATTR_MAP: Record<FontSize, string> = {
  Pequeño: "small",
  Mediano: "medium",
  Grande: "large",
  "Muy grande": "x-large",
};

export const JP_FONT_ATTR_MAP: Record<JapaneseFont, string> = {
  "Noto Sans JP": "noto",
  Hiragino: "hiragino",
  "Yu Gothic": "yugothic",
  Meiryo: "meiryo",
};

// ─── Storage keys ────────────────────────────────────────────────

export const FONT_SIZE_STORAGE_KEY = "gokai-font-size";
export const JP_FONT_STORAGE_KEY = "gokai-jp-font";

// ─── Context & hook ──────────────────────────────────────────────

export const TypographyContext =
  createContext<TypographyContextValue | null>(null);

export function useTypography(): TypographyContextValue {
  const ctx = useContext(TypographyContext);
  if (!ctx)
    throw new Error("useTypography must be used within TypographyProvider");
  return ctx;
}
