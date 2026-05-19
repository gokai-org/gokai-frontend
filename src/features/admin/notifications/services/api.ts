import { apiFetch } from "@/shared/lib/api/client";
import type {
  AdminGeneralNoticePayload,
  AdminNotificationDispatchResponse,
  AdminNotificationMutationResponse,
  AdminThemeReleasedPayload,
  AdminUserNotificationsResponse,
} from "../types/notifications";

export async function sendAdminGeneralNotice(
  payload: AdminGeneralNoticePayload,
) {
  return apiFetch<AdminNotificationDispatchResponse>(
    "/admin/api/notifications/general",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function sendAdminDailyReview() {
  return apiFetch<AdminNotificationDispatchResponse>(
    "/admin/api/notifications/daily-review",
    {
      method: "POST",
    },
  );
}

export async function sendAdminStreakReminder() {
  return apiFetch<AdminNotificationDispatchResponse>(
    "/admin/api/notifications/streak-reminder",
    {
      method: "POST",
    },
  );
}

export async function sendAdminThemeReleased(
  payload: AdminThemeReleasedPayload,
) {
  return apiFetch<AdminNotificationDispatchResponse>(
    "/admin/api/notifications/theme-released",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getAdminUserNotifications(userId: string) {
  return apiFetch<AdminUserNotificationsResponse>(
    `/admin/api/notifications/users/${encodeURIComponent(userId)}`,
    {
      method: "GET",
    },
  );
}

export async function deleteAdminUserNotification(
  userId: string,
  notificationId: string,
) {
  const searchParams = new URLSearchParams({ notification_id: notificationId });

  return apiFetch<AdminNotificationMutationResponse>(
    `/admin/api/notifications/users/${encodeURIComponent(userId)}?${searchParams.toString()}`,
    {
      method: "DELETE",
    },
  );
}

export async function deleteAllAdminUserNotifications(userId: string) {
  const searchParams = new URLSearchParams({ all: "true" });

  return apiFetch<AdminNotificationMutationResponse>(
    `/admin/api/notifications/users/${encodeURIComponent(userId)}?${searchParams.toString()}`,
    {
      method: "DELETE",
    },
  );
}

export async function markAdminUserNotificationRead(
  userId: string,
  notificationId: string,
) {
  const searchParams = new URLSearchParams({ notification_id: notificationId });

  return apiFetch<AdminNotificationMutationResponse>(
    `/admin/api/notifications/users/${encodeURIComponent(userId)}?${searchParams.toString()}`,
    {
      method: "PATCH",
    },
  );
}

export async function markAllAdminUserNotificationsRead(userId: string) {
  const searchParams = new URLSearchParams({ all: "true" });

  return apiFetch<AdminNotificationMutationResponse>(
    `/admin/api/notifications/users/${encodeURIComponent(userId)}?${searchParams.toString()}`,
    {
      method: "PATCH",
    },
  );
}