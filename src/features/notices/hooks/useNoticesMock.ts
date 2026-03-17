"use client";

import { useCallback, useMemo, useState } from "react";
import type { Notice } from "@/features/notices/types";
import { mockNotices } from "@/features/notices/utils/noticeMocks";

export function useNoticesMock() {
  const [notices, setNotices] = useState<Notice[]>(mockNotices);

  const unreadCount = useMemo(
    () => notices.filter((notice) => !notice.read).length,
    [notices],
  );

  const pinnedCount = useMemo(
    () => notices.filter((notice) => notice.pinned).length,
    [notices],
  );

  const toggleRead = useCallback((id: string) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === id ? { ...notice, read: !notice.read } : notice,
      ),
    );
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === id ? { ...notice, pinned: !notice.pinned } : notice,
      ),
    );
  }, []);

  const deleteNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((notice) => notice.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotices((prev) => prev.map((notice) => ({ ...notice, read: true })));
  }, []);

  const clearAllRead = useCallback(() => {
    setNotices((prev) => prev.filter((notice) => !notice.read));
  }, []);

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