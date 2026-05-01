"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  TypographyContext,
  FONT_SIZE_ATTR_MAP,
  JP_FONT_ATTR_MAP,
  FONT_SIZE_STORAGE_KEY,
  JP_FONT_STORAGE_KEY,
  normalizeFontSize,
  normalizeJapaneseFont,
  type FontSize,
  type JapaneseFont,
} from "@/shared/hooks/useTypography";

// ─── Helpers ─────────────────────────────────────────────────────

function getInitialFontSize(): FontSize {
  if (typeof window === "undefined") return "Mediano";
  try {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    const normalized = normalizeFontSize(stored);
    if (stored && stored !== normalized) {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, normalized);
    }
    return normalized;
  } catch {}
  return "Mediano";
}

function getInitialJapaneseFont(): JapaneseFont {
  if (typeof window === "undefined") return "Noto Sans JP";
  try {
    const stored = localStorage.getItem(JP_FONT_STORAGE_KEY);
    const normalized = normalizeJapaneseFont(stored);
    if (stored && stored !== normalized) {
      localStorage.setItem(JP_FONT_STORAGE_KEY, normalized);
    }
    return normalized;
  } catch {}
  return "Noto Sans JP";
}

function applyToDOM(fontSize: FontSize, japaneseFont: JapaneseFont) {
  const root = document.documentElement;
  root.setAttribute("data-font-size", FONT_SIZE_ATTR_MAP[fontSize]);
  root.setAttribute("data-jp-font", JP_FONT_ATTR_MAP[japaneseFont]);
}

// ─── Provider ────────────────────────────────────────────────────

export function TypographyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontSize, setFontSizeState] = useState<FontSize>(getInitialFontSize);
  const [japaneseFont, setJapaneseFontState] = useState<JapaneseFont>(
    getInitialJapaneseFont,
  );

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    } catch {}
  }, []);

  const setJapaneseFont = useCallback((font: JapaneseFont) => {
    setJapaneseFontState(font);
    try {
      localStorage.setItem(JP_FONT_STORAGE_KEY, font);
    } catch {}
  }, []);

  // Apply data-* attributes whenever values change
  useEffect(() => {
    applyToDOM(fontSize, japaneseFont);
  }, [fontSize, japaneseFont]);

  const value = useMemo(
    () => ({ fontSize, japaneseFont, setFontSize, setJapaneseFont }),
    [fontSize, japaneseFont, setFontSize, setJapaneseFont],
  );

  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
}
