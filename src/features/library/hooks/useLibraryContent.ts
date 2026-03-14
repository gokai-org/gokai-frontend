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

export type CombinedLibraryItem =
  | { type: "kanji"; data: Kanji }
  | { type: "katakana"; data: Kana }
  | { type: "hiragana"; data: Kana };

export function useLibraryContent(searchQuery: string) {
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [katakanas, setKatakanas] = useState<Kana[]>([]);
  const [hiraganas, setHiraganas] = useState<Kana[]>([]);

  const [loadingKanjis, setLoadingKanjis] = useState(true);
  const [loadingKatakanas, setLoadingKatakanas] = useState(true);
  const [loadingHiraganas, setLoadingHiraganas] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await listKanjis();
        setKanjis(res);
      } catch (e) {
        console.error("Error loading kanjis:", e);
      } finally {
        setLoadingKanjis(false);
      }
    })();

    (async () => {
      try {
        const res = await listKatakanas();
        setKatakanas(res);
      } catch (e) {
        console.error("Error loading katakanas:", e);
      } finally {
        setLoadingKatakanas(false);
      }
    })();

    (async () => {
      try {
        const res = await listHiraganas();
        setHiraganas(res);
      } catch (e) {
        console.error("Error loading hiraganas:", e);
      } finally {
        setLoadingHiraganas(false);
      }
    })();
  }, []);

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
      ...filteredKanjis.map((kanji) => ({ type: "kanji" as const, data: kanji })),
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
    isGlobalLoading:
      loadingKanjis || loadingKatakanas || loadingHiraganas,
    loadingKanjis,
    loadingKatakanas,
    loadingHiraganas,
  };
}