const ONBOARDING_INTEREST_THEME_IDS_KEY = "gokai-onboarding-interest-theme-ids";

type StoredInterestThemeIds = {
  userId?: string;
  themeIds: string[];
};

function normalizeUserId(userId: unknown) {
  return typeof userId === "string" ? userId.trim() : "";
}

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

function parseStoredThemeIds(raw: string | null): StoredInterestThemeIds | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredInterestThemeIds | string[];
    if (Array.isArray(parsed)) {
      return {
        userId: "",
        themeIds: normalizeThemeIds(parsed),
      };
    }

    return {
      userId: normalizeUserId(parsed.userId),
      themeIds: normalizeThemeIds(parsed.themeIds),
    };
  } catch {
    return null;
  }
}

function shouldUseStoredThemeIds(
  stored: StoredInterestThemeIds | null,
  userId?: string | null,
) {
  if (!stored || stored.themeIds.length === 0) {
    return false;
  }

  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) {
    return false;
  }

  return stored.userId === normalizedUserId;
}

export function saveOnboardingInterestThemeIds(
  themeIds: string[],
  userId?: string | null,
) {
  const payload = JSON.stringify({
    userId: normalizeUserId(userId) || undefined,
    themeIds: normalizeThemeIds(themeIds),
  });
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

export function readOnboardingInterestThemeIds(userId?: string | null) {
  const localStored = parseStoredThemeIds(
    getLocalStorage()?.getItem(ONBOARDING_INTEREST_THEME_IDS_KEY) ?? null,
  );
  const sessionStored = parseStoredThemeIds(
    getSessionStorage()?.getItem(ONBOARDING_INTEREST_THEME_IDS_KEY) ?? null,
  );
  const localThemeIds = shouldUseStoredThemeIds(localStored, userId)
    ? (localStored?.themeIds ?? [])
    : [];
  const sessionThemeIds = shouldUseStoredThemeIds(sessionStored, userId)
    ? (sessionStored?.themeIds ?? [])
    : [];

  return normalizeThemeIds([
    ...localThemeIds,
    ...sessionThemeIds,
  ]);
}