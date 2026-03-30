"use client";

import { Plus, Search } from "lucide-react";
import type { CouponStatusFilter } from "../hooks/useAdminCoupons";

type StatusOption = {
  value: CouponStatusFilter;
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "expired", label: "Expirados" },
];

interface AdminCouponsFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: CouponStatusFilter;
  onStatusFilterChange: (value: CouponStatusFilter) => void;
  onCreateClick: () => void;
}

export function AdminCouponsFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onCreateClick,
}: AdminCouponsFiltersProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-surface-elevated px-3 transition-colors focus-within:border-accent/40">
            <Search className="h-4 w-4 shrink-0 text-content-muted" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar por codigo, descripcion o meses"
              className="h-full w-full bg-transparent text-sm leading-none text-content-secondary outline-none placeholder:text-content-muted"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Nuevo cupon
        </button>
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
