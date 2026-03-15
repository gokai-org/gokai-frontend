export type NoticeCategory =
  | "lesson"
  | "review"
  | "achievement"
  | "streak"
  | "system";

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