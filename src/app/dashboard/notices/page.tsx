"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCheck, RefreshCcw } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useToast } from "@/shared/ui/ToastProvider";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { cls } from "@/features/notices/utils/noticeConfig";
import {
  NoticePushPromptModal,
  useNotices,
  useNoticeFilters,
  NoticesBanner,
  NoticeFooterCTA,
  NoticeCategoryFilter,
  NoticeList,
  NoticeSearchBar,
  NoticeToolbar,
} from "@/features/notices";
import {
  getPushUnavailableMessage,
  getPushNotificationState,
  setPushNotificationsEnabled,
  type PushNotificationState,
} from "@/features/notifications/lib/oneSignal";

export default function Page() {
  const toast = useToast();
  const {
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
  } = useNotices();

  const [pushState, setPushState] = useState<PushNotificationState | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushPromptLoading, setPushPromptLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;

    const loadPushState = async () => {
      try {
        const user = await getCurrentUser().catch(() => null);

        if (cancelled || !user?.id) {
          return;
        }

        setUserId(user.id);

        const state = await getPushNotificationState().catch((error) => {
          console.error("Error leyendo estado push en notices:", error);

          return {
            supported: false,
            browserPermission: "default" as const,
            optedIn: false,
            providerId: null,
            unsupportedReason: null,
            requiresHomeScreen: false,
          } satisfies PushNotificationState;
        });

        if (cancelled) {
          return;
        }

        setPushState(state);

        const pushEnabled =
          state.supported &&
          state.browserPermission === "granted" &&
          state.optedIn;

        setShowPushPrompt(state.supported && !pushEnabled);
      } catch (error) {
        console.error("Error preparando prompt de notificaciones:", error);
      }
    };

    void loadPushState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    toast.error(error);
  }, [error, toast]);

  const handleActivatePush = async () => {
    if (!userId) {
      toast.error("No se pudo identificar al usuario.");
      return;
    }

    setPushPromptLoading(true);

    try {
      const nextState = await setPushNotificationsEnabled({
        userId,
        enabled: true,
        autoPrompt: true,
      });

      setPushState(nextState);

      const pushEnabled =
        nextState.browserPermission === "granted" && nextState.optedIn;

      if (pushEnabled) {
        setShowPushPrompt(false);
        toast.success("Notificaciones activadas en este navegador.");
        return;
      }

      if (!nextState.supported) {
        setShowPushPrompt(false);
        toast.error(getPushUnavailableMessage(nextState));
        return;
      }

      if (nextState.browserPermission === "denied") {
        toast.error(
          "Las notificaciones están bloqueadas en el navegador. Habilítalas en permisos del sitio.",
        );
        return;
      }

      toast.error("No se pudieron activar las notificaciones push.");
    } catch (error) {
      console.error("Error activando notificaciones desde notices:", error);
      toast.error("No se pudieron activar las notificaciones push.");
    } finally {
      setPushPromptLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-primary p-5"
        >
          <div className="animate-pulse space-y-3">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-surface-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded-full bg-surface-secondary" />
                <div className="h-3 w-24 rounded-full bg-surface-secondary" />
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-secondary" />
            <div className="h-3 w-4/5 rounded-full bg-surface-secondary" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardShell>
      <NoticePushPromptModal
        isOpen={showPushPrompt}
        pushState={pushState}
        loading={pushPromptLoading}
        onClose={() => setShowPushPrompt(false)}
        onActivate={handleActivatePush}
      />

      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                {unreadCount} sin leer
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent/5 hover:underline"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todo leído
              </button>
            )}
          </div>
        </div>

        <AnimatedEntrance
          index={0}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div data-help-target="notices-banner">
            <NoticesBanner
              totalCount={notices.length}
              unreadCount={unreadCount}
              pinnedCount={pinnedCount}
            />
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div
            data-help-target="notices-tools"
            className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
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
          <div data-help-target="notices-categories" className="space-y-3">
            {error && (
              <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Estás viendo la última copia local disponible. Reintenta para
                    sincronizar el historial completo.
                  </p>
                </div>

                <button
                  onClick={reloadNotices}
                  className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reintentar
                </button>
              </div>
            )}

            <NoticeCategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance
          index={3}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div data-help-target="notices-list">
            {isLoading && notices.length === 0 ? (
              renderLoadingState()
            ) : (
              <div className={cls(isLoading && "opacity-70 transition-opacity")}>
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
              </div>
            )}
          </div>
        </AnimatedEntrance>

        <AnimatedEntrance
          index={4}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <div data-help-target="notices-footer">
            <NoticeFooterCTA />
          </div>
        </AnimatedEntrance>
      </div>
    </DashboardShell>
  );
}
