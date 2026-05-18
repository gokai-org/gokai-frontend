import { apiFetch } from "@/shared/lib/api/client";
import type { BackendUserNotificationsResponse } from "@/features/notices/types";

function getNotificationsPath(userId: string, searchParams?: URLSearchParams) {
  const basePath = `/api/users/${encodeURIComponent(userId)}/notifications`;
  const query = searchParams?.toString();

  return query ? `${basePath}?${query}` : basePath;
}

export async function getUserNotifications(userId: string) {
  return apiFetch<BackendUserNotificationsResponse>(getNotificationsPath(userId));
}

export async function markUserNotificationRead(
  userId: string,
  notificationId: string,
) {
  const searchParams = new URLSearchParams({ notification_id: notificationId });

  return apiFetch<{ affected: number }>(getNotificationsPath(userId, searchParams), {
    method: "PATCH",
  });
}

export async function markAllUserNotificationsRead(userId: string) {
  const searchParams = new URLSearchParams({ all: "true" });

  return apiFetch<{ affected: number }>(getNotificationsPath(userId, searchParams), {
    method: "PATCH",
  });
}

export async function deleteUserNotification(
  userId: string,
  notificationId: string,
) {
  const searchParams = new URLSearchParams({ notification_id: notificationId });

  return apiFetch<{ affected: number }>(getNotificationsPath(userId, searchParams), {
    method: "DELETE",
  });
}