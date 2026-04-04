"use client";

import type { Notice } from "@/features/notices/types";
import { AchievementNoticeCard } from "../cards/AchievementNoticeCard";
import { LessonNoticeCard } from "../cards/LessonNoticeCard";
import { ReviewNoticeCard } from "../cards/ReviewNoticeCard";
import { StreakNoticeCard } from "../cards/StreakNoticeCard";
import { SystemNoticeCard } from "../cards/SystemNoticeCard";

interface NoticeCardRouterProps {
  notice: Notice;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function NoticeCardRouter(props: NoticeCardRouterProps) {
  switch (props.notice.category) {
    case "lesson":
      return <LessonNoticeCard {...props} />;
    case "review":
      return <ReviewNoticeCard {...props} />;
    case "achievement":
      return <AchievementNoticeCard {...props} />;
    case "streak":
      return <StreakNoticeCard {...props} />;
    case "system":
      return <SystemNoticeCard {...props} />;
    default:
      return <SystemNoticeCard {...props} />;
  }
}
