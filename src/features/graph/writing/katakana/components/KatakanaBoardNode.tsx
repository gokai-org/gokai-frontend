"use client";

import { memo } from "react";
import type { CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { LockKeyhole } from "lucide-react";
import type { WritingBoardNodeData } from "../../shared/types";
import { useMasteryTheme } from "@/features/mastery/components/MasteryThemeProvider";

// ── Katakana tile geometry aligned to the visible node silhouette ─────────
const _SX = 84;
const _SY = 77;
const _HALF_W = 36;
const _HALF_H = 48;

const HANDLE_TOP: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY - _HALF_H, left: _SX, transform: "translate(-50%, -50%)",
};
const HANDLE_BOTTOM: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY + _HALF_H, left: _SX, transform: "translate(-50%, -50%)",
};
const HANDLE_LEFT: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY, left: _SX - _HALF_W, transform: "translate(-50%, -50%)",
};
const HANDLE_RIGHT: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY, left: _SX + _HALF_W, transform: "translate(-50%, -50%)",
};

function createGlow(
  innerSize: number,
  outerSize: number,
  innerOpacity: number,
  outerOpacity: number,
  scale: number,
  color: string,
) {
  return `0 0 0 ${innerSize * scale}px rgba(${color},${innerOpacity}), 0 0 ${
    outerSize * scale
  }px rgba(${color},${outerOpacity})`;
}

const GOLD_RGB = "212,168,67";

function getStyles(
  status: WritingBoardNodeData["progress"]["status"],
  selected: boolean,
  glowScale: number,
  shadowScale: number,
  isGolden: boolean,
) {
  if (isGolden) {
    if (status === "available") {
      return {
        glow: selected
          ? createGlow(7, Math.round(19 + shadowScale * 5), 0.14, 0.28, glowScale, GOLD_RGB)
          : createGlow(4, Math.round(14 + shadowScale * 3), 0.10, 0.20, glowScale, GOLD_RGB),
        shapeClass:
          "bg-gradient-to-br from-[#D4A843] to-[#F0D27A] border-white/[0.14] shadow-[0_4px_16px_rgba(212,168,67,0.35)] text-white kanji-node-sphere-available-enter",
        label: "text-content-primary",
      };
    }
    if (status === "completed") {
      return {
        glow: selected
          ? createGlow(8, Math.round(22 + shadowScale * 6), 0.16, 0.32, glowScale, GOLD_RGB)
          : createGlow(3, Math.round(13 + shadowScale * 4), 0.10, 0.20, glowScale, GOLD_RGB),
        shapeClass:
          "bg-gradient-to-br from-[#F0D27A] to-[#B8922E] border-white/[0.18] shadow-[0_4px_20px_rgba(212,168,67,0.42)] text-white kanji-node-sphere-completed-enter",
        label: "text-content-primary",
      };
    }
  }

  // Blue palette: #1B5078 → #2E82B5
  if (status === "available") {
    return {
      glow: selected
        ? createGlow(7, Math.round(19 + shadowScale * 5), 0.09, 0.18, glowScale, "27,80,120")
        : createGlow(4, Math.round(14 + shadowScale * 3), 0.08, 0.14, glowScale, "27,80,120"),
      shapeClass:
        "bg-gradient-to-br from-[#1B5078] to-[#2E82B5] border-white/[0.14] shadow-[0_4px_16px_rgba(27,80,120,0.28)] text-white kanji-node-sphere-available-enter",
      label: "text-content-primary",
    };
  }

  if (status === "completed") {
    return {
      glow: selected
        ? createGlow(8, Math.round(22 + shadowScale * 6), 0.11, 0.22, glowScale, "46,130,181")
        : createGlow(3, Math.round(13 + shadowScale * 4), 0.06, 0.12, glowScale, "46,130,181"),
      shapeClass:
        "bg-gradient-to-br from-[#2E82B5] to-[#4FA8D8] border-white/[0.18] shadow-[0_4px_20px_rgba(46,130,181,0.36)] text-white kanji-node-sphere-completed-enter",
      label: "text-content-primary",
    };
  }

  return {
    glow: selected
      ? createGlow(6, Math.round(17 + shadowScale * 4), 0.07, 0.15, glowScale, "120,112,126")
      : createGlow(2, Math.round(9 + shadowScale * 2), 0.03, 0.07, glowScale, "120,112,126"),
    shapeClass:
      "kanji-node-sphere-locked border-black/[0.06] dark:border-white/[0.06]",
    label: "text-content-secondary",
  };
}

function KatakanaBoardNode({ data }: NodeProps<WritingBoardNodeData>) {
  const { isGolden, phase } = useMasteryTheme();
  const { progress, selected } = data;
  const styles = getStyles(progress.status, selected, data.glowScale, data.shadowScale, isGolden);
  const showPulse = data.shouldUsePulse && selected;
  const unlockRingColor = isGolden ? "rgba(212, 168, 67, 0.64)" : "rgba(27, 80, 120, 0.64)";
  const pointsFloatClass = isGolden
    ? "kanji-node-points-float inline-block whitespace-nowrap rounded-full bg-[#D4A843] px-2.5 py-[3px] text-[11px] font-black text-white shadow-[0_2px_10px_rgba(212,168,67,0.52)]"
    : "kanji-node-points-float inline-block whitespace-nowrap rounded-full bg-[#1B5078] px-2.5 py-[3px] text-[11px] font-black text-white shadow-[0_2px_10px_rgba(27,80,120,0.52)]";
  const shouldShowUnlockPoints =
    data.unlocking &&
    !data.suppressUnlockPoints &&
    phase === "idle" &&
    !isGolden;

  return (
    <>
      {/* Handles */}
      <Handle id="target-top" type="target" position={Position.Top} style={HANDLE_TOP} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} style={HANDLE_BOTTOM} />
      <Handle id="target-left" type="target" position={Position.Left} style={HANDLE_LEFT} />
      <Handle id="target-right" type="target" position={Position.Right} style={HANDLE_RIGHT} />
      <Handle id="source-top" type="source" position={Position.Top} style={HANDLE_TOP} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={HANDLE_BOTTOM} />
      <Handle id="source-left" type="source" position={Position.Left} style={HANDLE_LEFT} />
      <Handle id="source-right" type="source" position={Position.Right} style={HANDLE_RIGHT} />

      <div
        data-help-target={selected ? "writing-focus-node" : undefined}
        data-help-target-priority={selected ? "10" : undefined}
        className="flex h-full w-full flex-col items-center justify-start pt-2"
      >
        <div className="relative flex h-[138px] w-[138px] items-center justify-center">
          {/* Glow / pulse / breathe halo */}
          <div
            className={[
              "absolute inset-0 rounded-full",
              showPulse
                ? "kanji-selected-pulse"
                : progress.status === "available" && !selected
                  ? "kanji-node-available-breathe"
                  : "",
            ].filter(Boolean).join(" ")}
            style={{ boxShadow: styles.glow }}
          />

          {/* Unlock ring */}
          {data.unlocking && data.qualityTier !== "low" && (
            <div
              className="kanji-node-unlock-ring pointer-events-none absolute inset-[18px]"
              style={{ borderColor: unlockRingColor }}
            />
          )}
          {data.unlocking && data.qualityTier === "high" && (
            <div
              className="kanji-node-unlock-ring pointer-events-none absolute inset-[10px]"
              style={{
                animationDelay: "0.22s",
                borderColor: unlockRingColor,
              }}
            />
          )}

          {/* Mahjong rectangular shape */}
          <div
            className={`relative z-10 flex h-[96px] w-[72px] items-center justify-center rounded-xl border font-semibold transition-transform duration-200 hover:scale-[1.03] ${styles.shapeClass}${data.unlocking ? " kanji-node-unlocking" : ""}${data.shaking ? " kanji-node-shaking" : ""}${data.selected && data.drawerOpen ? " kanji-node-drawer-open" : ""}`}
          >
            {progress.status === "locked" ? (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className="text-[28px] leading-none">{progress.symbol}</span>
                <LockKeyhole className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            ) : (
              <span className="text-[40px]">{progress.symbol}</span>
            )}
          </div>

          {/* +5 points float */}
          {shouldShowUnlockPoints && (
            <div className="pointer-events-none absolute top-0 right-0 z-30">
              <span className={pointsFloatClass}>
                +5
              </span>
            </div>
          )}
        </div>

        {/* Label area */}
        <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-content-secondary">
            Katakana {String(progress.index + 1).padStart(2, "0")}
          </span>
          <div className="board-node-label-pill">
            <span className={styles.label}>{progress.romaji}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(KatakanaBoardNode, (prev, next) => {
  return (
    prev.xPos === next.xPos &&
    prev.yPos === next.yPos &&
    prev.data.selected === next.data.selected &&
    prev.data.drawerOpen === next.data.drawerOpen &&
    prev.data.progress.status === next.data.progress.status &&
    prev.data.progress.bestScore === next.data.progress.bestScore &&
    prev.data.progress.romaji === next.data.progress.romaji &&
    prev.data.qualityTier === next.data.qualityTier &&
    prev.data.unlocking === next.data.unlocking &&
    prev.data.suppressUnlockPoints === next.data.suppressUnlockPoints &&
    prev.data.shaking === next.data.shaking &&
    prev.dragging === next.dragging
  );
});
