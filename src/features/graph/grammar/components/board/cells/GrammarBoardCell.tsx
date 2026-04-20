"use client";

import { memo, type CSSProperties } from "react";
import { getGrammarBoardArtworkPreset } from "../../../constants/grammarBoardBackgrounds";
import type { GrammarBoardCellViewModel } from "../../../types";

type PanelKind = "goal" | "banner" | "wide" | "tower" | "standard";
type ArtworkTone = "paper" | "accent" | "locked";

type BoardCardVariant = {
  bg: string;
  text: string;
  badge: string;
  border: string;
  artTone: ArtworkTone;
};

type ArtworkFitProfile = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  yOffset: number;
  widthScale: number;
  heightScale: number;
  rotationDamping: number;
  hoverScaleMultiplier: number;
};

interface GrammarBoardCellProps {
  cell: GrammarBoardCellViewModel;
  onSelect: (lessonId: string, target: HTMLButtonElement | null) => void;
  isPortrait?: boolean;
  isCompactPortrait?: boolean;
  isTinyPortrait?: boolean;
}

interface GrammarBoardCellPointsBadgeProps {
  cell: GrammarBoardCellViewModel;
  left: number;
  top: number;
  compact?: boolean;
  tiny?: boolean;
}

const UNLOCKED_CARD_VARIANTS: readonly BoardCardVariant[] = [
  {
    bg: "bg-surface-tertiary dark:bg-[#1a1a1a]",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    border: "border-content-primary/10 dark:border-white/10",
    artTone: "paper",
  },
  {
    bg: "bg-accent/15 dark:bg-accent/20",
    text: "text-content-primary dark:text-white",
    badge: "bg-accent/15 dark:bg-accent/25",
    border: "border-accent/20 dark:border-accent/25",
    artTone: "accent",
  },
  {
    bg: "bg-surface-inset dark:bg-[#202020]",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    border: "border-content-primary/10 dark:border-white/10",
    artTone: "paper",
  },
  {
    bg: "bg-surface-secondary dark:bg-surface-secondary",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    border: "border-content-primary/10 dark:border-white/10",
    artTone: "paper",
  },
] as const;

const LOCKED_CARD_VARIANT: BoardCardVariant = {
  bg: "bg-surface-secondary/90 dark:bg-surface-secondary",
  text: "text-content-primary dark:text-white",
  badge: "bg-black/5 dark:bg-white/10",
  border: "border-content-primary/10 dark:border-white/10",
  artTone: "locked",
};

const CARD_STATE_ACCENTS = {
  active:
    "shadow-[0_20px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_18px_38px_rgba(0,0,0,0.34)]",
  available: "shadow-[0_12px_28px_rgba(0,0,0,0.08)]",
  completed: "shadow-[0_14px_30px_rgba(0,0,0,0.09)]",
  locked: "shadow-[0_10px_22px_rgba(0,0,0,0.06)]",
} as const;

const PANEL_ARTWORK_SCALE: Record<
  PanelKind,
  { scaleX: number; scaleY: number; opacity: number }
> = {
  goal: { scaleX: 0.98, scaleY: 0.98, opacity: 0.95 },
  banner: { scaleX: 0.9, scaleY: 0.98, opacity: 0.92 },
  wide: { scaleX: 0.94, scaleY: 0.98, opacity: 0.94 },
  tower: { scaleX: 0.82, scaleY: 1.04, opacity: 0.92 },
  standard: { scaleX: 0.96, scaleY: 0.99, opacity: 0.95 },
};

const PANEL_ARTWORK_FRAME: Record<PanelKind, ArtworkFitProfile> = {
  goal: {
    xMin: 22,
    xMax: 78,
    yMin: 24,
    yMax: 76,
    yOffset: 4,
    widthScale: 0.88,
    heightScale: 0.88,
    rotationDamping: 0.56,
    hoverScaleMultiplier: 1.05,
  },
  banner: {
    xMin: 18,
    xMax: 82,
    yMin: 27,
    yMax: 76,
    yOffset: 5,
    widthScale: 0.9,
    heightScale: 0.9,
    rotationDamping: 0.52,
    hoverScaleMultiplier: 1.05,
  },
  wide: {
    xMin: 18,
    xMax: 82,
    yMin: 27,
    yMax: 78,
    yOffset: 5,
    widthScale: 0.92,
    heightScale: 0.92,
    rotationDamping: 0.54,
    hoverScaleMultiplier: 1.06,
  },
  tower: {
    xMin: 28,
    xMax: 72,
    yMin: 22,
    yMax: 80,
    yOffset: 3,
    widthScale: 0.84,
    heightScale: 1.02,
    rotationDamping: 0.44,
    hoverScaleMultiplier: 1.05,
  },
  standard: {
    xMin: 18,
    xMax: 82,
    yMin: 27,
    yMax: 78,
    yOffset: 5,
    widthScale: 0.92,
    heightScale: 0.92,
    rotationDamping: 0.54,
    hoverScaleMultiplier: 1.06,
  },
};

const ARTWORK_PALETTE_CLASSES: Record<
  ArtworkTone,
  { primary: string; secondary: string; glow: string }
> = {
  paper: {
    primary: "bg-[#5f575225] dark:bg-[#f2eae214]",
    secondary: "bg-[#8b827b16] dark:bg-[#d8cec50c]",
    glow:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.34),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(96,88,82,0.11),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(244,237,230,0.04),transparent_56%)]",
  },
  accent: {
    primary: "bg-[#675a541f] dark:bg-[#d45d551f]",
    secondary: "bg-[#95898314] dark:bg-[#f3a29312]",
    glow:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.3),transparent_40%),radial-gradient(circle_at_78%_16%,rgba(104,93,86,0.12),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_78%_16%,rgba(212,82,79,0.08),transparent_56%)]",
  },
  locked: {
    primary: "bg-[#6259531b] dark:bg-[#d8d0c912]",
    secondary: "bg-[#90867f12] dark:bg-[#ece5df0b]",
    glow:
      "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.3),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(98,89,83,0.09),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_82%_18%,rgba(214,206,198,0.03),transparent_56%)]",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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

  return UNLOCKED_CARD_VARIANTS[cell.progress.index % UNLOCKED_CARD_VARIANTS.length];
}

function getShellClass(cell: GrammarBoardCellViewModel) {
  const variant = getCardVariant(cell);
  const visualState = getPresentationVisualState(cell);

  return [variant.bg, variant.border, CARD_STATE_ACCENTS[visualState]].join(" ");
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

function getContentPaddingClass(
  panelKind: PanelKind,
  isCompactPortrait = false,
  isTinyPortrait = false,
) {
  if (panelKind === "goal") {
    return isTinyPortrait
      ? "p-3"
      : isCompactPortrait
        ? "p-3.5"
        : "p-4 sm:p-5";
  }

  if (panelKind === "banner") {
    return isTinyPortrait
      ? "p-2"
      : isCompactPortrait
        ? "p-2.5"
        : "p-3.5 sm:p-4";
  }

  if (panelKind === "wide") {
    return isTinyPortrait
      ? "p-2"
      : isCompactPortrait
        ? "p-2.5"
        : "p-3.5";
  }

  if (panelKind === "tower") {
    return isTinyPortrait
      ? "p-1.5"
      : isCompactPortrait
        ? "p-2"
        : "p-2.5";
  }

  return isTinyPortrait
    ? "p-2"
    : isCompactPortrait
      ? "p-2.5"
      : "p-3";
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

function resolveCornerClasses(layout: GrammarBoardCellViewModel["layout"]) {
  if (layout.outerCornerClass !== undefined) {
    const outer = layout.outerCornerClass;
    const inner = outer.replace(/22px/g, "21px");
    return { outer, inner };
  }

  return {
    outer: getOuterCornerClass(layout.order),
    inner: getInnerCornerClass(layout.order),
  };
}

function getSpanishTitleClass(
  panelKind: PanelKind,
  isPortrait = false,
  isCompactPortrait = false,
  isTinyPortrait = false,
) {
  if (panelKind === "goal") {
    return isTinyPortrait
      ? "text-[0.68rem] leading-[1.08]"
      : isCompactPortrait
        ? "text-[0.72rem] leading-[1.1]"
        : isPortrait
          ? "text-[0.78rem] leading-[1.12]"
          : "text-[0.82rem] sm:text-[0.9rem] leading-[1.15]";
  }

  if (panelKind === "banner") {
    return isTinyPortrait
      ? "text-[0.56rem] leading-[1.05]"
      : isCompactPortrait
        ? "text-[0.6rem] leading-[1.08]"
        : isPortrait
          ? "text-[0.66rem] leading-[1.1]"
          : "text-[0.72rem] sm:text-[0.78rem] leading-[1.15]";
  }

  if (panelKind === "wide") {
    return isTinyPortrait
      ? "text-[0.54rem] leading-[1.04]"
      : isCompactPortrait
        ? "text-[0.58rem] leading-[1.08]"
        : isPortrait
          ? "text-[0.63rem] leading-[1.1]"
          : "text-[0.69rem] sm:text-[0.75rem] leading-[1.14]";
  }

  if (panelKind === "tower") {
    return isTinyPortrait
      ? "text-[0.46rem] leading-[1.02]"
      : isCompactPortrait
        ? "text-[0.5rem] leading-[1.06]"
        : isPortrait
          ? "text-[0.54rem] leading-[1.08]"
          : "text-[0.56rem] leading-[1.12]";
  }

  return isTinyPortrait
    ? "text-[0.52rem] leading-[1.04]"
    : isCompactPortrait
      ? "text-[0.56rem] leading-[1.08]"
      : isPortrait
        ? "text-[0.62rem] leading-[1.1]"
        : "text-[0.66rem] sm:text-[0.72rem] leading-[1.14]";
}

function getArtworkMaskStyle(asset: number): CSSProperties {
  const imageUrl = `/backgrounds/grammar/${asset}.svg`;

  return {
    WebkitMaskImage: `url(${imageUrl})`,
    maskImage: `url(${imageUrl})`,
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
}

function getArtworkFitProfile(
  layout: GrammarBoardCellViewModel["layout"],
  panelKind: PanelKind,
  isPortrait = false,
  isCompactPortrait = false,
  isTinyPortrait = false,
): ArtworkFitProfile {
  const frame = PANEL_ARTWORK_FRAME[panelKind];

  let fit: ArtworkFitProfile;

  if (layout.height <= 12) {
    fit = {
      ...frame,
      xMin: Math.max(frame.xMin, 24),
      xMax: Math.min(frame.xMax, 76),
      yMin: Math.max(frame.yMin, 36),
      yMax: Math.min(frame.yMax, 64),
      yOffset: 2,
      widthScale: frame.widthScale * 1.08,
      heightScale: frame.heightScale * 0.88,
      rotationDamping: 0.42,
      hoverScaleMultiplier: 1.04,
    };
  } else if (layout.height <= 15) {
    fit = {
      ...frame,
      xMin: Math.max(frame.xMin, 22),
      xMax: Math.min(frame.xMax, 78),
      yMin: Math.max(frame.yMin, 32),
      yMax: Math.min(frame.yMax, 68),
      yOffset: 3,
      widthScale: frame.widthScale * 1.1,
      heightScale: frame.heightScale * 0.9,
      rotationDamping: 0.48,
      hoverScaleMultiplier: 1.05,
    };
  } else if (layout.height <= 20) {
    fit = {
      ...frame,
      yMin: Math.max(frame.yMin, 28),
      yMax: Math.min(frame.yMax, 74),
      yOffset: frame.yOffset + 1,
      widthScale: frame.widthScale * 1.06,
      heightScale: frame.heightScale * 0.92,
      rotationDamping: 0.56,
      hoverScaleMultiplier: 1.07,
    };
  } else {
    fit = {
      ...frame,
      widthScale: frame.widthScale * 1.08,
      heightScale: frame.heightScale * 1.02,
      rotationDamping: 0.62,
      hoverScaleMultiplier: 1.08,
    };
  }

  if (!isPortrait) {
    return fit;
  }

  const xInset = isTinyPortrait ? 5 : isCompactPortrait ? 4 : 2;
  const yInsetTop = isTinyPortrait ? 7 : isCompactPortrait ? 5 : 3;
  const yInsetBottom = isTinyPortrait ? 8 : isCompactPortrait ? 6 : 4;

  return {
    ...fit,
    xMin: Math.max(fit.xMin, frame.xMin + xInset),
    xMax: Math.min(fit.xMax, frame.xMax - xInset),
    yMin: Math.max(fit.yMin, frame.yMin + yInsetTop),
    yMax: Math.min(fit.yMax, frame.yMax - yInsetBottom),
    yOffset: fit.yOffset + (isCompactPortrait ? 2 : 1),
    widthScale: fit.widthScale * (isTinyPortrait ? 1.02 : isCompactPortrait ? 1.04 : 1.06),
    heightScale: fit.heightScale * (layout.height <= 15 ? 0.9 : 0.94),
    rotationDamping: fit.rotationDamping * (isTinyPortrait ? 0.76 : isCompactPortrait ? 0.84 : 0.9),
    hoverScaleMultiplier: fit.hoverScaleMultiplier * (isTinyPortrait ? 1.01 : 1.02),
  };
}

function getArtworkLayerStyle(
  cell: GrammarBoardCellViewModel,
  panelKind: PanelKind,
  layer: "primary" | "echo",
  isPortrait = false,
  isCompactPortrait = false,
  isTinyPortrait = false,
): CSSProperties {
  const preset = getGrammarBoardArtworkPreset(cell.progress.index);
  const panelScale = PANEL_ARTWORK_SCALE[panelKind];
  const fit = getArtworkFitProfile(
    cell.layout,
    panelKind,
    isPortrait,
    isCompactPortrait,
    isTinyPortrait,
  );
  const portraitPattern = cell.progress.index % 4;
  const portraitShiftX = !isPortrait
    ? 0
    : portraitPattern === 0
      ? -7
      : portraitPattern === 1
        ? 6
        : portraitPattern === 2
          ? -3
          : 4;
  const portraitShiftY = !isPortrait
    ? 0
    : portraitPattern === 0
      ? 4
      : portraitPattern === 1
        ? 6
        : portraitPattern === 2
          ? 3
          : 5;
  const compactPortraitShiftX = isTinyPortrait
    ? cell.progress.index % 2 === 0
      ? -2
      : 2
    : 0;
  const compactPortraitShiftY = isTinyPortrait ? 3 : isCompactPortrait ? 2 : 0;
  const shiftX =
    (layer === "echo" ? preset.echoShiftX : 0) + portraitShiftX + compactPortraitShiftX;
  const shiftY =
    (layer === "echo" ? preset.echoShiftY : 0) + portraitShiftY + compactPortraitShiftY;
  const layerScale = layer === "echo" ? preset.echoScale : 1;
  const rotationBase = preset.rotation * fit.rotationDamping;
  const rotation = layer === "echo" ? rotationBase * 0.72 : rotationBase;
  const left = clamp(preset.x + shiftX, fit.xMin, fit.xMax);
  const top = clamp(preset.y + shiftY + fit.yOffset, fit.yMin, fit.yMax);
  const portraitSizeBoost = isTinyPortrait ? 1.02 : isCompactPortrait ? 1.04 : isPortrait ? 1.06 : 1;
  const width = preset.width * fit.widthScale * portraitSizeBoost;
  const height = preset.height * fit.heightScale * (isPortrait ? 0.94 : 1);
  const baseScaleX = panelScale.scaleX * layerScale;
  const baseScaleY = panelScale.scaleY * layerScale;
  const hoverScaleMultiplier =
    layer === "echo" ? fit.hoverScaleMultiplier * 0.96 : fit.hoverScaleMultiplier;
  const baseTransform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${baseScaleX}, ${baseScaleY})`;
  const hoverTransform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${baseScaleX * hoverScaleMultiplier}, ${baseScaleY * hoverScaleMultiplier})`;

  const style: CSSProperties = {
    ...getArtworkMaskStyle(preset.asset),
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    opacity: (layer === "echo" ? preset.opacity * 0.18 : preset.opacity) * panelScale.opacity,
    transformOrigin: "center",
    filter:
      layer === "echo" ? `blur(${Math.max(3, Math.round(preset.blur * 0.35))}px)` : undefined,
  };

  (style as Record<string, string | number | undefined>)["--grammar-artwork-transform"] =
    baseTransform;
  (style as Record<string, string | number | undefined>)["--grammar-artwork-hover-transform"] =
    hoverTransform;

  return style;
}

function getPointsBadgeText(cell: GrammarBoardCellViewModel) {
  return `${Math.max(cell.progress.pointsToUnlock, 0)}`;
}

function GrammarBoardCellPointsBadgeComponent({
  cell,
  left,
  top,
  compact = false,
  tiny = false,
}: GrammarBoardCellPointsBadgeProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 ${tiny ? "scale-[0.82]" : ""}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
      <span
        className={compact ? "edge-score-label edge-score-label--compact" : "edge-score-label min-w-[52px]"}
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
  isPortrait = false,
  isCompactPortrait = false,
  isTinyPortrait = false,
}: GrammarBoardCellProps) {
  const { layout, progress, interactive } = cell;
  const isComingSoonCell = progress.isMock;
  const panelKind = getPanelKind(layout);
  const variant = getCardVariant(cell);
  const shellClass = getShellClass(cell);
  const { outer: outerCornerClass, inner: innerCornerClass } = resolveCornerClasses(layout);
  const artworkPalette = ARTWORK_PALETTE_CLASSES[variant.artTone];
  const primaryArtworkStyle = getArtworkLayerStyle(
    cell,
    panelKind,
    "primary",
    isPortrait,
    isCompactPortrait,
    isTinyPortrait,
  );
  const echoArtworkStyle = getArtworkLayerStyle(
    cell,
    panelKind,
    "echo",
    isPortrait,
    isCompactPortrait,
    isTinyPortrait,
  );
  const hoverEnabled = interactive && !isComingSoonCell;
  const hoverClass = interactive
    ? "hover:shadow-[0_10px_22px_rgba(153,51,49,0.16)] dark:hover:shadow-[0_10px_26px_rgba(153,51,49,0.24)]"
    : "cursor-default";
  const buttonHoverClass = hoverEnabled
    ? "transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:bg-accent hover:border-accent-hover dark:hover:bg-accent dark:hover:border-accent-hover"
    : "";
  const titleHoverClass = hoverEnabled
    ? "origin-left-bottom transition-[transform,color,opacity] duration-300 ease-out group-hover:scale-[1.12] group-hover:text-white dark:group-hover:text-white group-hover:opacity-100"
    : "";
  const artworkHoverClass = hoverEnabled
    ? "transition-[transform,filter] duration-300 ease-out [transform:var(--grammar-artwork-transform)] group-hover:[transform:var(--grammar-artwork-hover-transform)]"
    : "[transform:var(--grammar-artwork-transform)]";
  const artworkToneHoverClass = hoverEnabled
    ? "group-hover:bg-white/18 dark:group-hover:bg-white/18"
    : "";
  const artworkEchoHoverClass = hoverEnabled
    ? "group-hover:bg-white/10 dark:group-hover:bg-white/10"
    : "";

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
        className={`relative h-full w-full border font-sans ${outerCornerClass} ${shellClass} ${buttonHoverClass}`}
        aria-label={isComingSoonCell ? "Proximamente" : progress.title}
      >
        <div className={`pointer-events-none absolute inset-0 ${outerCornerClass} bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70`} />
        <div className={`pointer-events-none absolute inset-0 ${outerCornerClass} bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_92%_14%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_12%_88%,rgba(255,255,255,0.05),transparent_28%)]`} />
        <div className={`pointer-events-none absolute inset-[1px] border border-white/50 dark:border-white/10 ${innerCornerClass}`} />

        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${outerCornerClass}`}
        >
          <div className={`absolute inset-0 ${artworkPalette.glow}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(255,255,255,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_88%_14%,rgba(255,255,255,0.03),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(255,255,255,0.02),transparent_30%)]" />
          <span
            className={`absolute ${artworkPalette.secondary} ${artworkHoverClass} ${artworkEchoHoverClass} mix-blend-multiply dark:mix-blend-screen`}
            style={echoArtworkStyle}
          />
          <span
            className={`absolute ${artworkPalette.primary} ${artworkHoverClass} ${artworkToneHoverClass} mix-blend-multiply dark:mix-blend-screen`}
            style={primaryArtworkStyle}
          />
        </div>

        <div
          className={`relative z-10 flex h-full items-end justify-start ${getContentPaddingClass(panelKind, isCompactPortrait, isTinyPortrait)}`}
        >
          <div className={`min-w-0 ${getContentWidthClass(panelKind)}`}>
            <h3
              className={`font-semibold tracking-tight [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden [-webkit-line-clamp:3] opacity-85 ${getSpanishTitleClass(panelKind, isPortrait, isCompactPortrait, isTinyPortrait)} ${variant.text} ${titleHoverClass}`}
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
    previous.isPortrait === next.isPortrait &&
    previous.isCompactPortrait === next.isCompactPortrait &&
    previous.isTinyPortrait === next.isTinyPortrait &&
    previousCell.visualState === nextCell.visualState &&
    previousCell.interactive === nextCell.interactive &&
    previousCell.progress.id === nextCell.progress.id &&
    previousCell.progress.index === nextCell.progress.index &&
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