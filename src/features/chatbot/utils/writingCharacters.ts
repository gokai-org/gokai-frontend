export type JapaneseCharacterType = "hiragana" | "katakana" | "kanji";

export type ExtractedJapaneseCharacter = {
  symbol: string;
  type: JapaneseCharacterType;
  index: number;
};

const JAPANESE_CHARACTER_PATTERN =
  /[\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FFF々〆ヶ]/gu;
const HIRAGANA_PATTERN = /[\u3041-\u3096]/u;
const KATAKANA_PATTERN = /[\u30A1-\u30FA]/u;

export function classifyJapaneseCharacter(
  symbol: string,
): JapaneseCharacterType | null {
  if (HIRAGANA_PATTERN.test(symbol)) {
    return "hiragana";
  }

  if (KATAKANA_PATTERN.test(symbol)) {
    return "katakana";
  }

  if (JAPANESE_CHARACTER_PATTERN.test(symbol)) {
    return "kanji";
  }

  return null;
}

export function hasJapaneseCharacters(text: string) {
  return /[\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FFF々〆ヶ]/u.test(text);
}

export function extractJapaneseCharacters(
  text: string,
  options?: { unique?: boolean },
) {
  const unique = options?.unique ?? true;
  const seen = new Set<string>();
  const extracted: ExtractedJapaneseCharacter[] = [];

  for (const match of text.matchAll(JAPANESE_CHARACTER_PATTERN)) {
    const symbol = match[0];
    if (!symbol) {
      continue;
    }

    if (unique && seen.has(symbol)) {
      continue;
    }

    const type = classifyJapaneseCharacter(symbol);
    if (!type) {
      continue;
    }

    seen.add(symbol);
    extracted.push({
      symbol,
      type,
      index: match.index ?? extracted.length,
    });
  }

  return extracted;
}