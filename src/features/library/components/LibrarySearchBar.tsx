"use client";

import { Loader2, Search, X } from "lucide-react";

type LibrarySearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
};

export function LibrarySearchBar({
  value,
  onChange,
  isLoading = false,
  placeholder = "Buscar kanjis, hiraganas, katakanas, gramática y vocabulario...",
}: LibrarySearchBarProps) {
  return (
    <div
      data-help-target="library-search"
      className="flex w-full max-w-full items-center gap-2 rounded-full border border-border-default bg-surface-secondary px-4 py-2 sm:max-w-[38rem] xl:max-w-[46rem]"
    >
      <Search className="h-4 w-4 shrink-0 text-content-muted" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-content-muted/80"
      />
      {value && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-content-muted transition hover:bg-black/5 hover:text-content-primary"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isLoading && (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-content-muted" />
      )}
    </div>
  );
}
