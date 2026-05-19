"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAdminVocabularyThemes } from "@/features/admin/vocabulary/services/api";
import type { AdminVocabularyTheme } from "@/features/admin/vocabulary/types/vocabulary";
import { getAdminUsers } from "@/features/admin/users/services/api";
import { mapBackendUserToAdmin } from "@/features/admin/users/utils/userMappers";
import {
  deleteAdminUserNotification,
  deleteAllAdminUserNotifications,
  getAdminUserNotifications,
  markAdminUserNotificationRead,
  markAllAdminUserNotificationsRead,
  sendAdminDailyReview,
  sendAdminGeneralNotice,
  sendAdminStreakReminder,
  sendAdminThemeReleased,
} from "../services/api";
import type {
  AdminNotificationCampaignKind,
  AdminGeneralNoticeResult,
  AdminNotificationFilter,
  AdminNotificationUserOption,
  AdminUserNotification,
} from "../types/notifications";

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function sortNotificationsByDate(
  notifications: AdminUserNotification[],
): AdminUserNotification[] {
  return [...notifications].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return rightTime - leftTime;
  });
}

function formatFullName(firstName: string, lastName: string, email: string) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || email;
}

function formatThemeLabel(theme: AdminVocabularyTheme) {
  return [theme.kanji, theme.kana, theme.meaning].filter(Boolean).join(" • ");
}

function dedupeUsersById(
  rawUsers: AdminNotificationUserOption[],
): AdminNotificationUserOption[] {
  const indexById = new Map<string, number>();
  const deduped: AdminNotificationUserOption[] = [];

  rawUsers.forEach((user) => {
    const existingIndex = indexById.get(user.id);

    if (existingIndex == null) {
      indexById.set(user.id, deduped.length);
      deduped.push(user);
      return;
    }

    deduped[existingIndex] = user;
  });

  return deduped;
}

export function useAdminNotifications() {
  const [users, setUsers] = useState<AdminNotificationUserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [themes, setThemes] = useState<AdminVocabularyTheme[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [themesError, setThemesError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AdminUserNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notificationQuery, setNotificationQuery] = useState("");
  const [notificationFilter, setNotificationFilter] =
    useState<AdminNotificationFilter>("all");

  const [activeCampaignKind, setActiveCampaignKind] =
    useState<AdminNotificationCampaignKind>("general_notice");
  const [generalTitle, setGeneralTitle] = useState("");
  const [generalMessage, setGeneralMessage] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(
    null,
  );
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(
    null,
  );
  const [deletingAllNotifications, setDeletingAllNotifications] =
    useState(false);
  const [markingAllNotificationsRead, setMarkingAllNotificationsRead] =
    useState(false);
  const [lastDispatchResult, setLastDispatchResult] =
    useState<AdminGeneralNoticeResult | null>(null);

  const deferredUserQuery = useDeferredValue(userQuery);
  const deferredNotificationQuery = useDeferredValue(notificationQuery);
  const mountedRef = useRef(false);

  const loadUsers = useCallback(async () => {
    if (!mountedRef.current) {
      return;
    }

    setUsersLoading(true);
    setUsersError(null);

    try {
      const rawUsers = await getAdminUsers();

      if (!mountedRef.current) {
        return;
      }

      const nextUsers = dedupeUsersById(
        rawUsers
        .map((user) => mapBackendUserToAdmin(user))
        .map((user) => ({
          ...user,
          fullName: formatFullName(user.firstName, user.lastName, user.email),
        })),
      );

      setUsers(nextUsers);
      setSelectedUserId((current) => current ?? nextUsers[0]?.id ?? null);
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setUsers([]);
      setUsersError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la lista de usuarios",
      );
    } finally {
      if (mountedRef.current) {
        setUsersLoading(false);
      }
    }
  }, []);

  const loadThemes = useCallback(async () => {
    if (!mountedRef.current) {
      return;
    }

    setThemesLoading(true);
    setThemesError(null);

    try {
      const nextThemes = await getAdminVocabularyThemes();

      if (!mountedRef.current) {
        return;
      }

      setThemes(nextThemes);
      setSelectedThemeId((current) => current || nextThemes[0]?.id || "");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setThemes([]);
      setThemesError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los temas disponibles",
      );
    } finally {
      if (mountedRef.current) {
        setThemesLoading(false);
      }
    }
  }, []);

  const loadNotifications = useCallback(async (userId: string) => {
    if (!mountedRef.current) {
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const response = await getAdminUserNotifications(userId);

      if (!mountedRef.current) {
        return;
      }

      setNotifications(sortNotificationsByDate(response.notifications));
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setNotifications([]);
      setNotificationsError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial del usuario",
      );
    } finally {
      if (mountedRef.current) {
        setNotificationsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadUsers();
    void loadThemes();

    return () => {
      mountedRef.current = false;
    };
  }, [loadThemes, loadUsers]);

  useEffect(() => {
    if (!selectedUserId) {
      setNotifications([]);
      setNotificationsError(null);
      return;
    }

    void loadNotifications(selectedUserId);
  }, [loadNotifications, selectedUserId]);

  const filteredUsers = useMemo(() => {
    const query = normalize(deferredUserQuery);

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      normalize(
        [user.fullName, user.email, user.id, user.profile].join(" "),
      ).includes(query),
    );
  }, [deferredUserQuery, users]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? null,
    [selectedThemeId, themes],
  );

  const filteredNotifications = useMemo(() => {
    const query = normalize(deferredNotificationQuery);

    return notifications.filter((notification) => {
      const matchesQuery = query
        ? normalize(
            [
              notification.title,
              notification.message,
              notification.type,
              notification.id,
            ].join(" "),
          ).includes(query)
        : true;

      const matchesFilter =
        notificationFilter === "all"
          ? true
          : notificationFilter === "unread"
            ? !notification.readAt
            : Boolean(notification.readAt);

      return matchesQuery && matchesFilter;
    });
  }, [deferredNotificationQuery, notificationFilter, notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  const sendCurrentCampaign = useCallback(async () => {
    setSendingCampaign(true);

    try {
      let title = "";
      let audienceLabel = "";
      let response;

      switch (activeCampaignKind) {
        case "general_notice": {
          const nextTitle = generalTitle.trim();
          const nextMessage = generalMessage.trim();

          if (!nextTitle || !nextMessage) {
            throw new Error("Completa el titulo y el mensaje antes de enviar.");
          }

          title = nextTitle;
          audienceLabel = "Usuarios elegibles con inbox y push activo";
          response = await sendAdminGeneralNotice({
            title: nextTitle,
            message: nextMessage,
          });
          break;
        }
        case "daily_review": {
          title = "Repaso diario";
          audienceLabel = "Usuarios con repasos pendientes y push disponible";
          response = await sendAdminDailyReview();
          break;
        }
        case "streak_reminder": {
          title = "Recordatorio de racha";
          audienceLabel = "Usuarios con racha activa y push disponible";
          response = await sendAdminStreakReminder();
          break;
        }
        case "theme_released": {
          if (!selectedTheme) {
            throw new Error("Selecciona un tema antes de anunciarlo.");
          }

          title = `Tema liberado: ${formatThemeLabel(selectedTheme)}`;
          audienceLabel = "Usuarios interesados en el tema seleccionado";
          response = await sendAdminThemeReleased({
            themeId: selectedTheme.id,
            themeName: selectedTheme.meaning,
          });
          break;
        }
      }

      const result = {
        ...response,
        sentAt: Date.now(),
        kind: activeCampaignKind,
        title,
        audienceLabel,
      } satisfies AdminGeneralNoticeResult;

      if (mountedRef.current) {
        setLastDispatchResult(result);

        if (activeCampaignKind === "general_notice") {
          setGeneralTitle("");
          setGeneralMessage("");
        }
      }

      return result;
    } finally {
      if (mountedRef.current) {
        setSendingCampaign(false);
      }
    }
  }, [
    activeCampaignKind,
    generalMessage,
    generalTitle,
    selectedTheme,
  ]);

  const reloadSelectedUserNotifications = useCallback(async () => {
    if (!selectedUserId) {
      return;
    }

    await loadNotifications(selectedUserId);
  }, [loadNotifications, selectedUserId]);

  const removeNotification = useCallback(
    async (notificationId: string) => {
      if (!selectedUserId) {
        throw new Error("Selecciona un usuario primero.");
      }

      setDeletingNotificationId(notificationId);

      try {
        await deleteAdminUserNotification(selectedUserId, notificationId);

        if (!mountedRef.current) {
          return;
        }

        setNotifications((current) =>
          current.filter((notification) => notification.id !== notificationId),
        );
      } finally {
        if (mountedRef.current) {
          setDeletingNotificationId(null);
        }
      }
    },
    [selectedUserId],
  );

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!selectedUserId) {
        throw new Error("Selecciona un usuario primero.");
      }

      const existing = notifications.find(
        (notification) => notification.id === notificationId,
      );
      if (existing?.readAt) {
        return;
      }

      setMarkingNotificationId(notificationId);

      try {
        await markAdminUserNotificationRead(selectedUserId, notificationId);

        if (!mountedRef.current) {
          return;
        }

        const readAt = new Date().toISOString();
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? { ...notification, readAt: notification.readAt ?? readAt }
              : notification,
          ),
        );
      } finally {
        if (mountedRef.current) {
          setMarkingNotificationId(null);
        }
      }
    },
    [notifications, selectedUserId],
  );

  const clearSelectedUserNotifications = useCallback(async () => {
    if (!selectedUserId) {
      throw new Error("Selecciona un usuario primero.");
    }

    setDeletingAllNotifications(true);

    try {
      await deleteAllAdminUserNotifications(selectedUserId);

      if (mountedRef.current) {
        setNotifications([]);
      }
    } finally {
      if (mountedRef.current) {
        setDeletingAllNotifications(false);
      }
    }
  }, [selectedUserId]);

  const markAllSelectedUserNotificationsRead = useCallback(async () => {
    if (!selectedUserId) {
      throw new Error("Selecciona un usuario primero.");
    }

    setMarkingAllNotificationsRead(true);

    try {
      await markAllAdminUserNotificationsRead(selectedUserId);

      if (!mountedRef.current) {
        return;
      }

      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? readAt,
        })),
      );
    } finally {
      if (mountedRef.current) {
        setMarkingAllNotificationsRead(false);
      }
    }
  }, [selectedUserId]);

  return {
    users,
    filteredUsers,
    usersLoading,
    usersError,
    userQuery,
    setUserQuery,
    themes,
    themesLoading,
    themesError,
    activeCampaignKind,
    setActiveCampaignKind,
    selectedTheme,
    selectedThemeId,
    setSelectedThemeId,
    supportedCampaignCount: 4,
    selectedUser,
    selectedUserId,
    setSelectedUserId,
    notifications,
    filteredNotifications,
    notificationsLoading,
    notificationsError,
    notificationQuery,
    setNotificationQuery,
    notificationFilter,
    setNotificationFilter,
    unreadCount,
    generalTitle,
    setGeneralTitle,
    generalMessage,
    setGeneralMessage,
    sendingCampaign,
    sendCurrentCampaign,
    lastDispatchResult,
    deletingNotificationId,
    markingNotificationId,
    deletingAllNotifications,
    markingAllNotificationsRead,
    reloadUsers: loadUsers,
    reloadThemes: loadThemes,
    reloadSelectedUserNotifications,
    removeNotification,
    markNotificationAsRead,
    markAllSelectedUserNotificationsRead,
    clearSelectedUserNotifications,
  };
}