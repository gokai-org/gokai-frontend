"use client";

import type { Notice } from "@/features/notices/types";
import { BaseNoticeCard } from "./BaseNoticeCard";

interface Props {
  notice: Notice;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function SystemNoticeCard(props: Props) {
  return <BaseNoticeCard {...props} eyebrow="Actualización" />;
}
