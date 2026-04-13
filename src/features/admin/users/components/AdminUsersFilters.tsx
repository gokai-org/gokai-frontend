"use client";

import { Search } from "lucide-react";
import type { UserStatusFilter } from "../hooks/useAdminUsers";

type StatusOption = {
  value: UserStatusFilter;
  label: string;
};

const statusOptions: StatusOption[] = [
  { value: "all", label: "Todos" },
  { value: "subscribed", label: "Suscritos" },
  { value: "free", label: "Gratis" },
  { value: "google", label: "Google" },
];

interface AdminUsersFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: UserStatusFilter;
  onStatusFilterChange: (value: UserStatusFilter) => void;
  showGoogleFilter: boolean;
}

export function AdminUsersFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  showGoogleFilter,
}: AdminUsersFiltersProps) {
  const visibleStatusOptions = showGoogleFilter
    ? statusOptions
    : statusOptions.filter((option) => option.value !== "google");

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-surface-elevated px-3 transition-colors focus-within:border-accent/40">
            <Search className="h-4 w-4 shrink-0 text-content-muted" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar por nombre, correo o ID"
              className="h-full w-full bg-transparent text-sm leading-none text-content-secondary outline-none placeholder:text-content-muted"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {visibleStatusOptions.map((option) => {
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
