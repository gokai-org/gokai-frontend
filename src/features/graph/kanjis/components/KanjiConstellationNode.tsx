"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { LockKeyhole, Sparkles } from "lucide-react";
import type { KanjiConstellationNodeData } from "../types";

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
        ? createGlow(10, 22, 0.12, 0.22, glowScale, "196,68,66")
        : createGlow(4, 12, 0.08, 0.14, glowScale, "196,68,66"),
      background:
        "radial-gradient(circle at 30% 28%, rgba(255,247,243,0.96) 0%, rgba(232,157,135,0.9) 18%, rgba(196,68,66,0.88) 42%, rgba(78,24,23,0.96) 100%)",
      ring: "rgba(255, 233, 226, 0.22)",
      orbit: "rgba(255, 217, 206, 0.18)",
      label: "text-content-primary",
      meta: "text-content-secondary",
      shadow:
        progressShadow("69,18,18", 0.18, 10, 24, shadowScale),
    };
  }

  if (status === "available") {
    return {
      glow: selected
        ? createGlow(8, 20, 0.1, 0.18, glowScale, "196,68,66")
        : createGlow(3, 10, 0.06, 0.12, glowScale, "196,68,66"),
      background:
        "radial-gradient(circle at 30% 28%, rgba(255,248,245,0.95) 0%, rgba(218,164,151,0.82) 20%, rgba(158,77,75,0.78) 46%, rgba(53,27,30,0.94) 100%)",
      ring: "rgba(255, 233, 226, 0.16)",
      orbit: "rgba(255, 217, 206, 0.12)",
      label: "text-content-primary",
      meta: "text-content-secondary",
      shadow:
        progressShadow("69,18,18", 0.18, 10, 24, shadowScale),
    };
  }

  return {
    glow: selected
      ? createGlow(8, 16, 0.06, 0.12, glowScale, "255,255,255")
      : createGlow(3, 8, 0.03, 0.06, glowScale, "255,255,255"),
    background:
      "radial-gradient(circle at 30% 28%, rgba(248,248,249,0.88) 0%, rgba(196,198,204,0.42) 20%, rgba(106,110,120,0.34) 48%, rgba(40,42,47,0.86) 100%)",
    ring: "rgba(255, 255, 255, 0.09)",
    orbit: "rgba(255, 255, 255, 0.07)",
    label: "text-content-secondary",
    meta: "text-content-muted",
    shadow: progressShadow("15,18,24", 0.14, 8, 18, shadowScale),
  };
}

function progressShadow(
  color: string,
  opacity: number,
  blurY: number,
  blur: number,
  scale: number,
) {
  return `0 ${blurY * scale}px ${blur * scale}px rgba(${color},${opacity})`;
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
      <Handle id="target-top" type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle id="target-left" type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="target-right" type="target" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="source-top" type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle id="source-left" type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="source-right" type="source" position={Position.Right} style={{ opacity: 0 }} />

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
            className="relative z-10 flex h-[92px] w-[92px] items-center justify-center rounded-full border border-white/16 text-[42px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-transform duration-200 hover:scale-[1.03] dark:border-white/10"
            style={{
              background: styles.background,
              boxShadow: styles.shadow,
            }}
          >
            <span className={progress.status === "locked" ? "opacity-72" : ""}>
              {progress.kanji.symbol}
            </span>
          </div>

          <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/85">
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
          <div className="max-w-[160px] rounded-full border border-white/10 bg-surface-primary/65 px-3 py-1 text-xs font-semibold dark:bg-black/20">
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
