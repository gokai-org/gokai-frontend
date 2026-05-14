import { HIRAGANA_DATA } from "@/features/graph/writing/hiragana/mock/data";
import { KATAKANA_DATA } from "@/features/graph/writing/katakana/mock/data";
import type { KanaListItemResponse, KanaListResponse } from "@/features/kana/types";

export type KanaLearningScript = "hiragana" | "katakana";

export type KanaLearningInfo = {
  symbol: string;
  script: KanaLearningScript;
  boardNumber: number;
  label: string;
  libraryHref: string;
  description: string;
};

export type KanaSymbolGuideInfo = {
  title: string;
  description: string;
  libraryHref?: string;
  actionLabel?: string;
};

export type KanaCatalogState = {
  hiraganaBySymbol: Map<string, KanaLearningInfo>;
  katakanaBySymbol: Map<string, KanaLearningInfo>;
};

const SMALL_KANA_BASE: Record<string, string> = {
  "ぁ": "あ",
  "ぃ": "い",
  "ぅ": "う",
  "ぇ": "え",
  "ぉ": "お",
  "っ": "つ",
  "ゃ": "や",
  "ゅ": "ゆ",
  "ょ": "よ",
  "ゎ": "わ",
  "ァ": "ア",
  "ィ": "イ",
  "ゥ": "ウ",
  "ェ": "エ",
  "ォ": "オ",
  "ッ": "ツ",
  "ャ": "ヤ",
  "ュ": "ユ",
  "ョ": "ヨ",
  "ヮ": "ワ",
};

const HIRAGANA_BOARD_NUMBER = new Map(
  HIRAGANA_DATA.map((kana, index) => [kana.symbol, index + 1]),
);

const KATAKANA_BOARD_NUMBER = new Map(
  KATAKANA_DATA.map((kana, index) => [kana.symbol, index + 1]),
);

const VOICED_KANA_BASE: Record<string, string> = {
  "が": "か",
  "ぎ": "き",
  "ぐ": "く",
  "げ": "け",
  "ご": "こ",
  "ざ": "さ",
  "じ": "し",
  "ず": "す",
  "ぜ": "せ",
  "ぞ": "そ",
  "だ": "た",
  "ぢ": "ち",
  "づ": "つ",
  "で": "て",
  "ど": "と",
  "ば": "は",
  "び": "ひ",
  "ぶ": "ふ",
  "べ": "へ",
  "ぼ": "ほ",
  "ぱ": "は",
  "ぴ": "ひ",
  "ぷ": "ふ",
  "ぺ": "へ",
  "ぽ": "ほ",
  "ガ": "カ",
  "ギ": "キ",
  "グ": "ク",
  "ゲ": "ケ",
  "ゴ": "コ",
  "ザ": "サ",
  "ジ": "シ",
  "ズ": "ス",
  "ゼ": "セ",
  "ゾ": "ソ",
  "ダ": "タ",
  "ヂ": "チ",
  "ヅ": "ツ",
  "デ": "テ",
  "ド": "ト",
  "バ": "ハ",
  "ビ": "ヒ",
  "ブ": "フ",
  "ベ": "ヘ",
  "ボ": "ホ",
  "パ": "ハ",
  "ピ": "ヒ",
  "プ": "フ",
  "ペ": "ヘ",
  "ポ": "ホ",
};

const SPECIAL_SYMBOL_GUIDES: Record<string, KanaSymbolGuideInfo> = {
  "ー": {
    title: "Marca de vocal larga",
    description:
      "Este simbolo se llama choonpu. En katakana y palabras extendidas alarga el sonido de la vocal anterior.",
  },
  "・": {
    title: "Punto medio japones",
    description:
      "Este signo se llama nakaguro. Se usa para separar palabras, nombres extranjeros o elementos dentro de una misma expresion.",
  },
  "々": {
    title: "Marca de repeticion",
    description:
      "Este signo repite el kanji anterior. No es un kana independiente; indica que el caracter previo se lee otra vez.",
  },
  "ゝ": {
    title: "Repeticion de hiragana",
    description:
      "Esta marca repite el hiragana anterior sin dakuten. Es un signo ortografico, no una casilla propia de la tabla fonetica.",
  },
  "ゞ": {
    title: "Repeticion con dakuten",
    description:
      "Esta marca repite el hiragana anterior aplicando sonorizacion. Se usa en escritura tradicional y nombres concretos.",
  },
  "ヽ": {
    title: "Repeticion de katakana",
    description:
      "Esta marca repite el katakana anterior sin dakuten. Es un signo ortografico especial, no un kana nuevo.",
  },
  "ヾ": {
    title: "Repeticion de katakana con dakuten",
    description:
      "Esta marca repite el katakana anterior con sonorizacion. Aparece sobre todo en usos tradicionales o estilizados.",
  },
  "ヶ": {
    title: "Katakana pequeno ケ",
    description:
      "Este simbolo suele leerse como particula abreviada en toponimos, contadores o expresiones fijas. No se aprende como una casilla fonetica independiente.",
  },
  "ヵ": {
    title: "Katakana pequeno カ",
    description:
      "Se usa en abreviaciones y contadores. Funciona como variante tipografica, no como un kana nuevo dentro de la tabla fonetica.",
  },
  "〜": {
    title: "Guion de extension",
    description:
      "Este signo alarga o suaviza el tono en escritura informal. No pertenece a la tabla fonetica como kana independiente.",
  },
  "～": {
    title: "Guion de extension",
    description:
      "Este signo alarga o suaviza el tono en escritura informal. No pertenece a la tabla fonetica como kana independiente.",
  },
};

function buildFallbackKanaInfo(
  symbol: string,
  script: KanaLearningScript,
  boardNumber: number,
  lookupSymbol?: string,
  note?: string,
): KanaLearningInfo {
  const label = `${script === "hiragana" ? "Hiragana" : "Katakana"} ${String(boardNumber).padStart(2, "0")}`;

  return {
    symbol,
    script,
    boardNumber,
    label,
    libraryHref: `/dashboard/library?category=${script}&symbol=${encodeURIComponent(lookupSymbol ?? symbol)}`,
    description: note
      ? `${note} Se referencia junto a ${label}.`
      : `Se aprende en ${label} dentro de la tabla fonetica.`,
  };
}

function buildCatalogInfoMap(
  kanaList: KanaListItemResponse[],
  script: KanaLearningScript,
) {
  return new Map(
    kanaList.map((kana, index) => [
      kana.symbol,
      buildFallbackKanaInfo(
        kana.symbol,
        script,
        index + 1,
        kana.symbol,
        `Este kana tiene su propia posicion en la tabla fonetica${kana.romaji ? ` (${kana.romaji}).` : "."}`,
      ),
    ]),
  );
}

function getFallbackKanaLearningInfo(symbol: string): KanaLearningInfo | null {
  const baseSymbol = SMALL_KANA_BASE[symbol] ?? VOICED_KANA_BASE[symbol] ?? symbol;
  const hiraganaBoardNumber = HIRAGANA_BOARD_NUMBER.get(baseSymbol);

  if (hiraganaBoardNumber) {
    const note =
      symbol !== baseSymbol
        ? SMALL_KANA_BASE[symbol]
          ? `${symbol} es un kana pequeno derivado de ${baseSymbol}.`
          : `${symbol} es una variante sonorizada relacionada con ${baseSymbol}.`
        : undefined;

    return buildFallbackKanaInfo(symbol, "hiragana", hiraganaBoardNumber, baseSymbol, note);
  }

  const katakanaBoardNumber = KATAKANA_BOARD_NUMBER.get(baseSymbol);
  if (katakanaBoardNumber) {
    const note =
      symbol !== baseSymbol
        ? SMALL_KANA_BASE[symbol]
          ? `${symbol} es un kana pequeno derivado de ${baseSymbol}.`
          : `${symbol} es una variante sonorizada relacionada con ${baseSymbol}.`
        : undefined;

    return buildFallbackKanaInfo(symbol, "katakana", katakanaBoardNumber, baseSymbol, note);
  }

  return null;
}

export function buildKanaCatalogState(
  catalog: Partial<KanaListResponse> | null | undefined,
): KanaCatalogState {
  return {
    hiraganaBySymbol: buildCatalogInfoMap(catalog?.hiragana ?? [], "hiragana"),
    katakanaBySymbol: buildCatalogInfoMap(catalog?.katakana ?? [], "katakana"),
  };
}

export function getKanaSymbolGuideInfo(
  symbol: string,
  kanaCatalog: KanaCatalogState | null,
): KanaSymbolGuideInfo {
  const exactInfo =
    kanaCatalog?.hiraganaBySymbol.get(symbol) ??
    kanaCatalog?.katakanaBySymbol.get(symbol) ??
    getFallbackKanaLearningInfo(symbol);

  if (exactInfo) {
    return {
      title: `${symbol} · ${exactInfo.label}`,
      description: exactInfo.description,
      libraryHref: exactInfo.libraryHref,
      actionLabel: "Ver tabla fonetica",
    };
  }

  const specialInfo = SPECIAL_SYMBOL_GUIDES[symbol];
  if (specialInfo) {
    return specialInfo;
  }

  return {
    title: `${symbol} · Simbolo de apoyo`,
    description:
      "Este caracter no forma una casilla independiente de hiragana o katakana. Se usa como apoyo ortografico dentro de la palabra.",
  };
}