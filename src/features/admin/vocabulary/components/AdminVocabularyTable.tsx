"use client";

import { memo, useMemo, useState } from "react";
import { Edit3, Loader2, RefreshCcw, Rows3 } from "lucide-react";
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
}

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
        <col className="w-[16%]" />
        <col className="w-[16%]" />
        <col className="w-[33%]" />
        <col className="w-[12%]" />
        <col className="w-[8%]" />
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
}: AdminVocabularyTableProps) {
  const [page, setPage] = useState(1);
  const [pageKey, setPageKey] = useState("50:0");
  const [pageSize, setPageSize] = useState<PageSizeValue>("50");
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

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
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
            disabled={refreshing || loading}
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

                return (
                  <tr
                    key={item.id}
                    onClick={() => canDrillDown && onOpenItem(item)}
                    className={[
                      "border-t border-border-subtle transition-colors hover:bg-surface-secondary/70",
                      canDrillDown ? "cursor-pointer" : "",
                    ].join(" ")}
                  >
                    <td className="px-3 py-3 text-xs font-medium text-content-tertiary lg:px-4">
                      <span className="block max-w-[140px] truncate">{item.id}</span>
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-content-primary lg:px-4">
                      {level === "words" ? word.kanji || "-" : getPrimaryLabel(item)}
                    </td>
                    <td className="px-3 py-3 text-sm text-content-secondary lg:px-4">
                      {level === "words" ? word.hiragana || "-" : "kanji" in item ? item.kanji : "-"}
                    </td>
                    <td className="px-3 py-3 text-sm text-content-secondary lg:px-4">
                      {level === "words"
                        ? word.meanings?.join(", ") || "-"
                        : "kana" in item
                          ? item.kana
                          : "-"}
                    </td>
                    <td className="px-3 py-3 text-sm text-content-secondary lg:px-4">
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
                    <td className="px-3 py-3 text-center lg:px-4">
                      <div className="flex justify-center gap-2">
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
            />
            <button
              type="button"
              onClick={() => {
                setPage((previousPage) => Math.max(1, previousPage - 1));
                setPageKey(currentPageKey);
              }}
              disabled={effectivePage <= 1}
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
              disabled={effectivePage >= totalPages}
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