"use client";

import { memo, useMemo, useState } from "react";
import { Edit3, GripVertical, Loader2, RefreshCcw, Rows3 } from "lucide-react";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import { AdminTableLoadingRows } from "@/features/admin/shared/components/AdminTableLoadingRows";
import type {
  AdminVocabularyItem,
  AdminVocabularyLevel,
  AdminVocabularySubtheme,
  AdminVocabularyTheme,
  AdminVocabularyWord,
} from "../types/vocabulary";
import {
  getVocabularyLevelLabel,
  getVocabularyRegionLabel,
} from "../utils/vocabulary";

type PageSizeValue = "25" | "50" | "100" | "200";

const pageSizeOptions: AdminFilterOption<PageSizeValue>[] = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "200", label: "200" },
];

interface AdminVocabularyTableProps {
  level: AdminVocabularyLevel;
  items: AdminVocabularyItem[];
  totalItems: number;
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
  onReload: () => void;
  onOpenItem: (item: AdminVocabularyItem) => void;
  onEditItem: (item: AdminVocabularyItem) => void;
  onReorderItem?: (
    draggedItemId: string,
    targetItemId: string,
    placement: "before" | "after",
  ) => void;
  movingItemId?: string | null;
  wordMoveMetaById?: Record<string, { canMoveUp: boolean; canMoveDown: boolean; orderLabel: number }>;
}

type DropIndicator = {
  targetItemId: string;
  placement: "before" | "after";
};

function isTheme(item: AdminVocabularyItem): item is AdminVocabularyTheme {
  return "released" in item;
}

function isSubtheme(item: AdminVocabularyItem): item is AdminVocabularySubtheme {
  return "themeId" in item && "kana" in item && !("released" in item);
}

function getPrimaryLabel(item: AdminVocabularyItem) {
  if ("meaning" in item) return item.meaning;
  const word = item as AdminVocabularyWord;
  return word.meanings?.[0] ?? word.hiragana ?? word.kanji ?? "Sin significado";
}

function renderColumns(level: AdminVocabularyLevel) {
  if (level === "words") {
    return (
      <>
        <col className="w-[15%]" />
        <col className="w-[8%]" />
        <col className="w-[16%]" />
        <col className="w-[16%]" />
        <col className="w-[28%]" />
        <col className="w-[11%]" />
        <col className="w-[6%]" />
      </>
    );
  }

  return (
    <>
      <col className="w-[15%]" />
      <col className="w-[24%]" />
      <col className="w-[17%]" />
      <col className="w-[17%]" />
      <col className="w-[15%]" />
      <col className="w-[12%]" />
    </>
  );
}

function renderHeaders(level: AdminVocabularyLevel) {
  const secondaryHeader = level === "themes" ? "Region/estado" : "Relacion";

  return (
    <tr>
      <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
        ID
      </th>
      {level === "words" && (
        <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
          Orden
        </th>
      )}
      <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
        {level === "words" ? "Kanji" : "Significado"}
      </th>
      <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
        {level === "words" ? "Hiragana" : "Kanji"}
      </th>
      <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
        {level === "words" ? "Significados" : "Kana"}
      </th>
      <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
        {secondaryHeader}
      </th>
      <th className="px-3 py-2.5 text-center text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
        Acciones
      </th>
    </tr>
  );
}

function AdminVocabularyTableBase({
  level,
  items,
  totalItems,
  loading,
  refreshing,
  lastUpdatedAt,
  onReload,
  onOpenItem,
  onEditItem,
  onReorderItem,
  movingItemId,
  wordMoveMetaById,
}: AdminVocabularyTableProps) {
  const [page, setPage] = useState(1);
  const [pageKey, setPageKey] = useState("50:0");
  const [pageSize, setPageSize] = useState<PageSizeValue>("50");
  const [draggedWordId, setDraggedWordId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const pageSizeNumber = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSizeNumber));
  const currentPageKey = `${pageSize}:${items.length}:${level}`;
  const effectivePage = Math.max(
    1,
    Math.min(pageKey === currentPageKey ? page : 1, totalPages),
  );
  const pageStart = (effectivePage - 1) * pageSizeNumber;
  const visibleItems = useMemo(
    () => items.slice(pageStart, pageStart + pageSizeNumber),
    [items, pageSizeNumber, pageStart],
  );
  const updatedLabel =
    lastUpdatedAt == null
      ? "Sin sincronizacion"
      : new Date(lastUpdatedAt).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
  const canDrillDown = level !== "words";
  const canReorderWords = level === "words" && Boolean(onReorderItem);
  const isReorderPending = Boolean(movingItemId);

  return (
    <section className="relative rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      {isReorderPending && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-surface-primary/72 backdrop-blur-[2px]">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-border-default bg-surface-primary px-4 py-3 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span className="text-sm font-semibold text-content-primary">
              Guardando nuevo orden...
            </span>
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-content-primary">
            {getVocabularyLevelLabel(level)}
          </h3>
          <p className="text-xs text-content-tertiary">
            Mostrando {items.length} de {totalItems} registros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-content-tertiary sm:inline">
            Actualizado: {updatedLabel}
          </span>
          <button
            type="button"
            onClick={onReload}
            disabled={refreshing || loading || isReorderPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-primary px-3 py-1.5 text-xs font-semibold text-content-secondary transition-colors hover:border-accent/25 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Recargar tabla
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full min-w-[980px] table-auto bg-surface-primary">
          <colgroup>{renderColumns(level)}</colgroup>
          <thead className="bg-[#F8F6F4]">{renderHeaders(level)}</thead>
          <tbody>
            {loading ? (
              <AdminTableLoadingRows columnCount={6} />
            ) : (
              visibleItems.map((item) => {
                const theme = isTheme(item) ? item : null;
                const subtheme = isSubtheme(item) ? item : null;
                const word = item as AdminVocabularyWord;
                const wordMoveMeta = wordMoveMetaById?.[item.id];
                const isMovingWord = movingItemId === item.id;
                const isDraggedWord = draggedWordId === item.id;
                const isDropTarget = dropIndicator?.targetItemId === item.id;
                const isDropBefore = isDropTarget && dropIndicator?.placement === "before";
                const isDropAfter = isDropTarget && dropIndicator?.placement === "after";
                const isRowDraggable = canReorderWords && !isMovingWord && !isReorderPending;

                return (
                  <tr
                    key={item.id}
                    draggable={isRowDraggable}
                    onDragStart={(event) => {
                      if (!isRowDraggable) {
                        return;
                      }

                      setDraggedWordId(item.id);
                      setDropIndicator(null);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                    }}
                    onDragOver={(event) => {
                      if (!isRowDraggable || draggedWordId === item.id) {
                        return;
                      }

                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      const rowRect = event.currentTarget.getBoundingClientRect();
                      const placement = event.clientY < rowRect.top + rowRect.height / 2
                        ? "before"
                        : "after";
                      setDropIndicator({ targetItemId: item.id, placement });
                    }}
                    onDrop={(event) => {
                      if (!isRowDraggable || !draggedWordId || draggedWordId === item.id) {
                        return;
                      }

                      event.preventDefault();
                      onReorderItem?.(
                        draggedWordId,
                        item.id,
                        dropIndicator?.targetItemId === item.id
                          ? dropIndicator.placement
                          : "before",
                      );
                      setDraggedWordId(null);
                      setDropIndicator(null);
                    }}
                    onDragLeave={(event) => {
                      if (!isDropTarget) {
                        return;
                      }

                      const relatedTarget = event.relatedTarget;
                      if (
                        relatedTarget instanceof Node &&
                        event.currentTarget.contains(relatedTarget)
                      ) {
                        return;
                      }

                      setDropIndicator((current) =>
                        current?.targetItemId === item.id ? null : current,
                      );
                    }}
                    onDragEnd={() => {
                      setDraggedWordId(null);
                      setDropIndicator(null);
                    }}
                    onClick={() => canDrillDown && onOpenItem(item)}
                    className={[
                      "border-t border-border-subtle transition-colors hover:bg-surface-secondary/70",
                      canDrillDown ? "cursor-pointer" : "",
                      isRowDraggable ? "cursor-grab active:cursor-grabbing" : "",
                      isDraggedWord ? "opacity-45" : "",
                      isDropTarget && draggedWordId && draggedWordId !== item.id
                        ? "bg-accent/5 ring-1 ring-inset ring-accent/25"
                        : "",
                    ].join(" ")}
                  >
                    <td className={[
                      "px-3 py-3 text-xs font-medium text-content-tertiary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      <span className="block max-w-[140px] truncate">{item.id}</span>
                    </td>
                    {level === "words" && (
                      <td className={[
                        "px-3 py-3 text-sm font-semibold text-content-secondary lg:px-4",
                        isDropBefore ? "border-t-2 border-accent" : "",
                        isDropAfter ? "border-b-2 border-accent" : "",
                      ].join(" ")}>
                        {wordMoveMeta?.orderLabel ?? "-"}
                      </td>
                    )}
                    <td className={[
                      "px-3 py-3 text-sm font-semibold text-content-primary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {level === "words" ? word.kanji || "-" : getPrimaryLabel(item)}
                    </td>
                    <td className={[
                      "px-3 py-3 text-sm text-content-secondary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {level === "words" ? word.hiragana || "-" : "kanji" in item ? item.kanji : "-"}
                    </td>
                    <td className={[
                      "px-3 py-3 text-sm text-content-secondary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {level === "words"
                        ? word.meanings?.join(", ") || "-"
                        : "kana" in item
                          ? item.kana
                          : "-"}
                    </td>
                    <td className={[
                      "px-3 py-3 text-sm text-content-secondary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {theme ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                            {getVocabularyRegionLabel(theme.region)}
                          </span>
                          <span
                            className={[
                              "rounded-full px-2 py-1 text-xs font-semibold",
                              theme.released
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : "bg-surface-secondary text-content-tertiary",
                            ].join(" ")}
                          >
                            {theme.released ? "Publicado" : "Borrador"}
                          </span>
                        </div>
                      ) : subtheme ? (
                        <span className="block max-w-[180px] truncate text-xs">
                          Tema: {subtheme.themeId}
                        </span>
                      ) : (
                        <span className="block max-w-[180px] truncate text-xs">
                          Subtema: {word.subthemeId}
                        </span>
                      )}
                    </td>
                    <td className={[
                      "px-3 py-3 text-center lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      <div className="flex justify-center gap-2">
                        {level === "words" && (
                          <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-content-secondary"
                            aria-hidden="true"
                            title="Arrastra la fila para reordenar"
                          >
                            {isMovingWord ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <GripVertical className="h-4 w-4" />
                            )}
                          </span>
                        )}
                        {canDrillDown && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenItem(item);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-content-secondary transition-colors hover:border-accent/30 hover:text-accent"
                            aria-label="Abrir nivel"
                          >
                            <Rows3 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditItem(item);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-content-secondary transition-colors hover:border-accent/30 hover:text-accent"
                          aria-label="Editar registro"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && items.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-border-default bg-surface-secondary p-6 text-center">
          <p className="text-sm font-medium text-content-secondary">
            No hay registros para mostrar en este nivel.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-content-tertiary">
            Mostrando {visibleItems.length} registros (pagina {effectivePage} de {totalPages})
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-content-tertiary">Filas</label>
            <AdminFilterDropdown
              value={pageSize}
              options={pageSizeOptions}
              onChange={setPageSize}
              className="min-w-[88px]"
              buttonLabel={pageSize}
              menuDirection="up"
              disabled={isReorderPending}
            />
            <button
              type="button"
              onClick={() => {
                setPage((previousPage) => Math.max(1, previousPage - 1));
                setPageKey(currentPageKey);
              }}
              disabled={effectivePage <= 1 || isReorderPending}
              className="rounded-md border border-border-default px-2.5 py-1 text-xs font-semibold text-content-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => {
                setPage((previousPage) => Math.min(totalPages, previousPage + 1));
                setPageKey(currentPageKey);
              }}
              disabled={effectivePage >= totalPages || isReorderPending}
              className="rounded-md border border-border-default px-2.5 py-1 text-xs font-semibold text-content-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export const AdminVocabularyTable = memo(AdminVocabularyTableBase);