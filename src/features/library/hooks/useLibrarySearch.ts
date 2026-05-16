"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getEmptyGroupedSearchResults,
  getLibrarySearchIndex,
  normalizeText,
  groupSearchResultsByType,
  searchLibrary,
} from "@/features/library/services/librarySearch.service";
import type { GroupedLibrarySearchResults, SearchIndexItem } from "@/features/library/types/librarySearch.types";

type UseLibrarySearchOptions = {
  enabled?: boolean;
  debounceMs?: number;
  useMockData?: boolean;
};

export function useLibrarySearch(
  query: string,
  options: UseLibrarySearchOptions = {},
) {
  const { enabled = true, debounceMs = 300, useMockData = false } = options;
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    void getLibrarySearchIndex({ useMockData })
      .then((index) => {
        if (cancelled) {
          return;
        }

        setSearchIndex(index);
        setError(null);
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }

        console.error("Error loading library search index:", nextError);
        setError(nextError instanceof Error ? nextError.message : "Error loading search index");
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, useMockData]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [debounceMs, query]);

  const normalizedRawQuery = normalizeText(query);
  const normalizedDebouncedQuery = normalizeText(debouncedQuery);
  const isIndexLoading = enabled && searchIndex.length === 0 && error === null;
  const results = useMemo(
    () => searchLibrary(searchIndex, debouncedQuery),
    [debouncedQuery, searchIndex],
  );
  const groupedResults = useMemo<GroupedLibrarySearchResults>(
    () => groupSearchResultsByType(results),
    [results],
  );

  return {
    debouncedQuery,
    groupedResults: normalizedDebouncedQuery ? groupedResults : getEmptyGroupedSearchResults(),
    totalResults: results.length,
    isSearchActive: normalizedRawQuery.length > 0,
    isIndexLoading,
    isDebouncing:
      normalizedRawQuery.length > 0 && normalizedRawQuery !== normalizedDebouncedQuery,
    error,
    hasNoResults:
      normalizedDebouncedQuery.length > 0 &&
      !isIndexLoading &&
      !error &&
      results.length === 0,
  };
}
