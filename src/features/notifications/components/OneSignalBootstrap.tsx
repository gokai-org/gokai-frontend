"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/features/auth";
import {
  mapOneSignalEventToNotice,
  upsertIncomingNotice,
} from "@/features/notices/utils/noticeMappers";
import { getUserSettings } from "@/features/configuration/services/api";
import { DEFAULT_SETTINGS } from "@/features/configuration/types";
import {
  identifyOneSignalUser,
  subscribeToOneSignalNotifications,
  syncPushNotificationsForUser,
} from "@/features/notifications/lib/oneSignal";

export function OneSignalBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;
    let cleanupNotifications = () => {};

    const bootstrap = async () => {
      const [user, settings] = await Promise.all([
        getCurrentUser().catch(() => null),
        getUserSettings().catch(() => null),
      ]);

      if (cancelled || !user?.id) {
        return;
      }

      try {
        await identifyOneSignalUser(user.id);
        await syncPushNotificationsForUser({
          userId: user.id,
          enabled:
            settings?.notifications.priorityAlerts ??
            DEFAULT_SETTINGS.notifications.priorityAlerts,
          promptOnFirstVisit: true,
        });

        cleanupNotifications = await subscribeToOneSignalNotifications({
          foregroundWillDisplay: (event) => {
            const notice = mapOneSignalEventToNotice(event);

            if (notice) {
              upsertIncomingNotice(user.id, notice);
            }
          },
          click: (event) => {
            const notice = mapOneSignalEventToNotice(event);

            if (notice) {
              upsertIncomingNotice(user.id, notice, { markRead: true });
            }
          },
        });

        if (cancelled) {
          cleanupNotifications();
          cleanupNotifications = () => {};
        }
      } catch (error) {
        console.error("Error inicializando OneSignal:", error);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
      cleanupNotifications();
    };
  }, []);

  return null;
}