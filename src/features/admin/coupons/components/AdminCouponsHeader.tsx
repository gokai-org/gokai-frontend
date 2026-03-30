"use client";

import { Ticket } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

interface AdminCouponsHeaderProps {
  totalCoupons: number;
}

export function AdminCouponsHeader({ totalCoupons }: AdminCouponsHeaderProps) {
  return (
    <AdminPageHeader
      icon={<Ticket className="h-7 w-7 text-content-inverted" strokeWidth={2.5} />}
      title="Cupones"
      japaneseText="割引"
      subtitle="Gestion de cupones, creacion y seguimiento de canjes"
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-tertiary">
            {totalCoupons} cupones totales
          </span>
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
        </div>
      }
    />
  );
}
