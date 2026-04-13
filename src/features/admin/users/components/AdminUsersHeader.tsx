"use client";

import { Users } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

interface AdminUsersHeaderProps {
  totalUsers: number;
}

export function AdminUsersHeader({ totalUsers }: AdminUsersHeaderProps) {
  return (
    <AdminPageHeader
      icon={
        <Users className="h-7 w-7 text-content-inverted" strokeWidth={2.5} />
      }
      title="Usuarios"
      japaneseText="管理"
      subtitle="Gestion de usuarios de la plataforma"
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-tertiary">
            {totalUsers} usuarios totales
          </span>
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        </div>
      }
    />
  );
}
