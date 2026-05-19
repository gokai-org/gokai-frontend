"use client";

import { BellRing, RadioTower } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";

interface AdminNotificationsHeaderProps {
  selectedUserName: string | null;
  unreadCount: number;
  lastDispatchLabel: string;
  activeCampaignLabel: string;
}

export function AdminNotificationsHeader({
  selectedUserName,
  unreadCount,
  lastDispatchLabel,
  activeCampaignLabel,
}: AdminNotificationsHeaderProps) {
  return (
    <AdminPageHeader
      icon={<BellRing className="h-7 w-7 text-content-inverted" strokeWidth={2.5} />}
      title="Notificaciones"
      japaneseText="通知"
      subtitle="Envía avisos y revisa los mensajes de cada persona." 
      rightContent={
        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-2xl border border-border-subtle bg-surface-primary/90 px-4 py-2 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
              Tipo
            </p>
            <p className="mt-1 text-sm font-semibold text-content-primary">
              {activeCampaignLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-primary/90 px-4 py-2 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-content-tertiary">
              Persona
            </p>
            <p className="mt-1 text-sm font-semibold text-content-primary">
              {selectedUserName ?? "Sin seleccionar"}
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-primary/90 px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-content-primary">
              <RadioTower className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">{lastDispatchLabel}</span>
            </div>
            <p className="mt-1 text-[11px] text-content-tertiary">
              {unreadCount} pendientes
            </p>
          </div>
        </div>
      }
    />
  );
}