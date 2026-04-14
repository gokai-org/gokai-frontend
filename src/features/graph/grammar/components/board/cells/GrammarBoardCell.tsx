"use client";

import { memo } from "react";
import { LockKeyhole } from "lucide-react";
import type { GrammarBoardCellViewModel } from "../../../types";

type PanelKind = "goal" | "banner" | "wide" | "tower" | "standard";

type PinkCellVariant = {
  shell: string;
  watermark: string;
};

const WATERMARK_CHARACTER_PATTERN =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\u30fc\u3005\u3006\u30f5\u30f6]/g;

const UNLOCKED_PINK_VARIANTS: readonly PinkCellVariant[] = [
  {
    shell:
      "border-[#e9becd]/90 bg-[linear-gradient(145deg,rgba(255,241,246,0.98),rgba(255,248,250,0.98)_56%,rgba(248,223,232,0.96))] dark:border-[#875064]/72 dark:bg-[linear-gradient(145deg,rgba(96,48,63,0.96),rgba(72,35,49,0.96)_56%,rgba(84,42,56,0.95))]",
    watermark: "text-[#c74d71]/34 dark:text-[#ff9fba]/[0.34]",
  },
  {
    shell:
      "border-[#efc5d4]/90 bg-[linear-gradient(145deg,rgba(255,239,245,0.98),rgba(255,247,249,0.98)_56%,rgba(251,227,236,0.96))] dark:border-[#94546c]/72 dark:bg-[linear-gradient(145deg,rgba(107,52,69,0.96),rgba(81,38,55,0.96)_56%,rgba(93,46,62,0.95))]",
    watermark: "text-[#d25d7d]/34 dark:text-[#ffacc1]/[0.34]",
  },
  {
    shell:
      "border-[#e7b6c7]/90 bg-[linear-gradient(145deg,rgba(255,236,242,0.98),rgba(255,244,247,0.98)_56%,rgba(246,217,228,0.96))] dark:border-[#7f4b60]/72 dark:bg-[linear-gradient(145deg,rgba(91,45,60,0.96),rgba(68,33,46,0.96)_56%,rgba(79,40,53,0.95))]",
    watermark: "text-[#be4568]/34 dark:text-[#ff97b3]/[0.34]",
  },
  {
    shell:
      "border-[#f0cad6]/90 bg-[linear-gradient(145deg,rgba(255,243,247,0.98),rgba(255,249,251,0.98)_56%,rgba(252,231,238,0.96))] dark:border-[#9b5c71]/72 dark:bg-[linear-gradient(145deg,rgba(111,58,72,0.96),rgba(85,43,56,0.96)_56%,rgba(97,50,63,0.95))]",
    watermark: "text-[#d96d8c]/34 dark:text-[#ffb6ca]/[0.34]",
  },
  {
    shell:
      "border-[#e4b2c4]/90 bg-[linear-gradient(145deg,rgba(255,234,241,0.98),rgba(255,242,246,0.98)_56%,rgba(245,212,224,0.96))] dark:border-[#7a465b]/72 dark:bg-[linear-gradient(145deg,rgba(87,41,56,0.96),rgba(65,31,43,0.96)_56%,rgba(75,37,50,0.95))]",
    watermark: "text-[#b93d63]/34 dark:text-[#ff8eac]/[0.34]",
  },
  {
    shell:
      "border-[#ecc0cf]/90 bg-[linear-gradient(145deg,rgba(255,240,245,0.98),rgba(255,246,249,0.98)_56%,rgba(249,224,233,0.96))] dark:border-[#8d5568]/72 dark:bg-[linear-gradient(145deg,rgba(101,52,65,0.96),rgba(76,38,50,0.96)_56%,rgba(88,45,58,0.95))]",
    watermark: "text-[#ce5578]/34 dark:text-[#ffa6bc]/[0.34]",
  },
] as const;

const UNLOCKED_STATE_ACCENTS = {
  active:
    "ring-1 ring-white/52 shadow-[0_22px_42px_-26px_rgba(192,57,90,0.24)] dark:ring-white/[0.10] dark:shadow-[0_20px_38px_-24px_rgba(0,0,0,0.44)]",
  available:
    "shadow-[0_16px_30px_-24px_rgba(192,57,90,0.16)] dark:shadow-[0_18px_32px_-24px_rgba(0,0,0,0.42)]",
  completed:
    "shadow-[0_14px_28px_-24px_rgba(192,57,90,0.14)] dark:shadow-[0_16px_28px_-24px_rgba(0,0,0,0.40)] saturate-[0.96]",
} as const;

const STATUS_STYLES = {
  active: {
    shell: "",
    helper:
      "border-slate-200/90 bg-white/86 text-slate-700 dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-slate-100",
    title: "text-slate-950 dark:text-white",
    subtitle: "text-slate-600 dark:text-slate-200/90",
    watermark: "",
    lockBadge:
      "border-slate-200/90 bg-white/86 text-slate-700 dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-slate-100",
  },
  available: {
    shell: "",
    helper:
      "border-slate-200/85 bg-white/82 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200",
    title: "text-slate-900 dark:text-slate-50",
    subtitle: "text-slate-600 dark:text-slate-200/90",
    watermark: "",
    lockBadge:
      "border-slate-200/85 bg-white/82 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200",
  },
  completed: {
    shell: "",
    helper:
      "border-slate-200/85 bg-white/80 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200",
    title: "text-slate-900 dark:text-slate-50",
    subtitle: "text-slate-600 dark:text-slate-200/90",
    watermark: "",
    lockBadge:
      "border-slate-200/85 bg-white/80 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200",
  },
  locked: {
    shell:
      "border-black/[0.06] bg-surface-tertiary shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-white/[0.06] dark:bg-surface-tertiary dark:shadow-none",
    helper:
      "border-black/[0.06] bg-white/74 text-slate-600 dark:border-white/[0.06] dark:bg-black/[0.18] dark:text-slate-200",
    title:
      "text-slate-700 dark:text-[#d1d5db]",
    subtitle:
      "text-slate-500 dark:text-[#9ca3af]",
    watermark:
      "text-[#c0395a]/16 dark:text-[#ff8faa]/[0.18]",
    lockBadge:
      "border-black/[0.06] bg-white/78 text-slate-600 dark:border-white/[0.06] dark:bg-black/[0.22] dark:text-[#d1d5db]",
  },
} as const;

function getUnlockedPinkVariant(index: number) {
  return UNLOCKED_PINK_VARIANTS[index % UNLOCKED_PINK_VARIANTS.length];
}

function getShellClass(cell: GrammarBoardCellViewModel) {
  if (cell.visualState === "locked") {
    return STATUS_STYLES.locked.shell;
  }

  const variant = getUnlockedPinkVariant(cell.progress.index);
  const stateAccent =
    cell.visualState === "active"
      ? UNLOCKED_STATE_ACCENTS.active
      : cell.visualState === "completed"
        ? UNLOCKED_STATE_ACCENTS.completed
        : UNLOCKED_STATE_ACCENTS.available;

  return `${variant.shell} ${stateAccent}`;
}

function getWatermarkToneClass(cell: GrammarBoardCellViewModel) {
  if (cell.visualState === "locked") {
    return STATUS_STYLES.locked.watermark;
  }

  return getUnlockedPinkVariant(cell.progress.index).watermark;
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

function getWatermarkFrameClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "left-[1%] right-[1%] top-[12%]";
  }

  if (panelKind === "banner") {
    return "left-[1%] right-[1%] top-[14%]";
  }

  if (panelKind === "wide") {
    return "left-[1%] right-[1%] top-[14%]";
  }

  if (panelKind === "tower") {
    return "left-[2%] right-[2%] top-[10%]";
  }

  return "left-[1.5%] right-[1.5%] top-[12%]";
}

function getWatermarkCharacterClass(
  panelKind: PanelKind,
  characterCount: number,
) {
  const compact = characterCount >= 5;

  if (panelKind === "goal") {
    return compact
      ? "text-[clamp(3.2rem,6.2vw,5.4rem)] -ml-[0.08em] first:ml-0"
      : "text-[clamp(4.4rem,8.4vw,7.2rem)] -ml-[0.08em] first:ml-0";
  }

  if (panelKind === "banner") {
    return compact
      ? "text-[clamp(2.5rem,4.8vw,3.8rem)] -ml-[0.08em] first:ml-0"
      : "text-[clamp(3.4rem,6.2vw,5rem)] -ml-[0.08em] first:ml-0";
  }

  if (panelKind === "wide") {
    return compact
      ? "text-[clamp(2.3rem,4.2vw,3.4rem)] -ml-[0.08em] first:ml-0"
      : "text-[clamp(3rem,5.4vw,4.3rem)] -ml-[0.08em] first:ml-0";
  }

  if (panelKind === "tower") {
    return compact
      ? "text-[clamp(1.6rem,3vw,2.2rem)] -ml-[0.06em] first:ml-0"
      : "text-[clamp(2rem,3.6vw,2.8rem)] -ml-[0.06em] first:ml-0";
  }

  return compact
    ? "text-[clamp(2rem,3.6vw,2.8rem)] -ml-[0.08em] first:ml-0"
    : "text-[clamp(2.7rem,4.8vw,3.9rem)] -ml-[0.08em] first:ml-0";
}

function getContentWidthClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "max-w-[84%]";
  }

  if (panelKind === "banner") {
    return "max-w-[88%]";
  }

  if (panelKind === "wide") {
    return "max-w-[88%]";
  }

  if (panelKind === "tower") {
    return "max-w-full";
  }

  return "max-w-[90%]";
}

function getTopSpacerClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "h-[30%]";
  }

  if (panelKind === "banner") {
    return "h-[24%]";
  }

  if (panelKind === "wide") {
    return "h-[22%]";
  }

  if (panelKind === "tower") {
    return "h-[18%]";
  }

  return "h-[20%]";
}

function getTitleClass(panelKind: PanelKind) {
  if (panelKind === "goal") {
    return "text-[1.02rem] sm:text-[1.1rem] leading-[1.02] [-webkit-line-clamp:3]";
  }

  if (panelKind === "banner") {
    return "text-[0.94rem] leading-[1.06] [-webkit-line-clamp:2]";
  }

  if (panelKind === "wide") {
    return "text-[0.88rem] leading-[1.08] [-webkit-line-clamp:3]";
  }

  if (panelKind === "tower") {
    return "text-[0.77rem] leading-[1.06] [-webkit-line-clamp:4]";
  }

  return "text-[0.82rem] leading-[1.08] [-webkit-line-clamp:3]";
}

function getContentPaddingClass(panelKind: PanelKind, locked: boolean) {
  if (panelKind === "goal") {
    return locked ? "p-3.5 sm:p-4" : "p-4 sm:p-5";
  }

  if (panelKind === "banner") {
    return locked ? "p-3 sm:p-3.5" : "p-3.5 sm:p-4";
  }

  if (panelKind === "wide") {
    return locked ? "p-3" : "p-3.5";
  }

  if (panelKind === "tower") {
    return locked ? "p-2.5" : "p-3";
  }

  return locked ? "p-2.5" : "p-3";
}

function getWatermarkCharacters(symbol: string) {
  const japaneseCharacters = symbol.match(WATERMARK_CHARACTER_PATTERN)?.join("");
  const normalized = (japaneseCharacters || symbol).replace(/\s+/g, "").trim();
  const source = normalized.length > 0 ? normalized : "文法";

  return Array.from(source).slice(0, 6);
}

interface GrammarBoardCellProps {
  cell: GrammarBoardCellViewModel;
  onSelect: (lessonId: string) => void;
}

function getHelperText(cell: GrammarBoardCellViewModel) {
  const { progress, visualState } = cell;

  if (progress.isMock) {
    return "Contenido en preparacion";
  }

  if (visualState === "locked") {
    return `Necesitas ${progress.pointsToUnlock} pts`;
  }

  if (progress.pointsToUnlock > 0) {
    return `${progress.pointsToUnlock} pts`;
  }

  return "Gratis";
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
  const helperText = getHelperText(cell);
  const styles = STATUS_STYLES[cell.visualState];

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
        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm transition-all duration-500 ${styles.helper}`}
      >
        {helperText}
      </span>
    </div>
  );
}

function GrammarBoardCellComponent({
  cell,
  onSelect,
}: GrammarBoardCellProps) {
  const { layout, progress, visualState, interactive } = cell;
  const panelKind = getPanelKind(layout);
  const isGoal = panelKind === "goal";
  const isTower = panelKind === "tower";
  const isLocked = visualState === "locked";
  const styles = STATUS_STYLES[visualState];
  const watermarkCharacters = getWatermarkCharacters(progress.symbol);
  const helperText = getHelperText(cell);
  const secondaryText = progress.isMock
    ? "Nueva leccion en camino"
    : isGoal
      ? "Meta principal del recorrido"
      : visualState === "completed"
        ? "Lista para repasar"
        : visualState === "active"
          ? "Continua tu avance"
          : "";
  const shellClass = getShellClass(cell);
  const watermarkToneClass = getWatermarkToneClass(cell);
  const hoverClass = interactive
    ? "hover:brightness-[1.03] hover:shadow-[0_26px_46px_-24px_rgba(255,173,196,0.46)] dark:hover:brightness-[1.08] dark:hover:shadow-[0_24px_42px_-24px_rgba(255,173,196,0.20)]"
    : "cursor-default";
  const hoverOverlayClass = interactive
    ? "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.34),rgba(255,255,255,0.14)_38%,transparent_74%)] dark:bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.14),rgba(255,255,255,0.05)_38%,transparent_74%)]"
    : "pointer-events-none absolute inset-0 opacity-0";
  const watermarkMotionClass = interactive
    ? "group-hover:scale-[1.08]"
    : "";
  const contentMotionClass = interactive
    ? "group-hover:scale-[1.035]"
    : "";

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onSelect(progress.id)}
      data-grammar-board-cell="true"
      className={`group absolute text-left outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-slate-500/30 dark:focus-visible:ring-white/15 ${hoverClass}`}
      style={{
        left: `${layout.x}%`,
        top: `${layout.y}%`,
        width: `${layout.width}%`,
        height: `${layout.height}%`,
      }}
      aria-label={progress.title}
    >
      <div className={`relative h-full w-full overflow-hidden border ${shellClass}`}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_38%)] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0)_34%)]" />
        <div className={hoverOverlayClass} />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(17,24,39,0.018),rgba(17,24,39,0.018)_1px,transparent_1px,transparent_8px)] opacity-70 dark:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.015),rgba(255,255,255,0.015)_1px,transparent_1px,transparent_8px)]" />
        <div className="pointer-events-none absolute inset-[1px] border border-white/60 dark:border-black/20" />

        <div
          aria-hidden
          className={`pointer-events-none absolute ${getWatermarkFrameClass(panelKind)}`}
        >
          <div
            className={`flex w-full items-center justify-center overflow-visible whitespace-nowrap transition-transform duration-500 ${watermarkToneClass} ${watermarkMotionClass}`}
          >
            {watermarkCharacters.map((character, index) => (
              <span
                key={`${progress.id}-${index}-${character}`}
                className={`block select-none font-black leading-none tracking-[-0.08em] ${getWatermarkCharacterClass(panelKind, watermarkCharacters.length)}`}
              >
                {character}
              </span>
            ))}
          </div>
        </div>

        <div className={`relative z-10 flex h-full flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${contentMotionClass} ${getContentPaddingClass(panelKind, isLocked)}`}>
          <div aria-hidden className={getTopSpacerClass(panelKind)} />

          {isLocked ? (
            <div className={`min-h-0 ${getContentWidthClass(panelKind)}`}>
              <div className={`mb-3 flex ${isTower ? "justify-center" : "justify-start"}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-sm ${styles.lockBadge}`}>
                  <LockKeyhole className="h-4.5 w-4.5" strokeWidth={2.1} />
                </div>
              </div>

              <h3
                className={`font-extrabold tracking-tight [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden ${getTitleClass(panelKind)} ${styles.title}`}
              >
                {progress.isMock ? "Proximamente" : progress.title}
              </h3>
              <p className={`mt-2 ${isTower ? "text-[10px]" : "text-[11px]"} font-medium leading-[1.18] ${styles.subtitle}`}>
                {progress.isMock ? "Nueva leccion en camino" : helperText}
              </p>
            </div>
          ) : (
            <div className={`min-h-0 ${getContentWidthClass(panelKind)}`}>
              <h3
                className={`font-extrabold tracking-tight [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden ${getTitleClass(panelKind)} ${styles.title}`}
              >
                {progress.title}
              </h3>
              {secondaryText ? (
                <p className={`mt-2 ${isTower ? "text-[10px]" : "text-[11px]"} font-medium leading-[1.18] ${styles.subtitle}`}>
                  {secondaryText}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </button>
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
