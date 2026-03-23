"use client";

import type { ReactNode } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";

interface AdminPageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  japaneseText: string;
  rightContent?: ReactNode;
}

export function AdminPageHeader({
  icon,
  title,
  subtitle,
  japaneseText,
  rightContent,
}: AdminPageHeaderProps) {
  return (
    <DashboardHeader
      icon={icon}
      title={title}
      subtitle={subtitle}
      japaneseText={japaneseText}
      rightContent={rightContent}
    />
  );
}
