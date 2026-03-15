"use client";

import { Bell, CheckCheck } from "lucide-react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
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
    <DashboardShell
      header={
        <DashboardHeader
          icon={<Bell className="h-7 w-7 text-white" strokeWidth={2.5} />}
          title="Notificaciones"
          subtitle="Mantente al día con tu aprendizaje"
          japaneseText="通知"
          statusBadge={
            unreadCount > 0 ? (
              <span className="rounded-full bg-[#993331]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#993331]">
                {unreadCount} sin leer
              </span>
            ) : null
          }
          rightContent={
            unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-[#993331] transition-colors hover:bg-[#993331]/5 hover:underline sm:flex"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todo leído
              </button>
            ) : null
          }
        />
      }
    >
      <div className="space-y-6 pb-12">
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