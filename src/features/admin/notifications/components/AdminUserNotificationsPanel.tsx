"use client";

import { Check, Loader2, RefreshCcw, Search, Trash2, Users } from "lucide-react";
import { AdminFilterDropdown } from "@/features/admin/shared/components/AdminFilterDropdown";
import { AdminUserNotificationList } from "./AdminUserNotificationList";
import type {
  AdminNotificationFilter,
  AdminNotificationUserOption,
  AdminUserNotification,
} from "../types/notifications";

interface AdminUserNotificationsPanelProps {
  users: AdminNotificationUserOption[];
  usersLoading: boolean;
  usersError: string | null;
  userQuery: string;
  onUserQueryChange: (value: string) => void;
  selectedUserId: string | null;
  onSelectUser: (value: string) => void;
  selectedUser: AdminNotificationUserOption | null;
  notifications: AdminUserNotification[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  notificationQuery: string;
  onNotificationQueryChange: (value: string) => void;
  notificationFilter: AdminNotificationFilter;
  onNotificationFilterChange: (value: AdminNotificationFilter) => void;
  unreadCount: number;
  markingNotificationId: string | null;
  deletingNotificationId: string | null;
  markingAllNotificationsRead: boolean;
  deletingAllNotifications: boolean;
  onReload: () => void;
  onMarkNotificationRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onDeleteAll: () => void;
}

const FILTER_OPTIONS: Array<{
  value: AdminNotificationFilter;
  label: string;
}> = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Sin leer" },
  { value: "read", label: "Leidas" },
];

export function AdminUserNotificationsPanel({
  users,
  usersLoading,
  usersError,
  userQuery,
  onUserQueryChange,
  selectedUserId,
  onSelectUser,
  selectedUser,
  notifications,
  notificationsLoading,
  notificationsError,
  notificationQuery,
  onNotificationQueryChange,
  notificationFilter,
  onNotificationFilterChange,
  unreadCount,
  markingNotificationId,
  deletingNotificationId,
  markingAllNotificationsRead,
  deletingAllNotifications,
  onReload,
  onMarkNotificationRead,
  onMarkAllRead,
  onDeleteNotification,
  onDeleteAll,
}: AdminUserNotificationsPanelProps) {
  const selectedFilterLabel =
    FILTER_OPTIONS.find((option) => option.value === notificationFilter)?.label ??
    "Todas";

  return (
    <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-border-subtle bg-surface-primary shadow-sm">
        <div className="border-b border-border-subtle p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">Mensajes por persona</h2>
              <p className="text-sm text-content-tertiary">
                Revisa el historial y haz cambios rápidos.
              </p>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="sr-only">Buscar usuario</span>
            <div className="flex items-center gap-2 rounded-2xl border border-border-default bg-surface-secondary px-3 py-2.5">
              <Search className="h-4 w-4 text-content-tertiary" />
              <input
                value={userQuery}
                onChange={(event) => onUserQueryChange(event.target.value)}
                placeholder="Buscar por nombre o correo"
                className="w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-tertiary"
              />
            </div>
          </label>
        </div>

        <div className="max-h-[540px] space-y-2 overflow-y-auto p-3">
          {usersLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-content-tertiary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando usuarios...
            </div>
          ) : usersError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {usersError}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-default px-4 py-8 text-center text-sm text-content-tertiary">
              No se encontraron usuarios.
            </div>
          ) : (
            users.map((user) => {
              const active = user.id === selectedUserId;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSelectUser(user.id)}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    active
                      ? "border-accent/30 bg-accent/8 shadow-sm"
                      : "border-transparent bg-surface-secondary/55 hover:border-border-subtle hover:bg-surface-secondary",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-content-primary">
                        {user.fullName}
                      </p>
                      <p className="truncate text-xs text-content-tertiary">
                        {user.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-primary px-2 py-1 text-[11px] font-medium text-content-tertiary">
                      {user.profile}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="rounded-[28px] border border-border-subtle bg-surface-primary shadow-sm">
        <div className="border-b border-border-subtle p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
                Persona seleccionada
              </p>
              <h2 className="mt-1 text-xl font-bold text-content-primary">
                {selectedUser?.fullName ?? "Selecciona un usuario"}
              </h2>
              <p className="mt-1 text-sm text-content-tertiary">
                {selectedUser ? `${selectedUser.email} • ${unreadCount} pendientes` : "Elige una persona para ver sus mensajes."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onMarkAllRead}
                disabled={!selectedUser || unreadCount === 0 || markingAllNotificationsRead}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAllNotificationsRead ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Marcar todo leído
              </button>

              <button
                type="button"
                onClick={onReload}
                disabled={!selectedUser || notificationsLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-border-default px-3 py-2 text-sm font-semibold text-content-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className={[
                  "h-4 w-4",
                  notificationsLoading ? "animate-spin" : "",
                ].join(" ")} />
                Actualizar
              </button>

              <button
                type="button"
                onClick={onDeleteAll}
                disabled={!selectedUser || notifications.length === 0 || deletingAllNotifications}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAllNotifications ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Borrar todo
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="block lg:max-w-md lg:flex-1">
              <span className="sr-only">Buscar notificaciones</span>
              <div className="flex items-center gap-2 rounded-2xl border border-border-default bg-surface-secondary px-3 py-2.5">
                <Search className="h-4 w-4 text-content-tertiary" />
                <input
                  value={notificationQuery}
                  onChange={(event) => onNotificationQueryChange(event.target.value)}
                  placeholder="Buscar por título o mensaje"
                  className="w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-tertiary"
                />
              </div>
            </label>

            <AdminFilterDropdown
              value={notificationFilter}
              options={FILTER_OPTIONS}
              onChange={onNotificationFilterChange}
              buttonLabel={`Estado: ${selectedFilterLabel}`}
              menuAlign="right"
            />
          </div>
        </div>

        <div className="p-5">
          {notificationsError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {notificationsError}
            </div>
          ) : null}

          <AdminUserNotificationList
            notifications={notifications}
            loading={notificationsLoading}
            markingNotificationId={markingNotificationId}
            deletingNotificationId={deletingNotificationId}
            onMarkRead={onMarkNotificationRead}
            onDelete={onDeleteNotification}
          />
        </div>
      </div>
    </section>
  );
}