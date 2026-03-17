"use client";

import { SectionHeader } from "@/shared/ui/SectionHeader";
import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";
import { WeeklyActivityChart } from "@/features/stats/components/WeeklyActivityChart";
import { MonthlyProgressChart } from "@/features/stats/components/MonthlyProgressChart";
import type { ActivityResponse } from "@/features/stats/types";

interface StatsActivitySectionProps {
  data?: ActivityResponse | null;
  loading?: boolean;
  animationsEnabled?: boolean;
}

export function StatsActivitySection({
  data,
  loading = false,
  animationsEnabled = true,
}: StatsActivitySectionProps) {
  return (
    <AnimatedEntrance
      index={2}
      disabled={!animationsEnabled}
      className="mb-8"
    >
      <SectionHeader
        className="mb-5"
        title={
          <>
            Análisis de <span className="text-[#993331]">Actividad</span>
          </>
        }
        titleClassName="text-2xl font-extrabold tracking-tight text-gray-900"
        subtitle="Tu tiempo de estudio y evolución de rendimiento"
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WeeklyActivityChart
          data={data?.weekly}
          loading={loading}
          animationsEnabled={animationsEnabled}
        />
        <MonthlyProgressChart
          data={data?.monthly}
          loading={loading}
          animationsEnabled={animationsEnabled}
        />
      </div>
    </AnimatedEntrance>
  );
}