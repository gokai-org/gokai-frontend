import type {
  Kanji,
  KanjiLessonResult,
  KanjiStudyProgress,
} from "@/features/kanji/types";
import type {
  Kana,
  KanaType,
  UserKanaProgressDetailedResponse,
} from "@/features/kana/types";

export const LIBRARY_CONTENT_CACHE_KEY = "gokai.library.content-cache";
export const LIBRARY_KANA_STATUS_CACHE_KEY = "gokai.library.kana-status";
export const LIBRARY_KANJI_STATUS_CACHE_KEY = "gokai.library.kanji-status";
export const KANA_USER_CACHE_KEY = "gokai.writing.kana.user-id";
export const KANJI_USER_CACHE_KEY = "gokai.writing.kanji.user-id";

export const LIBRARY_CONTENT_TTL_MS = 1000 * 60 * 10;
export const LIBRARY_STATUS_TTL_MS = 30_000;

type TimedCache = {
  loadedAt: number;
};

export type LibraryContentCache = {
  kanjis: Kanji[];
  katakanas: Kana[];
  hiraganas: Kana[];
  loadedAt: number;
};

export type LibraryKanaStatusCache = {
  userId: string;
  userKanaPoints: number;
  progressItems: UserKanaProgressDetailedResponse[];
  loadedAt: number;
};

export type LibraryKanjiStatusCache = {
  userId: string;
  userPoints: number;
  results: KanjiLessonResult[];
  progress?: KanjiStudyProgress | null;
  loadedAt: number;
};

const bootstrapCacheStore = new Map<string, unknown>();

function readStoredCache<T>(cacheKey: string): T | null {
  const memoryValue = bootstrapCacheStore.get(cacheKey);
  if (memoryValue) {
    return memoryValue as T;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as T;
    bootstrapCacheStore.set(cacheKey, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function isFresh(loadedAt: number, ttlMs: number) {
  return Date.now() - loadedAt < ttlMs;
}

export function readCache<T>(cacheKey: string) {
  return readStoredCache<T>(cacheKey);
}

export function readFreshCache<T extends TimedCache>(
  cacheKey: string,
  ttlMs: number,
) {
  const cached = readStoredCache<T>(cacheKey);
  if (!cached || typeof cached.loadedAt !== "number") {
    return null;
  }

  return isFresh(cached.loadedAt, ttlMs) ? cached : null;
}

export function writeCache<T>(cacheKey: string, value: T) {
  bootstrapCacheStore.set(cacheKey, value);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

export function clearCache(cacheKey: string) {
  bootstrapCacheStore.delete(cacheKey);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(cacheKey);
  } catch {
    // Ignore storage failures.
  }
}

export function readKnownUserId(cacheKey: string) {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(cacheKey);
  } catch {
    return null;
  }
}

export function writeKnownUserId(cacheKey: string, userId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (userId) {
      window.sessionStorage.setItem(cacheKey, userId);
      return;
    }

    window.sessionStorage.removeItem(cacheKey);
  } catch {
    // Ignore storage failures.
  }
}

export function mergeLibraryContentCache(
  previous: LibraryContentCache | null,
  next: Partial<Omit<LibraryContentCache, "loadedAt">>,
): LibraryContentCache {
  return {
    kanjis: next.kanjis ?? previous?.kanjis ?? [],
    katakanas: next.katakanas ?? previous?.katakanas ?? [],
    hiraganas: next.hiraganas ?? previous?.hiraganas ?? [],
    loadedAt: Date.now(),
  };
}

export function getCachedKanaCatalogByType(
  cache: LibraryContentCache | null,
  kanaType: KanaType,
) {
  if (!cache) {
    return [];
  }

  return kanaType === "hiragana" ? cache.hiraganas : cache.katakanas;
}