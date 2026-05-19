"use client";

import { memo, useMemo, useState } from "react";
import { Edit3, GripVertical, Loader2, RefreshCcw } from "lucide-react";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import { AdminTableLoadingRows } from "@/features/admin/shared/components/AdminTableLoadingRows";
import type { AdminKanjiRecord } from "../types/kanji";

type PageSizeValue = "25" | "50" | "100" | "200";

const pageSizeOptions: AdminFilterOption<PageSizeValue>[] = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "200", label: "200" },
];

type DropIndicator = {
  targetItemId: string;
  placement: "before" | "after";
};

interface AdminKanjiTableProps {
  items: AdminKanjiRecord[];
  totalItems: number;
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
  pendingEditId: string | null;
  movingItemId?: string | null;
  onReload: () => void;
  onEditItem: (item: AdminKanjiRecord) => void;
  onReorderItem?: (
    draggedItemId: string,
    targetItemId: string,
    placement: "before" | "after",
  ) => void;
}

function AdminKanjiTableBase({
  items,
  totalItems,
  loading,
  refreshing,
  lastUpdatedAt,
  pendingEditId,
  movingItemId,
  onReload,
  onEditItem,
  onReorderItem,
}: AdminKanjiTableProps) {
  const [page, setPage] = useState(1);
  const [pageKey, setPageKey] = useState("50:0");
  const [pageSize, setPageSize] = useState<PageSizeValue>("50");
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const pageSizeNumber = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSizeNumber));
  const currentPageKey = `${pageSize}:${items.length}`;
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
  const canReorder = Boolean(onReorderItem);
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
          <h3 className="text-base font-bold text-content-primary">Catalogo de kanjis</h3>
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
            disabled={refreshing || loading || Boolean(pendingEditId) || isReorderPending}
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
        <table className="w-full min-w-[1120px] table-auto bg-surface-primary">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[24%]" />
            <col className="w-[8%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead className="bg-[#F8F6F4]">
            <tr>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
                ID
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
                Orden
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
                Simbolo
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
                Lecturas
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
                Significados
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
                Puntos
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold tracking-wide text-content-tertiary lg:px-4">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminTableLoadingRows columnCount={7} />
            ) : (
              visibleItems.map((item) => {
                const isPending = pendingEditId === item.id;
                const isMoving = movingItemId === item.id;
                const isDragged = draggedItemId === item.id;
                const isDropTarget = dropIndicator?.targetItemId === item.id;
                const isDropBefore = isDropTarget && dropIndicator?.placement === "before";
                const isDropAfter = isDropTarget && dropIndicator?.placement === "after";
                const isRowDraggable =
                  canReorder && !Boolean(pendingEditId) && !isReorderPending;

                return (
                  <tr
                    key={item.id}
                    draggable={isRowDraggable}
                    onDragStart={(event) => {
                      if (!isRowDraggable) {
                        return;
                      }

                      setDraggedItemId(item.id);
                      setDropIndicator(null);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                    }}
                    onDragOver={(event) => {
                      if (!isRowDraggable || draggedItemId === item.id) {
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
                      if (!isRowDraggable || !draggedItemId || draggedItemId === item.id) {
                        return;
                      }

                      event.preventDefault();
                      onReorderItem?.(
                        draggedItemId,
                        item.id,
                        dropIndicator?.targetItemId === item.id
                          ? dropIndicator.placement
                          : "before",
                      );
                      setDraggedItemId(null);
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
                      setDraggedItemId(null);
                      setDropIndicator(null);
                    }}
                    className={[
                      "border-t border-border-subtle transition-colors hover:bg-surface-secondary/70",
                      isRowDraggable ? "cursor-grab active:cursor-grabbing" : "",
                      isDragged ? "opacity-45" : "",
                      isDropTarget && draggedItemId && draggedItemId !== item.id
                        ? "bg-accent/5 ring-1 ring-inset ring-accent/25"
                        : "",
                    ].join(" ")}
                  >
                    <td className={[
                      "px-3 py-3 text-xs font-medium text-content-tertiary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      <span className="block max-w-[180px] truncate">{item.id}</span>
                    </td>
                    <td className={[
                      "px-3 py-3 text-sm font-semibold text-content-primary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {typeof item.learnOrder === "number" ? item.learnOrder : "-"}
                    </td>
                    <td className={[
                      "px-3 py-3 text-2xl font-semibold text-content-primary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {item.symbol || "-"}
                    </td>
                    <td className={[
                      "px-3 py-3 text-sm text-content-secondary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {item.readings.join(", ") || "-"}
                    </td>
                    <td className={[
                      "px-3 py-3 text-sm text-content-secondary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {item.meanings.join(", ") || "-"}
                    </td>
                    <td className={[
                      "px-3 py-3 text-sm font-semibold text-content-primary lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      {item.pointsToUnlock}
                    </td>
                    <td className={[
                      "px-3 py-3 text-center lg:px-4",
                      isDropBefore ? "border-t-2 border-accent" : "",
                      isDropAfter ? "border-b-2 border-accent" : "",
                    ].join(" ")}>
                      <div className="flex justify-center gap-2">
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-content-secondary"
                          aria-hidden="true"
                          title="Arrastra la fila para reordenar"
                        >
                          {isMoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <GripVertical className="h-4 w-4" />
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          disabled={Boolean(pendingEditId) || isReorderPending}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-content-secondary transition-colors hover:border-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Editar kanji"
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit3 className="h-4 w-4" />
                          )}
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-content-secondary">
          <span>Filas por pagina</span>
          <AdminFilterDropdown
            value={pageSize}
            options={pageSizeOptions}
            onChange={(value) => {
              setPageSize(value);
              setPageKey(`${value}:${items.length}`);
              setPage(1);
            }}
            className="min-w-[84px]"
            buttonLabel={pageSize}
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-xs text-content-tertiary">
            Pagina {effectivePage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={effectivePage <= 1}
              className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-semibold text-content-secondary transition-colors hover:border-accent/25 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={effectivePage >= totalPages}
              className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-semibold text-content-secondary transition-colors hover:border-accent/25 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export const AdminKanjiTable = memo(AdminKanjiTableBase);