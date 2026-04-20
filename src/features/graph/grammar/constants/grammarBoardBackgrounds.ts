export interface GrammarBoardArtworkPreset {
  asset: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  echoShiftX: number;
  echoShiftY: number;
  echoScale: number;
  blur: number;
}

const GRAMMAR_BOARD_ARTWORK_PRESETS: readonly GrammarBoardArtworkPreset[] = [
  { asset: 1, x: 77, y: 28, width: 74, height: 94, rotation: -18, opacity: 0.92, echoShiftX: -7, echoShiftY: 13, echoScale: 1.14, blur: 13 },
  { asset: 2, x: 23, y: 73, width: 76, height: 96, rotation: 17, opacity: 0.88, echoShiftX: 10, echoShiftY: -10, echoScale: 1.1, blur: 12 },
  { asset: 3, x: 78, y: 68, width: 72, height: 88, rotation: -8, opacity: 0.9, echoShiftX: -8, echoShiftY: -6, echoScale: 1.08, blur: 11 },
  { asset: 4, x: 28, y: 25, width: 70, height: 92, rotation: 22, opacity: 0.86, echoShiftX: 9, echoShiftY: 11, echoScale: 1.12, blur: 14 },
  { asset: 5, x: 71, y: 77, width: 80, height: 100, rotation: -14, opacity: 0.9, echoShiftX: -10, echoShiftY: -12, echoScale: 1.16, blur: 14 },
  { asset: 6, x: 63, y: 24, width: 68, height: 82, rotation: 12, opacity: 0.84, echoShiftX: -11, echoShiftY: 8, echoScale: 1.08, blur: 10 },
  { asset: 7, x: 36, y: 77, width: 82, height: 102, rotation: -24, opacity: 0.9, echoShiftX: 8, echoShiftY: -9, echoScale: 1.12, blur: 12 },
  { asset: 8, x: 51, y: 21, width: 74, height: 88, rotation: 6, opacity: 0.84, echoShiftX: 0, echoShiftY: 12, echoScale: 1.14, blur: 13 },
  { asset: 9, x: 18, y: 51, width: 66, height: 86, rotation: 28, opacity: 0.82, echoShiftX: 11, echoShiftY: 0, echoScale: 1.1, blur: 11 },
  { asset: 10, x: 82, y: 78, width: 76, height: 92, rotation: -12, opacity: 0.88, echoShiftX: -12, echoShiftY: -11, echoScale: 1.13, blur: 13 },
  { asset: 11, x: 79, y: 34, width: 64, height: 88, rotation: -26, opacity: 0.86, echoShiftX: -8, echoShiftY: 14, echoScale: 1.1, blur: 12 },
  { asset: 12, x: 34, y: 55, width: 72, height: 90, rotation: 11, opacity: 0.87, echoShiftX: 9, echoShiftY: -4, echoScale: 1.08, blur: 10 },
  { asset: 13, x: 68, y: 63, width: 82, height: 104, rotation: -7, opacity: 0.9, echoShiftX: -7, echoShiftY: -12, echoScale: 1.15, blur: 14 },
  { asset: 14, x: 26, y: 32, width: 74, height: 96, rotation: 18, opacity: 0.86, echoShiftX: 12, echoShiftY: 10, echoScale: 1.11, blur: 12 },
  { asset: 15, x: 54, y: 54, width: 84, height: 108, rotation: -18, opacity: 0.88, echoShiftX: -10, echoShiftY: 8, echoScale: 1.12, blur: 14 },
  { asset: 16, x: 73, y: 20, width: 76, height: 86, rotation: 14, opacity: 0.84, echoShiftX: -11, echoShiftY: 11, echoScale: 1.09, blur: 11 },
  { asset: 17, x: 22, y: 58, width: 80, height: 104, rotation: 24, opacity: 0.9, echoShiftX: 10, echoShiftY: -8, echoScale: 1.14, blur: 14 },
  { asset: 18, x: 50, y: 78, width: 78, height: 96, rotation: -4, opacity: 0.84, echoShiftX: 0, echoShiftY: -12, echoScale: 1.12, blur: 12 },
  { asset: 19, x: 31, y: 22, width: 78, height: 100, rotation: 20, opacity: 0.88, echoShiftX: 11, echoShiftY: 13, echoScale: 1.1, blur: 13 },
  { asset: 20, x: 81, y: 50, width: 70, height: 98, rotation: -28, opacity: 0.86, echoShiftX: -12, echoShiftY: 0, echoScale: 1.13, blur: 12 },
  { asset: 21, x: 54, y: 30, width: 86, height: 106, rotation: -10, opacity: 0.92, echoShiftX: -5, echoShiftY: 14, echoScale: 1.16, blur: 15 },
] as const;

export function getGrammarBoardArtworkPreset(index: number): GrammarBoardArtworkPreset {
  return GRAMMAR_BOARD_ARTWORK_PRESETS[
    ((index % GRAMMAR_BOARD_ARTWORK_PRESETS.length) + GRAMMAR_BOARD_ARTWORK_PRESETS.length) %
      GRAMMAR_BOARD_ARTWORK_PRESETS.length
  ];
}