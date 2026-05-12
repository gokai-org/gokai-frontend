"use client";

import { useMemo } from "react";
import type {
  ChatWritingNotebookEntry,
  ChatWritingTarget,
} from "@/features/chatbot/hooks/useChatWritingPractice";
import type { ThemeMode } from "@/shared/hooks/useTheme";
import { getWritingPalette } from "@/features/chatbot/utils/writingPalette";

interface ChatWritingNotebookProps {
  targets: ChatWritingTarget[];
  entries: ChatWritingNotebookEntry[];
  activeTargetId?: string | null;
  themeMode?: ThemeMode;
  hideHeader?: boolean;
}

function parseViewBox(viewBox: string) {
  const parts = viewBox.split(/\s+/).map(Number);

  return {
    x: parts[0] || 0,
    y: parts[1] || 0,
    width: parts[2] || 109,
    height: parts[3] || 109,
  };
}

export function ChatWritingNotebook({
  targets,
  entries,
  activeTargetId,
  themeMode = "light",
  hideHeader = false,
}: ChatWritingNotebookProps) {
  const maxColumns = 8;
  const latestEntryByTarget = useMemo(() => {
    const map = new Map<string, ChatWritingNotebookEntry>();

    for (const entry of entries) {
      if (!map.has(entry.targetId)) {
        map.set(entry.targetId, entry);
      }
    }

    return map;
  }, [entries]);

  const notebookMetrics = useMemo(() => {
    const columnCount = Math.min(maxColumns, Math.max(targets.length, 1));
    const rowCount = Math.max(1, Math.ceil(targets.length / maxColumns));
    const cellWidth = 86;
    const cellHeight = 86;
    const gap = 18;
    const rowGap = 42;
    const paddingX = 30;
    const paddingY = 28;
    const width =
      paddingX * 2 +
      columnCount * cellWidth +
      Math.max(0, columnCount - 1) * gap;
    const height =
      paddingY * 2 +
      rowCount * cellHeight +
      Math.max(0, rowCount - 1) * rowGap;

    return {
      columnCount,
      rowCount,
      cellWidth,
      cellHeight,
      gap,
      rowGap,
      paddingX,
      paddingY,
      width,
      height,
    };
  }, [maxColumns, targets.length]);

  const activeAccent =
    targets.find((target) => target.id === activeTargetId)?.accentColor ??
    targets[0]?.accentColor;
  const palette = getWritingPalette(activeAccent);
  const isDark = themeMode === "dark";
  const sheetBackground = isDark
    ? "linear-gradient(180deg, rgba(20,20,20,0.98) 0%, rgba(10,10,10,0.98) 100%)"
    : "linear-gradient(180deg, rgba(255,251,240,0.98) 0%, rgba(252,246,230,0.98) 100%)";
  const sheetBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(120,98,64,0.16)";
  const writingAreaBackground = isDark ? "rgba(24,24,24,0.9)" : "rgba(255,253,247,0.92)";
  const writingAreaBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(120,98,64,0.14)";
  const idleCellFill = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.58)";
  const idleCellStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(120,98,64,0.12)";
  const inkFallback = isDark ? "#f8fafc" : "#0f172a";
  const textTone = isDark ? "text-neutral-100" : "text-content-primary";
  const subtextTone = isDark ? "text-neutral-400" : "text-content-tertiary";
  const accentPalette = getWritingPalette(activeAccent);

  return (
    <section
      className="relative overflow-hidden rounded-[32px] border p-4 shadow-[0_30px_90px_-58px_rgba(15,23,42,0.75)] sm:p-6"
      style={{
        borderColor: sheetBorder,
        background: sheetBackground,
      }}
    >
      <div className="pointer-events-none absolute inset-y-8 left-5 hidden w-5 flex-col justify-between sm:flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className="h-5 w-5 rounded-full border"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(120,98,64,0.15)",
              backgroundColor: isDark ? "rgba(12,12,12,0.82)" : "rgba(255,255,255,0.82)",
            }}
          />
        ))}
      </div>

      {hideHeader ? null : (
        <div className="relative mb-5 flex items-start justify-between gap-4 border-b border-black/5 pb-4 dark:border-white/5">
          <div>
            <p
              className="text-[11px] font-black uppercase tracking-[0.22em]"
              style={{ color: accentPalette.symbolMuted }}
            >
              Hoja de caligrafia
            </p>
            <h4 className={`mt-2 text-2xl font-black ${textTone}`}>
              Cuaderno del mensaje
            </h4>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${subtextTone}`}>
              Aqui se guarda la fila completa de letras japonesas que ya trazaste. El papel ahora es opaco para que la caligrafia se vea limpia y legible.
            </p>
          </div>
        </div>
      )}

      <div
        className={`${hideHeader ? "mt-0" : "mt-2"} accent-scroll-area relative max-h-[min(62vh,720px)] overflow-auto rounded-[28px] border p-5 sm:p-7`}
        style={{
          ["--accent-scrollbar-thumb" as string]: palette.ringStrong,
          ["--accent-scrollbar-thumb-hover" as string]: palette.symbolMuted,
          borderColor: writingAreaBorder,
          backgroundColor: writingAreaBackground,
          backgroundImage:
            `repeating-linear-gradient(to bottom, ${palette.paperLine} 0px, ${palette.paperLine} 1px, transparent 1px, transparent 54px)`,
        }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-7 w-px" style={{ backgroundColor: palette.paperMargin }} />

        <div className="relative pl-7">
          <svg
            viewBox={`0 0 ${notebookMetrics.width} ${notebookMetrics.height}`}
            className="block"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: `${notebookMetrics.width}px`,
            }}
          >
            {targets.map((target, index) => {
              const entry = latestEntryByTarget.get(target.id);
              const columnIndex = index % maxColumns;
              const rowIndex = Math.floor(index / maxColumns);
              const x =
                notebookMetrics.paddingX +
                columnIndex * (notebookMetrics.cellWidth + notebookMetrics.gap);
              const y =
                notebookMetrics.paddingY +
                rowIndex * (notebookMetrics.cellHeight + notebookMetrics.rowGap);
              const isActive = activeTargetId === target.id;

              return (
                <g key={target.id}>
                  <rect
                    x={x - 8}
                    y={y - 8}
                    width={notebookMetrics.cellWidth + 16}
                    height={notebookMetrics.cellHeight + 16}
                    rx={26}
                    fill={
                      isActive
                        ? getWritingPalette(target.accentColor).softStrong
                        : idleCellFill
                    }
                    stroke={
                      isActive
                        ? getWritingPalette(target.accentColor).ring
                        : idleCellStroke
                    }
                  />

                  {entry ? (
                    (() => {
                      const viewBox = parseViewBox(entry.viewBox);
                      const innerSize = 58;
                      const scale = Math.min(
                        innerSize / viewBox.width,
                        innerSize / viewBox.height,
                      );
                      const offsetX =
                        x +
                        (notebookMetrics.cellWidth - viewBox.width * scale) / 2 -
                        viewBox.x * scale;
                      const offsetY =
                        y +
                        (notebookMetrics.cellHeight - viewBox.height * scale) / 2 -
                        viewBox.y * scale;

                      return entry.strokes.map((stroke, strokeIndex) => (
                        <polyline
                          key={`${entry.id}:${strokeIndex}`}
                          fill="none"
                          stroke={target.accentColor ?? inkFallback}
                          strokeWidth={4.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={stroke.points
                            .map(
                              (point) =>
                                `${offsetX + point.x * scale},${offsetY + point.y * scale}`,
                            )
                            .join(" ")}
                        />
                      ));
                    })()
                  ) : (
                    <text
                      x={x + notebookMetrics.cellWidth / 2}
                      y={y + notebookMetrics.cellHeight / 2 + 3}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="40"
                      fontWeight="800"
                      fill={target.accentColor ?? accentPalette.symbolSoft}
                    >
                      {target.symbol}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}