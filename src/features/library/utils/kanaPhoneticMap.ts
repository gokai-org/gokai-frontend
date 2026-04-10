// ─── Phonetic table structure ─────────────────────────────────────────────────

export interface PhoneticRow {
  key: string;
  label: string;
}

export const PHONETIC_ROWS: PhoneticRow[] = [
  { key: "vowels",  label: "Vocales" },
  { key: "k",       label: "K"  },
  { key: "s",       label: "S"  },
  { key: "t",       label: "T"  },
  { key: "n",       label: "N"  },
  { key: "h",       label: "H"  },
  { key: "m",       label: "M"  },
  { key: "y",       label: "Y"  },
  { key: "r",       label: "R"  },
  { key: "w",       label: "W"  },
  { key: "n-solo",  label: "N"       },
  { key: "g",       label: "G"  },
  { key: "z",       label: "Z"  },
  { key: "d",       label: "D"  },
  { key: "b",       label: "B"  },
  { key: "p",       label: "P"  },
];

/** Column labels (index 0..4 = A, I, U, E, O) */
export const PHONETIC_COLS = ["A", "I", "U", "E", "O"] as const;

/** Row keys that belong to the dakuten / handakuten block */
export const DAKUTEN_ROW_KEYS = new Set(["g", "z", "d", "b", "p"]);

// ─── Position resolver ────────────────────────────────────────────────────────

const VOWEL_INDEX: Record<string, number> = { a: 0, i: 1, u: 2, e: 3, o: 4 };

/** Explicit overrides for multi-char or non-obvious romaji */
const SPECIAL_MAP: Record<string, { rowKey: string; colIndex: number }> = {
  shi: { rowKey: "s", colIndex: 1 },
  chi: { rowKey: "t", colIndex: 1 },
  tsu: { rowKey: "t", colIndex: 2 },
  fu:  { rowKey: "h", colIndex: 2 },
  ji:  { rowKey: "z", colIndex: 1 },
  zu:  { rowKey: "z", colIndex: 2 },
  di:  { rowKey: "d", colIndex: 1 },
  du:  { rowKey: "d", colIndex: 2 },
  wi:  { rowKey: "w", colIndex: 1 },
  we:  { rowKey: "w", colIndex: 3 },
};

/**
 * Resolves the `rowKey` (consonant group) and `colIndex` (A=0…O=4)
 * for a given romaji string. Returns null if the position cannot be
 * determined (e.g. unknown or empty romaji).
 */
export function getPhoneticPosition(
  romaji: string,
): { rowKey: string; colIndex: number } | null {
  const r = romaji.toLowerCase().trim();
  if (!r) return null;

  // Standalone N (ん / ン)
  if (r === "n") return { rowKey: "n-solo", colIndex: 0 };

  // Pure vowels
  const vowelIdx = VOWEL_INDEX[r];
  if (vowelIdx !== undefined) return { rowKey: "vowels", colIndex: vowelIdx };

  // Multi-char / irregular romaji
  if (SPECIAL_MAP[r]) return SPECIAL_MAP[r];

  // Generic: last char = vowel, leading char = consonant row key
  const vowel = r.slice(-1);
  const colIndex = VOWEL_INDEX[vowel];
  if (colIndex === undefined) return null;

  const rowKey = r[0];
  return { rowKey, colIndex };
}

// ─── Table builder ────────────────────────────────────────────────────────────

/** 2-D map: rowKey → colIndex → kana item */
export type PhoneticTable<T> = Map<string, Map<number, T>>;

/**
 * Groups an array of kana-like items into a 2-D phonetic table.
 * Works with any type that has an optional `romaji` string field.
 */
export function buildPhoneticTable<T extends { romaji?: string }>(
  kanas: T[],
): PhoneticTable<T> {
  const table: PhoneticTable<T> = new Map();
  for (const kana of kanas) {
    const pos = getPhoneticPosition(kana.romaji ?? "");
    if (!pos) continue;
    if (!table.has(pos.rowKey)) table.set(pos.rowKey, new Map());
    table.get(pos.rowKey)!.set(pos.colIndex, kana);
  }
  return table;
}
