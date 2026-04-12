"use client";

import { memo } from "react";
import type { CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { LockKeyhole } from "lucide-react";
import type { GrammarBoardNodeData, GrammarBoardStatus } from "../../types";

// ── Sphere geometry (168 × 196 bounding box) ────────────
const SX = 84;  // sphere center X
const SY = 98;  // sphere center Y

const makeHandle = (top: number, left: number): CSSProperties => ({
  opacity: 0,
  width: 6,
  height: 6,
  background: "transparent",
  border: "none",
  top,
  left,
  transform: "translate(-50%, -50%)",
});

const HANDLE_CENTER = makeHandle(SY, SX);

// ── Color palette (pink) ─────────────────────────────────
const PINK_RGB = "219,39,119"; // pink-600

function createGlow(inner: number, outer: number, iOp: number, oOp: number, scale: number) {
  return `0 0 0 ${inner * scale}px rgba(${PINK_RGB},${iOp}), 0 0 ${outer * scale}px rgba(${PINK_RGB},${oOp})`;
}

function getStyles(status: GrammarBoardStatus, selected: boolean, glowScale: number, shadowScale: number) {
  if (status === "completed") {
    return {
      glow: selected
        ? createGlow(8, 22 + shadowScale * 6, 0.22, 0.38, glowScale)
        : createGlow(3, 13 + shadowScale * 4, 0.12, 0.22, glowScale),
      sphereClass:
        "bg-gradient-to-br from-[#e06578] to-[#c0395a] border-white/[0.18] shadow-[0_4px_20px_rgba(192,57,90,0.40)] text-white",
      ring: "rgba(192,57,90,0.22)",
      orbit: "rgba(192,57,90,0.38)",
      label: "text-content-primary",
    };
  }

  if (status === "available") {
    return {
      glow: selected
        ? createGlow(7, 19 + shadowScale * 5, 0.18, 0.32, glowScale)
        : createGlow(4, 14 + shadowScale * 3, 0.12, 0.20, glowScale),
      sphereClass:
        "bg-gradient-to-br from-[#c0395a] to-[#e06578] border-white/[0.14] shadow-[0_4px_16px_rgba(192,57,90,0.30)] text-white",
      ring: "rgba(192,57,90,0.16)",
      orbit: "rgba(192,57,90,0.28)",
      label: "text-content-primary",
    };
  }

  // locked
  return {
    glow: selected
      ? createGlow(6, 17 + shadowScale * 4, 0.07, 0.13, glowScale)
      : createGlow(2, 9 + shadowScale * 2, 0.03, 0.06, glowScale),
    sphereClass: "kanji-node-sphere-locked border-black/[0.06] dark:border-white/[0.06]",
    ring: "rgba(120,36,60,0.18)",
      orbit: "rgba(120,36,60,0.26)",
    label: "text-content-secondary",
  };
}

function GrammarBoardNode({ data }: NodeProps<GrammarBoardNodeData>) {
  const { progress, selected, glowScale, shadowScale, showOrbitRings, shouldUsePulse, drawerOpen } = data;
  const styles = getStyles(progress.status, selected, glowScale, shadowScale);
  const showPulse = shouldUsePulse && selected;

  const nodeNum = String(progress.index + 1).padStart(2, "0");
  const nodeSymbol = progress.symbol;

  return (
    <>
      <Handle id="target-center" type="target" position={Position.Top} style={HANDLE_CENTER} />
      <Handle id="source-center" type="source" position={Position.Top} style={HANDLE_CENTER} />

      <div className="flex h-full w-full flex-col items-center justify-start pt-6">
        <div className="relative flex h-[138px] w-[138px] items-center justify-center">
          {/* Glow / pulse ring */}
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

          {/* Orbit rings */}
          {showOrbitRings && (
            <>
              <div className="absolute inset-[12px] rounded-full border" style={{ borderColor: styles.orbit }} />
              <div className="absolute inset-[24px] rounded-full border" style={{ borderColor: styles.ring  }} />
            </>
          )}

          {/* Sphere */}
          <div
            className={`relative z-10 flex h-[92px] w-[92px] items-center justify-center rounded-full border font-semibold transition-transform duration-200 hover:scale-[1.03] ${styles.sphereClass}${drawerOpen ? " kanji-node-drawer-open" : ""}`}
          >
            {progress.status === "locked" ? (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className="text-[28px] leading-none font-black opacity-45">{nodeSymbol}</span>
                <LockKeyhole className="h-3.5 w-3.5 opacity-40" strokeWidth={2} />
              </div>
            ) : (
              <span className="text-[30px] font-black leading-none">{nodeSymbol}</span>
            )}
          </div>
        </div>

        {/* Label */}
        <div className="mt-1 flex flex-col items-center gap-1.5 px-3 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-content-secondary">
            Nodo {nodeNum}
          </span>
          <div className="board-node-label-pill max-w-[148px] px-3 py-1.5">
            <span className={`${styles.label} block text-[10px] leading-snug`}>
              {progress.isMock ? "Próximamente" : progress.title}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(GrammarBoardNode, (prev, next) =>
  prev.xPos === next.xPos &&
  prev.yPos === next.yPos &&
  prev.data.selected === next.data.selected &&
  prev.data.drawerOpen === next.data.drawerOpen &&
  prev.data.progress.status === next.data.progress.status &&
  prev.data.progress.symbol === next.data.progress.symbol &&
  prev.data.progress.title === next.data.progress.title &&
  prev.dragging === next.dragging,
);
