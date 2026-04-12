"use client";

import { memo, useMemo, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import type { AdminUser } from "../types/users";
import { AdminUserRow } from "./AdminUserRow";

type PageSizeValue = "25" | "50" | "100" | "200";

const pageSizeOptions: AdminFilterOption<PageSizeValue>[] = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "200", label: "200" },
];

interface AdminUsersTableProps {
  users: AdminUser[];
  totalUsers: number;
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
  onReload: () => void;
  onViewUser: (user: AdminUser) => void;
}

function AdminUsersTableBase({
  users,
  totalUsers,
  loading,
  refreshing,
  lastUpdatedAt,
  onReload,
  onViewUser,
}: AdminUsersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeValue>("50");

  const pageSizeNumber = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(users.length / pageSizeNumber));

  const [prevResetKey, setPrevResetKey] = useState({
    pageSize,
    usersLen: users.length,
  });
  if (
    pageSize !== prevResetKey.pageSize ||
    users.length !== prevResetKey.usersLen
  ) {
    setPrevResetKey({ pageSize, usersLen: users.length });
    setPage(1);
  }

  const effectivePage = Math.max(1, Math.min(page, totalPages));
  const pageStart = (effectivePage - 1) * pageSizeNumber;

  const visibleUsers = useMemo(
    () => users.slice(pageStart, pageStart + pageSizeNumber),
    [pageSizeNumber, pageStart, users],
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
            Todos los usuarios
          </h3>
          <p className="text-xs text-content-tertiary">
            Ultimos usuarios ({users.length} de {totalUsers} usuarios)
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
                Nombre
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Correo
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Perfil
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Puntos
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Suscripcion
              </th>
              <th className="px-2.5 py-2.5 text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Fecha de registro
              </th>
              <th className="px-2.5 py-2.5 text-center text-[11px] font-semibold tracking-wide text-content-tertiary sm:px-3 lg:px-4">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <AdminUserRow
                key={user.id}
                user={user}
                onViewUser={onViewUser}
              />
            ))}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-content-tertiary">
            Mostrando {visibleUsers.length} usuarios (pagina {effectivePage} de{" "}
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

      {users.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-border-default bg-surface-secondary p-6 text-center">
          <p className="text-sm font-medium text-content-secondary">
            No hay usuarios con los filtros seleccionados.
          </p>
        </div>
      )}
    </section>
  );
}

export const AdminUsersTable = memo(AdminUsersTableBase);
