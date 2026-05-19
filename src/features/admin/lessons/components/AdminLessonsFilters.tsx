"use client";

import { RefreshCw, Search } from "lucide-react";

interface AdminLessonsFiltersProps {
  query: string;
  totalResults: number;
  isRefreshing: boolean;
  lastUpdatedAt: number | null;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
}

function formatTimestamp(value: number | null) {
  if (!value) return "Sin sincronizar";

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(value);
}

export function AdminLessonsFilters({
  query,
  totalResults,
  isRefreshing,
  lastUpdatedAt,
  onQueryChange,
  onRefresh,
}: AdminLessonsFiltersProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-xl">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-surface-elevated px-3 transition-colors focus-within:border-accent/40">
            <Search className="h-4 w-4 shrink-0 text-content-muted" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar por título, descripción, tipo de bloque o id"
              className="h-full w-full bg-transparent text-sm leading-none text-content-secondary outline-none placeholder:text-content-muted"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-content-tertiary">
              {totalResults} resultados
            </p>
            <p className="text-xs text-content-muted">
              Actualizado: {formatTimestamp(lastUpdatedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm font-semibold text-content-primary transition-colors hover:border-accent/35 hover:text-accent"
          >
            <RefreshCw className={["h-4 w-4", isRefreshing ? "animate-spin" : ""].join(" ")} />
            Refrescar
          </button>
        </div>
      </div>
    </section>
  );
}