const NEUTRAL_WRITING_ACCENT = "#64748b";

const SCRIPT_ACCENT_CSS_VARIABLES = {
  hiragana: "--hiragana-edge-available-stroke",
  katakana: "--katakana-edge-available-stroke",
  kanji: "--kanji-edge-available-stroke",
} as const;

const SCRIPT_ACCENT_FALLBACKS = {
  hiragana: "#7B3F8A",
  katakana: "#1B5078",
  kanji: "#BA4845",
} as const;

function rgbaStringToRgba(source: string, alpha: number) {
  const matches = source.match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length < 3) {
    return null;
  }

  const [red, green, blue] = matches;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function hexToRgba(hex: string | undefined, alpha: number) {
  const source =
    hex && hex.trim().length > 0 ? hex.trim() : NEUTRAL_WRITING_ACCENT;

  if (/^rgba?\(/i.test(source)) {
    return rgbaStringToRgba(source, alpha) ?? `rgba(100, 116, 139, ${alpha})`;
  }

  if (!/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(source)) {
    return `rgba(100, 116, 139, ${alpha})`;
  }

  const normalized =
    source.length === 4
      ? `#${source[1]}${source[1]}${source[2]}${source[2]}${source[3]}${source[3]}`
      : source;
  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function resolveWritingAccentColor(
  scriptType: keyof typeof SCRIPT_ACCENT_CSS_VARIABLES,
) {
  if (typeof document === "undefined") {
    return SCRIPT_ACCENT_FALLBACKS[scriptType];
  }

  const cssVariableName = SCRIPT_ACCENT_CSS_VARIABLES[scriptType];
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVariableName)
    .trim();

  return resolved || SCRIPT_ACCENT_FALLBACKS[scriptType];
}

export function getWritingPalette(accentColor?: string) {
  const accent = accentColor ?? NEUTRAL_WRITING_ACCENT;

  return {
    accent,
    soft: hexToRgba(accent, 0.08),
    softStrong: hexToRgba(accent, 0.14),
    ring: hexToRgba(accent, 0.26),
    ringStrong: hexToRgba(accent, 0.38),
    borderSoft: hexToRgba(accent, 0.18),
    borderStrong: hexToRgba(accent, 0.35),
    glow: hexToRgba(accent, 0.38),
    paperLine: hexToRgba(accent, 0.14),
    paperMargin: hexToRgba(accent, 0.28),
    symbolSoft: hexToRgba(accent, 0.34),
    symbolMuted: hexToRgba(accent, 0.68),
  };
}