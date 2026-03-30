"use client";

import { CheckCheck } from "lucide-react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import {
  useNoticesMock,
  useNoticeFilters,
  NoticesBanner,
  NoticeFooterCTA,
  NoticeCategoryFilter,
  NoticeList,
  NoticeSearchBar,
  NoticeToolbar,
} from "@/features/notices";

export default function Page() {
  const {
    notices,
    unreadCount,
    pinnedCount,
    toggleRead,
    togglePin,
    deleteNotice,
    markAllRead,
    clearAllRead,
  } = useNoticesMock();

  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    showUnreadOnly,
    setShowUnreadOnly,
    categories,
    filteredNotices,
    resetFilters,
  } = useNoticeFilters(notices);

  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  return (
    <DashboardShell>
      <div className="space-y-6 pb-12">
        {unreadCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#993331]/10 px-2.5 py-0.5 text-xs font-bold text-[#993331]">
              {unreadCount} sin leer
            </span>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-[#993331] transition-colors hover:bg-[#993331]/5 hover:underline"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todo leído
            </button>
          </div>
        )}

        <AnimatedEntrance
          index={0}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <NoticesBanner
            totalCount={notices.length}
            unreadCount={unreadCount}
            pinnedCount={pinnedCount}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <NoticeSearchBar value={searchQuery} onChange={setSearchQuery} />
            <NoticeToolbar
              showUnreadOnly={showUnreadOnly}
              onToggleUnread={() => setShowUnreadOnly((prev) => !prev)}
              hasReadNotices={notices.some((notice) => notice.read)}
              onClearRead={clearAllRead}
            />
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance
          index={2}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <NoticeCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={3}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <NoticeList
            notices={filteredNotices}
            searchQuery={searchQuery}
            showUnreadOnly={showUnreadOnly}
            onReset={resetFilters}
            onToggleRead={toggleRead}
            onTogglePin={togglePin}
            onDelete={deleteNotice}
            animationsEnabled={animationsEnabled}
            heavyAnimationsEnabled={heavyAnimationsEnabled}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={4}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <NoticeFooterCTA />
        </AnimatedEntrance>
      </div>
    </DashboardShell>
  );
}