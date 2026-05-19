"use client";

import { BellRing, Inbox, Layers3, Sparkles, Users } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";
import { useToast } from "@/shared/ui/ToastProvider";
import { AdminNotificationDispatchCenter } from "./AdminNotificationDispatchCenter";
import { AdminNotificationsHeader } from "./AdminNotificationsHeader";
import { AdminUserNotificationsPanel } from "./AdminUserNotificationsPanel";
import { useAdminNotifications } from "../hooks/useAdminNotifications";
import type {
  AdminGeneralNoticeResult,
  AdminNotificationCampaignKind,
} from "../types/notifications";

function formatCampaignLabel(kind: AdminNotificationCampaignKind) {
  switch (kind) {
    case "general_notice":
      return "Aviso general";
    case "daily_review":
      return "Recordatorio de estudio";
    case "streak_reminder":
      return "Recordatorio de avance";
    case "theme_released":
      return "Aviso por tema";
  }
}

function formatDispatchLabel(result: AdminGeneralNoticeResult) {
  const deliverySuffix =
    result.deliveryMode === "inbox_only" ? " • solo en app" : " • alerta y app";

  return `${formatCampaignLabel(result.kind)} • ${result.sent} enviados${deliverySuffix} • ${new Date(result.sentAt).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function AdminNotificationsPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();
  const toast = useToast();
  const {
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
    supportedCampaignCount,
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
    markingNotificationId,
    deletingNotificationId,
    markingAllNotificationsRead,
    deletingAllNotifications,
    reloadSelectedUserNotifications,
    markNotificationAsRead,
    markAllSelectedUserNotificationsRead,
    removeNotification,
    clearSelectedUserNotifications,
  } = useAdminNotifications();

  const lastDispatchLabel = lastDispatchResult
    ? formatDispatchLabel(lastDispatchResult)
    : "Sin envios recientes";
  const activeCampaignLabel = formatCampaignLabel(activeCampaignKind);

  const handleSendCampaign = async () => {
    try {
      const result = await sendCurrentCampaign();
      const campaignLabel = formatCampaignLabel(result.kind);

      if (result.deliveryMode === "inbox_only") {
        toast.warning(
          `${campaignLabel} guardado para ${result.sent} personas. La alerta externa no salió.`,
          7000,
        );
        return;
      }

      toast.success(`${campaignLabel} enviado a ${result.sent} destinatarios.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo realizar el envío.",
      );
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      toast.success("Notificacion marcada como leida.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo marcar la notificación.",
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllSelectedUserNotificationsRead();
      toast.success("Historial marcado como leido.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el historial.",
      );
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await removeNotification(notificationId);
      toast.success("Notificacion eliminada del usuario.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo borrar el mensaje.",
      );
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await clearSelectedUserNotifications();
      toast.success("Historial del usuario eliminado correctamente.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo borrar el historial.",
      );
    }
  };

  return (
    <AdminDashboardShell
      header={
        <AdminNotificationsHeader
          activeCampaignLabel={activeCampaignLabel}
          selectedUserName={selectedUser?.fullName ?? null}
          unreadCount={unreadCount}
          lastDispatchLabel={lastDispatchLabel}
        />
      }
      containerClassName="max-w-[1680px] px-3 sm:px-5 lg:px-6"
    >
      <div className="space-y-6 pb-8">
        <AnimatedEntrance
          index={0}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <AdminMetricCard
              title="Personas"
              value={String(users.length)}
              hint="Base disponible"
              icon={<Users className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={0}
            />
            <AdminMetricCard
              title="Envíos"
              value={String(supportedCampaignCount)}
              hint="Opciones disponibles"
              icon={<Layers3 className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={1}
            />
            <AdminMetricCard
              title="Temas"
              value={String(themes.length)}
              hint={themesLoading ? "Cargando..." : "Listos para avisar"}
              icon={<Sparkles className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={2}
            />
            <AdminMetricCard
              title="Historial"
              value={String(notifications.length)}
              hint="Mensajes cargados"
              icon={<Inbox className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={3}
            />
            <AdminMetricCard
              title="Pendientes"
              value={String(unreadCount)}
              hint="Por revisar"
              icon={<BellRing className="h-5 w-5" />}
              animationsEnabled={animationsEnabled}
              index={4}
            />
          </section>
        </AnimatedEntrance>

        <AnimatedEntrance
          index={1}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminNotificationDispatchCenter
            activeKind={activeCampaignKind}
            onActiveKindChange={setActiveCampaignKind}
            generalTitle={generalTitle}
            generalMessage={generalMessage}
            onGeneralTitleChange={setGeneralTitle}
            onGeneralMessageChange={setGeneralMessage}
            themes={themes}
            themesLoading={themesLoading}
            themesError={themesError}
            selectedThemeId={selectedThemeId}
            onSelectedThemeIdChange={setSelectedThemeId}
            selectedTheme={selectedTheme}
            onSubmit={handleSendCampaign}
            sending={sendingCampaign}
            lastResult={lastDispatchResult}
          />
        </AnimatedEntrance>

        <AnimatedEntrance
          index={2}
          disabled={!animationsEnabled}
          mode={heavyAnimationsEnabled ? "default" : "light"}
        >
          <AdminUserNotificationsPanel
            users={filteredUsers}
            usersLoading={usersLoading}
            usersError={usersError}
            userQuery={userQuery}
            onUserQueryChange={setUserQuery}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            selectedUser={selectedUser}
            notifications={filteredNotifications}
            notificationsLoading={notificationsLoading}
            notificationsError={notificationsError}
            notificationQuery={notificationQuery}
            onNotificationQueryChange={setNotificationQuery}
            notificationFilter={notificationFilter}
            onNotificationFilterChange={setNotificationFilter}
            unreadCount={unreadCount}
            markingNotificationId={markingNotificationId}
            deletingNotificationId={deletingNotificationId}
            markingAllNotificationsRead={markingAllNotificationsRead}
            deletingAllNotifications={deletingAllNotifications}
            onReload={() => {
              void reloadSelectedUserNotifications().catch((error) => {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "No se pudo recargar el historial del usuario.",
                );
              });
            }}
              onMarkNotificationRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllRead}
            onDeleteNotification={handleDeleteNotification}
            onDeleteAll={handleDeleteAllNotifications}
          />
        </AnimatedEntrance>
      </div>
    </AdminDashboardShell>
  );
}