"use client";

import { memo, useMemo, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import type { AdminCoupon } from "../types/coupons";
import { AdminCouponRow } from "./AdminCouponRow";

type PageSizeValue = "25" | "50" | "100" | "200";

const pageSizeOptions: AdminFilterOption<PageSizeValue>[] = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "200", label: "200" },
];

interface AdminCouponsTableProps {
  coupons: AdminCoupon[];
  totalCoupons: number;
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
  onReload: () => void;
  onViewCoupon: (coupon: AdminCoupon) => void;
}

function AdminCouponsTableBase({
  coupons,
  totalCoupons,
  loading,
  refreshing,
  lastUpdatedAt,
  onReload,
  onViewCoupon,
}: AdminCouponsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeValue>("50");

  const pageSizeNumber = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(coupons.length / pageSizeNumber));

  // Adjust state during render (React recommended pattern)
  const [prevResetKey, setPrevResetKey] = useState({ pageSize, couponsLen: coupons.length });
  if (pageSize !== prevResetKey.pageSize || coupons.length !== prevResetKey.couponsLen) {
    setPrevResetKey({ pageSize, couponsLen: coupons.length });
    setPage(1);
  }

  const effectivePage = Math.max(1, Math.min(page, totalPages));

  const pageStart = (effectivePage - 1) * pageSizeNumber;

  const visibleCoupons = useMemo(
    () => coupons.slice(pageStart, pageStart + pageSizeNumber),
    [pageSizeNumber, pageStart, coupons],
  );

  const updatedLabel =
    lastUpdatedAt == null
      ? "Sin sincronizacion"
      : new Date(lastUpdatedAt).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-content-primary">
            Todos los cupones
          </h3>
          <p className="text-xs text-content-tertiary">
            Ultimos cupones ({coupons.length} de {totalCoupons} cupones)
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

      <div className="overflow-x-auto xl:overflow-visible rounded-xl border border-border-subtle">
        <table className="min-w-[780px] md:min-w-[880px] xl:min-w-0 w-full table-fixed bg-surface-primary">
          <thead className="bg-[#F8F6F4] text-left">
            <tr>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                ID
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Codigo
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Descripcion
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Meses
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Limite de canjes
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Vigencia
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Estado
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Fecha de creacion
              </th>
              <th className="px-2.5 py-2.5 text-center text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleCoupons.map((coupon) => (
              <AdminCouponRow
                key={coupon.id}
                coupon={coupon}
                onViewCoupon={onViewCoupon}
              />
            ))}
          </tbody>
        </table>
      </div>

      {coupons.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-content-tertiary">
            Mostrando {visibleCoupons.length} cupones (pagina {effectivePage} de{" "}
            {totalPages})
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
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={effectivePage <= 1}
              className="rounded-md border border-border-default px-2.5 py-1 text-xs font-semibold text-content-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={effectivePage >= totalPages}
              className="rounded-md border border-border-default px-2.5 py-1 text-xs font-semibold text-content-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {coupons.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-border-default bg-surface-secondary p-6 text-center">
          <p className="text-sm font-medium text-content-secondary">
            No hay cupones con los filtros seleccionados.
          </p>
        </div>
      )}
    </section>
  );
}

export const AdminCouponsTable = memo(AdminCouponsTableBase);
