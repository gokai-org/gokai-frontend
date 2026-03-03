export type NoticeCategory =
  | "lesson"
  | "review"
  | "achievement"
  | "system"
  | "streak";

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  read: boolean;
  pinned: boolean;
  createdAt: string; // ISO-8601
  actionLabel?: string;
  actionHref?: string;
}
