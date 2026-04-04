"use client";

import { useCallback, useMemo, useState } from "react";
import type { Notice, NoticeCategoryItem } from "@/features/notices/types";

export function useNoticeFilters(notices: Notice[]) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const categories = useMemo<NoticeCategoryItem[]>(() => {
    const counts = {
      lesson: 0,
      review: 0,
      achievement: 0,
      streak: 0,
      system: 0,
    };

    notices.forEach((notice) => {
      counts[notice.category] += 1;
    });

    return [
      { id: "lesson", name: "Lecciones", count: counts.lesson },
      { id: "review", name: "Revisiones", count: counts.review },
      { id: "achievement", name: "Logros", count: counts.achievement },
      { id: "streak", name: "Racha", count: counts.streak },
      { id: "system", name: "Sistema", count: counts.system },
    ];
  }, [notices]);

  const filteredNotices = useMemo(() => {
    let result = [...notices];

    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (selectedCategory) {
      result = result.filter((notice) => notice.category === selectedCategory);
    }

    if (showUnreadOnly) {
      result = result.filter((notice) => !notice.read);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (notice) =>
          notice.title.toLowerCase().includes(query) ||
          notice.description.toLowerCase().includes(query),
      );
    }

    return result;
  }, [notices, searchQuery, selectedCategory, showUnreadOnly]);

  const resetFilters = useCallback(() => {
    setSelectedCategory(null);
    setSearchQuery("");
    setShowUnreadOnly(false);
  }, []);

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    showUnreadOnly,
    setShowUnreadOnly,
    categories,
    filteredNotices,
    resetFilters,
  };
}
