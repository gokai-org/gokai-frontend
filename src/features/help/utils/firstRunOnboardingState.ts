const PENDING_KEY = "gokai:first-run-onboarding:pending";
const SESSION_ACTIVE_KEY = "gokai:first-run-onboarding:active";
const SESSION_SEEN_KEY = "gokai:first-run-onboarding:seen-pages";

function safeSessionStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

function safeLocalStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readFirstRunSeenPages() {
  const storage = safeSessionStorage();
  if (!storage) return new Set<string>();

  try {
    const parsed = JSON.parse(storage.getItem(SESSION_SEEN_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
  } catch {
    return new Set<string>();
  }
}

export function writeFirstRunSeenPages(seenPages: Set<string>) {
  safeSessionStorage()?.setItem(
    SESSION_SEEN_KEY,
    JSON.stringify(Array.from(seenPages)),
  );
}

export function markFirstRunOnboardingPending() {
  const localStorageRef = safeLocalStorage();
  const sessionStorageRef = safeSessionStorage();

  localStorageRef?.setItem(PENDING_KEY, String(Date.now()));
  sessionStorageRef?.removeItem(SESSION_ACTIVE_KEY);
  sessionStorageRef?.removeItem(SESSION_SEEN_KEY);
}

export function activateFirstRunOnboardingSession() {
  const localStorageRef = safeLocalStorage();
  const sessionStorageRef = safeSessionStorage();

  if (!localStorageRef || !sessionStorageRef) return false;

  if (sessionStorageRef.getItem(SESSION_ACTIVE_KEY) === "true") {
    return true;
  }

  if (!localStorageRef.getItem(PENDING_KEY)) {
    return false;
  }

  sessionStorageRef.setItem(SESSION_ACTIVE_KEY, "true");
  sessionStorageRef.removeItem(SESSION_SEEN_KEY);
  localStorageRef.removeItem(PENDING_KEY);
  return true;
}

export function clearFirstRunOnboardingSession() {
  const sessionStorageRef = safeSessionStorage();

  sessionStorageRef?.removeItem(SESSION_ACTIVE_KEY);
  sessionStorageRef?.removeItem(SESSION_SEEN_KEY);
}
