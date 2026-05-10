const ONBOARDING_INTEREST_THEME_IDS_KEY = "gokai-onboarding-interest-theme-ids";

type StoredInterestThemeIds = {
  userId?: string;
  themeIds: string[];
};

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function normalizeThemeIds(themeIds: unknown) {
  if (!Array.isArray(themeIds)) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      themeIds
        .filter((themeId): themeId is string => typeof themeId === "string")
        .map((themeId) => themeId.trim())
        .filter(Boolean),
    ),
  );
}

function parseStoredThemeIds(raw: string | null) {
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw) as StoredInterestThemeIds | string[];
    if (Array.isArray(parsed)) {
      return normalizeThemeIds(parsed);
    }

    return normalizeThemeIds(parsed.themeIds);
  } catch {
    return [] as string[];
  }
}

export function saveOnboardingInterestThemeIds(themeIds: string[]) {
  const payload = JSON.stringify({ themeIds: normalizeThemeIds(themeIds) });
  const storages = [getLocalStorage(), getSessionStorage()].filter(
    (storage): storage is Storage => storage !== null,
  );

  for (const storage of storages) {
    try {
      storage.setItem(ONBOARDING_INTEREST_THEME_IDS_KEY, payload);
    } catch {
      // Ignore storage failures.
    }
  }
}

export function readOnboardingInterestThemeIds() {
  return normalizeThemeIds([
    ...parseStoredThemeIds(
      getLocalStorage()?.getItem(ONBOARDING_INTEREST_THEME_IDS_KEY) ?? null,
    ),
    ...parseStoredThemeIds(
      getSessionStorage()?.getItem(ONBOARDING_INTEREST_THEME_IDS_KEY) ?? null,
    ),
  ]);
}