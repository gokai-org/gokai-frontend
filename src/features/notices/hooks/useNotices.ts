"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import type { Notice } from "@/features/notices/types";
import {
  clearStoredReadNotices,
  deleteStoredNotice,
  markAllStoredNoticesRead,
  readStoredNotices,
  subscribeToStoredNotices,
  toggleStoredNoticePin,
  toggleStoredNoticeRead,
} from "@/features/notices/utils/noticeMappers";

export function useNotices() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    const load = async () => {
      const user = await getCurrentUser().catch(() => null);

      if (cancelled || !user?.id) {
        if (!cancelled) {
          setUserId(null);
          setNotices([]);
        }
        return;
      }

      setUserId(user.id);
      setNotices(readStoredNotices(user.id));
      unsubscribe = subscribeToStoredNotices(user.id, setNotices);
    };

    void load();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

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

      setNotices(toggleStoredNoticeRead(userId, noticeId));
    },
    [userId],
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

      setNotices(deleteStoredNotice(userId, noticeId));
    },
    [userId],
  );

  const markAllRead = useCallback(() => {
    if (!userId) {
      return;
    }

    setNotices(markAllStoredNoticesRead(userId));
  }, [userId]);

  const clearAllRead = useCallback(() => {
    if (!userId) {
      return;
    }

    setNotices(clearStoredReadNotices(userId));
  }, [userId]);

  return {
    notices,
    unreadCount,
    pinnedCount,
    toggleRead,
    togglePin,
    deleteNotice,
    markAllRead,
    clearAllRead,
  };
}