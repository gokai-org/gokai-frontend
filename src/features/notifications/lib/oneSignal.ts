const ONE_SIGNAL_APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ??
  "bc8ba5b3-be3c-4cf2-85c7-67bea1145208";

const ONE_SIGNAL_SYNC_KEY_PREFIX = "gokai-onesignal-provider";
const ONE_SIGNAL_AUTO_PROMPT_KEY_PREFIX = "gokai-onesignal-first-visit";

export interface PushNotificationState {
  supported: boolean;
  browserPermission: NotificationPermission;
  optedIn: boolean;
  providerId: string | null;
}

type OneSignalDeferredCallback = (
  oneSignal: OneSignalClient,
) => void | Promise<void>;

interface OneSignalPushSubscription {
  id?: string | null;
  optedIn?: boolean;
  optIn(): Promise<void> | void;
  optOut(): Promise<void> | void;
}

interface OneSignalClient {
  init(options: {
    appId: string;
    allowLocalhostAsSecureOrigin?: boolean;
    serviceWorkerPath?: string;
    serviceWorkerUpdaterPath?: string;
  }): Promise<void>;
  Notifications: {
    requestPermission(): Promise<void>;
  };
  User: {
    PushSubscription: OneSignalPushSubscription;
  };
}

declare global {
  interface Window {
    OneSignalDeferred?: OneSignalDeferredCallback[];
  }
}

let oneSignalInitPromise: Promise<void> | null = null;

function hasPushSupport() {
  return (
    typeof window !== "undefined" &&
    typeof Notification !== "undefined" &&
    "serviceWorker" in navigator
  );
}

function readBrowserPermission(): NotificationPermission {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "default";
  }

  return Notification.permission;
}

function readAutoPromptKey(userId: string) {
  return `${ONE_SIGNAL_AUTO_PROMPT_KEY_PREFIX}:${userId}`;
}

function markAutoPromptAttempted(userId: string) {
  window.localStorage.setItem(readAutoPromptKey(userId), "1");
}

function hasAutoPromptAttempt(userId: string) {
  return window.localStorage.getItem(readAutoPromptKey(userId)) === "1";
}

function withOneSignal<T>(
  operation: (oneSignal: OneSignalClient) => Promise<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("OneSignal solo está disponible en el navegador"));
      return;
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((oneSignal) => {
      void operation(oneSignal).then(resolve).catch(reject);
    });
  });
}

function ensureOneSignalInitialized(oneSignal: OneSignalClient) {
  if (!oneSignalInitPromise) {
    oneSignalInitPromise = oneSignal
      .init({
        appId: ONE_SIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
        serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
      })
      .catch((error) => {
        oneSignalInitPromise = null;
        throw error;
      });
  }

  return oneSignalInitPromise;
}

async function waitForProviderId(oneSignal: OneSignalClient) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const providerId = oneSignal.User.PushSubscription.id?.trim();

    if (providerId) {
      return providerId;
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 500);
    });
  }

  return null;
}

async function syncProviderId(userId: string, providerId: string) {
  const storageKey = `${ONE_SIGNAL_SYNC_KEY_PREFIX}:${userId}`;
  const previousProviderId = window.localStorage.getItem(storageKey);

  if (previousProviderId === providerId) {
    return;
  }

  const response = await fetch(`/api/users/one-signal-id/${userId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerId }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "No se pudo guardar el providerId");
  }

  window.localStorage.setItem(storageKey, providerId);
}

async function readPushState(oneSignal: OneSignalClient): Promise<PushNotificationState> {
  const permission = readBrowserPermission();
  const optedIn = Boolean(oneSignal.User.PushSubscription.optedIn);
  const providerId = permission === "granted" ? await waitForProviderId(oneSignal) : null;

  return {
    supported: true,
    browserPermission: permission,
    optedIn,
    providerId,
  };
}

export async function getPushNotificationState() {
  if (!hasPushSupport()) {
    return {
      supported: false,
      browserPermission: readBrowserPermission(),
      optedIn: false,
      providerId: null,
    } satisfies PushNotificationState;
  }

  return withOneSignal(async (oneSignal) => {
    await ensureOneSignalInitialized(oneSignal);
    return readPushState(oneSignal);
  });
}

export async function setPushNotificationsEnabled(options: {
  userId: string;
  enabled: boolean;
  autoPrompt?: boolean;
}) {
  const { userId, enabled, autoPrompt = false } = options;

  if (!hasPushSupport()) {
    return {
      supported: false,
      browserPermission: readBrowserPermission(),
      optedIn: false,
      providerId: null,
    } satisfies PushNotificationState;
  }

  return withOneSignal(async (oneSignal) => {
    await ensureOneSignalInitialized(oneSignal);

    if (enabled) {
      if (autoPrompt || readBrowserPermission() === "granted") {
        await Promise.resolve(oneSignal.User.PushSubscription.optIn());
      }

      const nextState = await readPushState(oneSignal);

      if (nextState.optedIn && nextState.providerId) {
        await syncProviderId(userId, nextState.providerId);
      }

      return nextState;
    }

    await Promise.resolve(oneSignal.User.PushSubscription.optOut());
    return readPushState(oneSignal);
  });
}

export async function syncPushNotificationsForUser(options: {
  userId: string;
  enabled: boolean;
  promptOnFirstVisit?: boolean;
}) {
  const { userId, enabled, promptOnFirstVisit = false } = options;

  if (!enabled) {
    return setPushNotificationsEnabled({ userId, enabled: false });
  }

  const shouldAutoPrompt =
    promptOnFirstVisit &&
    readBrowserPermission() === "default" &&
    !hasAutoPromptAttempt(userId);

  if (shouldAutoPrompt) {
    markAutoPromptAttempted(userId);
  }

  return setPushNotificationsEnabled({
    userId,
    enabled: true,
    autoPrompt: shouldAutoPrompt,
  });
}