"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getAdminUsers } from "../services/api";
import { mapBackendUserToAdmin } from "../utils/userMappers";
import type { AdminUser } from "../types/users";

export type UserStatusFilter = "all" | "subscribed" | "free" | "google";

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function dedupeUsersById(
  rawUsers: ReturnType<typeof mapBackendUserToAdmin>[],
): AdminUser[] {
  const indexById = new Map<string, number>();
  const deduped: AdminUser[] = [];

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

export function useAdminUsers() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [hasGoogleData, setHasGoogleData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const mountedRef = useRef(false);

  const loadUsers = useCallback(async (silent = false) => {
    if (!mountedRef.current) return;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const raw = await getAdminUsers();

      if (!mountedRef.current) return;

      setHasGoogleData(
        raw.some(
          (user) =>
            typeof user.is_google_user === "boolean" ||
            typeof user.isGoogleUser === "boolean",
        ),
      );
      setUsers((prev) => {
        const previousById = new Map(prev.map((user) => [user.id, user]));
        const mappedUsers = raw.map((user) =>
          mapBackendUserToAdmin(user, previousById.get(user.id)),
        );

        return dedupeUsersById(mappedUsers);
      });
      setLastUpdatedAt(Date.now());
    } catch (err) {
      if (!mountedRef.current) return;

      if (!silent) {
        setUsers([]);
      }

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar usuarios desde backend",
      );
    } finally {
      if (!mountedRef.current) return;

      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadUsers(false);

    return () => {
      mountedRef.current = false;
    };
  }, [loadUsers]);

  useEffect(() => {
    const POLLING_INTERVAL_MS = 30000;

    const timer = window.setInterval(() => {
      void loadUsers(true);
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadUsers]);

  useEffect(() => {
    const onFocus = () => {
      void loadUsers(true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadUsers(true);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadUsers]);

  const reloadUsers = useCallback(async () => {
    await loadUsers(true);
  }, [loadUsers]);

  const summary = useMemo(() => {
    const source = users;

    return {
      total: source.length,
      subscribed: source.filter((x) => x.subscribed).length,
      free: source.filter((x) => !x.subscribed).length,
      google: source.filter((x) => x.isGoogleUser === true).length,
    };
  }, [users]);

  const searchableUsers = useMemo(
    () =>
      users.map((user) => ({
        user,
        searchable: normalize(
          [
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.profile,
          ].join(" "),
        ),
      })),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const q = normalize(deferredQuery);

    return searchableUsers
      .filter(({ user, searchable }) => {
        const matchStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "subscribed"
              ? user.subscribed
              : statusFilter === "free"
                ? !user.subscribed
                : statusFilter === "google"
                  ? user.isGoogleUser
                  : true;
        const matchQuery = q ? searchable.includes(q) : true;

        return matchStatus && matchQuery;
      })
      .map(({ user }) => user);
  }, [deferredQuery, searchableUsers, statusFilter]);

  function replaceUser(updated: AdminUser) {
    setUsers((prev) =>
      prev.map((user) => (user.id === updated.id ? updated : user)),
    );
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }

  return {
    query,
    setQuery,
    loading,
    isRefreshing,
    lastUpdatedAt,
    error,
    hasGoogleData,
    statusFilter,
    setStatusFilter,
    summary,
    filteredUsers,
    allUsers: users,
    reloadUsers,
    replaceUser,
    removeUser,
  };
}
