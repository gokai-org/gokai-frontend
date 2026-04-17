"use client";

import { memo } from "react";
import type { GrammarBoardCellViewModel } from "../../../types";

type PanelKind = "goal" | "banner" | "wide" | "tower" | "standard";

type BoardCardVariant = {
  bg: string;
  text: string;
  badge: string;
  kanji: string;
  border: string;
};

const UNLOCKED_CARD_VARIANTS: readonly BoardCardVariant[] = [
  {
    bg: "bg-surface-tertiary dark:bg-[#1a1a1a]",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    kanji: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
  },
  {
    bg: "bg-accent/15 dark:bg-accent/20",
    text: "text-content-primary dark:text-white",
    badge: "bg-accent/15 dark:bg-accent/25",
    kanji: "text-accent dark:text-accent",
    border: "border-accent/20 dark:border-accent/25",
  },
  {
    bg: "bg-surface-inset dark:bg-[#202020]",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    kanji: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
  },
  {
    bg: "bg-surface-secondary dark:bg-surface-secondary",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    kanji: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
  },
] as const;

const LOCKED_CARD_VARIANT: BoardCardVariant = {
  bg: "bg-surface-secondary/90 dark:bg-surface-secondary",
  text: "text-content-primary dark:text-white",
  badge: "bg-black/5 dark:bg-white/10",
  kanji: "text-content-primary dark:text-white",
  border: "border-content-primary/10 dark:border-white/10",
};

const CARD_STATE_ACCENTS = {
  active:
    "shadow-[0_20px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_18px_38px_rgba(0,0,0,0.34)]",
  available:
    "shadow-[0_12px_28px_rgba(0,0,0,0.08)]",
  completed:
    "shadow-[0_14px_30px_rgba(0,0,0,0.09)]",
  locked:
    "shadow-[0_10px_22px_rgba(0,0,0,0.06)]",
} as const;

function getPresentationVisualState(cell: GrammarBoardCellViewModel) {
  if (cell.layout.order === 1 && cell.visualState === "active") {
    return "available";
  }

  return cell.visualState;
}

function getCardVariant(cell: GrammarBoardCellViewModel) {
  if (cell.visualState === "locked") {
    return LOCKED_CARD_VARIANT;
  }

  return UNLOCKED_CARD_VARIANTS[
    cell.progress.index % UNLOCKED_CARD_VARIANTS.length
  ];
}

function getShellClass(cell: GrammarBoardCellViewModel) {
  const variant = getCardVariant(cell);
  const visualState = getPresentationVisualState(cell);

  return [
    variant.bg,
    variant.border,
    CARD_STATE_ACCENTS[visualState],
  ].join(" ");
}

function getPanelKind(layout: GrammarBoardCellViewModel["layout"]): PanelKind {
  if (layout.size === "goal") {
    return "goal";
  }

  const aspectRatio = layout.width / layout.height;

  if (aspectRatio >= 2.15) {
    return "banner";
  }

  if (aspectRatio >= 1.35) {
    return "wide";
  }

  if (aspectRatio <= 0.72) {
    return "tower";
  }

  return "standard";
}

function getContentWidthClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "max-w-[88%]";
  }

  if (panelKind === "banner") {
    return "max-w-[90%]";
  }

  if (panelKind === "wide") {
    return "max-w-[92%]";
  }

  if (panelKind === "tower") {
    return "max-w-[94%]";
  }

  return "max-w-[92%]";
}

function getWatermarkFrameClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "left-0 right-0 top-0 bottom-[18%] flex items-start justify-start pl-1 pt-1 sm:pl-2 sm:pt-2";
  }

  if (panelKind === "banner") {
    return "left-0 right-0 top-0 bottom-[12%] flex items-start justify-start pl-1 pt-1 sm:pl-2 sm:pt-2";
  }

  if (panelKind === "wide") {
    return "left-0 right-0 top-0 bottom-[10%] flex items-start justify-start pl-1 pt-1 sm:pl-2 sm:pt-2";
  }

  if (panelKind === "tower") {
    return "left-0 right-0 top-0 bottom-[8%] flex items-start justify-start pl-1 pt-1";
  }

  return "left-0 right-0 top-0 bottom-[10%] flex items-start justify-start pl-1 pt-1 sm:pl-2 sm:pt-2";
}

function getContentPaddingClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "p-4 sm:p-5";
  }

  if (panelKind === "banner") {
    return "p-3.5 sm:p-4";
  }

  if (panelKind === "wide") {
    return "p-3.5";
  }

  if (panelKind === "tower") {
    return "p-2.5";
  }

  return "p-3";
}

function getWatermarkTextClass(
  panelKind: PanelKind,
  visualState: GrammarBoardCellViewModel["visualState"],
  characterCount: number,
  lineCount: number,
) {
  const emphasized = visualState === "active" || visualState === "completed";
  const compact = characterCount >= 5 || lineCount >= 2;

  if (panelKind === "goal") {
    return emphasized
      ? compact
        ? "text-[5.8rem] sm:text-[7.2rem] leading-[0.74] opacity-[0.16] scale-105"
        : "text-[7.4rem] sm:text-[9rem] leading-[0.78] opacity-[0.16] scale-105"
      : compact
        ? "text-[5.2rem] sm:text-[6.6rem] leading-[0.74] opacity-[0.10]"
        : "text-[6.8rem] sm:text-[8.2rem] leading-[0.78] opacity-[0.10]";
  }

  if (panelKind === "banner") {
    return emphasized
      ? compact
        ? "text-[4.4rem] sm:text-[5.6rem] leading-[0.74] opacity-[0.15] scale-105"
        : "text-[5.4rem] sm:text-[6.8rem] leading-[0.78] opacity-[0.15] scale-105"
      : compact
        ? "text-[3.9rem] sm:text-[5rem] leading-[0.74] opacity-[0.09]"
        : "text-[4.8rem] sm:text-[6rem] leading-[0.78] opacity-[0.09]";
  }

  if (panelKind === "wide") {
    return emphasized
      ? compact
        ? "text-[3.5rem] sm:text-[4.2rem] leading-[0.74] opacity-[0.15] scale-105"
        : "text-[4.6rem] sm:text-[5.4rem] leading-[0.78] opacity-[0.15] scale-105"
      : compact
        ? "text-[3.1rem] sm:text-[3.8rem] leading-[0.74] opacity-[0.09]"
        : "text-[4rem] sm:text-[4.8rem] leading-[0.78] opacity-[0.09]";
  }

  if (panelKind === "tower") {
    return emphasized
      ? compact
        ? "text-[2.8rem] leading-[0.72] opacity-[0.14] scale-105"
        : "text-[3.2rem] leading-[0.78] opacity-[0.14] scale-105"
      : compact
        ? "text-[2.4rem] leading-[0.72] opacity-[0.09]"
        : "text-[2.8rem] leading-[0.78] opacity-[0.09]";
  }

  return emphasized
    ? compact
      ? "text-[3.3rem] sm:text-[4rem] leading-[0.74] opacity-[0.15] scale-105"
      : "text-[4.3rem] sm:text-[5rem] leading-[0.78] opacity-[0.15] scale-105"
    : compact
      ? "text-[2.9rem] sm:text-[3.5rem] leading-[0.74] opacity-[0.09]"
      : "text-[3.7rem] sm:text-[4.4rem] leading-[0.78] opacity-[0.09]";
}

function getWatermarkToneClass(cell: GrammarBoardCellViewModel) {
  const variant = getCardVariant(cell);
  const visualState = getPresentationVisualState(cell);

  if (visualState === "locked") {
    return `${variant.kanji} opacity-[0.12] dark:opacity-[0.16]`;
  }

  return `${variant.kanji} ${visualState === "active" ? "opacity-[0.16]" : "opacity-[0.09]"}`;
}

function getOuterCornerClass(order: number) {
  if (order === 1) {
    return "rounded-br-[22px]";
  }

  if (order === 5) {
    return "rounded-bl-[22px]";
  }

  if (order === 9) {
    return "rounded-tl-[22px]";
  }

  if (order === 13) {
    return "rounded-tr-[22px]";
  }

  return "";
}

function getInnerCornerClass(order: number) {
  if (order === 1) {
    return "rounded-br-[21px]";
  }

  if (order === 5) {
    return "rounded-bl-[21px]";
  }

  if (order === 9) {
    return "rounded-tl-[21px]";
  }

  if (order === 13) {
    return "rounded-tr-[21px]";
  }

  return "";
}

function getWatermarkDisplayText(symbol: string, panelKind: PanelKind) {
  const normalized = symbol.replace(/\s+/g, "").trim() || "文法";
  const characters = Array.from(normalized);

  if (normalized.includes("・")) {
    return normalized.split("・").join("\n");
  }

  if (panelKind === "tower" && normalized.length >= 3) {
    return characters.slice(0, 4).join("\n");
  }

  if (panelKind === "goal" && characters.length >= 4) {
    const splitIndex = Math.ceil(characters.length / 2);
    return `${characters.slice(0, splitIndex).join("")}\n${characters.slice(splitIndex, 6).join("")}`;
  }

  if ((panelKind === "standard" || panelKind === "wide") && characters.length >= 4) {
    const splitIndex = Math.min(3, Math.ceil(characters.length / 2));
    return `${characters.slice(0, splitIndex).join("")}\n${characters.slice(splitIndex, 6).join("")}`;
  }

  if (panelKind === "banner" && characters.length >= 5) {
    const splitIndex = Math.ceil(characters.length / 2);
    return `${characters.slice(0, splitIndex).join("")}\n${characters.slice(splitIndex, 6).join("")}`;
  }

  return normalized;
}

function getWatermarkBlockClass(panelKind: PanelKind, lineCount: number) {
  if (panelKind === "goal") {
    return lineCount > 1 ? "max-w-[120%] -translate-x-[3%]" : "max-w-[118%] -translate-x-[2%]";
  }

  if (panelKind === "banner") {
    return lineCount > 1 ? "max-w-[122%] -translate-x-[3%]" : "max-w-[120%] -translate-x-[2%]";
  }

  if (panelKind === "wide") {
    return lineCount > 1 ? "max-w-[122%] -translate-x-[4%]" : "max-w-[118%] -translate-x-[2%]";
  }

  if (panelKind === "tower") {
    return "max-w-[108%] -translate-x-[2%]";
  }

  return lineCount > 1 ? "max-w-[118%] -translate-x-[3%]" : "max-w-[114%] -translate-x-[2%]";
}

function getSpanishTitleClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "text-[0.86rem] sm:text-[0.94rem] leading-[1.15]";
  }

  if (panelKind === "banner") {
    return "text-[0.76rem] sm:text-[0.82rem] leading-[1.15]";
  }

  if (panelKind === "wide") {
    return "text-[0.72rem] sm:text-[0.78rem] leading-[1.16]";
  }

  if (panelKind === "tower") {
    return "text-[0.58rem] leading-[1.14]";
  }

  return "text-[0.68rem] sm:text-[0.74rem] leading-[1.16]";
}

interface GrammarBoardCellProps {
  cell: GrammarBoardCellViewModel;
  onSelect: (lessonId: string, target: HTMLButtonElement | null) => void;
}

function getPointsBadgeText(cell: GrammarBoardCellViewModel) {
  return `${Math.max(cell.progress.pointsToUnlock, 0)}`;
}

interface GrammarBoardCellPointsBadgeProps {
  cell: GrammarBoardCellViewModel;
  left: number;
  top: number;
}

function GrammarBoardCellPointsBadgeComponent({
  cell,
  left,
  top,
}: GrammarBoardCellPointsBadgeProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
      <span
        className="edge-score-label min-w-[52px]"
        style={{
          color: "var(--text-primary)",
        }}
      >
        <span className="edge-score-value">{getPointsBadgeText(cell)}</span>
      </span>
    </div>
  );
}

function GrammarBoardCellComponent({
  cell,
  onSelect,
}: GrammarBoardCellProps) {
  const { layout, progress, interactive } = cell;
  const isComingSoonCell = progress.isMock;
  const panelKind = getPanelKind(layout);
  const variant = getCardVariant(cell);
  const shellClass = getShellClass(cell);
  const presentationVisualState = getPresentationVisualState(cell);
  const watermarkToneClass = getWatermarkToneClass(cell);
  const watermarkText = isComingSoonCell
    ? ""
    : getWatermarkDisplayText(progress.symbol, panelKind);
  const watermarkCharacterCount = progress.symbol.replace(/\s+/g, "").length;
  const watermarkLineCount = watermarkText.split("\n").length;
  const outerCornerClass = getOuterCornerClass(layout.order);
  const innerCornerClass = getInnerCornerClass(layout.order);
  const hoverClass = interactive
    ? "hover:shadow-[0_20px_36px_rgba(0,0,0,0.13)] dark:hover:shadow-[0_20px_36px_rgba(0,0,0,0.40)]"
    : "cursor-default";

  return (
    <div
      data-grammar-board-cell="true"
      className={`group absolute text-left outline-none transition-shadow duration-300 focus-visible:z-20 ${outerCornerClass} ${hoverClass}`}
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        width: `${layout.width}%`,
        height: `${layout.height}%`,
      }}
    >
      <button
        type="button"
        disabled={!interactive}
        onClick={(event) => onSelect(progress.id, event.currentTarget)}
        className={`relative h-full w-full border font-sans ${outerCornerClass} ${shellClass}`}
        aria-label={isComingSoonCell ? "Proximamente" : progress.title}
      >
        <div className={`pointer-events-none absolute inset-0 ${outerCornerClass} bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70`} />
        <div className={`pointer-events-none absolute inset-0 ${outerCornerClass} bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.05),transparent_28%)]`} />
        <div className={`pointer-events-none absolute inset-[1px] border border-white/50 dark:border-white/10 ${innerCornerClass}`} />

        {!isComingSoonCell ? (
          <div
            aria-hidden
            className={`pointer-events-none absolute z-0 overflow-hidden ${getWatermarkFrameClass(panelKind)}`}
          >
            <span
              className={`block select-none whitespace-pre-line font-black tracking-[0.12em] ${getWatermarkBlockClass(panelKind, watermarkLineCount)} ${watermarkToneClass} ${getWatermarkTextClass(panelKind, presentationVisualState, watermarkCharacterCount, watermarkLineCount)}`}
            >
              {watermarkText}
            </span>
          </div>
        ) : null}

        <div className={`relative z-10 flex h-full items-end justify-start ${getContentPaddingClass(panelKind)}`}>
          <div className={`min-w-0 ${getContentWidthClass(panelKind)}`}>
            <h3
              className={`font-semibold tracking-tight [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden [-webkit-line-clamp:3] opacity-85 ${getSpanishTitleClass(panelKind)} ${variant.text}`}
            >
              {isComingSoonCell ? "Proximamente" : progress.title}
            </h3>
          </div>
        </div>
      </button>
    </div>
  );
}

function areCellsEqual(
  previous: Readonly<GrammarBoardCellProps>,
  next: Readonly<GrammarBoardCellProps>,
) {
  const previousCell = previous.cell;
  const nextCell = next.cell;

  return (
    previous.onSelect === next.onSelect &&
    previousCell.visualState === nextCell.visualState &&
    previousCell.interactive === nextCell.interactive &&
    previousCell.progress.id === nextCell.progress.id &&
    previousCell.progress.index === nextCell.progress.index &&
    previousCell.progress.symbol === nextCell.progress.symbol &&
    previousCell.progress.title === nextCell.progress.title &&
    previousCell.progress.pointsToUnlock === nextCell.progress.pointsToUnlock &&
    previousCell.progress.isMock === nextCell.progress.isMock &&
    previousCell.layout.x === nextCell.layout.x &&
    previousCell.layout.y === nextCell.layout.y &&
    previousCell.layout.width === nextCell.layout.width &&
    previousCell.layout.height === nextCell.layout.height &&
    previousCell.layout.size === nextCell.layout.size
  );
}

export const GrammarBoardCell = memo(GrammarBoardCellComponent, areCellsEqual);
export const GrammarBoardCellPointsBadge = memo(GrammarBoardCellPointsBadgeComponent);
