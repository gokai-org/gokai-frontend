"use client";

import { Search } from "lucide-react";
import {
  AdminFilterDropdown,
  type AdminFilterOption,
} from "@/features/admin/shared/components/AdminFilterDropdown";
import type {
  SupportCategoryFilter,
  SupportStatusFilter,
} from "../hooks/useAdminSupportTickets";

type StatusOption = {
  value: SupportStatusFilter;
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abiertos" },
  { value: "in_progress", label: "En progreso" },
  { value: "resolved", label: "Resueltos" },
  { value: "closed", label: "Cerrados" },
];

const categoryOptions: AdminFilterOption<SupportCategoryFilter>[] = [
  { value: "all", label: "Todas las categorias" },
  { value: "technical_issue", label: "Problema tecnico" },
  { value: "billing", label: "Facturacion" },
  { value: "account_access", label: "Acceso de cuenta" },
  { value: "bug_report", label: "Reporte de bug" },
  { value: "feature_request", label: "Solicitud de mejora" },
  { value: "other", label: "Otro" },
];

interface AdminSupportFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: SupportStatusFilter;
  onStatusFilterChange: (value: SupportStatusFilter) => void;
  categoryFilter: SupportCategoryFilter;
  onCategoryFilterChange: (value: SupportCategoryFilter) => void;
}

export function AdminSupportFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}: AdminSupportFiltersProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-surface-elevated px-3 transition-colors focus-within:border-accent/40">
            <Search className="h-4 w-4 shrink-0 text-content-muted" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar por id, nombre, correo o asunto"
              className="h-full w-full bg-transparent text-sm leading-none text-content-secondary outline-none placeholder:text-content-muted"
            />
          </div>
        </div>

        <AdminFilterDropdown
          value={categoryFilter}
          options={categoryOptions}
          onChange={onCategoryFilterChange}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {statusOptions.map((option) => {
          const active = statusFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusFilterChange(option.value)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                active
                  ? "border-accent/30 bg-accent text-content-inverted"
                  : "border-border-default bg-surface-primary text-content-secondary hover:border-accent/25 hover:text-accent",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
