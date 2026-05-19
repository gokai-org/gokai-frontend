"use client";

import { Plus, Search } from "lucide-react";

interface AdminKanjiFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  onCreateClick: () => void;
}

export function AdminKanjiFilters({
  query,
  onQueryChange,
  onCreateClick,
}: AdminKanjiFiltersProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-surface-elevated px-3 transition-colors focus-within:border-accent/40">
            <Search className="h-4 w-4 shrink-0 text-content-muted" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar por simbolo, lectura, significado o puntos"
              className="h-full w-full bg-transparent text-sm leading-none text-content-secondary outline-none placeholder:text-content-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-content-tertiary sm:inline">
            Carga SVG obligatoria para los trazos
          </span>
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Nuevo kanji
          </button>
        </div>
      </div>
    </section>
  );
}