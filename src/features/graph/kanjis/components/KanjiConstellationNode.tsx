"use client";

import { memo } from "react";
import type { CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { LockKeyhole, Sparkles } from "lucide-react";
import type { KanjiConstellationNodeData } from "../types";

// ── Sphere geometry within the node bounding box (168 × 196) ──────────────
// Outer flex container: pt-2 (8px top padding), items-center → centers 138px sub-container
// Sub-container: 138 × 138, horizontally centered → left offset = (168 - 138) / 2 = 15px
// Sphere: 92 × 92, centered within 138 × 138 → inset = (138 - 92) / 2 = 23px
//   sphere top-left in node coords: (15 + 23, 8 + 23) = (38, 31)
//   sphere center in node coords:   (84, 77)
//   sphere radius:                  46
// Handles are positioned AT the sphere surface so edges visually connect flush.
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
  status: KanjiConstellationNodeData["progress"]["status"],
  selected: boolean,
  glowScale: number,
  shadowScale: number,
) {
  if (status === "completed") {
    return {
      glow: selected
        ? createGlow(8, Math.round(22 + shadowScale * 6), 0.10, 0.20, glowScale, "196,68,66")
        : createGlow(3, Math.round(13 + shadowScale * 4), 0.05, 0.11, glowScale, "196,68,66"),
      sphereClass: "kanji-node-sphere kanji-node-sphere-completed",
      ring: "rgba(196, 68, 66, 0.20)",
      orbit: "rgba(196, 68, 66, 0.34)",
      label: "text-content-primary",
      meta: "text-content-secondary",
    };
  }

  if (status === "available") {
    return {
      glow: selected
        ? createGlow(7, Math.round(19 + shadowScale * 5), 0.08, 0.17, glowScale, "196,68,66")
        : createGlow(2, Math.round(11 + shadowScale * 3), 0.04, 0.09, glowScale, "196,68,66"),
      sphereClass: "kanji-node-sphere kanji-node-sphere-available",
      ring: "rgba(196, 68, 66, 0.14)",
      orbit: "rgba(196, 68, 66, 0.25)",
      label: "text-content-primary",
      meta: "text-content-secondary",
    };
  }

  return {
    glow: selected
      ? createGlow(6, Math.round(17 + shadowScale * 4), 0.07, 0.15, glowScale, "140, 140, 150")
      : createGlow(2, Math.round(9 + shadowScale * 2), 0.03, 0.07, glowScale, "140, 140, 150"),
    sphereClass: "kanji-node-sphere",
    ring: "rgba(140, 140, 150, 0.16)",
    orbit: "rgba(140, 140, 150, 0.26)",
    label: "text-content-secondary",
    meta: "text-content-muted",
  };
}

function KanjiConstellationNode({ data }: NodeProps<KanjiConstellationNodeData>) {
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
            className={showPulse ? "absolute inset-0 rounded-full kanji-selected-pulse" : "absolute inset-0 rounded-full"}
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
            className={`relative z-10 flex h-[92px] w-[92px] items-center justify-center rounded-full border text-[42px] font-semibold transition-transform duration-200 hover:scale-[1.03] ${styles.sphereClass}`}
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

        <div className="mt-1.5 flex flex-col items-center gap-1 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-content-muted">
            Kanji {String(progress.index + 1).padStart(2, "0")}
          </span>
          <div className="max-w-[160px] rounded-full border border-black/8 bg-white/95 px-3 py-1 text-xs font-semibold dark:border-white/10 dark:bg-black/20">
            <span className={styles.label}>{progress.primaryMeaning}</span>
          </div>
          <span className={`text-[11px] ${styles.meta}`}>
            {progress.status === "completed"
              ? `Dominado · ${progress.bestScore ?? progress.completionScore}%`
              : progress.status === "available"
                ? progress.bestScore !== null
                  ? `Listo para dominar · ${progress.bestScore}%`
                  : `Disponible · Meta ${progress.completionScore}%`
                : `Bloqueado · Requiere ${progress.completionScore}% en el anterior`}
          </span>
        </div>
      </div>
    </>
  );
}

export default memo(KanjiConstellationNode, (previous, next) => {
  return (
    previous.xPos === next.xPos &&
    previous.yPos === next.yPos &&
    previous.data.selected === next.data.selected &&
    previous.data.progress.status === next.data.progress.status &&
    previous.data.progress.bestScore === next.data.progress.bestScore &&
    previous.data.progress.primaryMeaning === next.data.progress.primaryMeaning &&
    previous.data.qualityTier === next.data.qualityTier &&
    previous.dragging === next.dragging
  );
});
