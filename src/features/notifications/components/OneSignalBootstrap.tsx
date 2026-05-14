"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/features/auth";
import { getUserSettings } from "@/features/configuration/services/api";
import { DEFAULT_SETTINGS } from "@/features/configuration/types";
import { syncPushNotificationsForUser } from "@/features/notifications/lib/oneSignal";

export function OneSignalBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      const [user, settings] = await Promise.all([
        getCurrentUser().catch(() => null),
        getUserSettings().catch(() => null),
      ]);

      if (cancelled || !user?.id) {
        return;
      }

      try {
        await syncPushNotificationsForUser({
          userId: user.id,
          enabled:
            settings?.notifications.priorityAlerts ??
            DEFAULT_SETTINGS.notifications.priorityAlerts,
          promptOnFirstVisit: true,
        });
      } catch (error) {
        console.error("Error inicializando OneSignal:", error);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}