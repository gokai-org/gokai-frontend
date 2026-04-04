"use client";

import { LifeBuoy } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

interface AdminSupportHeaderProps {
  totalTickets: number;
}

export function AdminSupportHeader({ totalTickets }: AdminSupportHeaderProps) {
  return (
    <AdminPageHeader
      icon={
        <LifeBuoy className="h-7 w-7 text-content-inverted" strokeWidth={2.5} />
      }
      title="Soporte"
      japaneseText="支援"
      subtitle="Gestion de tickets, seguimiento y resolucion del equipo"
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-tertiary">
            {totalTickets} tickets totales
          </span>
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        </div>
      }
    />
  );
}
