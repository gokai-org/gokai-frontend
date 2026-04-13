"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/features/auth";
import { getKanjiLessonResults, listKanjis } from "@/features/kanji";
import { getKanaProgress, listHiraganas, listKatakanas } from "@/features/kana/api/kanaApi";
import {
  subscribeMasteryProgressSync,
  type MasteryProgressSyncDetail,
} from "@/features/mastery/utils/masteryProgressSync";
import {
  clearCache,
  KANJI_USER_CACHE_KEY,
  KANA_USER_CACHE_KEY,
  LIBRARY_CONTENT_CACHE_KEY,
  LIBRARY_KANJI_STATUS_CACHE_KEY,
  LIBRARY_KANA_STATUS_CACHE_KEY,
  type LibraryContentCache,
  type LibraryKanjiStatusCache,
  type LibraryKanaStatusCache,
  mergeLibraryContentCache,
  readCache,
  writeCache,
  writeKnownUserId,
} from "@/shared/lib/progressBootstrapCache";

let progressBootstrapInFlight: Promise<void> | null = null;

function applyProgressSyncToCaches(detail: MasteryProgressSyncDetail) {
  if (typeof detail.kanaPoints === "number") {
    const kanaStatus = readCache<LibraryKanaStatusCache>(
      LIBRARY_KANA_STATUS_CACHE_KEY,
    );

    if (kanaStatus?.userId) {
      writeCache<LibraryKanaStatusCache>(LIBRARY_KANA_STATUS_CACHE_KEY, {
        ...kanaStatus,
        userKanaPoints: Math.max(kanaStatus.userKanaPoints, detail.kanaPoints),
        loadedAt: Date.now(),
      });
    }
  }

  if (typeof detail.points === "number") {
    const kanjiStatus = readCache<LibraryKanjiStatusCache>(
      LIBRARY_KANJI_STATUS_CACHE_KEY,
    );

    if (kanjiStatus?.userId) {
      writeCache<LibraryKanjiStatusCache>(LIBRARY_KANJI_STATUS_CACHE_KEY, {
        ...kanjiStatus,
        userPoints: Math.max(kanjiStatus.userPoints, detail.points),
        loadedAt: Date.now(),
      });
    }
  }
}

async function warmDashboardProgressCaches() {
  if (progressBootstrapInFlight) {
    return progressBootstrapInFlight;
  }

  progressBootstrapInFlight = (async () => {
    const [user, kanaProgress, kanjiResultsResponse, kanjis, hiraganas, katakanas] =
      await Promise.all([
        getCurrentUser().catch(() => null),
        getKanaProgress().catch(() => null),
        getKanjiLessonResults({ limit: 100 }).catch(() => null),
        listKanjis().catch(() => null),
        listHiraganas().catch(() => null),
        listKatakanas().catch(() => null),
      ]);

    const userId = typeof user?.id === "string" ? user.id : null;

    writeKnownUserId(KANA_USER_CACHE_KEY, userId);
    writeKnownUserId(KANJI_USER_CACHE_KEY, userId);

    if (userId) {
      writeCache<LibraryKanaStatusCache>(LIBRARY_KANA_STATUS_CACHE_KEY, {
        userId,
        userKanaPoints: typeof user?.kanaPoints === "number" ? user.kanaPoints : 0,
        progressItems: kanaProgress ?? [],
        loadedAt: Date.now(),
      });

      writeCache<LibraryKanjiStatusCache>(LIBRARY_KANJI_STATUS_CACHE_KEY, {
        userId,
        userPoints: typeof user?.points === "number" ? user.points : 0,
        results: kanjiResultsResponse?.results ?? [],
        loadedAt: Date.now(),
      });
    } else {
      clearCache(LIBRARY_KANA_STATUS_CACHE_KEY);
      clearCache(LIBRARY_KANJI_STATUS_CACHE_KEY);
    }

    if (kanjis || hiraganas || katakanas) {
      const mergedContent = mergeLibraryContentCache(
        readCache<LibraryContentCache>(LIBRARY_CONTENT_CACHE_KEY),
        {
          kanjis: kanjis ?? undefined,
          hiraganas: hiraganas ?? undefined,
          katakanas: katakanas ?? undefined,
        },
      );

      writeCache(LIBRARY_CONTENT_CACHE_KEY, mergedContent);
    }
  })().finally(() => {
    progressBootstrapInFlight = null;
  });

  return progressBootstrapInFlight;
}

export function ProgressBootstrap() {
  useEffect(() => {
    void warmDashboardProgressCaches();
  }, []);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        applyProgressSyncToCaches(detail);
      }),
    [],
  );

  return null;
}