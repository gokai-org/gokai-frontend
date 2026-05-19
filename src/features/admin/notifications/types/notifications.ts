import type { AdminUser } from "@/features/admin/users/types/users";

export interface AdminUserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export interface AdminUserNotificationsResponse {
  notifications: AdminUserNotification[];
  unreadCount: number;
}

export interface AdminGeneralNoticePayload {
  title: string;
  message: string;
}

export interface AdminThemeReleasedPayload {
  themeId: string;
  themeName: string;
}

export type AdminNotificationCampaignKind =
  | "general_notice"
  | "daily_review"
  | "streak_reminder"
  | "theme_released";

export interface AdminNotificationDispatchResponse {
  success: boolean;
  sent: number;
  pushSkipped?: boolean;
  pushError?: string;
  deliveryMode?: "push_and_inbox" | "inbox_only";
}

export interface AdminNotificationMutationResponse {
  affected: number;
}

export interface AdminGeneralNoticeResult extends AdminNotificationDispatchResponse {
  sentAt: number;
  kind: AdminNotificationCampaignKind;
  title: string;
  audienceLabel: string;
}

export type AdminNotificationFilter = "all" | "unread" | "read";

export interface AdminNotificationUserOption extends AdminUser {
  fullName: string;
}