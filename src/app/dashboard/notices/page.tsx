"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCheck } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useToast } from "@/shared/ui/ToastProvider";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
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
  getPushNotificationState,
  sendLocalTestNotification,
  setPushNotificationsEnabled,
  type PushNotificationState,
} from "@/features/notifications/lib/oneSignal";

export default function Page() {
  const toast = useToast();
  const {
    notices,
    unreadCount,
    pinnedCount,
    toggleRead,
    togglePin,
    deleteNotice,
    markAllRead,
    clearAllRead,
  } = useNotices();

  const [pushState, setPushState] = useState<PushNotificationState | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushPromptLoading, setPushPromptLoading] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);
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
        toast.error("Este navegador no soporta notificaciones push.");
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

  const handleSendTestNotification = async () => {
    const pushEnabled =
      pushState?.supported &&
      pushState.browserPermission === "granted" &&
      pushState.optedIn;

    if (!pushEnabled) {
      setShowPushPrompt(true);
      toast.error("Activa las notificaciones push antes de enviar la prueba.");
      return;
    }

    setTestNotificationLoading(true);

    try {
      await sendLocalTestNotification();
      toast.success("Notificación de prueba mostrada en este navegador.");
    } catch (error) {
      console.error("Error enviando notificación de prueba:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la notificación de prueba.",
      );
    } finally {
      setTestNotificationLoading(false);
    }
  };

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
            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={testNotificationLoading || !userId}
              className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-secondary px-4 py-2 text-xs font-bold text-content-primary transition-colors hover:bg-surface-tertiary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <BellRing className="h-4 w-4" />
              {testNotificationLoading
                ? "Enviando prueba..."
                : "Enviar notificación de prueba"}
            </button>

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
          <div data-help-target="notices-categories">
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
