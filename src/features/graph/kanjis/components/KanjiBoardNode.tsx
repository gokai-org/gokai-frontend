"use client";

import { memo } from "react";
import type { CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { LockKeyhole, Sparkles } from "lucide-react";
import type { KanjiBoardNodeData } from "../types";

// ── Sphere geometry within the node bounding box (168 × 196) ──────────────
const _SX = 84; // sphere center X
const _SY = 77; // sphere center Y
const _SR = 46; // sphere radius

const HANDLE_TOP: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY - _SR, left: _SX, transform: "translate(-50%, -50%)",
};
const HANDLE_BOTTOM: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY + _SR, left: _SX, transform: "translate(-50%, -50%)",
};
const HANDLE_LEFT: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY, left: _SX - _SR, transform: "translate(-50%, -50%)",
};
const HANDLE_RIGHT: CSSProperties = {
  opacity: 0, width: 6, height: 6, background: "transparent", border: "none",
  top: _SY, left: _SX + _SR, transform: "translate(-50%, -50%)",
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

function getPlanetStyles(
  status: KanjiBoardNodeData["progress"]["status"],
  selected: boolean,
  glowScale: number,
  shadowScale: number,
) {
  if (status === "completed") {
    return {
      glow: selected
        ? createGlow(8, Math.round(22 + shadowScale * 6), 0.11, 0.22, glowScale, "186,72,66")
        : createGlow(3, Math.round(13 + shadowScale * 4), 0.06, 0.12, glowScale, "186,72,66"),
      sphereClass: "bg-gradient-to-br from-[#BA4845] to-[#C85148] border-white/[0.18] shadow-[0_4px_20px_rgba(186,72,66,0.36)] text-white kanji-node-sphere-completed-enter",
      ring: "rgba(186, 72, 66, 0.22)",
      orbit: "rgba(186, 72, 66, 0.36)",
      label: "text-content-primary",
    };
  }

  if (status === "available") {
    return {
      glow: selected
        ? createGlow(7, Math.round(19 + shadowScale * 5), 0.09, 0.18, glowScale, "186,72,66")
        : createGlow(4, Math.round(14 + shadowScale * 3), 0.08, 0.14, glowScale, "186,72,66"),
      sphereClass: "bg-gradient-to-br from-[#993331] to-[#BA5149] border-white/[0.14] shadow-[0_4px_16px_rgba(153,51,49,0.28)] text-white kanji-node-sphere-available-enter",
      ring: "rgba(186, 72, 66, 0.16)",
      orbit: "rgba(186, 72, 66, 0.27)",
      label: "text-content-primary",
    };
  }

  return {
    glow: selected
      ? createGlow(6, Math.round(17 + shadowScale * 4), 0.07, 0.15, glowScale, "120,112,126")
      : createGlow(2, Math.round(9 + shadowScale * 2), 0.03, 0.07, glowScale, "120,112,126"),
    sphereClass: "bg-gradient-to-br from-[#383438] to-[#1C181E] border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.36)] text-white/40",
    ring: "rgba(120, 112, 126, 0.18)",
    orbit: "rgba(120, 112, 126, 0.28)",
    label: "text-content-secondary",
  };
}

function KanjiBoardNode({ data }: NodeProps<KanjiBoardNodeData>) {
  const { progress, selected } = data;
  const styles = getPlanetStyles(
    progress.status,
    selected,
    data.glowScale,
    data.shadowScale,
  );
  const showPulse = data.shouldUsePulse && selected;

  return (
    <>
      <Handle id="target-top"    type="target" position={Position.Top}    style={HANDLE_TOP}    />
      <Handle id="target-bottom" type="target" position={Position.Bottom} style={HANDLE_BOTTOM} />
      <Handle id="target-left"   type="target" position={Position.Left}   style={HANDLE_LEFT}   />
      <Handle id="target-right"  type="target" position={Position.Right}  style={HANDLE_RIGHT}  />
      <Handle id="source-top"    type="source" position={Position.Top}    style={HANDLE_TOP}    />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={HANDLE_BOTTOM} />
      <Handle id="source-left"   type="source" position={Position.Left}   style={HANDLE_LEFT}   />
      <Handle id="source-right"  type="source" position={Position.Right}  style={HANDLE_RIGHT}  />

      <div className="flex h-full w-full flex-col items-center justify-start pt-2">
        <div className="relative flex h-[138px] w-[138px] items-center justify-center">
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

          {data.showOrbitRings ? (
            <>
              <div
                className="absolute inset-[12px] rounded-full border"
                style={{ borderColor: styles.orbit }}
              />

              <div
                className="absolute inset-[24px] rounded-full border"
                style={{ borderColor: styles.ring }}
              />
            </>
          ) : null}

          <div
            className={`relative z-10 flex h-[92px] w-[92px] items-center justify-center rounded-full border text-[42px] font-semibold transition-transform duration-200 hover:scale-[1.03] ${styles.sphereClass}${data.unlocking ? " kanji-node-unlocking" : ""}`}
          >
            <span className={progress.status === "locked" ? "opacity-72" : ""}>
              {progress.kanji.symbol}
            </span>
          </div>

          <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-black/52 text-white/88 dark:border-white/10 dark:bg-black/44 dark:text-white/92">
            {progress.status === "locked" ? (
              <LockKeyhole className="h-3.5 w-3.5" strokeWidth={2.2} />
            ) : progress.status === "completed" ? (
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
            ) : (
              <span className="text-[11px] font-semibold">{progress.bestScore ?? 0}</span>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-content-secondary">
            Kanji {String(progress.index + 1).padStart(2, "0")}
          </span>
          <div className="max-w-[160px] rounded-full border border-black/12 bg-white/98 px-3.5 py-1 text-[12px] font-semibold dark:border-white/18 dark:bg-white/10">
            <span className={styles.label}>{progress.primaryMeaning}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(KanjiBoardNode, (previous, next) => {
  return (
    previous.xPos === next.xPos &&
    previous.yPos === next.yPos &&
    previous.data.selected === next.data.selected &&
    previous.data.progress.status === next.data.progress.status &&
    previous.data.progress.bestScore === next.data.progress.bestScore &&
    previous.data.progress.primaryMeaning === next.data.progress.primaryMeaning &&
    previous.data.qualityTier === next.data.qualityTier &&
    previous.data.unlocking === next.data.unlocking &&
    previous.dragging === next.dragging
  );
});
