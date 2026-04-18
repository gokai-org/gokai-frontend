import type { GrammarBoardSlot } from "../types";

export const GRAMMAR_BOARD_TOTAL = 21;

export const GRAMMAR_BOARD_CANVAS = {
  width: 100,
  height: 100,
} as const;

const GRAMMAR_BOARD_INSET_X = 3.5;
const GRAMMAR_BOARD_INSET_Y = 4.25;
const GRAMMAR_BOARD_VERTICAL_INSET_X = 3.0;
const GRAMMAR_BOARD_VERTICAL_INSET_TOP = 2.5;
const GRAMMAR_BOARD_VERTICAL_INSET_BOTTOM = 2.5;

function applyInset(
  slot: GrammarBoardSlot,
  {
    insetLeft,
    insetRight,
    insetTop,
    insetBottom,
  }: {
    insetLeft: number;
    insetRight: number;
    insetTop: number;
    insetBottom: number;
  },
): GrammarBoardSlot {
  const usableWidth = 100 - insetLeft - insetRight;
  const usableHeight = 100 - insetTop - insetBottom;

  return {
    ...slot,
    x: insetLeft + (slot.x * usableWidth) / 100,
    y: insetTop + (slot.y * usableHeight) / 100,
    width: (slot.width * usableWidth) / 100,
    height: (slot.height * usableHeight) / 100,
  };
}

function applyBoardInset(slot: GrammarBoardSlot): GrammarBoardSlot {
  return applyInset(slot, {
    insetLeft: GRAMMAR_BOARD_INSET_X,
    insetRight: GRAMMAR_BOARD_INSET_X,
    insetTop: GRAMMAR_BOARD_INSET_Y,
    insetBottom: GRAMMAR_BOARD_INSET_Y,
  });
}

function applyVerticalBoardInset(slot: GrammarBoardSlot): GrammarBoardSlot {
  return applyInset(slot, {
    insetLeft: GRAMMAR_BOARD_VERTICAL_INSET_X,
    insetRight: GRAMMAR_BOARD_VERTICAL_INSET_X,
    insetTop: GRAMMAR_BOARD_VERTICAL_INSET_TOP,
    insetBottom: GRAMMAR_BOARD_VERTICAL_INSET_BOTTOM,
  });
}

const GRAMMAR_BASE_SUGOROKU_SLOTS: readonly GrammarBoardSlot[] = [
  {
    order: 1,
    x: 78,
    y: 80,
    width: 22,
    height: 20,
    size: "corner",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 2,
    x: 58,
    y: 80,
    width: 20,
    height: 20,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 3,
    x: 40,
    y: 80,
    width: 18,
    height: 20,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 4,
    x: 18,
    y: 80,
    width: 22,
    height: 20,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 5,
    x: 0,
    y: 80,
    width: 18,
    height: 20,
    size: "corner",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 6,
    x: 0,
    y: 58,
    width: 18,
    height: 22,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 7,
    x: 0,
    y: 38,
    width: 18,
    height: 20,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 8,
    x: 0,
    y: 18,
    width: 18,
    height: 20,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 9,
    x: 0,
    y: 0,
    width: 18,
    height: 18,
    size: "corner",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 10,
    x: 18,
    y: 0,
    width: 20,
    height: 18,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 11,
    x: 38,
    y: 0,
    width: 22,
    height: 18,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 12,
    x: 60,
    y: 0,
    width: 18,
    height: 18,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 13,
    x: 78,
    y: 0,
    width: 22,
    height: 18,
    size: "corner",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 14,
    x: 78,
    y: 18,
    width: 22,
    height: 18,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 15,
    x: 78,
    y: 36,
    width: 22,
    height: 22,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 16,
    x: 78,
    y: 58,
    width: 22,
    height: 22,
    size: "standard",
    routeTier: "outer",
    curveDirection: 0,
  },
  {
    order: 17,
    x: 36,
    y: 60,
    width: 42,
    height: 20,
    size: "standard",
    routeTier: "inner",
    curveDirection: 0,
  },
  {
    order: 18,
    x: 18,
    y: 36,
    width: 18,
    height: 44,
    size: "standard",
    routeTier: "inner",
    curveDirection: 0,
  },
  {
    order: 19,
    x: 18,
    y: 18,
    width: 42,
    height: 18,
    size: "standard",
    routeTier: "inner",
    curveDirection: 0,
  },
  {
    order: 20,
    x: 60,
    y: 18,
    width: 18,
    height: 42,
    size: "standard",
    routeTier: "inner",
    curveDirection: 0,
  },
  {
    order: 21,
    x: 36,
    y: 36,
    width: 24,
    height: 24,
    size: "goal",
    routeTier: "goal",
    curveDirection: 0,
  },
];

export const GRAMMAR_SUGOROKU_SLOTS: readonly GrammarBoardSlot[] =
  GRAMMAR_BASE_SUGOROKU_SLOTS.map(applyBoardInset);

/**
 * Vertical spiral layout for portrait screens (phones / portrait tablets).
 *
 * The path travels clockwise from the outside in:
 *   1→2→3           top row    L→R
 *   4→5→6→7→8→9     right col  T→B
 *   10→11            bottom row R→L
 *   12→13→14→15→16  left col   B→T
 *   17→18→19→20     centre col T→B  (inner ring)
 *   21               goal — centre of the spiral
 *
 * Columns (wider centre, consistent across rows to avoid gaps):
 *   Left   x=0   w=28
 *   Centre x=28  w=44
 *   Right  x=72  w=28
 *
 * Rows (irregular heights, sum=100):
 *   Row 1  y=0   h=11
 *   Row 2  y=11  h=15
 *   Row 3  y=26  h=10
 *   Row 4  y=36  h=14
 *   Row 5  y=50  h=11
 *   Row 6  y=61  h=19  ← goal row — tall, prominent destination
 *   Row 7  y=80  h=20  ← base row — heaviest, grounds the board
 */
const GRAMMAR_BASE_SUGOROKU_SLOTS_VERTICAL: readonly GrammarBoardSlot[] = [
  // ── Row 1 (y=0, h=11) — top of spiral ───────────────────────────────
  { order: 1,  x: 0,  y: 0,  width: 28, height: 11, size: "corner",   routeTier: "outer", curveDirection: 0, outerCornerClass: "rounded-tl-[22px]" },
  { order: 2,  x: 28, y: 0,  width: 44, height: 11, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 3,  x: 72, y: 0,  width: 28, height: 11, size: "corner",   routeTier: "outer", curveDirection: 0, outerCornerClass: "rounded-tr-[22px]" },
  // ── Right col (x=72, w=28) T→B ──────────────────────────────────────
  { order: 4,  x: 72, y: 11, width: 28, height: 15, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 5,  x: 72, y: 26, width: 28, height: 10, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 6,  x: 72, y: 36, width: 28, height: 14, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 7,  x: 72, y: 50, width: 28, height: 11, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 8,  x: 72, y: 61, width: 28, height: 19, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 9,  x: 72, y: 80, width: 28, height: 20, size: "corner",   routeTier: "outer", curveDirection: 0, outerCornerClass: "rounded-br-[22px]" },
  // ── Bottom row (y=80, h=20) R→L — centre + left ─────────────────────
  { order: 10, x: 28, y: 80, width: 44, height: 20, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 11, x: 0,  y: 80, width: 28, height: 20, size: "corner",   routeTier: "outer", curveDirection: 0, outerCornerClass: "rounded-bl-[22px]" },
  // ── Left col (x=0, w=28) B→T ────────────────────────────────────────
  { order: 12, x: 0,  y: 61, width: 28, height: 19, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 13, x: 0,  y: 50, width: 28, height: 11, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 14, x: 0,  y: 36, width: 28, height: 14, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 15, x: 0,  y: 26, width: 28, height: 10, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  { order: 16, x: 0,  y: 11, width: 28, height: 15, size: "standard", routeTier: "outer", curveDirection: 0, outerCornerClass: "" },
  // ── Centre col (x=28, w=44) T→B — inner ring ────────────────────────
  { order: 17, x: 28, y: 11, width: 44, height: 15, size: "standard", routeTier: "inner", curveDirection: 0, outerCornerClass: "" },
  { order: 18, x: 28, y: 26, width: 44, height: 10, size: "standard", routeTier: "inner", curveDirection: 0, outerCornerClass: "" },
  { order: 19, x: 28, y: 36, width: 44, height: 14, size: "standard", routeTier: "inner", curveDirection: 0, outerCornerClass: "" },
  { order: 20, x: 28, y: 50, width: 44, height: 11, size: "standard", routeTier: "inner", curveDirection: 0, outerCornerClass: "" },
  // ── Goal (row 6, centre) — end of spiral, no rounded corners ────────
  { order: 21, x: 28, y: 61, width: 44, height: 19, size: "goal",     routeTier: "goal",  curveDirection: 0, outerCornerClass: "" },
];

export const GRAMMAR_SUGOROKU_SLOTS_VERTICAL: readonly GrammarBoardSlot[] =
  GRAMMAR_BASE_SUGOROKU_SLOTS_VERTICAL.map(applyVerticalBoardInset);
