"use client";

import { ChevronRight, Plus, Search } from "lucide-react";
import type {
  AdminVocabularyLevel,
  AdminVocabularySubtheme,
  AdminVocabularyTheme,
} from "../types/vocabulary";
import { getVocabularyLevelLabel } from "../utils/vocabulary";

interface AdminVocabularyFiltersProps {
  level: AdminVocabularyLevel;
  query: string;
  selectedTheme: AdminVocabularyTheme | null;
  selectedSubtheme: AdminVocabularySubtheme | null;
  onQueryChange: (value: string) => void;
  onCreateClick: () => void;
  onThemesClick: () => void;
  onSubthemesClick: () => void;
}

export function AdminVocabularyFilters({
  level,
  query,
  selectedTheme,
  selectedSubtheme,
  onQueryChange,
  onCreateClick,
  onThemesClick,
  onSubthemesClick,
}: AdminVocabularyFiltersProps) {
  const createLabel =
    level === "themes"
      ? "Nuevo tema"
      : level === "subthemes"
        ? "Nuevo subtema"
        : "Nueva palabra";
  const placeholder =
    level === "words"
      ? "Buscar por kanji, hiragana o significado"
      : "Buscar por significado, kanji, kana o region";

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-content-tertiary">
        <button
          type="button"
          onClick={onThemesClick}
          className={[
            "rounded-full px-2.5 py-1 transition-colors",
            level === "themes"
              ? "bg-accent text-content-inverted"
              : "hover:bg-surface-secondary hover:text-content-primary",
          ].join(" ")}
        >
          Temas
        </button>
        {selectedTheme && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              type="button"
              onClick={onSubthemesClick}
              className={[
                "rounded-full px-2.5 py-1 transition-colors",
                level === "subthemes"
                  ? "bg-accent text-content-inverted"
                  : "hover:bg-surface-secondary hover:text-content-primary",
              ].join(" ")}
            >
              {selectedTheme.meaning}
            </button>
          </>
        )}
        {selectedSubtheme && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-content-primary">
              {selectedSubtheme.meaning}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-border-default bg-surface-elevated px-3 transition-colors focus-within:border-accent/40">
            <Search className="h-4 w-4 shrink-0 text-content-muted" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={placeholder}
              className="h-full w-full bg-transparent text-sm leading-none text-content-secondary outline-none placeholder:text-content-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-content-tertiary sm:inline">
            Nivel: {getVocabularyLevelLabel(level)}
          </span>
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            {createLabel}
          </button>
        </div>
      </div>
    </section>
  );
}