"use client";

import { BarChart3 } from "lucide-react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { StatsPeriodFilter } from "@/features/stats/components/StatsPeriodFilter";
import type { StatsPeriod } from "@/features/stats/types";

interface StatsHeaderProps {
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}

export function StatsHeader({
  period,
  onPeriodChange,
}: StatsHeaderProps) {
  return (
    <DashboardHeader
      icon={<BarChart3 className="h-7 w-7 text-content-inverted" strokeWidth={2.5} />}
      title="Estadísticas"
      japaneseText="統計"
      subtitle="Visualiza tu progreso y rendimiento de estudio"
      rightContent={
        <StatsPeriodFilter period={period} onChange={onPeriodChange} />
      }
    />
  );
}