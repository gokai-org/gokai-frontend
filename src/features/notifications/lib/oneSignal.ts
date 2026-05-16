import { notificationsConfig } from "@/shared/config";

const ONE_SIGNAL_APP_ID = notificationsConfig.oneSignalAppId;

const ONE_SIGNAL_SYNC_KEY_PREFIX = "gokai-onesignal-provider";
const ONE_SIGNAL_AUTO_PROMPT_KEY_PREFIX = "gokai-onesignal-first-visit";

export interface PushNotificationState {
  supported: boolean;
  browserPermission: NotificationPermission;
  optedIn: boolean;
  providerId: string | null;
  unsupportedReason: string | null;
  requiresHomeScreen: boolean;
}

export type OneSignalNotificationEventName =
  | "click"
  | "dismiss"
  | "foregroundWillDisplay";

export type OneSignalNotificationEventHandler = (event: unknown) => void;

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
  login?(externalId: string): Promise<void>;
  logout?(): Promise<void>;
  Notifications: {
    requestPermission(): Promise<void>;
    addEventListener(
      eventName: OneSignalNotificationEventName,
      handler: OneSignalNotificationEventHandler,
    ): void;
    removeEventListener(
      eventName: OneSignalNotificationEventName,
      handler: OneSignalNotificationEventHandler,
    ): void;
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

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  const { userAgent, platform, maxTouchPoints } = window.navigator;

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

function isStandaloneWebApp() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigatorWithStandalone.standalone)
  );
}

function readUnsupportedReason() {
  if (typeof window === "undefined") {
    return null;
  }

  if (isIosDevice() && !isStandaloneWebApp()) {
    return "En iPhone y iPad las notificaciones web solo funcionan si agregas GOKAI a la pantalla de inicio y la abres desde ahí.";
  }

  if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) {
    return "Este navegador no admite notificaciones push en este dispositivo.";
  }

  return null;
}

function hasPushSupport() {
  return readUnsupportedReason() === null;
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
    unsupportedReason: null,
    requiresHomeScreen: false,
  };
}

export async function getPushNotificationState() {
  const unsupportedReason = readUnsupportedReason();

  if (!hasPushSupport()) {
    return {
      supported: false,
      browserPermission: readBrowserPermission(),
      optedIn: false,
      providerId: null,
      unsupportedReason,
      requiresHomeScreen: Boolean(unsupportedReason && isIosDevice()),
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
  const unsupportedReason = readUnsupportedReason();

  if (!hasPushSupport()) {
    return {
      supported: false,
      browserPermission: readBrowserPermission(),
      optedIn: false,
      providerId: null,
      unsupportedReason,
      requiresHomeScreen: Boolean(unsupportedReason && isIosDevice()),
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

export function runWithOneSignal<T>(
  operation: (oneSignal: OneSignalClient) => Promise<T>,
) {
  return withOneSignal(operation);
}

export async function identifyOneSignalUser(userId: string) {
  if (!hasPushSupport()) {
    return;
  }

  await withOneSignal(async (oneSignal) => {
    await ensureOneSignalInitialized(oneSignal);
    await oneSignal.login?.(userId);
  });
}

export async function subscribeToOneSignalNotifications(
  handlers: Partial<
    Record<OneSignalNotificationEventName, OneSignalNotificationEventHandler>
  >,
) {
  if (!hasPushSupport()) {
    return () => {};
  }

  return withOneSignal(async (oneSignal) => {
    await ensureOneSignalInitialized(oneSignal);

    const entries = Object.entries(handlers).filter((entry) =>
      Boolean(entry[1]),
    ) as Array<[OneSignalNotificationEventName, OneSignalNotificationEventHandler]>;

    entries.forEach(([eventName, handler]) => {
      oneSignal.Notifications.addEventListener(eventName, handler);
    });

    return () => {
      entries.forEach(([eventName, handler]) => {
        oneSignal.Notifications.removeEventListener(eventName, handler);
      });
    };
  });
}

export function getPushUnavailableMessage(
  pushState: PushNotificationState | null | undefined,
) {
  return (
    pushState?.unsupportedReason ??
    "Este navegador no admite notificaciones push en este dispositivo."
  );
}