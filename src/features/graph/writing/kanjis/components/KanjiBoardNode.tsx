"use client";

import { memo } from "react";
import type { CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { LockKeyhole } from "lucide-react";
import type { KanjiBoardNodeData } from "../types";

// ── Sphere geometry within the node bounding box (168 × 196) ──────────────
const _SX = 84; // sphere center X
const _SY = 77; // sphere center Y
const _SR = 46; // sphere radius

const HANDLE_TOP: CSSProperties = {
  opacity: 0,
  width: 6,
  height: 6,
  background: "transparent",
  border: "none",
  top: _SY - _SR,
  left: _SX,
  transform: "translate(-50%, -50%)",
};
const HANDLE_BOTTOM: CSSProperties = {
  opacity: 0,
  width: 6,
  height: 6,
  background: "transparent",
  border: "none",
  top: _SY + _SR,
  left: _SX,
  transform: "translate(-50%, -50%)",
};
const HANDLE_LEFT: CSSProperties = {
  opacity: 0,
  width: 6,
  height: 6,
  background: "transparent",
  border: "none",
  top: _SY,
  left: _SX - _SR,
  transform: "translate(-50%, -50%)",
};
const HANDLE_RIGHT: CSSProperties = {
  opacity: 0,
  width: 6,
  height: 6,
  background: "transparent",
  border: "none",
  top: _SY,
  left: _SX + _SR,
  transform: "translate(-50%, -50%)",
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
        ? createGlow(
            8,
            Math.round(22 + shadowScale * 6),
            0.11,
            0.22,
            glowScale,
            "186,72,66",
          )
        : createGlow(
            3,
            Math.round(13 + shadowScale * 4),
            0.06,
            0.12,
            glowScale,
            "186,72,66",
          ),
      sphereClass:
        "bg-gradient-to-br from-[#BA4845] to-[#C85148] border-white/[0.18] shadow-[0_4px_20px_rgba(186,72,66,0.36)] text-white kanji-node-sphere-completed-enter",
      ring: "rgba(186, 72, 66, 0.22)",
      orbit: "rgba(186, 72, 66, 0.36)",
      label: "text-content-primary",
    };
  }

  if (status === "available") {
    return {
      glow: selected
        ? createGlow(
            7,
            Math.round(19 + shadowScale * 5),
            0.09,
            0.18,
            glowScale,
            "186,72,66",
          )
        : createGlow(
            4,
            Math.round(14 + shadowScale * 3),
            0.08,
            0.14,
            glowScale,
            "186,72,66",
          ),
      sphereClass:
        "bg-gradient-to-br from-[#993331] to-[#BA5149] border-white/[0.14] shadow-[0_4px_16px_rgba(153,51,49,0.28)] text-white kanji-node-sphere-available-enter",
      ring: "rgba(186, 72, 66, 0.16)",
      orbit: "rgba(186, 72, 66, 0.27)",
      label: "text-content-primary",
    };
  }

  return {
    glow: selected
      ? createGlow(
          6,
          Math.round(17 + shadowScale * 4),
          0.07,
          0.15,
          glowScale,
          "120,112,126",
        )
      : createGlow(
          2,
          Math.round(9 + shadowScale * 2),
          0.03,
          0.07,
          glowScale,
          "120,112,126",
        ),
    sphereClass:
      "kanji-node-sphere-locked border-black/[0.06] dark:border-white/[0.06]",
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
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        style={HANDLE_TOP}
      />
      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        style={HANDLE_BOTTOM}
      />
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        style={HANDLE_LEFT}
      />
      <Handle
        id="target-right"
        type="target"
        position={Position.Right}
        style={HANDLE_RIGHT}
      />
      <Handle
        id="source-top"
        type="source"
        position={Position.Top}
        style={HANDLE_TOP}
      />
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        style={HANDLE_BOTTOM}
      />
      <Handle
        id="source-left"
        type="source"
        position={Position.Left}
        style={HANDLE_LEFT}
      />
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        style={HANDLE_RIGHT}
      />

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
            ]
              .filter(Boolean)
              .join(" ")}
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

          {/* Unlock ring — quality-tiered halo burst */}
          {data.unlocking && data.qualityTier !== "low" && (
            <div
              className="kanji-node-unlock-ring pointer-events-none absolute inset-[18px]"
              style={{ borderColor: "rgba(186, 72, 69, 0.64)" }}
            />
          )}
          {data.unlocking && data.qualityTier === "high" && (
            <div
              className="kanji-node-unlock-ring pointer-events-none absolute inset-[10px]"
              style={{
                animationDelay: "0.22s",
                borderColor: "rgba(186, 72, 69, 0.64)",
              }}
            />
          )}

          <div
            className={`relative z-10 flex h-[92px] w-[92px] items-center justify-center rounded-full border font-semibold transition-transform duration-200 hover:scale-[1.03] ${styles.sphereClass}${data.unlocking ? " kanji-node-unlocking" : ""}${data.shaking ? " kanji-node-shaking" : ""}${data.selected && data.drawerOpen ? " kanji-node-drawer-open" : ""}`}
          >
            {progress.status === "locked" ? (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className="text-[30px] leading-none opacity-40">
                  {progress.kanji.symbol}
                </span>
                <LockKeyhole className="h-3.5 w-3.5 opacity-45" strokeWidth={2} />
              </div>
            ) : (
              <span className="text-[42px]">{progress.kanji.symbol}</span>
            )}
          </div>

          {/* +30 points float — always shown when unlocking */}
          {data.unlocking && (
            <div className="pointer-events-none absolute top-0 right-0 z-30">
              <span className="kanji-node-points-float inline-block whitespace-nowrap rounded-full bg-[#BA4845] px-2.5 py-[3px] text-[11px] font-black text-white shadow-[0_2px_10px_rgba(186,72,66,0.52)]">
                +30
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col items-center gap-1.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-content-secondary">
            Kanji {String(progress.index + 1).padStart(2, "0")}
          </span>
          <div className="board-node-label-pill">
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
    previous.data.drawerOpen === next.data.drawerOpen &&
    previous.data.progress.status === next.data.progress.status &&
    previous.data.progress.bestScore === next.data.progress.bestScore &&
    previous.data.progress.primaryMeaning ===
      next.data.progress.primaryMeaning &&
    previous.data.qualityTier === next.data.qualityTier &&
    previous.data.unlocking === next.data.unlocking &&
    previous.data.shaking === next.data.shaking &&
    previous.dragging === next.dragging
  );
});
