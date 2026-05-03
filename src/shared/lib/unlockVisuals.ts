import type { CSSProperties } from "react";

export type UnlockVisualTone =
  | "kanji"
  | "hiragana"
  | "katakana"
  | "grammar"
  | "gold";

type UnlockVisualPalette = {
  rgb: string;
  from: string;
  to: string;
};

const UNLOCK_VISUAL_PALETTES: Record<UnlockVisualTone, UnlockVisualPalette> = {
  kanji: {
    rgb: "186,72,69",
    from: "#993331",
    to: "#BA5149",
  },
  hiragana: {
    rgb: "123,63,138",
    from: "#7B3F8A",
    to: "#A866B5",
  },
  katakana: {
    rgb: "27,80,120",
    from: "#1B5078",
    to: "#2E82B5",
  },
  grammar: {
    rgb: "186,72,69",
    from: "#993331",
    to: "#BA5149",
  },
  gold: {
    rgb: "212,168,67",
    from: "#D4A843",
    to: "#F0D27A",
  },
};

export function getUnlockVisualVars(tone: UnlockVisualTone): CSSProperties {
  const palette = UNLOCK_VISUAL_PALETTES[tone];

  return {
    "--gokai-unlock-rgb": palette.rgb,
    "--gokai-unlock-from": palette.from,
    "--gokai-unlock-to": palette.to,
  } as CSSProperties;
}