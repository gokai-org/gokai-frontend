"use client";

import { BarChart3 } from "lucide-react";
import { AdminDashboardShell } from "@/features/admin/shared/components/AdminDashboardShell";
import { AdminPageHeader } from "@/features/admin/shared/components/AdminPageHeader";
import { AdminMetricCard } from "@/features/admin/shared/components/AdminMetricCard";
import { AdminSectionCard } from "@/features/admin/shared/components/AdminSectionCard";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

export function AdminStatsPanel() {
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  return (
    <AdminDashboardShell
      header={
        <AdminPageHeader
          icon={
            <BarChart3
              className="h-7 w-7 text-content-inverted"
              strokeWidth={2.5}
            />
          }
          title="Estadisticas"
          japaneseText="統計"
          subtitle="Seguimiento de rendimiento global y uso de plataforma"
        />
      }
    >
      <div className="space-y-6 pb-8"></div>
    </AdminDashboardShell>
  );
}
