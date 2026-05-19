"use client";

import { Check, Loader2, MailOpen, Trash2 } from "lucide-react";
import type { AdminUserNotification } from "../types/notifications";

interface AdminUserNotificationListProps {
  notifications: AdminUserNotification[];
  loading: boolean;
  markingNotificationId: string | null;
  deletingNotificationId: string | null;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTypeLabel(type: string) {
  if (type === "general_notice") {
    return "Aviso general";
  }

  if (type === "daily_review") {
    return "Recordatorio de estudio";
  }

  if (type === "streak_reminder") {
    return "Recordatorio de avance";
  }

  if (type === "theme_released") {
    return "Aviso por tema";
  }

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminUserNotificationList({
  notifications,
  loading,
  markingNotificationId,
  deletingNotificationId,
  onMarkRead,
  onDelete,
}: AdminUserNotificationListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-border-subtle bg-surface-secondary/60 p-4"
          >
            <div className="h-4 w-36 rounded-full bg-surface-tertiary" />
            <div className="mt-3 h-3 w-full rounded-full bg-surface-tertiary" />
            <div className="mt-2 h-3 w-4/5 rounded-full bg-surface-tertiary" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-default bg-surface-secondary/40 px-5 py-8 text-center">
        <MailOpen className="mx-auto h-9 w-9 text-content-tertiary" />
        <h3 className="mt-3 text-sm font-semibold text-content-primary">
          No hay notificaciones para mostrar
        </h3>
        <p className="mt-1 text-sm text-content-tertiary">
          Cambia de usuario o ajusta los filtros para revisar otro historial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const isDeleting = deletingNotificationId === notification.id;
        const isMarkingRead = markingNotificationId === notification.id;

        return (
          <article
            key={notification.id}
            className="rounded-2xl border border-border-subtle bg-surface-primary p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                      notification.readAt
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-accent/10 text-accent",
                    ].join(" ")}
                  >
                    {notification.readAt ? "Leída" : "Pendiente"}
                  </span>

                  <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] font-medium text-content-tertiary">
                    {formatTypeLabel(notification.type)}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-content-primary md:text-base">
                  {notification.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-content-secondary">
                  {notification.message}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-tertiary">
                  <span>Creada: {formatDateLabel(notification.createdAt)}</span>
                  {notification.readAt && (
                    <span>Leída: {formatDateLabel(notification.readAt)}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                <button
                  type="button"
                  onClick={() => onMarkRead(notification.id)}
                  disabled={Boolean(notification.readAt) || isMarkingRead}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMarkingRead ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {notification.readAt ? "Leída" : "Marcar como leída"}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(notification.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}