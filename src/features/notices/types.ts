export type NoticeCategory =
  | "lesson"
  | "review"
  | "achievement"
  | "streak"
  | "system";

export type BackendNoticeType =
  | "daily_review"
  | "general_announcement"
  | "general_notice"
  | "streak_reminder"
  | "theme_released";

export interface BackendUserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export interface BackendUserNotificationsResponse {
  notifications: BackendUserNotification[];
  unreadCount: number;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  read: boolean;
  pinned: boolean;
  createdAt: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface NoticeCategoryItem {
  id: NoticeCategory;
  name: string;
  count: number;
}
