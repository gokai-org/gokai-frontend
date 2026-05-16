import { apiFetch } from "@/shared/lib/api/client";
import { mockLibrarySearchIndexPayload } from "@/features/library/services/librarySearch.mock";
import {
  EMPTY_GROUPED_LIBRARY_SEARCH_RESULTS,
  LIBRARY_SEARCH_SECTION_ORDER,
  type GroupedLibrarySearchResults,
  type LibrarySearchIndexPayload,
  type SearchIndexItem,
} from "@/features/library/types/librarySearch.types";

const LIBRARY_SEARCH_INDEX_PATH = "/api/content/library/search-index";
const LIBRARY_SEARCH_INDEX_TTL_MS = 1000 * 60 * 10;

let cachedPayload: LibrarySearchIndexPayload | null = null;
let cachedIndex: SearchIndexItem[] | null = null;

function compactStrings(values: Array<string | null | undefined>) {
  return values
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);
}

function joinSearchParts(values: Array<string | null | undefined>) {
  return compactStrings(values).join(" ");
}

export function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function createSearchIndexItem(
  input: Omit<SearchIndexItem, "normalizedTitle" | "normalizedSearchText">,
  searchParts: Array<string | null | undefined>,
): SearchIndexItem {
  return {
    ...input,
    normalizedTitle: normalizeText(input.title),
    normalizedSearchText: normalizeText(joinSearchParts(searchParts)),
  };
}

export function buildSearchIndex(payload: LibrarySearchIndexPayload) {
  return [
    ...payload.kanjis.map((kanji) =>
      createSearchIndexItem(
        {
          id: kanji.id,
          section: "kanji",
          entityType: "kanji",
          title: kanji.meanings[0] ?? kanji.symbol,
          subtitle: kanji.readings[0] ? `Lectura: ${kanji.readings[0]}` : null,
          description: null,
          thumbnail: kanji.symbol,
          symbol: kanji.symbol,
          kanji: kanji.symbol,
          kana: null,
          hiragana: null,
          romaji: null,
          readings: kanji.readings,
          meanings: kanji.meanings,
          examples: [],
          pointsToUnlock: kanji.pointsToUnlock,
          released: null,
          themeId: null,
          subthemeId: null,
        },
        [kanji.symbol, ...kanji.readings, ...kanji.meanings],
      ),
    ),
    ...payload.hiraganas.map((kana) =>
      createSearchIndexItem(
        {
          id: kana.id,
          section: "hiragana",
          entityType: "hiragana",
          title: kana.romaji || kana.symbol,
          subtitle: null,
          description: null,
          thumbnail: kana.symbol,
          symbol: kana.symbol,
          kanji: null,
          kana: kana.symbol,
          hiragana: kana.symbol,
          romaji: kana.romaji,
          readings: [],
          meanings: [],
          examples: [],
          pointsToUnlock: kana.pointsToUnlock,
          released: null,
          themeId: null,
          subthemeId: null,
        },
        [kana.symbol, kana.romaji],
      ),
    ),
    ...payload.katakanas.map((kana) =>
      createSearchIndexItem(
        {
          id: kana.id,
          section: "katakana",
          entityType: "katakana",
          title: kana.romaji || kana.symbol,
          subtitle: null,
          description: null,
          thumbnail: kana.symbol,
          symbol: kana.symbol,
          kanji: null,
          kana: kana.symbol,
          hiragana: null,
          romaji: kana.romaji,
          readings: [],
          meanings: [],
          examples: [],
          pointsToUnlock: kana.pointsToUnlock,
          released: null,
          themeId: null,
          subthemeId: null,
        },
        [kana.symbol, kana.romaji],
      ),
    ),
    ...payload.grammarLessons.map((lesson) =>
      createSearchIndexItem(
        {
          id: lesson.id,
          section: "grammar",
          entityType: "grammar",
          title: lesson.title,
          subtitle: null,
          description: lesson.description?.trim() || null,
          thumbnail: null,
          symbol: null,
          kanji: null,
          kana: null,
          hiragana: null,
          romaji: null,
          readings: [],
          meanings: [],
          examples: lesson.examples ?? [],
          pointsToUnlock: lesson.pointsToUnlock ?? null,
          released: null,
          themeId: null,
          subthemeId: null,
        },
        [lesson.title, lesson.description, ...(lesson.examples ?? []), ...(lesson.contentText ?? [])],
      ),
    ),
    ...payload.vocabularyThemes.map((theme) =>
      createSearchIndexItem(
        {
          id: theme.id,
          section: "vocabulary",
          entityType: "theme",
          title: theme.meaning,
          subtitle: compactStrings([theme.kanji, theme.kana]).join(" • ") || null,
          description: null,
          thumbnail: theme.kanji || theme.kana || null,
          symbol: null,
          kanji: theme.kanji,
          kana: theme.kana,
          hiragana: null,
          romaji: null,
          readings: [],
          meanings: [theme.meaning],
          examples: [],
          pointsToUnlock: null,
          released: theme.released,
          themeId: theme.id,
          subthemeId: null,
        },
        [theme.meaning, theme.kanji, theme.kana],
      ),
    ),
    ...payload.vocabularySubthemes.map((subtheme) =>
      createSearchIndexItem(
        {
          id: subtheme.id,
          section: "vocabulary",
          entityType: "subtheme",
          title: subtheme.meaning,
          subtitle: compactStrings([subtheme.kanji, subtheme.kana]).join(" • ") || null,
          description: null,
          thumbnail: subtheme.kanji || subtheme.kana || null,
          symbol: null,
          kanji: subtheme.kanji,
          kana: subtheme.kana,
          hiragana: null,
          romaji: null,
          readings: [],
          meanings: [subtheme.meaning],
          examples: [],
          pointsToUnlock: null,
          released: null,
          themeId: subtheme.themeId,
          subthemeId: subtheme.id,
        },
        [subtheme.meaning, subtheme.kanji, subtheme.kana],
      ),
    ),
    ...payload.vocabularyWords.map((word) =>
      createSearchIndexItem(
        {
          id: word.id,
          section: "vocabulary",
          entityType: "word",
          title: word.kanji?.trim() || word.hiragana?.trim() || word.meanings?.[0] || "Palabra",
          subtitle: compactStrings([word.hiragana, word.meanings?.join(", ")]).join(" • ") || null,
          description: null,
          thumbnail: word.icon?.trim() || word.kanji?.trim() || word.hiragana?.trim() || null,
          symbol: null,
          kanji: word.kanji?.trim() || null,
          kana: null,
          hiragana: word.hiragana?.trim() || null,
          romaji: null,
          readings: [],
          meanings: word.meanings ?? [],
          examples: [],
          pointsToUnlock: null,
          released: null,
          themeId: word.themeId,
          subthemeId: word.subthemeId,
          },
        [word.kanji, word.hiragana, ...(word.meanings ?? [])],
      ),
    ),
  ];
}

function scoreSearchItem(item: SearchIndexItem, normalizedQuery: string) {
  let score = 0;

  if (item.normalizedTitle === normalizedQuery) {
    score += 120;
  } else if (item.normalizedTitle.startsWith(normalizedQuery)) {
    score += 90;
  } else if (item.normalizedTitle.includes(normalizedQuery)) {
    score += 70;
  }

  if (item.normalizedSearchText.startsWith(normalizedQuery)) {
    score += 40;
  } else if (item.normalizedSearchText.includes(` ${normalizedQuery}`)) {
    score += 25;
  } else if (item.normalizedSearchText.includes(normalizedQuery)) {
    score += 10;
  }

  return score;
}

export function searchLibrary(index: SearchIndexItem[], query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  return [...index]
    .filter((item) => item.normalizedSearchText.includes(normalizedQuery))
    .sort((left, right) => {
      const scoreDiff = scoreSearchItem(right, normalizedQuery) - scoreSearchItem(left, normalizedQuery);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return left.title.localeCompare(right.title, "es", { sensitivity: "base" });
    });
}

export function groupSearchResultsByType(results: SearchIndexItem[]) {
  const grouped: GroupedLibrarySearchResults = {
    kanji: [],
    hiragana: [],
    katakana: [],
    grammar: [],
    vocabulary: [],
  };

  results.forEach((item) => {
    grouped[item.section].push(item);
  });

  return grouped;
}

export async function fetchLibrarySearchIndexPayload(options?: { useMockData?: boolean }) {
  if (options?.useMockData) {
    return mockLibrarySearchIndexPayload;
  }

  if (cachedPayload) {
    return cachedPayload;
  }

  const payload = await apiFetch<LibrarySearchIndexPayload>(
    LIBRARY_SEARCH_INDEX_PATH,
    { cache: "no-store" },
    {
      dedupeKey: LIBRARY_SEARCH_INDEX_PATH,
      cacheKey: LIBRARY_SEARCH_INDEX_PATH,
      cacheTtlMs: LIBRARY_SEARCH_INDEX_TTL_MS,
    },
  );

  cachedPayload = payload;
  return payload;
}

export async function getLibrarySearchIndex(options?: { useMockData?: boolean }) {
  if (options?.useMockData) {
    return buildSearchIndex(mockLibrarySearchIndexPayload);
  }

  if (cachedIndex) {
    return cachedIndex;
  }

  const payload = await fetchLibrarySearchIndexPayload(options);
  const builtIndex = buildSearchIndex(payload);
  cachedPayload = payload;
  cachedIndex = builtIndex;
  return builtIndex;
}

export function getEmptyGroupedSearchResults() {
  return LIBRARY_SEARCH_SECTION_ORDER.reduce(
    (accumulator, section) => ({
      ...accumulator,
      [section]: [],
    }),
    EMPTY_GROUPED_LIBRARY_SEARCH_RESULTS,
  );
}
