"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import type { Notice } from "@/features/notices/types";
import {
  deleteUserNotification,
  getUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from "@/features/notices/services/api";
import {
  clearStoredReadNotices,
  deleteStoredNotice,
  markStoredNoticeRead,
  markAllStoredNoticesRead,
  mapBackendNotificationToNotice,
  mergeStoredWithBackendNotices,
  readStoredNotices,
  subscribeToStoredNotices,
  toggleStoredNoticePin,
  writeStoredNotices,
} from "@/features/notices/utils/noticeMappers";

export function useNotices() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncNotices = useCallback(async (nextUserId: string) => {
    const storedNotices = readStoredNotices(nextUserId);
    const response = await getUserNotifications(nextUserId);
    const backendNotices = response.notifications.map(mapBackendNotificationToNotice);
    const mergedNotices = mergeStoredWithBackendNotices(
      storedNotices,
      backendNotices,
    );

    writeStoredNotices(nextUserId, mergedNotices);
    setError(null);

    return mergedNotices;
  }, []);

  const reloadNotices = useCallback(() => {
    if (!userId) {
      return;
    }

    setIsLoading(true);

    void syncNotices(userId)
      .catch((syncError) => {
        console.error("Error recargando notificaciones:", syncError);
        setError("No se pudo sincronizar el historial de notificaciones.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [syncNotices, userId]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};
    let detachVisibilityListeners = () => {};

    const load = async () => {
      const user = await getCurrentUser().catch(() => null);

      if (cancelled || !user?.id) {
        if (!cancelled) {
          setUserId(null);
          setNotices([]);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      setUserId(user.id);
      setNotices(readStoredNotices(user.id));
      unsubscribe = subscribeToStoredNotices(user.id, setNotices);

      const refreshVisibleNotices = () => {
        if (document.visibilityState !== "visible") {
          return;
        }

        void syncNotices(user.id).catch((syncError) => {
          console.error("Error sincronizando notificaciones visibles:", syncError);
          setError("No se pudo sincronizar el historial de notificaciones.");
        });
      };

      window.addEventListener("focus", refreshVisibleNotices);
      document.addEventListener("visibilitychange", refreshVisibleNotices);
      detachVisibilityListeners = () => {
        window.removeEventListener("focus", refreshVisibleNotices);
        document.removeEventListener("visibilitychange", refreshVisibleNotices);
      };

      try {
        await syncNotices(user.id);
      } catch (syncError) {
        console.error("Error cargando historial de notificaciones:", syncError);
        setError("No se pudo sincronizar el historial de notificaciones.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      unsubscribe();
      detachVisibilityListeners();
    };
  }, [syncNotices]);

  const unreadCount = useMemo(
    () => notices.filter((notice) => !notice.read).length,
    [notices],
  );

  const pinnedCount = useMemo(
    () => notices.filter((notice) => notice.pinned).length,
    [notices],
  );

  const toggleRead = useCallback(
    (noticeId: string) => {
      if (!userId) {
        return;
      }

      const currentNotices = readStoredNotices(userId);
      const targetNotice = currentNotices.find((notice) => notice.id === noticeId);

      if (!targetNotice || targetNotice.read) {
        return;
      }

      setNotices(markStoredNoticeRead(userId, noticeId));

      void markUserNotificationRead(userId, noticeId)
        .then(() => {
          setError(null);
        })
        .catch(async (mutationError) => {
          console.error("Error marcando notificación como leída:", mutationError);

          try {
            await syncNotices(userId);
          } catch {
            writeStoredNotices(userId, currentNotices);
          }

          setError("No se pudo marcar la notificación como leída.");
        });
    },
    [syncNotices, userId],
  );

  const togglePin = useCallback(
    (noticeId: string) => {
      if (!userId) {
        return;
      }

      setNotices(toggleStoredNoticePin(userId, noticeId));
    },
    [userId],
  );

  const deleteNotice = useCallback(
    (noticeId: string) => {
      if (!userId) {
        return;
      }

      const currentNotices = readStoredNotices(userId);

      setNotices(deleteStoredNotice(userId, noticeId));

      void deleteUserNotification(userId, noticeId)
        .then(() => {
          setError(null);
        })
        .catch(async (mutationError) => {
          console.error("Error eliminando notificación:", mutationError);

          try {
            await syncNotices(userId);
          } catch {
            writeStoredNotices(userId, currentNotices);
          }

          setError("No se pudo eliminar la notificación.");
        });
    },
    [syncNotices, userId],
  );

  const markAllRead = useCallback(() => {
    if (!userId) {
      return;
    }

    const currentNotices = readStoredNotices(userId);
    const hasUnreadNotices = currentNotices.some((notice) => !notice.read);

    if (!hasUnreadNotices) {
      return;
    }

    setNotices(markAllStoredNoticesRead(userId));

    void markAllUserNotificationsRead(userId)
      .then(() => {
        setError(null);
      })
      .catch(async (mutationError) => {
        console.error("Error marcando todas las notificaciones como leídas:", mutationError);

        try {
          await syncNotices(userId);
        } catch {
          writeStoredNotices(userId, currentNotices);
        }

        setError("No se pudieron marcar todas las notificaciones como leídas.");
      });
  }, [syncNotices, userId]);

  const clearAllRead = useCallback(() => {
    if (!userId) {
      return;
    }

    const currentNotices = readStoredNotices(userId);
    const readNotices = currentNotices.filter((notice) => notice.read);

    if (readNotices.length === 0) {
      return;
    }

    setNotices(clearStoredReadNotices(userId));

    void Promise.allSettled(
      readNotices.map((notice) => deleteUserNotification(userId, notice.id)),
    ).then(async (results) => {
      if (results.some((result) => result.status === "rejected")) {
        try {
          await syncNotices(userId);
        } catch {
          writeStoredNotices(userId, currentNotices);
        }

        setError("No se pudieron eliminar todas las notificaciones leídas.");
        return;
      }

      setError(null);
    });
  }, [syncNotices, userId]);

  return {
    notices,
    isLoading,
    error,
    unreadCount,
    pinnedCount,
    toggleRead,
    togglePin,
    deleteNotice,
    markAllRead,
    clearAllRead,
    reloadNotices,
  };
}