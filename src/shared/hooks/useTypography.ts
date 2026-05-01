"use client";

import { createContext, useContext } from "react";

// ─── Types ───────────────────────────────────────────────────────

export const FONT_SIZE_OPTIONS = [
  "Pequeño",
  "Mediano",
  "Grande",
  "Muy grande",
] as const;

export const JAPANESE_FONT_OPTIONS = [
  "Noto Sans JP",
  "Noto Serif JP",
  "Sawarabi Mincho",
  "Meiryo",
] as const;

export type FontSize = (typeof FONT_SIZE_OPTIONS)[number];
export type JapaneseFont = (typeof JAPANESE_FONT_OPTIONS)[number];

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
  "Noto Serif JP": "noto-serif",
  "Sawarabi Mincho": "sawarabi",
  Meiryo: "meiryo",
};

const LEGACY_JP_FONT_MAP: Record<string, JapaneseFont> = {
  Hiragino: "Noto Serif JP",
  "Yu Gothic": "Sawarabi Mincho",
};

export function normalizeFontSize(value: unknown): FontSize {
  return FONT_SIZE_OPTIONS.includes(value as FontSize)
    ? (value as FontSize)
    : "Mediano";
}

export function normalizeJapaneseFont(value: unknown): JapaneseFont {
  if (JAPANESE_FONT_OPTIONS.includes(value as JapaneseFont)) {
    return value as JapaneseFont;
  }

  if (typeof value === "string" && value in LEGACY_JP_FONT_MAP) {
    return LEGACY_JP_FONT_MAP[value];
  }

  return "Noto Sans JP";
}

// ─── Storage keys ────────────────────────────────────────────────

export const FONT_SIZE_STORAGE_KEY = "gokai-font-size";
export const JP_FONT_STORAGE_KEY = "gokai-jp-font";

// ─── Context & hook ──────────────────────────────────────────────

export const TypographyContext = createContext<TypographyContextValue | null>(
  null,
);

export function useTypography(): TypographyContextValue {
  const ctx = useContext(TypographyContext);
  if (!ctx)
    throw new Error("useTypography must be used within TypographyProvider");
  return ctx;
}
