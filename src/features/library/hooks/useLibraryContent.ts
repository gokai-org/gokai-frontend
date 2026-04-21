"use client";

import { useEffect, useMemo, useState } from "react";
import { listKanjis } from "@/features/kanji/api/kanjiApi";
import { listKatakanas, listHiraganas } from "@/features/kana/api/kanaApi";
import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";
import {
  getPrimaryMeaning,
  getPrimaryReading,
} from "@/features/kanji/utils/kanjiText";
import {
  LIBRARY_CONTENT_CACHE_KEY,
  LIBRARY_CONTENT_TTL_MS,
  type LibraryContentCache,
  mergeLibraryContentCache,
  readFreshCache,
  writeCache,
} from "@/shared/lib/progressBootstrapCache";

export type CombinedLibraryItem =
  | { type: "kanji"; data: Kanji }
  | { type: "katakana"; data: Kana }
  | { type: "hiragana"; data: Kana };

export function useLibraryContent(searchQuery: string) {
  const [initialCache] = useState<LibraryContentCache | null>(() =>
    readFreshCache<LibraryContentCache>(
      LIBRARY_CONTENT_CACHE_KEY,
      LIBRARY_CONTENT_TTL_MS,
    ),
  );
  const hasInitialCache = initialCache !== null;

  const [kanjis, setKanjis] = useState<Kanji[]>(() => initialCache?.kanjis ?? []);
  const [katakanas, setKatakanas] = useState<Kana[]>(
    () => initialCache?.katakanas ?? [],
  );
  const [hiraganas, setHiraganas] = useState<Kana[]>(
    () => initialCache?.hiraganas ?? [],
  );

  const [loadingKanjis, setLoadingKanjis] = useState(() => initialCache === null);
  const [loadingKatakanas, setLoadingKatakanas] = useState(
    () => initialCache === null,
  );
  const [loadingHiraganas, setLoadingHiraganas] = useState(
    () => initialCache === null,
  );
  const [hasResolvedInitialContent, setHasResolvedInitialContent] = useState(
    hasInitialCache,
  );

  useEffect(() => {
    let cancelled = false;
    let currentCache = initialCache;
    let settledRequests = 0;

    const markRequestAsSettled = () => {
      settledRequests += 1;

      if (settledRequests === 3) {
        setHasResolvedInitialContent(true);
      }
    };

    const persistPartialCache = (
      partial: Partial<Omit<LibraryContentCache, "loadedAt">>,
    ) => {
      currentCache = mergeLibraryContentCache(currentCache, partial);
      writeCache(LIBRARY_CONTENT_CACHE_KEY, currentCache);
    };

    const loadKanjis = async () => {
      try {
        const nextKanjis = await listKanjis();

        if (cancelled) return;

        setKanjis(nextKanjis);
        persistPartialCache({ kanjis: nextKanjis });
      } catch (error) {
        console.error("Error loading kanjis:", error);
      } finally {
        if (cancelled) return;
        setLoadingKanjis(false);
        markRequestAsSettled();
      }
    };

    const loadKatakanas = async () => {
      try {
        const nextKatakanas = await listKatakanas();

        if (cancelled) return;

        setKatakanas(nextKatakanas);
        persistPartialCache({ katakanas: nextKatakanas });
      } catch (error) {
        console.error("Error loading katakanas:", error);
      } finally {
        if (cancelled) return;
        setLoadingKatakanas(false);
        markRequestAsSettled();
      }
    };

    const loadHiraganas = async () => {
      try {
        const nextHiraganas = await listHiraganas();

        if (cancelled) return;

        setHiraganas(nextHiraganas);
        persistPartialCache({ hiraganas: nextHiraganas });
      } catch (error) {
        console.error("Error loading hiraganas:", error);
      } finally {
        if (cancelled) return;
        setLoadingHiraganas(false);
        markRequestAsSettled();
      }
    };

    void loadKanjis();
    void loadKatakanas();
    void loadHiraganas();

    return () => {
      cancelled = true;
    };
  }, [initialCache]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredKanjis = useMemo(() => {
    if (!normalizedQuery) return kanjis;

    return kanjis.filter((k) => {
      const meaning = getPrimaryMeaning(k.meanings) || "";
      const reading = getPrimaryReading(k.readings) || "";

      return (
        k.symbol.toLowerCase().includes(normalizedQuery) ||
        meaning.toLowerCase().includes(normalizedQuery) ||
        reading.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [kanjis, normalizedQuery]);

  const filteredKatakanas = useMemo(() => {
    if (!normalizedQuery) return katakanas;
    return katakanas.filter((k) =>
      k.symbol.toLowerCase().includes(normalizedQuery),
    );
  }, [katakanas, normalizedQuery]);

  const filteredHiraganas = useMemo(() => {
    if (!normalizedQuery) return hiraganas;
    return hiraganas.filter((h) =>
      h.symbol.toLowerCase().includes(normalizedQuery),
    );
  }, [hiraganas, normalizedQuery]);

  const allLibraryItems = useMemo<CombinedLibraryItem[]>(() => {
    return [
      ...filteredKanjis.map((kanji) => ({
        type: "kanji" as const,
        data: kanji,
      })),
      ...filteredHiraganas.map((hiragana) => ({
        type: "hiragana" as const,
        data: hiragana,
      })),
      ...filteredKatakanas.map((katakana) => ({
        type: "katakana" as const,
        data: katakana,
      })),
    ];
  }, [filteredKanjis, filteredHiraganas, filteredKatakanas]);

  return {
    kanjis,
    katakanas,
    hiraganas,
    filteredKanjis,
    filteredKatakanas,
    filteredHiraganas,
    allLibraryItems,
    normalizedQuery,
    isSearching: normalizedQuery.length > 0,
    isGlobalLoading: loadingKanjis || loadingKatakanas || loadingHiraganas,
    hasResolvedInitialContent,
    loadingKanjis,
    loadingKatakanas,
    loadingHiraganas,
  };
}
