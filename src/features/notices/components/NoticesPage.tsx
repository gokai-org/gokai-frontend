"use client";

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { DashboardShell, DashboardHeader } from "@/features/dashboard";
import type { Notice } from "../types";
import { mockNotices } from "../mock/data";
import NoticeCard from "./NoticeCard";
import NoticesBanner from "./NoticesBanner";
import NoticeEmptyState from "./NoticeEmptyState";
import NoticeFooterCTA from "./NoticeFooterCTA";
import {
  NoticeSearchBar,
  NoticeToolbar,
  NoticeCategoryPills,
  type FilterKey,
} from "./NoticeFilters";

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  /* ── computed ── */
  const unreadCount = useMemo(
    () => notices.filter((n) => !n.read).length,
    [notices],
  );

  const pinnedCount = useMemo(
    () => notices.filter((n) => n.pinned).length,
    [notices],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notices.length };
    for (const n of notices) counts[n.category] = (counts[n.category] || 0) + 1;
    return counts;
  }, [notices]);

  const filtered = useMemo(() => {
    let result = [...notices];
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (activeFilter !== "all")
      result = result.filter((n) => n.category === activeFilter);
    if (showUnreadOnly) result = result.filter((n) => !n.read);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [notices, activeFilter, showUnreadOnly, searchQuery]);

  /* ── actions ── */
  const toggleRead = useCallback(
    (id: string) =>
      setNotices((p) =>
        p.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
      ),
    [],
  );
  const togglePin = useCallback(
    (id: string) =>
      setNotices((p) =>
        p.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
      ),
    [],
  );
  const deleteNotice = useCallback(
    (id: string) => setNotices((p) => p.filter((n) => n.id !== id)),
    [],
  );
  const markAllRead = useCallback(
    () => setNotices((p) => p.map((n) => ({ ...n, read: true }))),
    [],
  );
  const clearAllRead = useCallback(
    () => setNotices((p) => p.filter((n) => !n.read)),
    [],
  );
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setShowUnreadOnly(false);
    setActiveFilter("all");
  }, []);

  return (
    <DashboardShell
      header={
        <DashboardHeader
          icon={<Bell className="w-7 h-7 text-white" strokeWidth={2.5} />}
          title="Notificaciones"
          subtitle="Mantente al día con tu aprendizaje"
          japaneseText="通知"
          statusBadge={
            unreadCount > 0 ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#993331]/10 text-[#993331]">
                {unreadCount} sin leer
              </span>
            ) : null
          }
          rightContent={
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#993331] hover:underline transition-colors px-3 py-1.5 rounded-full hover:bg-[#993331]/5"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todo leído
                </button>
              )}
            </div>
          }
        />
      }
    >
      <div className="space-y-6 pb-12">
        {/* banner */}
        <NoticesBanner
          totalCount={notices.length}
          unreadCount={unreadCount}
          pinnedCount={pinnedCount}
        />

        {/* search + toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <NoticeSearchBar value={searchQuery} onChange={setSearchQuery} />
          <NoticeToolbar
            showUnreadOnly={showUnreadOnly}
            onToggleUnread={() => setShowUnreadOnly((p) => !p)}
            hasReadNotices={notices.some((n) => n.read)}
            onClearRead={clearAllRead}
          />
        </div>

        {/* category pills */}
        <NoticeCategoryPills
          activeFilter={activeFilter}
          onSelect={setActiveFilter}
          counts={categoryCounts}
        />

        {/* list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onToggleRead={toggleRead}
                  onTogglePin={togglePin}
                  onDelete={deleteNotice}
                />
              ))
            ) : (
              <NoticeEmptyState
                key="empty"
                searchQuery={searchQuery}
                showUnreadOnly={showUnreadOnly}
                onReset={resetFilters}
              />
            )}
          </AnimatePresence>
        </div>

        {/* footer */}
        <NoticeFooterCTA />
      </div>
    </DashboardShell>
  );
}
