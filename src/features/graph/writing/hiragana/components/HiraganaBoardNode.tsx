"use client";

import { memo } from "react";
import type { CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { LockKeyhole } from "lucide-react";
import type { WritingBoardNodeData } from "../../shared/types";

// ── Shogi geometry aligned to the visible node silhouette ─────────────────
const _SX = 84;
const _SY = 77;
const _HALF_W = 40;
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

// ── Shogi clip-path (Library ShogiSymbolBox scaled 44×56 → 80×96) ─────────
const SHOGI_CLIP =
  "path('M 33 5 Q 40 0 47 5 L 73 26 Q 80 31 80 39 L 80 86 Q 80 96 69 96 L 11 96 Q 0 96 0 86 L 0 39 Q 0 31 7 26 Z')";

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

function getStyles(
  status: WritingBoardNodeData["progress"]["status"],
  selected: boolean,
  glowScale: number,
  shadowScale: number,
) {
  // Purple palette: #7B3F8A → #A866B5
  if (status === "available") {
    return {
      glow: selected
        ? createGlow(7, Math.round(19 + shadowScale * 5), 0.09, 0.18, glowScale, "123,63,138")
        : createGlow(4, Math.round(14 + shadowScale * 3), 0.08, 0.14, glowScale, "123,63,138"),
      shapeClass:
        "bg-gradient-to-br from-[#7B3F8A] to-[#A866B5] text-white kanji-node-sphere-available-enter",
      dropShadow: "drop-shadow(0 4px 16px rgba(123,63,138,0.28))",
      label: "text-content-primary",
    };
  }

  if (status === "completed") {
    return {
      glow: selected
        ? createGlow(8, Math.round(22 + shadowScale * 6), 0.11, 0.22, glowScale, "168,102,181")
        : createGlow(3, Math.round(13 + shadowScale * 4), 0.06, 0.12, glowScale, "168,102,181"),
      shapeClass:
        "bg-gradient-to-br from-[#A866B5] to-[#C288CC] text-white kanji-node-sphere-completed-enter",
      dropShadow: "drop-shadow(0 4px 20px rgba(168,102,181,0.36))",
      label: "text-content-primary",
    };
  }

  return {
    glow: selected
      ? createGlow(6, Math.round(17 + shadowScale * 4), 0.07, 0.15, glowScale, "120,112,126")
      : createGlow(2, Math.round(9 + shadowScale * 2), 0.03, 0.07, glowScale, "120,112,126"),
    shapeClass: "kanji-node-sphere-locked",
    dropShadow: "drop-shadow(0 1px 3px rgba(0,0,0,0.06))",
    label: "text-content-secondary",
  };
}

function HiraganaBoardNode({ data }: NodeProps<WritingBoardNodeData>) {
  const { progress, selected } = data;
  const styles = getStyles(progress.status, selected, data.glowScale, data.shadowScale);
  const showPulse = data.shouldUsePulse && selected;

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

      <div className="flex h-full w-full flex-col items-center justify-start pt-2">
        <div className="relative flex h-[138px] w-[138px] items-center justify-center">
          {/* Glow / pulse / breathe halo — circular behind the shogi shape */}
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
              style={{ borderColor: "rgba(123, 63, 138, 0.64)" }}
            />
          )}
          {data.unlocking && data.qualityTier === "high" && (
            <div
              className="kanji-node-unlock-ring pointer-events-none absolute inset-[10px]"
              style={{
                animationDelay: "0.22s",
                borderColor: "rgba(123, 63, 138, 0.64)",
              }}
            />
          )}

          {/* Shogi-shaped symbol container */}
          <div
            className="relative z-10"
            style={{ filter: styles.dropShadow }}
          >
            <div
              className={`flex h-[96px] w-[80px] items-center justify-center font-semibold transition-transform duration-200 hover:scale-[1.03] ${styles.shapeClass}${data.unlocking ? " kanji-node-unlocking" : ""}${data.shaking ? " kanji-node-shaking" : ""}`}
              style={{ clipPath: SHOGI_CLIP }}
            >
              {progress.status === "locked" ? (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <span className="text-[28px] leading-none opacity-40">{progress.symbol}</span>
                  <LockKeyhole className="h-3.5 w-3.5 opacity-45" strokeWidth={2} />
                </div>
              ) : (
                <span className="text-[40px]">{progress.symbol}</span>
              )}
            </div>
          </div>

          {/* +5 points float */}
          {data.unlocking && (
            <div className="pointer-events-none absolute top-0 right-0 z-30">
              <span className="kanji-node-points-float inline-block whitespace-nowrap rounded-full bg-[#7B3F8A] px-2.5 py-[3px] text-[11px] font-black text-white shadow-[0_2px_10px_rgba(123,63,138,0.52)]">
                +5
              </span>
            </div>
          )}
        </div>

        {/* Label area */}
        <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-content-secondary">
            Hiragana {String(progress.index + 1).padStart(2, "0")}
          </span>
          <div className="board-node-label-pill">            
            <span className={styles.label}>{progress.romaji}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(HiraganaBoardNode, (prev, next) => {
  return (
    prev.xPos === next.xPos &&
    prev.yPos === next.yPos &&
    prev.data.selected === next.data.selected &&
    prev.data.progress.status === next.data.progress.status &&
    prev.data.progress.bestScore === next.data.progress.bestScore &&
    prev.data.progress.romaji === next.data.progress.romaji &&
    prev.data.qualityTier === next.data.qualityTier &&
    prev.data.unlocking === next.data.unlocking &&
    prev.data.shaking === next.data.shaking &&
    prev.dragging === next.dragging
  );
});
